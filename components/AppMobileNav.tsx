import React from 'react';
import { TabType } from '../utils/navigation';

type BottomItem = {
  id: TabType;
  label: string;
  icon: string;
};

interface AppMobileNavProps {
  activeTab: TabType;
  bottomNavItems: BottomItem[];
  navigateTo: (tab: TabType) => void;
  setShowSidebar: (next: boolean) => void;
}

export const AppMobileNav: React.FC<AppMobileNavProps> = ({
  activeTab,
  bottomNavItems,
  navigateTo,
  setShowSidebar,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 md:py-3 flex justify-between items-center md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {bottomNavItems.map((item) => (
        <button
          key={item.id}
          data-testid={`mobile-nav-${item.id}`}
          onClick={() => navigateTo(item.id)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-luna-purple scale-110' : 'text-slate-400'}`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
      <button
        data-testid="mobile-nav-menu"
        onClick={() => setShowSidebar(true)}
        className="flex flex-col items-center gap-1 text-slate-400"
      >
        <span className="text-xl">☰</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
      </button>
    </nav>
  );
};
