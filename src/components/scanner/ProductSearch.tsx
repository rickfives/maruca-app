import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react';
import { ScannedProduct } from '../../types';
import { searchProductsByQuery } from '../../services/openFoodFacts';
import { getAllDemoProducts } from '../../utils/fallbackProducts';
import { NutriscoreBadge, NovaBadge } from '../common/NutriscoreBadge';
import { playScanFeedback } from '../../utils/audioFeedback';

import { trackSearchEvent } from '../../services/analyticsService';

interface ProductSearchProps {
  onSelectProduct: (product: ScannedProduct) => void;
  onSelectBarcode: (barcode: string) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSelectProduct,
  onSelectBarcode,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const demoProducts = getAllDemoProducts();

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const found = await searchProductsByQuery(query);
        setResults(found);
        trackSearchEvent(query, found.length);
      } catch (err) {
        console.error('Error buscando:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleDemoClick = (barcode: string) => {
    playScanFeedback();
    onSelectBarcode(barcode);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* 1. Apple Spotlight Search Field */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alimento o marca (ej. Hacendado, Avena...)"
          className="w-full py-3 pl-10 pr-10 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[14px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] outline-none transition shadow-sm"
        />
        {isLoading && (
          <Loader2
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] animate-spin"
          />
        )}
      </div>

      {/* 2. Quick Demo Supermarket Chips (Apple Horizontal / Grid) */}
      <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] space-y-3 shadow-sm">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
            <Sparkles size={12} className="text-[#30d158]" />
            <span>Productos de Supermercado (1-Clic)</span>
          </div>
          <span className="text-[10px] text-[#86868b]">Muestras reales</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {demoProducts.map((item) => (
            <button
              key={item.barcode}
              type="button"
              onClick={() => handleDemoClick(item.barcode)}
              className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.04] transition text-left active:scale-[0.98]"
            >
              <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                {item.shortLabel}
              </div>
              <div className="text-[11px] text-[#86868b] mt-0.5 truncate">{item.brand}</div>
              <div className="text-[10px] text-[#30d158] mt-1 font-medium truncate">
                {item.expectedTier}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search Results List (Apple Inset Grouped Table View) */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06] max-h-80 overflow-y-auto shadow-sm">
          {results.map((prod) => (
            <button
              key={prod.barcode + prod.name}
              type="button"
              onClick={() => {
                playScanFeedback();
                onSelectProduct(prod);
              }}
              className="w-full flex items-center gap-3 p-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-left transition active:bg-black/[0.06] dark:active:bg-white/[0.08]"
            >
              {prod.imageUrl ? (
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-11 h-11 rounded-xl object-contain bg-[#f2f2f7] dark:bg-black p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#f2f2f7] dark:bg-black flex items-center justify-center text-[#86868b] shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                  <ShoppingBag size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                  {prod.name}
                </div>
                <div className="text-[11px] text-[#86868b] truncate">{prod.brands}</div>
                <div className="flex items-center gap-2 mt-1">
                  {prod.nutriscoreGrade && <NutriscoreBadge grade={prod.nutriscoreGrade} size="sm" />}
                  {prod.novaGroup && <NovaBadge group={prod.novaGroup} />}
                </div>
              </div>
              <ChevronRight size={15} className="text-[#86868b] shrink-0" />
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="text-center py-8 text-[13px] text-[#86868b]">
          No se encontraron alimentos para «{query}».
        </div>
      )}
    </div>
  );
};
