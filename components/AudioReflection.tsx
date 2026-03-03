import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Save, X, Volume2, Sparkles, MessageSquare, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generatePsychologistResponse } from '../services/geminiService';

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

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitAudioContext?: typeof AudioContext;
  }
}

export const AudioReflection: React.FC<{ onBack: () => void, lang?: string }> = ({ onBack, lang = 'en' }) => {
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

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActive = useRef(false);
  const transcriptionRef = useRef("");
  const interimRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError(lang === 'ru' ? "Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome или Safari." : "Your browser does not support voice recognition. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === 'ru' ? 'ru-RU' : 'en-US';

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setStatusMsg(lang === 'ru' ? "Слушаю..." : "Listening...");
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
        setError(lang === 'ru' ? "Доступ к микрофону запрещен. Проверьте настройки браузера." : "Microphone access denied. Check browser settings.");
      } else if (event.error === 'no-speech') {
        // Ignore no-speech during active hold
      } else {
        setError(lang === 'ru' ? `Ошибка: ${event.error}` : `Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      recognitionActive.current = false;
      setStatusMsg("");
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
  }, [lang]);

  // Audio Visualization Loop
  useEffect(() => {
    const updateLevels = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
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
    setAudioBase64(null);
    stopAudio();

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
      setError(lang === 'ru' ? "Не удалось получить доступ к микрофону." : "Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.stop(); 
        recognitionActive.current = false;
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
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
    
    // Process results
    setTimeout(() => {
      const finalText = (transcriptionRef.current + " " + interimRef.current).trim();
      if (finalText) {
        setTranscription(finalText);
        handleTranscription(finalText);
      } else {
        setError(lang === 'ru' ? "Я не расслышала. Пожалуйста, попробуйте еще раз." : "I didn't catch that. Please try again.");
      }
    }, 600);
  };

  const handleTranscription = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await generatePsychologistResponse(text, lang);
      setAiResponse(result.text);
      if (result.audio) {
        setAudioBase64(result.audio);
        playAudio(result.audio);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setError(lang === 'ru' ? "Луна временно недоступна. Попробуйте еще раз." : "Luna is temporarily unavailable. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = (base64: string) => {
    stopAudio();
    if (!base64) return;
    
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audioRef.current = audio;
      audio.crossOrigin = "anonymous";
      
      // Connect playback to analyzer for visualization
      if (audioContextRef.current && analyserRef.current) {
        try {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch (e) {
          console.warn("Could not connect audio to analyzer:", e);
        }
      }

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setAudioLevel(Array(12).fill(4));
      };
      audio.onerror = () => setIsPlaying(false);
      
      audio.play().catch(err => {
        console.warn("Autoplay blocked:", err);
        setIsPlaying(false);
      });
    } catch (err) {
      console.error("Failed to initialize audio", err);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    dataService.logEvent('AUDIO_REFLECTION', { text: transcription, ai_response: aiResponse });
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack} 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all"
      >
        <X size={14} /> {lang === 'ru' ? "Назад" : "Back to Journal"}
      </motion.button>
      
      <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-luna-rich border-2 border-slate-100 dark:border-slate-800 space-y-16 text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-luna-purple/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />

        <header className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <Volume2 size={12} /> {lang === 'ru' ? "Голосовая Рефлексия" : "Live Reflection"}
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-950 dark:text-white">
            Voice <span className="text-luna-purple">Journal.</span>
          </h2>
          <p className="text-base font-medium text-slate-500 italic max-w-md mx-auto">
            {lang === 'ru' ? "Говорите. Луна здесь, чтобы слушать и понимать." : "Speak your state. Luna is here to listen, understand, and respond."}
          </p>
        </header>

        <div className="flex flex-col items-center gap-12 py-10 relative z-10">
          <div className="relative">
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
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`relative w-40 h-40 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 z-20 ${
                isRecording 
                ? 'bg-rose-500 text-white' 
                : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950'
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
                  className={`w-1.5 rounded-full transition-colors duration-300 ${isRecording ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : (isPlaying ? 'bg-luna-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-slate-200 dark:bg-slate-800')}`}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${isRecording ? 'text-rose-500' : 'text-slate-400'}`}>
              {isRecording ? (statusMsg || "Recording...") : (lang === 'ru' ? "Удерживайте, чтобы говорить" : "Hold to speak")}
            </p>
            
            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {isPlaying && (
              <button onClick={stopAudio} className="flex items-center gap-2 text-luna-purple text-[9px] font-black uppercase tracking-widest mx-auto mt-2">
                <VolumeX size={12} /> {lang === 'ru' ? "Остановить" : "Stop Listening"}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {(isRecording && (transcription || interimTranscription)) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800"
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
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">{lang === 'ru' ? "Луна размышляет..." : "Luna is reflecting..."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(transcription || isAnalyzing || error) && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-10 pt-10 border-t-2 border-slate-50 dark:border-slate-800/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-4">{lang === 'ru' ? "Ваши слова" : "Your Reflection"}</span>
                  <p className="italic text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    "{transcription || (error ? "..." : "...")}"
                  </p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative p-8 bg-luna-purple/5 dark:bg-luna-purple/10 rounded-[3rem] border-2 border-luna-purple/20 shadow-sm text-left min-h-[120px]"
                >
                  <MessageSquare className="absolute -top-4 -right-4 text-luna-purple bg-white dark:bg-slate-900 rounded-full p-2 shadow-md" size={40} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-luna-purple block mb-4">{lang === 'ru' ? "Ответ Луны" : "Luna's Response"}</span>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-luna-purple py-4">
                      <Sparkles size={16} className="animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'ru' ? "Размышляю..." : "Reflecting..."}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                        {aiResponse || (error ? error : "...")}
                      </p>
                      {audioBase64 && !isPlaying && (
                        <button 
                          onClick={() => playAudio(audioBase64)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-luna-purple bg-luna-purple/10 px-4 py-2 rounded-full hover:bg-luna-purple/20 transition-all"
                        >
                          <Play size={12} fill="currentColor" /> {lang === 'ru' ? "Послушать еще раз" : "Listen Again"}
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
                      onClick={handleSave}
                      className="flex-1 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-[0.3em] rounded-full shadow-luna-deep flex items-center justify-center gap-3"
                    >
                      <Save size={18} /> {lang === 'ru' ? "Сохранить" : "Save to Journal"}
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTranscription("");
                      setInterimTranscription("");
                      transcriptionRef.current = "";
                      setAiResponse("");
                      setError(null);
                      stopAudio();
                    }}
                    className={`${transcription ? 'px-10' : 'flex-1'} py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-[0.3em] rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors`}
                  >
                    <RefreshCw size={18} className="mr-2" /> {lang === 'ru' ? "Заново" : "Redo"}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
