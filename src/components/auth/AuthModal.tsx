import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthUser } from '../../types';
import { loginUser, registerUser } from '../../services/authService';
import { ZeldaHeart } from '../common/ZeldaHeart';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { playScanFeedback } from '../../utils/audioFeedback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const result = loginUser(username, password);
      if (result.success && result.user) {
        handleAuthSuccess(result.user);
      } else {
        setError(result.error || 'Error al iniciar sesión.');
      }
    } else {
      const result = registerUser(username, password, email);
      if (result.success && result.user) {
        handleAuthSuccess(result.user);
      } else {
        setError(result.error || 'Error al crear la cuenta.');
      }
    }
  };

  const handleAuthSuccess = (user: AuthUser) => {
    playScanFeedback();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess(user);
      onClose();
    }, 900);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.12] rounded-[32px] p-6 shadow-2xl space-y-4 relative overflow-hidden"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
        >
          <X size={15} />
        </button>

        {/* Header con Zelda Heart */}
        <div className="text-center pt-2 space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center mx-auto mb-2 shadow-xs">
            <ZeldaHeart size={26} glow />
          </div>
          <h3 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
            {mode === 'login' ? 'Iniciar Sesión en Maruca' : 'Crear Cuenta en Maruca'}
          </h3>
          <p className="text-[12px] text-[#86868b] max-w-[260px] mx-auto leading-relaxed">
            Accede para disfrutar de tus <span className="font-semibold text-[#30d158]">20 escaneos gratuitos</span> y guardar tu historial.
          </p>
        </div>

        {/* Apple Segmented Bar (Iniciar Sesión / Crear Cuenta) */}
        <div className="flex p-1 rounded-full bg-black/[0.05] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] text-[12px] font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full transition ${
              mode === 'login'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white font-normal'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full transition ${
              mode === 'register'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white font-normal'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#ff453a]/12 border border-[#ff453a]/25 flex items-center gap-2 text-[12px] text-[#ff453a] dark:text-white">
            <AlertCircle size={15} className="text-[#ff453a] shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Usuario */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-1">
              Usuario
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full py-2.5 pl-10 pr-3 rounded-xl bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[13px] text-[#1d1d1f] dark:text-white outline-none transition"
              />
            </div>
          </div>

          {/* Email (Solo registro) */}
          {mode === 'register' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-1">
                Correo Electrónico (Opcional)
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full py-2.5 pl-10 pr-3 rounded-xl bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[13px] text-[#1d1d1f] dark:text-white outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[13px] text-[#1d1d1f] dark:text-white outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={isSuccess}
            className={`w-full mt-2 py-3 rounded-full font-bold text-[14px] transition active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 ${
              isSuccess
                ? 'bg-[#30d158] text-black'
                : 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black hover:opacity-90'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle size={16} />
                <span>¡Sesión Iniciada!</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar a Maruca' : 'Crear Mi Cuenta'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>



        {/* Continuar como invitado */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
          >
            Continuar como invitado
          </button>
        </div>
      </motion.div>
    </div>
  );
};
