import React, { useState, useEffect } from 'react';
import { DailyRecommendation, DailyMeal, UserProfile, CartItem, ScannedProduct } from '../../types';
import { getDailyMealRecommendation } from '../../services/geminiDailyRecommendations';
import { evaluateProduct } from '../../utils/scoringEngine';
import { ZeldaHeart } from '../common/ZeldaHeart';
import {
  Sparkles,
  Utensils,
  Flame,
  Check,
  Plus,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { playScanFeedback } from '../../utils/audioFeedback';

interface DailyRecommendationCardProps {
  userProfile?: UserProfile;
  onAddToCart?: (item: CartItem) => void;
  onSelectIngredientToSearch?: (term: string) => void;
}

export const DailyRecommendationCard: React.FC<DailyRecommendationCardProps> = ({
  userProfile,
  onAddToCart,
  onSelectIngredientToSearch,
}) => {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [addedIngredient, setAddedIngredient] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getDailyMealRecommendation(userProfile)
      .then((data) => {
        if (isMounted) {
          setRecommendation(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando recomendación diaria:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userProfile?.geminiApiKey]);

  // Formato de fecha en español (ej: Sábado, 17 de octubre)
  const formattedToday = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const capitalizedDate =
    formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1);

  const handleAddIngredientToCart = (ingredientName: string) => {
    if (!onAddToCart) return;

    // Crear un producto limpio NOVA 1 artesanal para la cesta
    const cleanProduct: ScannedProduct = {
      barcode: `DAILY-${Date.now().toString().slice(-6)}`,
      name: ingredientName,
      brands: 'Recomendación Diaria Maruca',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
      quantity: 'Ración fresca',
      categories: ['Alimento Fresco', 'NOVA 1', 'Comida Real'],
      nutriscoreGrade: 'a',
      novaGroup: 1,
      nutriments: {
        energyKcal: 120,
        fat: 1.5,
        saturatedFat: 0.2,
        carbohydrates: 15,
        sugars: 1.5,
        fiber: 4.5,
        proteins: 5,
        salt: 0.05,
      },
      ingredientsText: `${ingredientName} 100% natural, sin procesar ni aditivos.`,
      allergensTags: [],
      tracesTags: [],
      additivesTags: [],
      hasPalmOil: false,
      timestamp: Date.now(),
    };

    const evaluation = evaluateProduct(cleanProduct, userProfile);
    const cartItem: CartItem = {
      id: `${cleanProduct.barcode}-${Date.now()}`,
      product: cleanProduct,
      evaluation,
      quantity: 1,
      addedAt: Date.now(),
    };

    onAddToCart(cartItem);
    playScanFeedback();

    setAddedIngredient(ingredientName);
    setTimeout(() => {
      setAddedIngredient(null);
    }, 1600);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-5 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="space-y-1.5">
              <div className="w-24 h-3 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
              <div className="w-40 h-4 bg-black/[0.08] dark:bg-white/[0.1] rounded-full" />
            </div>
          </div>
          <div className="w-16 h-6 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
        </div>
        <div className="h-20 bg-black/[0.04] dark:bg-white/[0.05] rounded-2xl" />
        <div className="h-10 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl" />
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const currentMeal: DailyMeal | undefined =
    recommendation.meals[selectedMealIndex] || recommendation.meals[0];

  const mealIcons: Record<string, string> = {
    Desayuno: '🌅',
    Comida: '☀️',
    Merienda: '☕',
    Cena: '🌙',
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 overflow-hidden relative transition-all">
      {/* Glow ambiental sutil */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#30d158]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Fecha y Zelda Heart */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#30d158]/12 border border-[#30d158]/25 flex items-center justify-center shrink-0 shadow-xs">
            <ZeldaHeart size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#86868b]">
              <Calendar size={11} className="text-[#30d158]" />
              <span>{capitalizedDate}</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white tracking-tight">
              {recommendation.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/25">
            {recommendation.caloriesTarget}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 flex items-center justify-center text-[#86868b] transition active:scale-95"
            aria-label={isExpanded ? 'Plegar recomendación' : 'Desplegar recomendación'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Foco Biológico del Día */}
      <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#30d158]/15 text-[#30d158] shrink-0 mt-0.5">
          <Sparkles size={13} />
        </div>
        <div className="text-[12px] leading-relaxed text-[#1d1d1f] dark:text-[#f5f5f7]">
          <span className="font-semibold text-[#30d158]">Foco Nutricional: </span>
          {recommendation.dailyFocus}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Selector de Comidas (Apple Segmented Bar) */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/[0.05] dark:bg-[#121214] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            {recommendation.meals.map((meal, index) => {
              const isSelected = selectedMealIndex === index;
              return (
                <button
                  key={meal.type}
                  type="button"
                  onClick={() => setSelectedMealIndex(index)}
                  className={`py-2 px-1 rounded-xl transition text-center flex flex-col items-center gap-0.5 active:scale-95 ${
                    isSelected
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm font-semibold'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white font-normal'
                  }`}
                >
                  <span className="text-[13px]">{mealIcons[meal.type] || '🍽️'}</span>
                  <span className="text-[11px] truncate">{meal.type}</span>
                </button>
              );
            })}
          </div>

          {/* Tarjeta de la Comida Seleccionada */}
          {currentMeal && (
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#30d158]">
                    {currentMeal.type} Saludable
                  </span>
                  <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white leading-snug">
                    {currentMeal.name}
                  </h4>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#30d158]/15 border border-[#30d158]/30 text-[#30d158] text-[11px] font-bold shadow-xs">
                  <ShieldCheck size={13} />
                  <span>{currentMeal.cleanScore}/100</span>
                </div>
              </div>

              <p className="text-[12px] text-[#636366] dark:text-[#a1a1a6] leading-relaxed">
                {currentMeal.description}
              </p>

              {/* Nutrientes & Macros */}
              <div className="flex items-center gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] font-medium text-[#1d1d1f] dark:text-[#ebebf5]">
                <Flame size={13} className="text-[#ff9f0a] shrink-0" />
                <span>{currentMeal.nutrients}</span>
              </div>
            </div>
          )}

          {/* Consejo del Chef */}
          {recommendation.chefTip && (
            <div className="p-3 rounded-2xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 border border-[#ff9f0a]/25 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#ff9f0a]/20 text-[#ff9f0a] shrink-0 mt-0.5">
                <Utensils size={13} />
              </div>
              <div className="text-[12px] leading-relaxed text-[#1d1d1f] dark:text-white">
                <span className="font-semibold text-[#ff9f0a]">Consejo del Chef: </span>
                {recommendation.chefTip}
              </div>
            </div>
          )}

          {/* Ingredientes Recomendados para Comprar (1-Click añadir a la cesta) */}
          {recommendation.topIngredientsToBuy && recommendation.topIngredientsToBuy.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag size={12} className="text-[#30d158]" />
                  Ingredientes Clave de Hoy
                </span>
                <span className="text-[10px] text-[#86868b]">Toca para añadir a la cesta</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recommendation.topIngredientsToBuy.map((ingredient) => {
                  const isJustAdded = addedIngredient === ingredient;
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => handleAddIngredientToCart(ingredient)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition active:scale-95 border ${
                        isJustAdded
                          ? 'bg-[#30d158] text-black border-[#30d158] shadow-sm font-semibold'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.06] dark:border-white/[0.08]'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check size={12} strokeWidth={3} />
                          <span>¡Añadido!</span>
                        </>
                      ) : (
                        <>
                          <Plus size={12} className="text-[#30d158]" />
                          <span>{ingredient}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer de Protección de Cuota de la API */}
          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-center gap-1.5 text-[10px] text-[#86868b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
            <span>Recomendación del día activa • Sincronización automática cada 24 horas</span>
          </div>
        </>
      )}
    </div>
  );
};
