import { ENumberInfo, RiskLevel } from '../types';

export const E_NUMBERS_DATABASE: Record<string, ENumberInfo> = {
  // Colorantes
  'e102': {
    code: 'E102',
    name: 'Tartrazina',
    category: 'Colorante artificial',
    risk: 'high',
    description: 'Colorante azoico amarillo. Asociado a hiperactividad en niños (síndrome TDAH) y reacciones alérgicas tipo asma o urticaria.',
  },
  'e110': {
    code: 'E110',
    name: 'Amarillo Ocaso FCF',
    category: 'Colorante artificial',
    risk: 'high',
    description: 'Colorante sintético. Puede desencadenar intolerancias y alteraciones en la conducta infantil. Obliga a aviso de precaución en la UE.',
  },
  'e120': {
    code: 'E120',
    name: 'Ácido carmínico / Cochinilla',
    category: 'Colorante natural',
    risk: 'moderate',
    description: 'Extraído de insectos hembra desecados. No apto para dietas veganas/vegetarianas y potencial alérgeno en personas sensibles.',
  },
  'e122': {
    code: 'E122',
    name: 'Azorrubina (Carmoisina)',
    category: 'Colorante artificial',
    risk: 'high',
    description: 'Colorante rojo derivado del alquitrán. Puede provocar reacciones alérgicas y problemas cutáneos.',
  },
  'e124': {
    code: 'E124',
    name: 'Ponceau 4R',
    category: 'Colorante artificial',
    risk: 'high',
    description: 'Rojo cochinilla A sintético. Asociado con síntomas asmáticos y sospechas toxicológicas en altas dosis.',
  },
  'e129': {
    code: 'E129',
    name: 'Rojo Allura AC',
    category: 'Colorante artificial',
    risk: 'high',
    description: 'Colorante derivado del petróleo. Puede causar inflamación intestinal en estudios con modelos animales.',
  },
  'e133': {
    code: 'E133',
    name: 'Azul brillante FCF',
    category: 'Colorante artificial',
    risk: 'moderate',
    description: 'Colorante sintético. Baja toxicidad aguda pero innecesario biológicamente.',
  },
  'e150d': {
    code: 'E150d',
    name: 'Caramelo de sulfito amónico',
    category: 'Colorante',
    risk: 'moderate',
    description: 'Colorante oscuro presente en refrescos de cola. En su síntesis puede generar subproductos como 4-metilimidazol (4-MEI).',
  },
  'e171': {
    code: 'E171',
    name: 'Dióxido de titanio',
    category: 'Colorante / Blanqueador',
    risk: 'high',
    description: 'Prohibido en la Unión Europea como aditivo alimentario por riesgo de genotoxicidad tras acumulación de nanopartículas.',
  },

  // Conservantes
  'e200': {
    code: 'E200',
    name: 'Ácido sórbico',
    category: 'Conservante',
    risk: 'safe',
    description: 'Conservante antimicrobiano seguro que se metaboliza de forma natural por el organismo.',
  },
  'e202': {
    code: 'E202',
    name: 'Sorbato potásico',
    category: 'Conservante',
    risk: 'safe',
    description: 'Sal del ácido sórbico, comúnmente utilizada contra hongos y levaduras. Muy baja toxicidad.',
  },
  'e211': {
    code: 'E211',
    name: 'Benzoato de sodio',
    category: 'Conservante',
    risk: 'moderate',
    description: 'Puede formar benceno (compuesto carcinógeno) en presencia de vitamina C (ácido ascórbico) y luz/calor.',
  },
  'e220': {
    code: 'E220',
    name: 'Dióxido de azufre',
    category: 'Conservante / Sulfito',
    risk: 'high',
    description: 'Sulfito comúnmente añadido al vino o frutos secos. Potente alérgeno que puede causar crisis asmáticas graves en personas sensibles.',
  },
  'e249': {
    code: 'E249',
    name: 'Nitrito de potasio',
    category: 'Conservante cárnico',
    risk: 'high',
    description: 'Utilizado en embutidos y carnes curadas. Se combina con aminas en el estómago formando nitrosaminas, compuestos clasificados como cancerígenos por la OMS.',
  },
  'e250': {
    code: 'E250',
    name: 'Nitrito de sodio',
    category: 'Conservante cárnico',
    risk: 'high',
    description: 'Conservante típico de fiambres, salchichas y bacon. Alto riesgo por generación de nitrosaminas potencialmente cancerígenas.',
  },
  'e251': {
    code: 'E251',
    name: 'Nitrato de sodio',
    category: 'Conservante',
    risk: 'high',
    description: 'Precursor de nitritos en el tracto digestivo. Riesgo similar a E250 en consumo continuado.',
  },
  'e252': {
    code: 'E252',
    name: 'Nitrato de potasio',
    category: 'Conservante',
    risk: 'high',
    description: 'Utilizado en carnes y quesos madurados. Formador potencial de nitrosaminas.',
  },

  // Antioxidantes
  'e300': {
    code: 'E300',
    name: 'Ácido ascórbico (Vitamina C)',
    category: 'Antioxidante natural',
    risk: 'safe',
    description: 'Vitamina C pura. Antioxidante natural completamente saludable y beneficioso.',
  },
  'e306': {
    code: 'E306',
    name: 'Extracto rico en tocoferoles (Vitamina E)',
    category: 'Antioxidante natural',
    risk: 'safe',
    description: 'Vitamina E de origen vegetal. Totalmente inofensivo y protector frente a la oxidación.',
  },
  'e320': {
    code: 'E320',
    name: 'BHA (Butilhidroxianisol)',
    category: 'Antioxidante sintético',
    risk: 'high',
    description: 'Antioxidante sintético lipídico. Sospechoso de actuar como disruptor endocrino y clasificado como posiblemente carcinógeno.',
  },
  'e321': {
    code: 'E321',
    name: 'BHT (Butilhidroxitolueno)',
    category: 'Antioxidante sintético',
    risk: 'high',
    description: 'Sintético. Riesgo moderado-alto de toxicidad hepática y renal con dosis acumulativas.',
  },
  'e322': {
    code: 'E322',
    name: 'Lecitina (Soja / Girasol)',
    category: 'Emulgente',
    risk: 'safe',
    description: 'Fosfolípido natural de origen vegetal. Seguro; personas con alergia severa a la soja deben verificar su origen.',
  },
  'e330': {
    code: 'E330',
    name: 'Ácido cítrico',
    category: 'Acidulante natural',
    risk: 'safe',
    description: 'Compuesto natural presente en cítricos. Seguro e inofensivo.',
  },

  // Emulgentes y Espesantes
  'e407': {
    code: 'E407',
    name: 'Carragenanos',
    category: 'Espesante / Gelificante',
    risk: 'high',
    description: 'Extraído de algas rojas. Puede provocar inflamación intestinal, alteraciones en la microbiota y exacerbar colitis.',
  },
  'e412': {
    code: 'E412',
    name: 'Goma guar',
    category: 'Espesante natural',
    risk: 'safe',
    description: 'Fibra soluble obtenida de leguminosas. Segura en cantidades normales, aporta fibra.',
  },
  'e415': {
    code: 'E415',
    name: 'Goma xantana',
    category: 'Espesante / Estabilizante',
    risk: 'safe',
    description: 'Polisacárido fermentado natural. Seguro para la inmensa mayoría de consumidores.',
  },
  'e471': {
    code: 'E471',
    name: 'Mono y diglicéridos de ácidos grasos',
    category: 'Emulgente industrial',
    risk: 'moderate',
    description: 'Marcador típico de ultraprocesado (NOVA 4). Puede contener trazas de grasas trans y alterar la barrera mucosa del intestino.',
  },
  'e472e': {
    code: 'E472e',
    name: 'Ésteres de mono y diglicéridos',
    category: 'Emulgente industrial',
    risk: 'moderate',
    description: 'Utilizado en panadería industrial para aportar esponjosidad artificial.',
  },

  // Potenciadores de sabor
  'e621': {
    code: 'E621',
    name: 'Glutamato monosódico (GMS)',
    category: 'Potenciador del sabor',
    risk: 'high',
    description: 'Potencia el sabor umami. Estimula el apetito de manera artificial, puede provocar hiperfagia y cefaleas en personas sensibles.',
  },
  'e627': {
    code: 'E627',
    name: 'Guanilato disódico',
    category: 'Potenciador del sabor',
    risk: 'moderate',
    description: 'Potenciador de sabor industrial muy potente, no apto para personas con hiperuricemia o gota.',
  },
  'e631': {
    code: 'E631',
    name: 'Inosinato disódico',
    category: 'Potenciador del sabor',
    risk: 'moderate',
    description: 'Usualmente combinado con el glutamato en snacks ultraprocesados.',
  },

  // Edulcorantes artificiales
  'e950': {
    code: 'E950',
    name: 'Acesulfamo K',
    category: 'Edulcorante artificial',
    risk: 'high',
    description: '200 veces más dulce que el azúcar. Puede alterar la microbiota intestinal y la respuesta insulínica.',
  },
  'e951': {
    code: 'E951',
    name: 'Aspartamo',
    category: 'Edulcorante artificial',
    risk: 'high',
    description: 'Clasificado por la IARC/OMS como "posiblemente carcinógeno para humanos (Grupo 2B)". Prohibido en personas con fenilcetonuria.',
  },
  'e952': {
    code: 'E952',
    name: 'Ciclamato sódico',
    category: 'Edulcorante artificial',
    risk: 'high',
    description: 'Prohibido en varios países (como EE.UU.). Riesgos potenciales para la flora bacteriana y metabolitos tóxicos.',
  },
  'e954': {
    code: 'E954',
    name: 'Sacarina',
    category: 'Edulcorante artificial',
    risk: 'moderate',
    description: 'Uno de los edulcorantes más antiguos. En altas dosis se relaciona con disbiosis en la flora intestinal.',
  },
  'e955': {
    code: 'E955',
    name: 'Sucralosa',
    category: 'Edulcorante artificial',
    risk: 'high',
    description: 'Derivado clorado de la sacarosa. Estudios recientes demuestran alteración de la microbiota y permeabilidad intestinal.',
  },
  'e960': {
    code: 'E960',
    name: 'Glucósidos de esteviol (Stevia)',
    category: 'Edulcorante de origen vegetal',
    risk: 'safe',
    description: 'Extraído de la planta Stevia rebaudiana. Perfil de seguridad favorable frente a edulcorantes sintéticos de síntesis.',
  },
  'e965': {
    code: 'E965',
    name: 'Maltitol',
    category: 'Polialcohol edulcorante',
    risk: 'moderate',
    description: 'Efecto laxante y fermentativo en el colon. Puede causar gases, hinchazón abdominal y diarreas en personas con intestino sensible.',
  },
  'e967': {
    code: 'E967',
    name: 'Xilitol',
    category: 'Polialcohol edulcorante',
    risk: 'moderate',
    description: 'Protector dental frente a caries pero con potencial de molestias gastrointestinales en consumo elevado.',
  },
};

/**
 * Normaliza un código o tag de aditivo a formato canónico 'eXXX'
 * Por ejemplo: "en:e250" -> "e250", "E-250" -> "e250", "e250" -> "e250"
 */
export function normalizeECode(tag: string): string {
  if (!tag) return '';
  const clean = tag.toLowerCase().replace(/^en:/, '').replace(/[-_ ]/g, '').trim();
  return clean;
}

/**
 * Obtiene la información detallada de un aditivo a partir de su tag o código
 */
export function getAdditiveInfo(tag: string): ENumberInfo {
  const norm = normalizeECode(tag);
  if (E_NUMBERS_DATABASE[norm]) {
    return E_NUMBERS_DATABASE[norm];
  }

  // Si no está en el diccionario exhaustivo, inferir datos seguros
  const codeUpper = norm.toUpperCase();
  const codeNum = parseInt(norm.replace(/\D/g, ''), 10);

  let category = 'Aditivo alimentario';
  let risk: RiskLevel = 'moderate';
  let description = 'Aditivo tecnológico utilizado en la industria alimentaria.';

  if (codeNum >= 100 && codeNum < 200) {
    category = 'Colorante';
    risk = 'moderate';
    description = 'Sustancia añadida para restaurar o modificar el color del alimento.';
  } else if (codeNum >= 200 && codeNum < 300) {
    category = 'Conservante';
    risk = codeNum === 250 || codeNum === 249 || codeNum === 251 ? 'high' : 'moderate';
    description = 'Prolonga la vida útil del alimento impidiendo el crecimiento microbiano.';
  } else if (codeNum >= 300 && codeNum < 400) {
    category = 'Antioxidante / Acidulante';
    risk = codeNum === 320 || codeNum === 321 ? 'high' : 'safe';
    description = 'Evita la oxidación lipídica o regula la acidez del producto.';
  } else if (codeNum >= 400 && codeNum < 500) {
    category = 'Emulgente / Espesante';
    risk = codeNum === 407 ? 'high' : 'moderate';
    description = 'Modifica la textura, homogeneidad y sensación en boca.';
  } else if (codeNum >= 600 && codeNum < 700) {
    category = 'Potenciador del sabor';
    risk = 'high';
    description = 'Estimula los receptores gustativos para hacer el alimento hiperpalatable.';
  } else if (codeNum >= 900 && codeNum < 1000) {
    category = 'Edulcorante / Gas de envasado';
    risk = 'high';
    description = 'Sustituto del azúcar u otro agente técnico de textura y dulzor.';
  }

  return {
    code: codeUpper.startsWith('E') ? codeUpper : `E${codeUpper}`,
    name: `Aditivo ${codeUpper}`,
    category,
    risk,
    description,
  };
}
