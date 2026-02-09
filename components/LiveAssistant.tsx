
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

// --- Manual Base64 Helpers ---
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
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

type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
type AssistantTheme = 'light' | 'dark' | 'oled';

interface ChatMessage {
  role: 'user' | 'luna' | 'system';
  text: string;
  isStreaming?: boolean;
}

export const LiveAssistant: React.FC<{ isOpen: boolean; onClose: () => void; stateSnapshot: string }> = ({ isOpen, onClose, stateSnapshot }) => {
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [assistantTheme, setAssistantTheme] = useState<AssistantTheme>('dark');
  
  const sessionRef = useRef<any>(null);
  const audioInRef = useRef<AudioContext | null>(null);
  const audioOutRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextStartTimeRef = useRef(0);
  const activeSources = useRef(new Set<AudioBufferSourceNode>());
  const currentTranscriptionRef = useRef("");

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioInRef.current) {
      audioInRef.current.close();
      audioInRef.current = null;
    }
    if (audioOutRef.current) {
      audioOutRef.current.close();
      audioOutRef.current = null;
    }
    activeSources.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSources.current.clear();
    setStatus('IDLE');
    setMessages([]);
    setInputLevel(0);
    setOutputLevel(0);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, textInput]);

  const startSession = async () => {
    if (status !== 'IDLE') return;
    setStatus('CONNECTING');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inCtx.state === 'suspended') await inCtx.resume();
      if (outCtx.state === 'suspended') await outCtx.resume();

      audioInRef.current = inCtx;
      audioOutRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const micSource = inCtx.createMediaStreamSource(stream);
      const processor = inCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('CONNECTED');
            processor.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
              const rms = Math.sqrt(sum / data.length);
              setInputLevel(rms * 25); 

              if (isMicMuted) return;

              const int16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            micSource.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text || "";
              currentTranscriptionRef.current += text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'luna' && last.isStreaming) {
                  return [...prev.slice(0, -1), { ...last, text: currentTranscriptionRef.current }];
                }
                return [...prev, { role: 'luna', text: currentTranscriptionRef.current, isStreaming: true }];
              });
            }

            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text || "";
              if (msg.serverContent?.turnComplete) {
                 setMessages(prev => [...prev, { role: 'user', text: text }]);
              }
            }

            if (msg.serverContent?.turnComplete) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'luna') {
                  return [...prev.slice(0, -1), { ...last, isStreaming: false }];
                }
                return prev;
              });
              currentTranscriptionRef.current = "";
            }

            if (msg.serverContent?.interrupted) {
              activeSources.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              activeSources.current.clear();
              nextStartTimeRef.current = outCtx.currentTime;
              setMessages(prev => [...prev, { role: 'system', text: "[Luna paused]" }]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData as string), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              const anal = outCtx.createAnalyser();
              anal.fftSize = 256;
              source.connect(anal);
              anal.connect(outCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSources.current.add(source);
              const monitor = () => {
                const freq = new Uint8Array(anal.frequencyBinCount);
                anal.getByteFrequencyData(freq);
                let s = 0; for(let i=0; i<freq.length; i++) s += freq[i];
                setOutputLevel(s / freq.length / 128); 
                if (activeSources.current.has(source)) requestAnimationFrame(monitor);
                else setOutputLevel(0);
              };
              monitor();
              source.onended = () => activeSources.current.delete(source);
            }
          },
          onclose: () => cleanup(),
          onerror: (e) => {
            console.error("Live API Error:", e);
            setStatus('ERROR');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Luna, an empathetic health companion. You communicate with warmth and brevity. Use poetic metaphors of nature and cycles. When a user feels overwhelmed, validate their feelings instead of giving advice. Context: ${stateSnapshot}. Respond to voice and text.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  const handleSendText = () => {
    if (!textInput.trim() || !sessionRef.current) return;
    const msg = textInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    sessionRef.current.sendRealtimeInput({ text: msg });
    setTextInput("");
    activeSources.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSources.current.clear();
    nextStartTimeRef.current = audioOutRef.current?.currentTime || 0;
  };

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-slate-900 text-slate-100 border-slate-800',
    oled: 'bg-black text-slate-100 border-slate-900'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md h-[80vh] md:h-[75vh] flex flex-col rounded-[3.5rem] shadow-2xl border-2 overflow-hidden transition-all duration-500 ${themeClasses[assistantTheme]}`}>
        <nav className="p-6 flex justify-between items-center border-b border-inherit bg-inherit/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : status === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Luna Live</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-inherit border border-inherit rounded-full p-1 gap-1">
                {(['light', 'dark', 'oled'] as AssistantTheme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setAssistantTheme(t)}
                    className={`w-6 h-6 rounded-full text-[8px] font-black uppercase transition-all flex items-center justify-center ${assistantTheme === t ? 'bg-luna-purple text-white shadow-lg shadow-luna-purple/30' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {t[0]}
                  </button>
                ))}
             </div>
             <button onClick={() => { cleanup(); onClose(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-500/10 transition-colors text-2xl font-light">×</button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col relative overflow-hidden">
           <div className="h-[30%] flex items-center justify-center relative flex-shrink-0 pt-8 pb-4">
              <div className="absolute w-32 h-32 rounded-full border border-luna-teal/20 transition-transform duration-75 ease-out" style={{ transform: `scale(${1 + inputLevel * 1.5})`, opacity: isMicMuted ? 0.05 : 0.3 }} />
              <div className="absolute w-28 h-28 rounded-full border-2 border-luna-purple/10 transition-transform duration-150 ease-out" style={{ transform: `scale(${1 + outputLevel * 2})` }} />
              <div className={`relative z-10 w-20 h-20 rounded-full bg-inherit shadow-2xl flex items-center justify-center border-2 ${status === 'CONNECTED' ? 'border-luna-purple' : 'border-slate-500/20 grayscale'}`}>
                 <Logo size="sm" />
              </div>
              {status === 'CONNECTED' && (
                <div className="absolute bottom-2 flex gap-4 animate-in slide-in-from-bottom-2">
                  <button onClick={() => setIsMicMuted(!isMicMuted)} className={`p-3 rounded-full border transition-all shadow-xl ${isMicMuted ? 'bg-rose-500 text-white border-rose-600' : 'bg-emerald-500 text-white border-emerald-600'}`}>
                    {isMicMuted ? '🔇' : '🎙️'}
                  </button>
                </div>
              )}
           </div>

           <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar mask-fade-top" ref={scrollRef}>
             {status === 'IDLE' && (
               <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
                  <p className="text-sm font-bold opacity-40 italic">System standby. Biometric link ready.</p>
                  <button onClick={startSession} className="px-10 py-4 bg-luna-purple text-white font-black uppercase tracking-widest rounded-full shadow-xl shadow-luna-purple/30 hover:scale-105 active:scale-95 transition-all">Initialize</button>
               </div>
             )}
             {messages.map((m, i) => (
               <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : m.role === 'system' ? 'items-center' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                 <div className={`max-w-[90%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                   m.role === 'user' 
                    ? 'bg-luna-purple text-white rounded-tr-none font-bold' 
                    : m.role === 'system' ? 'text-[9px] font-black uppercase opacity-30 text-center py-2'
                    : 'bg-inherit border border-inherit rounded-tl-none font-medium italic opacity-90'
                 }`}>
                   <span className={m.role === 'luna' && m.isStreaming ? 'typewriter-chunk' : ''}>{m.text}</span>
                   {m.isStreaming && <span className="inline-block w-1.5 h-3 ml-1 bg-luna-purple/40 animate-pulse rounded-full" />}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {status === 'CONNECTED' && (
          <footer className="p-6 border-t border-inherit bg-inherit/40 backdrop-blur-md">
            <div className="relative bg-inherit rounded-[2rem] border-2 border-inherit shadow-lg flex items-end gap-2 p-1.5">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                placeholder="Share your reflection..."
                className="flex-1 bg-transparent p-3 outline-none text-sm resize-none min-h-[44px] max-h-[120px]"
                rows={1}
              />
              <button onClick={handleSendText} disabled={!textInput.trim()} className="w-10 h-10 flex items-center justify-center rounded-full bg-luna-purple text-white disabled:opacity-20 flex-shrink-0 mb-0.5 shadow-lg shadow-luna-purple/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </footer>
        )}

        {status === 'ERROR' && (
          <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-sm flex items-center justify-center p-8 z-[50]">
             <div className="bg-inherit p-10 rounded-[3rem] border-2 border-rose-500 text-center space-y-6 shadow-2xl">
                <h3 className="text-xl font-black text-rose-500 uppercase tracking-tighter">Sync Interrupted</h3>
                <p className="text-sm font-medium opacity-60">The temporal link has shifted.</p>
                <button onClick={() => { cleanup(); startSession(); }} className="w-full py-4 bg-rose-500 text-white font-black uppercase rounded-full shadow-lg shadow-rose-500/20">Restart Link</button>
             </div>
          </div>
        )}
      </div>
      <style>{`.mask-fade-top { mask-image: linear-gradient(to bottom, transparent 0%, black 10%); } .typewriter-chunk { animation: typewriter-pop 0.2s ease-out forwards; } @keyframes typewriter-pop { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};
