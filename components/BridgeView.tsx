
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBridgeLetter } from '../services/geminiService';
import { BridgeReflectionInput, BridgeLetterOutput } from '../types';
import { incrementBridgeUsage, parseBridgeUsage } from '../utils/runtimeGuards';
import { normalizeBridgeReflectionInput } from '../utils/bridge';
import { shareTextSafely } from '../utils/share';

type BridgeStep = 'entry' | 'reflection' | 'result';

export const BridgeView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<BridgeStep>('entry');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [letter, setLetter] = useState<BridgeLetterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const questions = [
    "What is quiet but present in me today?",
    "What does this state not mean?",
    "What would feel like kindness tonight?"
  ];

  useEffect(() => {
    const now = new Date();
    const usage = parseBridgeUsage(localStorage.getItem('luna_bridge_usage'), now);
    setUsageCount(usage.count);
    localStorage.setItem('luna_bridge_usage', JSON.stringify(usage));
  }, []);

  const handleContinue = () => {
    setError(null);
    if (usageCount >= 2) {
      setError("The Bridge is a rare space. You have reached your weekly limit of 2 reflections.");
      return;
    }
    setStep('reflection');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionIndex < 2) {
      setQuestionIndex(prev => prev + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setStep('result');
    
    const input: BridgeReflectionInput = normalizeBridgeReflectionInput({
      language: 'en',
      reflection: {
        quiet_presence: answers[0],
        not_meaning: answers[1],
        kindness_needed: answers[2]
      }
    });

    try {
      const result = await generateBridgeLetter(input);
      
      if ('error' in result) {
        setError(result.error.message);
      } else {
        setLetter(result);
        const next = incrementBridgeUsage(localStorage.getItem('luna_bridge_usage'), new Date());
        setUsageCount(next.count);
        localStorage.setItem('luna_bridge_usage', JSON.stringify(next));
      }
    } catch (_e) {
      setError('Could not form reflection right now. Please retry.');
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!letter) return;
    setShareFeedback(null);

    const result = await shareTextSafely(letter.bridge_letter.content, 'A Reflection from Luna');
    if (result === 'shared') setShareFeedback('Shared.');
    else if (result === 'copied') setShareFeedback('Copied to clipboard.');
    else setShareFeedback('Could not share. Try copy manually.');
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div 
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-5xl font-medium italic text-slate-800 dark:text-slate-200 leading-tight max-w-2xl">
              “Before you explain yourself — feel what is true.”
            </h2>
            <button 
              onClick={handleContinue}
              className="px-12 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              Continue
            </button>
            {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
          </motion.div>
        )}

        {step === 'reflection' && (
          <motion.div 
            key="reflection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl space-y-12"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Question {questionIndex + 1} of 3</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {questions[questionIndex]}
              </h3>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-8">
              <input 
                autoFocus
                type="text"
                value={answers[questionIndex]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[questionIndex] = e.target.value;
                  setAnswers(newAnswers);
                }}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-luna-purple py-4 text-2xl outline-none transition-all text-center italic"
                placeholder="Type your answer..."
              />
              <button 
                type="submit"
                disabled={!answers[questionIndex].trim()}
                className="px-10 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all"
              >
                {questionIndex < 2 ? 'Next' : 'Form Reflection'}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl space-y-12"
          >
            {isGenerating ? (
              <div className="space-y-8 animate-pulse">
                <div className="w-16 h-16 border-4 border-luna-purple border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Forming Reflection...</p>
              </div>
            ) : error ? (
              <div className="space-y-8">
                <div className="text-5xl">⚠️</div>
                <p className="text-rose-500 font-bold">{error}</p>
                <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">Back</button>
              </div>
            ) : letter ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="p-10 md:p-16 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-luna-rich text-left">
                  <p className="text-xl md:text-2xl leading-relaxed italic text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {letter.bridge_letter.content}
                  </p>
                </div>

                <div className="space-y-8">
                  <p className="text-lg font-bold italic text-slate-500">
                    “Do you want this to be shared — or simply understood?”
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => onBack()}
                      className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                      Keep it here
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-luna-purple transition-all"
                    >
                      Share
                    </button>
                  </div>
                  {shareFeedback && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{shareFeedback}</p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
