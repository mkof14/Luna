
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../constants';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: Record<string, FAQCategory[]> = {
  en: [
    {
      title: "General Understanding",
      items: [
        { q: "What is Luna Balance?", a: "Luna Balance is a visual mapping system for your body's physiological rhythms. It looks at how different hormones like estrogen, cortisol, and thyroid markers interact to affect your energy and mood. Instead of just tracking numbers, it creates a 'weather map' of your internal state." },
        { q: "Who is this system for?", a: "This system is designed for any woman who wants to understand her body more clearly. It is helpful for those who want to see the patterns behind their energy shifts and mood changes at any stage of their reproductive life." },
        { q: "How is this different from typical health or period apps?", a: "Most apps focus solely on predicting your next period. Luna Balance looks at your entire system, including stress hormones and metabolism. It treats your body as a connected network rather than a series of isolated events." },
        { q: "Do I need medical knowledge to use it?", a: "No. We use plain language and visual indicators like color and magnitude scales to explain what is happening. Any technical terms used are accompanied by a simple explanation." }
      ]
    },
    {
      title: "Medical & Safety",
      items: [
        { q: "Is this a medical product?", a: "No. Luna Balance is a digital educational system, not a medical product, diagnostic tool, or healthcare service. It does not possess clinical certification and is intended for self-awareness only." },
        { q: "Does it replace a doctor?", a: "No. This system is a preparation tool to use BEFORE you see your doctor. It organizes your daily observations into a clear summary to help your provider during a visit. Always consult a qualified professional for medical concerns." },
        { q: "Does it give diagnoses or medical advice?", a: "No. Luna Balance does not provide diagnoses or recommend medications, supplements, or changes in dosage. It identifies patterns and correlations based on the data you log. All medical decisions must be made with your prescribing physician." }
      ]
    },
    {
      title: "Hormones & Daily Life",
      items: [
        { q: "Why do hormones affect my mood and energy?", a: "Hormones act like the background music to your life. They influence how your brain processes signals and how your cells use fuel, setting the baseline for your daily resilience and energy levels." },
        { q: "Why is stress so influential on other hormones?", a: "Cortisol is your survival signal. When stress is high, the system prioritizes survival over other functions like digestion or reproductive rhythms, often 'shouting over' other hormonal signals." },
        { q: "What does a 'Strained' state look like in real life?", a: "A 'Strained' status means your system is working overtime to keep up with high demand. You might feel this as physical heaviness or being 'on edge.' It is a prompt to prioritize recovery." }
      ]
    },
    {
      title: "Cycle & Phases",
      items: [
        { q: "Why does my cycle affect how I feel?", a: "Your cycle is an internal climate. Different hormones rise and fall to prepare your body for different tasks, shifting your energy, mood, and cognitive focus across four 'internal seasons'." },
        { q: "What if my cycle is irregular?", a: "The system is flexible. You can use the 'Temporal Scrubber' to align the map with your actual physical signs rather than being forced into a standard 28-day box." },
        { q: "Can the system help if I'm on hormonal birth control?", a: "Yes, but your map will look different. Birth control typically creates a steady baseline rather than a natural wave. You can still track how you feel daily to identify sensitivities or responses to that steady state." }
      ]
    },
    {
      title: "Data & Privacy",
      items: [
        { q: "Where is my health data stored?", a: "Luna Balance uses 'Local Storage.' This means your data remains on your physical device (your phone or computer). It is not uploaded to a central cloud server, and the developers cannot see or sell your health information." },
        { q: "What happens if I clear my browser cache?", a: "Since the data is stored locally, clearing your browser's data or cache will delete your history. We recommend using the 'Export Data' feature regularly to keep a backup file for your own records." }
      ]
    }
  ],
  ru: [
    {
      title: "Общее понимание",
      items: [
        { q: "Что такое Luna Balance?", a: "Luna Balance — это система визуального картирования физиологических ритмов вашего тела. Она анализирует взаимодействие различных гормонов, таких как эстроген, кортизол и показатели щитовидной железы, и то, как они влияют на вашу энергию и настроение. Вместо простого отслеживания цифр, она создает «карту погоды» вашего внутреннего состояния." },
        { q: "Для кого предназначена эта система?", a: "Эта система создана для любой женщины, которая хочет лучше понимать свое тело. Она полезна тем, кто хочет увидеть закономерности изменений энергии и настроения на любом этапе репродуктивной жизни." },
        { q: "Чем это отличается от обычных приложений для здоровья или отслеживания цикла?", a: "Большинство приложений фокусируются исключительно на предсказании следующей менструации. Luna Balance смотрит на всю систему в целом, включая гормоны стресса и метаболизм. Она относится к вашему телу как к единой сети, а не как к серии изолированных событий." },
        { q: "Нужны ли мне медицинские знания для использования?", a: "Нет. Мы используем простой язык и визуальные индикаторы, такие как цветовые и амплитудные шкалы, чтобы объяснить происходящее. Любые технические термины сопровождаются простым пояснением." }
      ]
    },
    {
      title: "Медицина и безопасность",
      items: [
        { q: "Является ли это медицинским продуктом?", a: "Нет. Luna Balance — это цифровая образовательная система, а не медицинский продукт, диагностический инструмент или медицинская услуга. Она не имеет клинической сертификации и предназначена только для самопознания." },
        { q: "Заменяет ли это врача?", a: "Нет. Эта система — инструмент подготовки ПЕРЕД визитом к врачу. Она организует ваши ежедневные наблюдения в четкое резюме, чтобы помочь специалисту во время приема. Всегда консультируйтесь с квалифицированным специалистом по медицинским вопросам." },
        { q: "Дает ли система диагнозы или медицинские рекомендации?", a: "Нет. Luna Balance не ставит диагнозы и не рекомендует лекарства, добавки или изменения дозировок. Она выявляет закономерности и корреляции на основе данных, которые вы вводите. Все медицинские решения должны приниматься вместе с вашим лечащим врачом." }
      ]
    },
    {
      title: "Гормоны и повседневная жизнь",
      items: [
        { q: "Почему гормоны влияют на мое настроение и энергию?", a: "Гормоны действуют как фоновая музыка вашей жизни. Они влияют на то, как ваш мозг обрабатывает сигналы и как ваши клетки используют топливо, устанавливая базовый уровень вашей ежедневной устойчивости и энергии." },
        { q: "Почему стресс так сильно влияет на другие гормоны?", a: "Кортизол — это ваш сигнал выживания. Когда уровень стресса высок, система отдает приоритет выживанию над другими функциями, такими как пищеварение или репродуктивные ритмы, часто «перекрикивая» другие гормональные сигналы." },
        { q: "Как выглядит состояние «Напряжения» в реальной жизни?", a: "Статус «Напряжение» (Strained) означает, что ваша система работает сверхурочно, чтобы справиться с высокой нагрузкой. Вы можете чувствовать это как физическую тяжесть или состояние «на взводе». Это сигнал к тому, чтобы уделить первоочередное внимание восстановлению." }
      ]
    },
    {
      title: "Цикл и фазы",
      items: [
        { q: "Почему мой цикл влияет на мое самочувствие?", a: "Ваш цикл — это внутренний климат. Различные гормоны повышаются и понижаются, чтобы подготовить ваше тело к разным задачам, меняя вашу энергию, настроение и когнитивный фокус в течение четырех «внутренних сезонов»." },
        { q: "Что если мой цикл нерегулярный?", a: "Система гибкая. Вы можете использовать «Временной скруббер», чтобы совместить карту с вашими реальными физическими признаками, а не подстраиваться под стандартный 28-дневный цикл." },
        { q: "Поможет ли система, если я принимаю гормональные контрацептивы?", a: "Да, но ваша карта будет выглядеть иначе. Контрацептивы обычно создают стабильный базовый уровень, а не естественную волну. Вы все равно можете отслеживать свое самочувствие ежедневно, чтобы выявить чувствительность или реакции на это стабильное состояние." }
      ]
    },
    {
      title: "Данные и конфиденциальность",
      items: [
        { q: "Где хранятся мои данные о здоровье?", a: "Luna Balance использует «Локальное хранилище». Это означает, что ваши данные остаются на вашем физическом устройстве (телефоне или компьютере). Они не загружаются на центральный облачный сервер, и разработчики не могут видеть или продавать вашу информацию о здоровье." },
        { q: "Что произойдет, если я очищу кэш браузера?", a: "Поскольку данные хранятся локально, очистка данных или кэша браузера удалит вашу историю. Мы рекомендуем регулярно использовать функцию «Экспорт данных», чтобы сохранять резервную копию для собственных записей." }
      ]
    }
  ]
};

export const FAQView: React.FC<{ lang?: Language; onBack?: () => void }> = ({ lang = 'en', onBack }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const currentLang = lang === 'ru' ? 'ru' : 'en';
  const data = FAQ_DATA[currentLang];

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40 px-6">
      <div className="flex justify-start">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
          {lang === 'ru' ? "Назад" : "Back"}
        </button>
      </div>

      <header className="flex flex-col items-center gap-8 text-center">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-950 dark:text-white">
          {lang === 'ru' ? "Частые" : "Common"} <br/> 
          <span className="text-luna-purple">{lang === 'ru' ? "Вопросы." : "Questions."}</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 italic font-medium max-w-3xl leading-relaxed">
          {lang === 'ru' 
            ? "Ответы, которые помогут вам ориентироваться в вашем путешествии с Luna. Каждое понимание — это шаг к лучшему знанию себя."
            : "Answers to help you navigate your journey with Luna. Every insight is a step towards understanding yourself better."}
        </p>
      </header>

      <section className="space-y-32">
        {data.map((cat, i) => (
          <article key={i} className="space-y-12">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 dark:text-slate-700">0{i+1}</span>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{cat.title}</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cat.items.map((item, j) => {
                const isOpen = openItems[`${i}-${j}`];
                return (
                  <div 
                    key={j} 
                    className={`border-2 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${isOpen ? 'border-luna-purple bg-white dark:bg-slate-900 shadow-luna-rich' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <button 
                      onClick={() => toggleItem(i, j)}
                      className="w-full p-8 md:p-10 flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-luna-purple' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'}`}>
                        {item.q}
                      </span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isOpen ? 'bg-luna-purple text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-8 md:px-10 pb-10">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-8" />
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
                              "{item.a}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <footer className="p-16 md:p-24 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-[5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-luna-purple rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-luna-teal rounded-full blur-[100px]" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 relative z-10">
          {lang === 'ru' ? "Наше обещание" : "Our Promise"}
        </p>
        <p className="text-2xl lg:text-4xl font-black italic leading-tight max-w-3xl mx-auto uppercase tracking-tighter relative z-10">
          {lang === 'ru' 
            ? "«Luna создана как ваше личное пространство. Мы ставим вашу конфиденциальность превыше всего, всегда»."
            : "\"Luna is designed to be a private space. We put your privacy first, always.\""}
        </p>
      </footer>
    </div>
  );
};
