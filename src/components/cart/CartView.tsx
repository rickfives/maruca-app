import React, { useState } from 'react';
import { CartItem } from '../../types';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, HeartCrack, Share2, Check } from 'lucide-react';
import { CircularGauge } from '../common/CircularGauge';
import { NovaBadge } from '../common/NutriscoreBadge';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenProduct: (item: CartItem) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenProduct,
}) => {
  const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  let totalScoreSum = 0;
  let nova4Count = 0;
  let totalSugarGrams = 0;
  let worstItem: CartItem | null = null;
  let worstScore = 101;

  cartItems.forEach((item) => {
    const itemScore = item.evaluation.score.total;
    totalScoreSum += itemScore * item.quantity;

    if (item.product.novaGroup === 4) {
      nova4Count += item.quantity;
    }

    const sugarsPer100 = item.product.nutriments.sugars || 0;
    totalSugarGrams += sugarsPer100 * 0.5 * item.quantity;

    if (itemScore < worstScore) {
      worstScore = itemScore;
      worstItem = item;
    }
  });

  const averageScore = totalUnits > 0 ? Math.round(totalScoreSum / totalUnits) : 0;
  const nova4Percentage = totalUnits > 0 ? Math.round((nova4Count / totalUnits) * 100) : 0;
  const totalSugarCubes = Math.round(totalSugarGrams / 4);

  const [copiedCart, setCopiedCart] = useState(false);

  const handleShareCart = async () => {
    const text = `🛒 ¡Auditoría de mi Cesta Saludable en Maruca!
📊 Nota Media: ${averageScore}/100
⚠️ Ultraprocesados (NOVA 4): ${nova4Percentage}%
🧊 Azúcar Total Oculto: ~${totalSugarCubes} terrones en ${totalUnits} alimentos

Analizado con Maruca. ¡Comer limpio es fácil!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Cesta Saludable en Maruca',
          text,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedCart(true);
        setTimeout(() => setCopiedCart(false), 2000);
      } catch (e) {}
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-16 px-4 space-y-4">
        <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center mx-auto text-[#86868b] shadow-sm">
          <ShoppingBag size={28} />
        </div>
        <h3 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">Tu cesta está vacía</h3>
        <p className="text-[13px] text-[#86868b] max-w-xs mx-auto leading-relaxed">
          Escanea los alimentos que agregues a tu carro en el supermercado para auditar la calidad nutricional en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-12">
      {/* 1. Apple Health Summary Card */}
      <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#30d158]">
              Resumen de Compra
            </span>
            <h3 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">Salud de la Cesta</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareCart}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white text-[12px] font-medium transition active:scale-95"
              title="Compartir auditoría de la cesta"
            >
              {copiedCart ? (
                <>
                  <Check size={13} className="text-[#30d158]" />
                  <span className="text-[#30d158]">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Compartir</span>
                </>
              )}
            </button>
            <button
              onClick={onClearCart}
              className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#86868b] hover:text-[#ff453a] flex items-center justify-center transition"
              title="Vaciar cesta"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-[11px] text-[#86868b] font-medium">Ultraprocesados (NOVA 4)</div>
              <div className="text-[18px] font-bold text-[#1d1d1f] dark:text-white mt-0.5">
                {nova4Percentage}%{' '}
                <span className="text-[12px] font-normal text-[#86868b]">
                  ({nova4Count} de {totalUnits})
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/10 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    nova4Percentage > 40 ? 'bg-[#ff453a]' : nova4Percentage > 20 ? 'bg-[#ff9f0a]' : 'bg-[#30d158]'
                  }`}
                  style={{ width: `${Math.min(100, nova4Percentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#86868b] font-medium">Azúcar Oculto Total</div>
              <div className="text-[18px] font-bold text-[#ff9f0a] mt-0.5 flex items-center gap-1.5">
                <span>~{totalSugarCubes} terrones</span>
                <span className="text-sm">🧊</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <CircularGauge score={averageScore} size={84} strokeWidth={8} />
            <span className="text-[10px] font-semibold text-[#86868b] mt-1">Puntuación</span>
          </div>
        </div>
      </div>

      {/* 2. Flag: El Villano de tu Cesta (Apple Caution Card) */}
      {worstItem && (worstItem as CartItem).evaluation.score.total < 50 && (
        <div className="bg-[#ff453a]/10 border border-[#ff453a]/25 p-4 rounded-[24px] space-y-2">
          <div className="flex items-center gap-2">
            <HeartCrack size={15} className="text-[#ff453a]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff453a]">
              Atención en tu Cesta
            </span>
          </div>

          <p className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
            <strong>{(worstItem as CartItem).product.name}</strong> tiene solo{' '}
            {(worstItem as CartItem).evaluation.score.total}/100 y reduce la puntuación global de tu compra.
          </p>

          <button
            onClick={() => onOpenProduct(worstItem as CartItem)}
            className="w-full py-2.5 px-3 rounded-full bg-[#ff453a]/20 hover:bg-[#ff453a]/30 text-[#ff453a] dark:text-white text-[12px] font-semibold transition flex items-center justify-center gap-1.5 mt-1"
          >
            <span>Ver alternativas más saludables</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
            Artículos en Cesta ({cartItems.length} / 15)
          </span>
          {cartItems.length >= 15 && (
            <span className="text-[10px] font-semibold text-[#ff9f0a]">
              Límite alcanzado (15 máx)
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06] shadow-sm">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition"
            >
              <div
                onClick={() => onOpenProduct(item)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-11 h-11 rounded-xl object-contain bg-[#f2f2f7] dark:bg-black p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#f2f2f7] dark:bg-black flex items-center justify-center text-[#86868b] shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                    <ShoppingBag size={18} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-[#86868b] truncate">{item.product.brands}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                      style={{
                        backgroundColor: `${item.evaluation.score.tierColor}20`,
                        color: item.evaluation.score.tierColor,
                      }}
                    >
                      {item.evaluation.score.total}/100
                    </span>
                    {item.product.novaGroup && <NovaBadge group={item.product.novaGroup} />}
                  </div>
                </div>
              </div>

              {/* Apple Stepper Controls */}
              <div className="flex items-center gap-1.5 bg-black/[0.05] dark:bg-black/50 px-2 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
                >
                  <Minus size={11} />
                </button>
                <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-white w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
