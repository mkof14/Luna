
import React, { useState, useRef } from 'react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';

export const AudioReflection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      // In a real app, send blob to backend/Gemini
      // Here we simulate the AI transcription process
      simulateAIAnalysis();
    };
    
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    setTranscription("");
    setTimeout(() => {
      setTranscription("I'm feeling quite heavy today. My sleep was interrupted twice and I noticed that my patience with noise is very low. It feels like a 'foggy' day where I just want to stay in bed with a book.");
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSave = () => {
    dataService.logEvent('AUDIO_REFLECTION', { text: transcription });
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-slate-400">← Back</button>
      
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-luna border border-slate-200 dark:border-slate-800 space-y-12 text-center">
        <header className="space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tight">Audio Reflection</h2>
          <p className="text-sm font-medium text-slate-500 italic">Speak your state. Let Luna transcribe the nuances.</p>
        </header>

        <div className="flex flex-col items-center gap-12 py-10">
          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 ${isRecording ? 'bg-rose-500 scale-125 animate-pulse' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105'}`}
          >
            {isRecording ? '⏹️' : '🎙️'}
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isRecording ? "Recording... (Release to stop)" : "Hold to speak"}
          </p>
        </div>

        {isAnalyzing && (
          <div className="space-y-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-luna-purple border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-luna-purple">AI Interpreting nuances...</p>
          </div>
        )}

        {transcription && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-10">
            <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 italic text-xl leading-relaxed text-slate-700 dark:text-slate-300">
              "{transcription}"
            </div>
            <button 
              onClick={handleSave}
              className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.3em] rounded-full shadow-xl"
            >
              Confirm to Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
