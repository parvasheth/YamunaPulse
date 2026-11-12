import React from 'react';
import { Map, Activity, Grid, Calendar, Sparkles } from 'lucide-react';

export type MobileTabType = 'map' | 'profile' | 'patterns' | 'seasonal' | 'anomalies';

interface MobileBottomNavProps {
  activeTab: MobileTabType;
  onTabChange: (tab: MobileTabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: MobileTabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'map', label: 'Map', icon: Map },
    { key: 'profile', label: 'Profile', icon: Activity },
    { key: 'patterns', label: 'Patterns', icon: Grid },
    { key: 'seasonal', label: 'Seasonal', icon: Calendar },
    { key: 'anomalies', label: 'Anomalies', icon: Sparkles },
  ];

  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.key;
        return (
          <button
            key={t.key}
            data-testid={`mobile-tab-${t.key}`}
            onClick={() => onTabChange(t.key)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-90 ${
              isActive
                ? t.key === 'anomalies'
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-cyan-400 font-bold bg-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {isActive && (
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                  t.key === 'anomalies' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
