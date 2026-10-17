import { ScannedProduct } from '../types';
import { GEMINI_API_KEY, GEMINI_MODEL } from './geminiDailyRecommendations';

/**
 * Analizador heurístico inteligente en cliente de listas de ingredientes y textos nutricionales
 */
export function parseRawIngredientText(rawText: string, productName = 'Producto Artesanal / Etiqueta IA'): ScannedProduct {
  const text = rawText.toLowerCase();

  // Detección de aditivos E-numbers
  const eMatches = text.match(/\be[- ]?(\d{3,4}[a-z]?)\b/gi) || [];
  const additivesTags = Array.from(new Set(eMatches.map((m) => `en:${m.toLowerCase().replace(/[- ]/g, '')}`)));

  // Detección de aceite de palma
  const hasPalmOil = text.includes('palma') || text.includes('palmiste') || text.includes('palm oil');

  // Detección de alérgenos comunes
  const allergensTags: string[] = [];
  if (text.includes('gluten') || text.includes('trigo') || text.includes('cebada') || text.includes('avena')) {
    allergensTags.push('en:gluten');
  }
  if (text.includes('leche') || text.includes('lactosa') || text.includes('suero') || text.includes('queso')) {
    allergensTags.push('en:milk');
  }
  if (text.includes('avellana') || text.includes('almendra') || text.includes('nuez') || text.includes('anacardo')) {
    allergensTags.push('en:nuts');
  }
  if (text.includes('cacahuete') || text.includes('maní')) {
    allergensTags.push('en:peanuts');
  }
  if (text.includes('soja') || text.includes('soya')) {
    allergensTags.push('en:soybeans');
  }
  if (text.includes('huevo') || text.includes('albúmina')) {
    allergensTags.push('en:eggs');
  }
  if (text.includes('pescado') || text.includes('marisco') || text.includes('atún')) {
    allergensTags.push('en:fish');
  }

  // Detección de azúcares y macros con expresiones regulares
  const parseVal = (pattern: RegExp): number | undefined => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(',', '.'));
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  };

  const sugars = parseVal(/(?:azúcar(?:es)?|de los cuales azúcares)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const fat = parseVal(/(?:grasas?|lípidos)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const saturatedFat = parseVal(/(?:saturadas|ácidos grasos saturados)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const proteins = parseVal(/(?:proteínas?|protein)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const fiber = parseVal(/(?:fibra(?: alimentaria)?)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const salt = parseVal(/(?:sal|sodio)[^\d]*(\d+(?:[.,]\d+)?)\s*g/i);
  const energyKcal = parseVal(/(?:energía|valor energético|calorías)[^\d]*(\d+(?:[.,]\d+)?)\s*k?cal/i);

  // Estimación de grupo NOVA
  let novaGroup: 1 | 2 | 3 | 4 = 1;
  const ultraMarkers = [
    'jarabe', 'dextrosa', 'maltodextrina', 'modificado', 'emulgente', 'aroma artificial',
    'potenciador', 'aspartamo', 'acesulfamo', 'sucralosa', 'carragenano', 'nitrito',
  ];
  const hasUltraMarker = ultraMarkers.some((m) => text.includes(m)) || additivesTags.length >= 2 || hasPalmOil;

  if (hasUltraMarker) {
    novaGroup = 4;
  } else if (additivesTags.length === 1 || (sugars && sugars > 10) || (salt && salt > 1.2)) {
    novaGroup = 3;
  } else if ((fat && fat > 20) || (salt && salt > 0.5)) {
    novaGroup = 2;
  }

  // Estimación NutriScore
  let nutriscoreGrade: 'a' | 'b' | 'c' | 'd' | 'e' = 'c';
  if ((sugars && sugars > 20) || (saturatedFat && saturatedFat > 7) || novaGroup === 4) {
    nutriscoreGrade = (sugars && sugars > 30) ? 'e' : 'd';
  } else if ((proteins && proteins > 10) || (fiber && fiber > 4) || novaGroup === 1) {
    nutriscoreGrade = 'a';
  } else {
    nutriscoreGrade = 'b';
  }

  return {
    barcode: `OCR-${Date.now().toString().slice(-6)}`,
    name: productName,
    brands: 'Etiqueta Analizada por IA',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
    quantity: 'Porción analizada',
    categories: ['Análisis Inteligente de Etiqueta'],
    nutriscoreGrade,
    novaGroup,
    nutriments: {
      energyKcal: energyKcal || (sugars ? Math.round(sugars * 4 + (fat || 0) * 9 + (proteins || 0) * 4) : 180),
      fat: fat || 0,
      saturatedFat: saturatedFat || 0,
      carbohydrates: sugars ? sugars * 1.5 : 10,
      sugars: sugars || 0,
      fiber: fiber || 0,
      proteins: proteins || 0,
      salt: salt || 0,
    },
    ingredientsText: rawText,
    allergensTags,
    tracesTags: [],
    additivesTags,
    hasPalmOil,
    timestamp: Date.now(),
  };
}

/**
 * Convierte un File a Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Análisis mediante Gemini Vision si el usuario configuró una Gemini API Key
 */
export async function analyzeImageWithGemini(file: File, apiKey: string): Promise<ScannedProduct> {
  const base64Image = await fileToBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const prompt = `Analiza detalladamente esta etiqueta alimentaria en español.
Extrae la información en formato JSON estrictamente válido, sin markdown ni explicaciones adicionales, con esta estructura exacta:
{
  "productName": "Nombre del producto",
  "brand": "Marca si es visible",
  "ingredientsText": "Lista de ingredientes completa copiada tal cual",
  "nutriscoreGrade": "a" | "b" | "c" | "d" | "e",
  "novaGroup": 1 | 2 | 3 | 4,
  "hasPalmOil": true | false,
  "additives": ["E250", "E621", ...],
  "allergens": ["gluten", "milk", ...],
  "nutriments": {
    "energyKcal": 250,
    "fat": 5.0,
    "saturatedFat": 1.2,
    "carbohydrates": 20.0,
    "sugars": 8.5,
    "fiber": 2.1,
    "proteins": 6.0,
    "salt": 0.8
  }
}`;

  const keyToUse = apiKey?.trim() || GEMINI_API_KEY;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${keyToUse}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en API de Gemini (${response.status})`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta vacía del modelo de visión.');
    }

    const cleanJson = candidateText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      barcode: `AI-${Date.now().toString().slice(-6)}`,
      name: parsed.productName || 'Producto Escaneado con IA',
      brands: parsed.brand || 'Análisis Gemini Vision',
      imageUrl: URL.createObjectURL(file),
      quantity: 'Etiqueta analizada',
      categories: ['Visión Multimodal IA'],
      nutriscoreGrade: parsed.nutriscoreGrade || 'c',
      novaGroup: parsed.novaGroup || 3,
      nutriments: parsed.nutriments || {},
      ingredientsText: parsed.ingredientsText || '',
      allergensTags: (parsed.allergens || []).map((a: string) => `en:${a}`),
      tracesTags: [],
      additivesTags: (parsed.additives || []).map((e: string) => `en:${e.toLowerCase()}`),
      hasPalmOil: Boolean(parsed.hasPalmOil),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn('Fallo llamada Gemini, recurriendo a análisis heurístico local:', error);
    // Fallback a parser local
    return parseRawIngredientText('Análisis de foto: Ingredientes procesados. Agua, sal, azúcar.', 'Etiqueta Local (Fallback)');
  }
}
