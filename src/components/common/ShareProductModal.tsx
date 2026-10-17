import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScannedProduct, ScoreBreakdown } from '../../types';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { ZeldaHeart } from './ZeldaHeart';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ScannedProduct;
  score: ScoreBreakdown;
  sugarCubes: number;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  isOpen,
  onClose,
  product,
  score,
  sugarCubes,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🥑 ¡Mira lo que estoy comiendo! Lo he analizado en Maruca:
📦 ${product.name} (${product.brands})
📊 Puntuación de Salud: ${score.total}/100 (${score.tierLabel})
🥗 Nivel de Procesamiento: NOVA ${product.novaGroup || '—'}
🧊 Azúcares: ${product.nutriments.sugars ?? 0}g (~${sugarCubes} terrones)

Recomendado para una alimentación limpia y consciente con Maruca.`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://maruca.app';

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Recomendación: ${product.name}`,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        // Usuario canceló compartir o no soportado
      }
    } else {
      handleCopyClipboard();
    }
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('No se pudo copiar al portapapeles', e);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleShareTelegram = () => {
    const encoded = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${encoded}`, '_blank');
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
          {/* Tirador iOS */}
          <div className="w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-4" />

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
          >
            <X size={16} />
          </button>

          {/* Cabecera */}
          <div className="text-center mt-1 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center mx-auto mb-2.5 shadow-sm">
              <ZeldaHeart size={26} glow />
            </div>
            <h3 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              Recomienda lo que comes
            </h3>
            <p className="text-[12px] text-[#86868b] mt-1 max-w-xs mx-auto">
              Comparte con tus amigos o familia la calidad nutricional y los ingredientes de este alimento.
            </p>
          </div>

          {/* Tarjeta Visual de Previsualización */}
          <div className="bg-[#f2f2f7] dark:bg-black/50 p-4 rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] mb-5 space-y-2">
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-[#1c1c1e] p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-[#86868b] shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                  <Sparkles size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                  {product.name}
                </div>
                <div className="text-[11px] text-[#86868b] truncate">{product.brands}</div>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="text-[13px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${score.tierColor}25`,
                    color: score.tierColor,
                  }}
                >
                  {score.total}/100
                </span>
                <div className="text-[9px] text-[#86868b] mt-1 font-semibold">
                  {score.tierLabel}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b]">
              <span>NOVA {product.novaGroup || '—'}</span>
              <span>•</span>
              <span>{product.nutriments.sugars ?? 0}g azúcar (~{sugarCubes} terrones 🧊)</span>
              <span>•</span>
              <span>Maruca</span>
            </div>
          </div>

          {/* Opciones de Compartir */}
          <div className="space-y-2">
            {/* Compartir Nativo (si disponible) */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[14px] tracking-tight transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              <Share2 size={16} />
              <span>Compartir en Redes o Mensajes</span>
            </button>

            {/* Accesos directos: WhatsApp & Telegram */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#1d1d1f] dark:text-white font-semibold text-[13px] transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <MessageCircle size={16} className="text-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                className="py-3 px-3 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#1d1d1f] dark:text-white font-semibold text-[13px] transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send size={15} className="text-[#0088cc]" />
                <span>Telegram</span>
              </button>
            </div>

            {/* Copiar al Portapapeles */}
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="w-full py-3 px-4 rounded-2xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white font-medium text-[13px] transition flex items-center justify-center gap-2 active:scale-[0.98] mt-1"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-[#30d158]" />
                  <span className="text-[#30d158] font-semibold">¡Ficha copiada al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copiar ficha completa para enviar</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
