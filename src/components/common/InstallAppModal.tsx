import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share,
  PlusSquare,
  Monitor,
  Smartphone,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ZeldaHeart } from './ZeldaHeart';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'mac' | 'windows' | 'android' | 'other'>('mac');
  const [browser, setBrowser] = useState<'safari' | 'chrome' | 'edge' | 'firefox' | 'other'>('other');
  const [isInstalling, setIsInstalling] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const plat = navigator.platform.toLowerCase();

    // Detectar plataforma
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else if (plat.includes('mac') || ua.includes('macintosh')) {
      setPlatform('mac');
    } else if (plat.includes('win') || ua.includes('windows')) {
      setPlatform('windows');
    } else {
      setPlatform('other');
    }

    // Detectar navegador
    if (/edg/.test(ua)) {
      setBrowser('edge');
    } else if (/chrome|crios/.test(ua) && !/edg/.test(ua)) {
      setBrowser('chrome');
    } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
      setBrowser('safari');
    } else if (/firefox|fxios/.test(ua)) {
      setBrowser('firefox');
    } else {
      setBrowser('other');
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true);
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          localStorage.setItem('maruca_pwa_installed_v1', 'true');
          onClose();
        }
      } catch (err) {
        console.error('Error al solicitar instalación PWA:', err);
        setShowManualGuide(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Mostrar instrucciones paso a paso para el navegador/sistema actual
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('maruca_pwa_prompt_v1', 'dismissed');
    onClose();
  };

  const isDesktop = platform === 'mac' || platform === 'windows' || platform === 'other';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Botón Cerrar */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition active:scale-90"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Encabezado con Icono estilo App iOS/macOS */}
              <div className="text-center space-y-3">
                <div className="inline-flex relative">
                  <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#1d1d1f] via-black to-[#2c2c2e] p-1.5 shadow-xl border border-white/10 flex items-center justify-center mx-auto transform hover:scale-105 transition-transform">
                    <ZeldaHeart size={42} glow={true} />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-[#30d158] text-black font-extrabold text-[9px] tracking-wider uppercase shadow-md flex items-center gap-0.5">
                    <Zap size={10} className="fill-black" />
                    WebApp
                  </span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-[#1d1d1f] dark:text-white tracking-tight">
                    {isDesktop ? 'Instalar en tu Escritorio' : 'Añadir a tu Pantalla de Inicio'}
                  </h3>
                  <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 max-w-xs mx-auto">
                    Disfruta de <span className="text-[#30d158] font-semibold">Maruca Salud</span> como una aplicación nativa, rápida y sin barras de navegador.
                  </p>
                </div>
              </div>

              {/* Ventajas destacadas */}
              {!showManualGuide ? (
                <div className="bg-[#f2f2f7] dark:bg-black/40 rounded-2xl p-3.5 space-y-2.5 border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#30d158]/15 text-[#30d158] flex items-center justify-center shrink-0">
                      {isDesktop ? <Monitor size={17} /> : <Smartphone size={17} />}
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-[#1d1d1f] dark:text-white">
                        {isDesktop ? 'Acceso directo en 1 clic' : 'Icono en pantalla de inicio'}
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        Ábrela directamente desde el escritorio o el dock sin buscar la web.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 text-[#0071e3] flex items-center justify-center shrink-0">
                      <Layers size={17} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-[#1d1d1f] dark:text-white">
                        Experiencia a Pantalla Completa
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        Ventana limpia e independiente, sin pestañas ni barras de navegación.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ff9f0a]/15 text-[#ff9f0a] flex items-center justify-center shrink-0">
                      <Sparkles size={17} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-[#1d1d1f] dark:text-white">
                        Escáner Instantáneo & Alérgenos
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        Cámara acelerada por hardware y alertas en tiempo real en tu dispositivo.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Instrucciones Paso a Paso Adaptadas al Dispositivo */
                <div className="bg-[#f2f2f7] dark:bg-black/50 rounded-2xl p-4 space-y-3.5 border border-black/[0.06] dark:border-white/[0.08] text-left">
                  <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#30d158]" />
                    <span>Cómo crear el acceso en {platform === 'mac' ? 'Mac' : platform === 'windows' ? 'Windows' : platform === 'ios' ? 'iPhone' : 'tu dispositivo'}</span>
                  </div>

                  {platform === 'mac' && browser === 'safari' && (
                    <div className="space-y-2 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>En el menú superior de tu Mac, pulsa en <strong>Archivo</strong> (o pulsa el botón <strong>Compartir <Share size={12} className="inline" /></strong>).</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Haz clic en <strong>«Añadir al Dock...»</strong>. ¡Maruca aparecerá en tu escritorio y dock como una app nativa!</span>
                      </div>
                    </div>
                  )}

                  {isDesktop && (browser === 'chrome' || browser === 'edge') && (
                    <div className="space-y-2 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>En la <strong>barra de direcciones (URL)</strong> arriba a la derecha, verás un icono de <strong>Instalar (🖥️ o ⊕)</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Pulsa <strong>«Instalar»</strong>. Se creará automáticamente un acceso directo en tu Escritorio y menú.</span>
                      </div>
                    </div>
                  )}

                  {platform === 'ios' && (
                    <div className="space-y-2 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>Toca el botón <strong>Compartir <Share size={12} className="inline text-[#0071e3]" /></strong> en la barra inferior de Safari.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Desliza hacia abajo y pulsa en <strong>«Añadir a la pantalla de inicio <PlusSquare size={12} className="inline" />»</strong>.</span>
                      </div>
                    </div>
                  )}

                  {platform === 'android' && (
                    <div className="space-y-2 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>Toca el menú de tres puntos (<strong>⋮</strong>) en la esquina superior derecha de Chrome.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Pulsa <strong>«Instalar aplicación»</strong> o <strong>«Añadir a pantalla principal»</strong>.</span>
                      </div>
                    </div>
                  )}

                  {platform !== 'ios' && platform !== 'android' && browser !== 'safari' && browser !== 'chrome' && browser !== 'edge' && (
                    <div className="space-y-2 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        <span>Ve al menú de opciones de tu navegador web.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#30d158] text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        <span>Selecciona la opción <strong>«Instalar sitio como aplicación»</strong> o <strong>«Crear acceso directo»</strong>.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-2.5 pt-1">
                {deferredPrompt && !showManualGuide ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-black font-extrabold text-[15px] transition flex items-center justify-center gap-2 shadow-lg shadow-[#30d158]/20 active:scale-98"
                  >
                    <Download size={18} />
                    <span>{isInstalling ? 'Instalando...' : 'Crear Acceso Directo Ahora'}</span>
                  </button>
                ) : !showManualGuide ? (
                  <button
                    type="button"
                    onClick={() => setShowManualGuide(true)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-black font-extrabold text-[15px] transition flex items-center justify-center gap-2 shadow-lg shadow-[#30d158]/20 active:scale-98"
                  >
                    <Download size={18} />
                    <span>Ver cómo añadir al Escritorio</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-black font-extrabold text-[15px] transition flex items-center justify-center gap-2 shadow-lg shadow-[#30d158]/20 active:scale-98"
                  >
                    <CheckCircle2 size={18} />
                    <span>¡Entendido! Lo crearé ahora</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full py-2.5 text-center text-[13px] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white font-medium transition"
                >
                  Quizás más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
