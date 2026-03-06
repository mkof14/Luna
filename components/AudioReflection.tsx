import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Save, X, Volume2, Sparkles, MessageSquare, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generatePsychologistResponse } from '../services/geminiService';
import { Language } from '../constants';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;
type SavedVoiceClip = {
  id: string;
  createdAt: string;
  locale: string;
  transcript: string;
  audioDataUrl: string;
};

const VOICE_CLIPS_STORAGE_KEY = 'luna_voice_clips_v1';

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitAudioContext?: typeof AudioContext;
  }
}

export const AudioReflection: React.FC<{ onBack: () => void, lang?: Language }> = ({ onBack, lang = 'en' }) => {
  const copyByLang: Record<Language, {
    unsupported: string; listening: string; micDenied: string; errorPrefix: string; micAccess: string; noSpeech: string; unavailable: string;
    back: string; reflectionLabel: string; subtitle: string; holdToSpeak: string; stopListening: string; lunaReflecting: string; yourReflection: string;
    lunaResponse: string; reflecting: string; listenAgain: string; save: string; redo: string; recording: string;
  }> = {
    en: { unsupported: 'Your browser does not support voice recognition. Please try Chrome or Safari.', listening: 'Listening...', micDenied: 'Microphone access denied. Check browser settings.', errorPrefix: 'Error', micAccess: 'Could not access microphone.', noSpeech: "I didn't catch that. Please try again.", unavailable: 'Luna is temporarily unavailable. Please try again.', back: 'Back to Journal', reflectionLabel: 'Live Reflection', subtitle: 'Speak your state. Luna is here to listen, understand, and respond.', holdToSpeak: 'Tap to speak', stopListening: 'Stop Listening', lunaReflecting: 'Luna is reflecting...', yourReflection: 'Your Reflection', lunaResponse: "Luna's Response", reflecting: 'Reflecting...', listenAgain: 'Listen Again', save: 'Save to Journal', redo: 'Redo', recording: 'Recording...' },
    ru: { unsupported: 'Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome или Safari.', listening: 'Слушаю...', micDenied: 'Доступ к микрофону запрещен. Проверьте настройки браузера.', errorPrefix: 'Ошибка', micAccess: 'Не удалось получить доступ к микрофону.', noSpeech: 'Я не расслышала. Пожалуйста, попробуйте еще раз.', unavailable: 'Луна временно недоступна. Попробуйте еще раз.', back: 'Назад в дневник', reflectionLabel: 'Голосовая рефлексия', subtitle: 'Говорите. Луна здесь, чтобы слушать и понимать.', holdToSpeak: 'Нажмите, чтобы говорить', stopListening: 'Остановить', lunaReflecting: 'Луна размышляет...', yourReflection: 'Ваши слова', lunaResponse: 'Ответ Луны', reflecting: 'Размышляю...', listenAgain: 'Послушать еще раз', save: 'Сохранить в дневник', redo: 'Заново', recording: 'Запись...' },
    uk: { unsupported: 'Ваш браузер не підтримує розпізнавання мовлення. Спробуйте Chrome або Safari.', listening: 'Слухаю...', micDenied: 'Доступ до мікрофона заборонено. Перевірте налаштування браузера.', errorPrefix: 'Помилка', micAccess: 'Не вдалося отримати доступ до мікрофона.', noSpeech: 'Я не розчула. Спробуйте ще раз.', unavailable: 'Luna тимчасово недоступна. Спробуйте ще раз.', back: 'Назад до щоденника', reflectionLabel: 'Голосова рефлексія', subtitle: 'Говоріть. Luna тут, щоб слухати і розуміти.', holdToSpeak: 'Натисніть, щоб говорити', stopListening: 'Зупинити', lunaReflecting: 'Luna розмірковує...', yourReflection: 'Ваші слова', lunaResponse: 'Відповідь Luna', reflecting: 'Розмірковую...', listenAgain: 'Прослухати ще раз', save: 'Зберегти в щоденник', redo: 'Заново', recording: 'Запис...' },
    es: { unsupported: 'Tu navegador no admite reconocimiento de voz. Prueba Chrome o Safari.', listening: 'Escuchando...', micDenied: 'Acceso al micrófono denegado. Revisa la configuración del navegador.', errorPrefix: 'Error', micAccess: 'No se pudo acceder al micrófono.', noSpeech: 'No te entendí. Inténtalo de nuevo.', unavailable: 'Luna no está disponible temporalmente. Inténtalo de nuevo.', back: 'Volver al diario', reflectionLabel: 'Reflexión de voz', subtitle: 'Habla tu estado. Luna está aquí para escuchar y comprender.', holdToSpeak: 'Toca para hablar', stopListening: 'Detener', lunaReflecting: 'Luna está reflexionando...', yourReflection: 'Tu reflexión', lunaResponse: 'Respuesta de Luna', reflecting: 'Reflexionando...', listenAgain: 'Escuchar de nuevo', save: 'Guardar en diario', redo: 'Rehacer', recording: 'Grabando...' },
    fr: { unsupported: 'Votre navigateur ne prend pas en charge la reconnaissance vocale. Essayez Chrome ou Safari.', listening: 'J’écoute...', micDenied: 'Accès au microphone refusé. Vérifiez les paramètres du navigateur.', errorPrefix: 'Erreur', micAccess: 'Impossible d’accéder au microphone.', noSpeech: "Je n'ai pas bien entendu. Veuillez réessayer.", unavailable: 'Luna est temporairement indisponible. Réessayez.', back: 'Retour au journal', reflectionLabel: 'Réflexion vocale', subtitle: 'Exprimez votre état. Luna est là pour écouter et comprendre.', holdToSpeak: 'Touchez pour parler', stopListening: 'Arrêter', lunaReflecting: 'Luna réfléchit...', yourReflection: 'Votre réflexion', lunaResponse: 'Réponse de Luna', reflecting: 'Réflexion...', listenAgain: 'Réécouter', save: 'Enregistrer dans le journal', redo: 'Recommencer', recording: 'Enregistrement...' },
    de: { unsupported: 'Dein Browser unterstützt keine Spracherkennung. Bitte nutze Chrome oder Safari.', listening: 'Ich höre zu...', micDenied: 'Mikrofonzugriff verweigert. Bitte Browser-Einstellungen prüfen.', errorPrefix: 'Fehler', micAccess: 'Kein Zugriff auf das Mikrofon möglich.', noSpeech: 'Ich habe dich nicht verstanden. Bitte versuche es erneut.', unavailable: 'Luna ist vorübergehend nicht verfügbar. Bitte versuche es erneut.', back: 'Zurück zum Journal', reflectionLabel: 'Sprachreflexion', subtitle: 'Sprich deinen Zustand aus. Luna hört zu, versteht und antwortet.', holdToSpeak: 'Tippen zum Sprechen', stopListening: 'Stoppen', lunaReflecting: 'Luna reflektiert...', yourReflection: 'Deine Reflexion', lunaResponse: 'Lunas Antwort', reflecting: 'Reflektiere...', listenAgain: 'Erneut anhören', save: 'Im Journal speichern', redo: 'Neu', recording: 'Aufnahme...' },
    zh: { unsupported: '你的浏览器不支持语音识别。请尝试 Chrome 或 Safari。', listening: '正在聆听...', micDenied: '麦克风访问被拒绝。请检查浏览器设置。', errorPrefix: '错误', micAccess: '无法访问麦克风。', noSpeech: '我没有听清，请再试一次。', unavailable: 'Luna 暂时不可用，请稍后再试。', back: '返回日记', reflectionLabel: '语音反思', subtitle: '说出你的状态。Luna 会倾听、理解并回应。', holdToSpeak: '点击说话', stopListening: '停止', lunaReflecting: 'Luna 正在思考...', yourReflection: '你的表达', lunaResponse: 'Luna 的回应', reflecting: '思考中...', listenAgain: '再听一次', save: '保存到日记', redo: '重来', recording: '录音中...' },
    ja: { unsupported: 'お使いのブラウザは音声認識に対応していません。ChromeまたはSafariをお試しください。', listening: '聞いています...', micDenied: 'マイクへのアクセスが拒否されました。ブラウザ設定を確認してください。', errorPrefix: 'エラー', micAccess: 'マイクにアクセスできませんでした。', noSpeech: '聞き取れませんでした。もう一度お試しください。', unavailable: 'Lunaは一時的に利用できません。再度お試しください。', back: 'ジャーナルに戻る', reflectionLabel: '音声リフレクション', subtitle: '今の状態を話してください。Lunaが聴き、理解し、応答します。', holdToSpeak: 'タップして話す', stopListening: '停止', lunaReflecting: 'Lunaが考えています...', yourReflection: 'あなたの言葉', lunaResponse: 'Lunaの応答', reflecting: '思考中...', listenAgain: 'もう一度聞く', save: 'ジャーナルに保存', redo: 'やり直し', recording: '録音中...' },
    pt: { unsupported: 'Seu navegador não oferece suporte a reconhecimento de voz. Tente Chrome ou Safari.', listening: 'Ouvindo...', micDenied: 'Acesso ao microfone negado. Verifique as configurações do navegador.', errorPrefix: 'Erro', micAccess: 'Não foi possível acessar o microfone.', noSpeech: 'Não consegui entender. Tente novamente.', unavailable: 'Luna está temporariamente indisponível. Tente novamente.', back: 'Voltar ao diário', reflectionLabel: 'Reflexão por voz', subtitle: 'Fale seu estado. Luna está aqui para ouvir e compreender.', holdToSpeak: 'Toque para falar', stopListening: 'Parar', lunaReflecting: 'Luna está refletindo...', yourReflection: 'Sua reflexão', lunaResponse: 'Resposta da Luna', reflecting: 'Refletindo...', listenAgain: 'Ouvir novamente', save: 'Salvar no diário', redo: 'Refazer', recording: 'Gravando...' }
  };
  const copy = copyByLang[lang];
  const explanationByLang: Record<Language, { title: string; lead: string; line1: string; line2: string }> = {
    en: {
      title: 'Short explanation: Why voice matters.',
      lead: 'Reason is simple:',
      line1: 'People think faster than they write.',
      line2: 'Voice Journal lets you capture your state immediately.',
    },
    ru: {
      title: 'Короткое объяснение: Почему голос важен.',
      lead: 'Причина простая:',
      line1: 'Люди думают быстрее, чем пишут.',
      line2: 'Voice Journal позволяет фиксировать состояние сразу.',
    },
    uk: {
      title: 'Коротке пояснення: Чому голос важливий.',
      lead: 'Причина проста:',
      line1: 'Люди думають швидше, ніж пишуть.',
      line2: 'Voice Journal дозволяє фіксувати стан одразу.',
    },
    es: {
      title: 'Explicación breve: por qué la voz importa.',
      lead: 'La razón es simple:',
      line1: 'Las personas piensan más rápido de lo que escriben.',
      line2: 'Voice Journal te permite registrar tu estado de inmediato.',
    },
    fr: {
      title: 'Explication courte : pourquoi la voix est importante.',
      lead: 'La raison est simple :',
      line1: 'On pense plus vite qu’on n’écrit.',
      line2: 'Voice Journal permet de capter votre état immédiatement.',
    },
    de: {
      title: 'Kurze Erklärung: Warum Stimme wichtig ist.',
      lead: 'Der Grund ist einfach:',
      line1: 'Menschen denken schneller, als sie schreiben.',
      line2: 'Voice Journal hilft, deinen Zustand sofort festzuhalten.',
    },
    zh: {
      title: '简短说明：为什么语音很重要。',
      lead: '原因很简单：',
      line1: '人思考的速度比书写更快。',
      line2: 'Voice Journal 让你立即记录当下状态。',
    },
    ja: {
      title: '短い説明：なぜ音声が重要か。',
      lead: '理由はシンプルです：',
      line1: '人は書くより速く考えます。',
      line2: 'Voice Journal は状態をすぐに記録できます。',
    },
    pt: {
      title: 'Explicação curta: por que a voz importa.',
      lead: 'A razão é simples:',
      line1: 'As pessoas pensam mais rápido do que escrevem.',
      line2: 'Voice Journal permite registrar seu estado na hora.',
    },
  };
  const explanation = explanationByLang[lang] || explanationByLang.en;
  const recognitionLangByUi: Record<Language, string> = { en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', pt: 'pt-PT' };
  const recognitionLocales: Array<{ value: string; label: string }> = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'ru-RU', label: 'Russian' },
    { value: 'uk-UA', label: 'Ukrainian' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'zh-CN', label: 'Chinese' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'pt-PT', label: 'Portuguese' },
  ];
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(12).fill(4));
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [displayedAiResponse, setDisplayedAiResponse] = useState("");
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<'quiet' | 'normal' | 'loud'>('loud');
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechVoiceURI, setSpeechVoiceURI] = useState<string>(() => localStorage.getItem('luna_voice_uri') || '');
  const [speechLocale, setSpeechLocale] = useState<string>(() => {
    const stored = localStorage.getItem('luna_voice_locale');
    return stored || recognitionLangByUi[lang] || 'en-US';
  });
  const [sessionAudioDataUrl, setSessionAudioDataUrl] = useState<string | null>(null);
  const [isSavingRecording, setIsSavingRecording] = useState(false);
  const [savedVoiceClips, setSavedVoiceClips] = useState<SavedVoiceClip[]>(() => {
    try {
      const raw = localStorage.getItem(VOICE_CLIPS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActive = useRef(false);
  const isStoppingRecognitionRef = useRef(false);
  const isRecordingRef = useRef(false);
  const transcriptionRef = useRef("");
  const interimRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackGainRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const recorderDataUrlPromiseRef = useRef<Promise<string | null> | null>(null);
  const recorderDataUrlResolveRef = useRef<((value: string | null) => void) | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const finalizeTimerRef = useRef<number | null>(null);
  const didFinalizeRef = useRef(false);
  const recognitionLang = speechLocale || recognitionLangByUi[lang] || navigator.language || 'en-US';
  const gainByMode: Record<'quiet' | 'normal' | 'loud', number> = { quiet: 0.35, normal: 1.0, loud: 1.8 };
  const speakingPalette = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#f59e0b'];
  const localeBase = recognitionLang.toLowerCase().split('-')[0];
  const localeVoices = speechVoices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang === recognitionLang.toLowerCase() || voiceLang.startsWith(localeBase);
  });

  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    let score = 0;
    if (voice.default) score += 1;
    if (name.includes('siri')) score += 8;
    if (name.includes('google')) score += 6;
    if (name.includes('natural')) score += 8;
    if (name.includes('neural')) score += 9;
    if (name.includes('enhanced')) score += 6;
    if (name.includes('premium')) score += 6;
    if (name.includes('online')) score += 3;
    if (name.includes('compact')) score -= 4;
    if (name.includes('espeak')) score -= 8;
    return score;
  };

  const bestLocaleVoice = localeVoices.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;

  const mapLocaleToLanguage = (locale: string): Language => {
    const base = locale.toLowerCase().split('-')[0];
    if (base === 'ru') return 'ru';
    if (base === 'uk') return 'uk';
    if (base === 'es') return 'es';
    if (base === 'fr') return 'fr';
    if (base === 'de') return 'de';
    if (base === 'zh') return 'zh';
    if (base === 'ja') return 'ja';
    if (base === 'pt') return 'pt';
    return 'en';
  };

  const blobToDataUrl = (blob: Blob): Promise<string | null> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (!aiResponse) {
      setDisplayedAiResponse("");
      return;
    }
    let idx = 0;
    setDisplayedAiResponse("");
    const timer = window.setInterval(() => {
      idx += 1;
      setDisplayedAiResponse(aiResponse.slice(0, idx));
      if (idx >= aiResponse.length) {
        clearInterval(timer);
      }
    }, 12);
    return () => clearInterval(timer);
  }, [aiResponse]);

  useEffect(() => {
    if (!playbackGainRef.current) return;
    playbackGainRef.current.gain.value = isSpeakerMuted ? 0 : gainByMode[speakerMode];
  }, [gainByMode, isSpeakerMuted, speakerMode]);

  useEffect(() => {
    localStorage.setItem('luna_voice_locale', speechLocale);
  }, [speechLocale]);

  useEffect(() => {
    localStorage.setItem('luna_voice_uri', speechVoiceURI);
  }, [speechVoiceURI]);

  useEffect(() => {
    const mapped = recognitionLangByUi[lang] || 'en-US';
    const stored = localStorage.getItem('luna_voice_locale');
    if (!stored) setSpeechLocale(mapped);
  }, [lang]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => setSpeechVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (!localeVoices.length) return;
    if (speechVoiceURI && localeVoices.some((v) => v.voiceURI === speechVoiceURI)) return;
    if (bestLocaleVoice) {
      setSpeechVoiceURI(bestLocaleVoice.voiceURI);
    }
  }, [bestLocaleVoice, localeVoices, speechVoiceURI]);

  const finalizeRecognition = () => {
    if (didFinalizeRef.current) return;
    didFinalizeRef.current = true;

    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }

    const finalText = (transcriptionRef.current + " " + interimRef.current).trim().replace(/\s+/g, " ");
    setInterimTranscription("");
    interimRef.current = "";

    if (finalText) {
      setTranscription(finalText);
      handleTranscription(finalText);
      return;
    }
    setError(copy.noSpeech);
  };

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError(copy.unsupported);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recognitionLang;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setStatusMsg(copy.listening);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      console.log("Recognition result:", { final, interim });

      if (final) {
        transcriptionRef.current += (transcriptionRef.current ? ' ' : '') + final;
        setTranscription(transcriptionRef.current);
      }
      interimRef.current = interim;
      setInterimTranscription(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError(copy.micDenied);
      } else if (event.error === 'language-not-supported') {
        recognition.lang = 'en-US';
        setSpeechLocale('en-US');
      } else if (event.error === 'no-speech') {
        // Ignore no-speech during active hold
      } else {
        setError(`${copy.errorPrefix}: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      recognitionActive.current = false;
      setStatusMsg("");
      if (!isStoppingRecognitionRef.current) return;
      isStoppingRecognitionRef.current = false;
      finalizeRecognition();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        try { recognitionRef.current.abort(); } catch (_e) {}
      }
    };
  }, [copy.errorPrefix, copy.listening, copy.micDenied, copy.noSpeech, copy.unsupported, recognitionLang]);

  // Audio Visualization Loop
  useEffect(() => {
    const updateLevels = () => {
      const activeAnalyser = analyserRef.current || playbackAnalyserRef.current;
      if (activeAnalyser) {
        const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
        activeAnalyser.getByteFrequencyData(dataArray);
        const newLevels = Array(12).fill(0).map((_, i) => {
          const start = Math.floor(i * (dataArray.length / 12));
          const end = Math.floor((i + 1) * (dataArray.length / 12));
          let sum = 0;
          for (let j = start; j < end; j++) sum += dataArray[j];
          const avg = sum / (end - start);
          return Math.max(4, (avg / 255) * 60);
        });
        setAudioLevel(newLevels);
      } else if (isPlaying) {
        setAudioLevel(prev => prev.map(() => Math.random() * 30 + 5));
      } else {
        setAudioLevel(Array(12).fill(4));
      }
      animationIdRef.current = requestAnimationFrame(updateLevels);
    };

    animationIdRef.current = requestAnimationFrame(updateLevels);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isPlaying]);

  const startRecording = async () => {
    setError(null);
    setTranscription("");
    transcriptionRef.current = "";
    interimRef.current = "";
    setInterimTranscription("");
    setAiResponse("");
    setDisplayedAiResponse("");
    setAudioBase64(null);
    setSessionAudioDataUrl(null);
    setIsSavingRecording(false);
    recorderDataUrlPromiseRef.current = null;
    recorderDataUrlResolveRef.current = null;
    stopAudio();
    didFinalizeRef.current = false;
    isStoppingRecognitionRef.current = false;
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) {
          throw new Error('AudioContext is not supported');
        }
        audioContextRef.current = new AudioContextCtor();
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      if (typeof MediaRecorder !== 'undefined') {
        const mimeTypeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        const mimeType = mimeTypeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaChunksRef.current = [];
        recorderDataUrlPromiseRef.current = new Promise<string | null>((resolve) => {
          recorderDataUrlResolveRef.current = resolve;
        });
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            mediaChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          if (!mediaChunksRef.current.length) {
            if (recorderDataUrlResolveRef.current) recorderDataUrlResolveRef.current(null);
            recorderDataUrlResolveRef.current = null;
            return;
          }
          const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl) {
            setSessionAudioDataUrl(dataUrl);
          }
          if (recorderDataUrlResolveRef.current) recorderDataUrlResolveRef.current(dataUrl);
          recorderDataUrlResolveRef.current = null;
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
      }

      if (recognitionRef.current) {
        const recognition = recognitionRef.current;
        try {
          if (recognitionActive.current) {
            try { recognition.abort(); } catch (_e) {}
          }
          recognition.start();
          recognitionActive.current = true;
          console.log("Recognition started successfully");
        } catch (e) {
          console.warn("Recognition start error:", e);
          // Fallback: try to just start
          try { 
            recognition.abort();
            setTimeout(() => {
              recognition.start(); 
              recognitionActive.current = true;
            }, 100);
          } catch (_e2) {}
        }
      }
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(copy.micAccess);
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    setIsRecording(false);
    isStoppingRecognitionRef.current = true;
    
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.stop(); 
        recognitionActive.current = false;
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    finalizeTimerRef.current = window.setTimeout(() => {
      finalizeRecognition();
    }, 2000);
  };

  const handleTranscription = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await generatePsychologistResponse(text, mapLocaleToLanguage(recognitionLang));
      setAiResponse(result.text);
      if (result.audio) {
        setAudioBase64(result.audio);
        playAudio(result.audio);
      } else {
        speakText(result.text);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setError(copy.unavailable);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stopSpeechSynthesis = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  const speakText = (text: string) => {
    if (!text || isSpeakerMuted || !window.speechSynthesis) return;
    stopSpeechSynthesis();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechVoices.length ? speechVoices : window.speechSynthesis.getVoices();
    const selectedByUser = speechVoiceURI ? voices.find((voice) => voice.voiceURI === speechVoiceURI) : null;
    const exact = voices.find((voice) => voice.lang.toLowerCase() === recognitionLang.toLowerCase());
    const byBase = voices.find((voice) => voice.lang.toLowerCase().startsWith(localeBase));
    const naturalByBase = voices
      .filter((voice) => voice.lang.toLowerCase().startsWith(localeBase))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
    const selectedVoice = selectedByUser || naturalByBase || exact || byBase || null;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = recognitionLang;
    }
    utterance.rate = speakerMode === 'quiet' ? 0.9 : speakerMode === 'normal' ? 0.96 : 1.0;
    utterance.pitch = 0.96;
    utterance.volume = speakerMode === 'quiet' ? 0.45 : speakerMode === 'normal' ? 0.9 : 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setAudioLevel(Array(12).fill(4));
    };
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = (base64: string) => {
    stopAudio();
    if (!base64) return;
    
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audioRef.current = audio;
      audio.crossOrigin = "anonymous";
      
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        const playbackContext = new AudioContextCtor();
        playbackContextRef.current = playbackContext;
        const source = playbackContext.createMediaElementSource(audio);
        const gainNode = playbackContext.createGain();
        const analyser = playbackContext.createAnalyser();
        analyser.fftSize = 64;
        gainNode.gain.value = isSpeakerMuted ? 0 : gainByMode[speakerMode];
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(playbackContext.destination);
        playbackGainRef.current = gainNode;
        playbackAnalyserRef.current = analyser;
      }

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setAudioLevel(Array(12).fill(4));
        playbackAnalyserRef.current = null;
        playbackGainRef.current = null;
        if (playbackContextRef.current) {
          playbackContextRef.current.close().catch(() => {});
          playbackContextRef.current = null;
        }
      };
      audio.onerror = () => setIsPlaying(false);
      
      audio.play().catch(err => {
        console.warn("Autoplay blocked:", err);
        setIsPlaying(false);
        if (aiResponse) speakText(aiResponse);
      });
    } catch (err) {
      console.error("Failed to initialize audio", err);
      setIsPlaying(false);
      if (aiResponse) speakText(aiResponse);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    stopSpeechSynthesis();
    playbackAnalyserRef.current = null;
    playbackGainRef.current = null;
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }
  };

  const handleSave = async () => {
    if (isSavingRecording) return;
    setIsSavingRecording(true);
    let dataUrl = sessionAudioDataUrl;

    if (!dataUrl) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_e) {}
      }
      if (recorderDataUrlPromiseRef.current) {
        dataUrl = await recorderDataUrlPromiseRef.current;
      } else if (mediaChunksRef.current.length) {
        const blob = new Blob(mediaChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        dataUrl = await blobToDataUrl(blob);
      }
    }

    if (dataUrl) {
      const clip: SavedVoiceClip = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        locale: recognitionLang,
        transcript: transcription || '',
        audioDataUrl: dataUrl,
      };
      try {
        const raw = localStorage.getItem(VOICE_CLIPS_STORAGE_KEY);
        const current = raw ? JSON.parse(raw) : [];
        const currentList: SavedVoiceClip[] = Array.isArray(current) ? current : [];
        const nextList = [clip, ...currentList].slice(0, 30);
        localStorage.setItem(VOICE_CLIPS_STORAGE_KEY, JSON.stringify(nextList));
        setSavedVoiceClips(nextList);
      } catch (_e) {
        setIsSavingRecording(false);
        setError('Could not save audio file. Storage is full or unavailable.');
        return;
      }
    }
    dataService.logEvent('AUDIO_REFLECTION', { text: transcription, ai_response: aiResponse });
    setIsSavingRecording(false);
    onBack();
  };

  const handleDeleteClip = (id: string) => {
    setSavedVoiceClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  const handleClearAllClips = () => {
    setSavedVoiceClips([]);
  };

  const handleDownloadClip = (clip: SavedVoiceClip) => {
    const link = document.createElement('a');
    link.href = clip.audioDataUrl;
    const ts = clip.createdAt.replace(/[:.]/g, '-');
    link.download = `luna-voice-${ts}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current) {
        clearTimeout(finalizeTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_e) {}
      }
      if (playbackContextRef.current) {
        playbackContextRef.current.close().catch(() => {});
      }
      stopSpeechSynthesis();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto luna-page-shell luna-page-voice space-y-8 p-6 md:p-8">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack} 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all"
      >
        <X size={14} /> {copy.back}
      </motion.button>
      
      <div className="luna-vivid-surface p-8 md:p-16 rounded-[4rem] space-y-16 text-center relative overflow-hidden border border-white/40 dark:border-slate-700/70 shadow-[0_28px_80px_rgba(88,70,126,0.22)] dark:shadow-[0_32px_82px_rgba(0,0,0,0.56)]">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-luna-purple/16 dark:bg-luna-purple/18 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-500/14 dark:bg-sky-400/16 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-luna-teal/12 dark:bg-sky-300/14 rounded-full blur-3xl" />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-luna-purple/18 via-sky-300/18 to-rose-300/12 blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 18, 0], opacity: [0.22, 0.44, 0.22] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 left-[8%] w-72 h-72 rounded-full bg-gradient-to-tr from-rose-300/20 via-luna-purple/16 to-cyan-300/14 blur-[95px]"
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_38%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.2),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.12),transparent_38%),radial-gradient(circle_at_80%_85%,rgba(148,163,184,0.1),transparent_40%)]" />

        <header className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full luna-vivid-chip text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-200 mb-2">
            <Volume2 size={12} /> {copy.reflectionLabel}
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-950 dark:text-white">
            Voice <span className="text-luna-purple">Journal.</span>
          </h2>
          <p className="text-base font-medium text-slate-500 italic max-w-md mx-auto">
            {copy.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-300">
              Speech language
            </p>
            <select
              value={speechLocale}
              onChange={(e) => setSpeechLocale(e.target.value)}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
            >
              {recognitionLocales.map((locale) => (
                <option key={locale.value} value={locale.value}>
                  {locale.label}
                </option>
              ))}
            </select>
            <select
              value={speechVoiceURI}
              onChange={(e) => setSpeechVoiceURI(e.target.value)}
              className="max-w-[260px] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.08em] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="">{bestLocaleVoice ? `Auto: ${bestLocaleVoice.name}` : 'Auto voice'}</option>
              {localeVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <article className="relative z-10 max-w-3xl mx-auto rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#faeefa]/92 via-[#efe7f5]/88 to-[#e2eefb]/84 dark:from-[#0b1832]/94 dark:via-[#12264a]/92 dark:to-[#1a345f]/90 p-6 md:p-7 text-left shadow-[0_18px_42px_rgba(93,74,132,0.2)] dark:shadow-[0_20px_46px_rgba(0,0,0,0.46)]">
          <p className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">{explanation.title}</p>
          <p className="mt-3 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{explanation.lead}</p>
          <p className="mt-2 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{explanation.line1}</p>
          <p className="mt-2 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{explanation.line2}</p>
        </article>

        <div className="flex flex-col items-center gap-12 py-10 relative z-10">
          <div className="relative">
            {!isRecording && (
              <motion.div
                animate={{ rotate: [0, 180, 360], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-5 rounded-full border border-luna-purple/35 dark:border-sky-300/30"
              />
            )}
            <AnimatePresence>
              {isRecording && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 0.2 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 bg-rose-500 rounded-full"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2.2, opacity: 0.1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-rose-500 rounded-full"
                  />
                </>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              className={`relative w-40 h-40 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 z-20 ${
                isRecording 
                ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_0_42px_rgba(244,63,94,0.5)]' 
                : 'bg-gradient-to-br from-slate-950 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-950'
              }`}
            >
              {isRecording ? <Square size={48} fill="currentColor" /> : <Mic size={48} />}
            </motion.button>
          </div>

          {/* Sound Wave Indicator */}
          <div className="h-16 flex items-center justify-center gap-2 w-full max-w-xs">
            {isPlaying && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-luna-purple mr-2"
              >
                <Volume2 size={24} className="animate-pulse" />
              </motion.div>
            )}
            <div className="flex items-center gap-1.5 h-12">
              {audioLevel.map((level, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: level }}
                  className={`w-1.5 rounded-full transition-colors duration-300 ${isRecording ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : (isPlaying ? '' : 'bg-slate-200 dark:bg-slate-800')}`}
                  style={
                    isPlaying
                      ? {
                          backgroundColor: speakingPalette[i % speakingPalette.length],
                          boxShadow: `0 0 10px ${speakingPalette[i % speakingPalette.length]}99`,
                        }
                      : undefined
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 w-full max-w-xl">
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${isRecording ? 'text-rose-500' : 'text-slate-400'}`}>
              {isRecording ? (statusMsg || copy.recording) : copy.holdToSpeak}
            </p>
            
            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {isPlaying && (
              <button onClick={stopAudio} className="flex items-center gap-2 text-luna-purple text-[9px] font-black uppercase tracking-widest mx-auto mt-2">
                <VolumeX size={12} /> {copy.stopListening}
              </button>
            )}

            {(!!audioBase64 || !!aiResponse || isPlaying) && (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/55 dark:bg-slate-900/45 backdrop-blur-md px-3 py-3 shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.36)]">
                <button
                  onClick={() => setIsSpeakerMuted((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSpeakerMuted ? 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-luna-purple/15 text-luna-purple dark:bg-luna-purple/25'}`}
                >
                  {isSpeakerMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  {isSpeakerMuted ? 'Speaker Off' : 'Speaker On'}
                </button>
                <button
                  onClick={() => setSpeakerMode((prev) => (prev === 'quiet' ? 'normal' : prev === 'normal' ? 'loud' : 'quiet'))}
                  className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {speakerMode === 'quiet' ? 'Quiet' : speakerMode === 'normal' ? 'Normal' : 'Loud'}
                </button>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-luna-purple bg-luna-purple/10 border border-luna-purple/25">
                    <span className="w-2 h-2 rounded-full bg-luna-purple animate-pulse" />
                    Luna speaks
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {(isRecording && (transcription || interimTranscription)) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto p-6 rounded-3xl border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f8edf8]/9 via-[#efe7f6]/86 to-[#e6eefb]/82 dark:from-[#0b1832]/90 dark:via-[#12264a]/88 dark:to-[#1a345f]/86 shadow-[0_12px_30px_rgba(88,70,126,0.16)] dark:shadow-[0_14px_34px_rgba(0,0,0,0.4)]"
            >
              <p className="text-lg text-slate-500 dark:text-slate-400 italic">
                {transcription} <span className="opacity-50">{interimTranscription}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4"
            >
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-3 h-3 bg-luna-purple rounded-full"
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-luna-purple">
                <Sparkles size={16} className="animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">{copy.lunaReflecting}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(transcription || isAnalyzing || error) && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-10 pt-10 border-t-2 border-slate-100/90 dark:border-slate-700/60"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative p-8 rounded-[3rem] border-2 border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f8edf8]/92 via-[#efe7f6]/88 to-[#e6eefb]/84 dark:from-[#0b1832]/90 dark:via-[#12264a]/88 dark:to-[#1a345f]/86 shadow-[0_14px_34px_rgba(88,70,126,0.16)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)] text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-4">{copy.yourReflection}</span>
                  <p className="italic text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    "{transcription || (error ? "..." : "...")}"
                  </p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative p-8 rounded-[3rem] border-2 border-luna-purple/25 bg-gradient-to-br from-[#f4e8f5]/92 via-[#ece6f2]/88 to-[#e2ecfa]/84 dark:from-[#0c1a34]/90 dark:via-[#13284c]/88 dark:to-[#1b3763]/86 shadow-[0_14px_34px_rgba(88,70,126,0.16)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)] text-left min-h-[120px] overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-luna-purple/20 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-sky-300/20 blur-2xl" />
                  <MessageSquare className="absolute -top-4 -right-4 text-luna-purple bg-white dark:bg-slate-900 rounded-full p-2 shadow-md" size={40} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-luna-purple block mb-4">{copy.lunaResponse}</span>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-luna-purple py-4">
                      <Sparkles size={16} className="animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">{copy.reflecting}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                        {displayedAiResponse || aiResponse || (error ? error : "...")}
                      </p>
                      {audioBase64 && !isPlaying && (
                        <button 
                          onClick={() => playAudio(audioBase64)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-luna-purple bg-luna-purple/10 px-4 py-2 rounded-full hover:bg-luna-purple/20 transition-all"
                        >
                          <Play size={12} fill="currentColor" /> {copy.listenAgain}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {(!isAnalyzing && (transcription || error)) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {transcription && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { void handleSave(); }}
                      disabled={isSavingRecording}
                      className="flex-1 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-[0.3em] rounded-full shadow-luna-deep flex items-center justify-center gap-3"
                    >
                      <Save size={18} /> {isSavingRecording ? 'Saving...' : copy.save}
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTranscription("");
                      setInterimTranscription("");
                      transcriptionRef.current = "";
                      interimRef.current = "";
                      setAiResponse("");
                      setDisplayedAiResponse("");
                      setError(null);
                      setSessionAudioDataUrl(null);
                      stopAudio();
                    }}
                    className={`${transcription ? 'px-10' : 'flex-1'} py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-[0.3em] rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors`}
                  >
                    <RefreshCw size={18} className="mr-2" /> {copy.redo}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="relative z-10 max-w-3xl mx-auto rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f7ebf8]/92 via-[#eee7f4]/88 to-[#e2ebf9]/84 dark:from-[#0b1832]/94 dark:via-[#12264a]/92 dark:to-[#1a345f]/90 p-6 md:p-7 text-left shadow-[0_18px_42px_rgba(93,74,132,0.16)] dark:shadow-[0_20px_46px_rgba(0,0,0,0.44)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">Saved Voice Files</p>
            {savedVoiceClips.length > 0 && (
              <button
                onClick={handleClearAllClips}
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Clear all
              </button>
            )}
          </div>
          {sessionAudioDataUrl && (
            <div className="rounded-2xl border border-luna-purple/25 bg-luna-purple/10 dark:bg-luna-purple/15 p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Current recording preview</p>
              <audio controls src={sessionAudioDataUrl} className="w-full" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Click "{copy.save}" to store this voice file.
              </p>
            </div>
          )}
          {savedVoiceClips.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">No saved files yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {savedVoiceClips.map((clip, index) => (
                <article key={clip.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                      File {savedVoiceClips.length - index} • {new Date(clip.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{clip.locale}</p>
                  </div>
                  <audio controls src={clip.audioDataUrl} className="w-full" />
                  {clip.transcript && (
                    <p className="text-sm font-medium italic text-slate-600 dark:text-slate-300">"{clip.transcript}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDownloadClip(clip)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-luna-purple/15 text-luna-purple"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteClip(clip.id)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
