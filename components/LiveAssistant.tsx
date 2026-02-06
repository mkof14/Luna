
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveAssistant: React.FC<{ isOpen: boolean; onClose: () => void; systemContext: string }> = ({ isOpen, onClose, systemContext }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const startSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setStatus("Connecting...");
    
    audioContextRef.current = {
      input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
      output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setStatus("Live");
          setIsActive(true);
          const source = audioContextRef.current!.input.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.input.destination);
        },
        onmessage: async (message) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const ctx = audioContextRef.current!.output;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => { setStatus("Closed"); setIsActive(false); },
        onerror: () => setStatus("Error")
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: `You are Luna, a women's health guide. Context: ${systemContext}. Speak warmly. No diagnosis.`
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioContextRef.current?.input.close();
    audioContextRef.current?.output.close();
    setIsActive(false);
    setStatus("Disconnected");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 p-12 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-black">×</button>
        
        <div className="flex flex-col items-center gap-12 text-center">
          <div className={`w-32 h-32 rounded-full border-4 border-pink-500 flex items-center justify-center transition-all duration-1000 ${isActive ? 'animate-pulse scale-110 shadow-[0_0_50px_rgba(236,72,153,0.5)]' : 'opacity-40'}`}>
            <span className="text-4xl">🌙</span>
          </div>
          
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Luna Live</h2>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">{status}</p>
          </div>
          
          <div className="w-full space-y-4">
            {!isActive ? (
              <button onClick={startSession} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-[0.3em] hover:bg-pink-600 transition-colors">Start Conversation</button>
            ) : (
              <button onClick={stopSession} className="w-full py-5 border-2 border-slate-900 dark:border-slate-100 font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-colors">End Session</button>
            )}
          </div>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed max-w-xs">Talk naturally about how you're feeling. I'm here to provide physiological context based on your cycle map.</p>
        </div>
        
        {isActive && (
          <div className="absolute bottom-0 left-0 w-full h-1 flex gap-1 px-1">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="flex-1 bg-pink-500 animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.05}s`, height: `${Math.random() * 100}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
