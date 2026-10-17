import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ProductEvaluation,
  UserProfile,
  CartItem,
  HealthySwap,
  ScannedProduct,
} from '../../types';
import { CircularGauge } from '../common/CircularGauge';
import { NutriscoreBadge, NovaBadge } from '../common/NutriscoreBadge';
import {
  ShieldAlert,
  CheckCircle,
  X,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  Share2,
  RefreshCw,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { ShareProductModal } from '../common/ShareProductModal';
import { playScanFeedback } from '../../utils/audioFeedback';
import { evaluateProduct } from '../../utils/scoringEngine';
import { ProductThumbnail } from '../common/ProductThumbnail';
import { classifyProductCategory } from '../../utils/productClassifier';

interface ProductRadiographyModalProps {
  evaluation: ProductEvaluation | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onSelectSwap: (swap: HealthySwap) => void;
  userProfile?: UserProfile;
}

export const ProductRadiographyModal: React.FC<ProductRadiographyModalProps> = ({
  evaluation,
  onClose,
  onAddToCart,
  onSelectSwap,
  userProfile,
}) => {
  const [servingMode, setServingMode] = useState<'100g' | 'serving'>('100g');
  const [expandedAdditives, setExpandedAdditives] = useState<boolean>(true);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [addedSwapBarcode, setAddedSwapBarcode] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  if (!evaluation) return null;

  const { product, score, bioAlerts, verdicts, detectedAdditives, swaps } = evaluation;
  const nutriments = product.nutriments || {};

  let servingRatio = 0.3;
  if (nutriments.servingSize) {
    const match = nutriments.servingSize.match(/(\d+(\.\d+)?)/);
    if (match) {
      const g = parseFloat(match[1]);
      if (g > 0 && g < 1000) servingRatio = g / 100;
    }
  }

  const multiplier = servingMode === '100g' ? 1 : servingRatio;

  const displayEnergy = Math.round((nutriments.energyKcal || 0) * multiplier);
  const displaySugars = Number(((nutriments.sugars || 0) * multiplier).toFixed(1));
  const displaySatFat = Number(((nutriments.saturatedFat || 0) * multiplier).toFixed(1));
  const displaySalt = Number(((nutriments.salt || 0) * multiplier).toFixed(2));
  const displayProteins = Number(((nutriments.proteins || 0) * multiplier).toFixed(1));
  const displayFiber = Number(((nutriments.fiber || 0) * multiplier).toFixed(1));

  const sugarCubes = Math.max(0, Number((displaySugars / 4).toFixed(1)));

  const handleAdd = () => {
    const newItem: CartItem = {
      id: `${product.barcode}-${Date.now()}`,
      product,
      evaluation,
      quantity: 1,
      addedAt: Date.now(),
    };
    onAddToCart(newItem);
    playScanFeedback();
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1600);
  };

  const handleAddSwapToCart = (swap: HealthySwap) => {
    const cleanProduct: ScannedProduct = {
      barcode: swap.barcode,
      name: swap.name,
      brands: swap.brand,
      imageUrl: swap.imageUrl,
      quantity: 'Ración saludable',
      categories: ['Alternativa Saludable', 'NOVA 1', 'Comida Real'],
      nutriscoreGrade: 'a',
      novaGroup: (swap.novaGroup as any) || 1,
      nutriments: {
        energyKcal: 120,
        fat: 2.0,
        saturatedFat: 0.3,
        carbohydrates: 12,
        sugars: Math.max(0, (product.nutriments.sugars || 10) - (swap.sugarDiffGrams || 8)),
        fiber: 4.5,
        proteins: (product.nutriments.proteins || 5) + (swap.proteinDiffGrams || 5),
        salt: 0.1,
      },
      ingredientsText: `Alternativa 100% limpia recomendada por Maruca: ${swap.name}.`,
      allergensTags: [],
      tracesTags: [],
      additivesTags: [],
      hasPalmOil: false,
      timestamp: Date.now(),
    };

    const ev = evaluateProduct(cleanProduct, userProfile);
    onAddToCart({
      id: `${cleanProduct.barcode}-${Date.now()}`,
      product: cleanProduct,
      evaluation: ev,
      quantity: 1,
      addedAt: Date.now(),
    });
    playScanFeedback();
    setAddedSwapBarcode(swap.barcode);
    setTimeout(() => {
      setAddedSwapBarcode(null);
    }, 1600);
  };

  const getTrafficColor = (val: number, type: 'sugars' | 'satFat' | 'salt') => {
    if (type === 'sugars') {
      if (val > 12.5) return { bar: 'bg-[#ff453a]', text: 'text-[#ff453a]', label: 'Alto' };
      if (val > 5.0) return { bar: 'bg-[#ff9f0a]', text: 'text-[#ff9f0a]', label: 'Moderado' };
      return { bar: 'bg-[#30d158]', text: 'text-[#30d158]', label: 'Bajo' };
    }
    if (type === 'satFat') {
      if (val > 5.0) return { bar: 'bg-[#ff453a]', text: 'text-[#ff453a]', label: 'Alto' };
      if (val > 1.5) return { bar: 'bg-[#ff9f0a]', text: 'text-[#ff9f0a]', label: 'Moderado' };
      return { bar: 'bg-[#30d158]', text: 'text-[#30d158]', label: 'Bajo' };
    }
    if (val > 1.5) return { bar: 'bg-[#ff453a]', text: 'text-[#ff453a]', label: 'Alto' };
    if (val > 0.6) return { bar: 'bg-[#ff9f0a]', text: 'text-[#ff9f0a]', label: 'Moderado' };
    return { bar: 'bg-[#30d158]', text: 'text-[#30d158]', label: 'Bajo' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-[#1c1c1e] border-t sm:border border-black/[0.08] dark:border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden text-[#1d1d1f] dark:text-white"
      >
        {/* Apple iOS Grab Handle & Header */}
        <div className="pt-3 pb-2 px-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white dark:bg-[#1c1c1e]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              Radiografía de Salud
            </span>
            <span className="text-[11px] text-[#86868b] font-mono">Código: {product.barcode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white text-[12px] font-medium transition active:scale-95"
              title="Compartir o recomendar"
            >
              <Share2 size={13} />
              <span>Compartir</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* 1. Bio-Alert Override (Apple Alert Banner) */}
          {bioAlerts.length > 0 && (
            <div className="space-y-2">
              {bioAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-[#ff453a]/12 border border-[#ff453a]/30 p-4 rounded-2xl flex items-start gap-3"
                >
                  <ShieldAlert className="w-5 h-5 text-[#ff453a] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[13px] font-bold text-[#ff453a] dark:text-white tracking-tight">
                      {alert.title}
                    </div>
                    <div className="text-[12px] text-[#ff453a] mt-0.5 leading-relaxed font-medium">
                      {alert.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Apple Health Product Card */}
          <div className="bg-[#f2f2f7] dark:bg-black/50 p-4 rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <ProductThumbnail
                src={product.imageUrl}
                alt={product.name}
                categoryKey={classifyProductCategory(product)}
                className="w-20 h-20 rounded-2xl object-contain bg-white dark:bg-[#1c1c1e] p-1.5 border border-black/[0.08] dark:border-white/[0.08] shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">{product.brands}</p>
                {product.quantity && (
                  <span className="text-[10px] text-[#86868b]">{product.quantity}</span>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {product.nutriscoreGrade && (
                    <NutriscoreBadge grade={product.nutriscoreGrade} size="sm" />
                  )}
                  {product.novaGroup && <NovaBadge group={product.novaGroup} />}
                </div>
              </div>
            </div>

            {/* Apple Watch Ring Gauge */}
            <div className="shrink-0">
              <CircularGauge score={score.total} size={88} strokeWidth={8} />
            </div>
          </div>

          {/* 3. Veredicto Personalizado (Apple Insights Style) */}
          <div className="bg-black/[0.03] dark:bg-black/40 p-4 rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              <Sparkles size={12} className="text-[#30d158]" />
              <span>Veredicto de Maruca</span>
            </div>
            <div className="space-y-1.5">
              {verdicts.map((v, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[12px] leading-relaxed">
                  <span className="text-[13px] shrink-0">
                    {v.type === 'danger' ? '⚠️' : v.type === 'warning' ? '🔶' : '✅'}
                  </span>
                  <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">{v.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECOMENDACIÓN SALUDABLE DESTACADA CUANDO EL ALIMENTO NO ES SALUDABLE */}
          {swaps.length > 0 && (score.total < 70 || product.novaGroup === 4 || product.hasPalmOil) && (
            <div className="p-4 sm:p-5 rounded-[26px] bg-gradient-to-br from-[#30d158]/12 via-[#30d158]/6 to-transparent border-2 border-[#30d158]/35 dark:border-[#30d158]/45 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#30d158]/20 text-[#30d158] flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#30d158] uppercase tracking-wider">
                      Recomendación de Maruca
                    </span>
                    <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white leading-tight">
                      Sustituto Saludable Recomendado
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/25 shrink-0">
                  {score.total < 40 ? 'Ultraprocesado' : 'No saludable'} • {score.total}/100
                </span>
              </div>

              <p className="text-[12px] text-[#636366] dark:text-[#a1a1a6] leading-relaxed">
                Este alimento contiene aditivos industriales o un perfil desequilibrado. Maruca te sugiere cambiarlo por una alternativa de comida real:
              </p>

              <div className="space-y-2.5">
                {swaps.map((swap, idx) => {
                  const isAddedSwap = addedSwapBarcode === swap.barcode;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#242426] border border-black/[0.08] dark:border-white/[0.1] shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductThumbnail
                            src={swap.imageUrl}
                            alt={swap.name}
                            fallbackIcon={<ShieldCheck size={20} className="text-[#30d158]" />}
                            className="w-13 h-13 rounded-xl object-contain bg-[#f2f2f7] dark:bg-black p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                          />
                          <div className="min-w-0">
                            <h5 className="text-[13px] font-bold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                              {swap.name}
                            </h5>
                            <div className="text-[11px] text-[#86868b] truncate">{swap.brand}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#30d158]/20 text-[#30d158]">
                                NOVA {swap.novaGroup || 1}
                              </span>
                              <span className="text-[9px] font-semibold text-[#86868b]">
                                0 aditivos sintéticos
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end">
                          <span className="text-[14px] font-bold text-[#30d158] px-2.5 py-0.5 rounded-full bg-[#30d158]/15 border border-[#30d158]/25">
                            {swap.score}/100
                          </span>
                          <span className="text-[10px] text-[#30d158] font-semibold mt-0.5">
                            +{Math.max(1, swap.score - score.total)} pts salud
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#1d1d1f] dark:text-[#ebebf5] leading-relaxed bg-[#30d158]/10 p-2.5 rounded-xl border border-[#30d158]/20">
                        <span className="font-semibold text-[#30d158]">Por qué es mejor: </span>
                        {swap.reason}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectSwap(swap)}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#30d158] hover:bg-[#28b84d] text-black font-bold text-[12px] transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <RefreshCw size={13} strokeWidth={2.5} />
                          <span>Elegir esta opción</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddSwapToCart(swap)}
                          className={`py-2.5 px-3 rounded-full border text-[12px] font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 ${
                            isAddedSwap
                              ? 'bg-[#30d158] text-black border-[#30d158] font-bold shadow-sm'
                              : 'bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white border-black/[0.08] dark:border-white/[0.1]'
                          }`}
                        >
                          {isAddedSwap ? (
                            <>
                              <Check size={13} strokeWidth={3} />
                              <span>¡Añadido!</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Añadir a Cesta</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Semáforo Nutricional (Apple Health Progress Bars) */}
          <div className="bg-[#f2f2f7] dark:bg-black/50 p-4 rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                Desglose Nutricional
              </span>

              {/* Apple Segmented 100g vs Serving Toggle */}
              <div className="flex bg-black/[0.06] dark:bg-[#2c2c2e] rounded-full p-0.5 border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setServingMode('100g')}
                  className={`px-2.5 py-0.5 rounded-full transition ${
                    servingMode === '100g'
                      ? 'bg-white dark:bg-white text-[#1d1d1f] dark:text-black shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  100g
                </button>
                <button
                  type="button"
                  onClick={() => setServingMode('serving')}
                  className={`px-2.5 py-0.5 rounded-full transition ${
                    servingMode === 'serving'
                      ? 'bg-white dark:bg-white text-[#1d1d1f] dark:text-black shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  Ración
                </button>
              </div>
            </div>

            {/* Azúcares con Terrones */}
            {(() => {
              const info = getTrafficColor(displaySugars, 'sugars');
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium flex items-center gap-1.5">
                      <span>Azúcares</span>
                      {sugarCubes > 0 && (
                        <span className="text-[11px] text-[#ff9f0a] font-normal">
                          (~{sugarCubes} terrones 🧊)
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">
                      {displaySugars} g{' '}
                      <span className={`text-[10px] ${info.text}`}>({info.label})</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${info.bar} transition-all duration-300`}
                      style={{ width: `${Math.min(100, (displaySugars / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Grasas Saturadas */}
            {(() => {
              const info = getTrafficColor(displaySatFat, 'satFat');
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Grasas saturadas</span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">
                      {displaySatFat} g{' '}
                      <span className={`text-[10px] ${info.text}`}>({info.label})</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${info.bar} transition-all duration-300`}
                      style={{ width: `${Math.min(100, (displaySatFat / 12) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Sal */}
            {(() => {
              const info = getTrafficColor(displaySalt, 'salt');
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Sal</span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">
                      {displaySalt} g{' '}
                      <span className={`text-[10px] ${info.text}`}>({info.label})</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${info.bar} transition-all duration-300`}
                      style={{ width: `${Math.min(100, (displaySalt / 2.5) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Apple Activity Triple Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06] text-center">
              <div className="bg-white dark:bg-white/[0.03] p-2 rounded-2xl border border-black/[0.04] dark:border-transparent">
                <div className="text-[10px] text-[#86868b]">Energía</div>
                <div className="text-[13px] font-bold text-[#1d1d1f] dark:text-white mt-0.5">{displayEnergy} kcal</div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] p-2 rounded-2xl border border-black/[0.04] dark:border-transparent">
                <div className="text-[10px] text-[#86868b]">Proteínas</div>
                <div className="text-[13px] font-bold text-[#30d158] mt-0.5">{displayProteins} g</div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] p-2 rounded-2xl border border-black/[0.04] dark:border-transparent">
                <div className="text-[10px] text-[#86868b]">Fibra</div>
                <div className="text-[13px] font-bold text-[#0071e3] mt-0.5">{displayFiber} g</div>
              </div>
            </div>
          </div>

          {/* 5. Inspector de Aditivos (Apple Inset Grouped) */}
          <div className="bg-[#f2f2f7] dark:bg-black/50 rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedAdditives(!expandedAdditives)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-[#1d1d1f] dark:text-white">Aditivos y Números E</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/10 text-[#86868b] font-medium">
                  {detectedAdditives.length}
                </span>
              </div>
              {expandedAdditives ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {expandedAdditives && (
              <div className="p-4 pt-0 space-y-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                {detectedAdditives.length === 0 ? (
                  <div className="text-[12px] text-[#30d158] flex items-center gap-1.5 py-1">
                    <CheckCircle size={14} />
                    <span>Sin aditivos sintéticos ni números E detectados.</span>
                  </div>
                ) : (
                  detectedAdditives.map((add, idx) => {
                    const isHigh = add.risk === 'high';
                    const isMod = add.risk === 'moderate';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-[12px] ${
                          isHigh
                            ? 'bg-[#ff453a]/10 border-[#ff453a]/20'
                            : isMod
                            ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/20'
                            : 'bg-white dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#1d1d1f] dark:text-white">
                            {add.code} • {add.name}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold ${
                              isHigh
                                ? 'bg-[#ff453a] text-white'
                                : isMod
                                ? 'bg-[#ff9f0a] text-black'
                                : 'bg-[#30d158] text-black'
                            }`}
                          >
                            {isHigh ? 'Riesgo Alto' : isMod ? 'Moderado' : 'Seguro'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed">
                          {add.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 6. Alternativas Más Saludables (Apple Card Swaps) */}
          {swaps.length > 0 && (
            <div className="bg-black/[0.02] dark:bg-white/[0.03] p-4 rounded-[24px] border border-black/[0.08] dark:border-white/[0.08] space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#30d158] uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Alternativas Más Saludables</span>
              </div>

              <div className="space-y-2">
                {swaps.map((swap, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSwap(swap)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-black/60 border border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20 transition text-left active:scale-[0.98] shadow-sm"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                        {swap.name}
                      </div>
                      <div className="text-[11px] text-[#86868b]">{swap.brand}</div>
                      <div className="text-[11px] text-[#30d158] mt-1 font-medium">
                        {swap.reason}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-[15px] font-bold text-[#30d158]">
                        {swap.score}/100
                      </span>
                      <span className="text-[10px] text-[#86868b] font-medium">
                        +{Math.max(1, swap.score - score.total)} pts
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acciones Inferiores: Añadir a Cesta y Compartir */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] shrink-0 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="w-12 h-12 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white flex items-center justify-center shrink-0 transition active:scale-95 border border-black/[0.08] dark:border-white/[0.08]"
            title="Compartir y recomendar alimento"
          >
            <Share2 size={18} />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 py-3.5 px-4 rounded-full font-semibold text-[14px] tracking-tight shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 ${
              addedSuccess
                ? 'bg-[#30d158] text-black font-bold'
                : 'bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black'
            }`}
          >
            {addedSuccess ? (
              <>
                <CheckCircle size={16} />
                <span>Añadido a tu Cesta</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Añadir a mi Cesta</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Modal de Compartir Recomendación */}
      <ShareProductModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
        score={score}
        sugarCubes={sugarCubes}
      />
    </div>
  );
};
