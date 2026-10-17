import React from 'react';
import { ScannedProduct, UserProfile } from '../../types';
import { evaluateProduct } from '../../utils/scoringEngine';
import { Flame, ShieldAlert, History, ChevronRight } from 'lucide-react';
import { classifyProductCategory, PRODUCT_CATEGORIES } from '../../utils/productClassifier';

interface StatsViewProps {
  scanHistory: ScannedProduct[];
  userProfile?: UserProfile;
  onSelectProduct: (product: ScannedProduct) => void;
  onClearHistory: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  scanHistory,
  userProfile,
  onSelectProduct,
  onClearHistory,
}) => {
  const evaluations = scanHistory.map((p) => evaluateProduct(p, userProfile));
  const totalScans = evaluations.length;

  let excellentCount = 0;
  let goodCount = 0;
  let mediocreCount = 0;
  let badCount = 0;
  let avoidedAdditivesCount = 0;

  evaluations.forEach((ev) => {
    const tier = ev.score.tier;
    if (tier === 'excellent') excellentCount++;
    else if (tier === 'good') goodCount++;
    else if (tier === 'mediocre') mediocreCount++;
    else badCount++;

    const highRiskAdditives = ev.detectedAdditives.filter((a) => a.risk === 'high');
    avoidedAdditivesCount += highRiskAdditives.length;
  });

  const getPercent = (count: number) => (totalScans > 0 ? Math.round((count / totalScans) * 100) : 0);
  const healthStreakDays = Math.min(14, Math.max(1, Math.round(totalScans * 1.5)));

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-12">
      {/* 1. Apple Health Highlights Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] text-[#ff9f0a] font-semibold uppercase tracking-wider">
            <Flame size={13} />
            <span>Racha Saludable</span>
          </div>
          <div className="text-[26px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">{healthStreakDays} días</div>
          <div className="text-[11px] text-[#86868b]">Hábito consciente</div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] text-[#ff453a] font-semibold uppercase tracking-wider">
            <ShieldAlert size={13} />
            <span>Aditivos Evitados</span>
          </div>
          <div className="text-[26px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">{avoidedAdditivesCount}</div>
          <div className="text-[11px] text-[#86868b]">Identificados a tiempo</div>
        </div>
      </div>

      {/* 2. Apple Health Distribution Bar */}
      <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
            Distribución Nutricional
          </span>
          <span className="text-[12px] text-[#86868b] font-medium">{totalScans} escaneados</span>
        </div>

        {totalScans === 0 ? (
          <div className="text-center py-8 text-[12px] text-[#86868b]">
            Aún no has registrado escaneos.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Apple Activity Horizontal Bar */}
            <div className="h-3 w-full rounded-full bg-black/[0.06] dark:bg-black/60 flex overflow-hidden p-0.5 border border-black/[0.06] dark:border-white/[0.06]">
              {excellentCount > 0 && (
                <div
                  style={{ width: `${getPercent(excellentCount)}%` }}
                  className="bg-[#30d158] rounded-l-full transition-all duration-300"
                />
              )}
              {goodCount > 0 && (
                <div
                  style={{ width: `${getPercent(goodCount)}%` }}
                  className="bg-[#a4e804] transition-all duration-300"
                />
              )}
              {mediocreCount > 0 && (
                <div
                  style={{ width: `${getPercent(mediocreCount)}%` }}
                  className="bg-[#ff9f0a] transition-all duration-300"
                />
              )}
              {badCount > 0 && (
                <div
                  style={{ width: `${getPercent(badCount)}%` }}
                  className="bg-[#ff453a] rounded-r-full transition-all duration-300"
                />
              )}
            </div>

            {/* Apple Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 text-[12px] pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04]">
                <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#30d158]" />
                  Excelente
                </span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">{getPercent(excellentCount)}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04]">
                <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#a4e804]" />
                  Bueno
                </span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">{getPercent(goodCount)}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04]">
                <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" />
                  Moderado
                </span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">{getPercent(mediocreCount)}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04]">
                <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="w-2 h-2 rounded-full bg-[#ff453a]" />
                  Evitar
                </span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">{getPercent(badCount)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Apple Inset Grouped Scan History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
            <History size={13} />
            <span>Historial de Escaneos</span>
          </span>
          {scanHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-[#86868b] hover:text-[#ff453a] transition"
            >
              Borrar
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <div className="text-center py-8 text-[12px] text-[#86868b] bg-white dark:bg-[#1c1c1e] rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            Sin escaneos registrados
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06] shadow-sm">
            {scanHistory.map((prod, index) => {
              const ev = evaluateProduct(prod, userProfile);
              const catKey = classifyProductCategory(prod);
              const meta = PRODUCT_CATEGORIES[catKey];
              return (
                <button
                  key={`${prod.barcode}-${index}`}
                  type="button"
                  onClick={() => onSelectProduct(prod)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition text-left active:bg-black/[0.06] dark:active:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 rounded-xl object-contain bg-[#f2f2f7] dark:bg-black p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#f2f2f7] dark:bg-black flex items-center justify-center text-[#86868b] shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                        <History size={16} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] truncate">
                        <span>{prod.brands}</span>
                        <span>•</span>
                        <span className="font-medium inline-flex items-center gap-0.5">
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${ev.score.tierColor}20`,
                        color: ev.score.tierColor,
                      }}
                    >
                      {ev.score.total}/100
                    </span>
                    <ChevronRight size={15} className="text-[#86868b]" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
