import React from 'react';
import { Language } from '../constants';

interface AboutLunaViewProps {
  lang: Language;
  mode?: 'public' | 'member';
  onBack?: () => void;
}

type AboutCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  intro: string;
  block1Title: string;
  block1Text1: string;
  block1Text2: string;
  block2Title: string;
  block2Text1: string;
  block2Text2: string;
  finalTitle: string;
  finalText1: string;
  finalText2: string;
  finalText3: string;
};

const COPY: Record<Language, AboutCopy> = {
  en: {
    eyebrow: 'About',
    title: 'About Luna',
    lead: 'Luna was born inside a much larger research environment.',
    intro: 'For many years our team has been working on a long-term project called BioMath — a digital modeling initiative focused on understanding how the human body changes over time. The work behind BioMath explores physiological rhythms, biological signals, behavioral patterns, and the complex ways they interact to shape energy, mood, and recovery.',
    block1Title: 'From BioMath To Luna',
    block1Text1: 'Within this broader system, more than 200 different services and tools are being developed to help people better observe and understand their own biological dynamics.',
    block1Text2: 'Luna is one of those services. During the development of BioMath we realized that one part of this work — helping women calmly observe their internal rhythms and translate those signals into clear understanding — could stand on its own. The result is Luna.',
    block2Title: 'What Luna Focuses On',
    block2Text1: 'Luna focuses on a simple but often overlooked need: the ability to pause, observe internal signals, and form a clear picture of what is happening inside the body and mind at a given moment.',
    block2Text2: 'Behind Luna are years of work in digital modeling, data structures for human physiology, and the study of long-term biological patterns. These efforts were not originally intended to create a single application.',
    finalTitle: 'A Distilled Practical Layer',
    finalText1: 'Luna represents a distilled, practical part of that work.',
    finalText2: 'It does not attempt to diagnose or treat. Instead, it offers a quiet digital environment where physiological rhythms, personal observations, and reflection can come together to create a deeper sense of clarity.',
    finalText3: 'In the broader BioMath ecosystem, Luna is one piece of a much larger vision. On its own, it is a simple tool designed to bring that deeper research into everyday life in a calm and accessible way.',
  },
  ru: {
    eyebrow: 'О проекте',
    title: 'О Luna',
    lead: 'Luna родилась внутри гораздо более широкой исследовательской среды.',
    intro: 'На протяжении многих лет наша команда работает над долгосрочным проектом BioMath — инициативой цифрового моделирования, направленной на понимание того, как человеческое тело меняется во времени. Работа в BioMath исследует физиологические ритмы, биологические сигналы, поведенческие паттерны и сложные связи между ними, влияющие на энергию, настроение и восстановление.',
    block1Title: 'От BioMath к Luna',
    block1Text1: 'Внутри этой широкой системы разрабатывается более 200 сервисов и инструментов, которые помогают людям лучше наблюдать и понимать собственную биологическую динамику.',
    block1Text2: 'Luna — один из таких сервисов. В процессе разработки BioMath мы поняли, что отдельная часть этой работы — спокойное наблюдение внутренних ритмов у женщин и перевод этих сигналов в ясное понимание — может существовать как самостоятельный инструмент. Так появилась Luna.',
    block2Title: 'На чем фокусируется Luna',
    block2Text1: 'Luna сосредоточена на простой, но часто недооцененной потребности: умении остановиться, заметить внутренние сигналы и сформировать ясную картину того, что происходит в теле и сознании в конкретный момент.',
    block2Text2: 'За Luna стоят годы работы в цифровом моделировании, структуры данных человеческой физиологии и исследования долгосрочных биологических паттернов. Изначально эти усилия не были направлены на создание одного приложения.',
    finalTitle: 'Сжатый практический слой',
    finalText1: 'Luna — это концентрированная практическая часть этой большой работы.',
    finalText2: 'Она не пытается ставить диагнозы или лечить. Вместо этого Luna дает тихую цифровую среду, где физиологические ритмы, личные наблюдения и рефлексия соединяются в более ясное понимание состояния.',
    finalText3: 'В экосистеме BioMath Luna — лишь часть гораздо более широкой визии. Но сама по себе это простой инструмент, который делает глубокие исследования доступными в повседневной жизни — спокойно и понятно.',
  },
  uk: {
    eyebrow: 'Про проект',
    title: 'Про Luna',
    lead: 'Luna народилася всередині значно ширшого дослідницького середовища.',
    intro: 'Протягом багатьох років наша команда працює над довгостроковим проєктом BioMath — ініціативою цифрового моделювання, що вивчає, як людське тіло змінюється з часом. Робота BioMath досліджує фізіологічні ритми, біологічні сигнали, поведінкові патерни та їхні складні взаємозвʼязки, які формують енергію, настрій і відновлення.',
    block1Title: 'Від BioMath до Luna',
    block1Text1: 'У межах цієї ширшої системи розробляється понад 200 сервісів та інструментів, що допомагають людям краще спостерігати й розуміти власну біологічну динаміку.',
    block1Text2: 'Luna — один із цих сервісів. Під час розвитку BioMath ми побачили, що окрема частина цієї роботи — допомога жінкам спокійно спостерігати внутрішні ритми та перетворювати сигнали на ясне розуміння — може існувати самостійно.',
    block2Title: 'Фокус Luna',
    block2Text1: 'Luna зосереджена на простій, але часто недооціненій потребі: зупинитися, помітити внутрішні сигнали та сформувати чітку картину того, що відбувається в тілі й свідомості саме зараз.',
    block2Text2: 'За Luna стоять роки праці в цифровому моделюванні, структурах даних людської фізіології та вивченні довгострокових біологічних патернів.',
    finalTitle: 'Практичне втілення великої роботи',
    finalText1: 'Luna — це концентрована практична частина цього великого напрямку.',
    finalText2: 'Вона не діагностує і не лікує. Натомість Luna надає тихий цифровий простір, де фізіологічні ритми, особисті спостереження й рефлексія поєднуються у ясність.',
    finalText3: 'У ширшій екосистемі BioMath Luna — лише одна частина великого бачення. Але окремо це простий інструмент, що переносить глибокі дослідження в повсякденне життя спокійно й доступно.',
  },
  es: {
    eyebrow: 'Acerca',
    title: 'Sobre Luna',
    lead: 'Luna nació dentro de un entorno de investigación mucho más amplio.',
    intro: 'Durante muchos años nuestro equipo ha trabajado en un proyecto de largo plazo llamado BioMath — una iniciativa de modelado digital enfocada en comprender cómo cambia el cuerpo humano con el tiempo. BioMath explora ritmos fisiológicos, señales biológicas, patrones de comportamiento y sus interacciones complejas.',
    block1Title: 'De BioMath a Luna',
    block1Text1: 'Dentro de este sistema más amplio se están desarrollando más de 200 servicios y herramientas para ayudar a las personas a observar y comprender mejor su dinámica biológica.',
    block1Text2: 'Luna es uno de esos servicios. En el desarrollo de BioMath entendimos que una parte de ese trabajo — ayudar a las mujeres a observar sus ritmos internos con calma y traducir esas señales en comprensión clara — podía funcionar por sí sola.',
    block2Title: 'En qué se enfoca Luna',
    block2Text1: 'Luna se centra en una necesidad simple pero olvidada: pausar, observar señales internas y formar una imagen clara de lo que sucede en cuerpo y mente.',
    block2Text2: 'Detrás de Luna hay años de modelado digital, estructuras de datos fisiológicos y estudio de patrones biológicos de largo plazo.',
    finalTitle: 'Una capa práctica condensada',
    finalText1: 'Luna representa una parte práctica y destilada de ese trabajo.',
    finalText2: 'No intenta diagnosticar ni tratar. Ofrece un entorno digital tranquilo donde ritmos fisiológicos, observaciones personales y reflexión se unen para generar claridad.',
    finalText3: 'En el ecosistema BioMath, Luna es una pieza de una visión mucho mayor. Por sí sola, es una herramienta simple que acerca esa investigación a la vida cotidiana.',
  },
  fr: {
    eyebrow: 'A Propos',
    title: 'A propos de Luna',
    lead: 'Luna est nee au sein d un environnement de recherche beaucoup plus vaste.',
    intro: 'Depuis des annees, notre equipe travaille sur BioMath, une initiative de modelisation numerique consacree a la comprehension des evolutions du corps humain dans le temps.',
    block1Title: 'De BioMath a Luna',
    block1Text1: 'Dans cet ecosysteme, plus de 200 services et outils sont en cours de developpement pour aider les personnes a observer et comprendre leur dynamique biologique.',
    block1Text2: 'Luna est l un de ces services. Nous avons compris qu une partie de ce travail pouvait exister de facon autonome: aider les femmes a observer calmement leurs rythmes internes et a les traduire en clarte.',
    block2Title: 'Le focus de Luna',
    block2Text1: 'Luna repond a un besoin simple: faire une pause, observer les signaux internes et clarifier ce qui se passe dans le corps et l esprit.',
    block2Text2: 'Derriere Luna, il y a des annees de modelisation numerique, de structures de donnees physiologiques et d etudes des patterns biologiques de long terme.',
    finalTitle: 'Une couche pratique distillee',
    finalText1: 'Luna represente une partie pratique et distillee de ce travail.',
    finalText2: 'Elle ne diagnostique pas et ne traite pas. Elle propose un environnement numerique calme ou rythmes physiologiques, observations personnelles et reflexion se rencontrent.',
    finalText3: 'Dans l ecosysteme BioMath, Luna n est qu une piece d une vision plus large. A elle seule, c est un outil simple et accessible pour la vie quotidienne.',
  },
  de: {
    eyebrow: 'Uber',
    title: 'Uber Luna',
    lead: 'Luna entstand in einem deutlich groesseren Forschungsumfeld.',
    intro: 'Seit vielen Jahren arbeitet unser Team an BioMath, einer langfristigen digitalen Modellierungsinitiative, die untersucht, wie sich der menschliche Koerper im Zeitverlauf veraendert.',
    block1Title: 'Von BioMath zu Luna',
    block1Text1: 'Innerhalb dieses groesseren Systems entstehen ueber 200 Services und Tools, die Menschen helfen sollen, ihre biologische Dynamik besser zu beobachten und zu verstehen.',
    block1Text2: 'Luna ist einer dieser Services. Waehrend der Entwicklung wurde klar, dass ein Teil davon eigenstaendig funktionieren kann: Frauen dabei zu helfen, innere Rhythmen ruhig zu beobachten und in klare Einsicht zu uebersetzen.',
    block2Title: 'Worauf Luna fokussiert',
    block2Text1: 'Luna konzentriert sich auf ein einfaches, oft uebersehenes Beduerfnis: innehalten, innere Signale wahrnehmen und ein klares Bild vom aktuellen Zustand in Koerper und Geist bilden.',
    block2Text2: 'Hinter Luna stehen Jahre an digitaler Modellierung, physiologischen Datenstrukturen und Forschung zu langfristigen biologischen Mustern.',
    finalTitle: 'Ein verdichteter praktischer Teil',
    finalText1: 'Luna ist ein verdichteter, praktischer Teil dieser Arbeit.',
    finalText2: 'Luna diagnostiziert oder behandelt nicht. Stattdessen bietet sie einen ruhigen digitalen Raum, in dem Rhythmen, Beobachtungen und Reflexion zu Klarheit fuehren.',
    finalText3: 'Im BioMath-Oekosystem ist Luna ein Teil einer groesseren Vision. Fuer sich ist es ein einfaches Werkzeug fuer alltagstaugliche Klarheit.',
  },
  zh: {
    eyebrow: '关于',
    title: '关于 Luna',
    lead: 'Luna 诞生于一个更大的长期研究环境。',
    intro: '多年来，我们团队一直在推进名为 BioMath 的长期项目。这是一个数字建模计划，目标是理解人体如何随时间变化。BioMath 研究生理节律、生物信号、行为模式及其复杂互动。',
    block1Title: '从 BioMath 到 Luna',
    block1Text1: '在这个更大的系统中，我们正在开发 200 多个服务和工具，帮助人们更好地观察并理解自身的生物动力学。',
    block1Text2: 'Luna 是其中之一。在 BioMath 的开发过程中，我们发现有一部分工作可以独立存在：帮助女性平静地观察内在节律，并将这些信号转化为清晰理解。',
    block2Title: 'Luna 的核心',
    block2Text1: 'Luna 专注于一个常被忽视但非常重要的能力：暂停、观察内部信号，并形成当下身心状态的清晰图景。',
    block2Text2: 'Luna 背后是多年数字建模、人体生理数据结构研究以及长期生物模式研究的积累。',
    finalTitle: '可落地的精炼成果',
    finalText1: 'Luna 是这项大规模工作的一个精炼且实用的部分。',
    finalText2: '它不做诊断，也不做治疗。它提供一个安静的数字环境，让生理节律、个人观察与反思汇聚成更深层的清晰感。',
    finalText3: '在更广阔的 BioMath 生态中，Luna 只是其中一块拼图；但作为独立产品，它把深层研究以平静、易用的方式带入日常生活。',
  },
  ja: {
    eyebrow: '概要',
    title: 'Luna について',
    lead: 'Luna は、より大きな研究環境の中で生まれました。',
    intro: '私たちのチームは長年にわたり、BioMath という長期プロジェクトに取り組んできました。これは、人間の身体が時間とともにどう変化するかを理解するためのデジタルモデリングの取り組みです。',
    block1Title: 'BioMath から Luna へ',
    block1Text1: 'この大きなシステムの中で、200 を超えるサービスとツールが開発されており、個々の生体ダイナミクスをよりよく観察・理解できるように設計されています。',
    block1Text2: 'Luna はその一つです。BioMath 開発の過程で、女性が内的リズムを落ち着いて観察し、信号を明確な理解へ変換する部分は独立して成立すると分かりました。',
    block2Title: 'Luna の焦点',
    block2Text1: 'Luna は、見落とされがちなシンプルなニーズに焦点を当てます。立ち止まり、内側の信号を観察し、心身で何が起きているかを明確に捉えることです。',
    block2Text2: 'Luna の背後には、デジタルモデリング、生理データ構造、長期的な生物学的パターン研究の積み重ねがあります。',
    finalTitle: '実用に落とし込んだ要素',
    finalText1: 'Luna は、その研究の中から抽出された実用的なレイヤーです。',
    finalText2: '診断や治療を目的とせず、静かなデジタル環境の中で、生理リズム・個人観察・リフレクションを結び、より深い明瞭さを生みます。',
    finalText3: 'BioMath 全体では Luna は大きなビジョンの一部ですが、単体でも日常に研究知見を届けるシンプルで使いやすいツールです。',
  },
  pt: {
    eyebrow: 'Sobre',
    title: 'Sobre Luna',
    lead: 'A Luna nasceu dentro de um ambiente de pesquisa muito maior.',
    intro: 'Por muitos anos, nossa equipe vem trabalhando no BioMath, uma iniciativa de modelagem digital focada em entender como o corpo humano muda ao longo do tempo.',
    block1Title: 'De BioMath para Luna',
    block1Text1: 'Dentro desse sistema mais amplo, mais de 200 servicos e ferramentas estao sendo desenvolvidos para ajudar as pessoas a observar e entender melhor sua dinamica biologica.',
    block1Text2: 'Luna e um desses servicos. Durante o desenvolvimento do BioMath percebemos que uma parte desse trabalho poderia existir de forma independente: ajudar mulheres a observar ritmos internos com calma e transformar sinais em clareza.',
    block2Title: 'No que a Luna foca',
    block2Text1: 'Luna foca em uma necessidade simples e muitas vezes ignorada: pausar, observar sinais internos e formar uma visao clara do que esta acontecendo no corpo e na mente.',
    block2Text2: 'Por tras da Luna ha anos de modelagem digital, estruturas de dados da fisiologia humana e estudo de padroes biologicos de longo prazo.',
    finalTitle: 'Uma camada pratica destilada',
    finalText1: 'A Luna representa uma parte pratica e destilada desse trabalho.',
    finalText2: 'Ela nao tenta diagnosticar nem tratar. Em vez disso, oferece um ambiente digital calmo onde ritmos fisiologicos, observacoes pessoais e reflexao se unem para gerar clareza.',
    finalText3: 'No ecossistema BioMath, Luna e uma parte de uma visao muito maior. Sozinha, e uma ferramenta simples para trazer essa pesquisa ao dia a dia de forma acessivel.',
  },
};

export const AboutLunaView: React.FC<AboutLunaViewProps> = ({ lang, mode = 'public', onBack }) => {
  const about = COPY[lang] || COPY.en;
  const wrapperClass = mode === 'public' ? 'luna-page-shell luna-page-knowledge p-6 md:p-8' : 'max-w-6xl mx-auto pb-24';

  return (
    <section className={`${wrapperClass} animate-in fade-in duration-500 space-y-7`}>
      {onBack && (
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          ← Back
        </button>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <article className="lg:col-span-3 rounded-[2.8rem] border border-slate-300/75 dark:border-slate-800/90 bg-gradient-to-br from-slate-200/95 via-slate-100/95 to-indigo-100/70 dark:from-[#040a18] dark:via-[#081127] dark:to-[#0b1b3a] p-7 md:p-10 space-y-5 shadow-[0_18px_46px_rgba(71,85,105,0.22)] dark:shadow-[0_22px_60px_rgba(2,6,23,0.78)]">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{about.eyebrow}</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.title}</h2>
          <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.lead}</p>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{about.intro}</p>
        </article>
        <article className="lg:col-span-2 rounded-[2.8rem] border border-slate-300/75 dark:border-slate-800/90 overflow-hidden bg-gradient-to-br from-slate-200/95 via-slate-100/95 to-sky-100/70 dark:bg-[#050b1a] p-4 md:p-5 shadow-[0_18px_46px_rgba(71,85,105,0.2)] dark:shadow-[0_22px_60px_rgba(2,6,23,0.75)]">
          <div className="relative rounded-[2rem] overflow-hidden mx-auto w-full max-w-[360px]">
            <img
              src="/images/Luna%20L%2044.png"
              alt="Luna L 44"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-transparent to-white/8 dark:from-slate-950/35 dark:to-transparent" />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-300/80 dark:border-slate-800/90 bg-slate-100/90 dark:bg-[#0a1328]/85 backdrop-blur-md px-4 py-3 shadow-[0_8px_22px_rgba(71,85,105,0.22)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.65)]">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-luna-purple">Luna</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Luna — The physiology of feeling.</p>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="rounded-[2.2rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card-alt-1 bg-gradient-to-br from-amber-100/85 via-rose-100/60 to-slate-100/90 dark:bg-none p-6 md:p-8 space-y-4 shadow-[0_14px_34px_rgba(100,116,139,0.2)] dark:shadow-none">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.block1Title}</h3>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block1Text1}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block1Text2}</p>
        </article>

        <article className="rounded-[2.2rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card-alt-3 bg-gradient-to-br from-indigo-100/80 via-sky-100/65 to-slate-100/90 dark:bg-none p-6 md:p-8 space-y-4 shadow-[0_14px_34px_rgba(100,116,139,0.22)] dark:shadow-none">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.block2Title}</h3>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block2Text1}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.block2Text2}</p>
        </article>
      </div>

      <article className="rounded-[2.5rem] border border-slate-300/75 dark:border-slate-700/70 luna-vivid-card bg-gradient-to-br from-violet-100/70 via-slate-100/95 to-amber-100/70 dark:bg-none p-7 md:p-9 shadow-[0_16px_38px_rgba(71,85,105,0.2)] dark:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 space-y-5">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{about.finalTitle}</h3>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText1}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText2}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{about.finalText3}</p>
          </div>
          <aside className="lg:col-span-2 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-4 p-3 md:p-4 shadow-[0_14px_42px_rgba(74,58,116,0.16),0_5px_16px_rgba(71,126,143,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] space-y-3">
            <div className="relative z-10 h-64 md:h-[22rem] rounded-[2.2rem] overflow-hidden border border-transparent bg-transparent">
              <img
                src="/images/window_reflection_portrait.webp"
                alt="Luna Reflection Portrait"
                className="absolute -top-8 inset-x-0 h-[calc(100%+2rem)] w-full object-cover"
                style={{ objectPosition: '50% 28%' }}
              />
              <div className="absolute -top-8 inset-x-0 h-[calc(100%+2rem)] bg-gradient-to-b from-[rgba(14,18,34,0.58)] via-[rgba(18,24,40,0.5)] to-[rgba(15,20,36,0.72)] dark:from-[rgba(8,12,24,0.72)] dark:via-[rgba(12,17,30,0.62)] dark:to-[rgba(8,12,24,0.78)]" />
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
