import React from 'react';
import { Logo } from './Logo';
import { Language, TRANSLATIONS } from '../constants';

export const PrivacyPolicyView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const shared = TRANSLATIONS[lang]?.shared || TRANSLATIONS.en.shared;
  const effectiveDate = 'March 4, 2026';
  const lastUpdated = 'March 4, 2026';
  const copyByLang: Record<Language, { back: string; manifest: string; title: string; subtitle: string; compliance: string; quote: string }> = {
    en: { back: 'Back', manifest: 'Security Manifest', title: 'Privacy Architecture', subtitle: 'A system built on the premise that your biology belongs only to you.', compliance: 'Compliance Level: High-Trust', quote: 'Luna is designed to be a digital vault. We prioritize the preservation of your physiological autonomy over data convenience.' },
    ru: { back: 'Назад', manifest: 'Манифест безопасности', title: 'Архитектура приватности', subtitle: 'Система, основанная на принципе: ваша биология принадлежит только вам.', compliance: 'Уровень соответствия: высокий', quote: 'Luna спроектирована как цифровой сейф. Мы ставим сохранение вашей физиологической автономии выше удобства данных.' },
    uk: { back: 'Назад', manifest: 'Маніфест безпеки', title: 'Архітектура приватності', subtitle: 'Система, що базується на принципі: ваша біологія належить лише вам.', compliance: 'Рівень відповідності: високий', quote: 'Luna спроєктована як цифровий сейф. Ми ставимо збереження вашої фізіологічної автономії вище за зручність даних.' },
    es: { back: 'Atrás', manifest: 'Manifiesto de seguridad', title: 'Arquitectura de privacidad', subtitle: 'Un sistema construido sobre la idea de que tu biología te pertenece solo a ti.', compliance: 'Nivel de cumplimiento: alto', quote: 'Luna está diseñada como una bóveda digital. Priorizamos tu autonomía fisiológica por encima de la conveniencia de datos.' },
    fr: { back: 'Retour', manifest: 'Manifeste de sécurité', title: 'Architecture de confidentialité', subtitle: 'Un système fondé sur le principe que votre biologie vous appartient uniquement.', compliance: 'Niveau de conformité: élevé', quote: 'Luna est conçue comme un coffre-fort numérique. Nous privilégions votre autonomie physiologique.' },
    de: { back: 'Zurück', manifest: 'Sicherheitsmanifest', title: 'Datenschutzarchitektur', subtitle: 'Ein System mit dem Grundsatz: Deine Biologie gehört nur dir.', compliance: 'Compliance-Stufe: Hoch', quote: 'Luna ist als digitaler Tresor konzipiert. Deine physiologische Autonomie hat Vorrang.' },
    zh: { back: '返回', manifest: '安全声明', title: '隐私架构', subtitle: '系统建立在一个前提上：你的生理数据只属于你。', compliance: '合规等级：高信任', quote: 'Luna 被设计为数字保险库。我们优先保护你的生理自主性。' },
    ja: { back: '戻る', manifest: 'セキュリティ宣言', title: 'プライバシー設計', subtitle: 'あなたの生体情報はあなた自身のもの、という前提で設計されています。', compliance: 'コンプライアンス: 高信頼', quote: 'Lunaはデジタル保管庫として設計されています。生理的な自律性の保護を優先します。' },
    pt: { back: 'Voltar', manifest: 'Manifesto de segurança', title: 'Arquitetura de privacidade', subtitle: 'Um sistema construído na premissa de que sua biologia pertence somente a você.', compliance: 'Nível de conformidade: alto', quote: 'A Luna foi projetada como um cofre digital. Priorizamos sua autonomia fisiológica.' },
  };
  const copy = copyByLang[lang];
  const sectionsByLang: Record<Language, Array<{ title: string; text: string }>> = {
    en: [
      { title: 'Your Private Data', text: "Luna Balance follows our 'Privacy Promise'. Your health data—logs, lab markers, and check-ins—is stored exclusively on your device. We do not maintain any cloud databases for your personal records." },
      { title: 'Encryption & Exports', text: 'When you export your data, it is generated locally. We recommend keeping these files in a secure, encrypted location. Luna does not have a back-door to recover lost local data.' },
      { title: 'Third-Party Foundations', text: 'We only use external calls to the Google Gemini API for high-level synthesis and image generation. These calls are alignment-stripped to maintain the highest possible level of anonymity.' },
      { title: 'No Selling of Identity', text: 'Our business model is subscription-based. We do not, and will never, sell your behavioral or physiological patterns to advertisers or pharmaceutical entities.' }
    ],
    ru: [
      { title: 'Ваши личные данные', text: 'Luna Balance следует «Обещанию приватности». Ваши данные здоровья — отметки, маркеры и чек-ины — хранятся только на вашем устройстве.' },
      { title: 'Шифрование и экспорт', text: 'При экспорте данные формируются локально. Рекомендуем хранить файлы в защищенном и зашифрованном месте.' },
      { title: 'Сторонние сервисы', text: 'Внешние вызовы используются только для высокоуровневого синтеза через Google Gemini API, с минимизацией идентифицирующих данных.' },
      { title: 'Данные не продаются', text: 'Наша модель подписочная. Мы не продаем и не будем продавать ваши поведенческие или физиологические паттерны.' }
    ],
    uk: [
      { title: 'Ваші приватні дані', text: 'Luna Balance дотримується «Обіцянки приватності». Ваші дані здоров’я зберігаються лише на вашому пристрої.' },
      { title: 'Шифрування та експорт', text: 'Експорт формується локально. Рекомендуємо зберігати файли у захищеному та зашифрованому місці.' },
      { title: 'Сторонні сервіси', text: 'Зовнішні виклики використовуються лише для високорівневого синтезу через Google Gemini API з мінімізацією ідентифікаторів.' },
      { title: 'Без продажу даних', text: 'Модель сервісу — підписка. Ми не продаємо і не продаватимемо ваші поведінкові чи фізіологічні патерни.' }
    ],
    es: [
      { title: 'Tus datos privados', text: 'Luna Balance sigue una promesa de privacidad. Tus datos de salud se guardan únicamente en tu dispositivo.' },
      { title: 'Cifrado y exportación', text: 'La exportación se genera localmente. Recomendamos guardar estos archivos en una ubicación segura y cifrada.' },
      { title: 'Servicios de terceros', text: 'Solo usamos llamadas externas a Google Gemini API para síntesis de alto nivel, minimizando datos identificables.' },
      { title: 'No vendemos identidad', text: 'Nuestro modelo es por suscripción. No vendemos ni venderemos tus patrones conductuales o fisiológicos.' }
    ],
    fr: [
      { title: 'Vos données privées', text: 'Luna Balance respecte sa promesse de confidentialité. Vos données de santé restent sur votre appareil.' },
      { title: 'Chiffrement et export', text: 'Les exports sont générés localement. Conservez-les dans un emplacement sécurisé et chiffré.' },
      { title: 'Services tiers', text: 'Nous utilisons uniquement Google Gemini API pour la synthèse de haut niveau, avec minimisation des données identifiantes.' },
      { title: "Aucune vente d'identité", text: 'Notre modèle est basé sur abonnement. Nous ne vendons pas vos schémas comportementaux ou physiologiques.' }
    ],
    de: [
      { title: 'Deine privaten Daten', text: 'Luna Balance folgt einem Privacy-Versprechen. Gesundheitsdaten bleiben ausschließlich auf deinem Gerät.' },
      { title: 'Verschlüsselung und Export', text: 'Exporte werden lokal erstellt. Bewahre sie sicher und verschlüsselt auf.' },
      { title: 'Drittanbieter-Grundlagen', text: 'Externe Aufrufe an Google Gemini API werden nur für High-Level-Synthese genutzt, mit Datenminimierung.' },
      { title: 'Kein Verkauf von Identität', text: 'Unser Modell ist abonnementbasiert. Wir verkaufen keine Verhaltens- oder Physiologiemuster.' }
    ],
    zh: [
      { title: '你的私密数据', text: 'Luna Balance 遵循隐私承诺。你的健康数据仅保存在本地设备。' },
      { title: '加密与导出', text: '导出文件在本地生成。建议将其保存在安全且加密的位置。' },
      { title: '第三方基础服务', text: '我们仅在高层摘要场景调用 Google Gemini API，并尽可能去标识化。' },
      { title: '不出售身份数据', text: '我们的模式是订阅制。我们不会出售你的行为或生理模式数据。' }
    ],
    ja: [
      { title: 'あなたのプライベートデータ', text: 'Luna Balanceはプライバシーの約束を守ります。健康データは端末内にのみ保存されます。' },
      { title: '暗号化とエクスポート', text: 'エクスポートはローカルで生成されます。安全で暗号化された場所に保管してください。' },
      { title: '外部サービス', text: '外部呼び出しはGoogle Gemini APIによる高レベル統合に限定し、識別子を最小化します。' },
      { title: 'データ販売の禁止', text: '当サービスはサブスクリプション型であり、行動・生理パターンを販売しません。' }
    ],
    pt: [
      { title: 'Seus dados privados', text: 'Luna Balance segue a promessa de privacidade. Seus dados de saúde ficam apenas no seu dispositivo.' },
      { title: 'Criptografia e exportação', text: 'A exportação é gerada localmente. Recomendamos armazenar os arquivos em local seguro e criptografado.' },
      { title: 'Serviços de terceiros', text: 'Usamos chamadas externas ao Google Gemini API apenas para síntese de alto nível, com minimização de identificadores.' },
      { title: 'Sem venda de identidade', text: 'Nosso modelo é por assinatura. Não vendemos padrões comportamentais ou fisiológicos.' }
    ],
  };
  const sections = sectionsByLang[lang];

  return (
    <article className="max-w-5xl mx-auto luna-page-shell luna-page-questions space-y-12 animate-in fade-in duration-1000 pb-24 p-8 md:p-10">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← {copy.back}</button>
      
      <header className="rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-surface p-6 md:p-7 space-y-5">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.manifest}</span>
        </div>
        <h2 className="text-5xl font-black tracking-tight uppercase">{copy.title}</h2>
        <p className="text-xl text-slate-500 italic font-bold">{copy.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Effective Date</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{effectiveDate}</p>
          </div>
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Last Updated</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{lastUpdated}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {sections.map((s, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-luna border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-luna-purple">{s.title}</h3>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{s.text}"</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Disclaimer</p>
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{shared.disclaimer}</p>
      </div>

      <footer className="p-12 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-[4rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-luna-purple/5 animate-pulse"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 relative z-10">{copy.compliance}</p>
        <p className="text-xl font-bold italic leading-tight max-w-2xl mx-auto relative z-10 uppercase tracking-tighter">
          "{copy.quote}"
        </p>
      </footer>
    </article>
  );
};
