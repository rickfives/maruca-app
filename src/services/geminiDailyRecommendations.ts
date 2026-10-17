import { DailyRecommendation, UserProfile } from '../types';

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Menús mediterráneos reales de alta nutrición (NOVA 1) para rotación garantizada sin conexión
 */
const ROTATING_FALLBACK_MENUS: DailyRecommendation[] = [
  {
    date: '2026-10-17',
    title: 'Energía Limpia Mediterránea',
    dailyFocus: 'Antioxidantes naturales, grasas cardiosaludables y proteína magra',
    caloriesTarget: '~1.950 kcal',
    chefTip: 'Cocina las verduras al vapor o salteadas al dente para preservar todos sus polifenoles y vitaminas.',
    meals: [
      {
        type: 'Desayuno',
        name: 'Bowl de Avena con Arándanos y Kéfir',
        description: 'Copos de avena integral remojados en kéfir natural con arándanos frescos, semillas de chía y nueces.',
        nutrients: '380 kcal • 16g proteína • 7g fibra',
        cleanScore: 98,
      },
      {
        type: 'Comida',
        name: 'Garbanzos Salteados con Espinacas y Bacalao',
        description: 'Garbanzos cocidos con espinacas tiernas, bacalao desalado desmigado y sofrito suave en AOVE virgen extra.',
        nutrients: '590 kcal • 34g proteína • 12g fibra',
        cleanScore: 97,
      },
      {
        type: 'Merienda',
        name: 'Manzana Fuji con Almendras Tostadas',
        description: 'Manzana fresca crujiente acompañada de un puñado de almendras crudas sin sal.',
        nutrients: '190 kcal • 6g proteína • 4g fibra',
        cleanScore: 99,
      },
      {
        type: 'Cena',
        name: 'Pechuga de Pavo a la Plancha con Espárragos',
        description: 'Filetes de pavo a la plancha con hierbas provenzales, espárragos trigueros y patata asada pequeña.',
        nutrients: '440 kcal • 38g proteína • 5g fibra',
        cleanScore: 96,
      },
    ],
    topIngredientsToBuy: ['Avena Integral', 'Kéfir Natural', 'Garbanzos', 'Bacalao', 'Espinacas', 'Almendras'],
  },
  {
    date: '2026-10-18',
    title: 'Vitalidad & Salud Digestiva',
    dailyFocus: 'Microbiota sana, fibra fermentable y equilibrio glucémico',
    caloriesTarget: '~2.050 kcal',
    chefTip: 'Añade un chorrito de limón al pescado o legumbres para multiplicar la absorción de hierro vegetal.',
    meals: [
      {
        type: 'Desayuno',
        name: 'Tostada de Pan de Centeno con Aguacate y Huevo',
        description: 'Pan 100% centeno con medio aguacate machacado, un huevo poché y semillas de sésamo.',
        nutrients: '410 kcal • 18g proteína • 8g fibra',
        cleanScore: 97,
      },
      {
        type: 'Comida',
        name: 'Lentejas Pardinas con Calabaza y Arroz Integral',
        description: 'Guiso suave de lentejas con dados de calabaza asada, arroz integral y pimentón dulce de la Vera.',
        nutrients: '620 kcal • 26g proteína • 14g fibra',
        cleanScore: 98,
      },
      {
        type: 'Merienda',
        name: 'Yogur Griego Natural con Frambuesas',
        description: 'Yogur estilo griego sin azúcar añadido con frambuesas silvestres y canela de Ceilán.',
        nutrients: '170 kcal • 12g proteína • 3g fibra',
        cleanScore: 99,
      },
      {
        type: 'Cena',
        name: 'Salmón Salvaje con Brócoli y Zanahoria Baby',
        description: 'Lomo de salmón a la plancha sobre base de brócoli al vapor aliñado con aceite de oliva virgen extra.',
        nutrients: '510 kcal • 35g proteína • 6g fibra',
        cleanScore: 98,
      },
    ],
    topIngredientsToBuy: ['Pan de Centeno', 'Aguacate', 'Huevos Camperos', 'Lentejas', 'Salmón', 'Brócoli'],
  },
];

/**
 * Obtiene la recomendación diaria de comidas.
 * IMPORTANTE: No dispone de botón de refresco para proteger la API y asegurar que nadie gaste cuota innecesariamente.
 * Se almacena en localStorage con clave de fecha (YYYY-MM-DD), realizándose como máximo 1 llamada al día por usuario.
 */
export async function getDailyMealRecommendation(profile?: UserProfile): Promise<DailyRecommendation> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `nutriradar_daily_rec_${today}`;

  // 1. Comprobar caché local de hoy (0 peticiones a la API)
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: DailyRecommendation = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.meals) && parsed.meals.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo caché diaria de recomendación:', e);
  }

  // 2. Si no existe en la caché de hoy, solicitar a la API de Gemini (1 vez al día)
  const apiKey = profile?.geminiApiKey?.trim() || GEMINI_API_KEY;

  const allergensList = (profile?.allergens || []).join(', ');
  const blacklistList = (profile?.blacklistedIngredients || []).join(', ');
  const goalStr = profile?.goals?.join(', ') || 'clean_eating';

  const prompt = `Eres el Chef y Nutricionista Jefe de Maruca en España.
Genera la recomendación del día para hoy (${today}).
Perfil del usuario:
- Objetivo principal: ${goalStr}
- Alérgenos a excluir absolutamente: ${allergensList || 'ninguno'}
- Ingredientes vetados: ${blacklistList || 'aceite de palma, azúcares refinados'}

Enfócate en comida 100% real (NOVA 1), gastronomía mediterránea fresca y saciante.
Devuelve ÚNICAMENTE un objeto JSON estrictamente válido, sin rodeos, sin markdown (\`\`\`json):
{
  "date": "${today}",
  "title": "Título sugerente del menú del día (ej. Sabor Mediterráneo & Energía Limpia)",
  "dailyFocus": "Explicación breve del beneficio biológico del día",
  "caloriesTarget": "~2.000 kcal",
  "chefTip": "Consejo culinario o nutricional de una frase",
  "meals": [
    {
      "type": "Desayuno",
      "name": "Nombre del plato",
      "description": "Ingredientes y elaboración en 1-2 frases",
      "nutrients": "380 kcal • 15g proteína • 6g fibra",
      "cleanScore": 98
    },
    {
      "type": "Comida",
      "name": "Nombre del plato",
      "description": "Ingredientes y elaboración en 1-2 frases",
      "nutrients": "620 kcal • 32g proteína • 11g fibra",
      "cleanScore": 97
    },
    {
      "type": "Merienda",
      "name": "Nombre del plato",
      "description": "Ingredientes y elaboración en 1-2 frases",
      "nutrients": "180 kcal • 8g proteína • 4g fibra",
      "cleanScore": 99
    },
    {
      "type": "Cena",
      "name": "Nombre del plato",
      "description": "Ingredientes y elaboración en 1-2 frases",
      "nutrients": "460 kcal • 36g proteína • 5g fibra",
      "cleanScore": 96
    }
  ],
  "topIngredientsToBuy": ["Alimento 1", "Alimento 2", "Alimento 3", "Alimento 4", "Alimento 5"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const cleanJson = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed: DailyRecommendation = JSON.parse(cleanJson);

    // Guardar en caché diaria
    try {
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
    } catch (e) {}

    return parsed;
  } catch (error) {
    console.warn('Usando menú saludable de rotación diaria por contingencia:', error);
    // Seleccionar según el día del año para rotar automáticamente
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const fallback = ROTATING_FALLBACK_MENUS[dayOfYear % ROTATING_FALLBACK_MENUS.length];
    const withTodayDate: DailyRecommendation = {
      ...fallback,
      date: today,
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(withTodayDate));
    } catch (e) {}
    return withTodayDate;
  }
}
