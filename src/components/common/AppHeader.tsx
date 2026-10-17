import React from 'react';
import { UserProfile } from '../../types';
import { Sparkles, Crown, Sun, Moon, User as UserIcon } from 'lucide-react';
import { ZeldaHeart } from './ZeldaHeart';
import { ThemeMode } from '../../hooks/useTheme';

interface AppHeaderProps {
  userProfile: UserProfile;
  onOpenPaywall: () => void;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userProfile,
  onOpenPaywall,
  onOpenAuth,
  onOpenAdmin,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full apple-header-blur">
      <div className="max-w-md mx-auto px-4 h-13 flex items-center justify-between">
        {/* Brand with Zelda Super Famicom Pixel Heart */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center shadow-sm">
            <ZeldaHeart size={20} glow={theme === 'dark'} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              Maruca
            </span>
            <span className="text-[10px] font-medium text-[#86868b] tracking-normal">
              Salud & Alérgenos
            </span>
          </div>
        </div>

        {/* Action Controls: User Account, Theme Switcher & Pro Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Account Pill */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/10 transition active:scale-95"
              title={userProfile.userAccount ? `Conectado como @${userProfile.userAccount.username}` : 'Iniciar sesión'}
            >
              {userProfile.userAccount ? (
                <>
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: userProfile.userAccount.avatarColor || '#30d158' }}
                  />
                  <span className="truncate max-w-[65px]">@{userProfile.userAccount.username}</span>
                </>
              ) : (
                <>
                  <UserIcon size={12} className="text-[#86868b]" />
                  <span className="font-normal text-[#86868b] dark:text-[#a1a1a6]">Entrar</span>
                </>
              )}
            </button>
          )}

          {/* Admin Dashboard Pill */}
          {(userProfile.userAccount?.isAdmin || userProfile.userAccount?.username?.toLowerCase() === 'dawsson') && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#bf5af2]/15 text-[#bf5af2] hover:bg-[#bf5af2]/25 border border-[#bf5af2]/30 text-[11px] font-bold tracking-tight transition active:scale-95 shadow-xs"
              title="Abrir Panel de Control & Analítica"
            >
              <Crown size={12} className="text-[#bf5af2]" />
              <span>Admin</span>
            </button>
          )}

          {/* Sun / Moon Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center transition active:scale-95"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-[#ff9f0a]" />
            ) : (
              <Moon size={15} className="text-[#0071e3]" />
            )}
          </button>

          {/* Capsule Status Pill */}
          <button
            type="button"
            onClick={onOpenPaywall}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition active:scale-95 ${
              userProfile.isPro
                ? 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 shadow-sm'
                : 'bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/10'
            }`}
          >
            {userProfile.isPro ? (
              <>
                <Crown size={12} className="text-[#30d158]" />
                <span className="font-semibold">Pro</span>
              </>
            ) : (
              <>
                <Sparkles size={11} className="text-[#86868b]" />
                <span className="font-normal text-[#86868b] dark:text-[#a1a1a6]">
                  {userProfile.freeScansRemaining} gratis
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
