import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  UserProfile,
  ScannedProduct,
  ProductEvaluation,
  CartItem,
  HealthySwap,
  AuthUser,
} from './types';
import { evaluateProduct } from './utils/scoringEngine';
import { fetchProductByBarcode } from './services/openFoodFacts';
import { AppHeader } from './components/common/AppHeader';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { PaywallModal } from './components/common/PaywallModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { getCurrentUser, logoutUser } from './services/authService';
import { trackScanEvent, trackSwapSelected, trackCartAdd } from './services/analyticsService';
import { LiveCameraScanner } from './components/scanner/LiveCameraScanner';
import { ProductSearch } from './components/scanner/ProductSearch';
import { IngredientOcrScanner } from './components/scanner/IngredientOcrScanner';
import { RecentScans } from './components/scanner/RecentScans';
import { DailyRecommendationCard } from './components/daily/DailyRecommendationCard';
import { ProductRadiographyModal } from './components/product/ProductRadiographyModal';
import { InstallAppModal } from './components/common/InstallAppModal';
import { CartView } from './components/cart/CartView';
import { StatsView } from './components/stats/StatsView';
import { ProfileView } from './components/profile/ProfileView';
import { Camera, Search, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FALLBACK_DEMO_PRODUCTS } from './utils/fallbackProducts';
import { useTheme } from './hooks/useTheme';

const DEFAULT_PROFILE: UserProfile = {
  hasCompletedOnboarding: false,
  goals: ['clean_eating'],
  allergens: [],
  blacklistedIngredients: ['palm_oil'],
  isPro: false,
  freeScansRemaining: 20,
  createdAt: new Date().toISOString(),
};

export function App() {
  const [theme, toggleTheme] = useTheme();
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    'nutriradar_profile',
    DEFAULT_PROFILE
  );

  const [scanHistory, setScanHistory] = useLocalStorage<ScannedProduct[]>(
    'nutriradar_history',
    []
  );

  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    'nutriradar_cart',
    []
  );

  const [activeTab, setActiveTab] = useState<NavTab>('scan');
  const [scannerMode, setScannerMode] = useState<'camera' | 'search' | 'ocr'>('search');

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!userProfile.hasCompletedOnboarding);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [activeEvaluation, setActiveEvaluation] = useState<ProductEvaluation | null>(null);

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sharedToastMessage, setSharedToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile.hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    }
    // One-time upgrade to 20 free trial scans for existing users
    const hasApplied20Grant = localStorage.getItem('maruca_20_scans_granted_v1');
    if (!hasApplied20Grant) {
      localStorage.setItem('maruca_20_scans_granted_v1', 'true');
      if (!userProfile.isPro && userProfile.freeScansRemaining < 20) {
        setUserProfile((prev) => ({
          ...prev,
          freeScansRemaining: 20,
        }));
      }
    }
    // Sincronizar sesión de usuario guardada y privilegios de admin
    const savedUser = getCurrentUser();
    if (savedUser) {
      const isDawsson = savedUser.username.toLowerCase() === 'dawsson';
      setUserProfile((prev) => ({
        ...prev,
        userAccount: { ...savedUser, isAdmin: isDawsson || savedUser.isAdmin },
        isPro: isDawsson ? true : prev.isPro,
        freeScansRemaining: isDawsson ? 99999 : prev.freeScansRemaining,
      }));
    }

    // Detección de pago completado en Stripe (?payment=success o ?pro=true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success' || urlParams.get('pro') === 'true') {
        setUserProfile((prev) => ({
          ...prev,
          isPro: true,
          freeScansRemaining: 99999,
        }));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {}

    // Saneamiento proactivo de URLs de imágenes de productos guardados en el historial y carrito
    const healProduct = (p: ScannedProduct): ScannedProduct => {
      const name = (p.name || '').toLowerCase();
      const currentUrl = p.imageUrl || '';
      const isBrokenOffUrl =
        currentUrl.includes('images.openfoodfacts.org') &&
        (currentUrl.includes('365.400') ||
          currentUrl.includes('500.400') ||
          currentUrl.includes('389.400') ||
          currentUrl.includes('18.400') ||
          currentUrl.includes('25.400') ||
          currentUrl.includes('36.400') ||
          currentUrl.includes('41.400'));

      let newUrl = p.imageUrl;
      if (p.barcode === '3017620422003' || name.includes('nutella')) {
        newUrl = 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.400.jpg';
      } else if (p.barcode === '5449000000996' || (name.includes('coca') && !name.includes('zero'))) {
        newUrl = 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.400.jpg';
      } else if (p.barcode === '5449000131805' || (name.includes('coca') && name.includes('zero'))) {
        newUrl = 'https://images.openfoodfacts.org/images/products/544/900/013/1805/front_en.810.400.jpg';
      } else if (p.barcode === '8410076472052' || name.includes('avena')) {
        newUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80';
      } else if (p.barcode === '8410069000101' || name.includes('solís') || name.includes('tomate frito')) {
        newUrl = 'https://images.openfoodfacts.org/images/products/841/006/900/0101/front_es.5.400.jpg';
      } else if (p.barcode === '8480000105042' || name.includes('pavo')) {
        newUrl = 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80';
      } else if (p.barcode === '8480000340269' || name.includes('gazpacho')) {
        newUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80';
      } else if (isBrokenOffUrl) {
        newUrl = undefined;
      }

      if (newUrl !== p.imageUrl) {
        return { ...p, imageUrl: newUrl };
      }
      return p;
    };

    setScanHistory((prev) => {
      let changed = false;
      const healed = prev.map((p) => {
        const h = healProduct(p);
        if (h !== p) changed = true;
        return h;
      });
      return changed ? healed : prev;
    });

    setCartItems((prev) => {
      let changed = false;
      const healed = prev.map((item) => {
        const h = healProduct(item.product);
        if (h !== item.product) {
          changed = true;
          return { ...item, product: h };
        }
        return item;
      });
      return changed ? healed : prev;
    });

    // Detección y sincronización automática de producto compartido por enlace
    // (?barcode= o ?product= o ?p= o ?sharedData= o ?sharedProduct=)
    const handleSharedProductDeepLink = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const barcodeParam = urlParams.get('barcode') || urlParams.get('product') || urlParams.get('p');
        const sharedDataParam = urlParams.get('sharedData') || urlParams.get('sharedProduct');

        if (!barcodeParam && !sharedDataParam) return;

        // Limpiar parámetros de la URL inmediatamente para evitar ejecuciones repetidas
        window.history.replaceState({}, document.title, window.location.pathname);

        // Si se abre un producto compartido, permitir ver el producto sin bloqueo de onboarding
        setIsOnboardingOpen(false);
        setActiveTab('scan');
        setIsLoadingProduct(true);

        let targetProduct: ScannedProduct | null = null;

        // 1. Si viene con datos serializados en el enlace
        if (sharedDataParam) {
          try {
            const json = decodeURIComponent(escape(atob(sharedDataParam)));
            const parsed = JSON.parse(json);
            if (parsed && parsed.name) {
              targetProduct = parsed;
            }
          } catch (e) {
            console.warn('No se pudo decodificar datos del producto compartido:', e);
          }
        }

        // 2. Si hay código de barras, obtener desde Open Food Facts o catálogo local
        if (!targetProduct && barcodeParam) {
          try {
            targetProduct = await fetchProductByBarcode(barcodeParam);
          } catch (err: any) {
            console.error('Error cargando producto compartido por código de barras:', err);
            setErrorMessage(`No se pudo cargar el producto compartido (${barcodeParam})`);
          }
        }

        if (targetProduct) {
          const finalProduct = healProduct(targetProduct);
          const withTimestamp: ScannedProduct = {
            ...finalProduct,
            timestamp: Date.now(),
          };

          // AÑADIR AUTOMÁTICAMENTE AL HISTORIAL DE LA OTRA PERSONA
          setScanHistory((prev) => {
            const filtered = prev.filter((p) => p.barcode !== withTimestamp.barcode);
            return [withTimestamp, ...filtered].slice(0, 50);
          });

          // Evaluar y abrir la radiografía del producto
          const evaluation = evaluateProduct(withTimestamp, userProfile);
          setActiveEvaluation(evaluation);
          trackScanEvent(withTimestamp, evaluation, userProfile.userAccount);

          // Notificación visual de confirmación
          setSharedToastMessage(`🥑 ¡«${withTimestamp.name}» añadido a tu historial!`);
          setTimeout(() => setSharedToastMessage(null), 5000);
        }
      } catch (err) {
        console.error('Error procesando producto compartido:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    handleSharedProductDeepLink();

    // Escuchar evento de instalación PWA (Chrome, Edge, Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detección de primera visita para ofrecer crear acceso directo / WebApp
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const hasSeenInstallPrompt = localStorage.getItem('maruca_pwa_prompt_v1');

    let installTimer: any = null;
    if (!isStandalone && !hasSeenInstallPrompt) {
      if (userProfile.hasCompletedOnboarding) {
        installTimer = setTimeout(() => {
          setIsInstallModalOpen(true);
        }, 1500);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (installTimer) clearTimeout(installTimer);
    };
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    const isDawsson = user.username.toLowerCase() === 'dawsson' || user.isAdmin;
    setUserProfile((prev) => ({
      ...prev,
      userAccount: { ...user, isAdmin: isDawsson },
      isPro: isDawsson ? true : prev.isPro,
      freeScansRemaining: isDawsson ? 99999 : (prev.freeScansRemaining || 20),
    }));
  };

  const handleLogout = () => {
    logoutUser();
    setUserProfile((prev) => ({
      ...prev,
      userAccount: null,
    }));
  };

  const checkCanScan = (): boolean => {
    if (userProfile.isPro) return true;
    if (userProfile.freeScansRemaining > 0) {
      setUserProfile((prev) => ({
        ...prev,
        freeScansRemaining: Math.max(0, prev.freeScansRemaining - 1),
      }));
      return true;
    }
    setIsPaywallOpen(true);
    return false;
  };

  const handleInspectProduct = (product: ScannedProduct) => {
    const evaluation = evaluateProduct(product, userProfile);
    setActiveEvaluation(evaluation);
    trackScanEvent(product, evaluation, userProfile.userAccount);

    setScanHistory((prev) => {
      const filtered = prev.filter((p) => p.barcode !== product.barcode);
      const withTimestamp: ScannedProduct = {
        ...product,
        timestamp: Date.now(),
      };
      return [withTimestamp, ...filtered].slice(0, 50);
    });
  };

  const handleRemoveFromHistory = (barcode: string) => {
    setScanHistory((prev) => prev.filter((p) => p.barcode !== barcode));
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (!checkCanScan()) return;

    setIsLoadingProduct(true);
    setErrorMessage(null);

    try {
      const product = await fetchProductByBarcode(barcode);
      handleInspectProduct(product);
    } catch (err: any) {
      console.error('Error obteniendo producto:', err);
      setErrorMessage(err?.message || `No se pudo obtener información del producto (${barcode})`);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleSelectProduct = (product: ScannedProduct) => {
    if (!checkCanScan()) return;
    handleInspectProduct(product);
  };

  const handleSelectSwap = async (swap: HealthySwap) => {
    trackSwapSelected(activeEvaluation?.product.name || 'Producto', swap, userProfile.userAccount);
    try {
      setIsLoadingProduct(true);
      const product = await fetchProductByBarcode(swap.barcode);
      handleInspectProduct(product);
    } catch (e) {
      const synthProduct: ScannedProduct = {
        barcode: swap.barcode,
        name: swap.name,
        brands: swap.brand,
        imageUrl: swap.imageUrl,
        quantity: 'Ración fresca',
        categories: ['Comida Real', 'NOVA 1', 'Alternativa Saludable'],
        nutriscoreGrade: 'a',
        novaGroup: (swap.novaGroup as any) || 1,
        nutriments: {
          energyKcal: 120,
          fat: 1.8,
          saturatedFat: 0.3,
          carbohydrates: 14,
          sugars: Math.max(0.5, (activeEvaluation?.product.nutriments.sugars || 10) - (swap.sugarDiffGrams || 6)),
          fiber: 4.8,
          proteins: (activeEvaluation?.product.nutriments.proteins || 5) + (swap.proteinDiffGrams || 5),
          salt: 0.05,
        },
        ingredientsText: `Alternativa 100% limpia recomendada por Maruca: ${swap.name}.`,
        allergensTags: [],
        tracesTags: [],
        additivesTags: [],
        hasPalmOil: false,
        timestamp: Date.now(),
      };
      handleInspectProduct(synthProduct);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleAddToCart = (newItem: CartItem) => {
    trackCartAdd(newItem.product.name, newItem.product.categories?.[0] || 'Comidas', userProfile.userAccount);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.barcode === newItem.product.barcode);
      if (existing) {
        return prev.map((item) =>
          item.product.barcode === newItem.product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (prev.length >= 15) {
        setErrorMessage('Has alcanzado el límite máximo de 15 productos en tu cesta.');
        return prev;
      }
      return [newItem, ...prev];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleActivatePro = () => {
    setUserProfile((prev) => ({
      ...prev,
      isPro: true,
      freeScansRemaining: 9999,
    }));
  };

  const handleResetOnboarding = () => {
    setUserProfile(DEFAULT_PROFILE);
    setIsOnboardingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-sans selection:bg-[#30d158] selection:text-black transition-colors duration-200">
      {/* Apple Frosted Glass Header */}
      <AppHeader
        userProfile={userProfile}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-24">
        {/* Banner de Confirmación: Producto Compartido Añadido al Historial */}
        {sharedToastMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#30d158]/15 border border-[#30d158]/30 flex items-center justify-between gap-3 text-[12px] text-[#1d1d1f] dark:text-white shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={16} className="text-[#30d158] shrink-0" />
              <span className="truncate font-semibold">{sharedToastMessage}</span>
            </div>
            <button
              onClick={() => setSharedToastMessage(null)}
              className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white shrink-0 text-sm px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Apple Alert Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#ff453a]/12 border border-[#ff453a]/25 flex items-center justify-between gap-3 text-[12px] text-[#ff453a] dark:text-white">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={15} className="text-[#ff453a] shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white shrink-0 text-sm px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Apple Centered Loading Spinner */}
        {isLoadingProduct && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xl">
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] flex flex-col items-center gap-3 shadow-2xl">
              <Loader2 size={32} className="text-[#30d158] animate-spin" />
              <span className="text-[12px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                Obteniendo información...
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: Escanear */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            {/* Apple Segmented Control Pill */}
            <div className="flex p-1 rounded-full bg-black/[0.06] dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] text-[12px] font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setScannerMode('search')}
                className={`flex-1 py-1.5 px-2 rounded-full transition flex items-center justify-center gap-1.5 ${
                  scannerMode === 'search'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <Search size={14} />
                <span>Buscador y Muestras</span>
              </button>

              <button
                type="button"
                onClick={() => setScannerMode('camera')}
                className={`flex-1 py-1.5 px-2 rounded-full transition flex items-center justify-center gap-1.5 ${
                  scannerMode === 'camera'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <Camera size={14} />
                <span>Cámara de Barras</span>
              </button>

              <button
                type="button"
                onClick={() => setScannerMode('ocr')}
                className={`flex-1 py-1.5 px-2 rounded-full transition flex items-center justify-center gap-1.5 ${
                  scannerMode === 'ocr'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                <span>Etiqueta con IA</span>
              </button>
            </div>

            {scannerMode === 'camera' && (
              <LiveCameraScanner
                onBarcodeDetected={handleBarcodeDetected}
                isScanningActive={activeTab === 'scan' && scannerMode === 'camera'}
                onError={(err) => setErrorMessage(err)}
              />
            )}

            {scannerMode === 'search' && (
              <ProductSearch
                onSelectBarcode={handleBarcodeDetected}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {scannerMode === 'ocr' && (
              <IngredientOcrScanner
                onParsedProduct={handleSelectProduct}
              />
            )}

            {/* Recomendación Nutricional Diaria con IA de Gemini */}
            <DailyRecommendationCard
              userProfile={userProfile}
              onAddToCart={handleAddToCart}
            />

            {/* Historial Permanente de Objetos Escaneados */}
            <RecentScans
              scanHistory={scanHistory}
              userProfile={userProfile}
              onSelectProduct={handleInspectProduct}
              onRemoveFromHistory={handleRemoveFromHistory}
              onClearHistory={() => setScanHistory([])}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {/* Tab 2: Cesta de la Compra */}
        {activeTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onOpenProduct={(item) => setActiveEvaluation(item.evaluation)}
          />
        )}

        {/* Tab 3: Estadísticas & Salud */}
        {activeTab === 'stats' && (
          <StatsView
            scanHistory={scanHistory}
            userProfile={userProfile}
            onSelectProduct={handleInspectProduct}
            onClearHistory={() => setScanHistory([])}
          />
        )}

        {/* Tab 4: Cuenta & Ajustes */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={userProfile}
            onUpdateProfile={setUserProfile}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onLogout={handleLogout}
            onResetOnboarding={handleResetOnboarding}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>

      {/* Apple Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
      />

      {/* Product Radiography Sheet */}
      {activeEvaluation && (
        <ProductRadiographyModal
          evaluation={activeEvaluation}
          onClose={() => setActiveEvaluation(null)}
          onAddToCart={handleAddToCart}
          onSelectSwap={handleSelectSwap}
          userProfile={userProfile}
        />
      )}

      {/* Onboarding Assistant */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newProfile) => {
          setUserProfile(newProfile);
          setIsOnboardingOpen(false);
          const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
          const hasSeenInstallPrompt = localStorage.getItem('maruca_pwa_prompt_v1');
          if (!isStandalone && !hasSeenInstallPrompt) {
            setTimeout(() => {
              setIsInstallModalOpen(true);
            }, 800);
          }
        }}
      />

      {/* Apple In-App Purchase Paywall */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onActivatePro={handleActivatePro}
        freeScansRemaining={userProfile.freeScansRemaining}
        onContinueFree={() => setIsPaywallOpen(false)}
      />

      {/* Auth Modal (Login & Registro) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Admin Dashboard & Telemetría */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminUsername={userProfile.userAccount?.username}
      />

      {/* WebApp Desktop / PWA Install Prompt Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
}
export default App;
