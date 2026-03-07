import React, { useMemo, useRef, useState } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { Logo } from './Logo';
import { HormoneTestingGuide } from './HormoneTestingGuide';
import { isSupportedLabFile } from '../utils/runtimeGuards';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { Language } from '../constants';
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
const intimacySymptoms = ['Low libido', 'Low arousal', 'Dryness', 'Pain during intimacy', 'Low orgasm quality', 'Low closeness'];
const sexualUiByLang: Partial<Record<Language, {
  intimacySymptomsTitle: string;
  sexualSnapshotTitle: string;
  libidoTemplate: string;
  intimacyFactors: string;
  sexualSnapshotLabel: string;
  summaryLabel: string;
  stateStable: string;
  stateModerate: string;
  stateHigh: string;
  scoreLabels: { libido: string; arousal: string; comfort: string; closeness: string; pain: string };
}>> = {
  en: {
    intimacySymptomsTitle: 'Intimacy & libido symptoms',
    sexualSnapshotTitle: 'Sexual Wellbeing Snapshot',
    libidoTemplate: 'Libido & Intimacy',
    intimacyFactors: 'Libido & Intimacy Factors',
    sexualSnapshotLabel: 'Current',
    summaryLabel: 'Sexual health snapshot',
    stateStable: 'Stable sexual-health baseline.',
    stateModerate: 'Moderate strain: useful to review hormonal and stress factors.',
    stateHigh: 'High priority: libido/intimacy strain needs structured review.',
    scoreLabels: { libido: 'Libido', arousal: 'Arousal', comfort: 'Comfort', closeness: 'Emotional Closeness', pain: 'Pain During Intimacy' },
  },
  ru: {
    intimacySymptomsTitle: 'Симптомы близости и либидо',
    sexualSnapshotTitle: 'Снимок Сексуального Самочувствия',
    libidoTemplate: 'Либидо И Близость',
    intimacyFactors: 'Факторы Либидо И Близости',
    sexualSnapshotLabel: 'Текущее',
    summaryLabel: 'Снимок сексуального здоровья',
    stateStable: 'Базовое состояние сексуального здоровья стабильное.',
    stateModerate: 'Умеренное напряжение: стоит проверить гормональные и стресс-факторы.',
    stateHigh: 'Высокий приоритет: выраженное напряжение либидо/близости требует структурного разбора.',
    scoreLabels: { libido: 'Либидо', arousal: 'Возбуждение', comfort: 'Комфорт', closeness: 'Эмоциональная Близость', pain: 'Боль При Близости' },
  },
  uk: {
    intimacySymptomsTitle: 'Симптоми близькості та лібідо',
    sexualSnapshotTitle: 'Зріз Сексуального Самопочуття',
    libidoTemplate: 'Лібідо Та Близькість',
    intimacyFactors: 'Фактори Лібідо Та Близькості',
    sexualSnapshotLabel: 'Поточний стан',
    summaryLabel: 'Зріз сексуального здоровʼя',
    stateStable: 'Базовий стан сексуального здоровʼя стабільний.',
    stateModerate: 'Помірне напруження: варто перевірити гормональні та стрес-фактори.',
    stateHigh: 'Високий пріоритет: виражене напруження лібідо/близькості потребує структурного аналізу.',
    scoreLabels: { libido: 'Лібідо', arousal: 'Збудження', comfort: 'Комфорт', closeness: 'Емоційна Близькість', pain: 'Біль Під Час Близькості' },
  },
  es: {
    intimacySymptomsTitle: 'Síntomas de intimidad y libido',
    sexualSnapshotTitle: 'Resumen De Bienestar Sexual',
    libidoTemplate: 'Libido E Intimidad',
    intimacyFactors: 'Factores De Libido E Intimidad',
    sexualSnapshotLabel: 'Actual',
    summaryLabel: 'Resumen de salud sexual',
    stateStable: 'Línea base sexual estable.',
    stateModerate: 'Tensión moderada: conviene revisar factores hormonales y de estrés.',
    stateHigh: 'Alta prioridad: la tensión de libido/intimidad requiere revisión estructurada.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitación', comfort: 'Confort', closeness: 'Cercanía Emocional', pain: 'Dolor En La Intimidad' },
  },
  fr: {
    intimacySymptomsTitle: 'Symptômes d’intimité et de libido',
    sexualSnapshotTitle: 'Aperçu Du Bien-Être Sexuel',
    libidoTemplate: 'Libido Et Intimité',
    intimacyFactors: 'Facteurs Libido Et Intimité',
    sexualSnapshotLabel: 'Actuel',
    summaryLabel: 'Aperçu santé sexuelle',
    stateStable: 'Base de santé sexuelle stable.',
    stateModerate: 'Tension modérée: utile de revoir facteurs hormonaux et stress.',
    stateHigh: 'Priorité élevée: tension libido/intimité à analyser de façon structurée.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitation', comfort: 'Confort', closeness: 'Proximité Émotionnelle', pain: 'Douleur Pendant L’intimité' },
  },
  de: {
    intimacySymptomsTitle: 'Intimitäts- und Libido-Symptome',
    sexualSnapshotTitle: 'Sexuelles Wohlbefinden',
    libidoTemplate: 'Libido & Intimität',
    intimacyFactors: 'Libido- & Intimitätsfaktoren',
    sexualSnapshotLabel: 'Aktuell',
    summaryLabel: 'Sexualgesundheit Snapshot',
    stateStable: 'Stabile sexuelle Ausgangslage.',
    stateModerate: 'Moderate Belastung: hormonelle und Stressfaktoren prüfen.',
    stateHigh: 'Hohe Priorität: Libido/Intimitätsbelastung braucht strukturierte Abklärung.',
    scoreLabels: { libido: 'Libido', arousal: 'Erregung', comfort: 'Komfort', closeness: 'Emotionale Nähe', pain: 'Schmerz Bei Intimität' },
  },
  zh: {
    intimacySymptomsTitle: '亲密与性欲症状',
    sexualSnapshotTitle: '性健康快照',
    libidoTemplate: '性欲与亲密',
    intimacyFactors: '性欲与亲密因素',
    sexualSnapshotLabel: '当前',
    summaryLabel: '性健康快照',
    stateStable: '性健康基线较稳定。',
    stateModerate: '中度压力：建议复查激素与压力因素。',
    stateHigh: '高优先级：性欲/亲密压力明显，需要结构化评估。',
    scoreLabels: { libido: '性欲', arousal: '唤起', comfort: '舒适度', closeness: '情感亲密', pain: '亲密时疼痛' },
  },
  ja: {
    intimacySymptomsTitle: '親密さ・リビドー症状',
    sexualSnapshotTitle: 'セクシャルウェルビーイング',
    libidoTemplate: 'リビドー・親密さ',
    intimacyFactors: 'リビドーと親密さの要因',
    sexualSnapshotLabel: '現在',
    summaryLabel: '性健康スナップショット',
    stateStable: '性健康のベースラインは安定しています。',
    stateModerate: '中等度の負荷: ホルモンとストレス要因の確認が有効です。',
    stateHigh: '高優先度: リビドー/親密さの負荷は構造的な見直しが必要です。',
    scoreLabels: { libido: 'リビドー', arousal: '覚醒', comfort: '快適さ', closeness: '情緒的な近さ', pain: '親密時の痛み' },
  },
  pt: {
    intimacySymptomsTitle: 'Sintomas de intimidade e libido',
    sexualSnapshotTitle: 'Resumo De Bem-Estar Sexual',
    libidoTemplate: 'Libido E Intimidade',
    intimacyFactors: 'Fatores De Libido E Intimidade',
    sexualSnapshotLabel: 'Atual',
    summaryLabel: 'Resumo de saúde sexual',
    stateStable: 'Linha de base sexual estável.',
    stateModerate: 'Tensão moderada: vale revisar fatores hormonais e de estresse.',
    stateHigh: 'Alta prioridade: tensão de libido/intimidade exige revisão estruturada.',
    scoreLabels: { libido: 'Libido', arousal: 'Excitação', comfort: 'Conforto', closeness: 'Proximidade Emocional', pain: 'Dor Na Intimidade' },
  },
};

const visualGuideByLang: Partial<Record<Language, { title: string; cards: Array<{ title: string; body: string }> }>> = {
  en: {
    title: 'Visual Path',
    cards: [
      { title: '1. Collect', body: 'Fill profile + select symptoms + add markers.' },
      { title: '2. Compare', body: 'Match values with reference ranges and cycle phase.' },
      { title: '3. Act', body: 'Use doctor questions and summary for next consultation.' },
    ],
  },
  ru: {
    title: 'Визуальный Путь',
    cards: [
      { title: '1. Сбор', body: 'Заполните профиль + симптомы + маркеры.' },
      { title: '2. Сравнение', body: 'Сопоставьте значения с референсами и фазой цикла.' },
      { title: '3. Действие', body: 'Используйте вопросы врачу и summary на консультации.' },
    ],
  },
  uk: {
    title: 'Візуальний Маршрут',
    cards: [
      { title: '1. Збір', body: 'Заповніть профіль + симптоми + маркери.' },
      { title: '2. Порівняння', body: 'Зіставте значення з референсами та фазою циклу.' },
      { title: '3. Дія', body: 'Використайте питання до лікаря та summary на консультації.' },
    ],
  },
  es: {
    title: 'Ruta Visual',
    cards: [
      { title: '1. Recoger', body: 'Completa perfil + síntomas + marcadores.' },
      { title: '2. Comparar', body: 'Cruza valores con rangos y fase del ciclo.' },
      { title: '3. Actuar', body: 'Usa preguntas médicas y resumen en consulta.' },
    ],
  },
  fr: {
    title: 'Parcours Visuel',
    cards: [
      { title: '1. Collecter', body: 'Profil + symptômes + marqueurs.' },
      { title: '2. Comparer', body: 'Comparer aux références et à la phase du cycle.' },
      { title: '3. Agir', body: 'Utiliser questions médecin et résumé en consultation.' },
    ],
  },
  de: {
    title: 'Visueller Pfad',
    cards: [
      { title: '1. Sammeln', body: 'Profil + Symptome + Marker ausfüllen.' },
      { title: '2. Vergleichen', body: 'Werte mit Referenzen und Zyklusphase abgleichen.' },
      { title: '3. Handeln', body: 'Arztfragen und Summary im Termin nutzen.' },
    ],
  },
  zh: {
    title: '可视路径',
    cards: [
      { title: '1. 收集', body: '填写档案 + 选择症状 + 添加指标。' },
      { title: '2. 对照', body: '将数值与参考范围及周期阶段对照。' },
      { title: '3. 行动', body: '带着总结和医生问题去复诊。' },
    ],
  },
  ja: {
    title: 'ビジュアル手順',
    cards: [
      { title: '1. 収集', body: 'プロフィール + 症状 + マーカーを入力。' },
      { title: '2. 比較', body: '基準値と周期フェーズで比較。' },
      { title: '3. 実行', body: '医師への質問と要約を診察で活用。' },
    ],
  },
  pt: {
    title: 'Fluxo Visual',
    cards: [
      { title: '1. Coletar', body: 'Preencha perfil + sintomas + marcadores.' },
      { title: '2. Comparar', body: 'Cruze valores com referências e fase do ciclo.' },
      { title: '3. Agir', body: 'Leve perguntas médicas e resumo para consulta.' },
    ],
  },
};

const reportUiByLang: Partial<Record<Language, {
  reportTitle: string;
  reportSubtitle: string;
  copy: string;
  print: string;
  share: string;
  download: string;
  pdf: string;
  sampleTitle: string;
  sampleBody: string;
  sampleDownload: string;
  servicePromise: string;
  serviceBullets: string[];
}>> = {
  en: {
    reportTitle: 'Luna Branded Report',
    reportSubtitle: 'Visual summary designed for your doctor conversation.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Sample Report',
    sampleBody: 'Download an example of the report format you receive as a service.',
    sampleDownload: 'Download Sample',
    servicePromise: 'This is what you will have as a premium report service:',
    serviceBullets: ['Branded visual report in Luna style.', 'Cycle-aware hormone interpretation.', 'Doctor-ready summary with practical questions.', 'Copy, print, share, download, and PDF-friendly output.'],
  },
  ru: {
    reportTitle: 'Брендированный Отчет Luna',
    reportSubtitle: 'Визуальное summary для разговора с врачом.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Пример Отчета',
    sampleBody: 'Скачайте образец формата отчета, который вы получаете как сервис.',
    sampleDownload: 'Скачать Образец',
    servicePromise: 'Это то, что вы будете получать как сервис:',
    serviceBullets: ['Фирменный визуальный отчет в стиле Luna.', 'Интерпретация гормонов с учетом фазы цикла.', 'Готовое summary и вопросы для врача.', 'Copy, print, share, download и PDF-формат.'],
  },
  uk: {
    reportTitle: 'Брендований Звіт Luna',
    reportSubtitle: 'Візуальне summary для розмови з лікарем.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Приклад Звіту',
    sampleBody: 'Завантажте приклад формату звіту, який ви отримаєте як сервіс.',
    sampleDownload: 'Завантажити Приклад',
    servicePromise: 'Це те, що ви матимете як сервіс:',
    serviceBullets: ['Фірмовий візуальний звіт у стилі Luna.', 'Інтерпретація гормонів з урахуванням фази циклу.', 'Готове summary і питання до лікаря.', 'Copy, print, share, download і PDF-формат.'],
  },
  es: {
    reportTitle: 'Reporte De Marca Luna',
    reportSubtitle: 'Resumen visual para conversación médica.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Reporte De Ejemplo',
    sampleBody: 'Descarga un ejemplo del formato de reporte que tendrás como servicio.',
    sampleDownload: 'Descargar Ejemplo',
    servicePromise: 'Esto es lo que tendrás como servicio:',
    serviceBullets: ['Reporte visual con estilo Luna.', 'Interpretación hormonal con fase del ciclo.', 'Resumen y preguntas listos para tu médico.', 'Copy, print, share, download y salida compatible con PDF.'],
  },
  fr: {
    reportTitle: 'Rapport De Marque Luna',
    reportSubtitle: 'Résumé visuel pour votre consultation.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Exemple De Rapport',
    sampleBody: 'Téléchargez un exemple du format de rapport proposé en service.',
    sampleDownload: 'Télécharger Exemple',
    servicePromise: 'Voici ce que vous aurez en service:',
    serviceBullets: ['Rapport visuel avec identité Luna.', 'Interprétation hormonale selon la phase du cycle.', 'Résumé et questions prêts pour le médecin.', 'Copy, print, share, download et sortie compatible PDF.'],
  },
  de: {
    reportTitle: 'Luna Markenbericht',
    reportSubtitle: 'Visuelle Zusammenfassung für das Arztgespräch.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Beispielbericht',
    sampleBody: 'Lade ein Beispiel des Report-Formats herunter, das du als Service erhältst.',
    sampleDownload: 'Beispiel Laden',
    servicePromise: 'Das erhalten Sie als Service:',
    serviceBullets: ['Visueller Bericht im Luna-Stil.', 'Hormon-Interpretation nach Zyklusphase.', 'Arztfertige Zusammenfassung mit Fragen.', 'Copy, print, share, download und PDF-freundliche Ausgabe.'],
  },
  zh: {
    reportTitle: 'Luna 品牌报告',
    reportSubtitle: '用于就医沟通的可视化总结。',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: '示例报告',
    sampleBody: '下载示例，查看你将获得的服务报告格式。',
    sampleDownload: '下载示例',
    servicePromise: '你将获得以下服务能力：',
    serviceBullets: ['Luna 品牌化视觉报告。', '结合周期阶段的激素解读。', '可直接给医生使用的总结与问题。', '支持 Copy、Print、Share、Download 与 PDF。'],
  },
  ja: {
    reportTitle: 'Luna ブランドレポート',
    reportSubtitle: '医師との対話に使えるビジュアル要約。',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'サンプルレポート',
    sampleBody: 'サービスで受け取るレポート形式のサンプルをダウンロード。',
    sampleDownload: 'サンプルを取得',
    servicePromise: 'このサービスで得られる内容:',
    serviceBullets: ['Lunaスタイルのブランドレポート。', '周期フェーズ連動のホルモン解釈。', '医師向け要約と質問を自動作成。', 'Copy / Print / Share / Download / PDF 対応。'],
  },
  pt: {
    reportTitle: 'Relatório De Marca Luna',
    reportSubtitle: 'Resumo visual para conversa com seu médico.',
    copy: 'Copy',
    print: 'Print',
    share: 'Share',
    download: 'Download',
    pdf: 'PDF',
    sampleTitle: 'Relatório Exemplo',
    sampleBody: 'Baixe um exemplo do formato de relatório que você terá como serviço.',
    sampleDownload: 'Baixar Exemplo',
    servicePromise: 'Isto é o que você terá como serviço:',
    serviceBullets: ['Relatório visual com identidade Luna.', 'Interpretação hormonal por fase do ciclo.', 'Resumo e perguntas prontos para consulta.', 'Copy, print, share, download e saída compatível com PDF.'],
  },
};

const medicalFormByLang: Partial<Record<Language, {
  generatedAt: string;
  patientId: string;
  source: string;
  panel: string;
  allMarkers: string;
  summary: string;
  disclaimerTitle: string;
  disclaimerBody: string;
}>> = {
  en: {
    generatedAt: 'Generated At',
    patientId: 'Patient ID',
    source: 'Analysis Source',
    panel: 'Clinical Panel',
    allMarkers: 'All Lab Indicators',
    summary: 'Clinical Summary',
    disclaimerTitle: 'MEDICAL DISCLAIMER',
    disclaimerBody: 'THIS REPORT IS INFORMATIONAL ONLY AND DOES NOT REPLACE MEDICAL DIAGNOSIS OR TREATMENT. PLEASE CONSULT A LICENSED PHYSICIAN IF SYMPTOMS PERSIST OR WORSEN.',
  },
  ru: {
    generatedAt: 'Дата Генерации',
    patientId: 'ID Пользователя',
    source: 'Источник Анализа',
    panel: 'Клиническая Панель',
    allMarkers: 'Все Лаб Показатели',
    summary: 'Клиническое Summary',
    disclaimerTitle: 'МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР',
    disclaimerBody: 'ЭТОТ ОТЧЕТ НОСИТ ИНФОРМАЦИОННЫЙ ХАРАКТЕР И НЕ ЗАМЕНЯЕТ МЕДИЦИНСКУЮ ДИАГНОСТИКУ И ЛЕЧЕНИЕ. ПРИ НЕОБХОДИМОСТИ ОБРАТИТЕСЬ К ЛИЦЕНЗИРОВАННОМУ ВРАЧУ.',
  },
  uk: {
    generatedAt: 'Дата Генерації',
    patientId: 'ID Користувача',
    source: 'Джерело Аналізу',
    panel: 'Клінічна Панель',
    allMarkers: 'Усі Лаб Показники',
    summary: 'Клінічне Summary',
    disclaimerTitle: 'МЕДИЧНИЙ ДИСКЛЕЙМЕР',
    disclaimerBody: 'ЦЕЙ ЗВІТ МАЄ ІНФОРМАЦІЙНИЙ ХАРАКТЕР І НЕ ЗАМІНЮЄ МЕДИЧНУ ДІАГНОСТИКУ ТА ЛІКУВАННЯ. ЗА ПОТРЕБИ ЗВЕРНІТЬСЯ ДО ЛІЦЕНЗОВАНОГО ЛІКАРЯ.',
  },
  es: {
    generatedAt: 'Fecha De Generación',
    patientId: 'ID De Usuario',
    source: 'Origen Del Análisis',
    panel: 'Panel Clínico',
    allMarkers: 'Todos Los Indicadores',
    summary: 'Resumen Clínico',
    disclaimerTitle: 'DESCARGO MÉDICO',
    disclaimerBody: 'ESTE REPORTE ES SOLO INFORMATIVO Y NO SUSTITUYE DIAGNÓSTICO O TRATAMIENTO MÉDICO. CONSULTE A UN MÉDICO LICENCIADO SI LOS SÍNTOMAS PERSISTEN O EMPEORAN.',
  },
  fr: {
    generatedAt: 'Date De Génération',
    patientId: 'ID Utilisateur',
    source: "Source D'analyse",
    panel: 'Panel Clinique',
    allMarkers: 'Tous Les Indicateurs',
    summary: 'Résumé Clinique',
    disclaimerTitle: 'AVERTISSEMENT MÉDICAL',
    disclaimerBody: 'CE RAPPORT EST INFORMATIF ET NE REMPLACE PAS UN DIAGNOSTIC OU UN TRAITEMENT MÉDICAL. CONSULTEZ UN MÉDECIN AGRÉÉ SI LES SYMPTÔMES PERSISTENT OU S’AGGRAVENT.',
  },
  de: {
    generatedAt: 'Erstellt Am',
    patientId: 'Benutzer-ID',
    source: 'Analysequelle',
    panel: 'Klinisches Panel',
    allMarkers: 'Alle Laborwerte',
    summary: 'Klinische Zusammenfassung',
    disclaimerTitle: 'MEDIZINISCHER HINWEIS',
    disclaimerBody: 'DIESER BERICHT DIENT NUR DER INFORMATION UND ERSETZT KEINE MEDIZINISCHE DIAGNOSE ODER THERAPIE. BITTE WENDEN SIE SICH BEI BEDARF AN EINE ZUGELASSENE ÄRZTIN ODER EINEN ZUGELASSENEN ARZT.',
  },
  zh: {
    generatedAt: '生成时间',
    patientId: '用户ID',
    source: '分析来源',
    panel: '临床面板',
    allMarkers: '全部实验室指标',
    summary: '临床总结',
    disclaimerTitle: '医疗免责声明',
    disclaimerBody: '本报告仅供信息参考，不替代医疗诊断或治疗。如有需要，请咨询持证医生。',
  },
  ja: {
    generatedAt: '生成日時',
    patientId: 'ユーザーID',
    source: '解析ソース',
    panel: '臨床パネル',
    allMarkers: '全ラボ指標',
    summary: '臨床サマリー',
    disclaimerTitle: '医療免責事項',
    disclaimerBody: '本レポートは情報提供のみを目的とし、医療診断や治療の代替ではありません。必要に応じて医師にご相談ください。',
  },
  pt: {
    generatedAt: 'Data De Geração',
    patientId: 'ID Do Usuário',
    source: 'Origem Da Análise',
    panel: 'Painel Clínico',
    allMarkers: 'Todos Os Indicadores',
    summary: 'Resumo Clínico',
    disclaimerTitle: 'AVISO MÉDICO',
    disclaimerBody: 'ESTE RELATÓRIO É APENAS INFORMATIVO E NÃO SUBSTITUI DIAGNÓSTICO OU TRATAMENTO MÉDICO. PROCURE UM MÉDICO LICENCIADO SE NECESSÁRIO.',
  },
};

const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

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
  libido_intimacy: [
    { marker: 'Estradiol (E2)', unit: 'pg/mL', reference: '30-400' },
    { marker: 'Progesterone', unit: 'ng/mL', reference: '0.2-25' },
    { marker: 'Total Testosterone', unit: 'ng/dL', reference: '15-70' },
    { marker: 'Free Testosterone', unit: 'pg/mL', reference: '0.3-3.5' },
    { marker: 'SHBG', unit: 'nmol/L', reference: '18-114' },
    { marker: 'Prolactin', unit: 'ng/mL', reference: '4.8-23.3' },
    { marker: 'DHEA-S', unit: 'ug/dL', reference: '35-430' },
    { marker: 'TSH', unit: 'mIU/L', reference: '0.4-4.0' },
    { marker: 'Ferritin', unit: 'ng/mL', reference: '15-150' },
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

export const LabsView: React.FC<{ day: number; age: number; lang: Language; userId?: string; userName?: string; onBack?: () => void }> = ({ day, age, lang, userId, userName }) => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<{ text: string; sources: unknown[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportActionFeedback, setReportActionFeedback] = useState<string | null>(null);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<HealthLabRow[]>([newRow()]);
  const [parsedRows, setParsedRows] = useState<HealthLabRow[]>([]);
  const [parsedValues, setParsedValues] = useState<ParsedLabValue[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [sexualScores, setSexualScores] = useState({
    libido: 3,
    arousal: 3,
    comfort: 3,
    closeness: 3,
    pain: 1,
  });
  const [includeNameInReport, setIncludeNameInReport] = useState(false);
  const [includeIdInReport, setIncludeIdInReport] = useState(true);
  const [manualReportId, setManualReportId] = useState('');
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => ({ ...emptyProfile, birthYear: String(new Date().getFullYear() - age), cycleDay: String(day) }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  const sexualUi = sexualUiByLang[lang] || sexualUiByLang.en!;
  const visualGuide = visualGuideByLang[lang] || visualGuideByLang.en!;
  const reportUi = reportUiByLang[lang] || reportUiByLang.en!;
  const medForm = medicalFormByLang[lang] || medicalFormByLang.en!;

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

  const sexualOverview = useMemo(() => {
    const sumPositive = sexualScores.libido + sexualScores.arousal + sexualScores.comfort + sexualScores.closeness;
    const avgPositive = Number((sumPositive / 4).toFixed(1));
    const pain = sexualScores.pain;
    let state = sexualUi.stateStable;
    if (avgPositive <= 2.2 || pain >= 4) state = sexualUi.stateHigh;
    else if (avgPositive <= 3 || pain >= 3) state = sexualUi.stateModerate;
    return { avgPositive, pain, state };
  }, [sexualScores, sexualUi.stateStable, sexualUi.stateHigh, sexualUi.stateModerate]);

  const libidoHormoneSignals = useMemo(() => {
    const keys = ['estrogen', 'estradiol', 'progesterone', 'testosterone', 'shbg', 'prolactin', 'dhea', 'thyroid', 'tsh', 'ferritin'];
    return hormoneSignals.filter((signal) => keys.some((key) => signal.marker.toLowerCase().includes(key) || signal.hormone.toLowerCase().includes(key)));
  }, [hormoneSignals]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]));
  };

  const updateSexualScore = (key: keyof typeof sexualScores, value: number) => {
    setSexualScores((prev) => ({ ...prev, [key]: value }));
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
      `Sexual health scores (1-5): libido=${sexualScores.libido}, arousal=${sexualScores.arousal}, comfort=${sexualScores.comfort}, closeness=${sexualScores.closeness}, pain=${sexualScores.pain}`,
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

  const reportGeneratedAt = useMemo(() => new Date().toLocaleString(), [analysis?.text, parsedValues.length, reportIdentityLine]);
  const analysisSource = useMemo(() => {
    const pieces: string[] = [];
    if (uploadFeedback) pieces.push(uploadFeedback);
    if (input.trim()) pieces.push('text input');
    if (manualRows.some((row) => row.marker.trim() && row.value.trim())) pieces.push('manual table');
    return pieces.length ? pieces.join(' + ') : 'manual profile only';
  }, [input, manualRows, uploadFeedback]);

  const markerCategory = (marker: string): string => {
    const m = marker.toLowerCase();
    if (/(estradiol|progesterone|lh|fsh|prolactin)/.test(m)) return 'Cycle / Ovarian';
    if (/(tsh|ft3|ft4|t3|t4|thyroid|anti-tpo|anti-tg)/.test(m)) return 'Thyroid';
    if (/(testosterone|shbg|dhea|androstenedione|17-oh)/.test(m)) return 'Androgen / Sexual Health';
    if (/(glucose|insulin|hba1c)/.test(m)) return 'Metabolic';
    if (/(ferritin|vitamin d|b12|cbc)/.test(m)) return 'Nutrient / Reserve';
    return 'Other';
  };

  const reportText = useMemo(() => {
    const identity = reportIdentityLine || 'Private';
    const markersPreview = parsedValues
      .map((item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const reference =
          Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
            ? ` [${item.referenceMin}-${item.referenceMax}]`
            : '';
        return `${item.marker}: ${item.value}${item.unit ? ` ${item.unit}` : ''}${reference} (${status})`;
      })
      .join('\n');
    const summary = analysis?.text || 'Generate report to see personalized interpretation.';
    return [
      'LUNA BALANCE HEALTH REPORT',
      `${medForm.generatedAt}: ${reportGeneratedAt}`,
      `${medForm.patientId}: ${identity}`,
      `${medForm.source}: ${analysisSource}`,
      `Identity: ${identity}`,
      `Cycle day: ${profile.cycleDay || systemState.currentDay}`,
      `Sexual snapshot: ${sexualOverview.avgPositive}/5 | pain ${sexualOverview.pain}/5`,
      '',
      'Markers:',
      markersPreview || 'No markers yet.',
      '',
      'Summary:',
      summary,
      '',
      `${medForm.disclaimerTitle}: ${medForm.disclaimerBody}`,
    ].join('\n');
  }, [analysis?.text, analysisSource, medForm.disclaimerBody, medForm.disclaimerTitle, medForm.generatedAt, medForm.patientId, medForm.source, parsedValues, profile.cycleDay, reportGeneratedAt, reportIdentityLine, sexualOverview.avgPositive, sexualOverview.pain, systemState.currentDay]);

  const reportHtml = useMemo(() => {
    const markerRows = parsedValues
      .map((item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const reference =
          Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
            ? `${item.referenceMin}-${item.referenceMax}`
            : 'n/a';
        const badge =
          status === 'normal'
            ? '#047857'
            : status === 'low'
              ? '#b45309'
              : status === 'high'
                ? '#be123c'
                : '#475569';
        return `<tr>
          <td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${item.marker}</td>
          <td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${item.value}${item.unit ? ` ${item.unit}` : ''}</td>
          <td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${reference}</td>
          <td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\"><span style=\"display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid ${badge};color:${badge};font-weight:700;font-size:11px;text-transform:uppercase;\">${status}</span></td>
          <td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${markerCategory(item.marker)}</td>
        </tr>`;
      })
      .join('');
    const summary = (analysis?.text || 'Generate report to see personalized interpretation.').replace(/</g, '&lt;');
    return `<!doctype html><html><head><meta charset=\"utf-8\"/><title>Luna Report</title></head><body style=\"font-family:Arial,sans-serif;background:#f1f5f9;color:#0f172a;padding:24px;\"><div style=\"max-width:920px;margin:0 auto;background:white;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;\"><div style=\"padding:22px;background:linear-gradient(135deg,#f3e8ff,#ffe4e6,#ccfbf1);border-bottom:2px solid #cbd5e1;\"><div style=\"display:flex;align-items:center;justify-content:space-between;gap:10px;\"><div style=\"display:flex;align-items:center;gap:10px;\"><div style=\"width:44px;height:44px;border-radius:999px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;\">🌙</div><div><h1 style=\"margin:0;font-size:30px;letter-spacing:-0.02em;\">Luna</h1><p style=\"margin:2px 0 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;\">Luna Balance Medical Report</p></div></div><div style=\"text-align:right;\"><p style=\"margin:0;font-size:11px;font-weight:700;\">${medForm.generatedAt}: ${reportGeneratedAt}</p><p style=\"margin:4px 0 0;font-size:11px;\">${medForm.patientId}: ${reportIdentityLine || 'Private'}</p></div></div></div><div style=\"padding:20px 22px;\"><table style=\"width:100%;border-collapse:collapse;font-size:13px;\"><tr><td style=\"padding:8px;border:1px solid #e2e8f0;\"><strong>${medForm.panel}</strong></td><td style=\"padding:8px;border:1px solid #e2e8f0;\">Cycle day ${profile.cycleDay || systemState.currentDay}</td><td style=\"padding:8px;border:1px solid #e2e8f0;\">Sexual score ${sexualOverview.avgPositive}/5 | pain ${sexualOverview.pain}/5</td></tr><tr><td style=\"padding:8px;border:1px solid #e2e8f0;\"><strong>${medForm.source}</strong></td><td colspan=\"2\" style=\"padding:8px;border:1px solid #e2e8f0;\">${analysisSource}</td></tr></table><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${medForm.allMarkers}</h3><table style=\"width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;\"><thead><tr style=\"background:#f8fafc;text-transform:uppercase;font-size:11px;\"><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Marker</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Value</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Reference</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Status</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Category</th></tr></thead><tbody>${markerRows || '<tr><td colspan=\"5\" style=\"padding:8px;\">No markers yet.</td></tr>'}</tbody></table><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${medForm.summary}</h3><p style=\"white-space:pre-wrap;line-height:1.6;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;\">${summary}</p><div style=\"margin-top:18px;border:2px solid #b91c1c;border-radius:10px;padding:12px;background:#fef2f2;\"><p style=\"margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;\">${medForm.disclaimerTitle}</p><p style=\"margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;\">${medForm.disclaimerBody}</p></div></div></div></body></html>`;
  }, [analysis?.text, analysisSource, medForm.allMarkers, medForm.disclaimerBody, medForm.disclaimerTitle, medForm.generatedAt, medForm.panel, medForm.patientId, medForm.source, medForm.summary, parsedValues, profile.cycleDay, reportGeneratedAt, reportIdentityLine, sexualOverview.avgPositive, sexualOverview.pain, systemState.currentDay]);

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
      const fullText = `${extraLine}\n${summary}\n${sexualUi.summaryLabel}: desire/connection score ${sexualOverview.avgPositive}/5, pain ${sexualOverview.pain}/5. ${sexualOverview.state}\n\n${aiResult.text || 'The system could not generate a clear interpretation at this time.'}`;

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

  const openPrintableWindow = (html: string, autoPrint: boolean) => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
    if (!popup) return false;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    if (autoPrint) {
      popup.focus();
      popup.print();
    }
    return true;
  };

  const handleReportCopy = async () => {
    const copied = await copyTextSafely(reportText);
    setReportActionFeedback(copied ? 'Copied' : 'Copy failed');
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportShare = async () => {
    const result = await shareTextSafely(reportText, reportUi.reportTitle);
    setReportActionFeedback(result === 'failed' ? 'Share failed' : result === 'shared' ? 'Shared' : 'Copied');
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPrint = () => {
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? 'Print dialog opened' : 'Print blocked');
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportDownload = () => {
    downloadFile(`luna-report-${Date.now()}.html`, reportHtml, 'text/html;charset=utf-8');
    setReportActionFeedback('Downloaded');
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPdf = () => {
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? 'Use Save as PDF in print dialog' : 'PDF print blocked');
    setTimeout(() => setReportActionFeedback(null), 2400);
  };

  const handleSampleDownload = () => {
    const sampleHtml = `<!doctype html><html><head><meta charset=\"utf-8\"/><title>Luna Sample Report</title></head><body style=\"font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;\"><div style=\"max-width:820px;margin:0 auto;background:white;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;\"><div style=\"padding:24px;background:linear-gradient(135deg,#f3e8ff,#ffe4e6,#ccfbf1);\"><h1 style=\"margin:0;font-size:34px;letter-spacing:-0.02em;\">Luna</h1><p style=\"margin:6px 0 0;font-weight:700;\">${reportUi.sampleTitle}</p><p style=\"margin:4px 0 0;font-size:12px;opacity:0.85;\">${reportUi.reportSubtitle}</p></div><div style=\"padding:24px;\"><p><strong>${reportUi.servicePromise}</strong></p><ul>${reportUi.serviceBullets.map((item) => `<li>${item}</li>`).join('')}</ul><h3>Example Highlights</h3><p>Cycle-aware interpretation, visual hormone blocks, intimacy factors, and doctor-ready guidance.</p></div></div></body></html>`;
    downloadFile('luna-sample-report.html', sampleHtml, 'text/html;charset=utf-8');
    setReportActionFeedback('Sample downloaded');
    setTimeout(() => setReportActionFeedback(null), 2000);
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

      <section className="rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/70 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.46),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(168,85,247,0.18),transparent_40%),linear-gradient(135deg,rgba(242,230,239,0.95),rgba(223,236,248,0.92))] dark:bg-[radial-gradient(circle_at_14%_18%,rgba(20,184,166,0.14),transparent_40%),radial-gradient(circle_at_84%_80%,rgba(124,58,237,0.2),transparent_40%),linear-gradient(135deg,rgba(8,22,47,0.94),rgba(13,34,68,0.92))] p-5 md:p-6 shadow-luna-rich space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{visualGuide.title}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visualGuide.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-white/65 dark:border-white/10 bg-white/70 dark:bg-slate-900/45 p-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200">{card.title}</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <HormoneTestingGuide lang={lang} />

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
              <p className="pt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{sexualUi.intimacySymptomsTitle}</p>
              <div className="flex flex-wrap gap-2">
                {intimacySymptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-luna-coral text-white border-luna-coral' : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-300/70 dark:border-slate-700/70'}`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#f9e5ee]/88 via-[#f0e8f7]/84 to-[#e3edf9]/82 dark:from-[#0a1b38]/95 dark:via-[#102448]/94 dark:to-[#142d56]/93 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">{sexualUi.sexualSnapshotTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                { key: 'libido', label: sexualUi.scoreLabels.libido },
                { key: 'arousal', label: sexualUi.scoreLabels.arousal },
                { key: 'comfort', label: sexualUi.scoreLabels.comfort },
                { key: 'closeness', label: sexualUi.scoreLabels.closeness },
                { key: 'pain', label: sexualUi.scoreLabels.pain },
              ].map((item) => (
                <label key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{sexualScores[item.key as keyof typeof sexualScores]}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sexualScores[item.key as keyof typeof sexualScores]}
                    onChange={(e) => updateSexualScore(item.key as keyof typeof sexualScores, Number(e.target.value))}
                    className="w-full accent-luna-purple"
                  />
                </label>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-slate-50/70 dark:bg-slate-900/55">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{sexualUi.sexualSnapshotLabel}: {sexualOverview.state}</p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">Lab Table</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyTemplate('hormone_core')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Hormone Template</button>
                <button onClick={() => applyTemplate('thyroid')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Thyroid</button>
                <button onClick={() => applyTemplate('metabolic')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">Metabolic</button>
                <button onClick={() => applyTemplate('libido_intimacy')} className="px-3 py-2 rounded-full border border-luna-coral/50 text-luna-coral text-[10px] font-black uppercase tracking-[0.15em]">{sexualUi.libidoTemplate}</button>
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

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#f3e5f4]/95 via-[#eee8fb]/92 to-[#e3edf9]/90 dark:from-[#0d1f3f]/95 dark:via-[#132a50]/93 dark:to-[#17345f]/92 p-6 shadow-luna-rich space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/Luna%20logo3.png" alt="Luna symbol" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportUi.reportTitle}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportUi.reportSubtitle}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/65 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Logo size="sm" className="text-3xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{profile.cycleDay || systemState.currentDay} day</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{reportIdentityLine || reportUi.reportSubtitle}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed line-clamp-4">{analysis?.text || reportUi.sampleBody}</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <button onClick={handleReportCopy} className="px-2 py-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">{reportUi.copy}</button>
              <button onClick={handleReportPrint} className="px-2 py-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">{reportUi.print}</button>
              <button onClick={handleReportShare} className="px-2 py-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">{reportUi.share}</button>
              <button onClick={handleReportDownload} className="px-2 py-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">{reportUi.download}</button>
              <button onClick={handleReportPdf} className="px-2 py-2 rounded-lg border border-luna-purple/35 bg-luna-purple/10 text-[10px] font-black uppercase tracking-[0.08em] text-luna-purple">{reportUi.pdf}</button>
              <button onClick={handleSampleDownload} className="px-2 py-2 rounded-lg border border-luna-coral/40 bg-luna-coral/10 text-[10px] font-black uppercase tracking-[0.08em] text-luna-coral">{reportUi.sampleDownload}</button>
            </div>
            {reportActionFeedback && <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{reportActionFeedback}</p>}
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#0f2344]/80 p-6 shadow-luna-rich space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportUi.sampleTitle}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{reportUi.sampleBody}</p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{reportUi.servicePromise}</p>
            <div className="space-y-1">
              {reportUi.serviceBullets.map((item) => (
                <p key={item} className="text-xs font-semibold text-slate-600 dark:text-slate-300">• {item}</p>
              ))}
            </div>
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

          {libidoHormoneSignals.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fde9ef]/90 via-[#f4e8f7]/86 to-[#e8f0fb]/84 dark:from-[#10243f]/94 dark:via-[#173053]/93 dark:to-[#1a3b60]/92 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{sexualUi.intimacyFactors}</p>
              <div className="space-y-2">
                {libidoHormoneSignals.slice(0, 6).map((signal, idx) => (
                  <div key={`${signal.marker}-${idx}`} className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 px-3 py-2 bg-slate-50/70 dark:bg-slate-900/45">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{signal.marker}</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${statusColor(signal.status)}`}>{signal.status}</span>
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
