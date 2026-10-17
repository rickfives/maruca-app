import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X } from 'lucide-react';
import { ZeldaHeart } from './ZeldaHeart';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivatePro: () => void;
  freeScansRemaining?: number;
  onContinueFree?: () => void;
}

export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVqfZh6gxcYE2uG0oxgQE00';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onActivatePro,
  freeScansRemaining = 0,
  onContinueFree,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleProClick = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#e71d36', '#30d158', '#0071e3', '#ffffff', '#ff9f0a'],
      });
    } catch (e) {}

    // Redirigir directamente a la pasarela segura de Stripe
    setTimeout(() => {
      window.location.href = STRIPE_PAYMENT_LINK;
    }, 450);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xl">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] border-t sm:border border-black/[0.08] dark:border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 shadow-2xl overflow-hidden text-[#1d1d1f] dark:text-white"
        >
          {/* Grab Handle */}
          <div className="w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-4" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
          >
            <X size={16} />
          </button>

          {/* Header with Zelda Heart */}
          <div className="text-center mt-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ZeldaHeart size={34} glow />
            </div>

            <h3 className="text-[22px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              Maruca Pro
            </h3>
            <p className="text-[13px] text-[#86868b] mt-1 max-w-xs mx-auto">
              Contenedores de salud al máximo: alérgenos en tiempo real, auditoría de cesta y escáner sin límites.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 mb-6 bg-[#f2f2f7] dark:bg-black/40 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
            {[
              'Escaneos ilimitados por cámara y fotos de ingredientes.',
              'Radar biológico de alérgenos y lista negra personal.',
              'Auditoría de Cesta y detección del #1 peor alimento.',
              'Alternativas más saludables con cálculo de azúcar ahorrado.',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                <div className="w-4 h-4 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Plan Selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3.5 rounded-2xl text-left transition relative border ${
                selectedPlan === 'monthly'
                  ? 'border-[#0071e3] bg-[#0071e3]/10 ring-1 ring-[#0071e3]'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-[10px] font-semibold text-[#0071e3] uppercase tracking-wider">
                Prueba 7 días gratis
              </div>
              <div className="text-[18px] font-bold text-[#1d1d1f] dark:text-white mt-1">4,99 €</div>
              <div className="text-[11px] text-[#86868b]">al mes • Sin permanencia</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('yearly')}
              className={`p-3.5 rounded-2xl text-left transition relative border ${
                selectedPlan === 'yearly'
                  ? 'border-[#0071e3] bg-[#0071e3]/10 ring-1 ring-[#0071e3]'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-[10px] font-semibold text-[#30d158] uppercase tracking-wider">
                Ahorra 40%
              </div>
              <div className="text-[18px] font-bold text-[#1d1d1f] dark:text-white mt-1">34,99 €</div>
              <div className="text-[11px] text-[#86868b]">al año (2,91 € / mes)</div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleProClick}
              className="w-full py-3.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[15px] tracking-tight transition active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>{selectedPlan === 'monthly' ? 'Empezar con 4,99 €/mes' : 'Continuar con Plan Anual (34,99 €)'}</span>
            </button>

            {onContinueFree && freeScansRemaining > 0 && (
              <button
                onClick={() => {
                  onContinueFree();
                  onClose();
                }}
                className="w-full py-2 text-[12px] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white font-medium transition"
              >
                Continuar con {freeScansRemaining} escaneos de prueba
              </button>
            )}
          </div>

          <div className="text-center text-[11px] text-[#86868b] mt-4 leading-normal space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[#30d158] font-medium text-[11px]">
              <span>🔒 Pago Seguro procesado por Stripe</span>
            </div>
            <div>Apple Pay, Google Pay y Tarjeta Bancaria • Sin permanencia</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
