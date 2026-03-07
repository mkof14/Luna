import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  detectLabValueConflicts,
  extractTextFromLabFile,
  HealthLabRow,
  LabValueConflict,
  mergeParsedLabValues,
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
      { title: '3. Действие', body: 'Используйте вопросы врачу и резюме на консультации.' },
    ],
  },
  uk: {
    title: 'Візуальний Маршрут',
    cards: [
      { title: '1. Збір', body: 'Заповніть профіль + симптоми + маркери.' },
      { title: '2. Порівняння', body: 'Зіставте значення з референсами та фазою циклу.' },
      { title: '3. Дія', body: 'Використайте питання до лікаря та підсумок на консультації.' },
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
      { title: '3. Handeln', body: 'Arztfragen und Zusammenfassung im Termin nutzen.' },
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
    reportSubtitle: 'Визуальное резюме для разговора с врачом.',
    copy: 'Копировать',
    print: 'Печать',
    share: 'Поделиться',
    download: 'Скачать',
    pdf: 'PDF',
    sampleTitle: 'Пример Отчета',
    sampleBody: 'Скачайте образец формата отчета, который вы получаете как сервис.',
    sampleDownload: 'Скачать Образец',
    servicePromise: 'Это то, что вы будете получать как сервис:',
    serviceBullets: ['Фирменный визуальный отчет в стиле Luna.', 'Интерпретация гормонов с учетом фазы цикла.', 'Готовое резюме и вопросы для врача.', 'Копирование, печать, отправка, скачивание и PDF-формат.'],
  },
  uk: {
    reportTitle: 'Брендований Звіт Luna',
    reportSubtitle: 'Візуальний підсумок для розмови з лікарем.',
    copy: 'Копіювати',
    print: 'Друк',
    share: 'Поділитися',
    download: 'Завантажити',
    pdf: 'PDF',
    sampleTitle: 'Приклад Звіту',
    sampleBody: 'Завантажте приклад формату звіту, який ви отримаєте як сервіс.',
    sampleDownload: 'Завантажити Приклад',
    servicePromise: 'Це те, що ви матимете як сервіс:',
    serviceBullets: ['Фірмовий візуальний звіт у стилі Luna.', 'Інтерпретація гормонів з урахуванням фази циклу.', 'Готовий підсумок і питання до лікаря.', 'Копіювання, друк, поширення, завантаження та PDF-формат.'],
  },
  es: {
    reportTitle: 'Reporte De Marca Luna',
    reportSubtitle: 'Resumen visual para conversación médica.',
    copy: 'Copiar',
    print: 'Imprimir',
    share: 'Compartir',
    download: 'Descargar',
    pdf: 'PDF',
    sampleTitle: 'Reporte De Ejemplo',
    sampleBody: 'Descarga un ejemplo del formato de reporte que tendrás como servicio.',
    sampleDownload: 'Descargar Ejemplo',
    servicePromise: 'Esto es lo que tendrás como servicio:',
    serviceBullets: ['Reporte visual con estilo Luna.', 'Interpretación hormonal con fase del ciclo.', 'Resumen y preguntas listos para tu médico.', 'Copiar, imprimir, compartir, descargar y salida compatible con PDF.'],
  },
  fr: {
    reportTitle: 'Rapport De Marque Luna',
    reportSubtitle: 'Résumé visuel pour votre consultation.',
    copy: 'Copier',
    print: 'Imprimer',
    share: 'Partager',
    download: 'Télécharger',
    pdf: 'PDF',
    sampleTitle: 'Exemple De Rapport',
    sampleBody: 'Téléchargez un exemple du format de rapport proposé en service.',
    sampleDownload: 'Télécharger Exemple',
    servicePromise: 'Voici ce que vous aurez en service:',
    serviceBullets: ['Rapport visuel avec identité Luna.', 'Interprétation hormonale selon la phase du cycle.', 'Résumé et questions prêts pour le médecin.', 'Copier, imprimer, partager, télécharger et sortie compatible PDF.'],
  },
  de: {
    reportTitle: 'Luna Markenbericht',
    reportSubtitle: 'Visuelle Zusammenfassung für das Arztgespräch.',
    copy: 'Kopieren',
    print: 'Drucken',
    share: 'Teilen',
    download: 'Herunterladen',
    pdf: 'PDF',
    sampleTitle: 'Beispielbericht',
    sampleBody: 'Lade ein Beispiel des Report-Formats herunter, das du als Service erhältst.',
    sampleDownload: 'Beispiel Laden',
    servicePromise: 'Das erhalten Sie als Service:',
    serviceBullets: ['Visueller Bericht im Luna-Stil.', 'Hormon-Interpretation nach Zyklusphase.', 'Arztfertige Zusammenfassung mit Fragen.', 'Kopieren, drucken, teilen, herunterladen und PDF-freundliche Ausgabe.'],
  },
  zh: {
    reportTitle: 'Luna 品牌报告',
    reportSubtitle: '用于就医沟通的可视化总结。',
    copy: '复制',
    print: '打印',
    share: '分享',
    download: '下载',
    pdf: 'PDF',
    sampleTitle: '示例报告',
    sampleBody: '下载示例，查看你将获得的服务报告格式。',
    sampleDownload: '下载示例',
    servicePromise: '你将获得以下服务能力：',
    serviceBullets: ['Luna 品牌化视觉报告。', '结合周期阶段的激素解读。', '可直接给医生使用的总结与问题。', '支持复制、打印、分享、下载与 PDF。'],
  },
  ja: {
    reportTitle: 'Luna ブランドレポート',
    reportSubtitle: '医師との対話に使えるビジュアル要約。',
    copy: 'コピー',
    print: '印刷',
    share: '共有',
    download: 'ダウンロード',
    pdf: 'PDF',
    sampleTitle: 'サンプルレポート',
    sampleBody: 'サービスで受け取るレポート形式のサンプルをダウンロード。',
    sampleDownload: 'サンプルを取得',
    servicePromise: 'このサービスで得られる内容:',
    serviceBullets: ['Lunaスタイルのブランドレポート。', '周期フェーズ連動のホルモン解釈。', '医師向け要約と質問を自動作成。', 'コピー / 印刷 / 共有 / ダウンロード / PDF 対応。'],
  },
  pt: {
    reportTitle: 'Relatório De Marca Luna',
    reportSubtitle: 'Resumo visual para conversa com seu médico.',
    copy: 'Copiar',
    print: 'Imprimir',
    share: 'Compartilhar',
    download: 'Baixar',
    pdf: 'PDF',
    sampleTitle: 'Relatório Exemplo',
    sampleBody: 'Baixe um exemplo do formato de relatório que você terá como serviço.',
    sampleDownload: 'Baixar Exemplo',
    servicePromise: 'Isto é o que você terá como serviço:',
    serviceBullets: ['Relatório visual com identidade Luna.', 'Interpretação hormonal por fase do ciclo.', 'Resumo e perguntas prontos para consulta.', 'Copiar, imprimir, compartilhar, baixar e saída compatível com PDF.'],
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
    summary: 'Клиническое Резюме',
    disclaimerTitle: 'МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР',
    disclaimerBody: 'ЭТОТ ОТЧЕТ НОСИТ ИНФОРМАЦИОННЫЙ ХАРАКТЕР И НЕ ЗАМЕНЯЕТ МЕДИЦИНСКУЮ ДИАГНОСТИКУ И ЛЕЧЕНИЕ. ПРИ НЕОБХОДИМОСТИ ОБРАТИТЕСЬ К ЛИЦЕНЗИРОВАННОМУ ВРАЧУ.',
  },
  uk: {
    generatedAt: 'Дата Генерації',
    patientId: 'ID Користувача',
    source: 'Джерело Аналізу',
    panel: 'Клінічна Панель',
    allMarkers: 'Усі Лаб Показники',
    summary: 'Клінічний Підсумок',
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

const reportLanguageUiByLang: Partial<Record<Language, { label: string; hint: string }>> = {
  en: { label: 'Report Language', hint: 'Generated files use this language.' },
  ru: { label: 'Язык Отчета', hint: 'Сгенерированные файлы будут на этом языке.' },
  uk: { label: 'Мова Звіту', hint: 'Згенеровані файли будуть цією мовою.' },
  es: { label: 'Idioma Del Reporte', hint: 'Los archivos se generan en este idioma.' },
  fr: { label: 'Langue Du Rapport', hint: 'Les fichiers seront générés dans cette langue.' },
  de: { label: 'Berichtssprache', hint: 'Exportdateien werden in dieser Sprache erstellt.' },
  zh: { label: '报告语言', hint: '导出文件将使用该语言。' },
  ja: { label: 'レポート言語', hint: '生成ファイルはこの言語で作成されます。' },
  pt: { label: 'Idioma Do Relatório', hint: 'Os arquivos serão gerados neste idioma.' },
};

const reportLanguageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  pt: 'Português',
};

const localeByLang: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  pt: 'pt-PT',
};

const reportSourceByLang: Partial<Record<Language, { textInput: string; manualTable: string; profileOnly: string }>> = {
  en: { textInput: 'text input', manualTable: 'manual table', profileOnly: 'manual profile only' },
  ru: { textInput: 'текстовый ввод', manualTable: 'ручная таблица', profileOnly: 'только профиль' },
  uk: { textInput: 'текстове введення', manualTable: 'ручна таблиця', profileOnly: 'лише профіль' },
  es: { textInput: 'entrada de texto', manualTable: 'tabla manual', profileOnly: 'solo perfil manual' },
  fr: { textInput: 'saisie texte', manualTable: 'tableau manuel', profileOnly: 'profil uniquement' },
  de: { textInput: 'Texteingabe', manualTable: 'manuelle Tabelle', profileOnly: 'nur Profil' },
  zh: { textInput: '文本输入', manualTable: '手动表格', profileOnly: '仅个人资料' },
  ja: { textInput: 'テキスト入力', manualTable: '手動テーブル', profileOnly: 'プロフィールのみ' },
  pt: { textInput: 'entrada de texto', manualTable: 'tabela manual', profileOnly: 'somente perfil' },
};

const markerCategoryByLang: Partial<Record<Language, {
  cycle: string;
  thyroid: string;
  sexual: string;
  metabolic: string;
  nutrient: string;
  other: string;
}>> = {
  en: { cycle: 'Cycle / Ovarian', thyroid: 'Thyroid', sexual: 'Androgen / Sexual Health', metabolic: 'Metabolic', nutrient: 'Nutrient / Reserve', other: 'Other' },
  ru: { cycle: 'Цикл / Яичники', thyroid: 'Щитовидка', sexual: 'Андрогены / Сексуальное здоровье', metabolic: 'Метаболизм', nutrient: 'Дефициты / Резерв', other: 'Другое' },
  uk: { cycle: 'Цикл / Яєчники', thyroid: 'Щитоподібна', sexual: 'Андрогени / Сексуальне здоровʼя', metabolic: 'Метаболізм', nutrient: 'Дефіцити / Резерв', other: 'Інше' },
  es: { cycle: 'Ciclo / Ovario', thyroid: 'Tiroides', sexual: 'Andrógenos / Salud Sexual', metabolic: 'Metabólico', nutrient: 'Nutrientes / Reserva', other: 'Otro' },
  fr: { cycle: 'Cycle / Ovarien', thyroid: 'Thyroïde', sexual: 'Androgènes / Santé Sexuelle', metabolic: 'Métabolique', nutrient: 'Nutriments / Réserve', other: 'Autre' },
  de: { cycle: 'Zyklus / Ovar', thyroid: 'Schilddrüse', sexual: 'Androgen / Sexualgesundheit', metabolic: 'Metabolisch', nutrient: 'Nährstoff / Reserve', other: 'Sonstiges' },
  zh: { cycle: '周期 / 卵巢', thyroid: '甲状腺', sexual: '雄激素 / 性健康', metabolic: '代谢', nutrient: '营养 / 储备', other: '其他' },
  ja: { cycle: '周期 / 卵巣', thyroid: '甲状腺', sexual: 'アンドロゲン / 性健康', metabolic: '代謝', nutrient: '栄養 / 予備', other: 'その他' },
  pt: { cycle: 'Ciclo / Ovário', thyroid: 'Tireoide', sexual: 'Andrógenos / Saúde Sexual', metabolic: 'Metabólico', nutrient: 'Nutrientes / Reserva', other: 'Outro' },
};

const reportActionsByLang: Partial<Record<Language, {
  copied: string;
  copyFailed: string;
  shared: string;
  shareFailed: string;
  printOpened: string;
  printBlocked: string;
  downloaded: string;
  pdfHint: string;
  pdfBlocked: string;
  sampleDownloaded: string;
}>> = {
  en: { copied: 'Copied', copyFailed: 'Copy failed', shared: 'Shared', shareFailed: 'Share failed', printOpened: 'Print dialog opened', printBlocked: 'Print blocked', downloaded: 'Downloaded', pdfHint: 'Use Save as PDF in print dialog', pdfBlocked: 'PDF print blocked', sampleDownloaded: 'Sample downloaded' },
  ru: { copied: 'Скопировано', copyFailed: 'Не удалось скопировать', shared: 'Отправлено', shareFailed: 'Ошибка отправки', printOpened: 'Окно печати открыто', printBlocked: 'Печать заблокирована', downloaded: 'Скачано', pdfHint: 'Сохраните как PDF в окне печати', pdfBlocked: 'PDF-печать заблокирована', sampleDownloaded: 'Образец скачан' },
  uk: { copied: 'Скопійовано', copyFailed: 'Не вдалося скопіювати', shared: 'Надіслано', shareFailed: 'Помилка надсилання', printOpened: 'Відкрито вікно друку', printBlocked: 'Друк заблоковано', downloaded: 'Завантажено', pdfHint: 'Збережіть як PDF у вікні друку', pdfBlocked: 'PDF-друк заблоковано', sampleDownloaded: 'Приклад завантажено' },
  es: { copied: 'Copiado', copyFailed: 'Error al copiar', shared: 'Compartido', shareFailed: 'Error al compartir', printOpened: 'Diálogo de impresión abierto', printBlocked: 'Impresión bloqueada', downloaded: 'Descargado', pdfHint: 'Usa Guardar como PDF en impresión', pdfBlocked: 'PDF bloqueado', sampleDownloaded: 'Ejemplo descargado' },
  fr: { copied: 'Copié', copyFailed: 'Échec de copie', shared: 'Partagé', shareFailed: 'Échec du partage', printOpened: 'Fenêtre d’impression ouverte', printBlocked: 'Impression bloquée', downloaded: 'Téléchargé', pdfHint: 'Utilisez Enregistrer en PDF', pdfBlocked: 'PDF bloqué', sampleDownloaded: 'Exemple téléchargé' },
  de: { copied: 'Kopiert', copyFailed: 'Kopieren fehlgeschlagen', shared: 'Geteilt', shareFailed: 'Teilen fehlgeschlagen', printOpened: 'Druckdialog geöffnet', printBlocked: 'Drucken blockiert', downloaded: 'Heruntergeladen', pdfHint: 'Im Druckdialog als PDF speichern', pdfBlocked: 'PDF blockiert', sampleDownloaded: 'Beispiel heruntergeladen' },
  zh: { copied: '已复制', copyFailed: '复制失败', shared: '已分享', shareFailed: '分享失败', printOpened: '已打开打印窗口', printBlocked: '打印被阻止', downloaded: '已下载', pdfHint: '请在打印窗口中保存为 PDF', pdfBlocked: 'PDF 打印被阻止', sampleDownloaded: '示例已下载' },
  ja: { copied: 'コピーしました', copyFailed: 'コピー失敗', shared: '共有しました', shareFailed: '共有失敗', printOpened: '印刷ダイアログを開きました', printBlocked: '印刷がブロックされました', downloaded: 'ダウンロードしました', pdfHint: '印刷画面で PDF 保存してください', pdfBlocked: 'PDF 印刷がブロックされました', sampleDownloaded: 'サンプルをダウンロードしました' },
  pt: { copied: 'Copiado', copyFailed: 'Falha ao copiar', shared: 'Compartilhado', shareFailed: 'Falha ao compartilhar', printOpened: 'Janela de impressão aberta', printBlocked: 'Impressão bloqueada', downloaded: 'Baixado', pdfHint: 'Use Salvar como PDF na impressão', pdfBlocked: 'PDF bloqueado', sampleDownloaded: 'Exemplo baixado' },
};

const reportConflictsByLang: Partial<Record<Language, {
  title: string;
  hint: string;
  choose: string;
  confidence: string;
  source: string;
  manual: string;
  text: string;
  ocr: string;
  pdf: string;
}>> = {
  en: { title: 'Data Conflicts', hint: 'Multiple values found for the same marker. Choose which value goes into the final report.', choose: 'Use for report', confidence: 'Confidence', source: 'Source', manual: 'Manual', text: 'Text', ocr: 'OCR scan', pdf: 'PDF scan' },
  ru: { title: 'Конфликты Данных', hint: 'Для одного маркера найдено несколько значений. Выберите, какое пойдет в итоговый отчет.', choose: 'В отчет', confidence: 'Надежность', source: 'Источник', manual: 'Ручной ввод', text: 'Текст', ocr: 'OCR-скан', pdf: 'PDF-скан' },
  uk: { title: 'Конфлікти Даних', hint: 'Для одного маркера знайдено кілька значень. Оберіть, яке піде у фінальний звіт.', choose: 'У звіт', confidence: 'Надійність', source: 'Джерело', manual: 'Ручне введення', text: 'Текст', ocr: 'OCR-скан', pdf: 'PDF-скан' },
  es: { title: 'Conflictos De Datos', hint: 'Se encontraron varios valores para el mismo marcador. Elige cuál usar en el reporte final.', choose: 'Usar en reporte', confidence: 'Confianza', source: 'Fuente', manual: 'Manual', text: 'Texto', ocr: 'Escaneo OCR', pdf: 'Escaneo PDF' },
  fr: { title: 'Conflits De Données', hint: 'Plusieurs valeurs détectées pour le même marqueur. Choisissez celle à utiliser dans le rapport final.', choose: 'Utiliser', confidence: 'Confiance', source: 'Source', manual: 'Saisie manuelle', text: 'Texte', ocr: 'Scan OCR', pdf: 'Scan PDF' },
  de: { title: 'Datenkonflikte', hint: 'Mehrere Werte für denselben Marker gefunden. Wählen Sie den Wert für den finalen Bericht.', choose: 'Für Bericht nutzen', confidence: 'Sicherheit', source: 'Quelle', manual: 'Manuell', text: 'Text', ocr: 'OCR-Scan', pdf: 'PDF-Scan' },
  zh: { title: '数据冲突', hint: '同一指标检测到多个数值。请选择用于最终报告的数值。', choose: '用于报告', confidence: '置信度', source: '来源', manual: '手动输入', text: '文本', ocr: 'OCR 扫描', pdf: 'PDF 扫描' },
  ja: { title: 'データ競合', hint: '同じマーカーに複数の値があります。最終レポートに使う値を選択してください。', choose: 'レポートに使用', confidence: '信頼度', source: 'ソース', manual: '手入力', text: 'テキスト', ocr: 'OCRスキャン', pdf: 'PDFスキャン' },
  pt: { title: 'Conflitos De Dados', hint: 'Foram encontrados vários valores para o mesmo marcador. Escolha qual usar no relatório final.', choose: 'Usar no relatório', confidence: 'Confiabilidade', source: 'Fonte', manual: 'Manual', text: 'Texto', ocr: 'Scan OCR', pdf: 'Scan PDF' },
};

const reportsUiByLang: Partial<Record<Language, {
  badge: string;
  title: string;
  titleAccent: string;
  workflow: string;
  identityTitle: string;
  includeId: string;
  includeName: string;
  userIdOverride: string;
  current: string;
  privateIdentity: string;
  profileTitle: string;
  goals: string;
  symptomsQuick: string;
  labTable: string;
  marker?: string;
  value?: string;
  unit?: string;
  reference?: string;
  date?: string;
  note?: string;
  delete?: string;
  addRow: string;
  uploadTitle: string;
  uploadFile: string;
  uploadPlaceholder: string;
  readyExtraction: string;
  generate: string;
  reading: string;
  quickOverview: string;
  withinRange: string;
  outOfRange: string;
  hormoneInfographic: string;
  unlockInfographic: string;
  day: string;
  hormoneSignals: string;
  questionsDoctor: string;
  detectedMarkers: string;
  refShort: string;
  status: string;
  na: string;
  summaryTitle: string;
  copyDoctor: string;
  reportReadyTitle: string;
  reportReadyBody: string;
  safetyTitle: string;
  safetyBody: string;
  unsupportedFormat: string;
  extractFailed: string;
  aiScan: string;
}>> = {
  en: { badge: 'My Health Reports', title: 'Reports', titleAccent: 'That Explain', workflow: 'Simple workflow: choose report identity, fill your markers, upload image/text, and get a clear hormone-focused summary.', identityTitle: 'Report Identity', includeId: 'Include ID in report', includeName: 'Include Name in report', userIdOverride: 'User ID (optional override)', current: 'Current', privateIdentity: 'Private (no name/ID in summary)', profileTitle: 'Personal Health Profile', goals: 'Goals / Symptoms Priority', symptomsQuick: 'Today symptoms (quick select)', labTable: 'Lab Table', addRow: 'Add Row', uploadTitle: 'Upload scan/text', uploadFile: 'Upload File', uploadPlaceholder: 'Paste report text here or upload an image/text/PDF file...', readyExtraction: 'Ready for extraction', generate: 'Generate Report', reading: 'Reading...', quickOverview: 'Quick Overview', withinRange: 'Within range', outOfRange: 'Out of range', hormoneInfographic: 'Hormone Infographic', unlockInfographic: 'Add markers to unlock infographic.', day: 'day', hormoneSignals: 'Hormone Signals', questionsDoctor: 'Questions for Doctor', detectedMarkers: 'Detected Markers', refShort: 'Ref', status: 'Status', na: 'n/a', summaryTitle: 'Clinical-Friendly Summary', copyDoctor: 'Copy for doctor', reportReadyTitle: 'Report ready zone', reportReadyBody: 'Choose identity, fill profile + table, then Generate Report.', safetyTitle: 'Safety note', safetyBody: 'Luna provides educational interpretation only. Final diagnosis and treatment decisions require a licensed clinician.', unsupportedFormat: 'Unsupported format. Use text, image, or PDF files.', extractFailed: 'Could not extract text from file.', aiScan: 'AI scan' },
  ru: { badge: 'My Health Reports', title: 'Отчеты', titleAccent: 'С Пояснением', workflow: 'Простой процесс: выберите идентификацию отчета, заполните маркеры, загрузите фото/текст и получите понятное гормональное резюме.', identityTitle: 'Идентификация Отчета', includeId: 'Включить ID в отчет', includeName: 'Включить имя в отчет', userIdOverride: 'ID пользователя (опционально)', current: 'Текущее', privateIdentity: 'Приватно (без имени/ID в резюме)', profileTitle: 'Персональный Профиль Здоровья', goals: 'Цели / Приоритет симптомов', symptomsQuick: 'Симптомы сегодня (быстрый выбор)', labTable: 'Таблица Анализов', addRow: 'Добавить Строку', uploadTitle: 'Загрузка скана/текста', uploadFile: 'Загрузить Файл', uploadPlaceholder: 'Вставьте текст отчета или загрузите файл изображения/текста/PDF...', readyExtraction: 'Готово к распознаванию', generate: 'Сгенерировать Отчет', reading: 'Чтение...', quickOverview: 'Быстрый Обзор', withinRange: 'В норме', outOfRange: 'Вне нормы', hormoneInfographic: 'Гормональная Инфографика', unlockInfographic: 'Добавьте маркеры, чтобы открыть инфографику.', day: 'день', hormoneSignals: 'Гормональные Сигналы', questionsDoctor: 'Вопросы Врачу', detectedMarkers: 'Обнаруженные Маркеры', refShort: 'Реф.', status: 'Статус', na: 'н/д', summaryTitle: 'Клинически Понятное Резюме', copyDoctor: 'Скопировать для врача', reportReadyTitle: 'Зона готовности отчета', reportReadyBody: 'Выберите идентификацию, заполните профиль и таблицу, затем сгенерируйте отчет.', safetyTitle: 'Важное примечание', safetyBody: 'Luna дает образовательную интерпретацию. Окончательный диагноз и лечение определяет лицензированный врач.', unsupportedFormat: 'Неподдерживаемый формат. Используйте текст, изображение или PDF.', extractFailed: 'Не удалось извлечь текст из файла.', aiScan: 'AI-скан' },
  uk: { badge: 'My Health Reports', title: 'Звіти', titleAccent: 'З Поясненням', workflow: 'Простий процес: оберіть ідентифікацію звіту, заповніть маркери, завантажте фото/текст і отримайте зрозумілий гормональний підсумок.', identityTitle: 'Ідентифікація Звіту', includeId: 'Додати ID у звіт', includeName: 'Додати імʼя у звіт', userIdOverride: 'ID користувача (опціонально)', current: 'Поточне', privateIdentity: 'Приватно (без імені/ID у підсумку)', profileTitle: 'Персональний Профіль Здоровʼя', goals: 'Цілі / Пріоритет симптомів', symptomsQuick: 'Симптоми сьогодні (швидкий вибір)', labTable: 'Таблиця Аналізів', addRow: 'Додати Рядок', uploadTitle: 'Завантаження скану/тексту', uploadFile: 'Завантажити Файл', uploadPlaceholder: 'Вставте текст звіту або завантажте файл зображення/тексту/PDF...', readyExtraction: 'Готово до розпізнавання', generate: 'Згенерувати Звіт', reading: 'Зчитування...', quickOverview: 'Швидкий Огляд', withinRange: 'У нормі', outOfRange: 'Поза нормою', hormoneInfographic: 'Гормональна Інфографіка', unlockInfographic: 'Додайте маркери, щоб відкрити інфографіку.', day: 'день', hormoneSignals: 'Гормональні Сигнали', questionsDoctor: 'Питання До Лікаря', detectedMarkers: 'Виявлені Маркери', refShort: 'Реф.', status: 'Статус', na: 'н/д', summaryTitle: 'Клінічно Зрозумілий Підсумок', copyDoctor: 'Скопіювати для лікаря', reportReadyTitle: 'Зона готовності звіту', reportReadyBody: 'Оберіть ідентифікацію, заповніть профіль і таблицю, потім згенеруйте звіт.', safetyTitle: 'Важлива примітка', safetyBody: 'Luna надає освітню інтерпретацію. Остаточний діагноз і лікування визначає ліцензований лікар.', unsupportedFormat: 'Непідтримуваний формат. Використовуйте текст, зображення або PDF.', extractFailed: 'Не вдалося зчитати текст із файлу.', aiScan: 'AI-скан' },
  es: { badge: 'My Health Reports', title: 'Reportes', titleAccent: 'Que Explican', workflow: 'Flujo simple: elige identidad del reporte, completa marcadores, sube imagen/texto y obtén un resumen hormonal claro.', identityTitle: 'Identidad Del Reporte', includeId: 'Incluir ID en el reporte', includeName: 'Incluir nombre en el reporte', userIdOverride: 'ID de usuario (opcional)', current: 'Actual', privateIdentity: 'Privado (sin nombre/ID en el resumen)', profileTitle: 'Perfil Personal De Salud', goals: 'Objetivos / Prioridad de síntomas', symptomsQuick: 'Síntomas de hoy (selección rápida)', labTable: 'Tabla De Laboratorio', addRow: 'Agregar Fila', uploadTitle: 'Subir escaneo/texto', uploadFile: 'Subir Archivo', uploadPlaceholder: 'Pega texto del reporte o sube un archivo de imagen/texto/PDF...', readyExtraction: 'Listo para extracción', generate: 'Generar Reporte', reading: 'Leyendo...', quickOverview: 'Resumen Rápido', withinRange: 'En rango', outOfRange: 'Fuera de rango', hormoneInfographic: 'Infografía Hormonal', unlockInfographic: 'Agrega marcadores para activar la infografía.', day: 'día', hormoneSignals: 'Señales Hormonales', questionsDoctor: 'Preguntas Para El Médico', detectedMarkers: 'Marcadores Detectados', refShort: 'Ref', status: 'Estado', na: 'n/d', summaryTitle: 'Resumen Clínico Claro', copyDoctor: 'Copiar para el médico', reportReadyTitle: 'Zona lista para reporte', reportReadyBody: 'Elige identidad, completa perfil + tabla y luego genera el reporte.', safetyTitle: 'Nota de seguridad', safetyBody: 'Luna ofrece interpretación educativa. El diagnóstico y tratamiento final requiere personal médico licenciado.', unsupportedFormat: 'Formato no compatible. Usa archivos de texto, imagen o PDF.', extractFailed: 'No se pudo extraer texto del archivo.', aiScan: 'escaneo AI' },
  fr: { badge: 'My Health Reports', title: 'Rapports', titleAccent: 'Qui Expliquent', workflow: 'Flux simple: choisissez l identité, remplissez les marqueurs, chargez image/texte et obtenez un résumé hormonal clair.', identityTitle: 'Identité Du Rapport', includeId: 'Inclure ID dans le rapport', includeName: 'Inclure le nom dans le rapport', userIdOverride: 'ID utilisateur (optionnel)', current: 'Actuel', privateIdentity: 'Privé (sans nom/ID dans le résumé)', profileTitle: 'Profil Personnel De Santé', goals: 'Objectifs / Priorité des symptômes', symptomsQuick: 'Symptômes du jour (sélection rapide)', labTable: 'Tableau De Laboratoire', addRow: 'Ajouter Ligne', uploadTitle: 'Téléverser scan/texte', uploadFile: 'Téléverser Fichier', uploadPlaceholder: 'Collez le texte du rapport ou téléversez un fichier image/texte/PDF...', readyExtraction: 'Prêt pour extraction', generate: 'Générer Rapport', reading: 'Lecture...', quickOverview: 'Aperçu Rapide', withinRange: 'Dans la norme', outOfRange: 'Hors norme', hormoneInfographic: 'Infographie Hormonale', unlockInfographic: 'Ajoutez des marqueurs pour activer l infographie.', day: 'jour', hormoneSignals: 'Signaux Hormonaux', questionsDoctor: 'Questions Pour Le Médecin', detectedMarkers: 'Marqueurs Détectés', refShort: 'Réf', status: 'Statut', na: 'n/d', summaryTitle: 'Résumé Clinique Lisible', copyDoctor: 'Copier pour le médecin', reportReadyTitle: 'Zone de rapport prête', reportReadyBody: 'Choisissez l identité, complétez profil + tableau, puis générez le rapport.', safetyTitle: 'Note de sécurité', safetyBody: 'Luna fournit une interprétation éducative. Le diagnostic et le traitement final nécessitent un médecin agréé.', unsupportedFormat: 'Format non pris en charge. Utilisez un fichier texte, image ou PDF.', extractFailed: 'Impossible d extraire le texte du fichier.', aiScan: 'scan AI' },
  de: { badge: 'My Health Reports', title: 'Berichte', titleAccent: 'Die Erklären', workflow: 'Einfacher Ablauf: Berichtsidentität wählen, Marker ausfüllen, Bild/Text hochladen und klare hormonfokussierte Zusammenfassung erhalten.', identityTitle: 'Berichtsidentität', includeId: 'ID im Bericht anzeigen', includeName: 'Name im Bericht anzeigen', userIdOverride: 'Benutzer-ID (optional)', current: 'Aktuell', privateIdentity: 'Privat (kein Name/ID in der Zusammenfassung)', profileTitle: 'Persönliches Gesundheitsprofil', goals: 'Ziele / Symptom-Priorität', symptomsQuick: 'Heutige Symptome (Schnellauswahl)', labTable: 'Labortabelle', addRow: 'Zeile Hinzufügen', uploadTitle: 'Scan/Text hochladen', uploadFile: 'Datei Hochladen', uploadPlaceholder: 'Berichtstext einfügen oder Bild/Text/PDF-Datei hochladen...', readyExtraction: 'Bereit für Extraktion', generate: 'Bericht Erstellen', reading: 'Lese...', quickOverview: 'Schnellübersicht', withinRange: 'Im Bereich', outOfRange: 'Außerhalb', hormoneInfographic: 'Hormon-Infografik', unlockInfographic: 'Marker hinzufügen, um die Infografik freizuschalten.', day: 'Tag', hormoneSignals: 'Hormonsignale', questionsDoctor: 'Fragen Für Den Arzt', detectedMarkers: 'Erkannte Marker', refShort: 'Ref', status: 'Status', na: 'k.A.', summaryTitle: 'Klinisch Verständliche Zusammenfassung', copyDoctor: 'Für Arzt kopieren', reportReadyTitle: 'Bericht bereit', reportReadyBody: 'Identität wählen, Profil + Tabelle ausfüllen und dann Bericht erzeugen.', safetyTitle: 'Sicherheitshinweis', safetyBody: 'Luna bietet eine edukative Interpretation. Endgültige Diagnose und Therapie erfordern medizinisches Fachpersonal.', unsupportedFormat: 'Nicht unterstütztes Format. Bitte Text-, Bild- oder PDF-Datei verwenden.', extractFailed: 'Text konnte aus der Datei nicht extrahiert werden.', aiScan: 'AI-Scan' },
  zh: { badge: 'My Health Reports', title: '报告', titleAccent: '可解释', workflow: '简单流程：选择报告身份、填写指标、上传图片/文本，获得清晰的激素重点总结。', identityTitle: '报告身份', includeId: '在报告中包含ID', includeName: '在报告中包含姓名', userIdOverride: '用户ID（可选）', current: '当前', privateIdentity: '私密（摘要中不含姓名/ID）', profileTitle: '个人健康档案', goals: '目标 / 症状优先级', symptomsQuick: '今日症状（快速选择）', labTable: '化验表', addRow: '添加行', uploadTitle: '上传扫描/文本', uploadFile: '上传文件', uploadPlaceholder: '粘贴报告文本或上传图片/文本/PDF文件...', readyExtraction: '可开始提取', generate: '生成报告', reading: '读取中...', quickOverview: '快速概览', withinRange: '范围内', outOfRange: '超出范围', hormoneInfographic: '激素信息图', unlockInfographic: '添加指标以解锁信息图。', day: '天', hormoneSignals: '激素信号', questionsDoctor: '给医生的问题', detectedMarkers: '已识别指标', refShort: '参考', status: '状态', na: '无', summaryTitle: '临床友好总结', copyDoctor: '复制给医生', reportReadyTitle: '报告准备区', reportReadyBody: '先选择身份，填写档案和表格，再生成报告。', safetyTitle: '安全说明', safetyBody: 'Luna 仅提供教育性解读。最终诊断与治疗需由持证医生完成。', unsupportedFormat: '不支持该格式。请使用文本、图片或 PDF 文件。', extractFailed: '无法从文件中提取文本。', aiScan: 'AI 扫描' },
  ja: { badge: 'My Health Reports', title: 'レポート', titleAccent: 'を明確化', workflow: 'シンプルな流れ: レポート識別を選択し、マーカーを入力、画像/テキストをアップロードして、ホルモン重視の明確な要約を取得。', identityTitle: 'レポート識別', includeId: 'レポートにIDを含める', includeName: 'レポートに名前を含める', userIdOverride: 'ユーザーID（任意）', current: '現在', privateIdentity: '非公開（要約に名前/IDなし）', profileTitle: '個人健康プロフィール', goals: '目標 / 症状優先度', symptomsQuick: '本日の症状（クイック選択）', labTable: '検査テーブル', addRow: '行を追加', uploadTitle: 'スキャン/テキストをアップロード', uploadFile: 'ファイルをアップロード', uploadPlaceholder: 'レポート本文を貼り付けるか、画像/テキスト/PDFファイルをアップロードしてください...', readyExtraction: '抽出の準備完了', generate: 'レポート生成', reading: '読み取り中...', quickOverview: 'クイック概要', withinRange: '基準内', outOfRange: '基準外', hormoneInfographic: 'ホルモン・インフォグラフィック', unlockInfographic: 'マーカーを追加してインフォグラフィックを表示。', day: '日', hormoneSignals: 'ホルモンシグナル', questionsDoctor: '医師への質問', detectedMarkers: '検出マーカー', refShort: '基準', status: '状態', na: 'N/A', summaryTitle: '臨床向けサマリー', copyDoctor: '医師向けにコピー', reportReadyTitle: 'レポート準備ゾーン', reportReadyBody: '識別を選び、プロフィールと表を入力後、レポートを生成してください。', safetyTitle: '安全メモ', safetyBody: 'Luna は教育的解釈を提供します。最終診断と治療判断は医師が行ってください。', unsupportedFormat: '未対応形式です。テキスト、画像、または PDF ファイルをご利用ください。', extractFailed: 'ファイルからテキストを抽出できませんでした。', aiScan: 'AIスキャン' },
  pt: { badge: 'My Health Reports', title: 'Relatórios', titleAccent: 'Que Explicam', workflow: 'Fluxo simples: escolha identidade do relatório, preencha marcadores, envie imagem/texto e obtenha um resumo hormonal claro.', identityTitle: 'Identidade Do Relatório', includeId: 'Incluir ID no relatório', includeName: 'Incluir nome no relatório', userIdOverride: 'ID do usuário (opcional)', current: 'Atual', privateIdentity: 'Privado (sem nome/ID no resumo)', profileTitle: 'Perfil Pessoal De Saúde', goals: 'Metas / Prioridade de sintomas', symptomsQuick: 'Sintomas de hoje (seleção rápida)', labTable: 'Tabela Laboratorial', addRow: 'Adicionar Linha', uploadTitle: 'Enviar scan/texto', uploadFile: 'Enviar Arquivo', uploadPlaceholder: 'Cole o texto do relatório ou envie um arquivo de imagem/texto/PDF...', readyExtraction: 'Pronto para extração', generate: 'Gerar Relatório', reading: 'Lendo...', quickOverview: 'Visão Rápida', withinRange: 'Na faixa', outOfRange: 'Fora da faixa', hormoneInfographic: 'Infográfico Hormonal', unlockInfographic: 'Adicione marcadores para liberar o infográfico.', day: 'dia', hormoneSignals: 'Sinais Hormonais', questionsDoctor: 'Perguntas Para O Médico', detectedMarkers: 'Marcadores Detectados', refShort: 'Ref', status: 'Status', na: 'n/d', summaryTitle: 'Resumo Clínico Claro', copyDoctor: 'Copiar para o médico', reportReadyTitle: 'Zona pronta para relatório', reportReadyBody: 'Escolha identidade, preencha perfil + tabela e depois gere o relatório.', safetyTitle: 'Nota de segurança', safetyBody: 'A Luna fornece interpretação educacional. Diagnóstico e tratamento finais exigem profissional de saúde licenciado.', unsupportedFormat: 'Formato não suportado. Use arquivos de texto, imagem ou PDF.', extractFailed: 'Não foi possível extrair texto do arquivo.', aiScan: 'scan AI' },
};

const detailedReportByLang: Partial<Record<Language, {
  title: string;
  subtitle: string;
  keyFindings: string;
  detailedInterpretation: string;
  explanation: string;
  whatHappening: string;
  doctorQuestions: string;
  noQuestions: string;
  noMarkers: string;
  statusLow: string;
  statusNormal: string;
  statusHigh: string;
  statusUnknown: string;
  copyright: string;
}>> = {
  en: {
    title: 'Luna Clinical Report',
    subtitle: 'Detailed physiological interpretation for care discussion',
    keyFindings: 'Key Findings',
    detailedInterpretation: 'Detailed Interpretation',
    explanation: 'Explanation',
    whatHappening: 'What Is Happening In Your Body',
    doctorQuestions: 'Questions To Discuss With Your Doctor',
    noQuestions: 'No priority questions generated yet. Add more markers for deeper interpretation.',
    noMarkers: 'No markers added yet.',
    statusLow: 'Below reference range: possible reduced reserve or low pathway activity.',
    statusNormal: 'Within reference range: currently aligned with expected physiological corridor.',
    statusHigh: 'Above reference range: possible overstimulation, compensation, or timing-related peak.',
    statusUnknown: 'Reference is incomplete: marker requires manual clinical context.',
    copyright: 'Copyright © Luna Balance. All rights reserved.',
  },
  ru: {
    title: 'Клинический Отчет Luna',
    subtitle: 'Детальная физиологическая интерпретация для обсуждения с врачом',
    keyFindings: 'Ключевые Наблюдения',
    detailedInterpretation: 'Детальная Интерпретация',
    explanation: 'Пояснение',
    whatHappening: 'Что Сейчас Происходит В Организме',
    doctorQuestions: 'Вопросы Для Обсуждения С Врачом',
    noQuestions: 'Пока нет приоритетных вопросов. Добавьте больше маркеров для глубокой интерпретации.',
    noMarkers: 'Пока нет добавленных маркеров.',
    statusLow: 'Ниже референса: возможно снижение резерва или активности соответствующего пути.',
    statusNormal: 'В пределах референса: показатель находится в ожидаемом физиологическом диапазоне.',
    statusHigh: 'Выше референса: возможно перенапряжение оси, компенсация или пик по таймингу.',
    statusUnknown: 'Референс неполный: требуется ручная клиническая интерпретация.',
    copyright: 'Copyright © Luna Balance. Все права защищены.',
  },
  uk: {
    title: 'Клінічний Звіт Luna',
    subtitle: 'Детальна фізіологічна інтерпретація для обговорення з лікарем',
    keyFindings: 'Ключові Спостереження',
    detailedInterpretation: 'Детальна Інтерпретація',
    explanation: 'Пояснення',
    whatHappening: 'Що Зараз Відбувається В Організмі',
    doctorQuestions: 'Питання Для Обговорення З Лікарем',
    noQuestions: 'Поки немає пріоритетних питань. Додайте більше маркерів для глибшої інтерпретації.',
    noMarkers: 'Поки немає доданих маркерів.',
    statusLow: 'Нижче референсу: можливе зниження резерву або активності шляху.',
    statusNormal: 'У межах референсу: показник у очікуваному фізіологічному коридорі.',
    statusHigh: 'Вище референсу: можливе перенапруження осі, компенсація або піковий момент.',
    statusUnknown: 'Референс неповний: потрібна ручна клінічна інтерпретація.',
    copyright: 'Copyright © Luna Balance. Усі права захищені.',
  },
  es: { title: 'Informe Clínico Luna', subtitle: 'Interpretación fisiológica detallada para consulta médica', keyFindings: 'Hallazgos Clave', detailedInterpretation: 'Interpretación Detallada', explanation: 'Explicación', whatHappening: 'Qué Está Pasando En Tu Cuerpo', doctorQuestions: 'Preguntas Para Tu Médica/o', noQuestions: 'Aún no hay preguntas prioritarias. Agrega más marcadores.', noMarkers: 'No hay marcadores aún.', statusLow: 'Bajo rango: posible baja reserva o actividad reducida.', statusNormal: 'En rango: alineado con el corredor fisiológico esperado.', statusHigh: 'Sobre rango: posible sobreestimulación, compensación o pico temporal.', statusUnknown: 'Referencia incompleta: requiere contexto clínico manual.', copyright: 'Copyright © Luna Balance. Todos los derechos reservados.' },
  fr: { title: 'Rapport Clinique Luna', subtitle: 'Interprétation physiologique détaillée pour la consultation', keyFindings: 'Constats Clés', detailedInterpretation: 'Interprétation Détaillée', explanation: 'Explication', whatHappening: 'Ce Qui Se Passe Dans Votre Corps', doctorQuestions: 'Questions À Discuter Avec Le Médecin', noQuestions: 'Aucune question prioritaire pour le moment. Ajoutez plus de marqueurs.', noMarkers: 'Aucun marqueur ajouté.', statusLow: 'Sous la référence : réserve ou activité possiblement réduite.', statusNormal: 'Dans la référence : couloir physiologique attendu.', statusHigh: 'Au-dessus de la référence : possible surstimulation, compensation ou pic temporel.', statusUnknown: 'Référence incomplète : contexte clinique requis.', copyright: 'Copyright © Luna Balance. Tous droits réservés.' },
  de: { title: 'Luna Klinischer Bericht', subtitle: 'Detaillierte physiologische Interpretation für das Arztgespräch', keyFindings: 'Kernaussagen', detailedInterpretation: 'Detaillierte Interpretation', explanation: 'Erklärung', whatHappening: 'Was In Ihrem Körper Passiert', doctorQuestions: 'Fragen Für Das Arztgespräch', noQuestions: 'Noch keine Prioritätsfragen. Fügen Sie mehr Marker hinzu.', noMarkers: 'Noch keine Marker vorhanden.', statusLow: 'Unter Referenz: mögliche reduzierte Reserve oder Aktivität.', statusNormal: 'Im Referenzbereich: im erwarteten physiologischen Korridor.', statusHigh: 'Über Referenz: mögliche Überstimulation, Kompensation oder Zeitfenster-Peak.', statusUnknown: 'Referenz unvollständig: klinischer Kontext erforderlich.', copyright: 'Copyright © Luna Balance. Alle Rechte vorbehalten.' },
  zh: { title: 'Luna 临床报告', subtitle: '用于医疗沟通的详细生理解读', keyFindings: '关键发现', detailedInterpretation: '详细解读', explanation: '解释', whatHappening: '你体内正在发生什么', doctorQuestions: '建议与医生讨论的问题', noQuestions: '暂未生成重点问题。请添加更多指标。', noMarkers: '尚未添加指标。', statusLow: '低于参考范围：可能提示储备不足或通路活性降低。', statusNormal: '在参考范围内：当前符合预期生理区间。', statusHigh: '高于参考范围：可能存在代偿、过度激活或时间窗峰值。', statusUnknown: '参考区间不完整：需结合临床手动判断。', copyright: 'Copyright © Luna Balance. 保留所有权利。' },
  ja: { title: 'Luna 臨床レポート', subtitle: '医師相談のための詳細な生理学的解釈', keyFindings: '主要所見', detailedInterpretation: '詳細解釈', explanation: '解説', whatHappening: '体内で起きていること', doctorQuestions: '医師に確認する質問', noQuestions: '優先質問はまだありません。マーカーを追加してください。', noMarkers: 'マーカーはまだありません。', statusLow: '基準値未満: 予備力低下または経路活性低下の可能性。', statusNormal: '基準範囲内: 想定される生理学的レンジ内。', statusHigh: '基準値超え: 過活動、代償、タイミング要因の可能性。', statusUnknown: '基準が不十分: 臨床文脈での手動評価が必要。', copyright: 'Copyright © Luna Balance. All rights reserved.' },
  pt: { title: 'Relatório Clínico Luna', subtitle: 'Interpretação fisiológica detalhada para consulta médica', keyFindings: 'Achados-Chave', detailedInterpretation: 'Interpretação Detalhada', explanation: 'Explicação', whatHappening: 'O Que Está Acontecendo No Seu Corpo', doctorQuestions: 'Perguntas Para Discutir Com Seu Médico', noQuestions: 'Ainda sem perguntas prioritárias. Adicione mais marcadores.', noMarkers: 'Nenhum marcador adicionado.', statusLow: 'Abaixo da referência: possível reserva reduzida ou baixa atividade.', statusNormal: 'Dentro da referência: alinhado ao corredor fisiológico esperado.', statusHigh: 'Acima da referência: possível sobrecarga, compensação ou pico temporal.', statusUnknown: 'Referência incompleta: requer contexto clínico manual.', copyright: 'Copyright © Luna Balance. Todos os direitos reservados.' },
};

const womenReportInsightsByLang: Partial<Record<Language, {
  clinicalFocusTitle: string;
  clinicalFocusLead: string;
  combinationsTitle: string;
  effectsTitle: string;
  risksTitle: string;
  recommendationsTitle: string;
  noData: string;
  highPriority: string;
  watch: string;
  stable: string;
  estProgTitle: string;
  estProgBody: string;
  thyroidTitle: string;
  thyroidBody: string;
  insulinAndrogenTitle: string;
  insulinAndrogenBody: string;
  prolactinTitle: string;
  prolactinBody: string;
  ferritinTitle: string;
  ferritinBody: string;
  cortisolTitle: string;
  cortisolBody: string;
  recCycle: string;
  recRepeat: string;
  recDoctor: string;
  recLifestyle: string;
}>> = {
  en: {
    clinicalFocusTitle: 'Women-Specific Clinical Focus',
    clinicalFocusLead: 'This section explains hormone combinations, expected effects, potential risks, and practical next steps.',
    combinationsTitle: 'Hormone Combinations',
    effectsTitle: 'Potential Effects',
    risksTitle: 'Potential Risks',
    recommendationsTitle: 'Actionable Recommendations',
    noData: 'Not enough markers yet for advanced pattern interpretation.',
    highPriority: 'High Priority',
    watch: 'Watch',
    stable: 'Stable',
    estProgTitle: 'Estrogen-Progesterone Balance Pattern',
    estProgBody: 'Possible luteal imbalance pattern that may correlate with PMS intensity, breast tenderness, mood instability, and sleep disruption.',
    thyroidTitle: 'Thyroid Slowdown Pattern',
    thyroidBody: 'Thyroid axis pattern can be linked to fatigue, low motivation, cold sensitivity, dry skin, and cycle changes.',
    insulinAndrogenTitle: 'Metabolic-Androgen Pattern',
    insulinAndrogenBody: 'Combined insulin/glucose and androgen strain may influence acne, weight changes, cycle irregularity, and libido fluctuation.',
    prolactinTitle: 'Prolactin-Libido Pattern',
    prolactinBody: 'Elevated prolactin may suppress sexual desire, reduce arousal quality, and impact ovulatory rhythm.',
    ferritinTitle: 'Iron Reserve Pattern',
    ferritinBody: 'Lower ferritin may reduce cellular resilience and contribute to fatigue, low focus, and poor recovery.',
    cortisolTitle: 'Stress-Cortisol Pattern',
    cortisolBody: 'Stress-axis elevation may amplify anxiety, sleep fragmentation, cravings, and hormone instability.',
    recCycle: 'Repeat key cycle hormones in phase-specific windows (follicular and luteal) for clearer trend interpretation.',
    recRepeat: 'Retest out-of-range markers in 6-10 weeks with the same lab method for reliable comparison.',
    recDoctor: 'Bring this report to your clinician and review pattern-level findings, not isolated values only.',
    recLifestyle: 'Prioritize sleep regularity, protein-first meals, gentle movement, and stress recovery habits to stabilize endocrine load.',
  },
  ru: {
    clinicalFocusTitle: 'Клинический Фокус Для Женщины',
    clinicalFocusLead: 'Раздел объясняет сочетания гормонов, вероятные эффекты, потенциальные риски и практические шаги.',
    combinationsTitle: 'Гормональные Сочетания',
    effectsTitle: 'Потенциальные Эффекты',
    risksTitle: 'Потенциальные Риски',
    recommendationsTitle: 'Практические Рекомендации',
    noData: 'Пока недостаточно маркеров для расширенной интерпретации паттернов.',
    highPriority: 'Высокий Приоритет',
    watch: 'Наблюдать',
    stable: 'Стабильно',
    estProgTitle: 'Паттерн Баланса Эстроген-Прогестерон',
    estProgBody: 'Возможен лютеиновый дисбаланс, связанный с выраженным ПМС, болезненностью груди, нестабильностью настроения и ухудшением сна.',
    thyroidTitle: 'Паттерн Замедления Щитовидной Оси',
    thyroidBody: 'Паттерн щитовидной оси может быть связан с усталостью, снижением мотивации, зябкостью, сухостью кожи и изменениями цикла.',
    insulinAndrogenTitle: 'Метаболико-Андрогенный Паттерн',
    insulinAndrogenBody: 'Сочетание метаболической и андрогенной нагрузки может усиливать акне, колебания веса, нерегулярность цикла и колебания либидо.',
    prolactinTitle: 'Паттерн Пролактин-Либидо',
    prolactinBody: 'Повышенный пролактин может снижать сексуальное желание, качество возбуждения и влиять на овуляторный ритм.',
    ferritinTitle: 'Паттерн Железного Резерва',
    ferritinBody: 'Снижение ферритина может уменьшать клеточный ресурс и усиливать усталость, снижение концентрации и медленное восстановление.',
    cortisolTitle: 'Стресс-Кортизоловый Паттерн',
    cortisolBody: 'Повышение стресс-оси может усиливать тревожность, фрагментацию сна, тягу к еде и гормональную нестабильность.',
    recCycle: 'Пересдавайте ключевые половые гормоны в фазовых окнах цикла (фолликулярная и лютеиновая фазы).',
    recRepeat: 'Перепроверьте маркеры вне референса через 6-10 недель тем же лабораторным методом.',
    recDoctor: 'Покажите этот отчет врачу и обсудите паттерны, а не только отдельные цифры.',
    recLifestyle: 'Приоритет: стабильный сон, белок в начале приема пищи, мягкая физическая активность и восстановление после стресса.',
  },
  uk: {
    clinicalFocusTitle: 'Клінічний Фокус Для Жінки',
    clinicalFocusLead: 'Розділ пояснює гормональні поєднання, можливі ефекти, ризики та практичні кроки.',
    combinationsTitle: 'Гормональні Поєднання',
    effectsTitle: 'Потенційні Ефекти',
    risksTitle: 'Потенційні Ризики',
    recommendationsTitle: 'Практичні Рекомендації',
    noData: 'Поки недостатньо маркерів для розширеної інтерпретації патернів.',
    highPriority: 'Високий Пріоритет',
    watch: 'Спостерігати',
    stable: 'Стабільно',
    estProgTitle: 'Патерн Балансу Естроген-Прогестерон',
    estProgBody: 'Можливий лютеїновий дисбаланс, повʼязаний із ПМС, чутливістю грудей, коливаннями настрою та сном.',
    thyroidTitle: 'Патерн Сповільнення Щитоподібної Осі',
    thyroidBody: 'Такий патерн може бути повʼязаний із втомою, холодовою чутливістю, сухістю шкіри та змінами циклу.',
    insulinAndrogenTitle: 'Метаболічно-Андрогенний Патерн',
    insulinAndrogenBody: 'Поєднання метаболічного й андрогенного навантаження може впливати на акне, вагу, цикл і лібідо.',
    prolactinTitle: 'Патерн Пролактин-Лібідо',
    prolactinBody: 'Підвищений пролактин може знижувати сексуальне бажання, якість збудження й овуляторний ритм.',
    ferritinTitle: 'Патерн Залізного Резерву',
    ferritinBody: 'Низький феритин може погіршувати витривалість, фокус і відновлення.',
    cortisolTitle: 'Стрес-Кортизоловий Патерн',
    cortisolBody: 'Підвищена стрес-вісь може посилювати тривожність, порушення сну, тягу до їжі та гормональну нестабільність.',
    recCycle: 'Перевіряйте ключові статеві гормони у фазових вікнах циклу (фолікулярна/лютеїнова фази).',
    recRepeat: 'Повторюйте маркери поза референсом через 6-10 тижнів тим самим методом лабораторії.',
    recDoctor: 'Покажіть звіт лікарю і обговорюйте патерни, а не лише окремі числа.',
    recLifestyle: 'Пріоритет: стабільний сон, білок на початку прийому їжі, мʼякий рух і відновлення після стресу.',
  },
  es: {
    clinicalFocusTitle: 'Enfoque Clínico Femenino',
    clinicalFocusLead: 'Esta sección explica combinaciones hormonales, efectos, riesgos y pasos prácticos.',
    combinationsTitle: 'Combinaciones Hormonales',
    effectsTitle: 'Efectos Potenciales',
    risksTitle: 'Riesgos Potenciales',
    recommendationsTitle: 'Recomendaciones Prácticas',
    noData: 'Aún faltan marcadores para una interpretación avanzada.',
    highPriority: 'Alta Prioridad',
    watch: 'Vigilar',
    stable: 'Estable',
    estProgTitle: 'Patrón Estrógeno-Progesterona',
    estProgBody: 'Posible desequilibrio lúteo relacionado con SPM, sensibilidad mamaria, cambios de ánimo y sueño.',
    thyroidTitle: 'Patrón Tiroideo Lento',
    thyroidBody: 'Puede asociarse con fatiga, baja motivación, sensibilidad al frío, piel seca y cambios del ciclo.',
    insulinAndrogenTitle: 'Patrón Metabólico-Androgénico',
    insulinAndrogenBody: 'La carga combinada puede influir en acné, peso, irregularidad menstrual y libido.',
    prolactinTitle: 'Patrón Prolactina-Libido',
    prolactinBody: 'Prolactina elevada puede reducir deseo sexual, excitación y ritmo ovulatorio.',
    ferritinTitle: 'Patrón De Reserva De Hierro',
    ferritinBody: 'Ferritina baja puede contribuir a fatiga, baja concentración y recuperación lenta.',
    cortisolTitle: 'Patrón Estrés-Cortisol',
    cortisolBody: 'Estrés elevado puede aumentar ansiedad, sueño fragmentado, antojos e inestabilidad hormonal.',
    recCycle: 'Repite hormonas clave en ventanas de fase del ciclo para interpretar tendencias.',
    recRepeat: 'Recontrola marcadores fuera de rango en 6-10 semanas con el mismo método.',
    recDoctor: 'Lleva este reporte a tu médica/o y revisen patrones, no solo números aislados.',
    recLifestyle: 'Prioriza sueño estable, comidas con proteína, movimiento suave y recuperación del estrés.',
  },
  fr: {
    clinicalFocusTitle: 'Focus Clinique Féminin',
    clinicalFocusLead: 'Cette section explique les combinaisons hormonales, effets, risques et actions utiles.',
    combinationsTitle: 'Combinaisons Hormonales',
    effectsTitle: 'Effets Potentiels',
    risksTitle: 'Risques Potentiels',
    recommendationsTitle: 'Recommandations Pratiques',
    noData: 'Pas assez de marqueurs pour une interprétation avancée.',
    highPriority: 'Haute Priorité',
    watch: 'À Surveiller',
    stable: 'Stable',
    estProgTitle: 'Profil Œstrogène-Progestérone',
    estProgBody: 'Possible déséquilibre lutéal lié au SPM, sensibilité mammaire, variabilité émotionnelle et sommeil.',
    thyroidTitle: 'Profil Thyroïdien Ralenti',
    thyroidBody: 'Peut être associé à fatigue, baisse d’élan, sensibilité au froid, peau sèche et cycle modifié.',
    insulinAndrogenTitle: 'Profil Métabolique-Androgénique',
    insulinAndrogenBody: 'Cette combinaison peut influencer acné, poids, irrégularité du cycle et libido.',
    prolactinTitle: 'Profil Prolactine-Libido',
    prolactinBody: 'Une prolactine élevée peut réduire désir sexuel, qualité d’excitation et rythme ovulatoire.',
    ferritinTitle: 'Profil Réserve En Fer',
    ferritinBody: 'Une ferritine basse peut réduire la résilience, la concentration et la récupération.',
    cortisolTitle: 'Profil Stress-Cortisol',
    cortisolBody: 'Un axe stress élevé peut majorer anxiété, fragmentation du sommeil, envies sucrées et instabilité hormonale.',
    recCycle: 'Répétez les hormones clés selon les fenêtres de phase du cycle pour lire la tendance.',
    recRepeat: 'Recontrôlez les marqueurs hors norme à 6-10 semaines avec la même méthode.',
    recDoctor: 'Apportez ce rapport au médecin et discutez les profils, pas seulement des valeurs isolées.',
    recLifestyle: 'Priorité au sommeil régulier, protéines, mouvement doux et récupération du stress.',
  },
  de: {
    clinicalFocusTitle: 'Klinischer Fokus Für Frauen',
    clinicalFocusLead: 'Dieser Abschnitt erklärt Hormonkombinationen, mögliche Effekte, Risiken und nächste Schritte.',
    combinationsTitle: 'Hormon-Kombinationen',
    effectsTitle: 'Mögliche Effekte',
    risksTitle: 'Mögliche Risiken',
    recommendationsTitle: 'Konkrete Empfehlungen',
    noData: 'Noch zu wenige Marker für eine erweiterte Musteranalyse.',
    highPriority: 'Hohe Priorität',
    watch: 'Beobachten',
    stable: 'Stabil',
    estProgTitle: 'Östrogen-Progesteron-Muster',
    estProgBody: 'Mögliches luteales Ungleichgewicht mit PMS-Intensität, Brustspannen, Stimmungsschwankungen und Schlafproblemen.',
    thyroidTitle: 'Schilddrüsen-Verlangsamungsmuster',
    thyroidBody: 'Kann mit Müdigkeit, Kälteempfindlichkeit, trockener Haut und Zyklusveränderungen verbunden sein.',
    insulinAndrogenTitle: 'Metabolisch-Androgenes Muster',
    insulinAndrogenBody: 'Kombinierte Belastung kann Akne, Gewichtsschwankungen, Zyklusunregelmäßigkeit und Libido beeinflussen.',
    prolactinTitle: 'Prolaktin-Libido-Muster',
    prolactinBody: 'Erhöhtes Prolaktin kann sexuelles Verlangen und Erregungsqualität reduzieren.',
    ferritinTitle: 'Eisenreserve-Muster',
    ferritinBody: 'Niedriges Ferritin kann Erschöpfung, geringe Konzentration und langsamere Erholung fördern.',
    cortisolTitle: 'Stress-Cortisol-Muster',
    cortisolBody: 'Erhöhter Stress kann Angst, Schlafunterbrechungen, Heißhunger und Hormoninstabilität verstärken.',
    recCycle: 'Wichtige Zyklushormone in phasenspezifischen Zeitfenstern kontrollieren.',
    recRepeat: 'Auffällige Marker in 6-10 Wochen mit derselben Labormethode erneut prüfen.',
    recDoctor: 'Bericht zur Ärztin/zum Arzt mitnehmen und Muster statt Einzelwerte besprechen.',
    recLifestyle: 'Schlafrhythmus, proteinreiche Mahlzeiten, sanfte Bewegung und Stress-Erholung priorisieren.',
  },
  zh: {
    clinicalFocusTitle: '女性临床重点',
    clinicalFocusLead: '本节解释激素组合、潜在影响、风险与可执行建议。',
    combinationsTitle: '激素组合模式',
    effectsTitle: '潜在影响',
    risksTitle: '潜在风险',
    recommendationsTitle: '可执行建议',
    noData: '当前指标不足，暂无法做高级模式解读。',
    highPriority: '高优先级',
    watch: '需观察',
    stable: '稳定',
    estProgTitle: '雌激素-孕激素平衡模式',
    estProgBody: '可能与经前症状加重、乳房不适、情绪波动和睡眠问题相关。',
    thyroidTitle: '甲状腺减速模式',
    thyroidBody: '可能关联疲劳、畏寒、皮肤干燥、动力下降及周期变化。',
    insulinAndrogenTitle: '代谢-雄激素模式',
    insulinAndrogenBody: '组合负担可能影响痤疮、体重、周期规律和性欲波动。',
    prolactinTitle: '泌乳素-性欲模式',
    prolactinBody: '泌乳素偏高可能降低性欲、唤起质量并影响排卵节律。',
    ferritinTitle: '铁储备模式',
    ferritinBody: '铁蛋白偏低可能导致疲劳、专注下降和恢复变慢。',
    cortisolTitle: '压力-皮质醇模式',
    cortisolBody: '压力轴偏高可能加重焦虑、睡眠碎片化、食欲波动和激素不稳。',
    recCycle: '在周期不同阶段复查关键激素，便于判断趋势。',
    recRepeat: '超出参考范围的指标建议 6-10 周后同方法复测。',
    recDoctor: '就诊时携带报告，重点讨论“模式变化”而非单点数值。',
    recLifestyle: '优先保证睡眠规律、蛋白质摄入、温和运动与压力恢复。',
  },
  ja: {
    clinicalFocusTitle: '女性向け臨床フォーカス',
    clinicalFocusLead: 'このセクションではホルモンの組み合わせ、影響、リスク、実行可能な対策を示します。',
    combinationsTitle: 'ホルモン組み合わせパターン',
    effectsTitle: '想定される影響',
    risksTitle: '想定リスク',
    recommendationsTitle: '実行可能な提案',
    noData: '高度なパターン解釈に十分なマーカーがまだありません。',
    highPriority: '高優先',
    watch: '要観察',
    stable: '安定',
    estProgTitle: 'エストロゲン-プロゲステロンパターン',
    estProgBody: 'PMS増悪、乳房不快、気分変動、睡眠質低下に関連する可能性があります。',
    thyroidTitle: '甲状腺低下パターン',
    thyroidBody: '疲労、冷え、乾燥肌、意欲低下、周期変化との関連が考えられます。',
    insulinAndrogenTitle: '代謝-アンドロゲンパターン',
    insulinAndrogenBody: 'この組み合わせはニキビ、体重変動、周期不整、性欲変動に影響する可能性があります。',
    prolactinTitle: 'プロラクチン-リビドーパターン',
    prolactinBody: '高プロラクチンは性欲・覚醒の質低下、排卵リズムへの影響につながる可能性があります。',
    ferritinTitle: '鉄貯蔵パターン',
    ferritinBody: '低フェリチンは疲労、集中力低下、回復遅延を招きやすくなります。',
    cortisolTitle: 'ストレス-コルチゾールパターン',
    cortisolBody: 'ストレス軸上昇は不安、睡眠分断、食欲変動、ホルモン不安定を強める可能性があります。',
    recCycle: '周期フェーズ別に主要ホルモンを再検して傾向を確認してください。',
    recRepeat: '基準外マーカーは6-10週間後に同一法で再検を推奨します。',
    recDoctor: '受診時は単一値ではなく、パターン全体を医師と確認してください。',
    recLifestyle: '睡眠の規則性、タンパク質中心の食事、軽い運動、ストレス回復を優先してください。',
  },
  pt: {
    clinicalFocusTitle: 'Foco Clínico Feminino',
    clinicalFocusLead: 'Esta seção explica combinações hormonais, efeitos, riscos e próximos passos práticos.',
    combinationsTitle: 'Combinações Hormonais',
    effectsTitle: 'Efeitos Potenciais',
    risksTitle: 'Riscos Potenciais',
    recommendationsTitle: 'Recomendações Práticas',
    noData: 'Ainda há poucos marcadores para interpretação avançada de padrões.',
    highPriority: 'Alta Prioridade',
    watch: 'Monitorar',
    stable: 'Estável',
    estProgTitle: 'Padrão Estrogênio-Progesterona',
    estProgBody: 'Possível desequilíbrio lúteo associado a TPM, sensibilidade mamária, oscilação de humor e sono.',
    thyroidTitle: 'Padrão De Lentidão Tireoidiana',
    thyroidBody: 'Pode estar relacionado a fadiga, baixa motivação, sensibilidade ao frio, pele seca e mudanças no ciclo.',
    insulinAndrogenTitle: 'Padrão Metabólico-Androgênico',
    insulinAndrogenBody: 'A combinação pode influenciar acne, peso, irregularidade menstrual e variação de libido.',
    prolactinTitle: 'Padrão Prolactina-Libido',
    prolactinBody: 'Prolactina alta pode reduzir desejo sexual, qualidade de excitação e ritmo ovulatório.',
    ferritinTitle: 'Padrão De Reserva De Ferro',
    ferritinBody: 'Ferritina baixa pode aumentar fadiga, reduzir foco e atrasar recuperação.',
    cortisolTitle: 'Padrão Estresse-Cortisol',
    cortisolBody: 'Estresse elevado pode aumentar ansiedade, fragmentar o sono, elevar cravings e instabilidade hormonal.',
    recCycle: 'Repita hormônios-chave em janelas de fase do ciclo para melhor leitura de tendência.',
    recRepeat: 'Reavalie marcadores fora da faixa em 6-10 semanas usando o mesmo método.',
    recDoctor: 'Leve este relatório para consulta e discuta padrões, não apenas valores isolados.',
    recLifestyle: 'Priorize sono regular, refeições com proteína, movimento suave e recuperação do estresse.',
  },
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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

const hormoneTopic = (text: string): { key: 'cycle' | 'thyroid' | 'androgen' | 'metabolic' | 'stress' | 'reserve' | 'other'; label: string; accent: string; chipClass: string; textClass: string } => {
  const raw = text.toLowerCase();
  if (/(estradiol|estrogen|progesterone|lh|fsh|prolactin)/.test(raw)) {
    return { key: 'cycle', label: 'Cycle', accent: '#7c3aed', chipClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', textClass: 'text-violet-700 dark:text-violet-300' };
  }
  if (/(tsh|ft3|ft4|t3|t4|thyroid|anti-tpo|anti-tg)/.test(raw)) {
    return { key: 'thyroid', label: 'Thyroid', accent: '#0ea5e9', chipClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300', textClass: 'text-sky-700 dark:text-sky-300' };
  }
  if (/(testosterone|shbg|dhea|androstenedione|17-oh)/.test(raw)) {
    return { key: 'androgen', label: 'Androgen', accent: '#ec4899', chipClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', textClass: 'text-pink-700 dark:text-pink-300' };
  }
  if (/(glucose|insulin|hba1c)/.test(raw)) {
    return { key: 'metabolic', label: 'Metabolic', accent: '#f59e0b', chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', textClass: 'text-amber-700 dark:text-amber-300' };
  }
  if (/(cortisol)/.test(raw)) {
    return { key: 'stress', label: 'Stress', accent: '#f43f5e', chipClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', textClass: 'text-rose-700 dark:text-rose-300' };
  }
  if (/(ferritin|vitamin d|b12|cbc)/.test(raw)) {
    return { key: 'reserve', label: 'Reserve', accent: '#14b8a6', chipClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', textClass: 'text-teal-700 dark:text-teal-300' };
  }
  return { key: 'other', label: 'Other', accent: '#64748b', chipClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300', textClass: 'text-slate-700 dark:text-slate-300' };
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
  const [rawParsedValues, setRawParsedValues] = useState<ParsedLabValue[]>([]);
  const [labConflicts, setLabConflicts] = useState<LabValueConflict[]>([]);
  const [conflictChoices, setConflictChoices] = useState<Record<string, number>>({});
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
  const [reportLang, setReportLang] = useState<Language>(lang);
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => ({ ...emptyProfile, birthYear: String(new Date().getFullYear() - age), cycleDay: String(day) }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  const sexualUi = sexualUiByLang[lang] || sexualUiByLang.en!;
  const visualGuide = visualGuideByLang[lang] || visualGuideByLang.en!;
  const reportUi = reportUiByLang[reportLang] || reportUiByLang.en!;
  const medForm = medicalFormByLang[reportLang] || medicalFormByLang.en!;
  const reportLangUi = reportLanguageUiByLang[lang] || reportLanguageUiByLang.en!;
  const reportSourcesUi = reportSourceByLang[reportLang] || reportSourceByLang.en!;
  const reportCategories = markerCategoryByLang[reportLang] || markerCategoryByLang.en!;
  const reportActions = reportActionsByLang[lang] || reportActionsByLang.en!;
  const conflictsUi = reportConflictsByLang[lang] || reportConflictsByLang.en!;
  const reportsUi = reportsUiByLang[lang] || reportsUiByLang.en!;
  const detailedUi = detailedReportByLang[reportLang] || detailedReportByLang.en!;
  const womenUi = womenReportInsightsByLang[reportLang] || womenReportInsightsByLang.en!;

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

  const hormoneTopicStats = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of parsedValues) {
      const topic = hormoneTopic(item.marker).key;
      totals[topic] = (totals[topic] || 0) + 1;
    }
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
    return Object.entries(totals)
      .map(([topicKey, count]) => {
        const sample = parsedValues.find((item) => hormoneTopic(item.marker).key === topicKey)?.marker || topicKey;
        const meta = hormoneTopic(sample);
        return { topicKey, count, ratio: total ? Math.round((count / total) * 100) : 0, meta };
      })
      .sort((a, b) => b.count - a.count);
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
          source: 'manual' as const,
        };
      })
      .filter((item) => Number.isFinite(item.value));
  };

  useEffect(() => {
    if (!rawParsedValues.length) return;
    const resolved = mergeParsedLabValues(rawParsedValues, conflictChoices);
    setParsedValues(resolved);
    setParsedRows(toLabRows(resolved));
  }, [rawParsedValues, conflictChoices]);

  const reportGeneratedAt = useMemo(() => new Date().toLocaleString(localeByLang[reportLang]), [analysis?.text, parsedValues.length, reportIdentityLine, reportLang]);
  const reportCopyright = useMemo(() => {
    const base = detailedUi.copyright || 'Copyright © Luna Balance. All rights reserved.';
    return base.includes('2026') ? base : base.replace('Copyright ©', 'Copyright © 2026');
  }, [detailedUi.copyright]);
  const analysisSource = useMemo(() => {
    const pieces: string[] = [];
    if (uploadFeedback) pieces.push(uploadFeedback);
    if (input.trim()) pieces.push(reportSourcesUi.textInput);
    if (manualRows.some((row) => row.marker.trim() && row.value.trim())) pieces.push(reportSourcesUi.manualTable);
    return pieces.length ? pieces.join(' + ') : reportSourcesUi.profileOnly;
  }, [input, manualRows, reportSourcesUi.manualTable, reportSourcesUi.profileOnly, reportSourcesUi.textInput, uploadFeedback]);

  const markerCategory = (marker: string): string => {
    const m = marker.toLowerCase();
    if (/(estradiol|progesterone|lh|fsh|prolactin)/.test(m)) return reportCategories.cycle;
    if (/(tsh|ft3|ft4|t3|t4|thyroid|anti-tpo|anti-tg)/.test(m)) return reportCategories.thyroid;
    if (/(testosterone|shbg|dhea|androstenedione|17-oh)/.test(m)) return reportCategories.sexual;
    if (/(glucose|insulin|hba1c)/.test(m)) return reportCategories.metabolic;
    if (/(ferritin|vitamin d|b12|cbc)/.test(m)) return reportCategories.nutrient;
    return reportCategories.other;
  };

  const sourceLabel = (source?: ParsedLabValue['source']) => {
    if (source === 'manual') return conflictsUi.manual;
    if (source === 'pdf') return conflictsUi.pdf;
    if (source === 'ocr') return conflictsUi.ocr;
    return conflictsUi.text;
  };

  const confidenceScore = (item: ParsedLabValue): number => {
    let score = item.source === 'manual' ? 92 : item.source === 'text' ? 82 : item.source === 'pdf' ? 76 : 68;
    if (item.unit) score += 3;
    if (Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)) score += 5;
    return Math.min(99, score);
  };

  const markerByTokens = (tokens: string[]) =>
    parsedValues.find((item) => tokens.some((token) => item.marker.toLowerCase().includes(token)));

  const womenClinicalInsights = useMemo(() => {
    type Insight = { level: 'high' | 'watch' | 'stable'; title: string; body: string };
    const combinations: Insight[] = [];
    const effects: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    const estradiol = markerByTokens(['estradiol', 'estrogen', 'e2']);
    const progesterone = markerByTokens(['progesterone']);
    const tsh = markerByTokens(['tsh']);
    const ft4 = markerByTokens(['ft4', 't4']);
    const insulin = markerByTokens(['insulin']);
    const glucose = markerByTokens(['glucose']);
    const testosterone = markerByTokens(['testosterone']);
    const dhea = markerByTokens(['dhea']);
    const prolactin = markerByTokens(['prolactin']);
    const ferritin = markerByTokens(['ferritin']);
    const cortisol = markerByTokens(['cortisol']);

    const stateOf = (item?: ParsedLabValue) => (item ? inferStatus(item.value, item.referenceMin, item.referenceMax) : 'unknown');
    const hasSymptom = (...keys: string[]) => selectedSymptoms.some((sym) => keys.some((key) => sym.toLowerCase().includes(key)));

    const estrState = stateOf(estradiol);
    const progState = stateOf(progesterone);
    if ((estrState === 'high' && (progState === 'low' || progState === 'unknown')) || (estrState === 'normal' && progState === 'low')) {
      combinations.push({ level: 'high', title: womenUi.estProgTitle, body: womenUi.estProgBody });
      effects.push(womenUi.estProgBody);
      risks.push(womenUi.estProgBody);
      recommendations.push(womenUi.recDoctor);
    }

    const tshState = stateOf(tsh);
    const ft4State = stateOf(ft4);
    if (tshState === 'high' || ft4State === 'low') {
      combinations.push({ level: 'high', title: womenUi.thyroidTitle, body: womenUi.thyroidBody });
      effects.push(womenUi.thyroidBody);
      risks.push(womenUi.thyroidBody);
      recommendations.push(womenUi.recDoctor);
    }

    const insulinState = stateOf(insulin);
    const glucoseState = stateOf(glucose);
    const testState = stateOf(testosterone);
    const dheaState = stateOf(dhea);
    if ((insulinState === 'high' || glucoseState === 'high') && (testState === 'high' || dheaState === 'high')) {
      combinations.push({ level: 'high', title: womenUi.insulinAndrogenTitle, body: womenUi.insulinAndrogenBody });
      effects.push(womenUi.insulinAndrogenBody);
      risks.push(womenUi.insulinAndrogenBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(prolactin) === 'high' && (sexualOverview.avgPositive <= 3 || hasSymptom('low libido', 'low arousal'))) {
      combinations.push({ level: 'watch', title: womenUi.prolactinTitle, body: womenUi.prolactinBody });
      effects.push(womenUi.prolactinBody);
      risks.push(womenUi.prolactinBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(ferritin) === 'low' || hasSymptom('fatigue', 'low mood', 'headache')) {
      combinations.push({ level: 'watch', title: womenUi.ferritinTitle, body: womenUi.ferritinBody });
      effects.push(womenUi.ferritinBody);
      risks.push(womenUi.ferritinBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(cortisol) === 'high' || hasSymptom('anxiety', 'sleep issues')) {
      combinations.push({ level: 'watch', title: womenUi.cortisolTitle, body: womenUi.cortisolBody });
      effects.push(womenUi.cortisolBody);
      risks.push(womenUi.cortisolBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (!combinations.length && parsedValues.length) {
      combinations.push({ level: 'stable', title: womenUi.stable, body: womenUi.noData });
    }
    if (!recommendations.length && parsedValues.length) {
      recommendations.push(womenUi.recDoctor);
    }

    recommendations.push(womenUi.recCycle, womenUi.recRepeat, womenUi.recLifestyle);

    return {
      combinations,
      effects: effects.length ? effects : [womenUi.noData],
      risks: risks.length ? risks : [womenUi.noData],
      recommendations: Array.from(new Set(recommendations)),
    };
  }, [parsedValues, selectedSymptoms, sexualOverview.avgPositive, womenUi]);

  const markerStatusExplanation = (status: 'low' | 'normal' | 'high' | 'unknown') => {
    if (status === 'low') return detailedUi.statusLow;
    if (status === 'high') return detailedUi.statusHigh;
    if (status === 'normal') return detailedUi.statusNormal;
    return detailedUi.statusUnknown;
  };

  const reportText = useMemo(() => {
    const identity = reportIdentityLine || reportsUi.privateIdentity;
    const markersPreview = parsedValues
      .map((item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const reference =
          Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
            ? ` [${item.referenceMin}-${item.referenceMax}]`
            : '';
        return `${item.marker}: ${item.value}${item.unit ? ` ${item.unit}` : ''}${reference} (${status})\n  ${markerStatusExplanation(status)}`;
      })
      .join('\n');
    const summary = analysis?.text || reportsUi.reportReadyBody;
    return [
      detailedUi.title,
      detailedUi.subtitle,
      `${medForm.generatedAt}: ${reportGeneratedAt}`,
      `${medForm.patientId}: ${identity}`,
      `${medForm.source}: ${analysisSource}`,
      `${reportsUi.day}: ${profile.cycleDay || systemState.currentDay}`,
      `${sexualUi.summaryLabel}: ${sexualOverview.avgPositive}/5 | ${sexualUi.scoreLabels.pain} ${sexualOverview.pain}/5`,
      '',
      `${detailedUi.detailedInterpretation}:`,
      markersPreview || detailedUi.noMarkers,
      '',
      `${medForm.summary}:`,
      summary,
      '',
      `${womenUi.combinationsTitle}:`,
      womenClinicalInsights.combinations.map((item) => `${item.title}: ${item.body}`).join('\n'),
      '',
      `${womenUi.effectsTitle}:`,
      womenClinicalInsights.effects.map((item) => `- ${item}`).join('\n'),
      '',
      `${womenUi.risksTitle}:`,
      womenClinicalInsights.risks.map((item) => `- ${item}`).join('\n'),
      '',
      `${womenUi.recommendationsTitle}:`,
      womenClinicalInsights.recommendations.map((item) => `- ${item}`).join('\n'),
      '',
      `${detailedUi.doctorQuestions}:`,
      doctorQuestions.length ? doctorQuestions.join('\n') : detailedUi.noQuestions,
      '',
      `${medForm.disclaimerTitle}: ${medForm.disclaimerBody}`,
      reportCopyright,
    ].join('\n');
  }, [analysis?.text, analysisSource, detailedUi.detailedInterpretation, detailedUi.doctorQuestions, detailedUi.noMarkers, detailedUi.noQuestions, detailedUi.statusHigh, detailedUi.statusLow, detailedUi.statusNormal, detailedUi.statusUnknown, detailedUi.subtitle, detailedUi.title, doctorQuestions, medForm.disclaimerBody, medForm.disclaimerTitle, medForm.generatedAt, medForm.patientId, medForm.source, medForm.summary, parsedValues, profile.cycleDay, reportCopyright, reportGeneratedAt, reportIdentityLine, reportsUi.day, reportsUi.privateIdentity, reportsUi.reportReadyBody, sexualOverview.avgPositive, sexualOverview.pain, sexualUi.scoreLabels.pain, sexualUi.summaryLabel, systemState.currentDay, womenClinicalInsights.combinations, womenClinicalInsights.effects, womenClinicalInsights.recommendations, womenClinicalInsights.risks, womenUi.combinationsTitle, womenUi.effectsTitle, womenUi.recommendationsTitle, womenUi.risksTitle]);

  const reportHtml = useMemo(() => {
    const logoUrl = `${window.location.origin}/images/Luna%20logo3.png`;
    const signatureLogoUrl = `${window.location.origin}/images/Luna%20L%2044.png`;
    const phaseArcImageUrl = `${window.location.origin}/images/moon_phases_arc.webp`;
    const totals = parsedValues.reduce(
      (acc, item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        if (status === 'normal') acc.normal += 1;
        else if (status === 'low') acc.low += 1;
        else if (status === 'high') acc.high += 1;
        else acc.unknown += 1;
        return acc;
      },
      { normal: 0, low: 0, high: 0, unknown: 0 },
    );
    const totalMarkers = parsedValues.length;
    const outOfRange = totals.low + totals.high;
    const riskIndex = totalMarkers ? Math.round((outOfRange / totalMarkers) * 100) : 0;
    const stabilityIndex = totalMarkers ? Math.round((totals.normal / totalMarkers) * 100) : 0;
    const intimacyIndex = Math.max(0, Math.min(100, Math.round(sexualOverview.avgPositive * 20 - sexualOverview.pain * 8)));
    const categoryMap = parsedValues.reduce<Record<string, number>>((acc, item) => {
      const category = markerCategory(item.marker);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    const categoryRows = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => {
        const width = totalMarkers ? Math.max(10, Math.round((count / totalMarkers) * 100)) : 10;
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#334155;">
            <span>${escapeHtml(category)}</span><span>${count}</span>
          </div>
          <div style="height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin-top:4px;">
            <span style="display:block;height:100%;width:${width}%;background:linear-gradient(90deg,#7c3aed,#fb7185,#14b8a6);"></span>
          </div>
        </div>`;
      })
      .join('');

    const markerRows = parsedValues
      .map((item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const topic = hormoneTopic(item.marker);
        const reference =
          Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
            ? `${item.referenceMin}-${item.referenceMax}`
            : (reportsUi.na || 'n/a');
        const explanation = markerStatusExplanation(status);
        const badge =
          status === 'normal'
            ? '#047857'
            : status === 'low'
              ? '#b45309'
              : status === 'high'
                ? '#be123c'
                : '#475569';
        const valueColor =
          status === 'normal'
            ? '#047857'
            : status === 'low'
              ? '#b45309'
              : status === 'high'
                ? '#be123c'
                : topic.accent;
        return `<tr>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;\"><span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${topic.accent};margin-right:6px;"></span><strong style="color:${topic.accent};">${escapeHtml(item.marker)}</strong></td>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;\"><strong style="color:${valueColor};font-size:14px;">${escapeHtml(`${item.value}${item.unit ? ` ${item.unit}` : ''}`)}</strong></td>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;\">${escapeHtml(reference)}</td>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;\"><span style=\"display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid ${badge};color:${badge};font-weight:700;font-size:11px;text-transform:uppercase;\">${status}</span></td>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;color:${topic.accent};font-weight:700;\">${escapeHtml(markerCategory(item.marker))}</td>
          <td style=\"padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;line-height:1.5;\">${escapeHtml(explanation)}</td>
        </tr>`;
      })
      .join('');
    const keyFindings = parsedValues
      .map((item) => ({ item, status: inferStatus(item.value, item.referenceMin, item.referenceMax) }))
      .filter((row) => row.status === 'low' || row.status === 'high')
      .slice(0, 6);
    const summary = escapeHtml(analysis?.text || reportsUi.reportReadyBody);
    const safeIdentity = escapeHtml(reportIdentityLine || reportsUi.privateIdentity);
    const safeAnalysisSource = escapeHtml(analysisSource);
    const findingsHtml = keyFindings.length
      ? keyFindings
          .map(({ item, status }) => `<li style=\"margin:0 0 6px;line-height:1.5;\"><strong>${escapeHtml(item.marker)}</strong>: ${escapeHtml(markerStatusExplanation(status))}</li>`)
          .join('')
      : `<li style=\"margin:0;line-height:1.5;\">${escapeHtml(detailedUi.noMarkers)}</li>`;
    const doctorQuestionsHtml = doctorQuestions.length
      ? doctorQuestions.map((question) => `<li style=\"margin:0 0 6px;line-height:1.5;\">${escapeHtml(question)}</li>`).join('')
      : `<li style=\"margin:0;line-height:1.5;\">${escapeHtml(detailedUi.noQuestions)}</li>`;
    const combinationCardsHtml = womenClinicalInsights.combinations.length
      ? womenClinicalInsights.combinations
          .map((item) => {
            const palette =
              item.level === 'high'
                ? { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', label: womenUi.highPriority }
                : item.level === 'watch'
                  ? { bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: womenUi.watch }
                  : { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', label: womenUi.stable };
            return `<article style="border:1px solid ${palette.border};background:${palette.bg};border-radius:12px;padding:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                <h4 style="margin:0;font-size:13px;font-weight:800;color:#0f172a;">${escapeHtml(item.title)}</h4>
                <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${palette.text};">${escapeHtml(palette.label)}</span>
              </div>
              <p style="margin:0;font-size:12px;line-height:1.55;color:#334155;">${escapeHtml(item.body)}</p>
            </article>`;
          })
          .join('')
      : `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(womenUi.noData)}</p>`;
    const womenEffectsHtml = womenClinicalInsights.effects.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');
    const womenRisksHtml = womenClinicalInsights.risks.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');
    const womenRecommendationsHtml = womenClinicalInsights.recommendations.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');
    const statusDistributionInfographic = `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">
      <div style="padding:10px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#047857;">${escapeHtml(womenUi.stable)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#047857;">${totals.normal}</p></div>
      <div style="padding:10px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#b45309;">${escapeHtml(womenUi.watch)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#b45309;">${totals.low}</p></div>
      <div style="padding:10px;border-radius:10px;background:#fff1f2;border:1px solid #fecdd3;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#be123c;">${escapeHtml(womenUi.highPriority)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#be123c;">${totals.high}</p></div>
      <div style="padding:10px;border-radius:10px;background:#f1f5f9;border:1px solid #cbd5e1;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#475569;">${escapeHtml(reportsUi.na || 'n/a')}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#475569;">${totals.unknown}</p></div>
    </div>`;
    const topicLegendHtml = hormoneTopicStats.length
      ? `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">${hormoneTopicStats
          .map((entry) => `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#fff;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:10px;height:10px;border-radius:999px;background:${entry.meta.accent};display:inline-block;"></span>
              <strong style="font-size:11px;color:${entry.meta.accent};">${escapeHtml(entry.meta.label)}</strong>
            </div>
            <p style="margin:5px 0 0;font-size:18px;font-weight:900;color:#0f172a;">${entry.count}</p>
          </div>`)
          .join('')}</div>`
      : '';
    const spotlightRows = parsedValues
      .slice(0, 6)
      .map((item) => {
        const topic = hormoneTopic(item.marker);
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const tone = status === 'high' ? '#fff1f2' : status === 'low' ? '#fffbeb' : status === 'normal' ? '#ecfdf5' : '#f8fafc';
        return `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:${tone};">
          <p style="margin:0;font-size:11px;font-weight:800;color:${topic.accent};">${escapeHtml(item.marker)}</p>
          <p style="margin:3px 0 0;font-size:18px;font-weight:900;color:${topic.accent};">${escapeHtml(`${item.value}${item.unit ? ` ${item.unit}` : ''}`)}</p>
        </div>`;
      })
      .join('');
    const hormoneInfographicHtml = hormoneTopicStats.length
      ? hormoneTopicStats
          .map((item) => `<div style="margin-bottom:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:800;">
              <span style="color:${item.meta.accent};">${escapeHtml(item.meta.label)}</span>
              <span style="color:#475569;">${item.count}</span>
            </div>
            <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-top:4px;">
              <span style="display:block;height:100%;width:${Math.max(item.ratio, 10)}%;background:${item.meta.accent};"></span>
            </div>
          </div>`)
          .join('')
      : `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(detailedUi.noMarkers)}</p>`;
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(detailedUi.title)}</title>
  <style>
    @page { size: A4; margin: 11mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #eaf0f8; color: #0f172a; padding: 24px; }
    .report-root { max-width: 1040px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 54px rgba(15,23,42,0.12); }
    .print-avoid { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { background: #fff; padding: 0; }
      .report-root { max-width: 100%; border: none; border-radius: 0; box-shadow: none; }
      .print-avoid { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-root">
    <div style="padding:26px;background:linear-gradient(120deg,#ede9fe,#ffe4e6,#ccfbf1);border-bottom:2px solid #cbd5e1;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${logoUrl}" alt="Luna logo" style="width:62px;height:62px;object-fit:contain;border-radius:12px;background:#fff;padding:7px;border:1px solid #e2e8f0;"/>
          <div>
            <p style="margin:0;font-size:42px;line-height:1;font-family:'Brush Script MT','Segoe Script',cursive;">Luna</p>
            <p style="margin:4px 0 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(detailedUi.subtitle)}</p>
          </div>
        </div>
        <div style="text-align:right;min-width:260px;">
          <p style="margin:0;font-size:12px;font-weight:700;">${medForm.generatedAt}: ${reportGeneratedAt}</p>
          <p style="margin:5px 0 0;font-size:12px;">${medForm.patientId}: ${safeIdentity}</p>
          <p style="margin:5px 0 0;font-size:11px;color:#475569;">${medForm.source}: ${safeAnalysisSource}</p>
        </div>
      </div>
    </div>

    <div class="print-avoid" style="padding:20px 24px 4px;">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
        <div style="border:1px solid #dbeafe;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1d4ed8;">${medForm.allMarkers}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#1e3a8a;">${totalMarkers}</p>
        </div>
        <div style="border:1px solid #dcfce7;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#047857;">${reportsUi.withinRange}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#047857;">${stabilityIndex}%</p>
        </div>
        <div style="border:1px solid #fee2e2;background:linear-gradient(135deg,#fff1f2,#fee2e2);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${reportsUi.outOfRange}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#b91c1c;">${riskIndex}%</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px;">
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">${reportsUi.quickOverview}</p>
          <div style="display:flex;height:12px;border-radius:999px;overflow:hidden;background:#e2e8f0;">
            <span style="width:${totalMarkers ? Math.round((totals.normal / totalMarkers) * 100) : 0}%;background:#10b981;"></span>
            <span style="width:${totalMarkers ? Math.round((totals.low / totalMarkers) * 100) : 0}%;background:#f59e0b;"></span>
            <span style="width:${totalMarkers ? Math.round((totals.high / totalMarkers) * 100) : 0}%;background:#f43f5e;"></span>
            <span style="width:${totalMarkers ? Math.round((totals.unknown / totalMarkers) * 100) : 0}%;background:#64748b;"></span>
          </div>
          <p style="margin:8px 0 0;font-size:11px;color:#475569;">${escapeHtml(womenUi.stable)} ${totals.normal} • ${escapeHtml(womenUi.watch)} ${totals.low} • ${escapeHtml(womenUi.highPriority)} ${totals.high} • ${escapeHtml(reportsUi.na || 'n/a')} ${totals.unknown}</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">${sexualUi.sexualSnapshotTitle}</p>
          <p style="margin:0;font-size:30px;font-weight:900;color:#7c3aed;">${intimacyIndex}%</p>
          <p style="margin:2px 0 0;font-size:11px;color:#475569;">${sexualUi.summaryLabel}: ${sexualOverview.avgPositive}/5 • ${sexualUi.scoreLabels.pain} ${sexualOverview.pain}/5</p>
        </div>
      </div>
    </div>

    <div class="print-avoid" style="padding:10px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(womenUi.combinationsTitle)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        ${categoryRows || `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(detailedUi.noMarkers)}</p>`}
      </div>
    </div>

    <div class="print-avoid" style="padding:12px 24px 0;">
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:10px;">
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${reportsUi.hormoneInfographic}</p>
          ${hormoneInfographicHtml}
        </article>
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${reportsUi.day} ${profile.cycleDay || systemState.currentDay}</p>
          <img src="${phaseArcImageUrl}" alt="Cycle arc" style="width:100%;height:88px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;"/>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:12px 24px 0;">
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:10px;">
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${reportsUi.detectedMarkers}</p>
          ${statusDistributionInfographic}
          <div style="margin-top:8px;">${topicLegendHtml}</div>
        </article>
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${reportsUi.hormoneSignals}</p>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">
            ${spotlightRows || `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(detailedUi.noMarkers)}</p>`}
          </div>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(detailedUi.keyFindings)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        <ul style="margin:0;padding-left:18px;font-size:13px;">${findingsHtml}</ul>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(womenUi.clinicalFocusTitle)}</h3>
      <p style="margin:0 0 10px;font-size:12px;color:#475569;">${escapeHtml(womenUi.clinicalFocusLead)}</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
        ${combinationCardsHtml}
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#eff6ff;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#1d4ed8;">${escapeHtml(womenUi.effectsTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${womenEffectsHtml}</ul>
        </article>
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#fff1f2;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#be123c;">${escapeHtml(womenUi.risksTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${womenRisksHtml}</ul>
        </article>
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#ecfeff;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#0f766e;">${escapeHtml(womenUi.recommendationsTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${womenRecommendationsHtml}</ul>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${medForm.allMarkers}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc;text-transform:uppercase;font-size:11px;">
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${reportsUi.marker || 'Marker'}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${reportsUi.value || 'Value'}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${reportsUi.reference || 'Reference'}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${reportsUi.status}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${womenUi.combinationsTitle}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(detailedUi.explanation)}</th>
          </tr>
        </thead>
        <tbody>${markerRows || `<tr><td colspan="6" style="padding:10px;">${escapeHtml(detailedUi.noMarkers)}</td></tr>`}</tbody>
      </table>
    </div>

    <div class="print-avoid" style="padding:16px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(detailedUi.whatHappening)}</h3>
      <p style="white-space:pre-wrap;line-height:1.68;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;font-size:13px;">${summary}</p>
    </div>

    <div class="print-avoid" style="padding:16px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(detailedUi.doctorQuestions)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        <ul style="margin:0;padding-left:18px;font-size:13px;">${doctorQuestionsHtml}</ul>
      </div>
    </div>

    <div class="print-avoid" style="padding:16px 24px 20px;">
      <div style="border:2px solid #b91c1c;border-radius:10px;padding:12px;background:#fef2f2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${medForm.disclaimerTitle}</p>
        <p style="margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;">${medForm.disclaimerBody}</p>
      </div>
    </div>

    <div style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <p style="margin:0;font-size:11px;color:#475569;">${escapeHtml(reportCopyright)}</p>
      <img src="${signatureLogoUrl}" alt="Luna mark" style="width:26px;height:26px;object-fit:contain;opacity:0.9;"/>
    </div>
  </div>
</body>
</html>`;
  }, [analysis?.text, analysisSource, detailedUi.doctorQuestions, detailedUi.explanation, detailedUi.keyFindings, detailedUi.noMarkers, detailedUi.noQuestions, doctorQuestions, hormoneTopicStats, medForm.allMarkers, medForm.disclaimerBody, medForm.disclaimerTitle, medForm.generatedAt, medForm.patientId, medForm.source, parsedValues, profile.cycleDay, reportCopyright, reportGeneratedAt, reportIdentityLine, reportsUi.day, reportsUi.detectedMarkers, reportsUi.hormoneInfographic, reportsUi.hormoneSignals, reportsUi.marker, reportsUi.na, reportsUi.outOfRange, reportsUi.privateIdentity, reportsUi.quickOverview, reportsUi.reference, reportsUi.reportReadyBody, reportsUi.status, reportsUi.value, reportsUi.withinRange, sexualOverview.avgPositive, sexualOverview.pain, sexualUi.scoreLabels.pain, sexualUi.sexualSnapshotTitle, sexualUi.summaryLabel, systemState.currentDay, womenClinicalInsights.combinations, womenClinicalInsights.effects, womenClinicalInsights.recommendations, womenClinicalInsights.risks, womenUi.clinicalFocusLead, womenUi.clinicalFocusTitle, womenUi.combinationsTitle, womenUi.effectsTitle, womenUi.highPriority, womenUi.noData, womenUi.recommendationsTitle, womenUi.risksTitle, womenUi.stable, womenUi.watch]);

  const handleAnalyze = async () => {
    const manualText = buildManualRowsText();
    const combinedInput = [buildProfileText(), manualText, input].filter(Boolean).join('\n\n').trim();
    if (!combinedInput) return;

    setLoading(true);
    try {
      const sourceHint = (uploadFeedback || '').toLowerCase();
      const parsedInputSource: ParsedLabValue['source'] =
        sourceHint.includes('pdf') ? 'pdf' : sourceHint.includes('scan') || sourceHint.includes('ocr') || sourceHint.includes('ai') ? 'ocr' : 'text';
      const parsedFromText = parseLabText([manualText, input].filter(Boolean).join('\n')).map((item) => ({ ...item, source: parsedInputSource }));
      const rawMerged = [...parseManualRowsToParsed(), ...parsedFromText];
      const conflicts = detectLabValueConflicts(rawMerged);
      const parsedMerged = mergeParsedLabValues(rawMerged, {});
      setRawParsedValues(rawMerged);
      setLabConflicts(conflicts);
      setConflictChoices({});
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
    setCopyFeedback(copied ? reportActions.copied : reportActions.copyFailed);
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
    setReportActionFeedback(copied ? reportActions.copied : reportActions.copyFailed);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportShare = async () => {
    const result = await shareTextSafely(reportText, reportUi.reportTitle);
    setReportActionFeedback(result === 'failed' ? reportActions.shareFailed : result === 'shared' ? reportActions.shared : reportActions.copied);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPrint = () => {
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? reportActions.printOpened : reportActions.printBlocked);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportDownload = () => {
    downloadFile(`luna-report-${reportLang}-${Date.now()}.html`, reportHtml, 'text/html;charset=utf-8');
    setReportActionFeedback(reportActions.downloaded);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPdf = () => {
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? reportActions.pdfHint : reportActions.pdfBlocked);
    setTimeout(() => setReportActionFeedback(null), 2400);
  };

  const handleSampleDownload = () => {
    const logoUrl = `${window.location.origin}/images/Luna%20logo3.png`;
    const phaseArcImageUrl = `${window.location.origin}/images/moon_phases_arc.webp`;
    const sampleRows = [
      ['Estradiol (E2)', '148 pg/mL', '30-400', 'normal', markerCategory('Estradiol (E2)'), detailedUi.statusNormal],
      ['Progesterone', '8.1 ng/mL', '0.2-25', 'normal', markerCategory('Progesterone'), detailedUi.statusNormal],
      ['TSH', '4.8 mIU/L', '0.4-4.0', 'high', markerCategory('TSH'), detailedUi.statusHigh],
      ['Ferritin', '18 ng/mL', '15-150', 'low-normal', markerCategory('Ferritin'), detailedUi.statusLow],
    ];
    const sampleSpotlight = sampleRows
      .map((row) => {
        const topic = hormoneTopic(String(row[0]));
        return `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#f8fafc;">
          <p style="margin:0;font-size:11px;font-weight:800;color:${topic.accent};">${escapeHtml(String(row[0]))}</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:900;color:${topic.accent};">${escapeHtml(String(row[1]))}</p>
        </div>`;
      })
      .join('');
    const sampleHtml = `<!doctype html><html><head><meta charset=\"utf-8\"/><title>Luna Sample Report</title><style>@page{size:A4;margin:11mm;}*{box-sizing:border-box;}body{margin:0;font-family:Arial,sans-serif;background:#f1f5f9;color:#0f172a;padding:24px;} .sample-root{max-width:960px;margin:0 auto;background:#fff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden;} @media print{body{background:#fff;padding:0;}.sample-root{max-width:100%;border:none;border-radius:0;}}</style></head><body><div class=\"sample-root\"><div style=\"padding:22px;background:linear-gradient(135deg,#f3e8ff,#ffe4e6,#ccfbf1);border-bottom:2px solid #cbd5e1;\"><div style=\"display:flex;align-items:center;justify-content:space-between;gap:10px;\"><div style=\"display:flex;align-items:center;gap:10px;\"><img src=\"${logoUrl}\" alt=\"Luna logo\" style=\"width:52px;height:52px;object-fit:contain;border-radius:10px;background:#fff;padding:6px;border:1px solid #e2e8f0;\"/><div><p style=\"margin:0;font-size:34px;line-height:1;font-family:'Brush Script MT','Segoe Script',cursive;\">Luna</p><p style=\"margin:2px 0 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;\">${escapeHtml(detailedUi.subtitle)} - SAMPLE</p></div></div><div style=\"text-align:right;\"><p style=\"margin:0;font-size:11px;font-weight:700;\">${medForm.generatedAt}: ${reportGeneratedAt}</p><p style=\"margin:4px 0 0;font-size:11px;\">${medForm.patientId}: SAMPLE-001</p></div></div></div><div style=\"padding:20px 22px;\"><div style=\"display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;\"><div style=\"padding:10px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;\"><p style=\"margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#047857;\">Normal</p><p style=\"margin:2px 0 0;font-size:22px;font-weight:900;color:#047857;\">2</p></div><div style=\"padding:10px;border-radius:10px;background:#fff1f2;border:1px solid #fecdd3;\"><p style=\"margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#be123c;\">High</p><p style=\"margin:2px 0 0;font-size:22px;font-weight:900;color:#be123c;\">1</p></div><div style=\"padding:10px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;\"><p style=\"margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#b45309;\">Low / Watch</p><p style=\"margin:2px 0 0;font-size:22px;font-weight:900;color:#b45309;\">1</p></div></div><div style=\"display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-top:10px;\"><article style=\"border:1px solid #e2e8f0;border-radius:10px;padding:10px;background:#f8fafc;\"><p style=\"margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;color:#334155;\">Hormone Spotlight</p><div style=\"display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;\">${sampleSpotlight}</div></article><article style=\"border:1px solid #e2e8f0;border-radius:10px;padding:10px;background:#f8fafc;\"><p style=\"margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;color:#334155;\">Cycle Visual</p><img src=\"${phaseArcImageUrl}\" alt=\"Cycle visual\" style=\"width:100%;height:90px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;\"/></article></div><table style=\"width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;\"><tr><td style=\"padding:8px;border:1px solid #e2e8f0;\"><strong>${medForm.panel}</strong></td><td style=\"padding:8px;border:1px solid #e2e8f0;\">Cycle day 21</td><td style=\"padding:8px;border:1px solid #e2e8f0;\">Sexual score 3.5/5 | pain 2/5</td></tr><tr><td style=\"padding:8px;border:1px solid #e2e8f0;\"><strong>${medForm.source}</strong></td><td colspan=\"2\" style=\"padding:8px;border:1px solid #e2e8f0;\">Lab PDF scan + manual profile</td></tr></table><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${medForm.allMarkers}</h3><table style=\"width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;\"><thead><tr style=\"background:#f8fafc;text-transform:uppercase;font-size:11px;\"><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Marker</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Value</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Reference</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Status</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">Category</th><th style=\"text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;\">${escapeHtml(detailedUi.explanation)}</th></tr></thead><tbody>${sampleRows.map((row) => { const topic = hormoneTopic(String(row[0])); return `<tr><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\"><strong style=\"color:${topic.accent};\">${escapeHtml(String(row[0]))}</strong></td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\"><strong style=\"color:${topic.accent};font-size:14px;\">${escapeHtml(String(row[1]))}</strong></td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${escapeHtml(String(row[2]))}</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${escapeHtml(String(row[3]))}</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;color:${topic.accent};font-weight:700;\">${escapeHtml(String(row[4]))}</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;\">${escapeHtml(String(row[5]))}</td></tr>`; }).join('')}</tbody></table><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${escapeHtml(womenUi.clinicalFocusTitle)}</h3><div style=\"border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;\"><p style=\"margin:0 0 8px;font-size:12px;font-weight:800;\">${escapeHtml(womenUi.estProgTitle)}</p><p style=\"margin:0 0 10px;font-size:12px;line-height:1.55;\">${escapeHtml(womenUi.estProgBody)}</p><p style=\"margin:0 0 8px;font-size:12px;font-weight:800;\">${escapeHtml(womenUi.insulinAndrogenTitle)}</p><p style=\"margin:0;font-size:12px;line-height:1.55;\">${escapeHtml(womenUi.insulinAndrogenBody)}</p></div><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${escapeHtml(womenUi.recommendationsTitle)}</h3><ul style=\"margin:0;padding-left:18px;font-size:12px;line-height:1.55;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#ecfeff;\"><li>${escapeHtml(womenUi.recCycle)}</li><li>${escapeHtml(womenUi.recRepeat)}</li><li>${escapeHtml(womenUi.recDoctor)}</li><li>${escapeHtml(womenUi.recLifestyle)}</li></ul><h3 style=\"margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;\">${medForm.summary}</h3><p style=\"white-space:pre-wrap;line-height:1.6;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;\">${escapeHtml(reportUi.servicePromise)}\n• ${reportUi.serviceBullets.map(escapeHtml).join('\n• ')}</p><div style=\"margin-top:18px;border:2px solid #b91c1c;border-radius:10px;padding:12px;background:#fef2f2;\"><p style=\"margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;\">${medForm.disclaimerTitle}</p><p style=\"margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;\">${medForm.disclaimerBody}</p></div></div><div style=\"padding:12px 22px;border-top:1px solid #e2e8f0;background:#f8fafc;\"><p style=\"margin:0;font-size:11px;color:#475569;\">${escapeHtml(reportCopyright)}</p></div></div></body></html>`;
    const localizedSampleHtml = sampleHtml
      .replaceAll('Luna Sample Report', `${reportUi.reportTitle} - ${reportUi.sampleTitle}`)
      .replaceAll(' - SAMPLE', ` - ${reportUi.sampleTitle}`)
      .replaceAll('>Normal<', `>${escapeHtml(womenUi.stable)}<`)
      .replaceAll('>High<', `>${escapeHtml(womenUi.highPriority)}<`)
      .replaceAll('>Low / Watch<', `>${escapeHtml(womenUi.watch)}<`)
      .replaceAll('>Hormone Spotlight<', `>${escapeHtml(reportsUi.hormoneSignals)}<`)
      .replaceAll('>Cycle Visual<', `>${escapeHtml(reportsUi.day)} ${profile.cycleDay || systemState.currentDay || 21}<`)
      .replaceAll('>Cycle day 21<', `>${escapeHtml(reportsUi.day)} 21<`)
      .replaceAll('>Sexual score 3.5/5 | pain 2/5<', `>${escapeHtml(sexualUi.summaryLabel)} 3.5/5 | ${escapeHtml(sexualUi.scoreLabels.pain)} 2/5<`)
      .replaceAll('>Lab PDF scan + manual profile<', `>${escapeHtml(reportSourcesUi.textInput)} + ${escapeHtml(reportSourcesUi.manualTable)}<`)
      .replaceAll('>Marker<', `>${escapeHtml(reportsUi.marker || 'Marker')}<`)
      .replaceAll('>Value<', `>${escapeHtml(reportsUi.value || 'Value')}<`)
      .replaceAll('>Reference<', `>${escapeHtml(reportsUi.reference || 'Reference')}<`)
      .replaceAll('>Status<', `>${escapeHtml(reportsUi.status)}<`)
      .replaceAll('>Category<', `>${escapeHtml(womenUi.combinationsTitle)}<`);
    downloadFile(`luna-sample-report-${reportLang}.html`, localizedSampleHtml, 'text/html;charset=utf-8');
    setReportActionFeedback(reportActions.sampleDownloaded);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedLabFile(file)) {
      setUploadFeedback(reportsUi.unsupportedFormat);
      event.target.value = '';
      return;
    }

    try {
      const extracted = await extractTextFromLabFile(file);
      if (extracted.text.trim()) {
        setInput((prev) => (prev ? `${prev}\n${extracted.text}` : extracted.text));
      }
      setUploadFeedback(extracted.source + (extracted.usedAi ? ` (${reportsUi.aiScan})` : ''));
    } catch {
      setUploadFeedback(reportsUi.extractFailed);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <article className="max-w-7xl mx-auto luna-page-shell luna-page-reports space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-8 md:p-10 pb-40 relative dark:text-white">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-500 dark:text-slate-200">{reportsUi.badge}</span>
        </div>
        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase text-slate-950 dark:text-slate-100">
          {reportsUi.title} <span className="text-luna-purple">{reportsUi.titleAccent}</span>
        </h2>
        <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-semibold max-w-4xl leading-relaxed">
          {reportsUi.workflow}
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
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">{reportsUi.identityTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeIdInReport} onChange={(e) => setIncludeIdInReport(e.target.checked)} />
                {reportsUi.includeId}
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeNameInReport} onChange={(e) => setIncludeNameInReport(e.target.checked)} disabled={!userName} />
                {reportsUi.includeName}
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.userIdOverride}</span>
                <input value={manualReportId} onChange={(e) => setManualReportId(e.target.value)} placeholder={reportId} className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold" />
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportLangUi.label}</span>
                <select
                  value={reportLang}
                  onChange={(e) => setReportLang(e.target.value as Language)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {(Object.keys(reportLanguageNames) as Language[]).map((languageCode) => (
                    <option key={languageCode} value={languageCode}>
                      {reportLanguageNames[languageCode]}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{reportLangUi.hint}</p>
              </label>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportsUi.current}: {reportIdentityLine || reportsUi.privateIdentity}</p>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">{reportsUi.profileTitle}</h3>
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
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.goals}</span>
                <textarea
                  value={profile.goals}
                  onChange={(e) => updateProfile('goals', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100 resize-none"
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.symptomsQuick}</p>
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
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-luna-purple">{reportsUi.labTable}</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyTemplate('hormone_core')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.cycle}</button>
                <button onClick={() => applyTemplate('thyroid')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.thyroid}</button>
                <button onClick={() => applyTemplate('metabolic')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.metabolic}</button>
                <button onClick={() => applyTemplate('libido_intimacy')} className="px-3 py-2 rounded-full border border-luna-coral/50 text-luna-coral text-[10px] font-black uppercase tracking-[0.15em]">{sexualUi.libidoTemplate}</button>
                <button onClick={addRow} className="px-3 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.15em]">{reportsUi.addRow}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-slate-500">
                    <th className="py-2 pr-2">{reportsUi.marker}</th>
                    <th className="py-2 pr-2">{reportsUi.value}</th>
                    <th className="py-2 pr-2">{reportsUi.unit}</th>
                    <th className="py-2 pr-2">{reportsUi.reference}</th>
                    <th className="py-2 pr-2">{reportsUi.date}</th>
                    <th className="py-2 pr-2">{reportsUi.note}</th>
                    <th className="py-2 pr-2"> </th>
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row, rowIndex) => (
                    <tr key={row.id} className="border-t border-slate-200/70 dark:border-slate-700/60">
                      {(['marker', 'value', 'unit', 'reference', 'date', 'note'] as Array<keyof HealthLabRow>).map((field) => (
                        <td key={field} className="py-2 pr-2">
                          <input
                            data-testid={`labs-manual-${field}-${rowIndex}`}
                            value={row[field]}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-xs font-semibold"
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-2">
                        <button onClick={() => removeRow(row.id)} className="px-2 py-1 rounded-md border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.delete}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{reportsUi.uploadTitle}</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.15em]">{reportsUi.uploadFile}</button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.md,.pdf,.png,.jpg,.jpeg,.webp,text/plain,application/pdf,image/*" onChange={handleFileUpload} />
            </div>
            <textarea
              data-testid="labs-report-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={reportsUi.uploadPlaceholder}
              className="w-full h-56 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/70 text-sm font-semibold leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{uploadFeedback || reportsUi.readyExtraction}</p>
              <button
                data-testid="labs-generate-report"
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 rounded-full bg-slate-950 dark:bg-[#17366b] text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-40"
              >
                {loading ? reportsUi.reading : reportsUi.generate}
              </button>
            </div>
          </article>

          {labConflicts.length > 0 && (
            <article data-testid="labs-conflicts-card" className="rounded-[2rem] border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-900/10 p-6 space-y-4 shadow-luna-rich">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">{conflictsUi.title}</h3>
              <p className="text-sm font-semibold text-amber-800/90 dark:text-amber-200/90">{conflictsUi.hint}</p>
              <div className="space-y-3">
                {labConflicts.map((conflict, conflictIndex) => (
                  <div data-testid={`labs-conflict-${conflictIndex}`} key={conflict.key} className="rounded-xl border border-amber-200/80 dark:border-amber-700/50 bg-white/70 dark:bg-slate-900/60 p-3 space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">{conflict.marker}</p>
                    <div className="space-y-2">
                      {conflict.options.map((option, idx) => {
                        const selected = (conflictChoices[conflict.key] ?? 0) === idx;
                        return (
                          <label data-testid={`labs-conflict-option-${conflictIndex}-${idx}`} key={`${conflict.key}-${idx}`} className={`flex items-start gap-3 rounded-lg border p-2 cursor-pointer ${selected ? 'border-amber-400 bg-amber-100/70 dark:bg-amber-900/30' : 'border-slate-300/70 dark:border-slate-700/70'}`}>
                            <input
                              type="radio"
                              name={`conflict-${conflict.key}`}
                              checked={selected}
                              onChange={() => setConflictChoices((prev) => ({ ...prev, [conflict.key]: idx }))}
                              className="mt-1 accent-amber-500"
                            />
                            <div className="space-y-1">
                              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                {conflictsUi.choose}: {option.value}{option.unit ? ` ${option.unit}` : ''}
                                {Number.isFinite(option.referenceMin as number) && Number.isFinite(option.referenceMax as number) ? ` (${option.referenceMin}-${option.referenceMax})` : ''}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {conflictsUi.source}: {sourceLabel(option.source)} • {conflictsUi.confidence}: {confidenceScore(option)}%
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>

        <aside className="xl:col-span-5 space-y-6">
          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#efe1ea]/92 to-[#dce6f4]/90 dark:from-[#08162f]/92 dark:to-[#0b2040]/90 p-6 space-y-3 shadow-luna-rich">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.quickOverview}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.withinRange}</p>
                <p data-testid="labs-within-count" className="text-2xl font-black text-emerald-600">{markerStatuses.normal}</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.outOfRange}</p>
                <p data-testid="labs-outofrange-count" className="text-2xl font-black text-rose-600">{markerStatuses.low + markerStatuses.high}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{hormoneSummary}</p>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#e8e6f8]/90 via-[#e7f2fb]/88 to-[#e6f7f3]/86 dark:from-[#0d1f3f]/92 dark:via-[#12294b]/90 dark:to-[#133651]/88 p-6 space-y-4 shadow-luna-rich">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.hormoneInfographic}</p>
              <img src="/images/moon_phases_arc.webp" alt="Cycle visual" className="h-10 w-24 object-cover rounded-lg border border-white/60 dark:border-slate-700/60" />
            </div>
            <div className="space-y-2">
              {hormoneTopicStats.length > 0 ? hormoneTopicStats.map((entry) => (
                <div key={entry.topicKey} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-black uppercase tracking-[0.08em] ${entry.meta.textClass}`}>{entry.meta.label}</p>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-300">{entry.count}</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/70 dark:bg-slate-900/70 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(10, entry.ratio)}%`, background: entry.meta.accent }} />
                  </div>
                </div>
              )) : (
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportsUi.unlockInfographic}</p>
              )}
            </div>
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
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{profile.cycleDay || systemState.currentDay} {reportsUi.day}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{reportIdentityLine || reportUi.reportSubtitle}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed line-clamp-4">{analysis?.text || reportUi.sampleBody}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={handleReportCopy} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.copy}</button>
              <button onClick={handleReportPrint} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.print}</button>
              <button onClick={handleReportShare} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.share}</button>
              <button onClick={handleReportDownload} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.download}</button>
              <button onClick={handleReportPdf} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-luna-purple/35 bg-luna-purple/10 text-[10px] font-black tracking-[0.05em] text-luna-purple whitespace-normal break-words leading-tight text-center">{reportUi.pdf}</button>
              <button onClick={handleSampleDownload} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-luna-coral/40 bg-luna-coral/10 text-[10px] font-black tracking-[0.05em] text-luna-coral whitespace-normal break-words leading-tight text-center">{reportUi.sampleDownload}</button>
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.hormoneSignals}</p>
              <div className="space-y-3">
                {hormoneSignals.map((signal, idx) => (
                  <div key={`${signal.marker}-${idx}`} className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-slate-50/80 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-black uppercase tracking-[0.1em] ${hormoneTopic(signal.marker).textClass}`}>{signal.hormone}</p>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${statusColor(signal.status)}`}>{signal.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${hormoneTopic(signal.marker).chipClass}`}>{hormoneTopic(signal.marker).label}</span>
                      <p className={`text-xs font-semibold ${hormoneTopic(signal.marker).textClass}`}>{signal.marker}: {signal.value}</p>
                    </div>
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
                    <p className={`text-xs font-semibold ${hormoneTopic(signal.marker).textClass}`}>{signal.marker}</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${statusColor(signal.status)}`}>{signal.status}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {doctorQuestions.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.questionsDoctor}</p>
              <ul className="space-y-2">
                {doctorQuestions.map((question) => (
                  <li key={question} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">• {question}</li>
                ))}
              </ul>
            </article>
          )}

          {parsedRows.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.detectedMarkers}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left uppercase tracking-[0.12em] text-slate-500">
                      <th className="py-2 pr-2">{reportsUi.marker}</th>
                      <th className="py-2 pr-2">{reportsUi.value}</th>
                      <th className="py-2 pr-2">{reportsUi.refShort}</th>
                      <th className="py-2 pr-2">{reportsUi.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedValues.map((item, idx) => {
                      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
                      return (
                        <tr key={`${item.marker}-${idx}`} className="border-t border-slate-200/70 dark:border-slate-700/60">
                          <td className={`py-2 pr-2 font-semibold ${hormoneTopic(item.marker).textClass}`}>{item.marker}</td>
                          <td className="py-2 pr-2">{item.value}{item.unit ? ` ${item.unit}` : ''}</td>
                          <td className="py-2 pr-2">{Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number) ? `${item.referenceMin}-${item.referenceMax}` : reportsUi.na}</td>
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{reportsUi.summaryTitle}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{analysis.text}</p>
              <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/60 pb-1">{copyFeedback || reportsUi.copyDoctor}</button>
            </article>
          ) : (
            <article className="rounded-[2rem] border-2 border-dashed border-slate-300/80 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/50 p-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{reportsUi.reportReadyTitle}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2">{reportsUi.reportReadyBody}</p>
            </article>
          )}

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-6 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{reportsUi.safetyTitle}</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{reportsUi.safetyBody}</p>
          </article>
        </aside>
      </div>
    </article>
  );
};
