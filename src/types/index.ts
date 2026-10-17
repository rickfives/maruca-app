export type HealthGoal = 
  | 'clean_eating'        // Comer limpio y evitar ultraprocesados (NOVA 4)
  | 'fat_loss'            // Perder grasa / Control de calorías y azúcares
  | 'muscle_gain'         // Ganar masa muscular (Priorizar proteína)
  | 'gut_health';         // Digestión sana y control de inflamación / aditivos

export type AllergenKey = 
  | 'gluten' 
  | 'lactose' 
  | 'nuts' 
  | 'peanuts'
  | 'soy' 
  | 'egg' 
  | 'seafood' 
  | 'vegan' 
  | 'vegetarian';

export type BlacklistIngredient = 
  | 'palm_oil'            // Aceite de palma
  | 'artificial_sweeteners' // Aspartamo, Acesulfamo K, Sucralosa
  | 'added_sugars'        // Azúcares añadidos / Jarabe de glucosa-fructosa
  | 'msg_nitrites';       // E621 y Nitritos E249-E252

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatarColor?: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface TelemetryEvent {
  id: string;
  type: 'scan' | 'search' | 'swap_selected' | 'cart_add' | 'allergen_alert' | 'user_register';
  timestamp: number;
  userId?: string;
  username?: string;
  data: {
    productName?: string;
    barcode?: string;
    brand?: string;
    category?: string;
    nutriScore?: string;
    novaGroup?: number;
    isHealthy?: boolean;
    allergensFound?: string[];
    swapOriginal?: string;
    swapTarget?: string;
    searchQuery?: string;
    resultsCount?: number;
  };
}

export interface TelemetryDashboardData {
  activeUsersCount: number;
  registeredUsersCount: number;
  guestUsersCount: number;
  proUsersCount: number;
  totalScansCount: number;
  topScannedProducts: Array<{
    barcode: string;
    productName: string;
    brand: string;
    category: string;
    scansCount: number;
    nutriScore: string;
    novaGroup: number;
    isHealthy: boolean;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
    healthyCount: number;
    unhealthyCount: number;
  }>;
  healthMetrics: {
    ultraprocessedPercentage: number;
    cleanEatingPercentage: number;
    averageScore: number;
    mostCommonUnhealthyProducts: string[];
    topRecommendedSwaps: Array<{ original: string; swap: string; count: number }>;
  };
  allergenStats: Array<{
    allergen: string;
    label: string;
    alertsTriggered: number;
  }>;
  popularSearches: Array<{
    query: string;
    count: number;
  }>;
  recentActivityFeed: TelemetryEvent[];
  aiActionableInsights: Array<{
    id: string;
    type: 'opportunity' | 'alert' | 'ux' | 'growth';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }>;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  goals: HealthGoal[];
  allergens: AllergenKey[];
  blacklistedIngredients: BlacklistIngredient[];
  isPro: boolean;
  freeScansRemaining: number;
  userAccount?: AuthUser | null;
  geminiApiKey?: string;
  createdAt: string;
}

export type RiskLevel = 'safe' | 'moderate' | 'high';

export interface ENumberInfo {
  code: string;
  name: string;
  category: string;
  risk: RiskLevel;
  description: string;
  sources?: string;
}

export interface NutrientLevels {
  fat?: 'low' | 'moderate' | 'high';
  saturatedFat?: 'low' | 'moderate' | 'high';
  sugars?: 'low' | 'moderate' | 'high';
  salt?: 'low' | 'moderate' | 'high';
}

export interface ProductNutriments {
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
  sodium?: number;
  servingSize?: string;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brands: string;
  imageUrl?: string;
  quantity?: string;
  categories?: string[];
  nutriscoreGrade?: 'a' | 'b' | 'c' | 'd' | 'e';
  novaGroup?: 1 | 2 | 3 | 4;
  nutriments: ProductNutriments;
  nutrientLevels?: NutrientLevels;
  ingredientsText?: string;
  allergensTags?: string[];
  tracesTags?: string[];
  additivesTags?: string[];
  hasPalmOil?: boolean;
  timestamp?: number;
}

export interface BioAlert {
  type: 'allergen' | 'blacklist';
  title: string;
  severity: 'danger' | 'warning';
  ingredient: string;
  description: string;
}

export interface ScoreBreakdown {
  nutritionalScore: number; // 0 - 60
  novaScore: number;        // 0 - 25
  additivesScore: number;   // 0 - 15
  goalBonus: number;        // adjustments
  total: number;            // 0 - 100
  tier: 'excellent' | 'good' | 'mediocre' | 'bad';
  tierLabel: string;
  tierColor: string;
}

export interface HealthVerdict {
  type: 'positive' | 'warning' | 'danger';
  text: string;
  iconName?: string;
}

export interface HealthySwap {
  barcode: string;
  name: string;
  brand: string;
  score: number;
  imageUrl?: string;
  sugarDiffGrams?: number;
  proteinDiffGrams?: number;
  novaGroup?: number;
  reason: string;
}

export interface ProductEvaluation {
  product: ScannedProduct;
  score: ScoreBreakdown;
  bioAlerts: BioAlert[];
  isCompatible: boolean;
  verdicts: HealthVerdict[];
  detectedAdditives: ENumberInfo[];
  detectedAllergens: string[];
  sugarCubesPer100g: number;
  sugarCubesPerServing: number;
  swaps: HealthySwap[];
}

export interface CartItem {
  id: string;
  product: ScannedProduct;
  evaluation: ProductEvaluation;
  quantity: number;
  addedAt: number;
}

export interface CartAudit {
  totalItems: number;
  averageScore: number;
  nova4Percentage: number;
  totalSugarCubes: number;
  worstOffender?: CartItem;
  bestProduct?: CartItem;
  totalAdditivesAvoided?: number;
}

export interface DailyMeal {
  type: 'Desayuno' | 'Comida' | 'Merienda' | 'Cena';
  name: string;
  description: string;
  nutrients: string;
  cleanScore: number;
}

export interface DailyRecommendation {
  date: string;
  title: string;
  dailyFocus: string;
  caloriesTarget: string;
  meals: DailyMeal[];
  topIngredientsToBuy: string[];
  chefTip: string;
}

