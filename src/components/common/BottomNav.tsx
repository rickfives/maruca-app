import React from 'react';
import { ScanLine, ShoppingBag, Activity, User } from 'lucide-react';

export type NavTab = 'scan' | 'cart' | 'stats' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount,
}) => {
  const tabs = [
    { id: 'scan' as NavTab, label: 'Escanear', icon: ScanLine },
    { id: 'cart' as NavTab, label: 'Cesta', icon: ShoppingBag, badge: cartCount },
    { id: 'stats' as NavTab, label: 'Salud', icon: Activity },
    { id: 'profile' as NavTab, label: 'Cuenta', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 apple-tabbar-blur pb-safe">
      <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-transform active:scale-95"
            >
              <div className="relative">
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.3 : 1.7}
                  className={`transition-colors duration-150 ${
                    isActive ? 'text-[#30d158]' : 'text-[#86868b]'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 min-w-[16px] h-4 bg-[#ff453a] text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors duration-150 ${
                  isActive ? 'text-[#30d158] font-semibold' : 'text-[#86868b] font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
