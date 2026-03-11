import { Language } from '../constants';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

interface FAQViewCopy {
  back: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  promiseTitle: string;
  promiseQuote: string;
  commentsTitle: string;
  comments: Array<{ quote: string; author: string }>;
}

const FAQ_DATA: Record<Language, FAQCategory[]> = {
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
        { q: "Is Luna medical?", a: "No. Luna is not a medical service, medical device, diagnostic tool, or treatment provider. It is a digital educational and self-observation system." },
        { q: "Is Luna therapy?", a: "No. Luna is not therapy and does not replace licensed psychological or psychiatric care. It can support reflection but it is not a clinical intervention." },
        { q: "Is this a medical product?", a: "No. Luna Balance is a digital educational system, not a medical product, diagnostic tool, or healthcare service. It does not possess clinical certification and is intended for self-awareness only." },
        { q: "Can Luna replace a doctor?", a: "No. This system is a preparation tool to use BEFORE you see your doctor. It organizes your daily observations into a clear summary to help your provider during a visit. Always consult a qualified professional for medical concerns." },
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
        { q: "What data does Luna use?", a: "Luna uses the data you enter or generate inside the app: cycle observations, check-ins, reflections, selected symptom markers, and profile context you choose to provide." },
        { q: "How private is Luna?", a: "Luna follows a local-first model. Your data is stored on your device and is not uploaded to a central cloud by default. You control exports and sharing." },
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
  ],
  uk: [
    {
      title: "Загальне розуміння",
      items: [
        { q: "Що таке Luna Balance?", a: "Luna Balance - це система візуального картування фізіологічних ритмів. Вона допомагає бачити, як гормони пов'язані з енергією, настроєм і відновленням." },
        { q: "Для кого ця система?", a: "Для жінок, які хочуть краще розуміти своє тіло в різні етапи циклу та життя." },
        { q: "Чим це відрізняється від звичайних трекерів циклу?", a: "Більшість трекерів передбачають дати. Luna дивиться ширше: стрес, метаболізм, відчуття та патерни стану." },
        { q: "Чи потрібні медичні знання?", a: "Ні. Інтерфейс побудовано просто: зрозумілі шкали, мова без складних термінів і контекстні пояснення." }
      ]
    },
    {
      title: "Медицина і безпека",
      items: [
        { q: "Це медичний продукт?", a: "Ні. Luna є цифровою освітньою системою для самоспостереження і не надає медичну послугу." },
        { q: "Чи замінює це лікаря?", a: "Ні. Це інструмент підготовки до консультації: ви приходите до фахівця з більш структурованими даними." },
        { q: "Чи дає система діагнози?", a: "Ні. Luna не призначає лікування і не встановлює діагнози. Медичні рішення ухвалюються з лікарем." }
      ]
    },
    {
      title: "Гормони і щоденне життя",
      items: [
        { q: "Чому гормони впливають на настрій та енергію?", a: "Гормони задають базовий фон нервової системи та обміну речовин, тому змінюють відчуття ресурсу протягом дня." },
        { q: "Чому стрес так сильно впливає?", a: "За високого стресу система тіла переключається в режим виживання, і це змінює інші гормональні сигнали." },
        { q: "Як виглядає стан напруги в житті?", a: "Зазвичай це відчуття перевантаження, дратівливості, зниження фокусу. Це сигнал сповільнитися і відновитися." }
      ]
    },
    {
      title: "Цикл і фази",
      items: [
        { q: "Чому цикл змінює самопочуття?", a: "Рівні гормонів упродовж циклу змінюються, тому змінюються енергія, настрій, чутливість і соціальна витривалість." },
        { q: "Що робити, якщо цикл нерегулярний?", a: "Система гнучка: орієнтуйтеся на свої реальні симптоми й спостереження, а не лише на умовні дні." },
        { q: "Чи працює Luna з гормональною контрацепцією?", a: "Так. Картина може бути більш стабільною, але щоденні відмітки все одно допоможуть побачити індивідуальні реакції." }
      ]
    },
    {
      title: "Дані і приватність",
      items: [
        { q: "Де зберігаються мої дані?", a: "Luna працює за local-first підходом: дані зберігаються на вашому пристрої." },
        { q: "Що станеться, якщо очистити кеш браузера?", a: "Локальна історія може бути видалена. Рекомендується регулярний експорт даних для резервної копії." }
      ]
    }
  ],
  es: [
    {
      title: "Comprensión general",
      items: [
        { q: "¿Qué es Luna Balance?", a: "Luna Balance es un sistema visual para mapear tus ritmos fisiológicos y entender cómo se relacionan con tu energía y estado emocional." },
        { q: "¿Para quién es este sistema?", a: "Para cualquier mujer que quiera comprender mejor su cuerpo y detectar patrones de bienestar en su vida diaria." },
        { q: "¿En qué se diferencia de una app de ciclo tradicional?", a: "No se limita a predecir fechas. Integra señales de estrés, metabolismo y estado general para una visión más completa." },
        { q: "¿Necesito conocimientos médicos para usarlo?", a: "No. El lenguaje es claro y los indicadores están diseñados para ser comprensibles sin formación médica." }
      ]
    },
    {
      title: "Medicina y seguridad",
      items: [
        { q: "¿Es un producto médico?", a: "No. Es una herramienta digital educativa y de autoobservación." },
        { q: "¿Sustituye al médico?", a: "No. Sirve para preparar mejor la consulta con tu profesional de salud." },
        { q: "¿Da diagnósticos o tratamiento?", a: "No. Luna no diagnostica ni prescribe. Las decisiones médicas deben tomarse con un profesional." }
      ]
    },
    {
      title: "Hormonas y vida diaria",
      items: [
        { q: "¿Por qué las hormonas afectan mi energía y ánimo?", a: "Porque modulan la forma en que tu cerebro y tu cuerpo procesan señales, descanso y carga diaria." },
        { q: "¿Por qué el estrés impacta tanto?", a: "Con estrés alto, el cuerpo prioriza supervivencia y eso altera otros ejes hormonales." },
        { q: "¿Cómo se siente un estado de tensión?", a: "Puede sentirse como sobrecarga, sensibilidad alta y baja tolerancia. Es una señal para bajar ritmo y recuperarte." }
      ]
    },
    {
      title: "Ciclo y fases",
      items: [
        { q: "¿Por qué el ciclo cambia cómo me siento?", a: "Porque las hormonas suben y bajan por fases, y eso afecta foco, energía, apetito y sociabilidad." },
        { q: "¿Y si mi ciclo es irregular?", a: "Luna es flexible: puedes ajustar el mapa según señales reales de tu cuerpo." },
        { q: "¿Sirve si uso anticonceptivos hormonales?", a: "Sí. El patrón suele ser más estable, pero aún puedes observar respuestas personales día a día." }
      ]
    },
    {
      title: "Datos y privacidad",
      items: [
        { q: "¿Dónde se guardan mis datos?", a: "En almacenamiento local de tu dispositivo, bajo un enfoque local-first." },
        { q: "¿Qué pasa si borro la caché?", a: "Puedes perder el historial local. Se recomienda exportar datos de forma periódica." }
      ]
    }
  ],
  fr: [
    {
      title: "Compréhension générale",
      items: [
        { q: "Qu’est-ce que Luna Balance ?", a: "Luna Balance est un système visuel qui cartographie vos rythmes physiologiques pour mieux comprendre votre énergie et votre humeur." },
        { q: "À qui s’adresse ce système ?", a: "À toute femme qui souhaite mieux lire les signaux de son corps au quotidien." },
        { q: "En quoi est-ce différent d’une application de cycle classique ?", a: "Luna ne se limite pas aux dates. Elle intègre stress, métabolisme et ressenti global." },
        { q: "Faut-il des connaissances médicales ?", a: "Non. Le langage est simple et les indicateurs sont conçus pour être accessibles." }
      ]
    },
    {
      title: "Médecine et sécurité",
      items: [
        { q: "Est-ce un produit médical ?", a: "Non. C’est un outil numérique éducatif de self-observation." },
        { q: "Est-ce que cela remplace un médecin ?", a: "Non. Cela aide à préparer une consultation de manière plus structurée." },
        { q: "Donne-t-il un diagnostic ?", a: "Non. Luna ne diagnostique pas et ne prescrit pas de traitement." }
      ]
    },
    {
      title: "Hormones et vie quotidienne",
      items: [
        { q: "Pourquoi les hormones influencent-elles l’énergie et l’humeur ?", a: "Elles modulent le système nerveux et le métabolisme, donc la perception de la charge quotidienne." },
        { q: "Pourquoi le stress influence-t-il autant ?", a: "En stress élevé, le corps priorise la survie, ce qui peut perturber d’autres signaux hormonaux." },
        { q: "À quoi ressemble un état tendu ?", a: "Souvent: surcharge, irritabilité, sensibilité accrue. C’est un signal pour ralentir et récupérer." }
      ]
    },
    {
      title: "Cycle et phases",
      items: [
        { q: "Pourquoi le cycle modifie-t-il mon état ?", a: "Parce que les hormones varient selon les phases et impactent énergie, attention et stabilité émotionnelle." },
        { q: "Et si mon cycle est irrégulier ?", a: "Luna est flexible: vous pouvez aligner la carte sur vos signaux réels." },
        { q: "Est-ce utile sous contraception hormonale ?", a: "Oui. Le profil peut être plus stable, mais l’observation quotidienne reste pertinente." }
      ]
    },
    {
      title: "Données et confidentialité",
      items: [
        { q: "Où sont stockées mes données ?", a: "Sur votre appareil, via un modèle local-first." },
        { q: "Que se passe-t-il si je vide le cache ?", a: "L’historique local peut être supprimé. Il est recommandé d’exporter régulièrement vos données." }
      ]
    }
  ],
  de: [
    {
      title: "Grundverständnis",
      items: [
        { q: "Was ist Luna Balance?", a: "Luna Balance ist ein visuelles System, das physiologische Rhythmen abbildet und damit Energie- und Stimmungsmuster sichtbar macht." },
        { q: "Für wen ist das System gedacht?", a: "Für Frauen, die ihren Körper klarer verstehen und wiederkehrende Muster erkennen möchten." },
        { q: "Was ist der Unterschied zu klassischen Zyklus-Apps?", a: "Luna geht über Datumsprognosen hinaus und bezieht Stress, Stoffwechsel und Alltagszustand ein." },
        { q: "Brauche ich medizinisches Vorwissen?", a: "Nein. Sprache und Darstellung sind bewusst einfach und praxisnah gestaltet." }
      ]
    },
    {
      title: "Medizin und Sicherheit",
      items: [
        { q: "Ist das ein Medizinprodukt?", a: "Nein. Luna ist ein digitales Selbstbeobachtungs- und Lernsystem." },
        { q: "Ersetzt es Ärztinnen oder Ärzte?", a: "Nein. Es hilft, Beobachtungen für einen Arzttermin besser zu strukturieren." },
        { q: "Stellt Luna Diagnosen?", a: "Nein. Es werden keine Diagnosen oder Therapien vorgegeben." }
      ]
    },
    {
      title: "Hormone und Alltag",
      items: [
        { q: "Warum beeinflussen Hormone Stimmung und Energie?", a: "Weil sie zentrale Prozesse wie Stressregulation, Schlafqualität und Energiebereitstellung steuern." },
        { q: "Warum wirkt Stress so stark?", a: "Bei hoher Belastung priorisiert der Körper Überleben, wodurch andere Achsen aus dem Gleichgewicht geraten können." },
        { q: "Wie fühlt sich ein angespannter Zustand an?", a: "Typisch sind Reizbarkeit, Überforderung und geringe Belastbarkeit - ein Signal für Erholung." }
      ]
    },
    {
      title: "Zyklus und Phasen",
      items: [
        { q: "Warum verändert der Zyklus mein Befinden?", a: "Hormonverläufe ändern sich phasenweise und beeinflussen Fokus, soziale Energie und körperliches Empfinden." },
        { q: "Was bei unregelmäßigem Zyklus?", a: "Luna ist flexibel und kann an reale Körpersignale angepasst werden." },
        { q: "Funktioniert das mit hormoneller Verhütung?", a: "Ja. Auch bei stabilerer Kurve lassen sich individuelle Reaktionen beobachten." }
      ]
    },
    {
      title: "Daten und Datenschutz",
      items: [
        { q: "Wo werden meine Daten gespeichert?", a: "Lokal auf deinem Gerät (local-first)." },
        { q: "Was passiert beim Löschen des Browser-Cache?", a: "Lokale Historie kann verloren gehen. Regelmäßiger Datenexport wird empfohlen." }
      ]
    }
  ],
  zh: [
    {
      title: "基础理解",
      items: [
        { q: "什么是 Luna Balance？", a: "Luna Balance 是一个可视化系统，用于映射你的生理节律，帮助你理解能量与情绪变化。"},
        { q: "这个系统适合谁？", a: "适合希望更了解自己身体状态与周期规律的女性用户。"},
        { q: "它与普通经期 App 有何不同？", a: "它不只预测日期，还关注压力、代谢和整体状态的关联。"},
        { q: "我需要医学背景吗？", a: "不需要。界面和语言都尽量简明，便于日常使用。"}
      ]
    },
    {
      title: "医疗与安全",
      items: [
        { q: "这是医疗产品吗？", a: "不是。Luna 是用于自我观察和学习的数字工具。"},
        { q: "它能替代医生吗？", a: "不能。它用于帮助你在就诊前整理观察信息。"},
        { q: "它会给出诊断或治疗吗？", a: "不会。Luna 不提供诊断与处方。"}
      ]
    },
    {
      title: "激素与日常生活",
      items: [
        { q: "为什么激素会影响情绪和精力？", a: "激素会影响神经系统与能量调节，因此会改变日常体验。"},
        { q: "为什么压力影响这么大？", a: "高压力时，身体会优先进入生存模式，从而干扰其他激素信号。"},
        { q: "“紧张状态”在现实中是什么感觉？", a: "常见表现是易烦躁、负荷感重、恢复变慢。"}
      ]
    },
    {
      title: "周期与阶段",
      items: [
        { q: "为什么周期会影响我的感受？", a: "因为不同阶段激素水平不同，会影响专注、社交和体感状态。"},
        { q: "如果周期不规律怎么办？", a: "Luna 支持按你的真实体征进行调整，而不是固定天数。"},
        { q: "使用激素避孕时还有效吗？", a: "有效。即使曲线更稳定，仍能观察到个体化反应。"}
      ]
    },
    {
      title: "数据与隐私",
      items: [
        { q: "我的数据存在哪里？", a: "主要保存在你的本地设备（local-first）。"},
        { q: "清理浏览器缓存会怎样？", a: "可能会删除本地历史，建议定期导出备份。"}
      ]
    }
  ],
  ja: [
    {
      title: "基本理解",
      items: [
        { q: "Luna Balanceとは？", a: "Luna Balanceは、生理的リズムを可視化し、エネルギーや気分の変化を理解するためのシステムです。" },
        { q: "誰に向いていますか？", a: "自分の体の傾向をより深く理解したい女性に向いています。" },
        { q: "一般的な周期アプリとの違いは？", a: "日付予測だけでなく、ストレス・代謝・体感のつながりまで見ます。" },
        { q: "医療知識は必要ですか？", a: "不要です。わかりやすい表現と表示設計で使えるようになっています。" }
      ]
    },
    {
      title: "医療と安全性",
      items: [
        { q: "医療製品ですか？", a: "いいえ。Lunaは自己観察のためのデジタルツールです。" },
        { q: "医師の代わりになりますか？", a: "なりません。受診前に情報を整理する補助として使います。" },
        { q: "診断や治療提案はしますか？", a: "しません。診断・処方は医療専門家と行ってください。" }
      ]
    },
    {
      title: "ホルモンと日常",
      items: [
        { q: "なぜホルモンが気分やエネルギーに影響するの？", a: "ホルモンは神経系や代謝の土台に関わるため、日々の体感を左右します。" },
        { q: "なぜストレスの影響が大きいの？", a: "高ストレス時は生存優先モードになり、他のホルモン軸が乱れやすくなります。" },
        { q: "緊張状態はどんな感覚？", a: "過負荷、刺激への敏感さ、回復の遅さとして現れることがあります。" }
      ]
    },
    {
      title: "周期とフェーズ",
      items: [
        { q: "なぜ周期で体調が変わるの？", a: "フェーズごとにホルモンバランスが変わり、集中力や社交エネルギーに影響します。" },
        { q: "周期が不規則な場合は？", a: "実際の体のサインに合わせて柔軟に調整できます。" },
        { q: "ホルモン避妊中でも使えますか？", a: "はい。波は安定しやすくても個別反応の観察に有効です。" }
      ]
    },
    {
      title: "データとプライバシー",
      items: [
        { q: "データはどこに保存されますか？", a: "基本的に端末ローカル（local-first）に保存されます。" },
        { q: "ブラウザキャッシュを消すと？", a: "ローカル履歴が失われる可能性があります。定期的なエクスポートを推奨します。" }
      ]
    }
  ],
  pt: [
    {
      title: "Compreensão geral",
      items: [
        { q: "O que é Luna Balance?", a: "Luna Balance é um sistema visual para mapear ritmos fisiológicos e entender mudanças de energia e humor." },
        { q: "Para quem é este sistema?", a: "Para mulheres que desejam compreender melhor o próprio corpo e seus padrões." },
        { q: "Qual a diferença para apps tradicionais de ciclo?", a: "Não foca só em datas; também observa estresse, metabolismo e estado geral." },
        { q: "Preciso de conhecimento médico?", a: "Não. A linguagem e os indicadores foram feitos para uso simples no dia a dia." }
      ]
    },
    {
      title: "Medicina e segurança",
      items: [
        { q: "É um produto médico?", a: "Não. É uma ferramenta digital educacional e de auto-observação." },
        { q: "Substitui um médico?", a: "Não. Ajuda você a chegar mais preparada à consulta." },
        { q: "A plataforma dá diagnóstico?", a: "Não. Luna não diagnostica nem prescreve tratamento." }
      ]
    },
    {
      title: "Hormônios e vida diária",
      items: [
        { q: "Por que hormônios afetam energia e humor?", a: "Porque influenciam sistema nervoso, metabolismo e regulação do estresse." },
        { q: "Por que o estresse impacta tanto?", a: "Com estresse alto, o corpo prioriza sobrevivência e isso altera outros sinais hormonais." },
        { q: "Como é um estado de tensão na prática?", a: "Pode aparecer como irritabilidade, sobrecarga e menor tolerância." }
      ]
    },
    {
      title: "Ciclo e fases",
      items: [
        { q: "Por que o ciclo muda como eu me sinto?", a: "Porque os hormônios variam por fase e isso afeta foco, disposição e sensibilidade." },
        { q: "E se meu ciclo for irregular?", a: "A ferramenta é flexível e pode ser ajustada aos sinais reais do seu corpo." },
        { q: "Funciona com anticoncepcional hormonal?", a: "Sim. Mesmo com curva mais estável, ainda há padrões pessoais úteis para observar." }
      ]
    },
    {
      title: "Dados e privacidade",
      items: [
        { q: "Onde meus dados ficam?", a: "No seu próprio dispositivo, com abordagem local-first." },
        { q: "O que acontece se eu limpar o cache?", a: "Você pode perder o histórico local. Faça exportações periódicas de backup." }
      ]
    }
  ]
};

const CORE_FAQ_BY_LANG: Record<Language, FAQItem[]> = {
  en: [
    { q: 'Is Luna medical?', a: 'No. Luna is not a medical service, medical device, diagnostic tool, or treatment provider.' },
    { q: 'Is Luna therapy?', a: 'No. Luna is not therapy and does not replace mental health professionals.' },
    { q: 'What data does Luna use?', a: 'Luna uses your in-app inputs: check-ins, reflections, optional profile context, and usage events required for functionality.' },
    { q: 'Can Luna replace a doctor?', a: 'No. Luna helps you organize observations before consultation. Medical decisions must be made with licensed clinicians.' },
    { q: 'How private is Luna?', a: 'Luna is local-first in development mode. Your data stays on device unless you export/share it.' },
    { q: 'Can I upload scans and lab PDFs to reports?', a: 'Yes. My Health Reports accepts text, images, and PDF files for extraction and structured review in one report flow.' },
    { q: 'Can report language match my selected app language?', a: 'Yes. Reports and key explanations can be generated in your active interface language.' },
    { q: 'Where can partners learn how to support without pressure?', a: 'Open PARTNER FAQ and The Bridge sections. They provide calm wording, context, and communication guidance.' },
  ],
  ru: [
    { q: 'Luna является медицинским сервисом?', a: 'Нет. Luna не является медицинской услугой, устройством, диагностикой или лечением.' },
    { q: 'Luna это терапия?', a: 'Нет. Luna не является психотерапией и не заменяет специалистов по психическому здоровью.' },
    { q: 'Какие данные использует Luna?', a: 'Luna использует ваши данные внутри приложения: check-in, рефлексии, контекст профиля и сервисные события для работы функций.' },
    { q: 'Может ли Luna заменить врача?', a: 'Нет. Luna помогает структурировать наблюдения перед консультацией. Медицинские решения принимаются только с лицензированным врачом.' },
    { q: 'Насколько приватна Luna?', a: 'В режиме разработки Luna local-first: данные остаются на устройстве, пока вы сами их не экспортируете/поделитесь.' },
    { q: 'Можно загружать сканы и PDF анализов в отчеты?', a: 'Да. My Health Reports принимает текст, изображения и PDF-файлы для распознавания и структурированного разбора в одном потоке.' },
    { q: 'Можно ли делать отчеты на выбранном языке?', a: 'Да. Отчеты и ключевые пояснения могут генерироваться на активном языке интерфейса.' },
    { q: 'Где партнеру понять, как поддерживать без давления?', a: 'Откройте разделы PARTNER FAQ и The Bridge. Там есть спокойные формулировки, контекст и правила коммуникации.' },
  ],
  uk: [
    { q: 'Luna є медичним сервісом?', a: 'Ні. Luna не є медичною послугою, пристроєм, діагностикою або лікуванням.' },
    { q: 'Luna це терапія?', a: 'Ні. Luna не є психотерапією і не замінює фахівців із ментального здоровʼя.' },
    { q: 'Які дані використовує Luna?', a: 'Luna використовує ваші дані в застосунку: check-in, рефлексії, контекст профілю та технічні події для роботи функцій.' },
    { q: 'Чи може Luna замінити лікаря?', a: 'Ні. Luna допомагає структурувати спостереження перед консультацією. Медичні рішення ухвалюються лише з ліцензованим лікарем.' },
    { q: 'Наскільки приватна Luna?', a: 'У dev-режимі Luna local-first: дані залишаються на вашому пристрої, поки ви самі не експортуєте або не поділитеся ними.' },
    { q: 'Чи можна завантажувати скани та PDF аналізів у звіти?', a: 'Так. My Health Reports приймає текст, зображення і PDF для розпізнавання та структурованого розбору.' },
    { q: 'Чи можна формувати звіти мовою інтерфейсу?', a: 'Так. Звіти та ключові пояснення можуть генеруватись активною мовою застосунку.' },
    { q: 'Де партнеру зрозуміти, як підтримувати без тиску?', a: 'Відкрийте PARTNER FAQ та The Bridge — там є спокійні формулювання і правила комунікації.' },
  ],
  es: [
    { q: '¿Luna es médica?', a: 'No. Luna no es un servicio médico, dispositivo médico, herramienta diagnóstica ni proveedor de tratamiento.' },
    { q: '¿Luna es terapia?', a: 'No. Luna no es terapia y no reemplaza a profesionales de salud mental.' },
    { q: '¿Qué datos usa Luna?', a: 'Luna usa tus entradas en la app: check-ins, reflexiones, contexto opcional del perfil y eventos técnicos necesarios para el funcionamiento.' },
    { q: '¿Puede Luna reemplazar a un médico?', a: 'No. Luna ayuda a organizar observaciones antes de una consulta. Las decisiones médicas deben tomarse con profesionales licenciados.' },
    { q: '¿Qué tan privada es Luna?', a: 'En modo desarrollo, Luna es local-first. Tus datos permanecen en el dispositivo salvo que los exportes o compartas.' },
    { q: '¿Puedo subir escaneos y PDFs de laboratorio a los reportes?', a: 'Sí. My Health Reports acepta texto, imágenes y PDF para extracción y revisión estructurada.' },
    { q: '¿El reporte puede generarse en el idioma seleccionado?', a: 'Sí. El reporte y sus explicaciones clave se pueden generar en el idioma activo de la interfaz.' },
    { q: '¿Dónde aprende la pareja a apoyar sin presión?', a: 'En PARTNER FAQ y The Bridge. Ahí hay contexto y frases claras para comunicar sin conflicto.' },
  ],
  fr: [
    { q: 'Luna est-elle médicale ?', a: 'Non. Luna n est ni un service médical, ni un dispositif médical, ni un outil de diagnostic ou de traitement.' },
    { q: 'Luna est-elle une thérapie ?', a: 'Non. Luna n est pas une thérapie et ne remplace pas les professionnels de santé mentale.' },
    { q: 'Quelles données Luna utilise-t-elle ?', a: 'Luna utilise vos entrées dans l application : check-ins, réflexions, contexte de profil optionnel et événements techniques nécessaires.' },
    { q: 'Luna peut-elle remplacer un médecin ?', a: 'Non. Luna aide à structurer les observations avant consultation. Les décisions médicales doivent être prises avec des professionnels agréés.' },
    { q: 'Quel est le niveau de confidentialité ?', a: 'En mode développement, Luna est local-first. Les données restent sur l appareil sauf export ou partage volontaire.' },
    { q: 'Puis-je importer des scans et PDF de laboratoire dans les rapports ?', a: 'Oui. My Health Reports accepte texte, images et PDF pour extraction et synthèse structurée.' },
    { q: 'Le rapport peut-il être généré dans la langue choisie ?', a: 'Oui. Le rapport et ses explications principales suivent la langue active de l interface.' },
    { q: 'Où le partenaire apprend-il à soutenir sans pression ?', a: 'Dans PARTNER FAQ et The Bridge. Vous y trouverez contexte et formulations calmes.' },
  ],
  de: [
    { q: 'Ist Luna medizinisch?', a: 'Nein. Luna ist kein medizinischer Dienst, kein Medizinprodukt, kein Diagnosetool und kein Behandlungsanbieter.' },
    { q: 'Ist Luna Therapie?', a: 'Nein. Luna ist keine Therapie und ersetzt keine Fachkräfte für psychische Gesundheit.' },
    { q: 'Welche Daten nutzt Luna?', a: 'Luna nutzt deine In-App-Eingaben: Check-ins, Reflexionen, optionalen Profilkontext und technische Ereignisse für die Funktion.' },
    { q: 'Kann Luna einen Arzt ersetzen?', a: 'Nein. Luna hilft, Beobachtungen vor einem Termin zu strukturieren. Medizinische Entscheidungen gehören zu lizenzierten Fachkräften.' },
    { q: 'Wie privat ist Luna?', a: 'Im Entwicklungsmodus arbeitet Luna local-first. Daten bleiben auf dem Gerät, außer bei aktivem Export/Teilen.' },
    { q: 'Kann ich Scans und Labor-PDFs in Berichte hochladen?', a: 'Ja. My Health Reports akzeptiert Text, Bilder und PDF-Dateien für Extraktion und strukturierte Auswertung.' },
    { q: 'Kann der Bericht in der gewählten Sprache erstellt werden?', a: 'Ja. Bericht und Kern-Erklärungen folgen der aktiven App-Sprache.' },
    { q: 'Wo lernt ein Partner Unterstützung ohne Druck?', a: 'In PARTNER FAQ und The Bridge. Dort gibt es ruhige Formulierungen und klare Kommunikationshilfe.' },
  ],
  zh: [
    { q: 'Luna 是医疗服务吗？', a: '不是。Luna 不是医疗服务、医疗设备、诊断工具或治疗提供方。' },
    { q: 'Luna 是治疗吗？', a: '不是。Luna 不是心理治疗，不能替代心理健康专业人员。' },
    { q: 'Luna 使用哪些数据？', a: 'Luna 使用你在应用内输入的数据：check-in、反思、可选资料上下文，以及功能运行所需的技术事件。' },
    { q: 'Luna 能替代医生吗？', a: '不能。Luna 用于在就诊前整理观察信息。医疗决策必须由持证专业人士做出。' },
    { q: 'Luna 的隐私如何？', a: '在开发模式下，Luna 采用 local-first。除非你主动导出或分享，数据都保留在本地设备。' },
    { q: '可以上传化验单扫描件和 PDF 吗？', a: '可以。My Health Reports 支持文本、图片和 PDF 的提取与结构化整理。' },
    { q: '报告能按当前语言生成吗？', a: '可以。报告及关键解释可按当前界面语言生成。' },
    { q: '伴侣如何学习“无压力支持”？', a: '请查看 PARTNER FAQ 与 The Bridge，提供清晰、平和的沟通方式。' },
  ],
  ja: [
    { q: 'Luna は医療サービスですか？', a: 'いいえ。Luna は医療サービス、医療機器、診断ツール、治療提供者ではありません。' },
    { q: 'Luna はセラピーですか？', a: 'いいえ。Luna はセラピーではなく、メンタルヘルス専門家の代替にはなりません。' },
    { q: 'Luna はどのデータを使いますか？', a: 'Luna はアプリ内入力（check-in、リフレクション、任意のプロフィール文脈、機能に必要な技術イベント）を使います。' },
    { q: 'Luna は医師の代わりになりますか？', a: 'いいえ。Luna は受診前の観察整理に使います。医療判断は有資格の専門家と行ってください。' },
    { q: 'Luna のプライバシーは？', a: '開発モードでは local-first で動作します。エクスポート/共有しない限り、データは端末内に保持されます。' },
    { q: '検査スキャンやPDFをレポートにアップロードできますか？', a: 'はい。My Health Reports はテキスト・画像・PDF の抽出と整理に対応しています。' },
    { q: 'レポートは選択言語で生成できますか？', a: 'はい。レポートと主要説明は現在の表示言語で生成できます。' },
    { q: 'パートナーが無理なく支える方法はどこで学べますか？', a: 'PARTNER FAQ と The Bridge を確認してください。落ち着いた伝え方を案内します。' },
  ],
  pt: [
    { q: 'Luna é médica?', a: 'Não. Luna não é serviço médico, dispositivo médico, ferramenta diagnóstica nem provedora de tratamento.' },
    { q: 'Luna é terapia?', a: 'Não. Luna não é terapia e não substitui profissionais de saúde mental.' },
    { q: 'Quais dados a Luna usa?', a: 'A Luna usa suas entradas no app: check-ins, reflexões, contexto opcional de perfil e eventos técnicos necessários ao funcionamento.' },
    { q: 'A Luna pode substituir um médico?', a: 'Não. Luna ajuda a organizar observações antes da consulta. Decisões médicas devem ser tomadas com profissionais licenciados.' },
    { q: 'Quão privada é a Luna?', a: 'No modo de desenvolvimento, Luna é local-first. Os dados ficam no dispositivo, salvo quando você exporta ou compartilha.' },
    { q: 'Posso enviar scans e PDFs de exames para os relatórios?', a: 'Sim. My Health Reports aceita texto, imagem e PDF para extração e organização estruturada.' },
    { q: 'O relatório pode ser gerado no idioma escolhido?', a: 'Sim. O relatório e as explicações principais seguem o idioma ativo da interface.' },
    { q: 'Onde o parceiro aprende a apoiar sem pressão?', a: 'Veja PARTNER FAQ e The Bridge, com contexto e linguagem clara para conversa respeitosa.' },
  ],
};

const CORE_TITLE_BY_LANG: Record<Language, string> = {
  en: 'Core FAQ',
  ru: 'Ключевые Вопросы',
  uk: 'Ключові Питання',
  es: 'FAQ Principal',
  fr: 'FAQ Principal',
  de: 'Kern-FAQ',
  zh: '核心 FAQ',
  ja: 'コアFAQ',
  pt: 'FAQ Principal',
};

const REPORT_FAQ_BY_LANG: Record<Language, FAQCategory> = {
  en: {
    title: 'Health Reports & Women Clinical Insights',
    items: [
      { q: 'What makes My Health Reports useful for women?', a: 'The report interprets female-specific hormone patterns (cycle, thyroid, metabolic, androgen, libido-related) and explains how they may connect with symptoms, not just raw numbers.' },
      { q: 'Does it analyze combinations, risks, and side effects?', a: 'Yes. The report highlights hormone combinations, potential effects on mood/sleep/libido/energy, potential risks, and practical next-step recommendations for discussion with your clinician.' },
      { q: 'Can I use the report in a doctor appointment?', a: 'Yes. The layout is doctor-ready: clear sections, marker table, status indicators, trend logic, and questions to discuss. It is designed to save consultation time.' },
      { q: 'Is this a diagnosis?', a: 'No. Luna provides educational pattern interpretation and preparation support. Diagnosis and treatment decisions must be made by licensed medical professionals.' },
    ],
  },
  ru: {
    title: 'Health Reports И Клинические Инсайты Для Женщин',
    items: [
      { q: 'Что делает My Health Reports полезным для женщин?', a: 'Отчет интерпретирует женские гормональные паттерны (цикл, щитовидка, метаболизм, андрогены, либидо) и связывает их с симптомами, а не просто показывает цифры.' },
      { q: 'Анализируются ли сочетания, риски и побочные эффекты?', a: 'Да. Отчет выделяет сочетания гормонов, возможные эффекты на настроение/сон/либидо/энергию, потенциальные риски и практические шаги для обсуждения с врачом.' },
      { q: 'Можно ли использовать отчет на приеме у врача?', a: 'Да. Формат подготовлен для консультации: понятные разделы, таблица маркеров, статусы, логика тенденций и вопросы к врачу.' },
      { q: 'Это диагноз?', a: 'Нет. Luna дает образовательную интерпретацию паттернов и поддержку подготовки. Диагноз и лечение определяет лицензированный врач.' },
    ],
  },
  uk: {
    title: 'Health Reports І Клінічні Інсайти Для Жінок',
    items: [
      { q: 'Що робить My Health Reports корисним для жінок?', a: 'Звіт інтерпретує жіночі гормональні патерни (цикл, щитоподібна, метаболізм, андрогени, лібідо) і пов’язує їх із симптомами, а не лише з числами.' },
      { q: 'Чи аналізуються поєднання, ризики та побічні ефекти?', a: 'Так. Звіт показує гормональні поєднання, можливі ефекти на настрій/сон/лібідо/енергію, потенційні ризики та практичні кроки для лікаря.' },
      { q: 'Чи можна використовувати звіт на прийомі?', a: 'Так. Формат підготовлено для консультації: чіткі розділи, таблиця маркерів, статуси, логіка тренду і питання до лікаря.' },
      { q: 'Це діагноз?', a: 'Ні. Luna дає освітню інтерпретацію патернів і підтримку підготовки. Діагноз і лікування визначає ліцензований лікар.' },
    ],
  },
  es: {
    title: 'Health Reports E Insights Clínicos Femeninos',
    items: [
      { q: '¿Qué hace útil My Health Reports para mujeres?', a: 'Interpreta patrones hormonales femeninos y los relaciona con síntomas (energía, ánimo, sueño, libido), no solo con valores sueltos.' },
      { q: '¿Analiza combinaciones, riesgos y efectos?', a: 'Sí. Destaca combinaciones hormonales, posibles efectos, riesgos potenciales y recomendaciones prácticas para comentar con tu médica/o.' },
      { q: '¿Puedo usar el reporte en consulta?', a: 'Sí. El formato está listo para consulta médica: secciones claras, tabla de marcadores, estados y preguntas clínicas.' },
      { q: '¿Es un diagnóstico?', a: 'No. Luna ofrece interpretación educativa y apoyo de preparación. El diagnóstico y tratamiento los define un profesional de salud.' },
    ],
  },
  fr: {
    title: 'Health Reports Et Insights Cliniques Féminins',
    items: [
      { q: 'Pourquoi My Health Reports est utile pour les femmes ?', a: 'Le rapport interprète les profils hormonaux féminins et les relie aux symptômes, au-delà des valeurs isolées.' },
      { q: 'Analyse-t-il combinaisons, risques et effets ?', a: 'Oui. Il met en évidence les combinaisons hormonales, effets possibles, risques potentiels et recommandations à discuter en consultation.' },
      { q: 'Puis-je utiliser ce rapport avec mon médecin ?', a: 'Oui. Le format est prêt pour la consultation: sections claires, tableau des marqueurs, statuts et questions cliniques.' },
      { q: 'Est-ce un diagnostic ?', a: 'Non. Luna fournit une interprétation éducative et un support de préparation. Le diagnostic et le traitement relèvent d’un professionnel de santé.' },
    ],
  },
  de: {
    title: 'Health Reports Und Klinische Frauen-Insights',
    items: [
      { q: 'Was macht My Health Reports für Frauen nützlich?', a: 'Der Bericht interpretiert frauenspezifische Hormonmuster und verknüpft sie mit Symptomen statt nur Einzelwerten.' },
      { q: 'Werden Kombinationen, Risiken und Effekte analysiert?', a: 'Ja. Der Bericht zeigt Hormon-Kombinationen, potenzielle Effekte, Risiken und praktische Empfehlungen für das Arztgespräch.' },
      { q: 'Kann ich den Bericht im Arzttermin nutzen?', a: 'Ja. Das Format ist arztfertig: klare Abschnitte, Markertabelle, Statusindikatoren und Gesprächsfragen.' },
      { q: 'Ist das eine Diagnose?', a: 'Nein. Luna bietet edukative Musterinterpretation und Vorbereitung. Diagnose und Therapie erfolgen durch medizinisches Fachpersonal.' },
    ],
  },
  zh: {
    title: 'Health Reports 与女性临床洞察',
    items: [
      { q: '为什么 My Health Reports 对女性有价值？', a: '报告会解读女性激素模式（周期、甲状腺、代谢、雄激素、性健康）并关联症状，而不是只给数值。' },
      { q: '会分析组合、风险和潜在影响吗？', a: '会。报告会标出激素组合、潜在影响、潜在风险，并给出可与医生讨论的下一步建议。' },
      { q: '报告可以直接用于就诊吗？', a: '可以。结构是就诊友好的：分区清晰、指标表、状态标签、趋势逻辑和医生沟通问题。' },
      { q: '这算医疗诊断吗？', a: '不算。Luna 提供教育性解读与就诊准备支持，诊断和治疗必须由持证医生决定。' },
    ],
  },
  ja: {
    title: 'Health Reports と女性向け臨床インサイト',
    items: [
      { q: 'My Health Reports が女性に有用な理由は？', a: '女性特有のホルモンパターンを症状と関連づけて解釈し、単なる数値表示で終わらせません。' },
      { q: '組み合わせ・リスク・影響も分析しますか？', a: 'はい。ホルモンの組み合わせ、想定影響、潜在リスク、医師相談用の実行提案を示します。' },
      { q: '診察で使えますか？', a: 'はい。医師向けに使える形式です。セクション整理、マーカー表、ステータス、確認質問を含みます。' },
      { q: '診断になりますか？', a: 'いいえ。Luna は教育的解釈と準備支援です。診断・治療は医療資格者が行います。' },
    ],
  },
  pt: {
    title: 'Health Reports E Insights Clínicos Femininos',
    items: [
      { q: 'O que torna My Health Reports útil para mulheres?', a: 'O relatório interpreta padrões hormonais femininos e conecta os achados aos sintomas, não apenas a números isolados.' },
      { q: 'Ele analisa combinações, riscos e efeitos?', a: 'Sim. Mostra combinações hormonais, efeitos potenciais, riscos e recomendações práticas para discutir com a médica/o.' },
      { q: 'Posso usar o relatório na consulta?', a: 'Sim. O formato é clínico: seções claras, tabela de marcadores, status e perguntas para consulta.' },
      { q: 'Isso é diagnóstico?', a: 'Não. Luna oferece interpretação educativa e apoio de preparo. Diagnóstico e tratamento são definidos por profissional de saúde.' },
    ],
  },
};

  const copyByLang: Record<Language, { back: string; titleA: string; titleB: string; subtitle: string; promiseTitle: string; promiseQuote: string; commentsTitle: string; comments: Array<{ quote: string; author: string }> }> = {
    en: {
      back: 'Back',
      titleA: 'Common',
      titleB: 'Questions.',
      subtitle: 'Answers to help you navigate your journey with Luna. Every insight is a step towards understanding yourself better.',
      promiseTitle: 'Our Promise',
      promiseQuote: '"Luna is designed to be a private space. We put your privacy first, always."',
      commentsTitle: 'Community Comments',
      comments: [
        { quote: 'FAQ gave me language to explain my state to my partner.', author: 'Nora • 30' },
        { quote: 'I stopped blaming myself once I saw clear cycle logic.', author: 'Lea • 27' },
        { quote: 'The privacy model is exactly what I was looking for.', author: 'Iris • 36' },
      ],
    },
    ru: {
      back: 'Назад',
      titleA: 'Частые',
      titleB: 'Вопросы.',
      subtitle: 'Ответы, которые помогут вам ориентироваться в вашем путешествии с Luna. Каждое понимание - это шаг к лучшему знанию себя.',
      promiseTitle: 'Наше обещание',
      promiseQuote: '«Luna создана как ваше личное пространство. Мы ставим вашу конфиденциальность превыше всего, всегда».',
      commentsTitle: 'Комментарии Сообщества',
      comments: [
        { quote: 'FAQ дал мне спокойный язык, чтобы говорить о своем состоянии.', author: 'Нора • 30' },
        { quote: 'Я перестала винить себя, когда увидела логику фаз и ритма.', author: 'Лея • 27' },
        { quote: 'Подход к приватности здесь именно такой, как мне нужен.', author: 'Ирис • 36' },
      ],
    },
    uk: {
      back: 'Назад',
      titleA: 'Часті',
      titleB: 'Питання.',
      subtitle: 'Відповіді, які допоможуть вам орієнтуватися у подорожі з Luna. Кожне розуміння - крок до кращого знання себе.',
      promiseTitle: 'Наша обіцянка',
      promiseQuote: '«Luna створена як ваш особистий простір. Ми завжди ставимо вашу приватність на перше місце».',
      commentsTitle: 'Коментарі Спільноти',
      comments: [
        { quote: 'FAQ допоміг мені спокійно пояснювати свій стан партнеру.', author: 'Nora • 30' },
        { quote: 'Я перестала звинувачувати себе, коли побачила логіку ритмів.', author: 'Lea • 27' },
        { quote: 'Підхід до приватності тут саме такий, як я шукала.', author: 'Iris • 36' },
      ],
    },
    es: {
      back: 'Atrás',
      titleA: 'Preguntas',
      titleB: 'Comunes.',
      subtitle: 'Respuestas para ayudarte a navegar tu camino con Luna. Cada insight es un paso para comprenderte mejor.',
      promiseTitle: 'Nuestra promesa',
      promiseQuote: '"Luna está diseñada como un espacio privado. Tu privacidad es siempre lo primero."',
      commentsTitle: 'Comentarios De La Comunidad',
      comments: [
        { quote: 'El FAQ me dio palabras claras para hablar con mi pareja.', author: 'Nora • 30' },
        { quote: 'Dejé de culparme cuando vi la lógica del ciclo.', author: 'Lea • 27' },
        { quote: 'El enfoque de privacidad es exactamente lo que buscaba.', author: 'Iris • 36' },
      ],
    },
    fr: {
      back: 'Retour',
      titleA: 'Questions',
      titleB: 'Fréquentes.',
      subtitle: 'Des réponses pour vous aider dans votre parcours avec Luna. Chaque compréhension est un pas vers une meilleure connaissance de soi.',
      promiseTitle: 'Notre promesse',
      promiseQuote: '"Luna est conçue comme un espace privé. Votre confidentialité passe toujours en premier."',
      commentsTitle: 'Commentaires De La Communaute',
      comments: [
        { quote: 'La FAQ m a donné les mots justes pour parler de mon état.', author: 'Nora • 30' },
        { quote: 'J ai arrêté de me blâmer en voyant la logique des phases.', author: 'Lea • 27' },
        { quote: 'Le modèle de confidentialité correspond exactement à mes attentes.', author: 'Iris • 36' },
      ],
    },
    de: {
      back: 'Zurück',
      titleA: 'Häufige',
      titleB: 'Fragen.',
      subtitle: 'Antworten, die dir helfen, deinen Weg mit Luna zu verstehen. Jede Erkenntnis ist ein Schritt zu mehr Selbstverständnis.',
      promiseTitle: 'Unser Versprechen',
      promiseQuote: '"Luna ist als privater Raum konzipiert. Deine Privatsphäre steht immer an erster Stelle."',
      commentsTitle: 'Community Kommentare',
      comments: [
        { quote: 'Die FAQ hat mir klare Worte für mein Befinden gegeben.', author: 'Nora • 30' },
        { quote: 'Ich habe aufgehört, mich selbst zu beschuldigen, als ich die Muster sah.', author: 'Lea • 27' },
        { quote: 'Das Datenschutzmodell ist genau das, was ich gesucht habe.', author: 'Iris • 36' },
      ],
    },
    zh: {
      back: '返回',
      titleA: '常见',
      titleB: '问题。',
      subtitle: '这些回答将帮助你更好地进行 Luna 旅程。每一次理解，都是更了解自己的一步。',
      promiseTitle: '我们的承诺',
      promiseQuote: '“Luna 被设计为你的私密空间。我们始终将你的隐私放在首位。”',
      commentsTitle: '用户评论',
      comments: [
        { quote: 'FAQ 让我更容易向伴侣解释自己的状态。', author: 'Nora • 30' },
        { quote: '看清节律后，我不再责怪自己。', author: 'Lea • 27' },
        { quote: '这里的隐私方式正是我想要的。', author: 'Iris • 36' },
      ],
    },
    ja: {
      back: '戻る',
      titleA: 'よくある',
      titleB: '質問。',
      subtitle: 'Lunaでの旅を進めるための回答です。理解の一つひとつが、自己理解への一歩です。',
      promiseTitle: '私たちの約束',
      promiseQuote: '「Lunaはあなたのためのプライベート空間です。私たちは常にプライバシーを最優先にします。」',
      commentsTitle: 'ユーザーコメント',
      comments: [
        { quote: 'FAQで自分の状態を言葉にしやすくなりました。', author: 'Nora • 30' },
        { quote: '周期のロジックが見えて、自分を責めなくなりました。', author: 'Lea • 27' },
        { quote: 'このプライバシー設計は理想的です。', author: 'Iris • 36' },
      ],
    },
    pt: {
      back: 'Voltar',
      titleA: 'Perguntas',
      titleB: 'Frequentes.',
      subtitle: 'Respostas para ajudar você a navegar sua jornada com a Luna. Cada insight é um passo para se conhecer melhor.',
      promiseTitle: 'Nossa promessa',
      promiseQuote: '"A Luna foi criada como um espaço privado. Sua privacidade vem sempre em primeiro lugar."',
      commentsTitle: 'Comentarios Da Comunidade',
      comments: [
        { quote: 'O FAQ me deu linguagem clara para falar com meu parceiro.', author: 'Nora • 30' },
        { quote: 'Parei de me culpar quando vi a lógica dos ciclos.', author: 'Lea • 27' },
        { quote: 'O modelo de privacidade é exatamente o que eu buscava.', author: 'Iris • 36' },
      ],
    }
  };

export interface FAQViewContent {
  data: FAQCategory[];
  copy: FAQViewCopy;
}

export function getFAQViewContent(lang: Language): FAQViewContent {
  const base = FAQ_DATA[lang] || FAQ_DATA.en;
  const core = CORE_FAQ_BY_LANG[lang] || CORE_FAQ_BY_LANG.en;
  const reportFaq = REPORT_FAQ_BY_LANG[lang] || REPORT_FAQ_BY_LANG.en;
  const existing = new Set(
    base.flatMap((cat) => cat.items.map((item) => item.q.trim().toLowerCase()))
  );
  const missingCore = core.filter((item) => !existing.has(item.q.trim().toLowerCase()));
  const data = missingCore.length
    ? [{ title: CORE_TITLE_BY_LANG[lang] || CORE_TITLE_BY_LANG.en, items: missingCore }, ...base]
    : [...base];
  const reportCategoryExists = data.some((cat) => cat.title.trim().toLowerCase() === reportFaq.title.trim().toLowerCase());
  if (!reportCategoryExists) data.push(reportFaq);
  return {
    data,
    copy: copyByLang[lang] || copyByLang.en,
  };
}
