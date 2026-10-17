import { ScannedProduct } from '../types';

export type ProductCategoryKey = 'bebidas' | 'comidas' | 'salsas' | 'postres' | 'snacks' | 'otros';

export interface ProductCategoryMeta {
  key: ProductCategoryKey;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const PRODUCT_CATEGORIES: Record<ProductCategoryKey, ProductCategoryMeta> = {
  bebidas: {
    key: 'bebidas',
    label: 'Bebidas',
    emoji: '🥤',
    color: '#0071e3', // Apple Blue
    description: 'Aguas, refrescos, zumos, leches, infusiones y café',
  },
  comidas: {
    key: 'comidas',
    label: 'Comidas',
    emoji: '🍲',
    color: '#30d158', // Apple Green
    description: 'Platos preparados, legumbres, carnes, pescados, arroces y pastas',
  },
  salsas: {
    key: 'salsas',
    label: 'Salsas',
    emoji: '🥫',
    color: '#ff9f0a', // Apple Orange
    description: 'Tomate frito, mayonesa, ketchup, aliños, aderezos y sofritos',
  },
  postres: {
    key: 'postres',
    label: 'Postres',
    emoji: '🍰',
    color: '#ff375f', // Apple Pink/Rose
    description: 'Chocolates, galletas, bollería, helados, yogures y dulces',
  },
  snacks: {
    key: 'snacks',
    label: 'Snacks',
    emoji: '🍿',
    color: '#bf5af2', // Apple Purple
    description: 'Frutos secos, patatas fritas, aperitivos y barritas',
  },
  otros: {
    key: 'otros',
    label: 'Otros',
    emoji: '🍽️',
    color: '#8e8e93', // Apple Grey
    description: 'Otros alimentos e ingredientes varios',
  },
};

/**
 * Clasifica cualquier producto escaneado en una de las categorías principales:
 * Bebidas, Comidas, Salsas, Postres, Snacks, u Otros.
 */
export function classifyProductCategory(product: ScannedProduct): ProductCategoryKey {
  const name = (product.name || '').toLowerCase();
  const brands = (product.brands || '').toLowerCase();
  const cats = (product.categories || []).map((c) => c.toLowerCase()).join(' ');
  const ingredients = (product.ingredientsText || '').toLowerCase();
  const fullText = `${name} ${brands} ${cats} ${ingredients}`;

  // 1. BEBIDAS (prioridad alta para líquidos, zumos, leches, aguas)
  const isBeverage =
    cats.includes('beverage') ||
    cats.includes('bebida') ||
    cats.includes('boisson') ||
    cats.includes('refresco') ||
    cats.includes('soda') ||
    cats.includes('juice') ||
    cats.includes('zumo') ||
    cats.includes('water') ||
    cats.includes('agua') ||
    cats.includes('milk') ||
    cats.includes('leche') ||
    cats.includes('kefir') ||
    cats.includes('kéfir') ||
    cats.includes('tea') ||
    cats.includes('infusion') ||
    cats.includes('coffee') ||
    cats.includes('café') ||
    name.includes('coca-cola') ||
    name.includes('pepsi') ||
    name.includes('aquarius') ||
    name.includes('fanta') ||
    name.includes('refresco') ||
    name.includes('zumo') ||
    name.includes('néctar') ||
    name.includes('leche') ||
    name.includes('agua mineral') ||
    name.includes('cerveza') ||
    name.includes('smoothie') ||
    name.includes('kombucha') ||
    name.includes('horchata') ||
    name.includes('batido de') ||
    name.includes('bebida de');

  if (isBeverage && !name.includes('galleta') && !name.includes('tarta')) {
    return 'bebidas';
  }

  // 2. SALSAS Y CONDIMENTOS
  const isSauce =
    cats.includes('sauce') ||
    cats.includes('salsa') ||
    cats.includes('condiment') ||
    cats.includes('dressing') ||
    cats.includes('dip') ||
    name.includes('salsa') ||
    name.includes('ketchup') ||
    name.includes('mayonesa') ||
    name.includes('mostaza') ||
    name.includes('alioli') ||
    name.includes('tomate frito') ||
    name.includes('sofrito') ||
    name.includes('guacamole') ||
    name.includes('pesto') ||
    name.includes('aderezo') ||
    name.includes('vinagre') ||
    name.includes('vinaigrette') ||
    name.includes('chimichurri') ||
    name.includes('tabasco') ||
    name.includes('barbacoa') ||
    name.includes('bbq') ||
    name.includes('curry');

  if (isSauce) {
    return 'salsas';
  }

  // 3. POSTRES Y DULCES
  const isDessert =
    cats.includes('dessert') ||
    cats.includes('postre') ||
    cats.includes('sweet') ||
    cats.includes('chocolate') ||
    cats.includes('biscuit') ||
    cats.includes('cookie') ||
    cats.includes('galleta') ||
    cats.includes('cake') ||
    cats.includes('pastel') ||
    cats.includes('tarta') ||
    cats.includes('spread') ||
    cats.includes('jam') ||
    cats.includes('mermelada') ||
    cats.includes('ice cream') ||
    cats.includes('helado') ||
    cats.includes('pastry') ||
    cats.includes('bollería') ||
    name.includes('nutella') ||
    name.includes('nocilla') ||
    name.includes('crema de cacao') ||
    name.includes('chocolate') ||
    name.includes('bombón') ||
    name.includes('galleta') ||
    name.includes('galletas') ||
    name.includes('oreo') ||
    name.includes('croissant') ||
    name.includes('donut') ||
    name.includes('magdalena') ||
    name.includes('muffin') ||
    name.includes('helado') ||
    name.includes('flan') ||
    name.includes('natillas') ||
    name.includes('mermelada') ||
    name.includes('tarta') ||
    name.includes('dulce de') ||
    name.includes('caramelo') ||
    name.includes('chuche') ||
    name.includes('gominola');

  if (isDessert) {
    return 'postres';
  }

  // 4. SNACKS Y APERITIVOS
  const isSnack =
    cats.includes('snack') ||
    cats.includes('aperitivo') ||
    cats.includes('crisp') ||
    cats.includes('chip') ||
    cats.includes('frutos secos') ||
    cats.includes('nuts') ||
    cats.includes('popcorn') ||
    name.includes('patatas fritas') ||
    name.includes('chips') ||
    name.includes('nachos') ||
    name.includes('palomitas') ||
    name.includes('frutos secos') ||
    name.includes('almendra') ||
    name.includes('nueces') ||
    name.includes('cacahuete') ||
    name.includes('pistacho') ||
    name.includes('pipas') ||
    name.includes('tortitas de arroz') ||
    name.includes('tortitas de maíz') ||
    name.includes('crackers') ||
    name.includes('barrita');

  if (isSnack) {
    return 'snacks';
  }

  // 5. COMIDAS / PLATOS PRINCIPALES
  const isMeal =
    cats.includes('meal') ||
    cats.includes('plat') ||
    cats.includes('canned') ||
    cats.includes('conserve') ||
    cats.includes('legume') ||
    cats.includes('meat') ||
    cats.includes('carne') ||
    cats.includes('fish') ||
    cats.includes('poisson') ||
    cats.includes('pescado') ||
    cats.includes('rice') ||
    cats.includes('arroz') ||
    cats.includes('pasta') ||
    cats.includes('vegetable') ||
    cats.includes('verdura') ||
    cats.includes('legumbre') ||
    cats.includes('bread') ||
    cats.includes('pan') ||
    name.includes('garbanzo') ||
    name.includes('lenteja') ||
    name.includes('alubia') ||
    name.includes('arroz') ||
    name.includes('pasta') ||
    name.includes('espaguetis') ||
    name.includes('macarrones') ||
    name.includes('pollo') ||
    name.includes('pavo') ||
    name.includes('ternera') ||
    name.includes('salmón') ||
    name.includes('atún') ||
    name.includes('bacalao') ||
    name.includes('merluza') ||
    name.includes('pizza') ||
    name.includes('ensalada') ||
    name.includes('hummus') ||
    name.includes('huevo') ||
    name.includes('tortilla') ||
    name.includes('pan integral') ||
    name.includes('pan de centeno') ||
    name.includes('queso') ||
    name.includes('jamón') ||
    name.includes('lomo') ||
    name.includes('tofu') ||
    name.includes('gazpacho') ||
    name.includes('salmorejo') ||
    name.includes('crema de verduras') ||
    name.includes('sopa');

  if (isMeal) {
    return 'comidas';
  }

  // 6. Si contiene pistas de comida general
  if (fullText.includes('aceite') || fullText.includes('harina') || fullText.includes('avena')) {
    return 'comidas';
  }

  return 'otros';
}
