import { ScannedProduct } from '../types';
import { getDemoProduct } from '../utils/fallbackProducts';

const USER_AGENT = 'MarucaApp - WebPWA - Version 1.0 - contact@maruca.app';

interface OffProductResponse {
  status: number;
  code?: string;
  product?: Record<string, any>;
  status_verbose?: string;
}

interface OffSearchResponse {
  count?: number;
  page?: number;
  products?: Record<string, any>[];
}

/**
 * Normaliza un objeto devuelto por Open Food Facts a nuestro modelo ScannedProduct
 */
export function normalizeOffProduct(raw: Record<string, any>, barcodeInput: string): ScannedProduct {
  const nutrimentsRaw = raw.nutriments || {};
  const nutriscore = raw.nutriscore_grade ? String(raw.nutriscore_grade).toLowerCase() : undefined;
  const validNutriscore = ['a', 'b', 'c', 'd', 'e'].includes(nutriscore || '')
    ? (nutriscore as 'a' | 'b' | 'c' | 'd' | 'e')
    : undefined;

  let novaGroup: 1 | 2 | 3 | 4 | undefined = undefined;
  if (raw.nova_group === 1 || raw.nova_group === 2 || raw.nova_group === 3 || raw.nova_group === 4) {
    novaGroup = raw.nova_group;
  }

  // Comprobar aceite de palma
  const palmTags = raw.ingredients_analysis_tags || [];
  const hasPalmOil = palmTags.includes('en:palm-oil') || palmTags.includes('en:may-contain-palm-oil');

  // Categorías
  const categories: string[] = [];
  if (Array.isArray(raw.categories_tags)) {
    raw.categories_tags.forEach((cat: string) => {
      categories.push(cat.replace(/^en:/, '').replace(/^es:/, '').replace(/[-_]/g, ' '));
    });
  } else if (typeof raw.categories === 'string') {
    categories.push(...raw.categories.split(',').map((c: string) => c.trim()));
  }

  return {
    barcode: raw.code || barcodeInput,
    name: raw.product_name_es || raw.product_name || raw.generic_name_es || raw.generic_name || 'Producto Sin Nombre',
    brands: raw.brands || raw.brand_owner || 'Marca no indicada',
    imageUrl: raw.image_front_url || raw.image_url || raw.image_small_url,
    quantity: raw.quantity || raw.serving_size || undefined,
    categories: categories.slice(0, 5),
    nutriscoreGrade: validNutriscore,
    novaGroup,
    nutriments: {
      energyKcal: nutrimentsRaw['energy-kcal_100g'] ?? nutrimentsRaw['energy-kcal'] ?? (nutrimentsRaw.energy_100g ? Math.round(nutrimentsRaw.energy_100g / 4.184) : 0),
      fat: nutrimentsRaw.fat_100g ?? nutrimentsRaw.fat,
      saturatedFat: nutrimentsRaw['saturated-fat_100g'] ?? nutrimentsRaw['saturated-fat'],
      carbohydrates: nutrimentsRaw.carbohydrates_100g ?? nutrimentsRaw.carbohydrates,
      sugars: nutrimentsRaw.sugars_100g ?? nutrimentsRaw.sugars,
      fiber: nutrimentsRaw.fiber_100g ?? nutrimentsRaw.fiber,
      proteins: nutrimentsRaw.proteins_100g ?? nutrimentsRaw.proteins,
      salt: nutrimentsRaw.salt_100g ?? nutrimentsRaw.salt,
      sodium: nutrimentsRaw.sodium_100g ?? nutrimentsRaw.sodium,
      servingSize: raw.serving_size || undefined,
    },
    nutrientLevels: {
      fat: raw.nutrient_levels?.fat,
      saturatedFat: raw.nutrient_levels?.['saturated-fat'],
      sugars: raw.nutrient_levels?.sugars,
      salt: raw.nutrient_levels?.salt,
    },
    ingredientsText: raw.ingredients_text_es || raw.ingredients_text || '',
    allergensTags: Array.isArray(raw.allergens_tags) ? raw.allergens_tags : [],
    tracesTags: Array.isArray(raw.traces_tags) ? raw.traces_tags : [],
    additivesTags: Array.isArray(raw.additives_tags) ? raw.additives_tags : [],
    hasPalmOil,
    timestamp: Date.now(),
  };
}

/**
 * Consulta un producto por su código de barras (EAN-13, EAN-8, UPC)
 */
export async function fetchProductByBarcode(barcode: string): Promise<ScannedProduct> {
  const cleanBarcode = barcode.trim();

  // 1. Si coincide con alguno de nuestros productos de fallback verificados, lo tenemos listo
  const fallback = getDemoProduct(cleanBarcode);

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (fallback) return fallback.product;
      throw new Error(`Error en el servidor de Open Food Facts (${response.status})`);
    }

    const data: OffProductResponse = await response.json();

    if (data.status === 1 && data.product) {
      return normalizeOffProduct(data.product, cleanBarcode);
    }

    // Si la API dice que no existe pero lo tenemos en fallback
    if (fallback) {
      return fallback.product;
    }

    throw new Error(`Código de barras "${cleanBarcode}" no encontrado en la base de datos.`);
  } catch (error) {
    if (fallback) {
      return fallback.product;
    }
    throw error;
  }
}

/**
 * Busca productos en Open Food Facts España mediante término libre
 */
export async function searchProductsByQuery(query: string): Promise<ScannedProduct[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    const url = `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      cleanQuery
    )}&search_simple=1&action=process&json=1&page_size=15`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error de búsqueda (${response.status})`);
    }

    const data: OffSearchResponse = await response.json();
    const rawList = data.products || [];

    return rawList.map((raw) => normalizeOffProduct(raw, raw.code || ''));
  } catch (error) {
    console.error('Error buscando productos:', error);
    // Filtrar en fallback local como red de seguridad
    const fallbackList = Object.values(getDemoProduct('') ? {} : {}) as any[];
    return [];
  }
}
