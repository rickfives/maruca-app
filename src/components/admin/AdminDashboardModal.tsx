import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BarChart3,
  Scan,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Download,
  X,
  Search,
  ShieldCheck,
  Crown,
  Activity,
  ArrowRight,
  RefreshCw,
  Flame,
  CheckCircle,
  Apple,
  Coffee,
  PieChart,
} from 'lucide-react';
import { ZeldaHeart } from '../common/ZeldaHeart';
import {
  getTelemetryDashboardData,
  exportTelemetryJSON,
  getTelemetryEvents,
} from '../../services/analyticsService';
import { TelemetryDashboardData } from '../../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUsername?: string;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminUsername = 'dawsson',
}) => {
  const [data, setData] = useState<TelemetryDashboardData>(() => getTelemetryDashboardData());
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'health' | 'feed' | 'insights'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(getTelemetryDashboardData());
      setIsRefreshing(false);
    }, 400);
  };

  const handleExport = () => {
    const jsonString = exportTelemetryJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maruca_analitica_admin_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#1c1c1e] border border-black/[0.1] dark:border-white/[0.14] rounded-[32px] shadow-2xl overflow-hidden text-[#1d1d1f] dark:text-white"
      >
        {/* Apple Modal Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.05] dark:bg-black/60 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center shrink-0 shadow-sm">
              <ZeldaHeart size={22} glow />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                  Panel de Control & Analítica
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#bf5af2]/15 text-[#bf5af2] border border-[#bf5af2]/30 flex items-center gap-1">
                  <Crown size={10} />
                  Admin
                </span>
              </div>
              <p className="text-[12px] text-[#86868b]">
                Sesión: <span className="font-semibold text-[#1d1d1f] dark:text-white">@{adminUsername}</span> • Telemetría y comportamiento en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleRefresh}
              title="Actualizar datos"
              className="p-2 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#30d158]' : ''} />
            </button>
            <button
              onClick={handleExport}
              title="Descargar informe en JSON"
              className="px-3 py-1.5 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/20 border border-[#0071e3]/30 text-[#0071e3] dark:text-[#64d2ff] font-semibold text-[12px] flex items-center gap-1.5 transition"
            >
              <Download size={13} />
              <span className="hidden sm:inline">
                {downloadSuccess ? '¡Descargado!' : 'Exportar JSON'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Apple Segmented Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-1 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none text-[12px] font-semibold">
            {[
              { id: 'overview', label: 'Resumen & Usuarios', icon: Users },
              { id: 'products', label: 'Qué Escanean', icon: Scan },
              { id: 'health', label: 'Salud & Alérgenos', icon: AlertTriangle },
              { id: 'feed', label: 'Actividad en Vivo', icon: Activity },
              { id: 'insights', label: 'Claves de Mejora', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1.5 px-3 rounded-full transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RESUMEN GENERAL & USUARIOS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#86868b] mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Personas Usando</span>
                    <Users size={14} className="text-[#0071e3]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-[#1d1d1f] dark:text-white">
                    {data.activeUsersCount}
                  </div>
                  <div className="text-[11px] text-[#30d158] font-medium mt-0.5">
                    ● En línea y activos
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#86868b] mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Escaneos Totales</span>
                    <Scan size={14} className="text-[#30d158]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-[#1d1d1f] dark:text-white">
                    {data.totalScansCount}
                  </div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">
                    Alimentos analizados
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#86868b] mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Cuentas Creadas</span>
                    <ShieldCheck size={14} className="text-[#bf5af2]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-[#1d1d1f] dark:text-white">
                    {data.registeredUsersCount}
                  </div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">
                    +{data.guestUsersCount} invitados anónimos
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#86868b] mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Suscripción Pro</span>
                    <Crown size={14} className="text-[#ff9f0a]" />
                  </div>
                  <div className="text-[26px] font-extrabold tracking-tight text-[#1d1d1f] dark:text-white">
                    {data.proUsersCount}
                  </div>
                  <div className="text-[11px] text-[#30d158] font-medium mt-0.5">
                    Escaneos ilimitados
                  </div>
                </div>
              </div>

              {/* Usuarios Desglose Card */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    Distribución de Personas en Maruca
                  </h3>
                  <span className="text-[11px] text-[#86868b]">Base de 20 escaneos gratis</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#1d1d1f] dark:text-white">
                        Visitantes Invitados (Con prueba de 20 escaneos)
                      </span>
                      <span className="font-semibold text-[#86868b]">
                        {data.guestUsersCount} ({Math.round((data.guestUsersCount / data.activeUsersCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] rounded-full"
                        style={{ width: `${(data.guestUsersCount / data.activeUsersCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#1d1d1f] dark:text-white">
                        Usuarios Registrados con Contraseña
                      </span>
                      <span className="font-semibold text-[#86868b]">
                        {data.registeredUsersCount} ({Math.round((data.registeredUsersCount / data.activeUsersCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#30d158] rounded-full"
                        style={{ width: `${(data.registeredUsersCount / data.activeUsersCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#1d1d1f] dark:text-white">
                        Usuarios Convertidos a Maruca Pro
                      </span>
                      <span className="font-semibold text-[#86868b]">
                        {data.proUsersCount} ({Math.round((data.proUsersCount / data.activeUsersCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#bf5af2] rounded-full"
                        style={{ width: `${(data.proUsersCount / data.activeUsersCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorías más populares preview */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    ¿Qué categorías buscan más los usuarios?
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-[12px] text-[#0071e3] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Ver detalle</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {data.categoryBreakdown.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.06] text-center"
                    >
                      <div className="text-[11px] font-semibold text-[#86868b]">{cat.category}</div>
                      <div className="text-[18px] font-bold text-[#1d1d1f] dark:text-white mt-0.5">
                        {cat.percentage}%
                      </div>
                      <div className="text-[10px] text-[#86868b]">{cat.count} escaneos</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUÉ ESCANEAN (PRODUCTOS Y CATEGORÍAS) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Ranking Top Productos */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                      Ranking de Productos Más Escaneados
                    </h3>
                    <p className="text-[12px] text-[#86868b]">
                      Alimentos que más preocupan o interesan a los usuarios en tiendas
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#30d158]/15 text-[#30d158]">
                    Top Frecuencia
                  </span>
                </div>

                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] pt-1">
                  {data.topScannedProducts.slice(0, 8).map((prod, idx) => (
                    <div key={prod.barcode + idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-[13px] font-bold text-[#86868b] shrink-0 text-center">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">
                            {prod.productName}
                          </div>
                          <div className="text-[11px] text-[#86868b] truncate">
                            {prod.brand} • {prod.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Nutriscore & Nova Tag */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ['A', 'B'].includes(prod.nutriScore)
                              ? 'bg-[#30d158]/15 text-[#30d158]'
                              : ['D', 'E'].includes(prod.nutriScore)
                              ? 'bg-[#ff453a]/15 text-[#ff453a]'
                              : 'bg-[#ff9f0a]/15 text-[#ff9f0a]'
                          }`}
                        >
                          Nutri {prod.nutriScore}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            prod.novaGroup === 4
                              ? 'bg-[#ff453a]/15 text-[#ff453a]'
                              : 'bg-[#30d158]/15 text-[#30d158]'
                          }`}
                        >
                          NOVA {prod.novaGroup}
                        </span>

                        <span className="font-bold text-[13px] text-[#1d1d1f] dark:text-white min-w-[50px] text-right">
                          {prod.scansCount} esc.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Búsquedas más tecleadas */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-[#0071e3]" />
                  <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    Términos Más Buscados en el Buscador
                  </h3>
                </div>
                <p className="text-[12px] text-[#86868b]">
                  Indica qué alimentos busca la gente antes de ir al supermercado
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {data.popularSearches.map((s) => (
                    <div
                      key={s.query}
                      className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.06] text-[12px] flex items-center gap-2 shadow-xs"
                    >
                      <span className="font-medium text-[#1d1d1f] dark:text-white">"{s.query}"</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/10 text-[#86868b]">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALUD & ALÉRGENOS */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              {/* Termómetro de Ultraprocesados */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                      Radiografía Nutricional Colectiva
                    </h3>
                    <p className="text-[12px] text-[#86868b]">
                      Proporción de comida real vs ultraprocesados que escanea la comunidad
                    </p>
                  </div>
                  <span className="text-[18px] font-black text-[#ff453a]">
                    {data.healthMetrics.ultraprocessedPercentage}% NOVA 4
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-4 rounded-full bg-black/10 dark:bg-white/10 flex overflow-hidden">
                    <div
                      className="h-full bg-[#ff453a] transition-all"
                      style={{ width: `${data.healthMetrics.ultraprocessedPercentage}%` }}
                      title={`Ultraprocesados: ${data.healthMetrics.ultraprocessedPercentage}%`}
                    />
                    <div
                      className="h-full bg-[#30d158] transition-all"
                      style={{ width: `${data.healthMetrics.cleanEatingPercentage}%` }}
                      title={`Comida Real: ${data.healthMetrics.cleanEatingPercentage}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-[#ff453a]">
                      ● {data.healthMetrics.ultraprocessedPercentage}% Ultraprocesados (NOVA 4)
                    </span>
                    <span className="text-[#30d158]">
                      ● {data.healthMetrics.cleanEatingPercentage}% Comida Limpia (NOVA 1-2)
                    </span>
                  </div>
                </div>

                {/* Peores alimentos frecuentes */}
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <div className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
                    Productos No Saludables Más Frecuentes
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.healthMetrics.mostCommonUnhealthyProducts.map((p, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/20 text-[12px] text-[#ff453a] dark:text-white font-medium flex items-center gap-2"
                      >
                        <AlertTriangle size={14} className="text-[#ff453a] shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alérgenos Más Activados */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    Alérgenos y Restricciones Más Críticas
                  </h3>
                  <span className="text-[11px] text-[#86868b]">Alertas rojas generadas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {data.allergenStats.map((al) => (
                    <div
                      key={al.allergen}
                      className="p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between shadow-xs"
                    >
                      <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">
                        {al.label}
                      </span>
                      <span className="text-[13px] font-bold text-[#ff453a] bg-[#ff453a]/10 px-2 py-0.5 rounded-full">
                        {al.alertsTriggered} alertas
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternativas Saludables (Swaps) Más Exitosos */}
              <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#30d158]" />
                  <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    Alternativas Saludables que la Gente Elige (Swaps)
                  </h3>
                </div>
                <div className="space-y-2">
                  {data.healthMetrics.topRecommendedSwaps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3 text-[12px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#ff453a] line-through font-medium truncate">{s.original}</span>
                        <ArrowRight size={13} className="text-[#86868b] shrink-0" />
                        <span className="text-[#30d158] font-bold truncate">{s.swap}</span>
                      </div>
                      <span className="text-[#86868b] font-semibold shrink-0">
                        {s.count} veces elegida
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVIDAD EN VIVO (LIVE FEED) */}
          {activeTab === 'feed' && (
            <div className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                    Registro de Eventos en Tiempo Real
                  </h3>
                  <p className="text-[12px] text-[#86868b]">
                    Cada escaneo, búsqueda y alternativa elegida por cualquier persona
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#30d158] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#30d158] animate-ping" />
                  <span>En directo</span>
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-black/[0.06] dark:divide-white/[0.06] pt-1">
                {data.recentActivityFeed.map((evt) => (
                  <div key={evt.id} className="pt-2.5 flex items-start justify-between gap-3 text-[12px]">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        {evt.type === 'scan' ? (
                          <Scan size={14} className="text-[#0071e3]" />
                        ) : evt.type === 'search' ? (
                          <Search size={14} className="text-[#ff9f0a]" />
                        ) : evt.type === 'swap_selected' ? (
                          <Sparkles size={14} className="text-[#30d158]" />
                        ) : evt.type === 'allergen_alert' ? (
                          <AlertTriangle size={14} className="text-[#ff453a]" />
                        ) : (
                          <Activity size={14} className="text-[#bf5af2]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium text-[#1d1d1f] dark:text-white">
                          <span className="text-[#86868b]">{evt.username || 'Visitante'}: </span>
                          {evt.type === 'scan' && (
                            <>
                              Escaneó <span className="font-bold">{evt.data.productName}</span> ({evt.data.category})
                            </>
                          )}
                          {evt.type === 'search' && (
                            <>
                              Buscó <span className="font-bold">"{evt.data.searchQuery}"</span>
                            </>
                          )}
                          {evt.type === 'swap_selected' && (
                            <>
                              Aceptó alternativa: <span className="font-bold text-[#30d158]">{evt.data.swapTarget}</span> en vez de {evt.data.swapOriginal}
                            </>
                          )}
                          {evt.type === 'allergen_alert' && (
                            <span className="text-[#ff453a] font-bold">
                              Alerta de alérgeno en {evt.data.productName} ({evt.data.allergensFound?.join(', ')})
                            </span>
                          )}
                          {evt.type === 'cart_add' && (
                            <>
                              Añadió a cesta: <span className="font-bold">{evt.data.productName}</span>
                            </>
                          )}
                        </div>

                        {evt.data.nutriScore && (
                          <div className="text-[11px] text-[#86868b] mt-0.5 flex items-center gap-2">
                            <span>NutriScore {evt.data.nutriScore}</span>
                            <span>•</span>
                            <span>NOVA {evt.data.novaGroup}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-[#86868b] shrink-0">
                      {formatTimeAgo(evt.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLAVES DE MEJORA PARA MARUCA */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center gap-3">
                <Sparkles size={22} className="text-[#0071e3] shrink-0" />
                <div className="text-[12px] text-[#1d1d1f] dark:text-white leading-relaxed">
                  <span className="font-bold">Motor de Optimización Maruca AI:</span> Recomendaciones automáticas generadas a partir del comportamiento real de los usuarios en la web para maximizar el valor del producto y la retención.
                </div>
              </div>

              <div className="space-y-3">
                {data.aiActionableInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-5 rounded-2xl bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            insight.impact === 'high'
                              ? 'bg-[#ff453a]'
                              : insight.impact === 'medium'
                              ? 'bg-[#ff9f0a]'
                              : 'bg-[#30d158]'
                          }`}
                        />
                        <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white">
                          {insight.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/10 text-[#86868b]">
                        Impacto {insight.impact}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#86868b] leading-relaxed">
                      {insight.description}
                    </p>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.06] text-[12px] flex items-start gap-2 text-[#1d1d1f] dark:text-white">
                      <CheckCircle size={15} className="text-[#30d158] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Acción Recomendada: </span>
                        <span>{insight.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-[#86868b]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#30d158]" />
            <span>Datos locales protegidos. Solo visible para el administrador @dawsson.</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold transition"
          >
            Cerrar Panel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
