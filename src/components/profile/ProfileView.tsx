import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  Crown,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle,
  ChevronRight,
  Sun,
  Moon,
  User,
  Download,
} from 'lucide-react';
import { ZeldaHeart } from '../common/ZeldaHeart';
import { ThemeMode } from '../../hooks/useTheme';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenPaywall: () => void;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  onOpenInstallModal?: () => void;
  onLogout?: () => void;
  onResetOnboarding: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

const ALLERGEN_TRANSLATIONS: Record<string, string> = {
  gluten: 'Gluten',
  lactose: 'Lactosa',
  nuts: 'Frutos de cáscara',
  peanuts: 'Cacahuetes',
  soy: 'Soja',
  egg: 'Huevo',
  seafood: 'Pescado y marisco',
  vegan: 'Vegano',
  vegetarian: 'Vegetariano',
};

const BLACKLIST_TRANSLATIONS: Record<string, string> = {
  palm_oil: 'Aceite de palma',
  artificial_sweeteners: 'Edulcorantes artificiales',
  added_sugars: 'Azúcares añadidos',
  msg_nitrites: 'Glutamato y Nitritos',
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenPaywall,
  onOpenAuth,
  onOpenAdmin,
  onOpenInstallModal,
  onLogout,
  onResetOnboarding,
  theme = 'dark',
  onToggleTheme,
}) => {
  const togglePro = () => {
    onUpdateProfile({
      ...profile,
      isPro: !profile.isPro,
      freeScansRemaining: !profile.isPro ? 9999 : 20,
    });
  };

  const isAdmin = profile.userAccount?.isAdmin || profile.userAccount?.username?.toLowerCase() === 'dawsson';

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-12">
      {/* Tarjeta de Acceso Administrador (Exclusiva para dawsson) */}
      {isAdmin && onOpenAdmin && (
        <div className="bg-gradient-to-r from-[#bf5af2]/18 via-[#0071e3]/10 to-transparent p-4.5 rounded-[28px] border border-[#bf5af2]/35 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#bf5af2]/20 text-[#bf5af2] flex items-center justify-center shrink-0 shadow-xs">
              <Crown size={22} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                <span>Panel de Control (Admin)</span>
                <span className="text-[9px] bg-[#bf5af2]/25 text-[#bf5af2] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Dawsson
                </span>
              </div>
              <div className="text-[11px] text-[#86868b] leading-tight mt-0.5">
                Personas activas, qué suelen escanear y mejoras
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="py-2 px-3.5 rounded-full bg-[#bf5af2] hover:bg-[#af4ee0] text-white font-bold text-[12px] shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1"
          >
            <span>Analítica</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* 0. Tarjeta de Usuario / Inicio de Sesión */}
      {profile.userAccount ? (
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-[15px] shadow-xs shrink-0"
              style={{ backgroundColor: profile.userAccount.avatarColor || '#30d158' }}
            >
              {profile.userAccount.name?.charAt(0) || profile.userAccount.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-[#1d1d1f] dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>{profile.userAccount.name || profile.userAccount.username}</span>
                {isAdmin && (
                  <span className="text-[10px] bg-[#bf5af2]/20 text-[#bf5af2] font-bold px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <span className="text-[11px] font-normal text-[#86868b]">(@{profile.userAccount.username})</span>
              </div>
              <div className="text-[11px] text-[#86868b] truncate">{profile.userAccount.email}</div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="py-1.5 px-3 rounded-full bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[11px] font-semibold text-[#ff453a] transition active:scale-95 shrink-0"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      ) : onOpenAuth ? (
        <div className="bg-gradient-to-r from-[#0071e3]/12 via-[#30d158]/8 to-transparent p-4 rounded-[28px] border border-[#0071e3]/20 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/15 text-[#0071e3] flex items-center justify-center shrink-0">
              <User size={19} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1d1d1f] dark:text-white">
                Cuenta de Usuario
              </div>
              <div className="text-[11px] text-[#86868b]">
                Inicia sesión con usuario y contraseña
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="py-2 px-4 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold text-[12px] shadow-sm hover:opacity-90 transition active:scale-95 shrink-0"
          >
            Iniciar sesión
          </button>
        </div>
      ) : null}
      {/* 1. Profile Header with Zelda Pixel Heart */}
      <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center shadow-sm">
            <ZeldaHeart size={26} glow={theme === 'dark'} />
          </div>
          <div>
            <div className="text-[17px] font-bold text-[#1d1d1f] dark:text-white tracking-tight">Mi Perfil Nutricional</div>
            <div className="text-[12px] text-[#86868b]">
              {profile.isPro ? 'Suscripción Maruca Pro Activa' : `${profile.freeScansRemaining} escaneos disponibles`}
            </div>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full ${
            profile.isPro
              ? 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30'
              : 'bg-black/[0.05] dark:bg-white/10 text-[#86868b]'
          }`}
        >
          {profile.isPro ? 'PRO' : 'GRATUITO'}
        </span>
      </div>

      {/* 2. Aspecto Visual (Modo Claro / Modo Oscuro) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-2">
          Apariencia Visual
        </span>
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Modo {theme === 'dark' ? 'Oscuro' : 'Claro'}</div>
              <div className="text-[12px] text-[#86868b]">
                {theme === 'dark' ? 'Estilo OLED negro y contraste Apple' : 'Estilo Apple iOS limpio y minimalista'}
              </div>
            </div>
          </div>

          <div className="flex p-1 rounded-full bg-black/[0.06] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] text-[12px] font-semibold">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light' && onToggleTheme) onToggleTheme();
              }}
              className={`py-1 px-3 rounded-full transition flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-white text-[#1d1d1f] shadow-sm font-bold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <Sun size={13} className={theme === 'light' ? 'text-[#ff9f0a]' : ''} />
              <span>Claro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark' && onToggleTheme) onToggleTheme();
              }}
              className={`py-1 px-3 rounded-full transition flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-[#2c2c2e] text-white shadow-sm font-bold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <Moon size={13} className={theme === 'dark' ? 'text-[#0071e3]' : ''} />
              <span>Oscuro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Settings: Suscripción */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-2">
          Plan y Acceso
        </span>
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06] shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ff9f0a]/15 text-[#ff9f0a] flex items-center justify-center">
                <Crown size={16} />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Simulador de Estado</div>
                <div className="text-[12px] text-[#86868b]">Alternar entre cuenta Pro y Gratuita</div>
              </div>
            </div>

            <button
              type="button"
              onClick={togglePro}
              className={`py-1.5 px-3 rounded-full text-[12px] font-semibold transition ${
                profile.isPro
                  ? 'bg-black/[0.05] dark:bg-white/10 text-[#1d1d1f] dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/15'
                  : 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black hover:opacity-90'
              }`}
            >
              {profile.isPro ? 'Cambiar a Gratis' : 'Activar Pro'}
            </button>
          </div>

          {!profile.isPro && (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 text-[#0071e3] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Ver Opciones de Suscripción</span>
              </div>
              <ChevronRight size={16} className="text-[#86868b]" />
            </button>
          )}
        </div>
      </div>

      {/* Dispositivo & Escritorio (WebApp PWA) */}
      {onOpenInstallModal && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-2">
            Dispositivo & Acceso Rápido
          </span>
          <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-left transition active:bg-black/[0.04] dark:active:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#30d158]/15 text-[#30d158] flex items-center justify-center">
                  <Download size={16} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                    Instalar en Escritorio / Pantalla de Inicio
                  </div>
                  <div className="text-[12px] text-[#86868b]">
                    Crear acceso directo para usar Maruca como WebApp nativa
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#86868b]" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Settings: Preferencias Biológicas */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-2">
          Configuración Biológica
        </span>
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#30d158]" />
              <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">Radar Personal</span>
            </div>
            <button
              type="button"
              onClick={onResetOnboarding}
              className="text-[12px] text-[#0071e3] hover:underline font-semibold"
            >
              Recalibrar
            </button>
          </div>

          <div className="space-y-2 text-[12px]">
            <div>
              <div className="text-[11px] text-[#86868b]">Objetivos activos:</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.goals.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] font-medium"
                  >
                    {g === 'clean_eating'
                      ? 'Comer limpio NOVA 1'
                      : g === 'fat_loss'
                      ? 'Control de grasa/azúcar'
                      : g === 'muscle_gain'
                      ? 'Masa muscular'
                      : 'Salud digestiva'}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#86868b] mt-2">
                Alérgenos filtrados ({profile.allergens.length}):
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.allergens.length === 0 ? (
                  <span className="text-[#86868b]">Sin restricciones seleccionadas</span>
                ) : (
                  profile.allergens.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-0.5 rounded-full bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/20 font-semibold text-[11px]"
                    >
                      {ALLERGEN_TRANSLATIONS[a] || a}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#86868b] mt-2">
                Lista negra ({profile.blacklistedIngredients.length}):
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.blacklistedIngredients.map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/20 font-medium text-[11px]"
                  >
                    {BLACKLIST_TRANSLATIONS[b] || b.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Disclaimers */}
      <div className="pt-2 text-center space-y-2">
        <button
          type="button"
          onClick={onResetOnboarding}
          className="text-[12px] text-[#ff453a] hover:underline flex items-center justify-center gap-1.5 mx-auto font-medium"
        >
          <RotateCcw size={13} />
          <span>Restablecer perfil y reiniciar asistente</span>
        </button>
        <div className="text-[11px] text-[#86868b]">
          Maruca • Salud con estética minimalista y corazón retro 16-bit • Datos 100% locales
        </div>
      </div>
    </div>
  );
};
