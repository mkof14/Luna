import { Language, TranslationSchema } from '../constants';

export type TabType =
  | 'dashboard'
  | 'about'
  | 'cycle'
  | 'labs'
  | 'history'
  | 'creative'
  | 'profile'
  | 'privacy'
  | 'bridge'
  | 'family'
  | 'reflections'
  | 'voice_files'
  | 'library'
  | 'faq'
  | 'contact'
  | 'meds'
  | 'crisis'
  | 'partner_faq'
  | 'relationships'
  | 'admin'
  | 'how_it_works'
  | 'terms'
  | 'medical'
  | 'cookies'
  | 'data_rights';

type NavItem = {
  id: TabType;
  label: string;
  icon: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavigationLabels = Partial<TranslationSchema['navigation']> & {
  home: string;
  cycle: string;
  reflections: string;
  voiceFiles?: string;
  labs: string;
  meds: string;
  bridge: string;
  library: string;
  history: string;
  creative: string;
  family: string;
  profile: string;
  faq: string;
  contact: string;
  crisis: string;
  admin?: string;
  partner?: string;
  partner_faq?: string;
  healthHub?: string;
};

type NavigationUi = {
  navigation: NavigationLabels;
};

export const buildSidebarGroups = (ui: NavigationUi, includeAdmin = false): NavGroup[] => {
  const groups: NavGroup[] = [
    {
      title: ui.navigation.healthHub || 'Health Hub',
      items: [
        { id: 'dashboard', label: ui.navigation.home, icon: '🏠' },
        { id: 'cycle', label: ui.navigation.cycle, icon: '🌊' },
        { id: 'reflections', label: ui.navigation.reflections, icon: '🎙️' },
        { id: 'voice_files', label: ui.navigation.voiceFiles || 'My Voice Files', icon: '🗂️' },
        { id: 'labs', label: ui.navigation.labs, icon: '🔬' },
        { id: 'meds', label: ui.navigation.meds, icon: '💊' },
      ],
    },
    {
      title: 'Insights & Connection',
      items: [
        { id: 'bridge', label: ui.navigation.bridge || 'The Bridge', icon: '🌉' },
        { id: 'relationships', label: 'Relationships', icon: '💬' },
        { id: 'library', label: ui.navigation.library, icon: '🏛️' },
        { id: 'history', label: ui.navigation.history, icon: '📜' },
        { id: 'creative', label: ui.navigation.creative, icon: '🎨' },
        { id: 'family', label: ui.navigation.family, icon: '🏡' },
      ],
    },
    {
      title: 'Support & System',
      items: [
        { id: 'profile', label: ui.navigation.profile, icon: '👤' },
        { id: 'faq', label: ui.navigation.faq, icon: '❓' },
        { id: 'contact', label: ui.navigation.contact, icon: '✉️' },
        { id: 'crisis', label: ui.navigation.crisis, icon: '🆘' },
        { id: 'partner_faq', label: ui.navigation.partner || ui.navigation.partner_faq || 'Partner Support', icon: '🤝' },
      ],
    },
  ];

  if (includeAdmin) {
    groups.push({
      title: 'Administration',
      items: [{ id: 'admin', label: ui.navigation.admin || 'Admin Console', icon: '🛠️' }],
    });
  }

  return groups;
};

export const buildBottomNavItems = (ui: NavigationUi): NavItem[] => [
  { id: 'dashboard', label: ui.navigation.home, icon: '🏠' },
  { id: 'cycle', label: ui.navigation.cycle, icon: '🌊' },
  { id: 'reflections', label: ui.navigation.reflections, icon: '🎙️' },
  { id: 'bridge', label: ui.navigation.bridge || 'Bridge', icon: '🌉' },
];

export const getCheckinCta = (lang: Language) => (lang === 'ru' ? 'Отметиться' : 'Check-in');
