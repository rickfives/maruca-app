import {
  ScannedProduct,
  UserProfile,
  ProductEvaluation,
  ScoreBreakdown,
  BioAlert,
  HealthVerdict,
  ENumberInfo,
  HealthySwap,
  AllergenKey,
  BlacklistIngredient,
} from '../types';
import { getAdditiveInfo } from './eNumbersDictionary';
import { getDemoProduct } from './fallbackProducts';
import { classifyProductCategory } from './productClassifier';

/**
 * Mapeo de alérgenos de usuario a patrones en tags e ingredientes
 */
const ALLERGEN_MATCHERS: Record<AllergenKey, { label: string; patterns: string[] }> = {
  gluten: {
    label: 'Gluten',
    patterns: ['gluten', 'wheat', 'trigo', 'barley', 'cebada', 'rye', 'centeno', 'oats', 'avena', 'espelta', 'kamut'],
  },
  lactose: {
    label: 'Lactosa / Lácteos',
    patterns: ['milk', 'leche', 'lactose', 'lactosa', 'cheese', 'queso', 'butter', 'mantequilla', 'whey', 'suero', 'nata'],
  },
  nuts: {
    label: 'Frutos de cáscara',
    patterns: ['nuts', 'avellana', 'hazelnut', 'almendra', 'almond', 'nuez', 'walnut', 'pistacho', 'anacardo', 'cashew'],
  },
  peanuts: {
    label: 'Cacahuetes',
    patterns: ['peanut', 'peanuts', 'cacahuete', 'cacahuate', 'maní'],
  },
  soy: {
    label: 'Soja',
    patterns: ['soy', 'soya', 'soybeans', 'soja'],
  },
  egg: {
    label: 'Huevo',
    patterns: ['egg', 'eggs', 'huevo', 'ovoproducto', 'albumina'],
  },
  seafood: {
    label: 'Pescado y Marisco',
    patterns: ['fish', 'pescado', 'crustacean', 'crustáceo', 'mollusc', 'molusco', 'marisco', 'atún', 'gamba', 'langostino'],
  },
  vegan: {
    label: 'No Apto para Veganos',
    patterns: ['milk', 'leche', 'egg', 'huevo', 'meat', 'carne', 'fish', 'pescado', 'gelatin', 'gelatina', 'honey', 'miel', 'carmine', 'cochinilla', 'e120'],
  },
  vegetarian: {
    label: 'No Apto para Vegetarianos',
    patterns: ['meat', 'carne', 'pork', 'cerdo', 'beef', 'vacuno', 'poultry', 'ave', 'fish', 'pescado', 'gelatin', 'gelatina', 'e120'],
  },
};

/**
 * Revisa alérgenos y lista negra personal del usuario
 */
export function checkBioCompatibility(
  product: ScannedProduct,
  userProfile?: UserProfile
): { bioAlerts: BioAlert[]; detectedAllergens: string[]; isCompatible: boolean } {
  const bioAlerts: BioAlert[] = [];
  const detectedAllergens: string[] = [];

  const textToScan = [
    product.name || '',
    product.ingredientsText || '',
    ...(product.allergensTags || []),
    ...(product.tracesTags || []),
    ...(product.additivesTags || []),
  ].join(' ').toLowerCase();

  // 1. Verificar alérgenos del usuario
  const userAllergens = userProfile?.allergens || [];
  for (const allergenKey of userAllergens) {
    const config = ALLERGEN_MATCHERS[allergenKey];
    if (!config) continue;

    const matched = config.patterns.some((pattern) => {
      // Búsqueda en tags de Open Food Facts (ej: en:gluten, en:milk)
      const inTags = (product.allergensTags || []).some((tag) => tag.toLowerCase().includes(pattern));
      const inTraces = (product.tracesTags || []).some((tag) => tag.toLowerCase().includes(pattern));
      const inText = textToScan.includes(pattern);
      return inTags || inTraces || inText;
    });

    if (matched) {
      detectedAllergens.push(config.label);
      bioAlerts.push({
        type: 'allergen',
        title: `Alerta Crítica: Contiene ${config.label}`,
        severity: 'danger',
        ingredient: config.label,
        description: `Este producto contiene o puede contener trazas de ${config.label}, marcado como restricción crítica en tu perfil de salud.`,
      });
    }
  }

  // 2. Verificar lista negra de ingredientes
  const blacklist = userProfile?.blacklistedIngredients || [];
  for (const item of blacklist) {
    if (item === 'palm_oil') {
      const hasPalm = product.hasPalmOil || 
        textToScan.includes('palma') || 
        textToScan.includes('palmiste') || 
        textToScan.includes('palm oil');
      if (hasPalm) {
        bioAlerts.push({
          type: 'blacklist',
          title: 'Ingrediente en Lista Negra: Aceite de Palma',
          severity: 'warning',
          ingredient: 'Aceite de Palma',
          description: 'Contiene aceite o manteca de palma, un ingrediente que has decidido excluir de tu alimentación.',
        });
      }
    }

    if (item === 'artificial_sweeteners') {
      const sweeteners = ['e950', 'e951', 'e952', 'e954', 'e955', 'aspartamo', 'acesulfamo', 'sucralosa', 'sacarina', 'ciclamato'];
      const hasSweeteners = sweeteners.some((s) => textToScan.includes(s));
      if (hasSweeteners) {
        bioAlerts.push({
          type: 'blacklist',
          title: 'Ingrediente en Lista Negra: Edulcorantes Artificiales',
          severity: 'warning',
          ingredient: 'Edulcorantes de síntesis (E950, E951, E955...)',
          description: 'Contiene edulcorantes artificiales de síntesis que alteran la microbiota y la respuesta hormonal.',
        });
      }
    }

    if (item === 'added_sugars') {
      const sugarsPatterns = ['jarabe de glucosa', 'jarabe de maiz', 'jarabe de fructosa', 'dextrosa', 'maltodextrina', 'azúcar añadido', 'azúcar blanco'];
      const hasAddedSugars = sugarsPatterns.some((s) => textToScan.includes(s)) || (product.nutriments.sugars ?? 0) > 10;
      if (hasAddedSugars) {
        bioAlerts.push({
          type: 'blacklist',
          title: 'Ingrediente en Lista Negra: Azúcares Añadidos',
          severity: 'warning',
          ingredient: 'Azúcar / Jarabes industriales',
          description: 'Producto cargado de azúcares libres o jarabes refinados añadidos industrialmente.',
        });
      }
    }

    if (item === 'msg_nitrites') {
      const msgNitrites = ['e621', 'e627', 'e631', 'e249', 'e250', 'e251', 'e252', 'glutamato', 'nitrito', 'nitrato'];
      const hasMsgNitrites = msgNitrites.some((s) => textToScan.includes(s));
      if (hasMsgNitrites) {
        bioAlerts.push({
          type: 'blacklist',
          title: 'Ingrediente en Lista Negra: Glutamato o Nitritos',
          severity: 'danger',
          ingredient: 'E621 / Nitritos E249-E252',
          description: 'Contiene conservantes cárnicos potencialmente carcinógenos (nitritos) o potenciadores excitotóxicos.',
        });
      }
    }
  }

  const isCompatible = bioAlerts.length === 0;
  return { bioAlerts, detectedAllergens, isCompatible };
}

/**
 * Motor de cálculo del Score Maruca (0 - 100)
 */
export function calculateHealthScore(
  product: ScannedProduct,
  userProfile?: UserProfile
): { breakdown: ScoreBreakdown; detectedAdditives: ENumberInfo[] } {
  const nutriments = product.nutriments || {};
  const goals = userProfile?.goals || [];

  // 1. Base Nutricional (Máx 60 pts)
  let nutritionalBase = 35; // punto medio de partida

  if (product.nutriscoreGrade) {
    switch (product.nutriscoreGrade.toLowerCase()) {
      case 'a': nutritionalBase = 56; break;
      case 'b': nutritionalBase = 46; break;
      case 'c': nutritionalBase = 34; break;
      case 'd': nutritionalBase = 20; break;
      case 'e': nutritionalBase = 8; break;
    }
  }

  // Ajustes de macronutrientes por 100g
  const sugars = nutriments.sugars ?? 0;
  if (sugars > 22.5) nutritionalBase -= 16;
  else if (sugars > 12.5) nutritionalBase -= 10;
  else if (sugars > 5.0) nutritionalBase -= 4;
  else if (sugars <= 2.0 && sugars >= 0) nutritionalBase += 3;

  const satFat = nutriments.saturatedFat ?? 0;
  if (satFat > 8.0) nutritionalBase -= 10;
  else if (satFat > 4.0) nutritionalBase -= 5;
  else if (satFat < 1.5) nutritionalBase += 2;

  const salt = nutriments.salt ?? 0;
  if (salt > 1.8) nutritionalBase -= 10;
  else if (salt > 1.2) nutritionalBase -= 6;
  else if (salt < 0.4) nutritionalBase += 3;

  const fiber = nutriments.fiber ?? 0;
  if (fiber > 6.0) nutritionalBase += 6;
  else if (fiber > 3.0) nutritionalBase += 3;

  const proteins = nutriments.proteins ?? 0;
  if (proteins > 15.0) nutritionalBase += 8;
  else if (proteins > 8.0) nutritionalBase += 4;

  const calories = nutriments.energyKcal ?? 0;
  if (calories > 480) nutritionalBase -= 5;

  nutritionalBase = Math.max(0, Math.min(60, Math.round(nutritionalBase)));

  // 2. Penalización de Ultraprocesamiento NOVA (Máx 25 pts)
  let novaScore = 15;
  const nova = product.novaGroup;
  if (nova === 1) {
    novaScore = 25; // Alimento no procesado o mínimamente procesado
  } else if (nova === 2) {
    novaScore = 20; // Ingrediente culinario
  } else if (nova === 3) {
    novaScore = 12; // Alimento procesado
  } else if (nova === 4) {
    novaScore = 0;  // Ultraprocesado
  } else {
    // Si no está registrado, inferir según aditivos
    const additiveCount = (product.additivesTags || []).length;
    if (additiveCount === 0) novaScore = 22;
    else if (additiveCount <= 2) novaScore = 14;
    else novaScore = 4;
  }

  // 3. Penalización de Aditivos y Números E (Máx 15 pts)
  let additivesScore = 15;
  const rawTags = product.additivesTags || [];
  const detectedAdditives: ENumberInfo[] = [];

  for (const tag of rawTags) {
    const info = getAdditiveInfo(tag);
    detectedAdditives.push(info);

    if (info.risk === 'high') {
      additivesScore -= 5;
    } else if (info.risk === 'moderate') {
      additivesScore -= 2.5;
    } else {
      additivesScore -= 0.5;
    }
  }
  additivesScore = Math.max(0, Math.min(15, Math.round(additivesScore)));

  // 4. Bonus según los objetivos del usuario
  let goalBonus = 0;
  if (goals.includes('muscle_gain')) {
    if (proteins >= 12) goalBonus += 4;
    else if (proteins < 3) goalBonus -= 2;
  }
  if (goals.includes('clean_eating')) {
    if (nova === 1) goalBonus += 3;
    if (nova === 4) goalBonus -= 5;
  }
  if (goals.includes('fat_loss')) {
    if (sugars < 4 && calories < 200) goalBonus += 3;
    if (sugars > 15 || calories > 400) goalBonus -= 4;
  }
  if (goals.includes('gut_health')) {
    if (detectedAdditives.some((a) => a.risk === 'high')) goalBonus -= 4;
    if (fiber >= 4) goalBonus += 3;
  }

  let total = nutritionalBase + novaScore + additivesScore + goalBonus;
  total = Math.max(1, Math.min(100, Math.round(total)));

  // Clasificación de Tiers
  let tier: 'excellent' | 'good' | 'mediocre' | 'bad' = 'mediocre';
  let tierLabel = 'Mediocre';
  let tierColor = '#f59e0b'; // Amber

  if (total >= 75) {
    tier = 'excellent';
    tierLabel = 'Excelente';
    tierColor = '#10b981'; // Emerald
  } else if (total >= 50) {
    tier = 'good';
    tierLabel = 'Bueno';
    tierColor = '#84cc16'; // Lime
  } else if (total >= 25) {
    tier = 'mediocre';
    tierLabel = 'Consumo Ocasional';
    tierColor = '#f59e0b'; // Amber
  } else {
    tier = 'bad';
    tierLabel = 'Ultraprocesado a Evitar';
    tierColor = '#f43f5e'; // Rose
  }

  const breakdown: ScoreBreakdown = {
    nutritionalScore: nutritionalBase,
    novaScore,
    additivesScore,
    goalBonus,
    total,
    tier,
    tierLabel,
    tierColor,
  };

  return { breakdown, detectedAdditives };
}

/**
 * Genera veredictos dinámicos en viñetas en Español según el producto y perfil
 */
export function generateHealthVerdicts(
  product: ScannedProduct,
  score: ScoreBreakdown,
  userProfile?: UserProfile,
  detectedAdditives: ENumberInfo[] = []
): HealthVerdict[] {
  const verdicts: HealthVerdict[] = [];
  const nutriments = product.nutriments || {};
  const sugars = nutriments.sugars ?? 0;
  const proteins = nutriments.proteins ?? 0;
  const fiber = nutriments.fiber ?? 0;
  const satFat = nutriments.saturatedFat ?? 0;
  const salt = nutriments.salt ?? 0;
  const goals = userProfile?.goals || [];

  // Veredicto de Azúcar
  if (sugars > 15) {
    const cubes = (sugars / 4).toFixed(1);
    verdicts.push({
      type: 'danger',
      text: `Contiene ${sugars}g de azúcar por 100g (equivale a ~${cubes} terrones de azúcar). Alarma glucémica alta.`,
    });
  } else if (sugars > 5) {
    verdicts.push({
      type: 'warning',
      text: `Nivel moderado de azúcares (${sugars}g/100g). Recomendable vigilar la ración si buscas perder grasa.`,
    });
  } else if (sugars <= 1) {
    verdicts.push({
      type: 'positive',
      text: `Muy bajo en azúcares (<1g/100g). Óptimo para estabilidad insulínica.`,
    });
  }

  // Veredicto de Procesamiento NOVA y Aditivos
  if (product.novaGroup === 4) {
    const highRiskAdditives = detectedAdditives.filter((a) => a.risk === 'high');
    if (highRiskAdditives.length > 0) {
      verdicts.push({
        type: 'danger',
        text: `Ultraprocesado NOVA 4 con ${highRiskAdditives.length} aditivo(s) de riesgo alto (${highRiskAdditives.map((a) => a.code).join(', ')}).`,
      });
    } else {
      verdicts.push({
        type: 'warning',
        text: `Clasificado como Ultraprocesado NOVA 4. Matriz de ingredientes alterada industrialmente.`,
      });
    }
  } else if (product.novaGroup === 1) {
    verdicts.push({
      type: 'positive',
      text: `Alimento natural o mínimamente procesado NOVA 1. Conserva su matriz celular nutritiva intacta.`,
    });
  }

  // Veredicto personalizado para objetivos
  if (goals.includes('muscle_gain') && proteins >= 12) {
    verdicts.push({
      type: 'positive',
      text: `Excelente densidad proteica (${proteins}g/100g), ideal para la síntesis proteica y tu meta muscular.`,
    });
  } else if (goals.includes('gut_health') && fiber >= 5) {
    verdicts.push({
      type: 'positive',
      text: `Aporte superior de fibra prebiótica (${fiber}g/100g) que nutre las bacterias beneficiosas de tu microbiota.`,
    });
  } else if (satFat > 6) {
    verdicts.push({
      type: 'warning',
      text: `Grasas saturadas elevadas (${satFat}g/100g). Mantener consumo moderado en dietas cardiovasculares.`,
    });
  } else if (salt > 1.5) {
    verdicts.push({
      type: 'danger',
      text: `Exceso de sal/sodio (${salt}g de sal por 100g). Supera los umbrales seguros recomendados por la OMS.`,
    });
  }

  // Si no llegamos a 3 veredictos, añadir resumen general
  if (verdicts.length < 3) {
    if (score.total >= 75) {
      verdicts.push({
        type: 'positive',
        text: `Perfil global sobresaliente (${score.total}/100). Producto biocompatible con tus hábitos saludables.`,
      });
    } else if (score.total < 40) {
      verdicts.push({
        type: 'danger',
        text: `Puntuación baja (${score.total}/100). Recomendamos sustituir por una alternativa limpia.`,
      });
    }
  }

  return verdicts.slice(0, 3);
}

/**
 * Busca alternativas saludables en el mismo rango de categoría cuando un alimento no es saludable
 */
export function findHealthySwaps(product: ScannedProduct, scoreTotal: number): HealthySwap[] {
  // Si el producto ya es excelente (>= 75) y no es ultraprocesado (NOVA 4), no requiere alternativas
  const isUnhealthy =
    scoreTotal < 70 ||
    product.novaGroup === 4 ||
    product.hasPalmOil ||
    (product.nutriments.sugars && product.nutriments.sugars > 15) ||
    (product.additivesTags && product.additivesTags.length >= 2);

  if (!isUnhealthy) return [];

  // 1. Revisar si hay swaps curados en nuestro catálogo de demo
  const demo = getDemoProduct(product.barcode);
  if (demo && demo.curatedSwaps && demo.curatedSwaps.length > 0) {
    return demo.curatedSwaps;
  }

  // 2. Determinar categoría inteligente del producto
  const categoryKey = classifyProductCategory(product);
  const nameStr = (product.name || '').toLowerCase();
  const sugars = product.nutriments.sugars || 10;

  const generatedSwaps: HealthySwap[] = [];

  switch (categoryKey) {
    case 'bebidas':
      generatedSwaps.push({
        barcode: '8437019823456',
        name: 'Agua Mineral con Gas y Rodaja de Limón Natural',
        brand: 'Bebida Limpia / San Pellegrino',
        score: 96,
        imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ae647c003?w=300&q=80',
        sugarDiffGrams: Math.round(sugars),
        novaGroup: 1,
        reason: 'Hidratación pura con burbuja natural, 0 azúcares y sin edulcorantes artificiales ni ácido fosfórico.',
      });
      generatedSwaps.push({
        barcode: '8436577881122',
        name: 'Kombucha Bio Viva Sin Azúcar Añadido',
        brand: 'Komvida / Captain Kombucha',
        score: 91,
        imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&q=80',
        sugarDiffGrams: Math.max(5, Math.round(sugars - 2)),
        novaGroup: 2,
        reason: 'Fermentada naturalmente con té verde. Probióticos vivos que repueblan tu microbiota intestinal.',
      });
      break;

    case 'salsas':
      generatedSwaps.push({
        barcode: '8410000000002',
        name: 'Tomate Triturado Tamizado 100% Natural con AOVE',
        brand: 'Mutti / Hacendado Selección',
        score: 97,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80',
        sugarDiffGrams: Math.max(3, Math.round(sugars - 2)),
        novaGroup: 1,
        reason: 'Solo tomate fresco madurado al sol y aceite de oliva virgen extra. Sin almidones ni jarabes de azúcar.',
      });
      generatedSwaps.push({
        barcode: '8437012399911',
        name: 'Guacamole Fresco Artesanal 95%+ Aguacate Real',
        brand: 'La Cocina Verde',
        score: 93,
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
        sugarDiffGrams: Math.round(sugars),
        novaGroup: 1,
        reason: 'Grasas monoinsaturadas cardiosaludables de aguacate puro con zumo de lima fresca y cilantro.',
      });
      break;

    case 'postres':
      generatedSwaps.push({
        barcode: '8436577880012',
        name: 'Crema de Cacao y Avellana 100% Real',
        brand: 'Realfooding / Natruly',
        score: 94,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80',
        sugarDiffGrams: Math.max(15, Math.round(sugars - 5)),
        proteinDiffGrams: 8,
        novaGroup: 1,
        reason: 'Elaborada únicamente con avellanas tostadas y cacao puro desgrasado. Sin aceite de palma ni azúcares añadidos.',
      });
      generatedSwaps.push({
        barcode: '8410000889922',
        name: 'Chocolate Negro 85% Cacao Puro de Origen',
        brand: 'Lindt Excellence / Valor 85%',
        score: 89,
        imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80',
        sugarDiffGrams: Math.max(10, Math.round(sugars - 14)),
        novaGroup: 2,
        reason: 'Concentrado natural de flavonoides y polifenoles antioxidantes. Mucho más saciante que el chocolate refinado.',
      });
      break;

    case 'snacks':
      generatedSwaps.push({
        barcode: '8437012345678',
        name: 'Mix de Frutos Secos Tostados al Horno Sin Sal',
        brand: 'Borges / Hacendado Natural',
        score: 98,
        imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&q=80',
        sugarDiffGrams: Math.round(sugars),
        proteinDiffGrams: 14,
        novaGroup: 1,
        reason: 'Almendras y nueces ricas en ácidos grasos Omega-3 y magnesio, sin aceites vegetales refinados ni sodio añadido.',
      });
      generatedSwaps.push({
        barcode: '8437099911223',
        name: 'Edamame al Vapor con Sal Marina y Pimentón',
        brand: 'Snack Limpio Bio',
        score: 96,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
        sugarDiffGrams: Math.round(sugars),
        proteinDiffGrams: 11,
        novaGroup: 1,
        reason: 'Proteína vegetal de alta biodisponibilidad y fibra saciante para evitar picos de glucosa en sangre.',
      });
      break;

    case 'comidas':
    default:
      if (nameStr.includes('pavo') || nameStr.includes('jamon') || nameStr.includes('embutido') || nameStr.includes('salchicha')) {
        generatedSwaps.push({
          barcode: '8435123499001',
          name: 'Pechuga de Pavo Asada 95%+ Sin Nitritos ni Alérgenos',
          brand: 'La Carloteña / Corte Limpio',
          score: 92,
          imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=300&q=80',
          proteinDiffGrams: 8,
          novaGroup: 2,
          reason: 'Carne magra real asada al horno. Libre de conservante carcinógeno E250 (nitrito de sodio) y sin almidones.',
        });
      } else if (nameStr.includes('pizza') || nameStr.includes('lasaña') || nameStr.includes('precocinado')) {
        generatedSwaps.push({
          barcode: '8410076472099',
          name: 'Base Artesanal de Masa Madre con Tomate y Mozzarella Fresca',
          brand: 'Pizzería Artesana Limpia',
          score: 88,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80',
          novaGroup: 2,
          reason: 'Fermentación lenta de 48 horas sin aditivos, grasas trans ni jarabe de maíz de alta fructosa.',
        });
      } else {
        generatedSwaps.push({
          barcode: '8410076472052',
          name: 'Copos de Avena Integral Suaves 100% Puros',
          brand: 'Hacendado / Kölln',
          score: 98,
          imageUrl: 'https://images.openfoodfacts.org/images/products/841/007/647/2052/front_es.18.400.jpg',
          proteinDiffGrams: 9,
          novaGroup: 1,
          reason: '100% grano entero sin procesar. Rico en betaglucanos que regulan el colesterol y sacian durante horas.',
        });
        generatedSwaps.push({
          barcode: '8480000340269',
          name: 'Gazpacho Tradicional Fresco con AOVE',
          brand: 'Hacendado / Santa Teresa',
          score: 96,
          imageUrl: 'https://images.openfoodfacts.org/images/products/848/000/034/0269/front_es.41.400.jpg',
          novaGroup: 1,
          reason: 'Hortalizas frescas trituradas con aceite de oliva virgen extra. Fuente directa de licopeno y vitamina C.',
        });
      }
      break;
  }

  return generatedSwaps;
}

/**
 * Evaluación completa y orquestada de un producto
 */
export function evaluateProduct(
  product: ScannedProduct,
  userProfile?: UserProfile
): ProductEvaluation {
  const { bioAlerts, detectedAllergens, isCompatible } = checkBioCompatibility(product, userProfile);
  const { breakdown, detectedAdditives } = calculateHealthScore(product, userProfile);
  const verdicts = generateHealthVerdicts(product, breakdown, userProfile, detectedAdditives);

  const sugarsPer100g = product.nutriments.sugars ?? 0;
  const sugarCubesPer100g = Number((sugarsPer100g / 4).toFixed(1));

  // Cálculo por ración aproximada (o 30g por defecto si no especificada)
  let servingRatio = 0.3; // 30g
  if (product.nutriments.servingSize) {
    const match = product.nutriments.servingSize.match(/(\d+(\.\d+)?)/);
    if (match) {
      const grams = parseFloat(match[1]);
      if (grams > 0 && grams < 1000) servingRatio = grams / 100;
    }
  }
  const sugarCubesPerServing = Number(((sugarsPer100g * servingRatio) / 4).toFixed(1));

  const swaps = findHealthySwaps(product, breakdown.total);

  return {
    product,
    score: breakdown,
    bioAlerts,
    isCompatible,
    verdicts,
    detectedAdditives,
    detectedAllergens,
    sugarCubesPer100g,
    sugarCubesPerServing,
    swaps,
  };
}
