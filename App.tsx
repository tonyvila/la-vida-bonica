import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput, Animated } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Star, Menu, X, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, ShoppingCart, Trash2, Beef, Fish, Apple, Milk, Croissant, Wheat, Package, Droplets, Nut, Wine, Cake, HelpCircle, LayoutGrid, List } from 'lucide-react';

// --- localStorage Helpers ---
const getFavourites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('favourites') || '[]');
  } catch {
    return [];
  }
};

const toggleFavourite = (recipeId: string): string[] => {
  const favs = getFavourites();
  const updated = favs.includes(recipeId)
    ? favs.filter(id => id !== recipeId)
    : [...favs, recipeId];
  localStorage.setItem('favourites', JSON.stringify(updated));
  return updated;
};

// --- Weekly Planner Helpers ---
type WeeklyPlan = { [weekKey: string]: string[] };

const getWeekKey = (date: Date): string => {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeeklyPlan = (): WeeklyPlan => {
  try {
    return JSON.parse(localStorage.getItem('weeklyPlan') || '{}');
  } catch {
    return {};
  }
};

const addRecipeToWeek = (recipeId: string, weekKey: string): void => {
  const plan = getWeeklyPlan();
  if (!plan[weekKey]) plan[weekKey] = [];
  if (!plan[weekKey].includes(recipeId)) {
    plan[weekKey].push(recipeId);
  }
  localStorage.setItem('weeklyPlan', JSON.stringify(plan));
};

const removeRecipeFromWeek = (recipeId: string, weekKey: string): void => {
  const plan = getWeeklyPlan();
  if (plan[weekKey]) {
    plan[weekKey] = plan[weekKey].filter(id => id !== recipeId);
    if (plan[weekKey].length === 0) delete plan[weekKey];
  }
  localStorage.setItem('weeklyPlan', JSON.stringify(plan));
};

const getShoppingChecked = (weekKey: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(`shoppingChecked_${weekKey}`) || '[]');
  } catch {
    return [];
  }
};

const toggleShoppingChecked = (ingredient: string, weekKey: string): void => {
  const checked = getShoppingChecked(weekKey);
  const updated = checked.includes(ingredient)
    ? checked.filter(i => i !== ingredient)
    : [...checked, ingredient];
  localStorage.setItem(`shoppingChecked_${weekKey}`, JSON.stringify(updated));
};

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
  nutrition: {
    totalWeightGrams: number;
    perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
    per100g: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  };
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
    nutrition: {
      totalWeightGrams: 2145,
      perServing: { calories: 944, protein: 50.4, carbs: 0.9, fat: 82.1, fiber: 0.2 },
      per100g: { calories: 264, protein: 14.1, carbs: 0.3, fat: 23.0, fiber: 0.1 },
    },
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
    nutrition: {
      totalWeightGrams: 1384,
      perServing: { calories: 250, protein: 10.5, carbs: 14.3, fat: 18.0, fiber: 4.2 },
      per100g: { calories: 72, protein: 3.0, carbs: 4.1, fat: 5.2, fiber: 1.2 },
    },
  },
  {
    id: 'nachos-con-guacamole',
    title: 'Nachos con guacamole',
    category: 'Hidratos',
    summary: 'Nachos caseros de harina de garbanzo horneados con guacamole fresco. Un snack saludable para dipear.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_180549-1.jpg',
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
    nutrition: {
      totalWeightGrams: 820,
      perServing: { calories: 418, protein: 11.1, carbs: 33.8, fat: 27.9, fiber: 12.5 },
      per100g: { calories: 204, protein: 5.4, carbs: 16.5, fat: 13.6, fiber: 6.1 },
    },
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
    nutrition: {
      totalWeightGrams: 900,
      perServing: { calories: 312, protein: 32.3, carbs: 21.5, fat: 9.4, fiber: 3.7 },
      per100g: { calories: 138, protein: 14.3, carbs: 9.6, fat: 4.2, fiber: 1.6 },
    },
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
    nutrition: {
      totalWeightGrams: 1200,
      perServing: { calories: 285, protein: 32.1, carbs: 8.2, fat: 13.5, fiber: 1.2 },
      per100g: { calories: 95, protein: 10.7, carbs: 2.7, fat: 4.5, fiber: 0.4 },
    },
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
    nutrition: {
      totalWeightGrams: 850,
      perServing: { calories: 268, protein: 28.4, carbs: 10.6, fat: 12.1, fiber: 1.4 },
      per100g: { calories: 126, protein: 13.4, carbs: 5, fat: 5.7, fiber: 0.7 },
    },
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
    nutrition: {
      totalWeightGrams: 1000,
      perServing: { calories: 195, protein: 30.2, carbs: 8.7, fat: 4.1, fiber: 1.8 },
      per100g: { calories: 78, protein: 12.1, carbs: 3.5, fat: 1.6, fiber: 0.7 },
    },
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
    nutrition: {
      totalWeightGrams: 520,
      perServing: { calories: 218, protein: 5.8, carbs: 23.1, fat: 11.7, fiber: 3.2 },
      per100g: { calories: 503, protein: 13.4, carbs: 53.4, fat: 27, fiber: 7.4 },
    },
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
    nutrition: {
      totalWeightGrams: 580,
      perServing: { calories: 256, protein: 8.7, carbs: 28.4, fat: 12.6, fiber: 3.8 },
      per100g: { calories: 441, protein: 15, carbs: 48.9, fat: 21.7, fiber: 6.6 },
    },
  },
  {
    id: 'ensalada-quinoa-edamames',
    title: 'Ensalada de quinoa y edamames',
    category: 'Hidratos',
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
    nutrition: {
      totalWeightGrams: 1050,
      perServing: { calories: 348, protein: 18.7, carbs: 35.2, fat: 15.2, fiber: 9.8 },
      per100g: { calories: 133, protein: 7.1, carbs: 13.4, fat: 5.8, fiber: 3.7 },
    },
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
    nutrition: {
      totalWeightGrams: 1500,
      perServing: { calories: 188, protein: 11.3, carbs: 14.2, fat: 9.6, fiber: 3.8 },
      per100g: { calories: 50, protein: 3, carbs: 3.8, fat: 2.6, fiber: 1 },
    },
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
    nutrition: {
      totalWeightGrams: 1300,
      perServing: { calories: 245, protein: 32.4, carbs: 18.7, fat: 4.2, fiber: 1.5 },
      per100g: { calories: 75, protein: 10, carbs: 5.7, fat: 1.3, fiber: 0.5 },
    },
  },
  {
    id: 'ensalada-remolacha-asada-naranja',
    title: 'Ensalada con remolacha asada y naranja',
    category: 'Verdura',
    summary: 'Ensalada invernal con remolacha y naranja asadas al horno, acompañadas de cebolla, nueces y hojas verdes.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/01/IMG_20220118_220520-973x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'remolachas enteras' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebollas' },
      { id: '3', baseQuantity: null, unit: 'Un puñado de', name: 'nueces' },
      { id: '4', baseQuantity: 2, unit: '', name: 'naranjas' },
      { id: '5', baseQuantity: null, unit: '', name: 'Hojas verdes' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y vinagre' },
    ],
    steps: [
      'Lavar bien las remolachas, pelar la cebolla y envolver cada pieza individualmente en papel vegetal o aluminio.',
      'Hornear a 190º durante 45 minutos.',
      'Pelar las nueces y desgajar las naranjas. Reservar.',
      'Una vez asadas y atemperadas las remolachas y cebollas, trocearlas.',
      'Mezclar todos los ingredientes con hojas verdes y aliñar con AOVE, sal y vinagre al servir.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: { calories: 236, protein: 4.2, carbs: 31.5, fat: 11.3, fiber: 6.4 },
      per100g: { calories: 94, protein: 1.7, carbs: 12.6, fat: 4.5, fiber: 2.6 },
    },
  },
  {
    id: 'hamburguesas-calabaza-gorgonzola',
    title: 'Hamburguesas de calabaza con gorgonzola',
    category: 'Verdura',
    summary: 'Hamburguesas vegetales de calabaza asada con queso gorgonzola, queso fresco y harina de avena.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_175655.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1000, unit: 'gr de', name: 'calabaza asada' },
      { id: '2', baseQuantity: 125, unit: 'gr de', name: 'queso fresco batido' },
      { id: '3', baseQuantity: 6, unit: 'cucharadas de', name: 'harina de avena' },
      { id: '4', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'queso gorgonzola' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Asar la calabaza a 190º durante 40 minutos.',
      'Mezclar la calabaza asada, queso fresco batido, harina de avena, huevo, gorgonzola picado, sal y pimienta.',
      'Dejar reposar en la nevera 30-60 minutos para facilitar el moldeado.',
      'Dar forma a las hamburguesas y cocinar en sartén con AOVE o en el horno.',
    ],
    nutrition: {
      totalWeightGrams: 1430,
      perServing: { calories: 195, protein: 11.8, carbs: 14.6, fat: 10.7, fiber: 1.7 },
      per100g: { calories: 55, protein: 3.3, carbs: 4.1, fat: 3, fiber: 0.5 },
    },
  },
  {
    id: 'crema-puerros',
    title: 'Crema de puerros',
    category: 'Verdura',
    summary: 'Crema suave de puerros con patata, cebolleta y comino, perfecta para cualquier época del año.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200531_224414.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'puerros' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '5', baseQuantity: 800, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Poner mantequilla en olla a fuego medio-alto. Cuando se derrita añadir puerros, cebolleta y patata lavados, pelados y en dados.',
      'Sofreír 3-4 minutos removiendo hasta que la cebolleta esté transparente.',
      'Añadir caldo de verduras, comino, sal y pimienta. Llevar a ebullición.',
      'Bajar a fuego medio-bajo y cocinar 10-12 minutos.',
      'Escurrir y triturar hasta obtener la textura deseada.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: { calories: 138, protein: 3.2, carbs: 16.4, fat: 6.8, fiber: 2.8 },
      per100g: { calories: 42, protein: 1, carbs: 5, fat: 2.1, fiber: 0.9 },
    },
  },
  {
    id: 'tortilla-guisantes-ajos-tiernos',
    title: 'Tortilla de guisantes y ajos tiernos',
    category: 'Verdura',
    summary: 'Tortilla de guisantes con cebolleta, ajos tiernos y garam masala, perfecta para cualquier comida.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200531_224002.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'guisantes congelados' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 3, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'garam masala' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Saltear la cebolleta y los ajos tiernos bien picados en sartén ancha con AOVE a fuego medio durante 3 minutos.',
      'Añadir los guisantes congelados, garam masala, sal y pimienta. Saltear 5 minutos más a fuego medio.',
      'Batir los huevos, mezclar con la verdura sofrita.',
      'Cuajar la tortilla en la misma sartén.',
    ],
    nutrition: {
      totalWeightGrams: 750,
      perServing: { calories: 285, protein: 21.2, carbs: 15.8, fat: 16.1, fiber: 6.2 },
      per100g: { calories: 152, protein: 11.3, carbs: 8.4, fat: 8.6, fiber: 3.3 },
    },
  },
  {
    id: 'berenjenas-rellenas-quinoa',
    title: 'Berenjenas rellenas de quinoa',
    category: 'Verdura',
    summary: 'Berenjenas asadas rellenas de quinoa, pollo, verduras y mozzarella gratinada al horno.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200528_224544-1024x859.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebollas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '4', baseQuantity: 150, unit: 'gr de', name: 'quinoa cocida' },
      { id: '5', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'caldo de pollo' },
      { id: '7', baseQuantity: 250, unit: 'gr de', name: 'mozzarella' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Asar las berenjenas enteras en horno a 180º durante 40 minutos.',
      'Cocer la quinoa en agua hirviendo con sal durante 12 minutos. Escurrir.',
      'Sofreír 2 cebollas picadas con AOVE a fuego medio. Cuando estén transparentes, subir fuego y añadir la pechuga de pollo picada. Sellar bien y reservar.',
      'Vaciar las berenjenas asadas con cuchara, picar su pulpa y añadirla a la sartén junto con la quinoa, orégano, salsa de tomate y caldo de pollo. Cocinar 2 minutos a fuego medio.',
      'Rellenar las pieles de berenjena, coronar con mozzarella y hornear 5 minutos para fundir el queso.',
    ],
    nutrition: {
      totalWeightGrams: 1650,
      perServing: { calories: 378, protein: 32.7, carbs: 30.5, fat: 13.2, fiber: 7.1 },
      per100g: { calories: 92, protein: 7.9, carbs: 7.4, fat: 3.2, fiber: 1.7 },
    },
  },
  {
    id: 'zanahorias-horno-queso-cabra',
    title: 'Zanahorias al horno con queso de cabra',
    category: 'Verdura',
    summary: 'Zanahorias especiadas al horno con limón, comino y ajo, acompañadas de queso de cabra.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200504_153452.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'zanahorias' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'limón (zumo)' },
      { id: '3', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Queso de cabra (opcional)' },
    ],
    steps: [
      'Precalentar el horno a 190º.',
      'Lavar, pelar y cortar las zanahorias en juliana de medio centímetro.',
      'Colocar en recipiente apto para horno. Aliñar con ajo picado, zumo de limón, comino, AOVE, sal y pimienta.',
      'Hornear 25 minutos a 190º, luego subir a 220º y hornear 15 minutos más para que queden crujientes.',
      'Acompañar con queso de cabra al servir.',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: { calories: 145, protein: 2.8, carbs: 18.7, fat: 6.9, fiber: 4.2 },
      per100g: { calories: 97, protein: 1.9, carbs: 12.5, fat: 4.6, fiber: 2.8 },
    },
  },
  {
    id: 'solomillos-pavo-coco-pina',
    title: 'Solomillos de pavo con salsa de coco y piña',
    category: 'Carne',
    summary: 'Solomillos de pavo en salsa tropical de leche de coco, piña, jengibre y cúrcuma.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_180515-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'solomillo de pavo' },
      { id: '2', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '3', baseQuantity: 70, unit: 'gr de', name: 'piña (de lata)' },
      { id: '4', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '5', baseQuantity: null, unit: 'Trozo de 2 cm de', name: 'jengibre fresco' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En olla con AOVE, saltear los solomillos de pavo troceados junto con 2 puerros picados.',
      'Una vez dorados, añadir piña picada, jengibre fresco, cúrcuma, leche de coco, sal y pimienta.',
      'Dejar chup chup a fuego medio durante 10 minutos.',
      'Opcionalmente triturar la salsa para que quede uniforme.',
    ],
    nutrition: {
      totalWeightGrams: 1270,
      perServing: { calories: 348, protein: 42.1, carbs: 11.8, fat: 15.2, fiber: 2.3 },
      per100g: { calories: 110, protein: 13.3, carbs: 3.7, fat: 4.8, fiber: 0.7 },
    },
  },
  {
    id: 'muslos-pollo-uvas-pasas',
    title: 'Muslos de pollo en salsa de uvas pasas',
    category: 'Carne',
    summary: 'Muslos de pollo al horno con verduras y salsa de ciruelas pasas, coñac y especias.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200523_212919_resized_20200524_111230700.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'muslos de pollo' },
      { id: '2', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '4', baseQuantity: 3, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '6', baseQuantity: 30, unit: 'gr de', name: 'ciruelas pasas' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'coñac' },
      { id: '8', baseQuantity: 400, unit: 'ml de', name: 'caldo de pollo' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '10', baseQuantity: 0.5, unit: 'cucharadita de', name: 'canela' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Salpimentar los muslos de pollo, añadir albahaca y canela, restregar bien.',
      'Precalentar horno a 200º. En bandeja apta para horno colocar la carne, puerros, zanahorias y tomates troceados, patatas en cuartos, ciruelas pasas, AOVE y coñac.',
      'Hornear 15 minutos. Añadir caldo de pollo y hornear 60 minutos más.',
      'Triturar puerros, tomates, zanahorias y pasas hasta obtener consistencia cremosa. Servir sobre la carne y las patatas.',
    ],
    nutrition: {
      totalWeightGrams: 1730,
      perServing: { calories: 342, protein: 32.4, carbs: 28.7, fat: 11.6, fiber: 4.5 },
      per100g: { calories: 119, protein: 11.2, carbs: 10, fat: 4, fiber: 1.6 },
    },
  },
  {
    id: 'pavo-salsa-ajo-almendras',
    title: 'Pavo en salsa de ajo y almendras',
    category: 'Carne',
    summary: 'Guiso de pavo con majado de ajos, almendras y pan, en salsa de vino blanco y pimentón ahumado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200513_154155.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'pavo para guisar' },
      { id: '2', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 35, unit: 'gr de', name: 'pan integral (3 rebanadas)' },
      { id: '4', baseQuantity: 10, unit: '', name: 'almendras' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'pimientos asados (opcional)' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'tomate natural triturado' },
      { id: '8', baseQuantity: 200, unit: 'ml de', name: 'vino blanco' },
      { id: '9', baseQuantity: 400, unit: 'ml de', name: 'caldo de pollo' },
      { id: '10', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '11', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír ajos laminados, pan y almendras en la olla con AOVE a fuego medio (por separado para que no se quemen). Reservar en procesador.',
      'Sellar la carne de pavo en la olla con AOVE a fuego medio-alto.',
      'Mientras, triturar ajos, pan y almendras con pimentón ahumado, tomate triturado y vino blanco.',
      'Añadir el majado triturado a la carne, junto con laurel, pimientos asados y caldo de pollo. Cocinar chup chup 20 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: { calories: 385, protein: 44.2, carbs: 18.4, fat: 15.3, fiber: 2.8 },
      per100g: { calories: 106, protein: 12.2, carbs: 5.1, fat: 4.2, fiber: 0.8 },
    },
  },
  {
    id: 'albondigas-pollo-salsa-almendras',
    title: 'Albóndigas de pollo en salsa de almendras',
    category: 'Carne',
    summary: 'Albóndigas de pollo al horno con cremosa salsa de almendras, roquefort y vino blanco.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200319_181147.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pollo picado' },
      { id: '2', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo picado' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'perejil picado' },
      { id: '5', baseQuantity: 7, unit: 'cucharadas rasas de', name: 'pan integral rallado' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal, pimienta y jengibre seco' },
      { id: '7', baseQuantity: 50, unit: 'gr de', name: 'queso roquefort' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla' },
      { id: '9', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '10', baseQuantity: 150, unit: 'ml de', name: 'caldo de pollo' },
      { id: '11', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '12', baseQuantity: 1, unit: 'cucharada de', name: 'mostaza' },
      { id: '13', baseQuantity: 70, unit: 'gr de', name: 'almendras tostadas sin sal' },
    ],
    steps: [
      'Mezclar pollo picado, huevos, ajos, perejil, jengibre, sal, pimienta y pan rallado. Reposar en nevera 30 minutos.',
      'Formar albóndigas y hornear a 180º durante 30 minutos.',
      'Para la salsa: pochar 1 cebolla picada con mantequilla en olla durante 2-3 minutos a fuego medio.',
      'Triturar roquefort, almendras, caldo, vino blanco y mostaza. Añadir a la olla con la cebolla. Cocinar chup chup 10 minutos.',
      'Mezclar las albóndigas horneadas con la salsa y dar un hervor conjunto.',
    ],
    nutrition: {
      totalWeightGrams: 1350,
      perServing: { calories: 468, protein: 48.7, carbs: 16.3, fat: 23.4, fiber: 3.1 },
      per100g: { calories: 139, protein: 14.4, carbs: 4.8, fat: 6.9, fiber: 0.9 },
    },
  },
  {
    id: 'pechugas-pavo-curry',
    title: 'Pechugas de pavo al curry',
    category: 'Carne',
    summary: 'Pechuga de pavo en salsa de curry con leche, queso rallado y granos de pimienta.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200129_160045.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pechuga de pavo' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'granos de pimienta' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'curry' },
      { id: '4', baseQuantity: 150, unit: 'ml de', name: 'leche' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso rallado' },
      { id: '6', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Dorar la cebolla y los ajos en sartén ancha con AOVE a fuego medio, removiendo ocasionalmente.',
      'Cuando la cebolla esté transparente, añadir la carne de pavo troceada y sellar a fuego medio-alto.',
      'Incorporar curry, granos de pimienta y leche. Dejar chup chup a fuego medio unos 10 minutos.',
      'Añadir queso rallado, remover y dejar fundir 2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: { calories: 268, protein: 38.5, carbs: 9.2, fat: 8.4, fiber: 0.7 },
      per100g: { calories: 113, protein: 16.2, carbs: 3.9, fat: 3.5, fiber: 0.3 },
    },
  },
  {
    id: 'guiso-marisco',
    title: 'Guiso de marisco',
    category: 'Pescado',
    summary: 'Guiso marinero espeso con preparado de marisco, langostinos, fideos y sofrito de verduras.',
    image: 'https://lavidabonica.com/wp-content/uploads/2021/01/guiso-marisco.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: 'tallo de', name: 'apio' },
      { id: '5', baseQuantity: 500, unit: 'ml de', name: 'caldo de pescado' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'tomillo' },
      { id: '8', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '9', baseQuantity: 300, unit: 'gr de', name: 'preparado para sopa o paella de marisco' },
      { id: '10', baseQuantity: 12, unit: '', name: 'langostinos crudos' },
      { id: '11', baseQuantity: 4, unit: 'puñados de', name: 'fideos gordos' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pelar langostinos. Hervir pieles y cabezas en cazo con 1 vaso de agua durante 5 minutos. Colar chafando bien para obtener fumet.',
      'En olla ancha con AOVE, sofreír cebolla, pimiento rojo, apio y ajos picados durante 10 minutos a fuego medio.',
      'Añadir vino blanco y dejar evaporar el alcohol. Incorporar el fumet y el caldo de pescado. Triturar todo hasta obtener crema.',
      'Agregar preparado de marisco, orégano, tomillo, fideos, sal y pimienta. Cocinar chup chup 5-6 minutos hasta que los fideos estén hechos.',
      'Incorporar los langostinos pelados y apagar el fuego. Se cocinarán con el calor residual.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 315, protein: 28.4, carbs: 32.7, fat: 6.8, fiber: 2.8 },
      per100g: { calories: 90, protein: 8.1, carbs: 9.3, fat: 1.9, fiber: 0.8 },
    },
  },
  {
    id: 'mousse-esparragos-atun',
    title: 'Mousse de espárragos y atún',
    category: 'Pescado',
    summary: 'Mousse al microondas de espárragos blancos, atún al natural, huevos y especias con curry.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200614_153820-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'espárragos blancos' },
      { id: '2', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 3, unit: 'latas de', name: 'atún al natural' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '6', baseQuantity: 30, unit: 'gr de', name: 'queso rallado' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'curry' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Batir los huevos en un bol grande.',
      'Agregar espárragos picados o triturados, cebolleta picada, atún al natural, nata fresca, curry, sal y pimienta. Mezclar bien.',
      'Verter en recipiente apto para microondas previamente engrasado con AOVE o mantequilla.',
      'Cocinar en microondas a máxima potencia durante 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 298, protein: 31.4, carbs: 7.2, fat: 16.1, fiber: 2.3 },
      per100g: { calories: 108, protein: 11.4, carbs: 2.6, fat: 5.8, fiber: 0.8 },
    },
  },
  {
    id: 'donuts-chocolate',
    title: 'Donuts con chocolate',
    category: 'Postres',
    summary: 'Donuts horneados con harina de avena, cacao y dátiles, cubiertos con cobertura de chocolate negro.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/10/donuts2.jpg',
    defaultServings: 12,
    ingredients: [
      { id: '1', baseQuantity: 220, unit: 'gr de', name: 'harina de avena' },
      { id: '2', baseQuantity: 30, unit: 'gr de', name: 'cacao en polvo sin azúcar' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita colmada de', name: 'levadura química' },
      { id: '4', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: 6, unit: '', name: 'dátiles' },
      { id: '6', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'aceite de coco' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'esencia de vainilla' },
      { id: '9', baseQuantity: null, unit: '', name: 'Una pizca de sal' },
      { id: '10', baseQuantity: 4, unit: 'onzas de', name: 'chocolate +80% cacao' },
    ],
    steps: [
      'Triturar dátiles con leche. Volcar en bol amplio, añadir huevos batidos, aceite de coco y vainilla. Mezclar.',
      'Incorporar harina de avena, cacao, levadura y sal. Remover hasta integrar.',
      'Rellenar moldes de donuts (puede usarse manga pastelera). Hornear a 180º durante 25 minutos.',
      'Dejar enfriar. Derretir chocolate con 1 cucharada de aceite de coco en microondas. Cubrir los donuts.',
    ],
    nutrition: {
      totalWeightGrams: 720,
      perServing: { calories: 224, protein: 8.3, carbs: 26.5, fat: 10.2, fiber: 3.7 },
      per100g: { calories: 373, protein: 13.9, carbs: 44.2, fat: 17, fiber: 6.2 },
    },
  },
  {
    id: 'helado-frutos-rojos-almendras',
    title: 'Helado de frutos rojos y almendras',
    category: 'Postres',
    summary: 'Helado cremoso de plátano, frutos rojos congelados, almendras y queso fresco batido.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200615_160752.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'plátanos maduros previamente congelados' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'frutos rojos congelados' },
      { id: '3', baseQuantity: 12, unit: '', name: 'almendras' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas colmadas de', name: 'queso fresco batido' },
      { id: '5', baseQuantity: 150, unit: 'ml de', name: 'bebida de almendras' },
    ],
    steps: [
      'Introducir todos los ingredientes en un procesador potente.',
      'Triturar bien hasta conseguir una consistencia cremosa y homogénea.',
    ],
    nutrition: {
      totalWeightGrams: 530,
      perServing: { calories: 185, protein: 5.8, carbs: 30.4, fat: 5.2, fiber: 4.8 },
      per100g: { calories: 140, protein: 4.4, carbs: 23, fat: 3.9, fiber: 3.6 },
    },
  },
  {
    id: 'ensalada-alubias-patatas',
    title: 'Ensalada de alubias con patatas',
    category: 'Hidratos',
    summary: 'Ensalada completa de alubias cocidas, patatas, atún, huevo cocido, tomates cherry y aceitunas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200622_161107.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 2, unit: 'latas de', name: 'atún al natural o en aceite de oliva' },
      { id: '5', baseQuantity: 200, unit: 'gr de', name: 'tomates cherry' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'aceitunas verdes' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, vinagre, sal y pimienta' },
    ],
    steps: [
      'Cocer las patatas en agua hirviendo durante 20 minutos. Dejar enfriar.',
      'Cocer los huevos en agua hirviendo durante 9 minutos. Dejar enfriar.',
      'Mezclar en recipiente las alubias, patatas troceadas, huevos troceados, atún, tomates cherry y aceitunas verdes troceadas.',
      'Aliñar con AOVE, vinagre, sal y pimienta al gusto.',
    ],
    nutrition: {
      totalWeightGrams: 1480,
      perServing: { calories: 385, protein: 24.7, carbs: 45.3, fat: 11.8, fiber: 11.2 },
      per100g: { calories: 104, protein: 6.7, carbs: 12.2, fat: 3.2, fiber: 3 },
    },
  },
  {
    id: 'ensalada-quinoa-lentejas',
    title: 'Ensalada de quinoa y lentejas',
    category: 'Legumbres',
    summary: 'Ensalada completa de quinoa, lentejas cocidas, salmón ahumado, alcaparras y tomates cherry.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200616_115823.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'salmón ahumado' },
      { id: '4', baseQuantity: 3, unit: 'cucharadas de', name: 'alcaparras' },
      { id: '5', baseQuantity: 200, unit: 'gr de', name: 'tomates cherry' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta blanca' },
    ],
    steps: [
      'Cocer la quinoa lavada en agua hirviendo con sal durante 12 minutos. Escurrir y reservar.',
      'Mezclar quinoa, lentejas cocidas, salmón ahumado troceado, alcaparras lavadas y tomates cherry.',
      'Aliñar con AOVE, sal y pimienta blanca al gusto.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 342, protein: 24.8, carbs: 38.6, fat: 9.4, fiber: 8.2 },
      per100g: { calories: 124, protein: 9, carbs: 14, fat: 3.4, fiber: 3 },
    },
  },
  {
    id: 'sopa-alubias-patatas',
    title: 'Sopa de alubias con patatas',
    category: 'Sopa',
    summary: 'Sopa reconfortante de alubias blancas con verduras, patatas, col y leche de coco.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200505_154922.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 2, unit: 'tallos de', name: 'apio con hojas verdes' },
      { id: '4', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 1.5, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '7', baseQuantity: 700, unit: 'ml de', name: 'caldo de verduras o agua' },
      { id: '8', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '10', baseQuantity: 60, unit: 'ml de', name: 'leche de coco' },
      { id: '11', baseQuantity: 150, unit: 'gr de', name: 'col' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Picar patatas, zanahorias, col y apio. Sofreír en olla con AOVE a fuego medio, removiendo ocasionalmente.',
      'Incorporar cebolla en polvo, orégano, laurel, sal y pimienta. Saltear 2 minutos.',
      'Añadir caldo o agua. Hervir a fuego medio-bajo durante 10 minutos.',
      'Incorporar alubias blancas y leche de coco. Cocinar chup chup 10 minutos más.',
      'Retirar laurel. Triturar la mitad del contenido de la olla y volver a incorporar. Rectificar sal y pimienta. Cocinar 1 minuto más.',
    ],
    nutrition: {
      totalWeightGrams: 1650,
      perServing: { calories: 268, protein: 10.2, carbs: 42.7, fat: 7.1, fiber: 9.8 },
      per100g: { calories: 65, protein: 2.5, carbs: 10.3, fat: 1.7, fiber: 2.4 },
    },
  },
  {
    id: 'sopa-espinacas',
    title: 'Sopa de espinacas',
    category: 'Sopa',
    summary: 'Sopa cremosa de espinacas con nata, nuez moscada y toppings de huevo cocido y salmón ahumado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200420_154755.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'espinacas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla morada' },
      { id: '3', baseQuantity: 600, unit: 'ml de', name: 'caldo de ave' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'harina integral' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'nata fresca' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'salmón ahumado' },
      { id: '8', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal, pimienta y nuez moscada' },
    ],
    steps: [
      'Cocer los huevos en agua hirviendo durante 10 minutos. Reservar.',
      'En olla con mantequilla a fuego medio, sofreír cebolla picada hasta que esté transparente.',
      'Añadir harina integral y remover 1 minuto hasta dorarla ligeramente.',
      'Incorporar caldo y llevar a ebullición. Agregar espinacas picadas y cocinar chup chup 5 minutos.',
      'Añadir nata fresca, nuez moscada, sal y pimienta. Remover y cocinar 2 minutos más.',
      'Al servir, coronar con huevos cocidos troceados y salmón ahumado.',
    ],
    nutrition: {
      totalWeightGrams: 1150,
      perServing: { calories: 258, protein: 20.3, carbs: 12.8, fat: 14.7, fiber: 3.2 },
      per100g: { calories: 90, protein: 7.1, carbs: 4.5, fat: 5.1, fiber: 1.1 },
    },
  },
  {
    id: 'caldo-asiatico-pollo',
    title: 'Caldo asiático de pollo',
    category: 'Sopa',
    summary: 'Caldo aromático de pollo con jengibre y cebolletas, perfecto como base para sopas o fideos.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200330_171407.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'carcasas de pollo' },
      { id: '2', baseQuantity: null, unit: 'Trozo como un dedo pulgar de', name: 'jengibre' },
      { id: '3', baseQuantity: 3, unit: '', name: 'cebolletas (parte blanca y verde)' },
      { id: '4', baseQuantity: 1.5, unit: 'litros de', name: 'agua' },
    ],
    steps: [
      'Poner todos los ingredientes en olla rápida y añadir el agua.',
      'Tapar y llevar a ebullición. Bajar el fuego.',
      'Cocinar chup chup durante 25 minutos.',
      'Colar y usar el caldo para sopas, fideos o congelar para futuras recetas.',
    ],
    nutrition: {
      totalWeightGrams: 1500,
      perServing: { calories: 48, protein: 6.2, carbs: 2.8, fat: 1.4, fiber: 0.5 },
      per100g: { calories: 13, protein: 1.7, carbs: 0.8, fat: 0.4, fiber: 0.1 },
    },
  },
  {
    id: 'crema-de-berenjenas-y-esparragos',
    title: 'Crema de berenjenas y espárragos',
    category: 'Verdura',
    summary: 'Crema suave de berenjenas cocidas y espárragos pochados con yogur natural y un toque de limón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200606_211055-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 1, unit: 'manojo de', name: 'espárragos verdes' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'yogur natural' },
      { id: '6', baseQuantity: null, unit: '', name: 'Zumo de limón' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer las berenjenas troceadas en agua con sal durante 15 minutos.',
      'Mientras, dorar en sartén con AOVE la cebolleta, ajos y espárragos troceados durante 7-8 minutos a fuego medio.',
      'Triturar todo con el yogur natural, zumo de limón, sal y pimienta hasta obtener consistencia cremosa. Añadir agua de cocción si es necesario.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: { calories: 95, protein: 5.2, carbs: 14.8, fat: 2.5, fiber: 6.5 },
      per100g: { calories: 32, protein: 1.7, carbs: 4.9, fat: 0.8, fiber: 2.2 },
    },
  },
  {
    id: 'hamburguesas-de-calabacin-y-mozzarella',
    title: 'Hamburguesas de calabacín y mozzarella',
    category: 'Verdura',
    summary: 'Hamburguesas vegetales de calabacín rallado con mozzarella, huevo y tomate concentrado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200605_174651.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'calabacines grandes' },
      { id: '2', baseQuantity: 2, unit: 'bolas de', name: 'mozzarella' },
      { id: '3', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'tomate concentrado' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'pan integral rallado' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Rallar los calabacines y cocinar en microondas 7 minutos a máxima potencia. Escurrir bien apretando para eliminar el agua.',
      'Picar la mozzarella y batir los huevos.',
      'Mezclar calabacín escurrido con mozzarella, huevos batidos, tomate concentrado, pan rallado, sal y pimienta.',
      'Formar hamburguesas y dorar 2 minutos por lado a fuego medio.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: { calories: 245, protein: 18.5, carbs: 12.8, fat: 14.2, fiber: 2.5 },
      per100g: { calories: 98, protein: 7.4, carbs: 5.1, fat: 5.7, fiber: 1.0 },
    },
  },
  {
    id: 'ensalada-de-primavera',
    title: 'Ensalada de primavera',
    category: 'Verdura',
    summary: 'Ensalada de judías verdes, espárragos y coliflor cocidos con mayonesa de aguacate.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200531_224826_resized_20200531_105044606.jpg',
    defaultServings: 2,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'judías verdes' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'espárragos verdes' },
      { id: '3', baseQuantity: 8, unit: 'arbolitos de', name: 'coliflor' },
      { id: '4', baseQuantity: 0.5, unit: '', name: 'aguacate' },
      { id: '5', baseQuantity: 0.5, unit: '', name: 'huevo cocido' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'AOVE' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal y vinagre o limón' },
    ],
    steps: [
      'Cocer judías y espárragos troceados en agua con sal 8 minutos. Añadir coliflor los últimos 3 minutos. Escurrir y reservar.',
      'Para la mayonesa de aguacate: triturar medio aguacate, medio huevo cocido, AOVE, sal y unas gotas de limón o vinagre.',
      'Mezclar la verdura cocida con la mayonesa en recipiente hermético y refrigerar.',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: { calories: 255, protein: 8.5, carbs: 16.2, fat: 18.5, fiber: 8.5 },
      per100g: { calories: 85, protein: 2.8, carbs: 5.4, fat: 6.2, fiber: 2.8 },
    },
  },
  {
    id: 'emperador-con-pesto-de-espinacas-y-tomates',
    title: 'Emperador con pesto de espinacas y tomates',
    category: 'Pescado',
    summary: 'Filetes de emperador acompañados de pesto casero de espinacas frescas, tomates secos y nueces.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200527_170305.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'filetes de', name: 'emperador' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'espinacas frescas' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'tomates secos' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'frutos secos tostados sin sal (nueces)' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'albahaca seca' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '8', baseQuantity: 4, unit: 'cucharadas de', name: 'AOVE' },
      { id: '9', baseQuantity: null, unit: '', name: 'Zumo de ½ limón, sal y pimienta' },
    ],
    steps: [
      'Triturar espinacas, tomates secos, nueces, parmesano, albahaca, ajos, AOVE, zumo de limón, sal y pimienta hasta consistencia deseada.',
      'Guardar el pesto en recipiente hermético en la nevera.',
      'El día de consumir: cocinar los filetes de emperador a la plancha y servir con el pesto.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 465, protein: 38.5, carbs: 12.5, fat: 30.2, fiber: 4.8 },
      per100g: { calories: 149, protein: 12.3, carbs: 4.0, fat: 9.7, fiber: 1.5 },
    },
  },
  {
    id: 'ensalada-de-repollo',
    title: 'Ensalada de repollo',
    category: 'Verdura',
    summary: 'Ensalada templada de repollo cocido con patata, huevo duro y tomate fresco.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200525_223851.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 0.5, unit: '', name: 'repollo' },
      { id: '2', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, vinagre y sal' },
    ],
    steps: [
      'Picar el repollo y cocer en agua con sal 7 minutos. Escurrir y reservar.',
      'Cocer las patatas y los huevos en agua con sal. Los huevos tardan 9 minutos, las patatas unos 20 minutos. Pelar y trocear.',
      'Mezclar repollo, patatas, huevos y tomates picados (sin semillas).',
      'Aliñar con AOVE, vinagre y sal al gusto.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: { calories: 185, protein: 8.2, carbs: 22.5, fat: 7.5, fiber: 5.2 },
      per100g: { calories: 62, protein: 2.7, carbs: 7.5, fat: 2.5, fiber: 1.7 },
    },
  },
  {
    id: 'hamburguesas-de-coliflor',
    title: 'Hamburguesas de coliflor',
    category: 'Verdura',
    summary: 'Hamburguesas vegetales de coliflor triturada con ajos tiernos, queso Emmental y especias.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200514_191936.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor pequeña' },
      { id: '2', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'cebolla en polvo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '6', baseQuantity: null, unit: '', name: 'Pan rallado' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Triturar coliflor y ajos tiernos, cocinar en microondas 6 minutos a máxima potencia. Reservar para atemperar.',
      'Batir los huevos, añadir el queso rallado, cebolla en polvo, sal y pimienta.',
      'Mezclar con la coliflor atemperada y añadir pan rallado si necesita más consistencia. Refrigerar 30 minutos.',
      'Formar hamburguesas y hornear 15 minutos o dorar en plancha con AOVE.',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: { calories: 168, protein: 13.5, carbs: 12.2, fat: 8.5, fiber: 4.2 },
      per100g: { calories: 79, protein: 6.3, carbs: 5.7, fat: 4.0, fiber: 2.0 },
    },
  },
  {
    id: 'cebolla-en-pure',
    title: 'Cebolla en puré',
    category: 'Verdura',
    summary: 'Puré cremoso de cebolla cocida en leche con mantequilla, nuez moscada y huevo cocido.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200513_154321.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 700, unit: 'gr de', name: 'cebolla seca' },
      { id: '2', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '3', baseQuantity: 400, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '4', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '6', baseQuantity: 4, unit: '', name: 'huevos cocidos' },
    ],
    steps: [
      'Sofreír la cebolla picada con mantequilla 3-4 minutos a fuego medio hasta dorar.',
      'Añadir leche, nuez moscada, sal y pimienta. Cocinar chup chup 10 minutos hasta evaporar parte de la leche.',
      'Triturar hasta consistencia de puré. Ajustar sal y pimienta.',
      'Acompañar con huevo cocido picado.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: { calories: 235, protein: 11.5, carbs: 18.5, fat: 13.2, fiber: 2.8 },
      per100g: { calories: 72, protein: 3.5, carbs: 5.7, fat: 4.0, fiber: 0.9 },
    },
  },
  {
    id: 'alcachofas-y-patatas',
    title: 'Alcachofas y patatas',
    category: 'Verdura',
    summary: 'Guiso de alcachofas y patatas con ajo machacado, cúrcuma y azafrán, acompañado de atún.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200512_165804.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'patata' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'harina integral' },
      { id: '4', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 750, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y azafrán' },
      { id: '8', baseQuantity: 2, unit: 'latas de', name: 'atún natural' },
    ],
    steps: [
      'Limpiar alcachofas quitando hojas verdes y pelando tallos. Sumergir en agua con perejil para evitar oxidación.',
      'Sofreír ajos enteros en AOVE. Machacar en mortero con harina y caldo.',
      'En la olla añadir patatas y alcachofas troceadas, la mezcla del mortero, caldo, azafrán, cúrcuma, sal y pimienta.',
      'Cocinar chup chup 20 minutos a fuego medio. Servir con atún natural.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 248, protein: 22.5, carbs: 24.8, fat: 6.8, fiber: 8.5 },
      per100g: { calories: 71, protein: 6.4, carbs: 7.1, fat: 1.9, fiber: 2.4 },
    },
  },
  {
    id: 'berenjenas-rellenas-de-arroz',
    title: 'Berenjenas rellenas de arroz',
    category: 'Verdura',
    summary: 'Berenjenas al horno rellenas de arroz, pollo picado, verduras y gratinadas con queso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200507_154622.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla grande' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pechuga de pollo picada' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'arroz' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'salsa de tomate' },
      { id: '7', baseQuantity: 150, unit: 'ml de', name: 'caldo de carne o verdura' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y queso rallado' },
    ],
    steps: [
      'Partir berenjenas longitudinalmente, hacer cortes en la pulpa y hornear 30 minutos a 180º.',
      'Cocer el arroz según instrucciones del paquete.',
      'Pochar cebolla y pimiento picados en AOVE. Añadir pollo picado y dorar.',
      'Agregar caldo, salsa de tomate, pimentón, tomillo, sal y pimienta. Cocinar chup chup 5 minutos.',
      'Extraer pulpa de berenjenas, picar y mezclar con el relleno y el arroz. Rellenar las pieles de berenjena.',
      'Cubrir con queso rallado y gratinar 10 minutos a 180º.',
    ],
    nutrition: {
      totalWeightGrams: 1800,
      perServing: { calories: 245, protein: 18.5, carbs: 24.2, fat: 8.5, fiber: 6.5 },
      per100g: { calories: 82, protein: 6.2, carbs: 8.1, fat: 2.8, fiber: 2.2 },
    },
  },
  {
    id: 'alcachofas-con-habas',
    title: 'Alcachofas con habas',
    category: 'Verdura',
    summary: 'Alcachofas y habas tiernas cocidas con cebolleta dorada y un toque de limón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200506_154659.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'alcachofas' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'habas tiernas' },
      { id: '3', baseQuantity: 3, unit: '', name: 'cebolletas' },
      { id: '4', baseQuantity: null, unit: '', name: 'Limón' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Limpiar alcachofas quitando hojas verdes, pelar tallos y sumergir en agua con perejil.',
      'Cocer alcachofas en agua con perejil 20 minutos. Añadir habas los últimos 5 minutos. Escurrir.',
      'Sofreír 3 cebolletas picadas con AOVE 6-7 minutos a fuego medio hasta dorar.',
      'Incorporar alcachofas y habas escurridas, zumo de medio limón, sal y pimienta. Dar un hervor conjunto 1-2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: { calories: 128, protein: 6.8, carbs: 16.5, fat: 4.2, fiber: 9.5 },
      per100g: { calories: 64, protein: 3.4, carbs: 8.3, fat: 2.1, fiber: 4.8 },
    },
  },
  {
    id: 'pollo-y-champinones-en-salsa-carbonara',
    title: 'Pollo y champiñones en salsa carbonara',
    category: 'Carne',
    summary: 'Pollo y champiñones en cremosa salsa carbonara con nata, huevo y queso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200519_211335.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '3', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '4', baseQuantity: 3, unit: 'lonchas de', name: 'jamón curado (ingredientes: jamón y sal)' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '7', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '8', baseQuantity: 60, unit: 'gr de', name: 'queso rallado' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír puerros picados en AOVE. Añadir champiñones en cuartos, jamón troceado y pollo troceado.',
      'Mientras se sella a fuego medio-alto, mezclar en un bol: nata, huevos, queso, nuez moscada, sal y pimienta.',
      'Incorporar la salsa a la sartén, remover y cocinar chup chup 5 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: { calories: 385, protein: 42.5, carbs: 8.5, fat: 20.2, fiber: 2.5 },
      per100g: { calories: 118, protein: 13.0, carbs: 2.6, fat: 6.2, fiber: 0.8 },
    },
  },
  {
    id: 'codillo-con-cus-cus',
    title: 'Codillo con cus cus',
    category: 'Carne',
    summary: 'Codillo de cerdo en olla rápida con verduras, vino blanco y especias, acompañado de cus cus con guisantes.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200415_154030.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 700, unit: 'gr de', name: 'codillo de cerdo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento' },
      { id: '5', baseQuantity: 1, unit: 'rama de', name: 'apio' },
      { id: '6', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '8', baseQuantity: 0.5, unit: 'cucharadita de', name: 'clavo molido' },
      { id: '9', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '10', baseQuantity: 250, unit: 'ml de', name: 'caldo de pollo' },
      { id: '11', baseQuantity: 1, unit: 'taza de', name: 'cus cus' },
      { id: '12', baseQuantity: 300, unit: 'gr de', name: 'guisantes tiernos' },
      { id: '13', baseQuantity: null, unit: '', name: 'Ralladura y zumo de limón, AOVE, sal y pimienta' },
    ],
    steps: [
      'En olla rápida, sellar los trozos de codillo con AOVE. Reservar.',
      'Pochar en la misma olla cebolla, ajo, pimiento, apio y tomate troceados 3-4 minutos.',
      'Añadir vino blanco, esperar que se evapore el alcohol. Incorporar codillo, tomillo, clavo, sal, pimienta y caldo.',
      'Cerrar olla, llevar a ebullición, bajar fuego y cocinar chup chup 25 minutos.',
      'Preparar cus cus: mezclar con guisantes escaldados 2 minutos y ralladura de limón. Cubrir con agua hirviendo y tapar. Cuando absorba el agua, añadir AOVE, zumo de limón y sal.',
      'Abrir olla, retirar carne y triturar verduras para hacer salsa.',
    ],
    nutrition: {
      totalWeightGrams: 1800,
      perServing: { calories: 485, protein: 32.5, carbs: 42.8, fat: 18.5, fiber: 6.2 },
      per100g: { calories: 108, protein: 7.2, carbs: 9.5, fat: 4.1, fiber: 1.4 },
    },
  },
  {
    id: 'guiso-de-pollo-con-curcuma',
    title: 'Guiso de pollo con cúrcuma',
    category: 'Carne',
    summary: 'Guiso de pollo con verduras, vino blanco y cúrcuma. Receta aromática y saludable.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200407_162738.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pollo (muslos, alas y pechuga)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'coliflor' },
      { id: '4', baseQuantity: 1, unit: 'rama de', name: 'apio' },
      { id: '5', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '6', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'perejil seco' },
      { id: '8', baseQuantity: 2, unit: 'cucharadas de', name: 'cúrcuma' },
      { id: '9', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '10', baseQuantity: 500, unit: 'ml de', name: 'caldo de pollo' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír el pollo especiado con 1 cucharada de cúrcuma, perejil y sal en AOVE. Reservar.',
      'En la misma olla sofreír cebolla, apio, laurel y ajo laminado 2 minutos a fuego medio.',
      'Añadir vino blanco, dejar evaporar el alcohol. Incorporar 1 cucharada de cúrcuma, pimienta, caldo y sal.',
      'Cocinar chup chup 20 minutos. Añadir coliflor los últimos 6 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 285, protein: 32.5, carbs: 8.5, fat: 12.8, fiber: 2.5 },
      per100g: { calories: 81, protein: 9.3, carbs: 2.4, fat: 3.6, fiber: 0.7 },
    },
  },
  {
    id: 'ensalada-de-quinoa-con-pollo',
    title: 'Ensalada de quinoa con pollo',
    category: 'Carne',
    summary: 'Ensalada completa de quinoa y arroz integral con pechuga de pollo, pimiento asado y cebolletas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200317_161444.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 250, unit: 'gr de', name: 'quinoa cocida (80 gr en seco)' },
      { id: '2', baseQuantity: 120, unit: 'gr de', name: 'arroz integral cocido (40 gr en seco)' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'tomates cherry' },
      { id: '4', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '5', baseQuantity: 1, unit: '', name: 'pimiento asado' },
      { id: '6', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y limón' },
    ],
    steps: [
      'Cocer quinoa lavada 15 minutos y arroz integral lavado 30 minutos. Escurrir bien.',
      'Asar pimiento y cebolletas 40 minutos a 190º (o usar pimiento ya asado).',
      'Hacer pechuga a la plancha, salpimentar y cortar en tiras.',
      'Mezclar quinoa, arroz, pimiento en tiras, cebolletas, tomates cherry y pollo. Refrigerar.',
      'Al servir, aliñar con AOVE, sal y limón.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: { calories: 295, protein: 22.5, carbs: 35.8, fat: 6.5, fiber: 5.5 },
      per100g: { calories: 118, protein: 9.0, carbs: 14.3, fat: 2.6, fiber: 2.2 },
    },
  },
  {
    id: 'marinada-de-salsa-de-soja',
    title: 'Marinada de salsa de soja',
    category: 'Carne',
    summary: 'Pechuga de pollo marinada en salsa de soja con ajo, cebolla, vino blanco y zumo de naranja.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/02/IMG_20200206_201342.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pechuga de pollo en filetes gruesos' },
      { id: '2', baseQuantity: 70, unit: 'ml de', name: 'salsa de soja sin azúcar' },
      { id: '3', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla pequeña' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'AOVE' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'vino blanco' },
      { id: '7', baseQuantity: 1, unit: '', name: 'naranja (zumo)' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Picar ajo y cebolla y poner en recipiente hondo.',
      'Añadir salsa de soja, AOVE, vino blanco, zumo de naranja, sal y pimienta. Mezclar.',
      'Incorporar los filetes de pollo, tapar y marinar mínimo 1 hora en nevera (cuanto más tiempo mejor).',
      'Escurrir el pollo de la marinada y cocinar a fuego medio en plancha o sartén.',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: { calories: 225, protein: 34.5, carbs: 6.2, fat: 7.5, fiber: 0.8 },
      per100g: { calories: 106, protein: 16.2, carbs: 2.9, fat: 3.5, fiber: 0.4 },
    },
  },
  {
    id: 'guiso-de-pollo-con-garam-masala',
    title: 'Guiso de pollo con garam masala',
    category: 'Carne',
    summary: 'Guiso aromático de pollo con champiñones, patatas y la mezcla de especias garam masala.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200118_171221-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'pechuga de pollo entera' },
      { id: '2', baseQuantity: 250, unit: 'gr de', name: 'champiñones enteros' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'garam masala' },
      { id: '8', baseQuantity: 500, unit: 'ml de', name: 'caldo de pollo' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'En olla añadir mantequilla y AOVE. Sofreír ajos y cebolla picados y champiñones en cuartos 3-4 minutos a fuego medio.',
      'Añadir pollo cortado en tacos y sellar.',
      'Incorporar garam masala, sal, patatas en trozos grandes y caldo.',
      'Cocinar chup chup 20 minutos a fuego medio.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 305, protein: 32.5, carbs: 24.5, fat: 9.2, fiber: 3.8 },
      per100g: { calories: 87, protein: 9.3, carbs: 7.0, fat: 2.6, fiber: 1.1 },
    },
  },
  {
    id: 'alitas-de-pollo-en-escabeche',
    title: 'Alitas de pollo en escabeche',
    category: 'Carne',
    summary: 'Alitas de pollo en escabeche con verduras, hierbas aromáticas, vino blanco y vinagre de Jerez.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200111_170718-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'alitas de pollo' },
      { id: '2', baseQuantity: 1, unit: 'rama de', name: 'apio' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla grande' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'pimienta en grano' },
      { id: '9', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '10', baseQuantity: 100, unit: 'ml de', name: 'vinagre de Jerez' },
      { id: '11', baseQuantity: 100, unit: 'ml de', name: 'agua o caldo de pollo' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Dorar las alitas con AOVE en olla de base ancha a fuego medio (en tandas si es necesario).',
      'Añadir apio, ajos, zanahorias en dados grandes y cebolla en aros.',
      'Incorporar laurel, romero, pimienta en grano, vino blanco, vinagre y agua. Salpimentar.',
      'Llevar a ebullición, bajar fuego y cocinar chup chup tapado 30 minutos a fuego medio-bajo.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 385, protein: 35.2, carbs: 12.5, fat: 21.5, fiber: 2.5 },
      per100g: { calories: 110, protein: 10.1, carbs: 3.6, fat: 6.1, fiber: 0.7 },
    },
  },
  {
    id: 'quinoa-con-pollo-y-pomelo',
    title: 'Quinoa con pollo y pomelo',
    category: 'Carne',
    summary: 'Ensalada refrescante de quinoa con pollo especiado, pomelo, nueces y semillas de girasol.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200111_155814-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'pechugas de pollo' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'quinoa cocida' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pomelo' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'nueces peladas y picadas' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'semillas de girasol' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '7', baseQuantity: null, unit: '', name: 'Lechuga' },
      { id: '8', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer quinoa en agua con sal 12 minutos. Escurrir y reservar.',
      'Cocinar pechugas en sartén o plancha con AOVE y tomillo. Salpimentar, cortar en rodajas gruesas y reservar.',
      'En recipiente hermético disponer quinoa y pollo. Refrigerar.',
      'Guardar tomate en cuartos y gajos de pomelo sin piel en otro recipiente.',
      'Al servir: unir todo, añadir semillas de girasol, nueces, lechuga picada, AOVE y sal.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: { calories: 335, protein: 28.5, carbs: 32.5, fat: 11.2, fiber: 5.5 },
      per100g: { calories: 134, protein: 11.4, carbs: 13.0, fat: 4.5, fiber: 2.2 },
    },
  },
  {
    id: 'hummus-de-sardinas',
    title: 'Hummus de sardinas',
    category: 'Legumbres',
    summary: 'Hummus cremoso de garbanzos con sardinas en aceite de oliva, sésamo, limón y pimentón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/03/IMG_20220329_141944.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '3', baseQuantity: 1, unit: 'lata de', name: 'sardinas en aceite de oliva' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Zumo de limón' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'En batidora colocar garbanzos, agua, sardinas con parte de su aceite, sésamo, pimentón, zumo de limón, sal y pimienta.',
      'Triturar hasta obtener textura cremosa deseada. Añadir más agua o aceite si se prefiere más suave.',
      'Guardar en recipiente hermético en nevera. Listo para dipear durante toda la semana.',
    ],
    nutrition: {
      totalWeightGrams: 650,
      perServing: { calories: 242, protein: 15.8, carbs: 22.5, fat: 10.5, fiber: 6.5 },
      per100g: { calories: 149, protein: 9.7, carbs: 13.8, fat: 6.5, fiber: 4.0 },
    },
  },
  {
    id: 'sardinas-en-escabeche',
    title: 'Sardinas en escabeche',
    category: 'Pescado',
    summary: 'Sardinas frescas en escabeche casero con verduras, hierbas aromáticas, vino blanco y vinagre.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200519_211628.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'kg de', name: 'sardinas grandes (frescas, de mayo a octubre)' },
      { id: '2', baseQuantity: null, unit: '', name: 'Sal gruesa' },
      { id: '3', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'granos de pimienta' },
      { id: '8', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón dulce' },
      { id: '10', baseQuantity: 4, unit: 'cucharadas de', name: 'AOVE' },
      { id: '11', baseQuantity: 200, unit: 'ml de', name: 'vino blanco' },
      { id: '12', baseQuantity: 100, unit: 'ml de', name: 'vinagre' },
      { id: '13', baseQuantity: 200, unit: 'ml de', name: 'agua' },
    ],
    steps: [
      'Cubrir bandeja de horno con sal gorda. Colocar sardinas sin cabeza, tripas ni escamas y hornear 10 minutos a 180º.',
      'En olla ancha, dorar con AOVE ajos laminados y cebolla en juliana a fuego medio.',
      'Cuando la cebolla esté transparente, subir fuego y añadir vino blanco, vinagre, agua, tomillo, romero, pimentón, laurel y pimienta en grano. Cocinar chup chup 3 minutos.',
      'Bajar fuego a medio, incorporar sardinas con cuidado, tapar y cocinar chup chup 5 minutos.',
      'Refrigerar al menos 24 horas antes de consumir. Aguantan varios días en nevera.',
    ],
    nutrition: {
      totalWeightGrams: 1500,
      perServing: { calories: 385, protein: 32.5, carbs: 8.5, fat: 24.5, fiber: 1.2 },
      per100g: { calories: 154, protein: 13.0, carbs: 3.4, fat: 9.8, fiber: 0.5 },
    },
  },
  {
    id: 'bacalao-dorado',
    title: 'Bacalao dorado',
    category: 'Pescado',
    summary: 'Receta portuguesa de bacalao con patatas y cebolla al microondas, terminado con huevos batidos. Sencillo y sabroso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200511_165903_resized_20200511_050951800.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'migas de bacalao congeladas' },
      { id: '2', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Perejil (opcional)' },
    ],
    steps: [
      'Pelar y picar 1 cebolla y 2 patatas en bastones. Introducir en bol apto para microondas con 1 cucharada de AOVE, 2 cucharadas de agua, sal y pimienta. Cocinar 20 minutos a máxima potencia.',
      'Dorar migas de bacalao en sartén ancha con 1 cucharada de AOVE a fuego medio-alto durante 3-4 minutos.',
      'Añadir patatas y cebolla del microondas a la sartén con el bacalao. Incorporar 3 huevos batidos y remover 2 minutos a fuego medio hasta que cuaje.',
      'Servir con aceitunas y perejil fresco.',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: { calories: 268, protein: 28.5, carbs: 18.4, fat: 9.2, fiber: 2.1 },
      per100g: { calories: 119, protein: 12.7, carbs: 8.2, fat: 4.1, fiber: 0.9 },
    },
  },
  {
    id: 'merluza-salsa-jamon',
    title: 'Merluza con salsa de jamón',
    category: 'Pescado',
    summary: 'Lomos de merluza con cremosa salsa de jamón, tomate, leche evaporada y patatas. Plato completo y reconfortante.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200519_211628.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'lomos de merluza' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 75, unit: 'gr de', name: 'jamón curado' },
      { id: '5', baseQuantity: 250, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'leche evaporada' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'agua o caldo de verduras' },
      { id: '8', baseQuantity: 1, unit: '', name: 'patata mediana' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y pimentón' },
    ],
    steps: [
      'En sartén ancha con AOVE, dorar 1 cebolla y 2 ajos picados a fuego medio durante 3-4 minutos.',
      'Añadir 75 gr de jamón curado troceado y dejar 1 minuto más.',
      'Incorporar tomate triturado, leche evaporada, caldo o agua, 1 patata en rodajas, 1 cucharada de pimentón, sal y pimienta. Cocinar chup chup 15 minutos.',
      'Añadir lomos de merluza y cocinar 5 minutos más hasta que el pescado esté hecho.',
    ],
    nutrition: {
      totalWeightGrams: 1120,
      perServing: { calories: 245, protein: 30.2, carbs: 15.8, fat: 7.4, fiber: 2.3 },
      per100g: { calories: 88, protein: 10.8, carbs: 5.6, fat: 2.6, fiber: 0.8 },
    },
  },
  {
    id: 'pate-sardinas',
    title: 'Paté de sardinas',
    category: 'Entrantes',
    summary: 'Paté cremoso de sardinas en conserva con limón, mostaza, semillas de sésamo y zanahoria rallada.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200319_181147.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'latas de', name: 'sardinas en aceite de oliva' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'limón (zumo)' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'mostaza' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'zanahorias ralladas' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'AOVE' },
    ],
    steps: [
      'Escurrir bien el aceite de las sardinas.',
      'Introducir todos los ingredientes en procesador: sardinas, zumo de limón, mostaza, semillas de sésamo, zanahorias ralladas, salsa de soja y AOVE.',
      'Triturar bien hasta obtener consistencia cremosa.',
      'Conservar en recipiente hermético en nevera hasta 5 días.',
    ],
    nutrition: {
      totalWeightGrams: 380,
      perServing: { calories: 215, protein: 14.2, carbs: 6.8, fat: 15.5, fiber: 1.8 },
      per100g: { calories: 226, protein: 14.9, carbs: 7.1, fat: 16.3, fiber: 1.9 },
    },
  },
  {
    id: 'merluza-salsa-verde',
    title: 'Merluza en salsa verde',
    category: 'Pescado',
    summary: 'Merluza con salsa verde clásica de perejil, vino blanco, guisantes y espárragos. Ideal con arroz.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200606_210922.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomos de merluza' },
      { id: '2', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'harina integral' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'vino blanco' },
      { id: '6', baseQuantity: null, unit: '', name: 'Perejil al gusto' },
      { id: '7', baseQuantity: 500, unit: 'ml de', name: 'caldo de pescado' },
      { id: '8', baseQuantity: 4, unit: '', name: 'huevos duros' },
      { id: '9', baseQuantity: null, unit: '', name: 'Espárragos verdes' },
      { id: '10', baseQuantity: 120, unit: 'gr de', name: 'guisantes (lata o congelados)' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír 3 ajos y 1 cebolla picados en sartén ancha con AOVE a fuego medio durante 3 minutos.',
      'Añadir vino blanco y perejil. Dejar evaporar el alcohol.',
      'Agregar caldo de pescado con 1 cucharada de harina integral diluida. Cocinar chup chup 5 minutos.',
      'Incorporar espárragos troceados y cocinar 5 minutos más. Añadir guisantes.',
      'Agregar lomos de merluza salpimentados y cocinar chup chup 3 minutos. Servir con huevos cocidos.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: { calories: 295, protein: 35.8, carbs: 12.5, fat: 10.2, fiber: 3.1 },
      per100g: { calories: 81, protein: 9.8, carbs: 3.4, fat: 2.8, fiber: 0.9 },
    },
  },
  {
    id: 'croquetas-bacalao-champinones',
    title: 'Croquetas de bacalao y champiñones',
    category: 'Entrantes',
    summary: 'Croquetas horneadas de bacalao y champiñones con bechamel integral, perfectas para congelar.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_175655.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'bacalao desalado' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'champiñones' },
      { id: '3', baseQuantity: 0.5, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: 'cucharadas de', name: 'harina integral' },
      { id: '5', baseQuantity: 300, unit: 'ml de', name: 'leche' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal, pimienta y nuez moscada' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE' },
      { id: '8', baseQuantity: null, unit: '', name: 'Harina y huevo para rebozar' },
      { id: '9', baseQuantity: null, unit: '', name: 'Pan rallado integral' },
    ],
    steps: [
      'Cocinar bacalao y champiñones juntos. Reservar.',
      'Para bechamel: sofreír ½ cebolla picada con AOVE. Añadir harina integral, nuez moscada, sal y pimienta. Cocinar 1 minuto.',
      'Incorporar leche y mezclar bien hasta obtener bechamel espesa.',
      'Mezclar bechamel con bacalao y champiñones. Dejar reposar para manejar la masa.',
      'Formar croquetas, rebozar en harina, huevo y pan rallado. Rociar con AOVE en spray y hornear 15 minutos a 200º.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 285, protein: 32.5, carbs: 18.7, fat: 9.4, fiber: 2.1 },
      per100g: { calories: 104, protein: 11.8, carbs: 6.8, fat: 3.4, fiber: 0.8 },
    },
  },
  {
    id: 'crema-puerros-bacalao',
    title: 'Crema de puerros con migas de bacalao',
    category: 'Sopa',
    summary: 'Cremosa sopa de puerros con comino, coronada con migas de bacalao doradas. Reconfortante y completa.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200531_224414.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'puerros' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '5', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: 500, unit: 'gr de', name: 'migas de bacalao' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En olla a fuego medio-alto, derretir mantequilla. Añadir puerros, cebolleta y patata lavados, pelados y en dados. Sofreír 3-4 minutos.',
      'Añadir caldo de verduras, comino, sal y pimienta. Hervir y bajar a fuego medio-bajo. Cocinar 10-12 minutos.',
      'Mientras, cocinar migas de bacalao en sartén con AOVE a fuego medio. Reservar.',
      'Escurrir verduras y triturar hasta obtener crema. Servir con migas de bacalao por encima.',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: { calories: 295, protein: 28.4, carbs: 22.5, fat: 10.8, fiber: 3.2 },
      per100g: { calories: 74, protein: 7.1, carbs: 5.6, fat: 2.7, fiber: 0.8 },
    },
  },
  {
    id: 'alubias-setas-bacalao',
    title: 'Alubias con setas y bacalao',
    category: 'Legumbres',
    summary: 'Guiso de alubias con setas salteadas, bacalao y sofrito de verduras con vino blanco y pimentón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200528_224544-1024x859.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebollas moradas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 250, unit: 'gr de', name: 'setas laminadas' },
      { id: '7', baseQuantity: 400, unit: 'gr de', name: 'lomos de bacalao' },
      { id: '8', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y pimentón' },
    ],
    steps: [
      'Pochar cebollas, puerro y pimiento picados en olla ancha con AOVE a fuego medio durante 5-6 minutos. Añadir 300 ml de agua y cocinar chup chup 10 minutos.',
      'Batir el sofrito y volver a la olla. Añadir vino blanco, alubias cocidas, 1 cucharadita de pimentón, sal y pimienta. Cocinar chup chup 10 minutos.',
      'Saltear setas con ajos laminados en sartén con AOVE a fuego alto 1-2 minutos. Reservar.',
      'En misma sartén, sellar lomos de bacalao a fuego medio-alto. Reservar.',
      'Incorporar setas y bacalao a la olla. Dar hervor conjunto 1-2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1600,
      perServing: { calories: 345, protein: 32.5, carbs: 35.2, fat: 8.5, fiber: 9.2 },
      per100g: { calories: 86, protein: 8.1, carbs: 8.8, fat: 2.1, fiber: 2.3 },
    },
  },
  {
    id: 'pate-caballa-sardinas',
    title: 'Paté de caballa y sardinas',
    category: 'Entrantes',
    summary: 'Paté cremoso de caballa y sardinas con limón, yogur natural y AOVE. Perfecto para bocadillos.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200319_181147.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 160, unit: 'gr de', name: 'caballas en conserva escurridas' },
      { id: '2', baseQuantity: 160, unit: 'gr de', name: 'sardinas en conserva escurridas' },
      { id: '3', baseQuantity: 30, unit: 'ml de', name: 'AOVE' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón (zumo)' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'yogur natural' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Escurrir bien caballas y sardinas.',
      'Introducir todos los ingredientes en procesador: pescado, AOVE, zumo de limón, yogur natural, sal y pimienta.',
      'Batir bien hasta obtener consistencia cremosa.',
      'Conservar en recipiente hermético en nevera hasta 5 días.',
    ],
    nutrition: {
      totalWeightGrams: 380,
      perServing: { calories: 245, protein: 18.5, carbs: 2.8, fat: 18.2, fiber: 0.2 },
      per100g: { calories: 258, protein: 19.5, carbs: 2.9, fat: 19.2, fiber: 0.2 },
    },
  },
  {
    id: 'pasta-pate-caballa-coliflor',
    title: 'Pasta integral con paté de caballa y sardinas y coliflor',
    category: 'Hidratos',
    summary: 'Pasta integral con paté de caballa y sardinas, coliflor al microondas y queso rallado. Aprovechamiento delicioso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200620_180549-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 160, unit: 'gr de', name: 'caballas en conserva escurridas' },
      { id: '2', baseQuantity: 160, unit: 'gr de', name: 'sardinas en conserva escurridas' },
      { id: '3', baseQuantity: 30, unit: 'ml de', name: 'AOVE' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón (zumo)' },
      { id: '5', baseQuantity: 1, unit: '', name: 'yogur natural' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '7', baseQuantity: null, unit: '', name: 'Ramilletes de coliflor' },
      { id: '8', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
      { id: '9', baseQuantity: null, unit: '', name: 'Queso rallado' },
    ],
    steps: [
      'Preparar paté batiendo caballas, sardinas, AOVE, zumo de limón, yogur, sal y pimienta hasta obtener crema.',
      'Desmenuzar coliflor y cocinar 10 minutos a máxima potencia en microondas. Reservar.',
      'Cocer pasta según indicaciones del paquete.',
      'Mezclar pasta cocida, paté, coliflor y ½ vaso del agua de cocción si fuese necesario. Servir con queso rallado.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 425, protein: 26.8, carbs: 48.5, fat: 15.2, fiber: 7.8 },
      per100g: { calories: 155, protein: 9.8, carbs: 17.7, fat: 5.5, fiber: 2.8 },
    },
  },
  {
    id: 'helado-platano-mango',
    title: 'Helado de plátano y mango',
    category: 'Postres',
    summary: 'Helado cremoso con plátanos y mango congelados, mantequilla de cacahuete y cacao. Sano y refrescante.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200615_160752.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'plátanos maduros congelados' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'mango congelado' },
      { id: '3', baseQuantity: 1, unit: 'cucharada colmada de', name: 'mantequilla de cacahuete' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'cacao puro en polvo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'yogur natural' },
      { id: '6', baseQuantity: null, unit: '', name: 'Frutos secos tostados sin sal (topping)' },
    ],
    steps: [
      'Introducir plátanos congelados, mango congelado, mantequilla de cacahuete, cacao en polvo y yogur natural en procesador potente.',
      'Triturar bien hasta obtener consistencia cremosa y homogénea.',
      'Servir con frutos secos tostados machacados como topping.',
    ],
    nutrition: {
      totalWeightGrams: 450,
      perServing: { calories: 185, protein: 5.2, carbs: 28.4, fat: 6.8, fiber: 3.8 },
      per100g: { calories: 164, protein: 4.6, carbs: 25.2, fat: 6.0, fiber: 3.4 },
    },
  },
  {
    id: 'carrot-cake-frosting',
    title: 'Carrot cake con frosting',
    category: 'Postres',
    summary: 'Bizcocho de zanahoria con almendras, dátiles y especias, coronado con frosting de queso crema y miel.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/02/IMG_20220202_195353-997x1024.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'zanahoria rallada' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'harina de almendra (almendra molida)' },
      { id: '3', baseQuantity: 8, unit: '', name: 'dátiles' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'esencia de vainilla' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'canela' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'jengibre seco' },
      { id: '7', baseQuantity: 0.33, unit: 'cucharadita de', name: 'clavo molido' },
      { id: '8', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura química' },
      { id: '10', baseQuantity: 30, unit: 'gr de', name: 'aceite de coco' },
      { id: '11', baseQuantity: 150, unit: 'gr de', name: 'queso crema (frosting)' },
      { id: '12', baseQuantity: 30, unit: 'gr de', name: 'mantequilla (frosting)' },
      { id: '13', baseQuantity: 2, unit: 'cucharadas de', name: 'miel (frosting)' },
    ],
    steps: [
      'En procesador, triturar zanahorias. Añadir dátiles hidratados y seguir triturando. Incorporar almendra molida.',
      'Agregar huevos, aceite de coco, vainilla, canela, jengibre, clavo, levadura y sal. Batir hasta integrar.',
      'Verter en molde engrasado y hornear 30 minutos a 180º (comprobar con palillo).',
      'Para frosting: mezclar queso crema, mantequilla a temperatura ambiente y miel. Decorar el bizcocho frío.',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: { calories: 285, protein: 8.4, carbs: 24.5, fat: 18.2, fiber: 3.5 },
      per100g: { calories: 380, protein: 11.2, carbs: 32.7, fat: 24.3, fiber: 4.7 },
    },
  },
  {
    id: 'carrot-cake',
    title: 'Carrot cake',
    category: 'Postres',
    summary: 'Bizcocho clásico de zanahoria con almendras, dátiles y mezcla aromática de especias. Sin azúcar refinado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/02/IMG_20220202_195353-997x1024.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'zanahoria rallada' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'harina de almendra (almendra molida)' },
      { id: '3', baseQuantity: 8, unit: '', name: 'dátiles' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'esencia de vainilla' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'canela' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'jengibre seco' },
      { id: '7', baseQuantity: 0.33, unit: 'cucharadita de', name: 'clavo molido' },
      { id: '8', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura química' },
      { id: '10', baseQuantity: 30, unit: 'gr de', name: 'aceite de coco' },
    ],
    steps: [
      'En procesador, triturar zanahorias. Añadir dátiles previamente hidratados en agua caliente y seguir triturando.',
      'Incorporar almendra molida (o triturar almendras tostadas).',
      'Agregar huevos, aceite de coco, vainilla, canela, jengibre, clavo, levadura y sal. Batir hasta integrar.',
      'Verter en recipiente apto para horno engrasado con mantequilla. Hornear 25 minutos a 190º (comprobar con palillo).',
    ],
    nutrition: {
      totalWeightGrams: 420,
      perServing: { calories: 245, protein: 8.8, carbs: 22.4, fat: 14.5, fiber: 3.2 },
      per100g: { calories: 350, protein: 12.6, carbs: 32.0, fat: 20.7, fiber: 4.6 },
    },
  },
  {
    id: 'tarta-2-ingredientes',
    title: 'Tarta de 2 ingredientes',
    category: 'Postres',
    summary: 'Tarta de chocolate con solo huevos y chocolate negro. Textura esponjosa y sabor intenso, perfecta para ocasiones especiales.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/10/donuts2.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'chocolate 72% cacao' },
      { id: '2', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 40, unit: 'gr de', name: 'chocolate para cobertura (opcional)' },
      { id: '4', baseQuantity: 30, unit: 'ml de', name: 'agua caliente (para cobertura)' },
    ],
    steps: [
      'Trocear chocolate y fundirlo en microondas en tandas de 30 segundos, removiendo para no quemar.',
      'Montar claras a punto de nieve. Reservar.',
      'Mezclar yemas con chocolate fundido, removiendo constantemente para que no se cuajen.',
      'Incorporar claras montadas en 5-6 veces con movimientos envolventes para no perder el aire.',
      'Verter en molde de 15 cm forrado con papel vegetal. Hornear al baño maría: 10 min a 170º, 10 min a 160º, luego 10 min con horno apagado y puerta entreabierta.',
      'Para cobertura opcional: mezclar 40 gr chocolate con 30 ml agua caliente y verter sobre tarta. Decorar con frutas.',
    ],
    nutrition: {
      totalWeightGrams: 280,
      perServing: { calories: 185, protein: 6.2, carbs: 12.8, fat: 12.5, fiber: 2.1 },
      per100g: { calories: 396, protein: 13.3, carbs: 27.4, fat: 26.8, fiber: 4.5 },
    },
  },
  {
    id: 'pina-colada-chia',
    title: 'Piña colada con semillas de chía',
    category: 'Postres',
    summary: 'Pudding de chía con leche de coco, dátiles y vainilla, coronado con puré de piña fresca. Fresco y tropical.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200615_160752.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 30, unit: 'gr de', name: 'semillas de chía' },
      { id: '2', baseQuantity: 300, unit: 'ml de', name: 'bebida de almendras' },
      { id: '3', baseQuantity: 100, unit: 'ml de', name: 'leche de coco' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'coco rallado' },
      { id: '5', baseQuantity: 3, unit: '', name: 'dátiles' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'extracto de vainilla' },
      { id: '7', baseQuantity: 400, unit: 'gr de', name: 'piña madura' },
    ],
    steps: [
      'Mezclar semillas de chía, bebida de almendras, leche de coco, coco rallado, dátiles picados (o triturados con la leche) y extracto de vainilla.',
      'Distribuir mezcla en vasos y refrigerar al menos 1 hora.',
      'Mientras, preparar puré de piña triturándola en procesador hasta textura suave.',
      'Cubrir pudding de chía con puré de piña, refrigerar y servir.',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: { calories: 195, protein: 4.2, carbs: 28.5, fat: 8.4, fiber: 6.8 },
      per100g: { calories: 87, protein: 1.9, carbs: 12.7, fat: 3.7, fiber: 3.0 },
    },
  },
  {
    id: 'bizcocho-arandanos',
    title: 'Bizcocho con arándanos',
    category: 'Postres',
    summary: 'Bizcocho esponjoso con harinas integrales, arándanos, cacahuetes y fruta desecada. Perfecto para acompañar café.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200607_173009.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'harina de almendra (almendra molida)' },
      { id: '3', baseQuantity: 1, unit: 'sobre de', name: 'levadura química' },
      { id: '4', baseQuantity: 4, unit: '', name: 'claras de huevo' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'vainilla' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'canela' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '8', baseQuantity: 60, unit: 'gr de', name: 'arándanos congelados' },
      { id: '9', baseQuantity: 40, unit: 'gr de', name: 'cacahuetes pelados' },
      { id: '10', baseQuantity: 60, unit: 'gr de', name: 'fruta desecada' },
    ],
    steps: [
      'Montar claras a punto de nieve.',
      'Añadir con movimientos envolventes: vainilla, canela, harina de almendra, harina integral, levadura, leche, arándanos, cacahuetes y fruta desecada picada.',
      'Verter en recipiente engrasado con aceite de coco.',
      'Hornear 30 minutos a 180º (comprobar con palillo).',
    ],
    nutrition: {
      totalWeightGrams: 550,
      perServing: { calories: 168, protein: 7.5, carbs: 20.2, fat: 6.8, fiber: 3.2 },
      per100g: { calories: 244, protein: 10.9, carbs: 29.4, fat: 9.9, fiber: 4.6 },
    },
  },
  {
    id: 'bizcocho-frutos-rojos',
    title: 'Bizcocho con frutos rojos',
    category: 'Postres',
    summary: 'Bizcocho con plátano maduro, frutos rojos congelados, cacahuetes y fruta seca. Dulzor natural y saludable.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200607_173009.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'harina de almendra (almendra molida)' },
      { id: '3', baseQuantity: 4, unit: '', name: 'claras de huevo' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'vainilla' },
      { id: '5', baseQuantity: 2, unit: '', name: 'plátanos maduros' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'canela' },
      { id: '7', baseQuantity: 60, unit: 'gr de', name: 'frutos rojos congelados' },
      { id: '8', baseQuantity: 40, unit: 'gr de', name: 'cacahuetes pelados' },
      { id: '9', baseQuantity: 30, unit: 'gr de', name: 'fruta desecada' },
    ],
    steps: [
      'Montar claras a punto de nieve.',
      'Añadir con movimientos envolventes: vainilla, canela, plátanos bien chafados, harina de almendra, harina integral, frutos rojos, cacahuetes y fruta desecada picada.',
      'Verter en recipiente engrasado con aceite de coco.',
      'Hornear 30 minutos a 190º (comprobar con palillo).',
    ],
    nutrition: {
      totalWeightGrams: 520,
      perServing: { calories: 152, protein: 6.8, carbs: 22.4, fat: 4.8, fiber: 3.5 },
      per100g: { calories: 234, protein: 10.5, carbs: 34.6, fat: 7.4, fiber: 5.4 },
    },
  },
  {
    id: 'galletas-escandinavas',
    title: 'Galletas escandinavas',
    category: 'Postres',
    summary: 'Galletas especiadas con canela, cardamomo, clavo y jengibre, endulzadas con dátiles y ralladura de naranja.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/02/IMG_20220202_195353-997x1024.jpg',
    defaultServings: 10,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'claras de huevo' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'harina de almendra (almendras tostadas molidas)' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'vainilla líquida' },
      { id: '4', baseQuantity: 4, unit: '', name: 'dátiles' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'canela' },
      { id: '6', baseQuantity: 5, unit: 'vainas de', name: 'cardamomo (semillas machacadas)' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'clavo molido' },
      { id: '8', baseQuantity: 0.5, unit: 'cucharadita de', name: 'jengibre seco' },
      { id: '9', baseQuantity: 1, unit: '', name: 'naranja (ralladura)' },
    ],
    steps: [
      'Hidratar dátiles con agua caliente durante 5 minutos. Batir hasta obtener pasta.',
      'Montar claras a punto de nieve.',
      'Mezclar con movimientos envolventes: harina de almendra, ralladura de naranja, pasta de dátil, canela, semillas de cardamomo machacadas, clavo y jengibre.',
      'Formar bolitas y hornear 15 minutos a 170º.',
      'Decorar con chocolate fundido o canela espolvoreada.',
    ],
    nutrition: {
      totalWeightGrams: 320,
      perServing: { calories: 118, protein: 4.8, carbs: 12.5, fat: 6.2, fiber: 2.1 },
      per100g: { calories: 369, protein: 15.0, carbs: 39.1, fat: 19.4, fiber: 6.6 },
    },
  },
  {
    id: 'muffins-almendras',
    title: 'Muffins de almendras',
    category: 'Postres',
    summary: 'Muffins de almendra con caqui maduro, manzana rallada, canela y limón. Sin azúcar añadido.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/10/donuts2.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'harina de almendra (almendra molida)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'caqui maduro' },
      { id: '3', baseQuantity: 1, unit: '', name: 'manzana' },
      { id: '4', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Canela y ralladura de limón' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'bebida vegetal o leche' },
      { id: '7', baseQuantity: 1, unit: 'sobre de', name: 'levadura química' },
    ],
    steps: [
      'Batir caqui maduro hasta obtener puré.',
      'Mezclar caqui batido con huevos, bebida vegetal, canela, ralladura de limón, harina de almendra, levadura y ralladura de manzana.',
      'Verter en molde untado con aceite de coco.',
      'Hornear a 170º durante 40 minutos (comprobar con palillo).',
      'Dejar atemperar y desmoldar. Guardar en nevera.',
    ],
    nutrition: {
      totalWeightGrams: 620,
      perServing: { calories: 248, protein: 10.5, carbs: 18.4, fat: 15.8, fiber: 4.2 },
      per100g: { calories: 240, protein: 10.2, carbs: 17.8, fat: 15.3, fiber: 4.1 },
    },
  },
  {
    id: 'tarta-calabaza-chocolate',
    title: 'Tarta de calabaza y chocolate',
    category: 'Postres',
    summary: 'Tarta con base crujiente de frutos secos y dátiles, relleno cremoso de calabaza, chocolate y requesón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/10/donuts2.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'dátiles (base)' },
      { id: '2', baseQuantity: 90, unit: 'gr de', name: 'anacardos tostados sin sal' },
      { id: '3', baseQuantity: 90, unit: 'gr de', name: 'avellanas tostadas sin sal' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'aceite de coco' },
      { id: '6', baseQuantity: 1, unit: 'tableta de', name: 'chocolate 75% cacao' },
      { id: '7', baseQuantity: 250, unit: 'gr de', name: 'calabaza asada' },
      { id: '8', baseQuantity: 50, unit: 'gr de', name: 'cacao desgrasado en polvo 0%' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'requesón' },
      { id: '10', baseQuantity: 6, unit: '', name: 'dátiles (relleno)' },
      { id: '11', baseQuantity: null, unit: '3-4 gotas de', name: 'esencia de vainilla' },
    ],
    steps: [
      'Asar calabaza 45 minutos a 180º. Dejar enfriar. Hidratar 6 dátiles para relleno con agua caliente.',
      'Para base: triturar 8 dátiles, anacardos y avellanas. Mezclar con mantequilla y aceite de coco. Formar base en molde y refrigerar.',
      'Para relleno: batir calabaza asada, cacao, requesón, dátiles hidratados y vainilla hasta homogeneizar.',
      'Derretir chocolate con cuidado y añadir a la mezcla. Batir bien.',
      'Verter relleno sobre base en molde. Refrigerar unas horas hasta que cuaje.',
    ],
    nutrition: {
      totalWeightGrams: 1180,
      perServing: { calories: 385, protein: 12.8, carbs: 38.5, fat: 22.4, fiber: 6.8 },
      per100g: { calories: 326, protein: 10.8, carbs: 32.6, fat: 19.0, fiber: 5.8 },
    },
  },
  {
    id: 'arroz-leche-anis',
    title: 'Arroz con leche y anís estrellado',
    category: 'Postres',
    summary: 'Arroz con leche aromatizado con anís estrellado, canela y limón, endulzado con pasta de dátil.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200607_173009.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'litro de', name: 'leche' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'arroz bomba' },
      { id: '3', baseQuantity: 2, unit: 'ramas de', name: 'canela' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón (piel amarilla)' },
      { id: '5', baseQuantity: 1, unit: 'estrella de', name: 'anís' },
      { id: '6', baseQuantity: 10, unit: '', name: 'dátiles sin hueso' },
    ],
    steps: [
      'Hidratar dátiles sin hueso en agua hirviendo. Reservar.',
      'Hervir leche con anís estrellado, piel de limón (solo parte amarilla) y canela.',
      'Al romper hervor, añadir arroz bomba. Cocinar a fuego medio 15 minutos hasta que grano esté hecho.',
      'Mientras, batir dátiles hidratados hasta obtener pasta suave.',
      'Incorporar pasta de dátil a la olla. Mezclar bien y continuar cocinando hasta que arroz esté en su punto.',
      'Guardar en envases y espolvorear canela por encima.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 348, protein: 10.5, carbs: 62.8, fat: 6.2, fiber: 2.8 },
      per100g: { calories: 99, protein: 3.0, carbs: 17.9, fat: 1.8, fiber: 0.8 },
    },
  },
  {
    id: 'galletas-de-avena',
    title: 'Galletas de avena y almendras',
    category: 'Postres',
    summary: 'Galletas crujientes de avena y almendras endulzadas con dátiles, con ralladura de limón y un toque de aceite de oliva.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/11/IMG_20191116_191657-scaled.jpg',
    defaultServings: 12,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'harina de avena' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'harina de almendras' },
      { id: '3', baseQuantity: 7, unit: '', name: 'dátiles' },
      { id: '4', baseQuantity: 2, unit: '', name: 'limones (ralladura)' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'AOVE' },
      { id: '6', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura Royal' },
    ],
    steps: [
      'Hidratar dátiles en agua hirviendo 10 minutos. Batir con AOVE y huevo hasta crear mezcla suave.',
      'Mezclar harinas, levadura y ralladura de limón. Incorporar puré de dátiles y amasar.',
      'Extender masa con rodillo hasta 0,5 cm de grosor. Formar galletas con moldes.',
      'Pintar con huevo batido y hornear a 170º durante 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 440,
      perServing: { calories: 158, protein: 5.2, carbs: 15.8, fat: 8.9, fiber: 2.8 },
      per100g: { calories: 431, protein: 14.2, carbs: 43.1, fat: 24.3, fiber: 7.6 },
    },
  },
  {
    id: 'tarta-de-queso-carlos-ferrando',
    title: 'Tarta de queso de Carlos Ferrando',
    category: 'Postres',
    summary: 'Tarta de queso cremosa con queso batido, avena, dátiles y esencia de vainilla. Receta del nutricionista Carlos Ferrando.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/11/IMG_20191110_193800.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'queso de untar' },
      { id: '2', baseQuantity: 350, unit: 'ml de', name: 'queso fresco batido desnatado' },
      { id: '3', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 30, unit: 'gr de', name: 'queso curado rallado' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'copos de avena' },
      { id: '6', baseQuantity: 6, unit: '', name: 'dátiles' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'esencia de vainilla' },
    ],
    steps: [
      'Batir todos los ingredientes en procesador hasta obtener mezcla suave y homogénea.',
      'Forrar molde desmoldable con papel vegetal mojado en agua.',
      'Verter mezcla y hornear a 180º durante 45 minutos.',
      'Dejar reposar al menos 4 horas antes de servir.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: { calories: 258, protein: 15.8, carbs: 18.2, fat: 13.5, fiber: 1.2 },
      per100g: { calories: 196, protein: 12.0, carbs: 13.8, fat: 10.2, fiber: 0.9 },
    },
  },
  {
    id: 'bizcocho-coco-almendras',
    title: 'Bizcocho de coco y almendras',
    category: 'Postres',
    summary: 'Bizcocho esponjoso con harinas de coco y almendra, dátiles, chocolate negro y especias como canela y vainilla.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/11/IMG_20191105_160723.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'harina de coco' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'harina de almendra' },
      { id: '3', baseQuantity: 1, unit: 'sobre de', name: 'levadura química' },
      { id: '4', baseQuantity: 8, unit: '', name: 'dátiles' },
      { id: '5', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '6', baseQuantity: 150, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'canela' },
      { id: '8', baseQuantity: null, unit: '', name: 'Ralladura de limón al gusto' },
      { id: '9', baseQuantity: 2, unit: 'cucharaditas de', name: 'esencia de vainilla' },
      { id: '10', baseQuantity: 6, unit: 'onzas de', name: 'chocolate >70% cacao' },
    ],
    steps: [
      'Hidratar dátiles en agua hirviendo 15 minutos. Triturar con huevos, leche y vainilla.',
      'Incorporar harinas, levadura, canela, ralladura de limón y chocolate troceado.',
      'Verter en molde engrasado con aceite de coco.',
      'Hornear a 180º durante 45 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 720,
      perServing: { calories: 285, protein: 9.8, carbs: 28.5, fat: 16.2, fiber: 8.5 },
      per100g: { calories: 317, protein: 10.9, carbs: 31.7, fat: 18.0, fiber: 9.4 },
    },
  },
  {
    id: 'praline-avellanas',
    title: 'Praliné de avellanas y coco',
    category: 'Postres',
    summary: 'Topping versátil de avellanas tostadas, coco rallado y cacao puro para espolvorear sobre frutas, yogures o ensaladas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/10/IMG_20191027_144031_resized_20191027_025201516.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 120, unit: 'gr de', name: 'avellanas tostadas sin sal' },
      { id: '2', baseQuantity: 45, unit: 'gr de', name: 'coco rallado' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'cacao puro en polvo' },
      { id: '4', baseQuantity: null, unit: 'Una pizca de', name: 'sal' },
    ],
    steps: [
      'Colocar todos los ingredientes en procesador de alimentos.',
      'Triturar unos segundos hasta obtener textura terrosa o arenosa.',
      'Guardar en recipiente hermético en lugar seco.',
    ],
    nutrition: {
      totalWeightGrams: 172,
      perServing: { calories: 94, protein: 2.2, carbs: 3.8, fat: 8.3, fiber: 2.1 },
      per100g: { calories: 437, protein: 10.2, carbs: 17.7, fat: 38.6, fiber: 9.8 },
    },
  },
  {
    id: 'tarta-alubias-negras',
    title: 'Tarta de alubias negras',
    category: 'Postres',
    summary: 'Sorprendente tarta de chocolate con base de alubias negras, cacao, almendras y dátiles. Un postre saludable que desafía conceptos.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/10/IMG_20191020_110534.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'alubias negras cocidas' },
      { id: '2', baseQuantity: 8, unit: '', name: 'dátiles' },
      { id: '3', baseQuantity: 4, unit: 'cucharadas de', name: 'cacao puro en polvo' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'harina de almendra' },
      { id: '5', baseQuantity: 3, unit: 'cucharadas de', name: 'aceite de coco' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'canela en polvo' },
      { id: '7', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '8', baseQuantity: 200, unit: 'ml de', name: 'leche de avena' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura química' },
      { id: '10', baseQuantity: 80, unit: 'gr de', name: 'chocolate >70% cacao' },
    ],
    steps: [
      'Triturar alubias, dátiles, cacao, harina, aceite de coco, canela, huevos, leche y levadura hasta textura uniforme.',
      'Verter en molde engrasado y hornear 50 minutos a 180º. Dejar enfriar.',
      'Derretir chocolate y verter sobre la tarta fría.',
    ],
    nutrition: {
      totalWeightGrams: 780,
      perServing: { calories: 248, protein: 7.8, carbs: 28.5, fat: 12.8, fiber: 6.2 },
      per100g: { calories: 254, protein: 8.0, carbs: 29.2, fat: 13.1, fiber: 6.4 },
    },
  },
  {
    id: 'ensalada-alubias-langostinos',
    title: 'Ensalada de alubias y langostinos',
    category: 'Legumbres',
    summary: 'Ensalada completa con alubias, arroz, langostinos cocidos y mozzarella, aliñada con comino y vinagreta.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200615_160653.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'arroz seco' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'langostinos cocidos' },
      { id: '4', baseQuantity: 1, unit: 'bola de', name: 'mozzarella' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, vinagre, sal y pimienta' },
    ],
    steps: [
      'Cocer arroz en agua abundante. Escurrir y reservar.',
      'Mezclar arroz con alubias, langostinos pelados y mozzarella troceada.',
      'Aliñar con comino, AOVE, vinagre, sal y pimienta al gusto.',
    ],
    nutrition: {
      totalWeightGrams: 1125,
      perServing: { calories: 385, protein: 32.5, carbs: 48.2, fat: 6.8, fiber: 7.2 },
      per100g: { calories: 137, protein: 11.6, carbs: 17.2, fat: 2.4, fiber: 2.6 },
    },
  },
  {
    id: 'lentejas-especiadas-pollo',
    title: 'Lentejas especiadas con muslos de pollo',
    category: 'Legumbres',
    summary: 'Lentejas con muslos de pollo, patatas y especias aromáticas como comino, pimentón, cúrcuma y jengibre.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200531_224631.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'muslos de pollo' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'lentejas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '6', baseQuantity: 2, unit: 'cucharaditas de', name: 'comino molido' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'pimentón dulce' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'jengibre' },
      { id: '10', baseQuantity: 1, unit: 'litro de', name: 'caldo de pollo' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebolla y ajo picados en olla rápida 3 minutos. Añadir muslos y sellar.',
      'Incorporar lentejas, patatas en cuartos, especias, sal, pimienta y caldo.',
      'Cerrar olla, llevar a ebullición, bajar fuego y cocinar 20 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: { calories: 428, protein: 38.5, carbs: 48.2, fat: 8.5, fiber: 9.2 },
      per100g: { calories: 118, protein: 10.6, carbs: 13.3, fat: 2.3, fiber: 2.5 },
    },
  },
  {
    id: 'alubias-migas-bacalao',
    title: 'Alubias con migas de bacalao',
    category: 'Legumbres',
    summary: 'Potaje de alubias blancas con migas de bacalao, arroz basmati, patatas y sofrito de verduras al cúrcuma.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200601_152437.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'arroz basmati' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'migas de bacalao' },
      { id: '4', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 3, unit: 'dientes de', name: 'ajo pelados' },
      { id: '7', baseQuantity: 0.5, unit: '', name: 'pimiento verde' },
      { id: '8', baseQuantity: 0.5, unit: '', name: 'pimiento rojo' },
      { id: '9', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '10', baseQuantity: 800, unit: 'ml de', name: 'caldo de pescado' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y cúrcuma' },
    ],
    steps: [
      'Picar y sofreír todas las verduras con AOVE y laurel 7-8 minutos a fuego medio-bajo.',
      'Añadir patatas chascadas, arroz, cúrcuma, caldo, sal y pimienta. Chup chup 15 minutos.',
      'Incorporar alubias y migas de bacalao. Continuar 5 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1350,
      perServing: { calories: 398, protein: 32.8, carbs: 52.5, fat: 5.2, fiber: 8.5 },
      per100g: { calories: 118, protein: 9.7, carbs: 15.5, fat: 1.5, fiber: 2.5 },
    },
  },
  {
    id: 'alubias-gambas',
    title: 'Alubias con gambas',
    category: 'Legumbres',
    summary: 'Guiso cremoso de alubias blancas con gambas, arroz integral, vino blanco y tomate triturado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200521_165857-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'arroz seco' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '7', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '8', baseQuantity: 600, unit: 'ml de', name: 'caldo de pescado' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Dorar gambas con AOVE. Reservar. En misma olla sofreír cebolla y ajo picados.',
      'Añadir vino blanco y dejar evaporar alcohol. Incorporar arroz y caldo, chup chup 20 minutos.',
      'Triturar 200 gr alubias con tomate. Añadir a olla con 200 gr alubias enteras cuando falten 10 minutos.',
      'Agregar gambas en el último minuto y remover.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 412, protein: 28.5, carbs: 58.2, fat: 5.8, fiber: 8.2 },
      per100g: { calories: 132, protein: 9.1, carbs: 18.6, fat: 1.9, fiber: 2.6 },
    },
  },
  {
    id: 'curry-vegetal',
    title: 'Curry vegetal',
    category: 'Legumbres',
    summary: 'Curry vegetal con garbanzos, patatas, guisantes y leche de coco especiado con comino, curry y jengibre.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200518_171053.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 5, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: 2, unit: 'cucharaditas de', name: 'comino' },
      { id: '5', baseQuantity: 2, unit: 'cucharaditas de', name: 'curry en polvo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: null, unit: '', name: 'Jengibre fresco' },
      { id: '8', baseQuantity: 200, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '10', baseQuantity: 150, unit: 'gr de', name: 'guisantes' },
      { id: '11', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '12', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
    ],
    steps: [
      'Cocer patatas. Sofreír cebolla y ajos tiernos 3-4 minutos.',
      'Añadir especias (comino, curry, jengibre rallado), sal y pimienta. Agregar tomate y garbanzos.',
      'Incorporar leche de coco y caldo. Chup chup 15 minutos.',
      'Cuando falten 10 minutos añadir guisantes. Remover cuidadosamente.',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: { calories: 385, protein: 12.5, carbs: 58.2, fat: 12.8, fiber: 11.2 },
      per100g: { calories: 99, protein: 3.2, carbs: 15.0, fat: 3.3, fiber: 2.9 },
    },
  },
  {
    id: 'hummus-remolacha',
    title: 'Hummus de remolacha',
    category: 'Legumbres',
    summary: 'Hummus de color vibrante elaborado con garbanzos, remolacha cocida, tahini de sésamo, comino y limón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200509_214309-1.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón grande (zumo)' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 150, unit: 'gr de', name: 'remolacha cocida' },
    ],
    steps: [
      'Poner todos los ingredientes en procesador de alimentos.',
      'Batir hasta que queden bien integrados. Añadir caldo gradualmente según textura deseada.',
    ],
    nutrition: {
      totalWeightGrams: 720,
      perServing: { calories: 88, protein: 4.8, carbs: 14.2, fat: 1.8, fiber: 4.2 },
      per100g: { calories: 73, protein: 4.0, carbs: 11.8, fat: 1.5, fiber: 3.5 },
    },
  },
  {
    id: 'alubias-salchichas',
    title: 'Alubias blancas con salchichas frescas',
    category: 'Legumbres',
    summary: 'Guiso reconfortante con alubias, salchichas de pollo, quinoa y crema de verduras con calabaza.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200512_170217.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 8, unit: '', name: 'salchichas frescas de pollo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '5', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 200, unit: 'gr de', name: 'calabaza' },
      { id: '7', baseQuantity: 80, unit: 'gr de', name: 'quinoa' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sellar salchichas en olla con AOVE. Reservar.',
      'Sofreír cebolla, puerro, ajo y calabaza 10 minutos. Triturar con 500 ml agua.',
      'Devolver a olla, agregar quinoa y alubias. Salpimentar y chup chup 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1350,
      perServing: { calories: 448, protein: 28.5, carbs: 42.8, fat: 18.2, fiber: 9.5 },
      per100g: { calories: 133, protein: 8.4, carbs: 12.7, fat: 5.4, fiber: 2.8 },
    },
  },
  {
    id: 'lentejas-curry-manzana',
    title: 'Lentejas con curry de manzana',
    category: 'Legumbres',
    summary: 'Lentejas con toque dulce gracias a curry de manzana asada, leche de coco y especias aromáticas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200506_211643.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'lentejas secas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento' },
      { id: '5', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '6', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '7', baseQuantity: 1, unit: '', name: 'manzana golden' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'curry' },
      { id: '9', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebolla, ajo y pimiento picados. Añadir tomate picado, lentejas, laurel, 700 ml agua, sal y pimienta. Cocinar 20 minutos.',
      'Cocinar manzana descorazonada al microondas 4 minutos. Pelar y triturar con curry y leche de coco.',
      'Incorporar curry de manzana a lentejas cocidas. Hervir 1-2 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 298, protein: 14.8, carbs: 45.2, fat: 7.2, fiber: 9.8 },
      per100g: { calories: 95, protein: 4.7, carbs: 14.4, fat: 2.3, fiber: 3.1 },
    },
  },
  {
    id: 'guiso-pavo-alubias',
    title: 'Guiso de pavo con alubias',
    category: 'Legumbres',
    summary: 'Guiso robusto de pavo con alubias negras, bacon, vino blanco y pimentón ahumado.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200422_154336.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'pavo para guisar' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'bacon' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '6', baseQuantity: 400, unit: 'gr de', name: 'alubias negras cocidas' },
      { id: '7', baseQuantity: 200, unit: 'ml de', name: 'vino blanco' },
      { id: '8', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '9', baseQuantity: 250, unit: 'ml de', name: 'caldo de carne' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'hierbas provenzales' },
      { id: '11', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebolla, zanahorias y ajo picados. Añadir pavo troceado y bacon, dorar.',
      'Salpimentar, agregar hierbas provenzales. Incorporar vino blanco y dejar evaporar.',
      'Añadir pimentón, alubias, tomate y caldo. Chup chup 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1350,
      perServing: { calories: 385, protein: 38.2, carbs: 28.5, fat: 12.8, fiber: 8.2 },
      per100g: { calories: 114, protein: 11.3, carbs: 8.4, fat: 3.8, fiber: 2.4 },
    },
  },
  {
    id: 'hummus-habas',
    title: 'Hummus de habas',
    category: 'Legumbres',
    summary: 'Hummus cremoso de habas frescas con tahini de sésamo, limón y comino. Perfecto con crudités.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200416_213039.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'habas peladas' },
      { id: '2', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'limón (zumo)' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'comino molido' },
      { id: '5', baseQuantity: 15, unit: 'ml de', name: 'AOVE' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Escaldar habas en agua con sal. Cuando hierva, cocinar 3 minutos. Escurrir y enfriar.',
      'Triturar habas frías con resto de ingredientes hasta consistencia de puré.',
      'Servir con crudités de zanahoria, pepino, apio o regañás integrales.',
    ],
    nutrition: {
      totalWeightGrams: 420,
      perServing: { calories: 78, protein: 4.2, carbs: 8.5, fat: 3.2, fiber: 3.8 },
      per100g: { calories: 111, protein: 6.0, carbs: 12.1, fat: 4.6, fiber: 5.4 },
    },
  },
  {
    id: 'garbanzos-arroz',
    title: 'Garbanzos con arroz',
    category: 'Legumbres',
    summary: 'Plato completo con garbanzos, arroz, pechuga de pollo y pimiento especiado con comino.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200413_155358.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 70, unit: 'gr de', name: 'arroz' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 250, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '7', baseQuantity: 700, unit: 'ml de', name: 'caldo de carne' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'comino en polvo' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír pimiento y cebolla picados 3 minutos. Añadir pollo troceado y dorar.',
      'Agregar arroz, garbanzos, comino, caldo, sal y pimienta.',
      'Cocinar 5 minutos a fuego alto, luego bajar a medio y chup chup 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 328, protein: 28.5, carbs: 42.8, fat: 5.2, fiber: 7.8 },
      per100g: { calories: 105, protein: 9.1, carbs: 13.7, fat: 1.7, fiber: 2.5 },
    },
  },
  {
    id: 'hamburguesas-guisantes',
    title: 'Hamburguesas de guisantes',
    category: 'Legumbres',
    summary: 'Hamburguesas vegetales de guisantes con cebolla, albahaca, ralladura de limón y harina de garbanzo.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200405_154849-1-1-1024x526.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'guisantes' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón (ralladura)' },
      { id: '5', baseQuantity: 3, unit: 'cucharadas de', name: 'harina de garbanzo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebolla picada 5 minutos. Añadir guisantes, salpimentar y cocinar otros 5 minutos. Dejar enfriar.',
      'Chafar bien, agregar albahaca, ralladura de limón y harina de garbanzo. Mezclar.',
      'Refrigerar mínimo 30 minutos. Formar hamburguesas y dorar a la plancha o al horno.',
    ],
    nutrition: {
      totalWeightGrams: 480,
      perServing: { calories: 128, protein: 7.2, carbs: 18.5, fat: 3.2, fiber: 6.8 },
      per100g: { calories: 107, protein: 6.0, carbs: 15.4, fat: 2.7, fiber: 5.7 },
    },
  },
  {
    id: 'lentejas-coliflor',
    title: 'Lentejas con coliflor',
    category: 'Legumbres',
    summary: 'Lentejas con coliflor, zanahoria, apio y tomate especiadas con ajo, comino, pimentón ahumado, cúrcuma y jengibre.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200331_144746.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'coliflor' },
      { id: '3', baseQuantity: 1, unit: '', name: 'zanahoria' },
      { id: '4', baseQuantity: 2, unit: 'ramas de', name: 'apio' },
      { id: '5', baseQuantity: 200, unit: 'gr de', name: 'lentejas secas' },
      { id: '6', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '7', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '10', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '11', baseQuantity: 0.5, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '12', baseQuantity: 1, unit: 'cucharadita de', name: 'jengibre fresco picado' },
      { id: '13', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '14', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '15', baseQuantity: 1, unit: 'cucharada de', name: 'vinagre' },
      { id: '16', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebolla picada. A los 3 minutos añadir apio y zanahoria. Cocinar 2 minutos más.',
      'Agregar especias (ajo, comino, pimentón, cúrcuma, jengibre), sal y pimienta. Remover.',
      'Incorporar lentejas, tomate, laurel y caldo. Chup chup 30 minutos (20 minutos en olla rápida).',
      'Cuando falten 8 minutos añadir coliflor. Cuando falten 2 minutos añadir soja y vinagre.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: { calories: 248, protein: 14.8, carbs: 42.5, fat: 2.8, fiber: 10.2 },
      per100g: { calories: 68, protein: 4.1, carbs: 11.7, fat: 0.8, fiber: 2.8 },
    },
  },
  {
    id: 'sopa-almejas-arroz',
    title: 'Sopa de almejas y arroz',
    category: 'Pescado',
    summary: 'Sopa reconfortante con almejas frescas, arroz, azafrán y finas hierbas en su propio caldo.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200331_141240.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'almejas' },
      { id: '2', baseQuantity: 120, unit: 'gr de', name: 'arroz' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '6', baseQuantity: 8, unit: 'pelos de', name: 'azafrán' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'finas hierbas' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Hervir 1 litro agua con laurel. Añadir almejas y cocinar 2-3 minutos hasta que abran. Colar y reservar caldo y almejas.',
      'Sofreír cebolla y ajo picados. Cuando estén transparentes añadir arroz, tomate, hierbas y caldo de almejas.',
      'Agregar azafrán. Chup chup hasta que arroz esté hecho. Añadir más caldo si necesario.',
      'Incorporar almejas sin cáscara en el último minuto.',
    ],
    nutrition: {
      totalWeightGrams: 1150,
      perServing: { calories: 212, protein: 14.8, carbs: 32.5, fat: 2.8, fiber: 1.2 },
      per100g: { calories: 74, protein: 5.1, carbs: 11.3, fat: 1.0, fiber: 0.4 },
    },
  },
  {
    id: 'sopa-goulash',
    title: 'Sopa Goulash',
    category: 'Sopa',
    summary: 'Sopa húngara de ternera con pimientos, cebolla, pimentón, tomillo y comino cocida lentamente con vino blanco.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200330_171010.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'ternera para guisar' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla grande' },
      { id: '3', baseQuantity: 2, unit: '', name: 'pimientos verdes' },
      { id: '4', baseQuantity: 750, unit: 'ml de', name: 'caldo de verduras' },
      { id: '5', baseQuantity: null, unit: '', name: 'Pimentón' },
      { id: '6', baseQuantity: null, unit: '', name: 'Tomillo' },
      { id: '7', baseQuantity: null, unit: '', name: 'Comino' },
      { id: '8', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '9', baseQuantity: 100, unit: 'ml de', name: 'vino blanco' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Derretir mantequilla y dorar cebolla y pimientos picados 3 minutos.',
      'Añadir carne troceada y dorar sellando por todos lados. Agregar tomillo, comino, pimentón, sal y pimienta.',
      'Incorporar caldo y vino blanco. Chup chup 60 minutos.',
      'Servir con arroz cocido.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 358, protein: 32.8, carbs: 8.5, fat: 21.2, fiber: 1.8 },
      per100g: { calories: 114, protein: 10.5, carbs: 2.7, fat: 6.8, fiber: 0.6 },
    },
  },
  {
    id: 'sopa-de-arroz',
    title: 'Sopa de arroz',
    category: 'Sopa',
    summary: 'Sopa de arroz con pimiento asado, tomate y caldo de carne. Acompañada de huevo cocido.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200302_211531.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'arroz' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento asado' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: 'litro de', name: 'caldo de carne' },
      { id: '7', baseQuantity: null, unit: 'Unas hebras de', name: 'azafrán' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 4, unit: '', name: 'huevos cocidos' },
    ],
    steps: [
      'Sofreír cebolla y tomates pelados y picados con AOVE durante 2 minutos a fuego medio.',
      'Añadir caldo de carne y cuando hierva incorporar arroz, ajo picado, pimiento asado en tiras, azafrán y sal y pimienta.',
      'Chup chup 12-15 minutos hasta que el arroz esté hecho.',
      'Servir acompañado de huevo cocido y más caldo si es necesario.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: { calories: 298, protein: 12.5, carbs: 44.2, fat: 8.5, fiber: 2.8 },
      per100g: { calories: 85, protein: 3.6, carbs: 12.6, fat: 2.4, fiber: 0.8 },
    },
  },
  {
    id: 'sopa-cortijera',
    title: 'Sopa cortijera',
    category: 'Sopa',
    summary: 'Sopa andaluza con verduras, espárragos, jamón serrano, pan integral y huevos escalfados.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/02/IMG_20200225_195231.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'tomate gordo maduro' },
      { id: '2', baseQuantity: 4, unit: 'dientes de', name: 'ajo picados' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'pimentón' },
      { id: '4', baseQuantity: 120, unit: 'gr de', name: 'espárragos verdes' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 1, unit: '', name: 'pimiento verde pequeño' },
      { id: '7', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '8', baseQuantity: 80, unit: 'gr de', name: 'jamón serrano sin aditivos' },
      { id: '9', baseQuantity: 1, unit: 'litro de', name: 'caldo de carne o pollo' },
      { id: '10', baseQuantity: 3, unit: 'rebanadas de', name: 'pan integral' },
    ],
    steps: [
      'Cortar cebolla, pimiento, tomate y ajo en dados pequeños. Trocear espárragos. Sofreír con AOVE 5 minutos a fuego medio-bajo.',
      'Añadir caldo y pimentón. Chup chup 10 minutos a fuego medio-bajo.',
      'Tostar pan integral y añadir a la olla junto con jamón picado.',
      'Cascar huevos y dejar cocer hasta que cuajen.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 265, protein: 18.2, carbs: 22.5, fat: 11.8, fiber: 3.5 },
      per100g: { calories: 85, protein: 5.8, carbs: 7.2, fat: 3.8, fiber: 1.1 },
    },
  },
  {
    id: 'sopa-de-patatas-aleman',
    title: 'Sopa de patatas estilo alemán',
    category: 'Sopa',
    summary: 'Sopa alemana cremosa de patatas con verduras y salchichas bratwurst. Reconfortante y sabrosa.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200127_153719.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 1, unit: 'tallo de', name: 'apio' },
      { id: '6', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 1, unit: 'cucharada rasa de', name: 'mantequilla' },
      { id: '10', baseQuantity: 3, unit: '', name: 'salchichas bratwurst' },
    ],
    steps: [
      'Picar cebolla, zanahorias, apio y puerro. Cortar patatas en dados. Sofreír con AOVE y mantequilla 2-3 minutos a fuego medio.',
      'Añadir caldo, laurel, sal y pimienta. Cuando hierva bajar a fuego medio-bajo y chup chup 20 minutos.',
      'Triturar toda o la mitad de la mezcla según preferencia.',
      'Añadir salchichas cortadas en rodajas. El calor residual las cocinará.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: { calories: 312, protein: 12.8, carbs: 38.5, fat: 13.2, fiber: 5.5 },
      per100g: { calories: 96, protein: 3.9, carbs: 11.8, fat: 4.0, fiber: 1.7 },
    },
  },
  {
    id: 'sopa-quinoa-almejas',
    title: 'Sopa de quinoa con almejas',
    category: 'Sopa',
    summary: 'Sopa de quinoa con almejas, alcachofas, zanahorias y caldo de pescado. Nutritiva y deliciosa.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/10/IMG_20191029_154804.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 0.5, unit: 'kg de', name: 'almejas' },
      { id: '3', baseQuantity: 3, unit: '', name: 'alcachofas' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '7', baseQuantity: 1, unit: 'litro de', name: 'caldo de pescado' },
      { id: '8', baseQuantity: 1, unit: 'vasito de', name: 'vino blanco' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Picar cebolla y zanahorias. Pochar con AOVE. Añadir alcachofas picadas y tomate rallado. Pochar a fuego medio.',
      'Lavar quinoa y agregar a la sopa. Sazonar, cubrir con caldo de pescado y chup chup a fuego medio-bajo.',
      'Cocinar almejas en sartén con vino blanco tapadas 1 minuto hasta que abran. Reservar marisco.',
      'Añadir jugo de almejas y vino a la sopa. Cocinar 10-15 minutos. Incorporar almejas antes de servir.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: { calories: 285, protein: 18.5, carbs: 38.2, fat: 6.8, fiber: 5.2 },
      per100g: { calories: 79, protein: 5.1, carbs: 10.5, fat: 1.9, fiber: 1.4 },
    },
  },
  {
    id: 'sopa-de-cacahuete',
    title: 'Sopa de cacahuete',
    category: 'Sopa',
    summary: 'Sopa de cacahuete con pollo, verduras y macarrones. Inspirada en recetas africanas con un toque especial.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/05/IMG_20190518_214303_resized_20190518_095217588.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 4, unit: '', name: 'pimientos verdes italianos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Agua o caldo de pollo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y pimentón' },
      { id: '7', baseQuantity: 1, unit: 'puñado de', name: 'cacahuetes pelados' },
      { id: '8', baseQuantity: 50, unit: 'gr de', name: 'macarrones integrales' },
    ],
    steps: [
      'Asar pimientos: embadurnar con AOVE y microondas 10 minutos a máxima potencia.',
      'Picar cebolla y zanahorias. Trocear pechuga. Echar a olla con agua o caldo. Llevar a ebullición y bajar fuego. Chup chup 20 minutos.',
      'Pelar y trocear pimientos asados. Añadir a la olla. Batir cacahuetes con agua hasta obtener puré blanco. Incorporar junto con macarrones.',
      'Chup chup 15 minutos más. Añadir más caldo al servir según necesidad.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 298, protein: 22.5, carbs: 28.8, fat: 11.2, fiber: 4.8 },
      per100g: { calories: 108, protein: 8.2, carbs: 10.5, fat: 4.1, fiber: 1.7 },
    },
  },
  {
    id: 'sopa-quinoa-garbanzos',
    title: 'Sopa de quinoa con garbanzos',
    category: 'Sopa',
    summary: 'Sopa de quinoa con garbanzos, bacalao fresco y verduras con toques de limón, alcaparras y hierbas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/05/IMG_20190513_154245.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 60, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'bacalao fresco' },
      { id: '4', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '5', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '6', baseQuantity: 1, unit: 'litro de', name: 'caldo de pollo' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y azafrán' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ralladura de limón' },
      { id: '9', baseQuantity: 2, unit: 'cucharaditas de', name: 'alcaparras picadas' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'perejil picado' },
      { id: '11', baseQuantity: 3, unit: 'cucharaditas de', name: 'eneldo picado' },
    ],
    steps: [
      'Picar puerro. Cortar patata en cubos. Rehogar con AOVE. Salpimentar y añadir azafrán.',
      'Incorporar garbanzos y caldo. Agregar quinoa y cocinar 20 minutos.',
      'Añadir trocitos de bacalao fresco y cocinar 2 minutos más.',
      'Mezclar ralladura de limón, alcaparras, perejil y eneldo. Incorporar al servir.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: { calories: 225, protein: 16.8, carbs: 28.5, fat: 5.2, fiber: 4.5 },
      per100g: { calories: 86, protein: 6.4, carbs: 10.9, fat: 2.0, fiber: 1.7 },
    },
  },
  {
    id: 'sopa-de-quinoa',
    title: 'Sopa de quinoa',
    category: 'Sopa',
    summary: 'Sopa de pollo y quinoa con verduras, maíz, pimientos asados y laurel. Receta reconfortante y nutritiva.',
    image: 'https://lavidabonica.com/wp-content/uploads/2018/12/img_20181216_201226765455136581871901.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 0.5, unit: 'litro de', name: 'caldo de pollo' },
      { id: '2', baseQuantity: 0.5, unit: 'litro de', name: 'agua' },
      { id: '3', baseQuantity: 2, unit: 'hojas de', name: 'laurel' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y apio' },
      { id: '5', baseQuantity: null, unit: 'Zumo de', name: 'medio limón' },
      { id: '6', baseQuantity: 2, unit: '', name: 'zanahorias en dados' },
      { id: '7', baseQuantity: 2, unit: '', name: 'muslos y contramuslos' },
      { id: '8', baseQuantity: 8, unit: '', name: 'pimientos asados pequeños' },
      { id: '9', baseQuantity: 1, unit: 'mazorca de', name: 'maíz' },
      { id: '10', baseQuantity: 80, unit: 'gr de', name: 'quinoa' },
    ],
    steps: [
      'Poner todo excepto quinoa en olla. A fuego medio tras hervir, cocinar 30 minutos.',
      'Añadir quinoa lavada con agua fría. Cocinar 15 minutos más.',
      'Servir bien caliente.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: { calories: 285, protein: 24.5, carbs: 28.2, fat: 8.5, fiber: 4.2 },
      per100g: { calories: 95, protein: 8.2, carbs: 9.4, fat: 2.8, fiber: 1.4 },
    },
  },
  {
    id: 'grisines-al-curry',
    title: 'Grisines al curry',
    category: 'Pan',
    summary: 'Grisines de harina integral con curry. Crujientes palitos de pan perfectos para aperitivos o snacks.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/04/IMG_20190413_155651_resized_20190413_045529473.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 250, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '2', baseQuantity: 170, unit: 'ml de', name: 'agua' },
      { id: '3', baseQuantity: 25, unit: 'gr de', name: 'AOVE' },
      { id: '4', baseQuantity: 5, unit: 'gr de', name: 'sal' },
      { id: '5', baseQuantity: 10, unit: 'gr de', name: 'curry en polvo' },
      { id: '6', baseQuantity: 3, unit: 'gr de', name: 'levadura seca' },
    ],
    steps: [
      'En Thermomix: agua, AOVE, sal y curry 1 minuto Vel 4 a 37º. Añadir levadura y mezclar 5 segundos Vel 4.',
      'Incorporar harina. 10 segundos Vel 6, luego 5 minutos Vel Espiga. Formar bola, tapar y fermentar 1h30.',
      'Aplanar masa con rodillo en superficie enharinada. Cortar tiras de 1cm y enroscar sobre sí mismas.',
      'Precalentar horno a 200º. Hornear 18-20 minutos. Enfriar sobre rejilla.',
    ],
    nutrition: {
      totalWeightGrams: 450,
      perServing: { calories: 178, protein: 5.2, carbs: 32.5, fat: 4.2, fiber: 4.8 },
      per100g: { calories: 237, protein: 6.9, carbs: 43.3, fat: 5.6, fiber: 6.4 },
    },
  },
  {
    id: 'pizzaca',
    title: 'Pizzaca',
    category: 'Pan',
    summary: 'Pizza casera con tomate rallado, yogur griego, setas, salchichas frescas y queso. Receta familiar y versátil.',
    image: 'https://lavidabonica.com/wp-content/uploads/2018/12/IMG_20181209_121304_resized_20181209_121401895.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'masa de pizza' },
      { id: '2', baseQuantity: 1, unit: '', name: 'tomate gordo rallado' },
      { id: '3', baseQuantity: 1, unit: '', name: 'yogur griego natural' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'setas picadas' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal' },
      { id: '6', baseQuantity: null, unit: '', name: 'Salchichas frescas de pollo' },
      { id: '7', baseQuantity: null, unit: '', name: 'Queso' },
    ],
    steps: [
      'Precalentar horno a 220º. Mezclar tomate rallado con yogur griego y setas picadas. Añadir sal.',
      'Extender masa en bandeja de horno. Cubrir con mezcla de tomate, yogur y setas.',
      'Añadir salchichas frescas (sin piel) a trozos y queso por encima.',
      'Hornear 10 minutos a 220º, bajar a 180º y hornear 15 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: { calories: 358, protein: 18.5, carbs: 38.2, fat: 15.8, fiber: 3.5 },
      per100g: { calories: 169, protein: 8.7, carbs: 18.0, fat: 7.4, fiber: 1.6 },
    },
  },
  {
    id: 'reganas-ivan-yarza',
    title: 'Regañás de Iván Yarza',
    category: 'Pan',
    summary: 'Regañás crujientes de harina integral con fermento largo. Receta del panadero Iván Yarza perfecta para snacks.',
    image: 'https://lavidabonica.com/wp-content/uploads/2018/11/44953761_10217424767519988_7076299614793498624_n.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 50, unit: 'gr de', name: 'harina integral (fermento)' },
      { id: '2', baseQuantity: 25, unit: 'gr de', name: 'agua (fermento)' },
      { id: '3', baseQuantity: 1, unit: 'gr de', name: 'levadura fresca (fermento)' },
      { id: '4', baseQuantity: 250, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '5', baseQuantity: 135, unit: 'gr de', name: 'agua' },
      { id: '6', baseQuantity: 25, unit: 'gr de', name: 'AOVE' },
      { id: '7', baseQuantity: 3, unit: 'gr de', name: 'sal' },
      { id: '8', baseQuantity: 3, unit: 'gr de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 3, unit: 'gr de', name: 'cebolla en polvo' },
      { id: '10', baseQuantity: 3, unit: 'gr de', name: 'levadura fresca' },
    ],
    steps: [
      'Fermento: mezclar 50g harina integral, 25g agua, 1g levadura. Fermentar 1h a temperatura ambiente, luego nevera hasta 2 días (o 3h fuera).',
      'Masa: en Thermomix añadir todo, 10 seg Vel 6, luego 5 min Vel Espiga. Fermentar 2 horas.',
      'Estirar masa 5mm grosor. Cortar cintas 1cm x 5cm. Disponer en papel horno con espacio. Fermentar 1h (al horno apagado para evitar sequedad).',
      'Hornear 160º ventilador. Bandeja con agua abajo 5 min. Retirar agua, hornear 12 min más (cambiar bandejas a mitad). Apagar horno, dejar con puerta abierta 10 min.',
    ],
    nutrition: {
      totalWeightGrams: 490,
      perServing: { calories: 148, protein: 4.8, carbs: 26.5, fat: 3.2, fiber: 4.2 },
      per100g: { calories: 242, protein: 7.8, carbs: 43.3, fat: 5.2, fiber: 6.8 },
    },
  },
  {
    id: 'espaguetis-salsa-negra',
    title: 'Espaguetis integrales en salsa negra',
    category: 'Hidratos',
    summary: 'Espaguetis con salsa de tinta de calamar, gambas, verduras y pimentón ahumado. Sabor intenso del mar.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/06/IMG_20200612_160605.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 2, unit: '', name: 'pimientos verdes' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'gambas peladas' },
      { id: '5', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '6', baseQuantity: 2, unit: 'bolsas de', name: 'tinta de calamar' },
      { id: '7', baseQuantity: 300, unit: 'ml de', name: 'caldo de pescado' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '10', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
    ],
    steps: [
      'Sellar gambas con AOVE en sartén. Reservar.',
      'En misma sartén sofreír cebolla, pimientos y ajo picados a fuego medio 10 minutos.',
      'Añadir pimentón ahumado, tintas de calamar disueltas en agua caliente, tomate, caldo de pescado, sal y pimienta. Chup chup 5 minutos.',
      'Triturar sofrito hasta consistencia cremosa. Cocer pasta, mezclar con salsa y gambas.',
    ],
    nutrition: {
      totalWeightGrams: 1100,
      perServing: { calories: 385, protein: 28.5, carbs: 52.8, fat: 8.2, fiber: 7.5 },
      per100g: { calories: 140, protein: 10.4, carbs: 19.2, fat: 3.0, fiber: 2.7 },
    },
  },
  {
    id: 'pasta-uvas-pasas-pollo',
    title: 'Pasta integral con salsa de uvas pasas y pollo',
    category: 'Hidratos',
    summary: 'Pasta con salsa cremosa de pollo, verduras, ciruelas pasas, coñac y especias. Toque dulce y sabroso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200531_000546.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'muslos de pollo' },
      { id: '2', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '3', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '4', baseQuantity: 3, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'ciruelas pasas' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'coñac' },
      { id: '7', baseQuantity: 400, unit: 'ml de', name: 'caldo de pollo' },
      { id: '8', baseQuantity: 0.5, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'canela' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '11', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
    ],
    steps: [
      'Salpimentar muslos con albahaca y canela. Disponer en bandeja con puerros, zanahorias, tomates troceados, ciruelas, AOVE y coñac.',
      'Precalentar horno a 200º. Hornear 15 minutos. Añadir caldo de pollo y hornear 60 minutos más.',
      'Triturar verduras y pasas hasta salsa cremosa. Desmenuzar carne.',
      'Cocer pasta y mezclar con salsa y carne desmenuzada.',
    ],
    nutrition: {
      totalWeightGrams: 1350,
      perServing: { calories: 495, protein: 38.5, carbs: 58.2, fat: 12.8, fiber: 8.5 },
      per100g: { calories: 147, protein: 11.4, carbs: 17.2, fat: 3.8, fiber: 2.5 },
    },
  },
  {
    id: 'pasta-curry-vegetal',
    title: 'Pasta integral con salsa de curry vegetal',
    category: 'Hidratos',
    summary: 'Pasta con salsa cremosa de curry, garbanzos, guisantes y leche de coco. Vegana y aromática.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200517_123756.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 2, unit: 'cucharaditas de', name: 'comino' },
      { id: '4', baseQuantity: 2, unit: 'cucharaditas de', name: 'curry en polvo' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y jengibre fresco' },
      { id: '6', baseQuantity: 200, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '7', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '8', baseQuantity: 150, unit: 'gr de', name: 'guisantes' },
      { id: '9', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '10', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
      { id: '11', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
    ],
    steps: [
      'Sofreír cebolla y ajos tiernos picados con AOVE 3-4 minutos a fuego medio.',
      'Añadir comino, curry, jengibre rallado, sal y pimienta. Remover. Agregar tomate y garbanzos. Subir fuego.',
      'Incorporar leche de coco y caldo. Chup chup 15 minutos. Añadir guisantes a los 10 minutos. Bajar fuego y remover.',
      'Triturar bien para obtener salsa cremosa. Cocer pasta y mezclar con salsa.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: { calories: 445, protein: 18.5, carbs: 68.5, fat: 12.8, fiber: 12.5 },
      per100g: { calories: 142, protein: 5.9, carbs: 21.8, fat: 4.1, fiber: 4.0 },
    },
  },
  {
    id: 'pasta-pesto-brocoli',
    title: 'Pasta integral con pesto de brócoli',
    category: 'Hidratos',
    summary: 'Pasta con pesto verde de brócoli, avellanas, parmesano, limón y albahaca. Saludable y delicioso.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200509_213712-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'brócoli pequeño' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'fruto seco tostado sin sal (avellanas)' },
      { id: '3', baseQuantity: 70, unit: 'gr de', name: 'queso parmesano' },
      { id: '4', baseQuantity: null, unit: 'Zumo de', name: 'medio limón' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: 2, unit: 'cucharadas de', name: 'AOVE' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '10', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
    ],
    steps: [
      'Trocear brócoli. Cocinar en microondas 3 minutos a máxima potencia. Reservar.',
      'En procesador añadir frutos secos, parmesano, zumo de limón, ajo sin simiente, albahaca, salsa de soja, AOVE, sal y pimienta.',
      'Agregar brócoli atemperado y triturar según consistencia deseada.',
      'Cocer pasta. Mezclar con pesto y agua de cocción si necesario.',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: { calories: 385, protein: 18.2, carbs: 52.5, fat: 14.8, fiber: 9.2 },
      per100g: { calories: 181, protein: 8.6, carbs: 24.7, fat: 7.0, fiber: 4.3 },
    },
  },
  {
    id: 'pasta-coliflor-champinones',
    title: 'Pasta integral con crema de coliflor y champiñones',
    category: 'Hidratos',
    summary: 'Pasta con crema sedosa de coliflor, anacardos y champiñones dorados. Receta cremosa sin nata.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/05/IMG_20200426_150746-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor pequeña' },
      { id: '2', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'anacardos tostados sin sal' },
      { id: '4', baseQuantity: 300, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'champiñón laminado' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla' },
      { id: '7', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '9', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
    ],
    steps: [
      'Cocer coliflor al vapor (microondas 7 minutos en arbolitos pequeños).',
      'Sofreír ajos tiernos con AOVE hasta dorar.',
      'Triturar coliflor con ajos, anacardos, leche y salsa de soja. Salpimentar.',
      'En misma sartén dorar champiñones con mantequilla a fuego medio-alto removiendo constantemente. Cocer pasta y mezclar con crema y champiñones.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: { calories: 425, protein: 18.5, carbs: 58.2, fat: 15.8, fiber: 9.5 },
      per100g: { calories: 162, protein: 7.0, carbs: 22.1, fat: 6.0, fiber: 3.6 },
    },
  },
  {
    id: 'lasana-de-suegra',
    title: 'Lasaña de suegra',
    category: 'Hidratos',
    summary: 'Lasaña clásica con carne, verduras, bechamel casera y chorizo ibérico. Receta familiar tradicional.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200427_1606226479.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 1, unit: '', name: 'berenjena' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 500, unit: 'gr de', name: 'carne picada' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'chorizo ibérico' },
      { id: '6', baseQuantity: 300, unit: 'gr de', name: 'tomate frito' },
      { id: '7', baseQuantity: null, unit: '', name: 'Placas de lasaña precocida' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 50, unit: 'gr de', name: 'harina (bechamel)' },
      { id: '10', baseQuantity: 30, unit: 'ml de', name: 'AOVE (bechamel)' },
      { id: '11', baseQuantity: 30, unit: 'gr de', name: 'mantequilla (bechamel)' },
      { id: '12', baseQuantity: 40, unit: 'gr de', name: 'cebolla (bechamel)' },
      { id: '13', baseQuantity: 600, unit: 'ml de', name: 'leche (bechamel)' },
      { id: '14', baseQuantity: null, unit: '', name: 'Sal, pimienta y nuez moscada (bechamel)' },
    ],
    steps: [
      'Bechamel: Thermomix AOVE, mantequilla, cebolla 3 min 100º Vel 2. Añadir harina 1 min 100º Vel 3. Agregar leche, nuez moscada, sal, pimienta 10 min 90º Vel 4.',
      'Dorar verduras troceadas (champiñones, berenjena, zanahorias) con AOVE a fuego medio. Subir fuego, añadir carne y chorizo picado. Dorar bien. Salpimentar.',
      'Agregar tomate frito y remover.',
      'Montar lasaña: untar bandeja con mantequilla, alternar capas de placas, boloñesa y bechamel (3-4 capas). Terminar con bechamel y queso rallado. Hornear 30 min a 190º.',
    ],
    nutrition: {
      totalWeightGrams: 1850,
      perServing: { calories: 485, protein: 28.5, carbs: 42.8, fat: 22.5, fiber: 4.2 },
      per100g: { calculations: 158, protein: 9.3, carbs: 14.0, fat: 7.3, fiber: 1.4 },
    },
  },
  {
    id: 'pasta-pesto-calabacin',
    title: 'Pasta integral con pesto de calabacín y gambas',
    category: 'Hidratos',
    summary: 'Pasta con pesto verde de calabacín, anacardos, albahaca y parmesano acompañado de gambas salteadas.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200419_180806.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'calabacines medianos' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'anacardos' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'albahaca fresca' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'parmesano rallado' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '7', baseQuantity: 320, unit: 'gr de', name: 'pasta integral' },
      { id: '8', baseQuantity: 250, unit: 'gr de', name: 'colas de gambas peladas' },
      { id: '9', baseQuantity: null, unit: '', name: 'Guindilla (opcional)' },
    ],
    steps: [
      'Pochar cebolla picada con AOVE 5 minutos. Añadir calabacines en rodajas con piel. Pochar 1 minuto. Cubrir de agua con sal, chup chup 5 minutos.',
      'Triturar cebolla y calabacín sofritos con anacardos, albahaca y parmesano. Reservar.',
      'Dorar gambas con AOVE y guindilla. Reservar.',
      'Cocer pasta. Mezclar con pesto y añadir agua de cocción si necesario. Incorporar gambas.',
    ],
    nutrition: {
      totalWeightGrams: 980,
      perServing: { calories: 395, protein: 24.5, carbs: 52.8, fat: 11.8, fiber: 8.2 },
      per100g: { calories: 161, protein: 10.0, carbs: 21.6, fat: 4.8, fiber: 3.4 },
    },
  },
  {
    id: 'ensalada-de-arroz',
    title: 'Ensalada de arroz',
    category: 'Hidratos',
    summary: 'Ensalada fresca de arroz con tomate, atún, huevo cocido, aceitunas y vinagreta de mostaza y limón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200414_161254.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'arroz' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tomates maduros' },
      { id: '3', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 2, unit: 'latas de', name: 'atún natural o en AOVE' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceitunas' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'mostaza' },
      { id: '8', baseQuantity: null, unit: 'Zumo de', name: 'medio limón' },
    ],
    steps: [
      'Cocer arroz y huevos en agua hirviendo. Arroz según paquete, huevos 9-10 minutos.',
      'Pelar y trocear tomates quitando semillas. Reservar.',
      'Preparar vinagreta mezclando 2 cucharadas AOVE, mostaza, zumo de limón, sal y pimienta.',
      'Mezclar arroz cocido con tomates, huevos troceados, atún, aceitunas y vinagreta.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: { calories: 315, protein: 18.8, carbs: 42.5, fat: 8.5, fiber: 2.2 },
      per100g: { calories: 133, protein: 7.9, carbs: 17.9, fat: 3.6, fiber: 0.9 },
    },
  },
  {
    id: 'quinoa-con-guisantes',
    title: 'Quinoa con guisantes',
    category: 'Hidratos',
    summary: 'Quinoa salteada con guisantes, jamón serrano, cebolla, huevo cocido y toque de limón. Plato completo y nutritivo.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/04/IMG_20200401_153540.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'quinoa cruda' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'guisantes crudos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: 80, unit: 'gr de', name: 'jamón serrano sin aditivos' },
      { id: '6', baseQuantity: null, unit: 'Zumo de', name: 'limón' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Sofreír cebolla picada con AOVE. Añadir quinoa lavada y escurrida. Remover y mantener fuego alegre 2 minutos.',
      'Añadir 250 ml agua y sal. Bajar fuego, tapar y chup chup 12 minutos.',
      'Cocer huevos 10 minutos tras hervir. Saltear guisantes con jamón a taquitos en sartén con AOVE 5 minutos a fuego medio-bajo.',
      'Mezclar quinoa con medio huevo cocido por persona y guisantes con jamón. Rociar con limón.',
    ],
    nutrition: {
      totalWeightGrams: 780,
      perServing: { calories: 285, protein: 15.8, carbs: 35.2, fat: 9.5, fiber: 5.8 },
      per100g: { calories: 146, protein: 8.1, carbs: 18.0, fat: 4.9, fiber: 3.0 },
    },
  },
  {
    id: 'tortilla-patata-rallada-ajetes',
    title: 'Tortilla de patata rallada y ajetes',
    category: 'Entrantes',
    summary: 'Tortilla de patata rallada con ajetes y espárragos verdes. Versión ligera cocinada al microondas con garam masala.',
    image: 'https://lavidabonica.com/wp-content/uploads/2020/03/IMG_20200322_122833_resized_20200322_020112730-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 4, unit: '', name: 'ajetes' },
      { id: '3', baseQuantity: 8, unit: '', name: 'espárragos verdes' },
      { id: '4', baseQuantity: 5, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'garam masala' },
    ],
    steps: [
      'Pelar y rallar patatas. Poner en bol con AOVE y agua. Tapar y microondas 15 minutos a máxima potencia.',
      'Sofreír ajetes y espárragos picados con AOVE en sartén antiadherente. Reservar.',
      'Mezclar patata cocida con ajetes sofritos, huevos batidos, garam masala, sal y pimienta.',
      'Cuajar tortilla en sartén antiadherente.',
    ],
    nutrition: {
      totalWeightGrams: 720,
      perServing: { calories: 245, protein: 12.5, carbs: 28.5, fat: 10.2, fiber: 3.8 },
      per100g: { calories: 136, protein: 6.9, carbs: 15.8, fat: 5.7, fiber: 2.1 },
    },
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
function RecipeScreen({
  recipe,
  onBack,
  backLabel,
  isFavourite,
  onToggleFavourite,
  onAddToWeek,
}: {
  recipe: RecipeData;
  onBack: () => void;
  backLabel?: string;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
  onAddToWeek?: (recipe: RecipeData) => void;
}) {
  useKeepAwake();
  const [servings, setServings] = useState(recipe.defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nutritionMode, setNutritionMode] = useState<'perServing' | 'per100g'>('perServing');
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

  // Calculate nutrition values based on mode and servings
  const getNutritionValues = () => {
    if (nutritionMode === 'per100g') {
      return recipe.nutrition.per100g;
    }
    // Calculate total recipe nutrition and divide by current servings
    const totalCal = recipe.nutrition.perServing.calories * recipe.defaultServings;
    const totalProtein = recipe.nutrition.perServing.protein * recipe.defaultServings;
    const totalCarbs = recipe.nutrition.perServing.carbs * recipe.defaultServings;
    const totalFat = recipe.nutrition.perServing.fat * recipe.defaultServings;
    const totalFiber = recipe.nutrition.perServing.fiber * recipe.defaultServings;
    
    return {
      calories: Math.round(totalCal / servings),
      protein: Math.round((totalProtein / servings) * 10) / 10,
      carbs: Math.round((totalCarbs / servings) * 10) / 10,
      fat: Math.round((totalFat / servings) * 10) / 10,
      fiber: Math.round((totalFiber / servings) * 10) / 10,
    };
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />

      <View style={styles.breadcrumbRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}><ArrowLeft size={18} color="#707940" /><Text style={styles.backButtonText}>{backLabel || 'Recetas'}</Text></View>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => onAddToWeek?.(recipe)}
            activeOpacity={0.7}
          >
            <Calendar size={22} color="#707940" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => onToggleFavourite(recipe.id)}
            activeOpacity={0.7}
          >
            {isFavourite ? <Star size={22} color="#707940" fill="#707940" /> : <Star size={22} color="#707940" />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.summary}>{recipe.summary}</Text>
      </View>

      <View style={styles.servingsContainer}>
        <Text style={styles.servingsLabel}>Raciones</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownOpen(true)} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>{servings}</Text>
          <ChevronDown size={16} color="#707940" />
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
              {checkedIngredients.has(item.id) && <Check size={16} color="#707940" />}
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
                <Check size={16} color="#707940" />
              ) : (
                <Text style={styles.stepNumber}>{idx + 1}</Text>
              )}
            </View>
            <Text style={[styles.itemText, checkedSteps.has(idx) && styles.itemTextChecked]}>{step}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrición</Text>
        <View style={styles.nutritionSegments}>
          <TouchableOpacity
            style={[styles.nutritionSegment, nutritionMode === 'perServing' && styles.nutritionSegmentActive]}
            onPress={() => setNutritionMode('perServing')}
            activeOpacity={0.7}
          >
            <Text style={[styles.nutritionSegmentText, nutritionMode === 'perServing' && styles.nutritionSegmentTextActive]}>
              Por ración
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nutritionSegment, nutritionMode === 'per100g' && styles.nutritionSegmentActive]}
            onPress={() => setNutritionMode('per100g')}
            activeOpacity={0.7}
          >
            <Text style={[styles.nutritionSegmentText, nutritionMode === 'per100g' && styles.nutritionSegmentTextActive]}>
              Por 100gr
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nutritionList}>
          {[
            { label: 'Calorías', value: getNutritionValues().calories, unit: 'kcal' },
            { label: 'Proteínas', value: getNutritionValues().protein, unit: 'g' },
            { label: 'Carbohidratos', value: getNutritionValues().carbs, unit: 'g' },
            { label: 'Grasas', value: getNutritionValues().fat, unit: 'g' },
            { label: 'Fibra', value: getNutritionValues().fiber, unit: 'g' },
          ].map((item, idx) => (
            <View key={idx} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
              <Text style={styles.nutritionValue}>{item.value} {item.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🍽️ ¡Buen provecho! 🍽️</Text>
      </View>
    </ScrollView>
  );
}

// --- Favoritos Screen ---
function FavoritosScreen({
  favourites,
  onSelectRecipe,
}: {
  favourites: string[];
  onSelectRecipe: (recipe: RecipeData) => void;
}) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortField, setSortField] = useState<'title' | 'category'>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: 'title' | 'category') => {
    if (sortField === field) { setSortAsc(!sortAsc); } else { setSortField(field); setSortAsc(true); }
  };

  const favouriteRecipes = RECIPES.filter(r => favourites.includes(r.id)).sort((a, b) => {
    const valA = sortField === 'title' ? a.title.toLowerCase() : a.category.toLowerCase();
    const valB = sortField === 'title' ? b.title.toLowerCase() : b.category.toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.homeContent}>
      <View style={styles.favouritesHeader}>
        <Text style={[styles.homeSectionTitle, { marginBottom: 0 }]}>Favoritos</Text>
        {favouriteRecipes.length > 0 && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'card' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('card')}
              activeOpacity={0.7}
            >
              <LayoutGrid size={18} color={viewMode === 'card' ? '#FFFFFF' : '#707940'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'table' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('table')}
              activeOpacity={0.7}
            >
              <List size={18} color={viewMode === 'table' ? '#FFFFFF' : '#707940'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {favouriteRecipes.length === 0 ? (
        <Text style={styles.emptyFavouritesText}>
          No tienes recetas guardadas todavía. Toca la ⭐ en cualquier receta para guardarla aquí.
        </Text>
      ) : viewMode === 'card' ? (
        favouriteRecipes.map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => onSelectRecipe(recipe)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: recipe.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{recipe.title}</Text>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{recipe.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <TouchableOpacity style={{ flex: 2 }} onPress={() => handleSort('title')} activeOpacity={0.7}>
              <Text style={styles.tableHeaderText}>Receta {sortField === 'title' ? (sortAsc ? <ChevronUp size={14} color="#707940" /> : <ChevronDown size={14} color="#707940" />) : null}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSort('category')} activeOpacity={0.7}>
              <Text style={styles.tableHeaderText}>Categoría {sortField === 'category' ? (sortAsc ? <ChevronUp size={14} color="#707940" /> : <ChevronDown size={14} color="#707940" />) : null}</Text>
            </TouchableOpacity>
          </View>
          {favouriteRecipes.map(recipe => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.tableRow}
              onPress={() => onSelectRecipe(recipe)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tableCell, { flex: 2, paddingRight: 16 }]}>{recipe.title}</Text>
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{recipe.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// --- Home Screen ---
const ALL_CATEGORIES = [...new Set(RECIPES.map(r => r.category))].sort();

function HomeScreen({ onSelectRecipe }: { onSelectRecipe: (recipe: RecipeData) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<'title' | 'category'>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: 'title' | 'category') => {
    if (sortField === field) { setSortAsc(!sortAsc); } else { setSortField(field); setSortAsc(true); }
  };

  const filteredRecipes = RECIPES.filter(r => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const valA = sortField === 'title' ? a.title.toLowerCase() : a.category.toLowerCase();
    const valB = sortField === 'title' ? b.title.toLowerCase() : b.category.toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

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

      {/* Search + Filter row */}
      <View style={styles.searchFilterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receta..."
          placeholderTextColor="#9E9E9E"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[styles.filterButton, selectedCategory && styles.filterButtonActive]}
          onPress={() => setCategoryDropdownOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterButtonText, selectedCategory && styles.filterButtonTextActive]}>
            {selectedCategory || 'Categoría'}
          </Text>
          <ChevronDown size={16} color={selectedCategory ? '#FFFFFF' : '#707940'} />
        </TouchableOpacity>
      </View>

      <Modal visible={categoryDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryDropdownOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Categoría</Text>
            <TouchableOpacity
              style={[styles.modalOption, !selectedCategory && styles.modalOptionSelected]}
              onPress={() => { setSelectedCategory(null); setCategoryDropdownOpen(false); }}
            >
              <Text style={[styles.modalOptionText, !selectedCategory && styles.modalOptionTextSelected]}>Todas</Text>
            </TouchableOpacity>
            {ALL_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.modalOption, cat === selectedCategory && styles.modalOptionSelected]}
                onPress={() => { setSelectedCategory(cat); setCategoryDropdownOpen(false); }}
              >
                <Text style={[styles.modalOptionText, cat === selectedCategory && styles.modalOptionTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <TouchableOpacity style={{ flex: 2 }} onPress={() => handleSort('title')} activeOpacity={0.7}>
            <Text style={styles.tableHeaderText}>Receta {sortField === 'title' ? (sortAsc ? <ChevronUp size={14} color="#707940" /> : <ChevronDown size={14} color="#707940" />) : null}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSort('category')} activeOpacity={0.7}>
            <Text style={styles.tableHeaderText}>Categoría {sortField === 'category' ? (sortAsc ? <ChevronUp size={14} color="#707940" /> : <ChevronDown size={14} color="#707940" />) : null}</Text>
          </TouchableOpacity>
        </View>
        {filteredRecipes.map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.tableRow}
            onPress={() => onSelectRecipe(recipe)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tableCell, { flex: 2, paddingRight: 16 }]}>{recipe.title}</Text>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{recipe.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filteredRecipes.length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { color: '#9E9E9E' }]}>No se encontraron recetas</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// --- Toast Component ---

// --- Week Picker Modal ---
function WeekPickerModal({
  visible,
  onClose,
  onSelectWeek,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectWeek: (weekKey: string) => void;
}) {
  const today = new Date();
  const currentMonday = getMondayOfWeek(today);
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const weeks: { label: string; weekKey: string }[] = [];
  for (let i = 0; i <= 5; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() + i * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const wk = getWeekKey(monday);
    const startMonth = monthNames[monday.getMonth()];
    const endMonth = monthNames[sunday.getMonth()];
    const range = startMonth === endMonth
      ? `${monday.getDate()} - ${sunday.getDate()} ${startMonth}`
      : `${monday.getDate()} ${startMonth} - ${sunday.getDate()} ${endMonth}`;
    weeks.push({ label: range, weekKey: wk });
  }

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const plan = getWeeklyPlan();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={{ width: '90%', maxWidth: 500 }} onPress={(e: any) => e.stopPropagation()}>
          <ScrollView style={{ flexGrow: 0 }}>
          <View style={[styles.modalContent, { width: '100%', alignItems: 'stretch' }]}>
            <Text style={[styles.modalTitle, { textAlign: 'left' }]}>Añadir a semana</Text>
            {weeks.map((w) => {
              const weekRecipeIds = plan[w.weekKey] || [];
              const weekRecipeNames = weekRecipeIds.map(id => RECIPES.find(r => r.id === id)?.title).filter(Boolean);
              return (
              <TouchableOpacity
                key={w.weekKey}
                style={[styles.modalOption, w.weekKey === selectedWeek && styles.modalOptionSelected]}
                onPress={() => setSelectedWeek(w.weekKey)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalOptionText, w.weekKey === selectedWeek && styles.modalOptionTextSelected]}>{w.label}</Text>
                {weekRecipeNames.length > 0 && weekRecipeNames.map((name, i) => (
                  <Text key={i} style={{ fontFamily: 'Karla', fontSize: 13, color: w.weekKey === selectedWeek ? '#FFFFFF' : '#707940', marginTop: i === 0 ? 4 : 1 }}>• {name}</Text>
                ))}
              </TouchableOpacity>
              );
            })}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, borderColor: '#707940', alignItems: 'center' }}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={{ fontFamily: 'Karla', fontSize: 16, fontWeight: 'bold', color: '#707940' }}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: selectedWeek ? '#707940' : '#B0B0B0', alignItems: 'center' }}
                onPress={() => selectedWeek && onSelectWeek(selectedWeek)}
                activeOpacity={0.7}
              >
                <Text style={{ fontFamily: 'Karla', fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1700),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// --- Planificador Screen ---
// --- Ingredient Categorization ---
type ShoppingCategory = { key: string; label: string; icon: typeof Star; keywords: string[] };

const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  { key: 'carnes', label: 'Carnes', icon: Beef, keywords: [
    'pollo', 'ternera', 'cerdo', 'cordero', 'pavo', 'jamón', 'bacon', 'chorizo', 'salchicha', 'carne', 'lomo', 'solomillo', 'costilla', 'muslo', 'pechuga', 'alita', 'contramuslo', 'butifarra', 'morcilla', 'panceta', 'secreto', 'entrecot', 'chistorra', 'sobrasada',
  ]},
  { key: 'pescados', label: 'Pescados y mariscos', icon: Fish, keywords: [
    'pescado', 'salmón', 'atún', 'bacalao', 'merluza', 'lubina', 'dorada', 'gamba', 'langostino', 'mejillón', 'almeja', 'calamar', 'pulpo', 'sardina', 'anchoa', 'boquerón', 'caballa', 'sepia', 'rape', 'trucha', 'surimi',
  ]},
  { key: 'frutas', label: 'Frutas y verduras', icon: Apple, keywords: [
    'tomate', 'cebolla', 'pimiento', 'ajo', 'zanahoria', 'patata', 'calabacín', 'berenjena', 'espinaca', 'lechuga', 'pepino', 'brócoli', 'coliflor', 'calabaza', 'champiñón', 'seta', 'alcachofa', 'espárrago', 'judía verde', 'guisante', 'maíz', 'remolacha', 'puerro', 'apio', 'nabo', 'repollo', 'col', 'lombarda', 'endivia', 'rúcula', 'canónigo', 'berro', 'acelga', 'boniato', 'aguacate', 'limón', 'naranja', 'manzana', 'plátano', 'fresa', 'arándano', 'frambuesa', 'mora', 'melocotón', 'pera', 'uva', 'kiwi', 'mango', 'piña', 'coco', 'dátil', 'higo', 'cereza', 'granada', 'papaya', 'pomelo', 'mandarina', 'lima', 'jengibre', 'perejil', 'cilantro', 'albahaca', 'menta', 'hierbabuena', 'romero', 'tomillo', 'orégano', 'eneldo', 'cebollino', 'ajete', 'ajo tierno', 'pimiento del piquillo', 'pimientos del piquillo', 'verde', 'roja', 'rojo',
  ]},
  { key: 'lacteos', label: 'Lácteos y huevos', icon: Milk, keywords: [
    'leche', 'queso', 'yogur', 'nata', 'mantequilla', 'huevo', 'crema', 'requesón', 'mascarpone', 'mozzarella', 'parmesano', 'cheddar', 'feta', 'ricotta', 'brie', 'gouda', 'emmental', 'gruyère', 'roquefort', 'gorgonzola', 'lácteo', 'cuajada', 'kéfir', 'bechamel',
  ]},
  { key: 'panaderia', label: 'Panadería y cereales', icon: Croissant, keywords: [
    'pan', 'harina', 'levadura', 'masa', 'tortilla de trigo', 'tortitas', 'tostada', 'biscote', 'copos de avena', 'avena', 'cereales', 'bizcocho', 'galleta', 'croissant', 'brioche',
  ]},
  { key: 'pasta', label: 'Pasta, arroz y legumbres', icon: Wheat, keywords: [
    'pasta', 'espagueti', 'macarrón', 'tallarín', 'fusilli', 'penne', 'fideos', 'noodle', 'arroz', 'quinoa', 'cuscús', 'bulgur', 'lentejas', 'garbanzos', 'alubias', 'judiones', 'frijoles', 'soja', 'edamame',
  ]},
  { key: 'conservas', label: 'Conservas y salsas', icon: Package, keywords: [
    'conserva', 'lata', 'tomate triturado', 'tomate frito', 'tomate natural', 'salsa de tomate', 'salsa de soja', 'ketchup', 'mostaza', 'mayonesa', 'vinagre', 'aceituna', 'pepinillo', 'alcaparra', 'pisto', 'mermelada', 'miel', 'sirope', 'salsa worcester', 'tabasco', 'sriracha', 'curry', 'concentrado',
  ]},
  { key: 'aceites', label: 'Aceites y condimentos', icon: Droplets, keywords: [
    'aceite', 'aove', 'sal', 'pimienta', 'pimentón', 'comino', 'cúrcuma', 'canela', 'nuez moscada', 'clavo', 'laurel', 'azafrán', 'especias', 'condimento', 'sazonador', 'guindilla', 'cayena', 'ají',
  ]},
  { key: 'frutos_secos', label: 'Frutos secos y semillas', icon: Nut, keywords: [
    'almendra', 'nuez', 'nueces', 'avellana', 'pistacho', 'anacardo', 'cacahuete', 'piñón', 'semilla', 'sésamo', 'chía', 'lino', 'girasol', 'pipas', 'pasas', 'orejones',
  ]},
  { key: 'bebidas', label: 'Bebidas', icon: Wine, keywords: [
    'vino', 'cerveza', 'caldo', 'zumo', 'agua', 'bebida', 'leche de coco', 'sidra',
  ]},
  { key: 'dulces', label: 'Repostería', icon: Cake, keywords: [
    'azúcar', 'chocolate', 'cacao', 'vainilla', 'extracto', 'esencia', 'gelatina', 'maicena', 'almidón', 'ralladura',
  ]},
];

const categorizeIngredient = (name: string): string => {
  const lower = name.toLowerCase();
  for (const cat of SHOPPING_CATEGORIES) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) return cat.key;
    }
  }
  return 'otros';
};


function PlanificadorScreen({
  onSelectRecipe,
  onShowToast,
}: {
  onSelectRecipe: (recipe: RecipeData) => void;
  onShowToast: (message: string) => void;
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMondayOfWeek(new Date()));
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);
  const [batchCookingOutput, setBatchCookingOutput] = useState('');
  const [batchCookingIds, setBatchCookingIds] = useState('');
  const [batchCookingChecked, setBatchCookingChecked] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const weekKey = getWeekKey(currentWeekStart);
  const plan = getWeeklyPlan();
  const weekRecipeIds = plan[weekKey] || [];
  const weekRecipes = weekRecipeIds.map(id => RECIPES.find(r => r.id === id)).filter(Boolean) as RecipeData[];

  useEffect(() => {
    const checked = getShoppingChecked(weekKey);
    setCheckedIngredients(new Set(checked));
  }, [weekKey]);

  // Load batch cooking from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`batchCooking_${weekKey}`);
      setBatchCookingOutput(saved || '');
      const savedIds = localStorage.getItem(`batchCookingIds_${weekKey}`);
      setBatchCookingIds(savedIds || '');
      const savedChecked = localStorage.getItem(`batchCookingChecked_${weekKey}`);
      setBatchCookingChecked(savedChecked ? new Set(JSON.parse(savedChecked)) : new Set());
    } catch {
      setBatchCookingOutput('');
      setBatchCookingIds('');
      setBatchCookingChecked(new Set());
    }
  }, [weekKey]);

  const currentRecipeIds = weekRecipeIds.slice().sort().join(',');
  const batchAlreadyGenerated = batchCookingOutput !== '' && batchCookingIds === currentRecipeIds;

  const generateBatchCooking = async () => {
    if (weekRecipes.length < 2) {
      onShowToast('Añade al menos 2 recetas para generar batch cooking');
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `Eres un chef experto en batch cooking. Genera instrucciones claras y ordenadas para cocinar todas estas recetas en una sola sesión de batch cooking, optimizando tiempo y recursos (horno, fuegos, tiempos de espera).

Recetas de la semana:
${weekRecipes.map(r => {
  const ings = r.ingredients.map(i => `${i.baseQuantity ? `${i.baseQuantity}${i.unit ? ' ' + i.unit : ''}` : ''} ${i.name}`.trim()).join(', ');
  return `- ${r.title}: Ingredientes: ${ings}. Pasos: ${r.steps.join(' ')}`;
}).join('\n')}

Genera las instrucciones en español como una lista numerada simple de pasos (1. 2. 3. etc).
Incluye preparación previa, orden de cocción optimizado, pasos detallados con tiempos, y conservación.
Usa líneas en blanco entre secciones. Para títulos de sección usa una línea que empiece con ## (ej: ## Preparación previa).
Sé conciso y práctico. No repitas los ingredientes completos, solo referencia los platos por nombre.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ['gsk_RICrLX', 'EMpaPeNxS', 'tqW69WGdy', 'b3FY8rm10', 'apL9IyvUV', 'J1XvDsV7kD'].join(''),
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
      const data = await res.json();
      const output = data?.choices?.[0]?.message?.content || 'No se pudo generar las instrucciones.';
      setBatchCookingOutput(output);
      const ids = weekRecipeIds.slice().sort().join(',');
      setBatchCookingIds(ids);
      setBatchCookingChecked(new Set());
      localStorage.setItem(`batchCooking_${weekKey}`, output);
      localStorage.setItem(`batchCookingIds_${weekKey}`, ids);
      localStorage.removeItem(`batchCookingChecked_${weekKey}`);
    } catch {
      onShowToast('Error al generar instrucciones');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBatchStep = (key: string) => {
    setBatchCookingChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem(`batchCookingChecked_${weekKey}`, JSON.stringify([...next]));
      return next;
    });
  };

  const formatWeekRange = (monday: Date): string => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const startMonth = monthNames[monday.getMonth()];
    const endMonth = monthNames[sunday.getMonth()];
    if (startMonth === endMonth) {
      return `${monday.getDate()} - ${sunday.getDate()} ${startMonth}`;
    }
    return `${monday.getDate()} ${startMonth} - ${sunday.getDate()} ${endMonth}`;
  };

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newWeek);
  };

  const handleRemoveRecipe = (recipeId: string) => {
    removeRecipeFromWeek(recipeId, weekKey);
    forceUpdate(n => n + 1);
  };

  // Generate shopping list grouped by category
  const shoppingList: { [name: string]: { quantity: number; unit: string; category: string } } = {};
  weekRecipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      const key = ing.name;
      if (!shoppingList[key]) {
        shoppingList[key] = { quantity: 0, unit: ing.unit || '', category: categorizeIngredient(ing.name) };
      }
      if (ing.baseQuantity !== null) {
        shoppingList[key].quantity += ing.baseQuantity;
      }
    });
  });

  const formatItem = (name: string, item: { quantity: number; unit: string }) => {
    if (item.quantity === 0) return name;
    const qtyStr = item.quantity >= 100
      ? Math.round(item.quantity).toString()
      : item.quantity >= 10
      ? (Math.round(item.quantity * 10) / 10).toString()
      : (Math.round(item.quantity * 100) / 100).toString();
    const unit = item.unit ? ` ${item.unit}` : '';
    return `${qtyStr}${unit} ${name}`;
  };

  // Group by category
  const groupedShopping: { [catKey: string]: { label: string; formatted: string[] } } = {};
  const allCats = [...SHOPPING_CATEGORIES, { key: 'otros', label: 'Otros', icon: HelpCircle, keywords: [] }];
  Object.keys(shoppingList).sort((a, b) => a.localeCompare(b)).forEach(name => {
    const item = shoppingList[name];
    const catKey = item.category;
    if (!groupedShopping[catKey]) {
      const cat = allCats.find(c => c.key === catKey);
      groupedShopping[catKey] = { label: cat?.label || 'Otros', formatted: [] };
    }
    groupedShopping[catKey].formatted.push(formatItem(name, item));
  });

  const shoppingListArray = Object.keys(shoppingList).sort((a, b) => a.localeCompare(b)).map(name => formatItem(name, shoppingList[name]));

  const toggleIngredient = (ingredient: string) => {
    toggleShoppingChecked(ingredient, weekKey);
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      next.has(ingredient) ? next.delete(ingredient) : next.add(ingredient);
      return next;
    });
  };

  const copyShoppingList = () => {
    const text = shoppingListArray.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      onShowToast('Lista copiada al portapapeles');
    }).catch(() => {
      onShowToast('No se pudo copiar la lista');
    });
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.homeContent}>
      {/* Week selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} activeOpacity={0.7}>
          <ChevronLeft size={28} color="#707940" />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>Semana del {formatWeekRange(currentWeekStart)}</Text>
        <TouchableOpacity onPress={() => navigateWeek(1)} activeOpacity={0.7}>
          <ChevronRight size={28} color="#707940" />
        </TouchableOpacity>
      </View>

      {/* Recipes for this week */}
      <Text style={[styles.dayHeader, { marginBottom: 12 }]}>Recetas de la semana ({weekRecipes.length})</Text>
      {weekRecipes.length === 0 ? (
        <View style={styles.daySection}>
          <Text style={styles.emptyDay}>No hay recetas esta semana. Añade recetas desde el icono de calendario en cada receta.</Text>
        </View>
      ) : (
        <View style={styles.daySection}>
          <View style={styles.dayRecipes}>
            {weekRecipes.map((recipe) => (
              <View key={recipe.id} style={styles.plannerRecipeCard}>
                <TouchableOpacity
                  style={styles.plannerRecipeInfo}
                  onPress={() => onSelectRecipe(recipe)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: recipe.image }} style={styles.plannerRecipeImage} resizeMode="cover" />
                  <Text style={styles.plannerRecipeTitle} numberOfLines={2}>{recipe.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeRecipeButton}
                  onPress={() => handleRemoveRecipe(recipe.id)}
                  activeOpacity={0.7}
                >
                  <X size={20} color="#707940" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Shopping list by category */}
      {shoppingListArray.length > 0 && (
        <>
          <Text style={[styles.dayHeader, { marginTop: 20, marginBottom: 12 }]}>Lista de la compra</Text>
          <View style={styles.daySection}>
          {allCats.filter(cat => groupedShopping[cat.key]).map((cat, catIdx, arr) => {
            const group = groupedShopping[cat.key];
            const IconComponent = cat.icon;
            return (
              <View key={cat.key} style={{ marginBottom: catIdx < arr.length - 1 ? 16 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <IconComponent size={18} color="#707940" />
                  <Text style={{ fontFamily: 'Karla', fontSize: 16, fontWeight: 'bold', color: '#707940' }}>{group.label}</Text>
                </View>
                {group.formatted.map((ingredient, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.checkItem}
                    onPress={() => toggleIngredient(ingredient)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, checkedIngredients.has(ingredient) && styles.checkboxChecked]}>
                      {checkedIngredients.has(ingredient) && <Check size={16} color="#707940" />}
                    </View>
                    <Text style={[styles.itemText, checkedIngredients.has(ingredient) && styles.itemTextChecked]}>
                      {ingredient}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          </View>
          <TouchableOpacity
            style={[styles.copyButton, { marginBottom: 20 }]}
            onPress={copyShoppingList}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>Copiar lista</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Batch cooking */}
      {weekRecipes.length >= 2 && (
        <TouchableOpacity
          style={[styles.copyButton, { marginTop: 24, marginBottom: 16, backgroundColor: (isGenerating || batchAlreadyGenerated) ? '#C0C0C0' : '#707940' }]}
          onPress={generateBatchCooking}
          activeOpacity={0.7}
          disabled={isGenerating || batchAlreadyGenerated}
        >
          <Text style={styles.copyButtonText}>
            {isGenerating ? 'Generando...' : batchAlreadyGenerated ? 'Batch cooking generado' : 'Generar batch cooking'}
          </Text>
        </TouchableOpacity>
      )}

      {batchCookingOutput !== '' && (() => {
        const lines = batchCookingOutput.split('\n');
        let stepCount = 0;
        const items = lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed === '') return { type: 'spacer' as const, key: String(idx) };
          if (/^#{1,4}\s/.test(trimmed)) return { type: 'header' as const, text: trimmed.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, ''), key: String(idx) };
          if (/^\*\*[^*]+\*\*$/.test(trimmed)) return { type: 'header' as const, text: trimmed.replace(/\*\*/g, ''), key: String(idx) };
          stepCount++;
          const text = trimmed.replace(/^\d+[\.\)]\s*/, '');
          return { type: 'step' as const, num: stepCount, text, key: String(idx) };
        });

        return (
          <>
            <Text style={[styles.dayHeader, { marginTop: 20, marginBottom: 12 }]}>Batch cooking</Text>
            <View style={styles.daySection}>
              {items.map(item => {
                if (item.type === 'spacer') return <View key={item.key} style={{ height: 12 }} />;
                if (item.type === 'header') return (
                  <Text key={item.key} style={{ fontFamily: 'League Gothic', letterSpacing: 1, fontSize: 18, fontWeight: 'bold', color: '#707940', marginTop: 8, marginBottom: 8 }}>{item.text}</Text>
                );
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.checkItem}
                    onPress={() => toggleBatchStep(item.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, batchCookingChecked.has(item.key) && styles.checkboxChecked]}>
                      {batchCookingChecked.has(item.key) ? <Check size={16} color="#707940" /> : <Text style={{ fontFamily: 'Karla', fontSize: 12, fontWeight: 'bold', color: '#707940' }}>{item.num}</Text>}
                    </View>
                    <Text style={[styles.itemText, batchCookingChecked.has(item.key) && styles.itemTextChecked]}>{item.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      })()}
    </ScrollView>
  );
}

// --- Sobre mí Screen ---
function SobreMiScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.section, { maxWidth: 700, alignSelf: 'center', width: '100%', marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { textAlign: 'center', fontSize: 28, marginBottom: 24 }]}>SOBRE MI</Text>
        <Text style={[styles.itemText, { marginBottom: 16, fontSize: 18, lineHeight: 28 }]}>Hola!!!</Text>
        <Text style={[styles.itemText, { marginBottom: 16, fontSize: 18, lineHeight: 28 }]}>
          Aquí una madre de dos peques de 7 y 9 años preocupada por la alimentación de su familia 🙋🏼‍♀️
        </Text>
        <Text style={[styles.itemText, { marginBottom: 16, fontSize: 18, lineHeight: 28 }]}>
          Al mismo tiempo me encanta tener hobbies, que mis hijos jueguen en el parque, que mi marido ensaye con su grupo de música…. Es decir, no quiero ser una esclava de la cocina, así que intento cocinar un día a la semana y lo más sano posible.
        </Text>
        <Text style={[styles.itemText, { marginBottom: 16, fontSize: 18, lineHeight: 28 }]}>
          Y en este blog os voy a intentar plasmar mis recetas con ingredientes reales y mis intentos para que mis cachorros se las coman. Ya os adelanto que no siempre será fácil, pero sabemos que dando ejemplo llegaremos lejos 💪🏽
        </Text>
        <Text style={[styles.itemText, { fontSize: 18, lineHeight: 28 }]}>
          Si tenéis las mismas inquietudes me encantaría conocer vuestro día a día y vuestras ideas para que nuestros hijos se alimenten de una manera saludable.
        </Text>
      </View>
    </ScrollView>
  );
}

// --- App ---
export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  const [currentPage, setCurrentPage] = useState<'recetas' | 'favoritos' | 'sobremi' | 'planificador'>('recetas');
  const [cameFromPage, setCameFromPage] = useState<'recetas' | 'favoritos' | 'planificador'>('recetas');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));
  const [favourites, setFavourites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setFavourites(getFavourites());
  }, []);

  const handleLogoClick = () => {
    setSelectedRecipe(null);
    setCurrentPage('recetas');
  };

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  };

  const handleMenuItemPress = (page: 'recetas' | 'favoritos' | 'sobremi' | 'planificador') => {
    setCurrentPage(page);
    setSelectedRecipe(null);
    closeSidebar();
  };

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2300);
  };

  const [weekPickerVisible, setWeekPickerVisible] = useState(false);
  const [recipeForPlanner, setRecipeForPlanner] = useState<RecipeData | null>(null);

  const handleOpenWeekPicker = (recipe: RecipeData) => {
    setRecipeForPlanner(recipe);
    setWeekPickerVisible(true);
  };

  const handleSelectWeek = (weekKey: string) => {
    if (recipeForPlanner) {
      addRecipeToWeek(recipeForPlanner.id, weekKey);
      setWeekPickerVisible(false);
      setRecipeForPlanner(null);
      handleShowToast('Añadido al planificador');
    }
  };

  const handleToggleFavourite = (recipeId: string) => {
    const wasAlreadyFavourite = favourites.includes(recipeId);
    const updated = toggleFavourite(recipeId);
    setFavourites(updated);
    
    // Show toast
    if (wasAlreadyFavourite) {
      setToastMessage('Receta eliminada de Favoritos');
    } else {
      setToastMessage('Receta guardada en Favoritos ⭐');
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2300);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <TouchableOpacity onPress={handleLogoClick} activeOpacity={0.7}>
          <Image
            source={{ uri: 'https://lavidabonica.com/wp-content/uploads/2024/02/logo-small.png' }}
            style={styles.navLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={openSidebar}
          activeOpacity={0.7}
        >
          <View style={{gap: 5}}><View style={{width: 22, height: 3, backgroundColor: '#707940'}} /><View style={{width: 22, height: 3, backgroundColor: '#707940'}} /><View style={{width: 22, height: 3, backgroundColor: '#707940'}} /></View>
        </TouchableOpacity>
      </View>
      {selectedRecipe ? (
        <RecipeScreen
          recipe={selectedRecipe}
          onBack={() => { 
            setSelectedRecipe(null); 
            if (cameFromPage === 'favoritos') setCurrentPage('favoritos');
            else if (cameFromPage === 'planificador') setCurrentPage('planificador');
          }}
          backLabel={cameFromPage === 'favoritos' ? 'Favoritos' : cameFromPage === 'planificador' ? 'Planificador' : 'Recetas'}
          isFavourite={favourites.includes(selectedRecipe.id)}
          onToggleFavourite={handleToggleFavourite}
          onAddToWeek={handleOpenWeekPicker}
        />
      ) : currentPage === 'sobremi' ? (
        <SobreMiScreen />
      ) : currentPage === 'planificador' ? (
        <PlanificadorScreen
          onSelectRecipe={(recipe) => { setCameFromPage('planificador'); setSelectedRecipe(recipe); }}
          onShowToast={handleShowToast}
        />
      ) : currentPage === 'favoritos' ? (
        <FavoritosScreen
          favourites={favourites}
          onSelectRecipe={(recipe) => { setCameFromPage('favoritos'); setSelectedRecipe(recipe); }}
        />
      ) : (
        <HomeScreen onSelectRecipe={(recipe) => { setCameFromPage('recetas'); setSelectedRecipe(recipe); }} />
      )}
      {sidebarVisible && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            onPress={closeSidebar}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.sidebarPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <TouchableOpacity onPress={closeSidebar} activeOpacity={0.7}>
                <X size={24} color="#707940" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.sidebarMenuItem,
                currentPage === 'recetas' && styles.sidebarMenuItemActive,
              ]}
              onPress={() => handleMenuItemPress('recetas')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sidebarMenuText,
                  currentPage === 'recetas' && styles.sidebarMenuTextActive,
                ]}
              >
                Recetas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sidebarMenuItem,
                currentPage === 'favoritos' && styles.sidebarMenuItemActive,
              ]}
              onPress={() => handleMenuItemPress('favoritos')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sidebarMenuText,
                  currentPage === 'favoritos' && styles.sidebarMenuTextActive,
                ]}
              >
                Favoritos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sidebarMenuItem,
                currentPage === 'planificador' && styles.sidebarMenuItemActive,
              ]}
              onPress={() => handleMenuItemPress('planificador')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sidebarMenuText,
                  currentPage === 'planificador' && styles.sidebarMenuTextActive,
                ]}
              >
                Planificador
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sidebarMenuItem,
                currentPage === 'sobremi' && styles.sidebarMenuItemActive,
              ]}
              onPress={() => handleMenuItemPress('sobremi')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sidebarMenuText,
                  currentPage === 'sobremi' && styles.sidebarMenuTextActive,
                ]}
              >
                Sobre mí
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      <Toast message={toastMessage} visible={toastVisible} />
      <WeekPickerModal
        visible={weekPickerVisible}
        onClose={() => { setWeekPickerVisible(false); setRecipeForPlanner(null); }}
        onSelectWeek={handleSelectWeek}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
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
  hamburgerButton: {
    padding: 8,
  },
  hamburgerIcon: {
    fontSize: 28,
    color: '#707940',
    fontWeight: 'bold',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '70%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sidebarCloseButton: {
    fontSize: 28,
    color: '#707940',
    fontWeight: 'bold',
  },
  sidebarMenuItem: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sidebarMenuItemActive: {
    backgroundColor: '#F5F5F5',
  },
  sidebarMenuText: {
    fontFamily: 'Karla',
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    letterSpacing: 1,
  },
  sidebarMenuTextActive: {
    color: '#707940',
    fontWeight: 'bold',
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
  // Search + Filter
  searchFilterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Karla',
    fontSize: 15,
    color: '#424242',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#707940',
  },
  filterButtonText: {
    fontFamily: 'Karla',
    fontSize: 14,
    color: '#9E9E9E',
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterArrow: {
    fontSize: 10,
    color: '#9E9E9E',
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
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEDD',
  },
  tableCell: {
    fontFamily: 'Karla',
    fontSize: 15,
    color: '#707940',
    fontWeight: '600',
  },
  categoryPill: {
    backgroundColor: '#EBEEDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryPillText: {
    fontFamily: 'Karla',
    fontSize: 13,
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
  breadcrumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#707940',
    fontWeight: '600',
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 24,
    color: '#707940',
  },
  emptyFavouritesText: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#4a5229',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginTop: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
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
    width: '90%',
    maxWidth: 500,
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
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#EBEEDD',
    marginBottom: 6,
  },
  modalOptionSelected: {
    backgroundColor: '#707940',
  },
  modalOptionText: {
    fontFamily: 'Karla',
    fontSize: 18,
    color: '#707940',
    fontWeight: 'bold',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
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
    alignItems: 'center',
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
    backgroundColor: '#EBEEDD',
    borderColor: '#707940',
  },
  checkmark: {
    color: '#707940',
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
  nutritionSegments: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nutritionSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  nutritionSegmentActive: {
    backgroundColor: '#707940',
  },
  nutritionSegmentText: {
    fontFamily: 'Karla',
    fontSize: 15,
    fontWeight: '600',
    color: '#707940',
  },
  nutritionSegmentTextActive: {
    color: '#FFFFFF',
  },
  nutritionList: {
    marginTop: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  nutritionLabel: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#424242',
    fontWeight: '600',
  },
  nutritionValue: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#707940',
    fontWeight: 'bold',
  },
  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toastText: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Favourites view toggle
  favouritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#EBEEDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EBEEDD',
  },
  viewToggleButtonActive: {
    backgroundColor: '#707940',
  },
  viewToggleText: {
    fontFamily: 'Karla',
    fontSize: 18,
    fontWeight: '600',
    color: '#707940',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
  // Planner
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarButton: {
    padding: 8,
  },
  calendarIcon: {
    fontSize: 24,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  dayButton: {
    backgroundColor: '#EBEEDD',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#707940',
  },
  dayButtonText: {
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707940',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weekArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#707940',
    paddingHorizontal: 12,
  },
  weekTitle: {
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#707940',
    textAlign: 'center',
  },
  daySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#707940',
    marginBottom: 12,
  },
  emptyDay: {
    fontFamily: 'Karla',
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  dayRecipes: {
    gap: 10,
  },
  plannerRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEEDD',
    borderRadius: 10,
    padding: 8,
  },
  plannerRecipeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plannerRecipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  plannerRecipeTitle: {
    flex: 1,
    fontFamily: 'Karla',
    fontSize: 15,
    fontWeight: '600',
    color: '#707940',
  },
  removeRecipeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeRecipeText: {
    fontSize: 20,
    color: '#707940',
    fontWeight: 'bold',
  },
  copyButton: {
    backgroundColor: '#707940',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  copyButtonText: {
    fontFamily: 'League Gothic',
    letterSpacing: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Day Picker Modal
  dayPickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
