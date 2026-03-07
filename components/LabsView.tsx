import React, { useMemo, useRef, useState } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { Logo } from './Logo';
import { isSupportedLabFile } from '../utils/runtimeGuards';
import { copyTextSafely } from '../utils/share';
import {
  computeHormoneSignals,
  extractTextFromLabFile,
  HealthLabRow,
  ParsedLabValue,
  parseLabText,
  PersonalHealthProfile,
  summarizeHormoneSignals,
  toLabRows,
} from '../services/healthReportService';

const REPORT_ID_STORAGE_KEY = 'luna_report_user_id_v1';

const emptyProfile: PersonalHealthProfile = {
  birthYear: '',
  cycleLength: '28',
  cycleDay: '',
  medications: '',
  knownConditions: '',
  goals: '',
};

const quickSymptoms = ['Fatigue', 'Anxiety', 'PMS', 'Sleep issues', 'Headache', 'Low mood', 'Bloating', 'Cravings'];

const templateRows: Record<string, Array<Partial<HealthLabRow>>> = {
  hormone_core: [
    { marker: 'Estradiol (E2)', unit: 'pg/mL', reference: '30-400' },
    { marker: 'Progesterone', unit: 'ng/mL', reference: '0.2-25' },
    { marker: 'LH', unit: 'IU/L', reference: '1.9-12.5' },
    { marker: 'FSH', unit: 'IU/L', reference: '2.5-10.2' },
    { marker: 'Prolactin', unit: 'ng/mL', reference: '4.8-23.3' },
  ],
  thyroid: [
    { marker: 'TSH', unit: 'mIU/L', reference: '0.4-4.0' },
    { marker: 'FT4', unit: 'pmol/L', reference: '10-22' },
    { marker: 'FT3', unit: 'pmol/L', reference: '3.1-6.8' },
  ],
  metabolic: [
    { marker: 'Glucose (fasting)', unit: 'mg/dL', reference: '70-99' },
    { marker: 'Insulin (fasting)', unit: 'uIU/mL', reference: '2-25' },
    { marker: 'HbA1c', unit: '%', reference: '4.0-5.6' },
    { marker: 'Ferritin', unit: 'ng/mL', reference: '15-150' },
    { marker: 'Vitamin D (25-OH)', unit: 'ng/mL', reference: '30-100' },
  ],
};

const newRow = (seed?: Partial<HealthLabRow>): HealthLabRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  marker: seed?.marker || '',
  value: seed?.value || '',
  unit: seed?.unit || '',
  reference: seed?.reference || '',
  date: seed?.date || '',
  note: seed?.note || '',
});

const statusColor = (status: 'low' | 'normal' | 'high' | 'unknown') => {
  if (status === 'normal') return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
  if (status === 'low') return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
  if (status === 'high') return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
  return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/60';
};

const inferStatus = (value: number, referenceMin?: number, referenceMax?: number): 'low' | 'normal' | 'high' | 'unknown' => {
  if (!Number.isFinite(value)) return 'unknown';
  if (!Number.isFinite(referenceMin as number) || !Number.isFinite(referenceMax as number)) return 'unknown';
  if (value < Number(referenceMin)) return 'low';
  if (value > Number(referenceMax)) return 'high';
  return 'normal';
};

const parseReference = (reference: string): { min?: number; max?: number } => {
  const match = reference.match(/(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)/);
  if (!match) return {};
  const min = Number(match[1].replace(',', '.'));
  const max = Number(match[2].replace(',', '.'));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return {};
  return { min, max };
};

const ensureReportId = () => {
  try {
    const current = localStorage.getItem(REPORT_ID_STORAGE_KEY);
    if (current) return current;
    const created = `LUNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    localStorage.setItem(REPORT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return `LUNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
};

export const LabsView: React.FC<{ day: number; age: number; userId?: string; userName?: string; onBack?: () => void }> = ({ day, age, userId, userName }) => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<{ text: string; sources: unknown[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<HealthLabRow[]>([newRow()]);
  const [parsedRows, setParsedRows] = useState<HealthLabRow[]>([]);
  const [parsedValues, setParsedValues] = useState<ParsedLabValue[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [includeNameInReport, setIncludeNameInReport] = useState(false);
  const [includeIdInReport, setIncludeIdInReport] = useState(true);
  const [manualReportId, setManualReportId] = useState('');
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => ({ ...emptyProfile, birthYear: String(new Date().getFullYear() - age), cycleDay: String(day) }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);

  const reportId = useMemo(() => manualReportId.trim() || userId || ensureReportId(), [manualReportId, userId]);
  const reportIdentityLine = useMemo(() => {
    const identity: string[] = [];
    if (includeNameInReport && userName) identity.push(`Name: ${userName}`);
    if (includeIdInReport) identity.push(`Report ID: ${reportId}`);
    return identity.join(' | ');
  }, [includeNameInReport, includeIdInReport, userName, reportId]);

  const hormoneSignals = useMemo(() => computeHormoneSignals(parsedValues), [parsedValues]);
  const hormoneSummary = useMemo(() => summarizeHormoneSignals(hormoneSignals), [hormoneSignals]);

  const markerStatuses = useMemo(() => {
    let low = 0;
    let high = 0;
    let normal = 0;
    let unknown = 0;
    for (const item of parsedValues) {
      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
      if (status === 'low') low += 1;
      if (status === 'high') high += 1;
      if (status === 'normal') normal += 1;
      if (status === 'unknown') unknown += 1;
    }
    return { low, high, normal, unknown };
  }, [parsedValues]);

  const doctorQuestions = useMemo(() => {
    const risky = hormoneSignals.filter((s) => s.status === 'low' || s.status === 'high').slice(0, 4);
    if (risky.length === 0) return [];
    return risky.map((signal) => {
      const direction = signal.status === 'high' ? 'elevated' : 'reduced';
      return `Could ${signal.marker} (${direction}) explain my symptoms and cycle changes, and what follow-up test timing is best?`;
    });
  }, [hormoneSignals]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]));
  };

  const updateProfile = (key: keyof PersonalHealthProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateRow = (id: string, key: keyof HealthLabRow, value: string) => {
    setManualRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addRow = () => setManualRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) => setManualRows((prev) => prev.filter((row) => row.id !== id));

  const applyTemplate = (templateKey: keyof typeof templateRows) => {
    const rows = templateRows[templateKey].map((seed) => newRow(seed));
    setManualRows(rows);
  };

  const buildManualRowsText = () => {
    return manualRows
      .filter((row) => row.marker.trim() && row.value.trim())
      .map((row) => {
        const unit = row.unit ? ` ${row.unit}` : '';
        const ref = row.reference ? ` (${row.reference})` : '';
        const dateChunk = row.date ? ` | date: ${row.date}` : '';
        const noteChunk = row.note ? ` | note: ${row.note}` : '';
        return `${row.marker}: ${row.value}${unit}${ref}${dateChunk}${noteChunk}`;
      })
      .join('\n');
  };

  const buildProfileText = () => {
    const lines = [
      `Birth year: ${profile.birthYear || 'N/A'}`,
      `Cycle length: ${profile.cycleLength || 'N/A'}`,
      `Cycle day: ${profile.cycleDay || systemState.currentDay}`,
      `Medications: ${profile.medications || 'N/A'}`,
      `Known conditions: ${profile.knownConditions || 'N/A'}`,
      `Goals: ${profile.goals || 'N/A'}`,
      `Symptoms today: ${selectedSymptoms.length ? selectedSymptoms.join(', ') : 'N/A'}`,
    ];
    if (reportIdentityLine) lines.unshift(reportIdentityLine);
    return lines.join('\n');
  };

  const parseManualRowsToParsed = (): ParsedLabValue[] => {
    return manualRows
      .filter((row) => row.marker.trim() && row.value.trim())
      .map((row) => {
        const value = Number(row.value.replace(',', '.'));
        const ref = parseReference(row.reference);
        return {
          marker: row.marker.trim(),
          value,
          unit: row.unit.trim() || undefined,
          referenceMin: ref.min,
          referenceMax: ref.max,
        };
      })
      .filter((item) => Number.isFinite(item.value));
  };

  const handleAnalyze = async () => {
    const manualText = buildManualRowsText();
    const combinedInput = [buildProfileText(), manualText, input].filter(Boolean).join('\n\n').trim();
    if (!combinedInput) return;

    setLoading(true);
    try {
      const parsedFromText = parseLabText([manualText, input].filter(Boolean).join('\n'));
      const parsedMerged = [...parseManualRowsToParsed(), ...parsedFromText];
      const nextSignals = computeHormoneSignals(parsedMerged);
      const summary = summarizeHormoneSignals(nextSignals);
      setParsedValues(parsedMerged);
      setParsedRows(toLabRows(parsedMerged));

      const aiResult = await analyzeLabResults(combinedInput, systemState);
      const extraLine = reportIdentityLine ? `Identity: ${reportIdentityLine}` : 'Identity: private';
      const fullText = `${extraLine}\n${summary}\n\n${aiResult.text || 'The system could not generate a clear interpretation at this time.'}`;

      const formattedResult = {
        text: fullText,
        sources: aiResult.sources || [],
      };

      setAnalysis(formattedResult);
      dataService.logEvent('LAB_MARKER_ENTRY', {
        rawText: combinedInput,
        analysis: formattedResult.text,
        day: systemState.currentDay,
      });
      setLog(dataService.getLog());
    } catch {
      setAnalysis({ text: 'Analysis interrupted. Please review your markers and references manually.', sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const copied = await copyTextSafely(analysis.text);
    setCopyFeedback(copied ? 'Copied' : 'Copy failed');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedLabFile(file)) {
      setUploadFeedback('Unsupported format. Use text or image files.');
      event.target.value = '';
      return;
    }

    try {
      const extracted = await extractTextFromLabFile(file);
      if (extracted.text.trim()) {
        setInput((prev) => (prev ? `${prev}\n${extracted.text}` : extracted.text));
      }
      setUploadFeedback(extracted.source + (extracted.usedAi ? ' (AI scan)' : ''));
    } catch {
      setUploadFeedback('Could not extract text from file.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <article className="max-w-7xl mx-auto luna-page-shell luna-page-reports space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-8 md:p-10 pb-40 relative dark:text-white">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-500 dark:text-slate-200">My Health Reports</span>
        </div>
        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase text-slate-950 dark:text-slate-100">
          Reports <span className="text-luna-purple">That Explain</span>
        </h2>
        <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-semibold max-w-4xl leading-relaxed">
          Simple workflow: choose report identity, fill your markers, upload image/text, and get a clear hormone-focused summary.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-7 space-y-8">
          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">Report Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeIdInReport} onChange={(e) => setIncludeIdInReport(e.target.checked)} />
                Include ID in report
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeNameInReport} onChange={(e) => setIncludeNameInReport(e.target.checked)} disabled={!userName} />
                Include Name in report
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">User ID (optional override)</span>
                <input value={manualReportId} onChange={(e) => setManualReportId(e.target.value)} placeholder={reportId} className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold" />
              </label>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current: {reportIdentityLine || 'Private (no name/ID in summary)'}</p>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">Personal Health Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['birthYear', 'Birth Year'],
                ['cycleLength', 'Cycle Length'],
                ['cycleDay', 'Cycle Day'],
                ['medications', 'Current Medications'],
                ['knownConditions', 'Known Conditions'],
              ].map(([key, label]) => (
                <label key={key} className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</span>
                  <input
                    value={profile[key as keyof PersonalHealthProfile]}
                    onChange={(e) => updateProfile(key as keyof PersonalHealthProfile, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100"
                  />
                </label>
              ))}
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Goals / Symptoms Priority</span>
                <textarea
                  value={profile.goals}
                  onChange={(e) => updateProfile('goals', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100 resize-none"
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Today symptoms (quick select)</p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-luna-purple text-white border-luna-purple' : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-300/70 dark:border-slate-700/70'}`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">Lab Table</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyTemplate('hormone_core')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Hormone Template</button>
                <button onClick={() => applyTemplate('thyroid')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Thyroid</button>
                <button onClick={() => applyTemplate('metabolic')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Metabolic</button>
                <button onClick={addRow} className="px-3 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.15em]">Add Row</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-slate-500">
                    <th className="py-2 pr-2">Marker</th>
                    <th className="py-2 pr-2">Value</th>
                    <th className="py-2 pr-2">Unit</th>
                    <th className="py-2 pr-2">Reference</th>
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2">Note</th>
                    <th className="py-2 pr-2"> </th>
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200/70 dark:border-slate-700/60">
                      {(['marker', 'value', 'unit', 'reference', 'date', 'note'] as Array<keyof HealthLabRow>).map((field) => (
                        <td key={field} className="py-2 pr-2">
                          <input
                            value={row[field]}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-xs font-semibold"
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-2">
                        <button onClick={() => removeRow(row.id)} className="px-2 py-1 rounded-md border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Upload scan/text</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.15em]">Upload File</button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.md,.png,.jpg,.jpeg,.webp,text/plain,image/*" onChange={handleFileUpload} />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste report text here or upload an image/text file..."
              className="w-full h-56 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/70 text-sm font-semibold leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{uploadFeedback || 'Ready for extraction'}</p>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 rounded-full bg-slate-950 dark:bg-[#17366b] text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-40"
              >
                {loading ? 'Reading...' : 'Generate Report'}
              </button>
            </div>
          </article>
        </section>

        <aside className="xl:col-span-5 space-y-6">
          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#efe1ea]/92 to-[#dce6f4]/90 dark:from-[#08162f]/92 dark:to-[#0b2040]/90 p-6 space-y-3 shadow-luna-rich">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Quick Overview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Within range</p>
                <p className="text-2xl font-black text-emerald-600">{markerStatuses.normal}</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Out of range</p>
                <p className="text-2xl font-black text-rose-600">{markerStatuses.low + markerStatuses.high}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{hormoneSummary}</p>
          </article>

          {hormoneSignals.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Hormone Signals</p>
              <div className="space-y-3">
                {hormoneSignals.map((signal, idx) => (
                  <div key={`${signal.marker}-${idx}`} className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-slate-50/80 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200">{signal.hormone}</p>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${statusColor(signal.status)}`}>{signal.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{signal.marker}: {signal.value}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{signal.importance}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {doctorQuestions.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Questions for Doctor</p>
              <ul className="space-y-2">
                {doctorQuestions.map((question) => (
                  <li key={question} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">• {question}</li>
                ))}
              </ul>
            </article>
          )}

          {parsedRows.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Detected Markers</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left uppercase tracking-[0.12em] text-slate-500">
                      <th className="py-2 pr-2">Marker</th>
                      <th className="py-2 pr-2">Value</th>
                      <th className="py-2 pr-2">Ref</th>
                      <th className="py-2 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedValues.map((item, idx) => {
                      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
                      return (
                        <tr key={`${item.marker}-${idx}`} className="border-t border-slate-200/70 dark:border-slate-700/60">
                          <td className="py-2 pr-2 font-semibold">{item.marker}</td>
                          <td className="py-2 pr-2">{item.value}{item.unit ? ` ${item.unit}` : ''}</td>
                          <td className="py-2 pr-2">{Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number) ? `${item.referenceMin}-${item.referenceMax}` : 'n/a'}</td>
                          <td className="py-2 pr-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${statusColor(status)}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {analysis ? (
            <article className="rounded-[2rem] border border-slate-800/70 dark:border-slate-700/70 bg-slate-950 text-white dark:bg-[#08162f] p-6 shadow-luna-deep space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clinical-Friendly Summary</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{analysis.text}</p>
              <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/60 pb-1">{copyFeedback || 'Copy for doctor'}</button>
            </article>
          ) : (
            <article className="rounded-[2rem] border-2 border-dashed border-slate-300/80 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/50 p-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Report ready zone</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2">Choose identity, fill profile + table, then Generate Report.</p>
            </article>
          )}

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-6 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Safety note</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">Luna provides educational interpretation only. Final diagnosis and treatment decisions require a licensed clinician.</p>
          </article>
        </aside>
      </div>
    </article>
  );
};
