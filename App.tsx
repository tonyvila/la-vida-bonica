import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';

// --- Data Types ---
interface RecipeData {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: string;
  defaultServings: number;
  ingredients: { id: string; baseQuantity: number | null; unit: string; name: string }[];
  steps: string[];
}

// --- Recipe Data ---
const RECIPES: RecipeData[] = [
  {
    id: 'costillas-cerdo-horno',
    title: 'Costillas de cerdo al horno',
    category: 'Carne',
    summary: 'Costillas de cerdo al horno en papillote. Se tarda poco en preparar, el horno hace el trabajo, y le gustan a pequeños y mayores.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/07/COSTILLAS.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'kg de', name: 'costillas de cerdo' },
      { id: '2', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla a temperatura ambiente' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'tomillo' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'cebolla en polvo' },
    ],
    steps: [
      'Precalentar el horno a 150º. Preparar la salsa mezclando el tomate triturado, salsa de soja, mantequilla, tomillo, ajo en polvo y cebolla en polvo.',
      'Extender papel aluminio sobre la bandeja de horno, colocar el costillar, salpimentar y embadurnar con la salsa por ambas caras.',
      'Envolver herméticamente el costillar en el papel (técnica papillote) e introducir al horno 90 minutos a 150º.',
      'Sacar del horno, subir temperatura a 180º, quitar el papel y hornear 30 minutos más hasta que quede crujiente.',
    ],
  },
  {
    id: 'salmorejo-sin-pan',
    title: 'Salmorejo sin pan',
    category: 'Entrantes',
    summary: 'Salmorejo sin pan y con menos aceite que la receta original. Más ligero pero igual de sabrosón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/06/IMG_20190610_124831-1-1024x641.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'kg de', name: 'tomates maduros' },
      { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'AOVE' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y vinagre de Jérez' },
      { id: '6', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '7', baseQuantity: null, unit: '', name: 'Jamón serrano sin aditivos' },
    ],
    steps: [
      'Echar en el vaso los tomates sin pelar y las zanahorias peladas, todo bien lavado y en trozos homogéneos. Añadir el diente de ajo y programar 30 segundos en Vel 5.',
      'Bajar la verdura de las paredes del vaso, añadir 25 gr de vinagre de Jérez y una cucharadita de sal y programar 4 minutos en Vel máxima.',
      'Una vez pasados los 4 minutos volver a programar en Vel 5 y por el brocal ir añadiendo AOVE (4 cucharadas aprox).',
      'Acompañar de huevo cocido y jamón picado. Si se prepara antes, envasar en recipiente hermético y a la nevera.',
    ],
  },
  {
    id: 'nachos-con-guacamole',
    title: 'Nachos con guacamole',
    category: 'Hidrato de carbono',
    summary: 'Nachos caseros de harina de garbanzo horneados con guacamole fresco. Un snack saludable para dipear.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_180602-e1662738748888.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'harina de garbanzo' },
      { id: '2', baseQuantity: 60, unit: 'ml de', name: 'agua' },
      { id: '3', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'tandori masala' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '8', baseQuantity: 4, unit: 'cucharadas de', name: 'AOVE' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal al gusto' },
      { id: '10', baseQuantity: 2, unit: '', name: 'aguacates' },
      { id: '11', baseQuantity: 2, unit: '', name: 'tomates rojos maduros' },
      { id: '12', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '13', baseQuantity: null, unit: '', name: 'Zumo de limón' },
    ],
    steps: [
      'Mezclar harina de garbanzo, agua, especias (comino, pimentón, tandori masala, ajo y cebolla en polvo), 4 cucharadas de AOVE y sal hasta obtener masa compacta.',
      'Colocar masa entre 2 hojas de papel vegetal, aplastar con rodillo hasta 0,5 cm de grosor.',
      'Hornear a 170º durante 15 minutos.',
      'Para el guacamole: chafar 2 aguacates maduros con tenedor, incorporar 2 tomates y 1 cebolleta rallados. Aliñar con zumo de limón, sal y pimienta.',
    ],
  },
  {
    id: 'salteado-ternera-setas-quinoa',
    title: 'Salteado de ternera con setas y quinoa',
    category: 'Carne',
    summary: 'Salteado de ternera picada con setas y quinoa condimentado con ras el hanout, mezcla de especias marroquí.',
    image: 'https://lavidabonica.com/wp-content/uploads/2021/01/carne.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'carne de ternera picada' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'setas' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita colmada de', name: 'ras el hanout' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'quinoa' },
      { id: '7', baseQuantity: null, unit: '', name: 'Uvas para acompañar' },
    ],
    steps: [
      'Cocinar 100 gr de quinoa lavada en agua hirviendo con sal durante 12 minutos. Escurrir y reservar.',
      'En sartén ancha con AOVE, sofreír 1 cebolleta picada a fuego medio-bajo durante 5 minutos.',
      'Subir fuego, agregar 400 gr de ternera picada y remover para sellar.',
      'Incorporar 300 gr de setas laminadas, 1 cucharadita de ras el hanout y sal. Remover a fuego alto para sellar. Cocinar a fuego lento 2-3 minutos.',
      'Acompañar con quinoa y uvas.',
    ],
  },
  {
    id: 'pollo-salsa-soja-tomates-secos',
    title: 'Pollo en salsa de soja con tomates secos',
    category: 'Carne',
    summary: 'Pollo campero en olla rápida con salsa de soja, tomates secos y especias. Receta sencilla y muy resultona.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200626_173609-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 0.5, unit: '', name: 'pollo campero troceado' },
      { id: '2', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'mostaza' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'tomate concentrado' },
      { id: '5', baseQuantity: 2, unit: '', name: 'tomates secos hidratados en AOVE' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'jengibre' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '11', baseQuantity: 1, unit: '', name: 'pimiento verde italiano en rodajas' },
      { id: '12', baseQuantity: 0.5, unit: '', name: 'cebolla picada' },
    ],
    steps: [
      'En olla rápida poner pollo troceado, salsa de soja, mostaza, tomate concentrado, tomates secos, especias (comino, pimentón, cúrcuma, jengibre), sal y pimienta.',
      'Cubrir con agua, cerrar y llevar a fuego fuerte hasta que rompa a hervir.',
      'Bajar fuego y cocinar chup chup 25 minutos.',
      'Abrir y si queda mucha salsa, desatapar y subir fuego hasta consumir el agua.',
    ],
  },
  {
    id: 'lubina-salsa-champinones',
    title: 'Lubina con salsa de champiñones',
    category: 'Pescado',
    summary: 'Lomos de lubina dorados con cremosa salsa de champiñones, vino blanco y hierbas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_175732-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'lubinas grandes (lomos)' },
      { id: '2', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 6, unit: '', name: 'champiñones grandes' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'harina integral' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'vino blanco' },
      { id: '8', baseQuantity: 150, unit: 'ml de', name: 'caldo de verduras o agua' },
    ],
    steps: [
      'En sartén ancha con AOVE, dorar lomos de lubina 1 minuto por cada lado. Reservar.',
      'En la misma sartén, sofreír con mantequilla y AOVE 1 cebolla picada durante 3-4 minutos a fuego medio.',
      'Subir fuego, añadir 6 champiñones picados y remover 2 minutos para sellar.',
      'Añadir harina integral y remover. Incorporar vino blanco y dejar evaporar alcohol.',
      'Agregar caldo o agua, sal y pimienta. Cocinar chup chup 5 minutos.',
      'Triturar para obtener consistencia de crema. Servir con la lubina.',
    ],
  },
  {
    id: 'merluza-salsa-puerros',
    title: 'Merluza en salsa de puerros',
    category: 'Pescado',
    summary: 'Lomos de merluza en cremosa salsa de puerros con albahaca. Ideal para acompañar con arroz.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200606_210922.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomos de merluza' },
      { id: '2', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 200, unit: 'ml de', name: 'caldo de pescado' },
      { id: '5', baseQuantity: 50, unit: 'ml de', name: 'leche' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En sartén ancha con AOVE, sellar lomos de merluza vuelta y vuelta. Reservar.',
      'En misma sartén con AOVE, sofreír 2 puerros y 2 ajos picados a fuego medio durante 5 minutos.',
      'Añadir caldo de pescado, leche, albahaca, sal y pimienta. Cocinar chup chup 5 minutos.',
      'Triturar bien para crear la salsa.',
      'Volver a poner en sartén con lomos de merluza y dar hervor conjunto de 1 minuto.',
    ],
  },
  {
    id: 'galletas-naranja-almendra',
    title: 'Galletas de naranja y almendra',
    category: 'Postres',
    summary: 'Galletas de naranja y almendra con frosting de queso crema, miel y mantequilla. Irresistibles.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/02/IMG_20220202_195353-997x1024.jpg',
    defaultServings: 12,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'naranjas (exprimidas)' },
      { id: '2', baseQuantity: 4, unit: 'cucharadas de', name: 'pasta de dátil' },
      { id: '3', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 50, unit: 'ml de', name: 'nata fresca' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'almendra molida' },
      { id: '6', baseQuantity: 4, unit: 'cucharadas de', name: 'harina integral de trigo' },
      { id: '7', baseQuantity: 1, unit: 'sobre de', name: 'levadura química' },
      { id: '8', baseQuantity: 80, unit: 'gr de', name: 'queso crema natural' },
      { id: '9', baseQuantity: 30, unit: 'gr de', name: 'mantequilla (frosting)' },
      { id: '10', baseQuantity: 2, unit: 'cucharadas de', name: 'miel' },
    ],
    steps: [
      'Mezclar zumo de 3 naranjas con pasta de dátil, nata fresca y 20 gr de mantequilla.',
      'Incorporar almendra molida, harina integral y levadura. Mezclar bien.',
      'Formar galletas y hornear hasta dorar.',
      'Para frosting: mezclar queso crema, 30 gr de mantequilla y miel. Decorar galletas cuando estén frías.',
    ],
  },
  {
    id: 'cookies-chocolate',
    title: 'Cookies de chocolate',
    category: 'Postres',
    summary: 'Cookies de chocolate caseras hechas con ingredientes saludables. Firmes por fuera y mórbidas por dentro.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200607_173009.jpg',
    defaultServings: 10,
    ingredients: [
      { id: '1', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'harina integral' },
      { id: '3', baseQuantity: 0.5, unit: 'sobre de', name: 'levadura química' },
      { id: '4', baseQuantity: 150, unit: 'gr de', name: 'chocolate +70% cacao' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '6', baseQuantity: 80, unit: 'gr de', name: 'leche en polvo' },
      { id: '7', baseQuantity: 4, unit: '', name: 'dátiles medjoul' },
      { id: '8', baseQuantity: null, unit: '', name: 'Pizca de sal' },
    ],
    steps: [
      'Calentar 200 ml de leche con 4 dátiles. Al hervir, apagar fuego, añadir 50 gr de leche en polvo y batir. Reservar.',
      'Derretir 30 gr de mantequilla y 100 gr de chocolate a fuego lento hasta ligar.',
      'Retirar del fuego, añadir mezcla anterior y 30 gr más de leche en polvo. Mezclar.',
      'Incorporar harina tamizada, levadura y sal. Refrigerar 30 minutos.',
      'Precalentar horno a 170º. Trocear 50 gr de chocolate y añadir a masa.',
      'Formar 10 bolas, aplastar ligeramente y hornear 15 minutos a 170º. Deben quedar firmes fuera y mórbidas dentro.',
    ],
  },
  {
    id: 'ensalada-quinoa-edamames',
    title: 'Ensalada de quinoa y edamames',
    category: 'Hidrato de carbono',
    summary: 'Ensalada fresca de quinoa con edamames y repollo con vinagreta de soja, jengibre y limón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200622_230140.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'edamames congelados' },
      { id: '3', baseQuantity: 0.25, unit: '', name: 'repollo' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'AOVE' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: null, unit: '', name: 'Jengibre fresco rallado (2 cm)' },
      { id: '7', baseQuantity: 0.5, unit: '', name: 'limón (zumo)' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal' },
    ],
    steps: [
      'Cocinar quinoa lavada en agua hirviendo durante 12 minutos. Escurrir y reservar.',
      'Cocinar edamames en agua hirviendo durante 5 minutos. Reservar y desgranar cuando atemperen.',
      'Mezclar quinoa, edamames desgranados y ¼ de repollo cortado en juliana fina.',
      'Preparar vinagreta con AOVE, salsa de soja, jengibre rallado, zumo de limón y sal.',
      'Añadir vinagreta, mezclar bien y guardar en nevera hasta consumir.',
    ],
  },
  {
    id: 'sopa-tomate',
    title: 'Sopa de tomate',
    category: 'Sopa',
    summary: 'Sopa reconfortante de tomate con verduras y jengibre. Acompañada de huevo cocido y aceitunas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200416_154326.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'tomates maduros' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 700, unit: 'ml de', name: 'agua o caldo de verduras' },
      { id: '8', baseQuantity: null, unit: '', name: 'Jengibre fresco (1 cm)' },
      { id: '9', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '10', baseQuantity: 12, unit: '', name: 'aceitunas' },
    ],
    steps: [
      'En olla con AOVE, sofreír pimiento, zanahorias, cebolla y ajo troceados durante 3 minutos a fuego medio.',
      'Añadir tomates en dados, jengibre picado, agua o caldo, sal y pimienta. Cocinar chup chup 15 minutos.',
      'Triturar hasta conseguir consistencia deseada.',
      'Acompañar con huevo cocido y aceitunas.',
    ],
  },
  {
    id: 'sopa-pescado-gambas',
    title: 'Sopa de pescado y gambas',
    category: 'Pescado',
    summary: 'Sopa marinera con caldo casero de pescado, fideos integrales, bacalao y gambas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200511_165903_resized_20200511_050951800.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Raspa y cabeza de merluza' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'pescado blanco (bacalao)' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'colas de gambas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'tomate frito casero' },
      { id: '6', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '8', baseQuantity: 100, unit: 'gr de', name: 'fideos finos integrales' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
    ],
    steps: [
      'Cocer raspa y cabeza de merluza en 1 litro de agua con sal y laurel durante 15 minutos. Colar caldo y reservar.',
      'En olla con AOVE, saltear gambas sellando bien. Reservar.',
      'Saltear pescado blanco. Reservar.',
      'Sofreír cebolla picada 5 minutos a fuego medio con AOVE. Incorporar tomate frito y pimentón. Mezclar.',
      'Verter caldo reservado y llevar a ebullición. Incorporar fideos, pescado y gambas.',
      'Cocinar hasta que fideos estén hechos. Corregir sal.',
    ],
  },
].sort((a, b) => a.title.localeCompare(b.title));

// --- Helpers ---
const getDailyRecommendations = (recipes: RecipeData[], count: number): RecipeData[] => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Simple seeded shuffle
  const shuffled = [...recipes];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const DAILY_PICKS = getDailyRecommendations(RECIPES, 2);

const formatQuantity = (baseQty: number, servings: number, defaultServings: number): string => {
  const scaled = (baseQty * servings) / defaultServings;
  if (scaled >= 100) return Math.round(scaled).toString();
  if (scaled >= 10) return (Math.round(scaled * 10) / 10).toString();
  return (Math.round(scaled * 100) / 100).toString();
};

// --- Recipe Screen ---
function RecipeScreen({ recipe, onBack }: { recipe: RecipeData; onBack: () => void }) {
  useKeepAwake();
  const [servings, setServings] = useState(recipe.defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const servingsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const getIngredientText = (ing: RecipeData['ingredients'][0]): string => {
    if (ing.baseQuantity === null) return ing.name;
    const qty = formatQuantity(ing.baseQuantity, servings, recipe.defaultServings);
    const unit = ing.unit ? ` ${ing.unit}` : '';
    return `${qty}${unit} ${ing.name}`;
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.backButtonText}>← Recetas</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.summary}>{recipe.summary}</Text>
      </View>

      <View style={styles.servingsContainer}>
        <Text style={styles.servingsLabel}>Raciones</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownOpen(true)} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>{servings}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Raciones</Text>
            {servingsOptions.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.modalOption, n === servings && styles.modalOptionSelected]}
                onPress={() => { setServings(n); setDropdownOpen(false); }}
              >
                <Text style={[styles.modalOptionText, n === servings && styles.modalOptionTextSelected]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {recipe.ingredients.map(item => (
          <TouchableOpacity key={item.id} style={styles.checkItem} onPress={() => toggleIngredient(item.id)} activeOpacity={0.7}>
            <View style={[styles.checkbox, checkedIngredients.has(item.id) && styles.checkboxChecked]}>
              {checkedIngredients.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, checkedIngredients.has(item.id) && styles.itemTextChecked]}>
              {getIngredientText(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preparación</Text>
        {recipe.steps.map((step, idx) => (
          <TouchableOpacity key={idx} style={styles.checkItem} onPress={() => toggleStep(idx)} activeOpacity={0.7}>
            <View style={[styles.checkbox, checkedSteps.has(idx) && styles.checkboxChecked]}>
              {checkedSteps.has(idx) ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.stepNumber}>{idx + 1}</Text>
              )}
            </View>
            <Text style={[styles.itemText, checkedSteps.has(idx) && styles.itemTextChecked]}>{step}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🍽️ ¡Buen provecho! 🍽️</Text>
      </View>
    </ScrollView>
  );
}

// --- Home Screen ---
function HomeScreen({ onSelectRecipe }: { onSelectRecipe: (recipe: RecipeData) => void }) {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.homeContent}>
      {/* Recomendaciones del día */}
      <Text style={styles.homeSectionTitle}>Recomendaciones del día</Text>
      {DAILY_PICKS.map(recipe => (
        <TouchableOpacity
          key={recipe.id}
          style={styles.recipeCard}
          onPress={() => onSelectRecipe(recipe)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: recipe.image }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{recipe.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>{recipe.summary}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Todas las recetas */}
      <Text style={[styles.homeSectionTitle, { marginTop: 32 }]}>Todas las recetas</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Receta</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Categoría</Text>
        </View>
        {RECIPES.map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.tableRow}
            onPress={() => onSelectRecipe(recipe)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tableCell, { flex: 2 }]}>{recipe.title}</Text>
            <Text style={[styles.tableCellCategory, { flex: 1 }]}>{recipe.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// --- App ---
export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setSelectedRecipe(null)} activeOpacity={0.7}>
          <Image
            source={{ uri: 'https://lavidabonica.com/wp-content/uploads/2024/02/logo-small.png' }}
            style={styles.navLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {selectedRecipe ? (
        <RecipeScreen recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
      ) : (
        <HomeScreen onSelectRecipe={setSelectedRecipe} />
      )}
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEEDD',
  },
  navbar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  navLogo: {
    width: 150,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  // Home
  homeContent: {
    padding: 20,
    paddingBottom: 40,
  },
  homeSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 6,
  },
  cardSummary: {
    fontFamily: 'Karla',
    fontSize: 14,
    color: '#4a5229',
    lineHeight: 20,
  },
  // Table
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#707940',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEDD',
  },
  tableCell: {
    fontFamily: 'Karla',
    fontSize: 15,
    color: '#424242',
  },
  tableCellCategory: {
    fontFamily: 'Karla',
    fontSize: 14,
    color: '#707940',
    fontWeight: '600',
  },
  // Recipe
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backButtonText: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#707940',
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 12,
    textAlign: 'center',
  },
  summary: {
    fontFamily: 'Karla',
    fontSize: 15,
    color: '#4a5229',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servingsLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEEDD',
    borderWidth: 2,
    borderColor: '#707940',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  dropdownText: {
    fontFamily: 'Karla',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#707940',
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#707940',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 200,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 12,
  },
  modalOption: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#707940',
  },
  modalOptionText: {
    fontFamily: 'Karla',
    fontSize: 18,
    color: '#424242',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    color: '#707940',
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#707940',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#707940',
    borderColor: '#707940',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumber: {
    color: '#707940',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
    fontFamily: 'Karla',
    flex: 1,
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  itemTextChecked: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  footerText: {
    fontFamily: 'Karla',
    fontSize: 20,
    color: '#707940',
  },
});
