import React, { useState, useMemo } from 'react';
import { ScannedProduct, UserProfile, CartItem } from '../../types';
import { evaluateProduct } from '../../utils/scoringEngine';
import {
  History,
  Trash2,
  Plus,
  Search,
  Clock,
  ShoppingBag,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { NovaBadge, NutriscoreBadge } from '../common/NutriscoreBadge';
import { playScanFeedback } from '../../utils/audioFeedback';
import {
  classifyProductCategory,
  PRODUCT_CATEGORIES,
  ProductCategoryKey,
} from '../../utils/productClassifier';
import { ProductThumbnail } from '../common/ProductThumbnail';

interface RecentScansProps {
  scanHistory: ScannedProduct[];
  userProfile?: UserProfile;
  onSelectProduct: (product: ScannedProduct) => void;
  onRemoveFromHistory: (barcode: string) => void;
  onClearHistory: () => void;
  onAddToCart: (item: CartItem) => void;
}

type FilterCategory = 'all' | ProductCategoryKey;

export const RecentScans: React.FC<RecentScansProps> = ({
  scanHistory,
  userProfile,
  onSelectProduct,
  onRemoveFromHistory,
  onClearHistory,
  onAddToCart,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [addedBarcode, setAddedBarcode] = useState<string | null>(null);

  // Clasificar cada producto con memoización
  const categorizedProducts = useMemo(() => {
    return scanHistory.map((prod) => ({
      product: prod,
      categoryKey: classifyProductCategory(prod),
    }));
  }, [scanHistory]);

  // Contadores por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: scanHistory.length,
      bebidas: 0,
      comidas: 0,
      salsas: 0,
      postres: 0,
      snacks: 0,
      otros: 0,
    };

    categorizedProducts.forEach(({ categoryKey }) => {
      counts[categoryKey] = (counts[categoryKey] || 0) + 1;
    });

    return counts;
  }, [scanHistory.length, categorizedProducts]);

  // Categorías que tienen al menos 1 producto o las categorías clave
  const categoryTabs: { key: FilterCategory; label: string; emoji: string }[] = [
    { key: 'all', label: 'Todos', emoji: '✨' },
    { key: 'bebidas', label: 'Bebidas', emoji: '🥤' },
    { key: 'comidas', label: 'Comidas', emoji: '🍲' },
    { key: 'salsas', label: 'Salsas', emoji: '🥫' },
    { key: 'postres', label: 'Postres', emoji: '🍰' },
    { key: 'snacks', label: 'Snacks', emoji: '🍿' },
    { key: 'otros', label: 'Otros', emoji: '🍽️' },
  ];

  if (scanHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-6 text-center space-y-2 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06] text-[#86868b] flex items-center justify-center mx-auto mb-2">
          <History size={20} />
        </div>
        <h4 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Historial de Escaneos Vacío</h4>
        <p className="text-[12px] text-[#86868b] max-w-xs mx-auto leading-relaxed">
          Cada producto que escanees quedará organizado automáticamente por bebidas, comidas, salsas, postres y snacks para consultarlo cuando quieras.
        </p>
      </div>
    );
  }

  // Filtrado por texto y categoría
  const filteredItems = categorizedProducts.filter(({ product, categoryKey }) => {
    // Filtro por categoría seleccionada
    if (selectedCategory !== 'all' && categoryKey !== selectedCategory) {
      return false;
    }

    // Filtro por término de búsqueda
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.brands && product.brands.toLowerCase().includes(term)) ||
      product.barcode.includes(term)
    );
  });

  // Agrupación de productos por categoría para la vista dividida
  const groupedSections: {
    categoryKey: ProductCategoryKey;
    meta: (typeof PRODUCT_CATEGORIES)[ProductCategoryKey];
    items: ScannedProduct[];
  }[] = [];

  const displayCategories: ProductCategoryKey[] =
    selectedCategory === 'all'
      ? ['bebidas', 'comidas', 'salsas', 'postres', 'snacks', 'otros']
      : [selectedCategory];

  displayCategories.forEach((catKey) => {
    const items = filteredItems
      .filter((item) => item.categoryKey === catKey)
      .map((item) => item.product);

    if (items.length > 0) {
      groupedSections.push({
        categoryKey: catKey,
        meta: PRODUCT_CATEGORIES[catKey],
        items,
      });
    }
  });

  const handleQuickAdd = (e: React.MouseEvent, prod: ScannedProduct) => {
    e.stopPropagation();
    const ev = evaluateProduct(prod, userProfile);
    const item: CartItem = {
      id: `${prod.barcode}-${Date.now()}`,
      product: prod,
      evaluation: ev,
      quantity: 1,
      addedAt: Date.now(),
    };
    onAddToCart(item);
    playScanFeedback();

    setAddedBarcode(prod.barcode);
    setTimeout(() => {
      setAddedBarcode(null);
    }, 1500);
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Reciente';
    const diffHours = Math.floor((Date.now() - ts) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hace un momento';
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#30d158]">
            <History size={15} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Historial de Escaneos</span>
            </h3>
            <span className="text-[11px] text-[#86868b]">
              Dividido por categorías • {scanHistory.length} producto{scanHistory.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {scanHistory.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[11px] text-[#86868b] hover:text-[#ff453a] font-medium transition"
          >
            Borrar todo
          </button>
        )}
      </div>

      {/* Pestañas de Categorías (Bebidas, Comidas, Salsas, Postres, Snacks, etc) */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {categoryTabs.map((tab) => {
            const isSelected = selectedCategory === tab.key;
            const count = categoryCounts[tab.key] || 0;
            // No mostrar pestañas con 0 productos a menos que sea "all" o tenga al menos 1
            if (tab.key !== 'all' && count === 0 && selectedCategory !== tab.key) {
              return null;
            }

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`py-1.5 px-3 rounded-full text-[12px] font-medium transition flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold shadow-sm'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.04] dark:border-white/[0.06]'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-black/[0.06] dark:bg-white/10 text-[#86868b] dark:text-[#a1a1a6]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buscador dentro del historial */}
      {scanHistory.length > 2 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={
              selectedCategory === 'all'
                ? 'Buscar en bebidas, comidas, salsas, postres...'
                : `Buscar en ${PRODUCT_CATEGORIES[selectedCategory]?.label || 'categoría'}...`
            }
            className="w-full py-1.5 pl-8 pr-3 rounded-full bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[12px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] outline-none"
          />
        </div>
      )}

      {/* Listado dividido por secciones de categoría */}
      <div className="space-y-4">
        {groupedSections.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-[#86868b] bg-[#f2f2f7] dark:bg-black/40 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            {searchFilter ? (
              <>Ningún producto coincide con «{searchFilter}»</>
            ) : (
              <>No hay productos en esta categoría todavía.</>
            )}
          </div>
        ) : (
          groupedSections.map((section) => (
            <div key={section.categoryKey} className="space-y-2">
              {/* Encabezado de la división (Bebidas, Comidas, Salsas, Postres...) */}
              <div className="flex items-center justify-between px-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px]">{section.meta.emoji}</span>
                  <span className="text-[12px] font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider">
                    {section.meta.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#86868b] dark:text-[#a1a1a6]">
                    {section.items.length}
                  </span>
                </div>
                <span className="text-[10px] text-[#86868b] truncate max-w-[170px] hidden sm:inline">
                  {section.meta.description}
                </span>
              </div>

              {/* Lista Inset Grouped para los productos de esta categoría */}
              <div className="bg-[#f2f2f7] dark:bg-black/50 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {section.items.map((prod) => {
                  const ev = evaluateProduct(prod, userProfile);
                  const isAdded = addedBarcode === prod.barcode;
                  const catKey = classifyProductCategory(prod);
                  const meta = PRODUCT_CATEGORIES[catKey];

                  return (
                    <div
                      key={prod.barcode}
                      onClick={() => onSelectProduct(prod)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition cursor-pointer group active:bg-black/[0.06] dark:active:bg-white/[0.06]"
                    >
                      {/* Thumbnail */}
                      <ProductThumbnail
                        src={prod.imageUrl}
                        alt={prod.name}
                        categoryKey={catKey}
                        fallbackEmoji={meta.emoji}
                        className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-[#1c1c1e] p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                      />

                      {/* Detalles del Producto */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate group-hover:text-[#30d158] transition">
                            {prod.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] truncate mt-0.5">
                          <span>{prod.brands}</span>
                          <span>•</span>
                          <span className="text-[10px] text-[#86868b] flex items-center gap-0.5">
                            <Clock size={10} />
                            {formatTimestamp(prod.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {/* Chip de Categoría */}
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border"
                            style={{
                              backgroundColor: `${meta.color}15`,
                              borderColor: `${meta.color}30`,
                              color: meta.color,
                            }}
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>

                          {/* Puntuación */}
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                            style={{
                              backgroundColor: `${ev.score.tierColor}20`,
                              color: ev.score.tierColor,
                            }}
                          >
                            {ev.score.total}/100
                          </span>

                          {prod.nutriscoreGrade && (
                            <NutriscoreBadge grade={prod.nutriscoreGrade} size="sm" />
                          )}
                          {prod.novaGroup && <NovaBadge group={prod.novaGroup} />}
                        </div>
                      </div>

                      {/* Botones de Acción (Cesta + Borrar) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, prod)}
                          className={`h-8 px-2.5 rounded-full text-[11px] font-semibold transition flex items-center gap-1 active:scale-95 ${
                            isAdded
                              ? 'bg-[#30d158] text-black font-bold shadow-sm'
                              : 'bg-black/[0.06] dark:bg-white/10 hover:bg-black/[0.1] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white'
                          }`}
                          title="Añadir a la Cesta"
                        >
                          {isAdded ? (
                            <>
                              <Check size={12} strokeWidth={3} />
                              <span>Añadido</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>Cesta</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromHistory(prod.barcode);
                          }}
                          className="w-7 h-7 rounded-full text-[#86868b] hover:text-[#ff453a] hover:bg-black/[0.05] dark:hover:bg-white/5 flex items-center justify-center transition"
                          title="Eliminar de mi historial"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
