import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from './Logo';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
type AssistantTheme = 'light' | 'dark' | 'oled';

interface ChatMessage {
  role: 'user' | 'luna' | 'system';
  text: string;
}

const buildLocalReply = (input: string, snapshot: string): string => {
  const text = input.toLowerCase();

  if (text.includes('stress') || text.includes('anx') || text.includes('трев')) {
    return 'I hear that stress is high right now. Keep one simple next step and reduce decision load for this hour.';
  }

  if (text.includes('sleep') || text.includes('устал') || text.includes('сон')) {
    return 'Your system sounds overloaded. Protect recovery first: lower stimulation, hydrate, and keep tonight predictable.';
  }

  if (text.includes('partner') || text.includes('отнош')) {
    return 'Name the state, separate it from blame, ask for one concrete form of support, and close with reassurance.';
  }

  return `Local mode response: I am tracking your current state snapshot: "${snapshot}". Let's keep actions small, clear, and kind to your bandwidth.`;
};

export const LiveAssistant: React.FC<{ isOpen: boolean; onClose: () => void; stateSnapshot: string }> = ({ isOpen, onClose, stateSnapshot }) => {
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [assistantTheme, setAssistantTheme] = useState<AssistantTheme>('dark');
  const scrollRef = useRef<HTMLDivElement>(null);

  const themeClasses = useMemo(
    () => ({
      light: 'bg-white text-slate-900 border-slate-200',
      dark: 'bg-slate-900 text-slate-100 border-slate-800',
      oled: 'bg-black text-slate-100 border-slate-900'
    }),
    []
  );

  const cleanup = () => {
    setStatus('IDLE');
    setMessages([]);
    setTextInput('');
  };

  const startSession = async () => {
    if (status !== 'IDLE') return;
    setStatus('CONNECTING');

    // Local development mode without external API.
    setTimeout(() => {
      setStatus('CONNECTED');
      setMessages([
        {
          role: 'system',
          text: '[Local mode active: voice/AI API is disabled]'
        },
        {
          role: 'luna',
          text: 'I am available in local text mode. Share what feels most important right now.'
        }
      ]);
    }, 300);
  };

  const handleSendText = () => {
    const msg = textInput.trim();
    if (!msg || status !== 'CONNECTED') return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setTextInput('');

    const reply = buildLocalReply(msg, stateSnapshot);
    setTimeout(() => {
      if (!isSpeakerMuted) {
        setMessages((prev) => [...prev, { role: 'luna', text: reply }]);
      }
    }, 220);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md h-[80vh] md:h-[75vh] flex flex-col rounded-[3.5rem] shadow-2xl border-2 overflow-hidden transition-all duration-500 ${themeClasses[assistantTheme]}`}>
        <nav className="p-6 flex justify-between items-center border-b border-inherit bg-inherit/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : status === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Luna Live</span>
            </div>

            {status === 'CONNECTED' && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-1.5 bg-inherit border border-inherit rounded-full px-2 py-1 shadow-sm">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isMicMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-emerald-500/20 text-emerald-500'}`}
                  >
                    {isMicMuted ? <MicOff size={12} /> : <Mic size={12} />}
                  </button>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isMicMuted ? 'text-rose-500' : 'opacity-40'}`}>
                    {isMicMuted ? 'Off' : 'On'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-inherit border border-inherit rounded-full px-2 py-1 shadow-sm">
                  <button
                    onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isSpeakerMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-luna-purple/20 text-luna-purple'}`}
                  >
                    {isSpeakerMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isSpeakerMuted ? 'text-rose-500' : 'opacity-40'}`}>
                    {isSpeakerMuted ? 'Muted' : 'Live'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-inherit border border-inherit rounded-full p-1 gap-1">
              {(['light', 'dark', 'oled'] as AssistantTheme[]).map((t) => (
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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : m.role === 'system' ? 'items-center' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] px-5 py-3 rounded-3xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-luna-purple text-white rounded-tr-none font-bold'
                  : m.role === 'system'
                    ? 'text-[9px] font-black uppercase opacity-40 text-center py-2'
                    : 'bg-inherit border border-inherit rounded-tl-none font-medium italic opacity-90'
              }`}>
                <span>{m.text}</span>
              </div>
            </div>
          ))}
        </div>

        {status === 'CONNECTED' && (
          <footer className="p-6 border-t border-inherit bg-inherit/40 backdrop-blur-md">
            <div className="relative bg-inherit rounded-[2rem] border-2 border-inherit shadow-lg flex items-end gap-2 p-1.5">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
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
              <p className="text-sm font-medium opacity-60">The local assistant failed to initialize.</p>
              <button onClick={() => { cleanup(); startSession(); }} className="w-full py-4 bg-rose-500 text-white font-black uppercase rounded-full shadow-lg shadow-rose-500/20">Restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
