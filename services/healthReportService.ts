export interface PersonalHealthProfile {
  birthYear: string;
  cycleLength: string;
  cycleDay: string;
  medications: string;
  knownConditions: string;
  goals: string;
}

export interface HealthLabRow {
  id: string;
  marker: string;
  value: string;
  unit: string;
  reference: string;
  date: string;
  note: string;
}

export interface ParsedLabValue {
  marker: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
}

export interface HormoneSignal {
  hormone: string;
  marker: string;
  value: number;
  status: 'low' | 'normal' | 'high' | 'unknown';
  importance: string;
}

export interface LabExtractionResult {
  text: string;
  source: string;
  usedAi: boolean;
}

const markerMap: Array<{ key: string; hormone: string; importance: string }> = [
  { key: 'estradiol', hormone: 'Estrogen', importance: 'Supports cycle rhythm, skin, mood, and vascular tone.' },
  { key: 'estrogen', hormone: 'Estrogen', importance: 'Supports cycle rhythm, skin, mood, and vascular tone.' },
  { key: 'progesterone', hormone: 'Progesterone', importance: 'Stabilizes sleep, anxiety reactivity, and premenstrual symptoms.' },
  { key: 'lh', hormone: 'LH', importance: 'Signals ovulation timing and ovarian response.' },
  { key: 'fsh', hormone: 'FSH', importance: 'Reflects ovarian stimulation reserve and cycle recruitment.' },
  { key: 'prolactin', hormone: 'Prolactin', importance: 'Can affect cycle regularity, ovulation, and breast symptoms.' },
  { key: 'testosterone', hormone: 'Testosterone', importance: 'Impacts energy, libido, recovery, and androgen symptoms.' },
  { key: 'free testosterone', hormone: 'Free Testosterone', importance: 'Closer signal for libido, arousal response, and sexual motivation.' },
  { key: 'shbg', hormone: 'SHBG', importance: 'Controls free sex hormones and may influence libido availability.' },
  { key: 'dhea', hormone: 'DHEA', importance: 'Adrenal-androgen precursor tied to stress adaptation.' },
  { key: 'dhea-s', hormone: 'DHEA', importance: 'Adrenal-androgen precursor tied to stress adaptation and sexual vitality.' },
  { key: 'androstenedione', hormone: 'Androgen Axis', importance: 'Intermediate androgen marker linked with ovarian/adrenal androgen tone.' },
  { key: '17-oh progesterone', hormone: 'Adrenal/Ovarian Axis', importance: 'Helps clarify adrenal-ovarian steroid pathways when androgen symptoms exist.' },
  { key: 'cortisol', hormone: 'Cortisol', importance: 'Main stress signal affecting sleep, cravings, and fatigue.' },
  { key: 'tsh', hormone: 'Thyroid Axis', importance: 'Central thyroid regulator linked with mood, cold sensitivity, and metabolism.' },
  { key: 'ft4', hormone: 'Thyroid Axis', importance: 'Primary thyroid hormone influencing metabolic pace.' },
  { key: 't4', hormone: 'Thyroid Axis', importance: 'Primary thyroid hormone influencing metabolic pace.' },
  { key: 'ft3', hormone: 'Thyroid Axis', importance: 'Active thyroid signal impacting energy, concentration, and mood.' },
  { key: 't3', hormone: 'Thyroid Axis', importance: 'Active thyroid signal impacting energy, concentration, and mood.' },
  { key: 'insulin', hormone: 'Insulin', importance: 'Regulates glucose stability, appetite, and fat storage dynamics.' },
  { key: 'hba1c', hormone: 'Glucose-Insulin', importance: 'Shows long-term glucose balance and metabolic load.' },
  { key: 'glucose', hormone: 'Glucose-Insulin', importance: 'Shows daily glucose response and energy stability pattern.' },
  { key: 'ferritin', hormone: 'Iron Reserve', importance: 'Low stores can amplify fatigue, hair loss, and low resilience.' },
  { key: 'vitamin d', hormone: 'Vitamin D', importance: 'Supports immune regulation, mood, and endocrine communication.' },
];

const normalize = (value: string) => value.trim().toLowerCase();
const asNumber = (value: string) => Number(value.replace(',', '.'));
const looksLikeNumericToken = (value: string) => /^-?\d+(?:[.,]\d+)?$/.test(value.trim());
const hasLetter = (value: string) => /[A-Za-zА-Яа-я\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF]/.test(value);

const parseReferenceRange = (reference: string): { min?: number; max?: number } => {
  const match = reference.match(/(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)/);
  if (!match) return {};
  const min = asNumber(match[1]);
  const max = asNumber(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return {};
  return { min, max };
};

const inferStatus = (value: number, min?: number, max?: number): HormoneSignal['status'] => {
  if (!Number.isFinite(value)) return 'unknown';
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 'unknown';
  if (value < Number(min)) return 'low';
  if (value > Number(max)) return 'high';
  return 'normal';
};

const parseLineValue = (line: string): ParsedLabValue | null => {
  const clean = line.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const match = clean.match(/^([A-Za-zА-Яа-я0-9\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF_()+/%\-\s]{2,80})[:\s-]+(-?\d+(?:[.,]\d+)?)(?:\s*([A-Za-zА-Яа-я\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF/%µμ0-9]+))?(?:\s*(?:\(|\[)?\s*(-?\d+(?:[.,]\d+)?)\s*[-–~]\s*(-?\d+(?:[.,]\d+)?)(?:\)|\])?)?/);
  if (!match) return null;

  const marker = match[1]?.trim();
  const value = asNumber(match[2] || '');
  if (!marker || !Number.isFinite(value)) return null;

  const unit = match[3]?.trim();
  const min = match[4] ? asNumber(match[4]) : undefined;
  const max = match[5] ? asNumber(match[5]) : undefined;
  if (!unit && (!Number.isFinite(min as number) || !Number.isFinite(max as number))) {
    return null;
  }

  return {
    marker,
    value,
    unit,
    referenceMin: Number.isFinite(min as number) ? min : undefined,
    referenceMax: Number.isFinite(max as number) ? max : undefined,
  };
};

const parseTokenizedLine = (line: string): ParsedLabValue | null => {
  const clean = line.replace(/\s+/g, ' ').trim();
  if (!clean) return null;

  const tokens = clean.split(' ').filter(Boolean);
  const valueIndex = tokens.findIndex((token) => looksLikeNumericToken(token));
  if (valueIndex <= 0) return null;

  const marker = tokens.slice(0, valueIndex).join(' ').trim();
  if (!marker || !hasLetter(marker)) return null;

  const value = asNumber(tokens[valueIndex]);
  if (!Number.isFinite(value)) return null;

  const unitCandidate = tokens[valueIndex + 1] || '';
  const unit = /[A-Za-zА-Яа-я\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF/%µμ]/.test(unitCandidate) ? unitCandidate : undefined;
  const range = clean.match(/(-?\d+(?:[.,]\d+)?)\s*[-–~]\s*(-?\d+(?:[.,]\d+)?)/);
  const referenceMin = range ? asNumber(range[1]) : undefined;
  const referenceMax = range ? asNumber(range[2]) : undefined;

  if (!unit && (!Number.isFinite(referenceMin as number) || !Number.isFinite(referenceMax as number))) {
    return null;
  }

  return {
    marker,
    value,
    unit,
    referenceMin: Number.isFinite(referenceMin as number) ? referenceMin : undefined,
    referenceMax: Number.isFinite(referenceMax as number) ? referenceMax : undefined,
  };
};

const parseDelimitedLine = (line: string): ParsedLabValue | null => {
  const normalized = line.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  const parts = normalized.split(/\t|[;|]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const marker = parts[0];
  if (!hasLetter(marker)) return null;

  let value: number | null = null;
  let unit: string | undefined;
  let referenceMin: number | undefined;
  let referenceMax: number | undefined;

  for (let i = 1; i < parts.length; i += 1) {
    const part = parts[i];
    if (value === null && looksLikeNumericToken(part)) {
      const parsed = asNumber(part);
      if (Number.isFinite(parsed)) {
        value = parsed;
        continue;
      }
    }

    if (!unit && /[A-Za-zА-Яа-я\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF/%µμ]/.test(part) && !/[-–~]/.test(part)) {
      unit = part;
      continue;
    }

    const range = part.match(/(-?\d+(?:[.,]\d+)?)\s*[-–~]\s*(-?\d+(?:[.,]\d+)?)/);
    if (range) {
      const min = asNumber(range[1]);
      const max = asNumber(range[2]);
      if (Number.isFinite(min) && Number.isFinite(max)) {
        referenceMin = min;
        referenceMax = max;
      }
    }
  }

  if (value === null || !Number.isFinite(value)) return null;
  if (!unit && (!Number.isFinite(referenceMin as number) || !Number.isFinite(referenceMax as number))) return null;

  return {
    marker,
    value,
    unit,
    referenceMin: Number.isFinite(referenceMin as number) ? referenceMin : undefined,
    referenceMax: Number.isFinite(referenceMax as number) ? referenceMax : undefined,
  };
};

export const parseLabText = (raw: string): ParsedLabValue[] => {
  return raw
    .split(/\r?\n/)
    .map((line) => parseLineValue(line) || parseDelimitedLine(line) || parseTokenizedLine(line))
    .filter((item): item is ParsedLabValue => Boolean(item));
};

export const toLabRows = (items: ParsedLabValue[]): HealthLabRow[] => {
  return items.map((item, index) => ({
    id: `parsed-${index}-${item.marker.toLowerCase().replace(/\s+/g, '-')}`,
    marker: item.marker,
    value: String(item.value),
    unit: item.unit || '',
    reference:
      Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
        ? `${item.referenceMin}-${item.referenceMax}`
        : '',
    date: '',
    note: '',
  }));
};

export const computeHormoneSignals = (items: ParsedLabValue[]): HormoneSignal[] => {
  const signals: HormoneSignal[] = [];
  for (const item of items) {
    const markerKey = normalize(item.marker);
    const mapped = markerMap.find((entry) => markerKey.includes(entry.key));
    if (!mapped) continue;
    signals.push({
      hormone: mapped.hormone,
      marker: item.marker,
      value: item.value,
      status: inferStatus(item.value, item.referenceMin, item.referenceMax),
      importance: mapped.importance,
    });
  }
  return signals;
};

export const summarizeHormoneSignals = (signals: HormoneSignal[]): string => {
  if (signals.length === 0) {
    return 'No hormone-linked markers detected yet. Add estradiol, progesterone, LH/FSH, cortisol, thyroid, insulin, ferritin, or vitamin D values.';
  }
  const grouped = {
    low: signals.filter((item) => item.status === 'low').length,
    high: signals.filter((item) => item.status === 'high').length,
    normal: signals.filter((item) => item.status === 'normal').length,
    unknown: signals.filter((item) => item.status === 'unknown').length,
  };
  return `Detected ${signals.length} hormone-linked markers: ${grouped.normal} within range, ${grouped.low} low, ${grouped.high} high, ${grouped.unknown} without reference range.`;
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

export const extractTextFromLabFile = async (file: File): Promise<LabExtractionResult> => {
  if (file.type.startsWith('text/') || /\.(txt|csv|md)$/i.test(file.name)) {
    const text = await file.text();
    return {
      text,
      source: `Loaded text from ${file.name}`,
      usedAi: false,
    };
  }

  if (file.type.startsWith('image/')) {
    const dataUrl = await fileToDataUrl(file);
    const response = await fetch('/api/labs/extract-image', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        dataUrl,
      }),
    });
    if (!response.ok) {
      throw new Error('Image extraction request failed');
    }
    const payload = (await response.json()) as { text?: string; message?: string; provider?: string };
    return {
      text: payload.text || '',
      source: payload.message || `Scanned ${file.name}`,
      usedAi: payload.provider === 'gemini',
    };
  }

  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const dataUrl = await fileToDataUrl(file);
    const response = await fetch('/api/labs/extract-pdf', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        dataUrl,
      }),
    });
    if (!response.ok) {
      throw new Error('PDF extraction request failed');
    }
    const payload = (await response.json()) as { text?: string; message?: string; provider?: string };
    return {
      text: payload.text || '',
      source: payload.message || `Scanned ${file.name}`,
      usedAi: payload.provider === 'gemini',
    };
  }

  throw new Error('Unsupported file type');
};
