import React from 'react';
import { Language } from '../../constants';

interface PublicRitualSectionProps {
  onSignIn: () => void;
  lang: Language;
}

export const PublicRitualSection: React.FC<PublicRitualSectionProps> = ({
  onSignIn,
  lang,
}) => {
  const ritualCopyByLang: Record<
    Language,
    { eyebrow: string; title: string; subtitle: string; morningTitle: string; morningBody: string; middayTitle: string; middayBody: string; eveningTitle: string; eveningBody: string }
  > = {
    en: { eyebrow: 'RITUAL PATH', title: 'A PATH, NOT A TASK LIST', subtitle: 'A simple daily rhythm to protect attention and preserve signal.', morningTitle: 'MORNING', morningBody: 'Name your baseline before the world sets your pace.', middayTitle: 'MIDDAY', middayBody: 'Re-check capacity and adjust plans with respect for your energy.', eveningTitle: 'EVENING', eveningBody: 'Close the day with a short reflection to preserve signal, not noise.' },
    ru: { eyebrow: 'RITUAL PATH', title: 'ПУТЬ, А НЕ СПИСОК ДЕЛ', subtitle: 'Простой ежедневный ритм, который защищает внимание и сохраняет сигнал состояния.', morningTitle: 'УТРО', morningBody: 'Назовите базовое состояние до того, как мир задаст темп.', middayTitle: 'ДЕНЬ', middayBody: 'Переоцените ресурс и скорректируйте планы с уважением к энергии.', eveningTitle: 'ВЕЧЕР', eveningBody: 'Закройте день короткой рефлексией, чтобы сохранить сигнал, а не шум.' },
    uk: { eyebrow: 'RITUAL PATH', title: 'ШЛЯХ, А НЕ СПИСОК ЗАВДАНЬ', subtitle: 'Простий щоденний ритм для захисту уваги і збереження сигналу стану.', morningTitle: 'РАНОК', morningBody: 'Назвіть свій базовий стан до того, як світ задасть темп.', middayTitle: 'ДЕНЬ', middayBody: 'Переоцініть ресурс і скоригуйте плани відповідно до енергії.', eveningTitle: 'ВЕЧІР', eveningBody: 'Завершіть день короткою рефлексією, зберігаючи сигнал, а не шум.' },
    es: { eyebrow: 'RITUAL PATH', title: 'UN CAMINO, NO UNA LISTA', subtitle: 'Un ritmo diario simple para proteger tu atención y conservar la señal.', morningTitle: 'MANANA', morningBody: 'Nombra tu estado base antes de que el mundo marque tu ritmo.', middayTitle: 'MEDIODIA', middayBody: 'Revisa tu capacidad y ajusta planes con respeto a tu energia.', eveningTitle: 'NOCHE', eveningBody: 'Cierra el dia con una reflexion corta para preservar señal, no ruido.' },
    fr: { eyebrow: 'RITUAL PATH', title: 'UN CHEMIN, PAS UNE LISTE', subtitle: 'Un rythme quotidien simple pour proteger l attention et conserver le signal.', morningTitle: 'MATIN', morningBody: 'Nommez votre base avant que le monde impose son rythme.', middayTitle: 'MIDI', middayBody: 'Reevaluez votre capacite et ajustez vos plans selon votre energie.', eveningTitle: 'SOIR', eveningBody: 'Fermez la journee avec une courte reflexion pour garder le signal, pas le bruit.' },
    de: { eyebrow: 'RITUAL PATH', title: 'EIN PFAD, KEINE TO-DO-LISTE', subtitle: 'Ein einfacher Tagesrhythmus, der Aufmerksamkeit schützt und Signale bewahrt.', morningTitle: 'MORGEN', morningBody: 'Benenne deinen Basiszustand, bevor die Welt dein Tempo setzt.', middayTitle: 'MITTAG', middayBody: 'Prüfe Kapazität neu und passe Pläne energie-gerecht an.', eveningTitle: 'ABEND', eveningBody: 'Schließe den Tag mit kurzer Reflexion, um Signal statt Rauschen zu behalten.' },
    zh: { eyebrow: 'RITUAL PATH', title: '是一条路径，不是任务清单', subtitle: '一个简单的日常节律，保护注意力并保留状态信号。', morningTitle: '早晨', morningBody: '在外界设定节奏前，先命名你的基线状态。', middayTitle: '中午', middayBody: '重新评估容量，并按能量调整计划。', eveningTitle: '夜晚', eveningBody: '用简短反思结束一天，保留信号而非噪音。' },
    ja: { eyebrow: 'RITUAL PATH', title: 'タスクではなく、道筋', subtitle: '注意力を守り、状態のシグナルを残すシンプルな日次リズム。', morningTitle: '朝', morningBody: '世界にペースを決められる前に、自分の基準状態を言語化する。', middayTitle: '昼', middayBody: '容量を再確認し、エネルギーに合わせて予定を調整する。', eveningTitle: '夜', eveningBody: '短い振り返りで一日を閉じ、ノイズではなくシグナルを残す。' },
    pt: { eyebrow: 'CAMINHO RITUAL', title: 'UM CAMINHO, NAO UMA LISTA', subtitle: 'Um ritmo diario simples que protege atencao e preserva sinal.', morningTitle: 'MANHA', morningBody: 'Nomeie sua base antes que o mundo imponha o ritmo.', middayTitle: 'MEIO-DIA', middayBody: 'Reavalie capacidade e ajuste planos com respeito a sua energia.', eveningTitle: 'NOITE', eveningBody: 'Feche o dia com uma reflexao curta para preservar sinal, nao ruido.' },
  };
  const sharedByLang: Record<Language, { noteTitle: string; noteLine1: string; noteLine2: string; enterMember: string; memberSignIn: string }> = {
    en: { noteTitle: 'LUNA NOTE', noteLine1: 'This Home is public by design. It gives orientation without extracting attention.', noteLine2: 'Your private member zone is where personal data, check-ins, and deeper tools live.', enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
    ru: { noteTitle: 'ЗАМЕТКА LUNA', noteLine1: 'Этот Home сделан публичным по дизайну: он дает ориентир без перегруза внимания.', noteLine2: 'Приватная member-зона — место для личных данных, check-in и более глубоких инструментов.', enterMember: 'Перейти в Member Zone', memberSignIn: 'Уже участник? Sign in' },
    uk: { noteTitle: 'НОТАТКА LUNA', noteLine1: 'Цей Home публічний за задумом: він дає орієнтацію без виснаження уваги.', noteLine2: 'Приватна member-зона — місце для персональних даних, check-in і глибших інструментів.', enterMember: 'Увійти в Member Zone', memberSignIn: 'Вже учасник? Sign in' },
    es: { noteTitle: 'LUNA NOTE', noteLine1: 'Este Home es público por diseño: orienta sin secuestrar tu atención.', noteLine2: 'Tu member zone privada es donde viven datos personales, check-ins y herramientas profundas.', enterMember: 'Entrar En Member Zone', memberSignIn: '¿Ya eres miembro? Sign in' },
    fr: { noteTitle: 'LUNA NOTE', noteLine1: 'Ce Home est public par design: il oriente sans capter excessivement votre attention.', noteLine2: 'Votre member zone privée est l espace des données personnelles, check-ins et outils avancés.', enterMember: 'Entrer Dans Member Zone', memberSignIn: 'Déjà membre ? Sign in' },
    de: { noteTitle: 'LUNA NOTE', noteLine1: 'Dieses Home ist bewusst öffentlich: Es gibt Orientierung ohne Aufmerksamkeitsdruck.', noteLine2: 'In deiner privaten Member Zone liegen persönliche Daten, Check-ins und tiefere Tools.', enterMember: 'In Member Zone Gehen', memberSignIn: 'Schon Mitglied? Sign in' },
    zh: { noteTitle: 'LUNA NOTE', noteLine1: 'Home 页面是公开设计：提供方向，不消耗注意力。', noteLine2: '你的私密 member zone 才是个人数据、check-in 和深度工具所在。', enterMember: '进入 Member Zone', memberSignIn: '已有会员？Sign in' },
    ja: { noteTitle: 'LUNA NOTE', noteLine1: 'この Home は公開設計です。注意を奪わず、方向だけを示します。', noteLine2: '個人データ、check-in、深いツールは private member zone にあります。', enterMember: 'Member Zone に入る', memberSignIn: 'メンバーですか？ Sign in' },
    pt: { noteTitle: 'LUNA NOTE', noteLine1: 'Este Home e publico por design: orienta sem sequestrar sua atencao.', noteLine2: 'Sua member zone privada e onde ficam dados pessoais, check-ins e ferramentas profundas.', enterMember: 'Entrar Na Member Zone', memberSignIn: 'Ja e membro? Sign in' },
  };
  const copy = ritualCopyByLang[lang] || ritualCopyByLang.en;
  const shared = sharedByLang[lang] || sharedByLang.en;
  return (
    <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
      <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#fbf3f8]/90 via-[#f3eef7]/86 to-[#ecf2fa]/82 dark:from-[#070f23]/92 dark:via-[#0b1733]/90 dark:to-[#122345]/88 p-8 md:p-12 shadow-[0_24px_64px_rgba(88,68,128,0.16)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] space-y-12">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">{copy.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{copy.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">{copy.morningTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.morningBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">{copy.middayTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.middayBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">{copy.eveningTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.eveningBody}</p>
          </article>
        </div>

        <article className="rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f4e8f1]/84 via-[#ece6f2]/80 to-[#e5ecf8]/76 dark:from-[#061127]/94 dark:via-[#0a1732]/92 dark:to-[#0f2142]/90 p-6 md:p-8 space-y-3 shadow-[0_16px_38px_rgba(88,70,126,0.14)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple dark:text-slate-700">{shared.noteTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-800 leading-relaxed">
            {shared.noteLine1}
            <br />
            {shared.noteLine2}
          </p>
        </article>

        <div className="flex flex-col items-start gap-4">
          <button
            onClick={onSignIn}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple"
          >
            {shared.enterMember}
          </button>
          <button
            onClick={onSignIn}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple rounded-md"
          >
            {shared.memberSignIn}
          </button>
        </div>
      </div>
    </section>
  );
};
