import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput, Animated } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Star, Menu, X, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, ShoppingCart, ShoppingBasket, Trash2, Beef, Fish, Apple, Milk, Croissant, Wheat, Package, Droplets, Nut, Wine, Cake, LayoutGrid, List } from 'lucide-react';

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
  } | null;
}

// --- Recipe Data ---
const RECIPES: RecipeData[] = [
  {
    id: 'costillas-cerdo-horno',
    title: 'Costillas de cerdo al horno',
    category: 'Carne',
    summary: 'Costillas de cerdo al horno en papillote. Se tarda poco en preparar, el horno hace el trabajo, y le gustan a pequeños y mayores.',
    image: 'images/2022_07_COSTILLAS.jpg',
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
    image: 'images/2019_06_IMG_20190610_124831-1-1024x641.jpg',
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
    image: 'images/2020_06_IMG_20200620_180549-1.jpg',
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
    image: 'images/2021_01_carne.jpg',
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
    image: 'images/2020_06_IMG_20200626_173609-1.jpg',
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
    image: 'images/2020_06_IMG_20200620_175732-1.jpg',
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
    image: 'images/2020_06_IMG_20200606_210922.jpg',
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
    image: 'images/2022_02_IMG_20220202_195353-997x1024.jpg',
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
    image: 'images/2020_06_IMG_20200607_173009.jpg',
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
    image: 'images/2020_06_IMG_20200622_230140.jpg',
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
    image: 'images/2020_04_IMG_20200416_154326.jpg',
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
    image: 'images/2020_05_IMG_20200511_165903_resized_20200511_050951800.jpg',
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
    image: 'images/2022_01_IMG_20220118_220520-973x1024.jpg',
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
    image: 'images/2020_06_IMG_20200620_175655.jpg',
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
    image: 'images/2020_06_IMG_20200531_224414.jpg',
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
    image: 'images/2020_06_IMG_20200531_224002.jpg',
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
    image: 'images/2020_05_IMG_20200528_224544-1024x859.jpg',
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
    image: 'images/2020_05_IMG_20200504_153452.jpg',
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
    image: 'images/2020_06_IMG_20200620_180515-1.jpg',
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
    image: 'images/2020_05_IMG_20200523_212919_resized_20200524_111230700.jpg',
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
    image: 'images/2020_05_IMG_20200513_154155.jpg',
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
    image: 'images/2020_03_IMG_20200319_181147.jpg',
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
    image: 'images/2020_01_IMG_20200129_160045.jpg',
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
    image: 'images/2021_01_guiso-marisco.jpg',
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
    image: 'images/2020_06_IMG_20200614_153820-1.jpg',
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
    image: 'images/2022_10_donuts2.jpg',
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
    image: 'images/2020_06_IMG_20200615_160752.jpg',
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
    image: 'images/2020_06_IMG_20200622_161107.jpg',
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
    image: 'images/2020_06_IMG_20200616_115823.jpg',
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
    image: 'images/2020_05_IMG_20200505_154922.jpg',
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
    image: 'images/2020_04_IMG_20200420_154755.jpg',
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
    image: 'images/2020_03_IMG_20200330_171407.jpg',
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
    image: 'images/2020_06_IMG_20200606_211055-1.jpg',
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
    image: 'images/2020_06_IMG_20200605_174651.jpg',
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
    image: 'images/2020_06_IMG_20200531_224826_resized_20200531_105044606.jpg',
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
    image: 'images/2020_05_IMG_20200527_170305.jpg',
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
    image: 'images/2020_05_IMG_20200525_223851.jpg',
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
    image: 'images/2020_05_IMG_20200514_191936.jpg',
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
    image: 'images/2020_05_IMG_20200513_154321.jpg',
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
    image: 'images/2020_05_IMG_20200512_165804.jpg',
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
    image: 'images/2020_05_IMG_20200507_154622.jpg',
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
    image: 'images/2020_05_IMG_20200506_154659.jpg',
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
    image: 'images/2020_05_IMG_20200519_211335.jpg',
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
    image: 'images/2020_04_IMG_20200415_154030.jpg',
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
    image: 'images/2020_04_IMG_20200407_162738.jpg',
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
    image: 'images/2020_03_IMG_20200317_161444.jpg',
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
    image: 'images/2020_02_IMG_20200206_201342.jpg',
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
    image: 'images/2020_01_IMG_20200118_171221-1.jpg',
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
    image: 'images/2020_01_IMG_20200111_170718-1.jpg',
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
    image: 'images/2020_01_IMG_20200111_155814-1.jpg',
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
    image: 'images/2022_03_IMG_20220329_141944.jpg',
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
    image: 'images/2020_05_IMG_20200519_211628.jpg',
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
    image: 'images/2020_05_IMG_20200511_165903_resized_20200511_050951800.jpg',
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
    image: 'images/2020_05_IMG_20200519_211628.jpg',
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
    image: 'images/2020_03_IMG_20200319_181147.jpg',
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
    image: 'images/2020_06_IMG_20200606_210922.jpg',
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
    image: 'images/2020_06_IMG_20200620_175655.jpg',
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
    image: 'images/2020_06_IMG_20200531_224414.jpg',
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
    image: 'images/2020_05_IMG_20200528_224544-1024x859.jpg',
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
    image: 'images/2020_03_IMG_20200319_181147.jpg',
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
    image: 'images/2020_06_IMG_20200620_180549-1.jpg',
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
    image: 'images/2020_06_IMG_20200615_160752.jpg',
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
    image: 'images/2022_02_IMG_20220202_195353-997x1024.jpg',
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
    image: 'images/2022_02_IMG_20220202_195353-997x1024.jpg',
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
    image: 'images/2022_10_donuts2.jpg',
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
    image: 'images/2020_06_IMG_20200615_160752.jpg',
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
    image: 'images/2020_06_IMG_20200607_173009.jpg',
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
    image: 'images/2020_06_IMG_20200607_173009.jpg',
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
    image: 'images/2022_02_IMG_20220202_195353-997x1024.jpg',
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
    image: 'images/2022_10_donuts2.jpg',
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
    image: 'images/2022_10_donuts2.jpg',
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
    image: 'images/2020_06_IMG_20200607_173009.jpg',
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
    image: 'images/2019_11_IMG_20191116_191657-scaled.jpg',
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
    image: 'images/2019_11_IMG_20191110_193800.jpg',
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
    image: 'images/2019_11_IMG_20191105_160723.jpg',
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
    image: 'images/2019_10_IMG_20191027_144031_resized_20191027_025201516.jpg',
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
    image: 'images/2019_10_IMG_20191020_110534.jpg',
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
    image: 'images/2020_06_IMG_20200615_160653.jpg',
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
    image: 'images/2020_06_IMG_20200531_224631.jpg',
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
    image: 'images/2020_06_IMG_20200601_152437.jpg',
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
    image: 'images/2020_05_IMG_20200521_165857-1.jpg',
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
    image: 'images/2020_05_IMG_20200518_171053.jpg',
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
    image: 'images/2020_05_IMG_20200509_214309-1.jpg',
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
    image: 'images/2020_05_IMG_20200512_170217.jpg',
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
    image: 'images/2020_05_IMG_20200506_211643.jpg',
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
    image: 'images/2020_04_IMG_20200422_154336.jpg',
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
    image: 'images/2020_04_IMG_20200416_213039.jpg',
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
    image: 'images/2020_04_IMG_20200413_155358.jpg',
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
    image: 'images/2020_04_IMG_20200405_154849-1-1-1024x526.jpg',
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
    image: 'images/2020_03_IMG_20200331_144746.jpg',
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
    image: 'images/2020_03_IMG_20200331_141240.jpg',
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
    image: 'images/2020_03_IMG_20200330_171010.jpg',
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
    image: 'images/2020_03_IMG_20200302_211531.jpg',
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
    image: 'images/2020_02_IMG_20200225_195231.jpg',
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
    image: 'images/2020_01_IMG_20200127_153719.jpg',
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
    image: 'images/2019_10_IMG_20191029_154804.jpg',
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
    image: 'images/2019_05_IMG_20190518_214303_resized_20190518_095217588.jpg',
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
    image: 'images/2019_05_IMG_20190513_154245.jpg',
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
    image: 'images/2018_12_img_20181216_201226765455136581871901.jpg',
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
    image: 'images/2019_04_IMG_20190413_155651_resized_20190413_045529473.jpg',
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
    image: 'images/2018_12_IMG_20181209_121304_resized_20181209_121401895.jpg',
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
    image: 'images/2018_11_44953761_10217424767519988_7076299614793498624_n.jpg',
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
    image: 'images/2020_06_IMG_20200612_160605.jpg',
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
    image: 'images/2020_05_IMG_20200531_000546.jpg',
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
    image: 'images/2020_05_IMG_20200517_123756.jpg',
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
    image: 'images/2020_05_IMG_20200509_213712-1.jpg',
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
    image: 'images/2020_05_IMG_20200426_150746-1.jpg',
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
    image: 'images/2020_04_IMG_20200427_1606226479.jpg',
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
    image: 'images/2020_04_IMG_20200419_180806.jpg',
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
    image: 'images/2020_04_IMG_20200414_161254.jpg',
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
    image: 'images/2020_04_IMG_20200401_153540.jpg',
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
    image: 'images/2020_03_IMG_20200322_122833_resized_20200322_020112730-1.jpg',
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
  // --- Batch cooking recipes (batch 1: 20 recipes) ---
  {
    id: 'acelgas-y-garbanzos-especiados',
    title: 'Acelgas y Garbanzos Especiados',
    category: 'Legumbres',
    summary: 'Acelgas salteadas con arroz, jamón, piñones y garbanzos especiados al horno.',
    image: 'images/acelga_ACELGAD.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'manojo grande de acelgas frescas' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'jamón serrano sin aditivos' },
      { id: '4', baseQuantity: 25, unit: 'gr de', name: 'piñones' },
      { id: '5', baseQuantity: 150, unit: 'gr de', name: 'garbanzos especiados' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '7', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer 150 gr de arroz vaporizado en abundante agua hirviendo con sal. Escurrir y reservar.',
      'En otra olla con agua hirviendo y sal, cocer las pencas de acelgas troceadas durante 7 minutos. Escurrir y reservar.',
      'En sartén ancha con 2 cucharadas de AOVE, sofreír el jamón picado. Añadir el arroz cocido, las pencas, ajo en polvo y piñones. Sofreír todo junto.',
      'Incorporar las hojas de acelgas, los garbanzos especiados y 3 cucharadas de salsa de soja. Remover hasta que las hojas se cocinen (2 minutos).',
    ],
    nutrition: {
      totalWeightGrams: 825,
      perServing: {"calories":421,"protein":23.8,"carbs":43.1,"fat":20.5,"fiber":6.3},
      per100g: {"calories":203,"protein":11.5,"carbs":20.8,"fat":9.9,"fiber":3},
    },
  },
  {
    id: 'albondigas-al-curry',
    title: 'Albóndigas al Curry',
    category: 'Carne',
    summary: 'Albóndigas de cerdo y pollo al horno con una sabrosa salsa de verduras al curry.',
    image: 'images/albondigas_albondigas3-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'carne de cerdo y pollo picada' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'pan integral' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'leche' },
      { id: '6', baseQuantity: 1, unit: '', name: 'ajo machacado' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal y curry al gusto' },
      { id: '8', baseQuantity: 1, unit: '', name: 'cebolla (para la salsa)' },
      { id: '9', baseQuantity: 150, unit: 'gr de', name: 'pimiento asado' },
      { id: '10', baseQuantity: 30, unit: 'gr de', name: 'AOVE' },
      { id: '11', baseQuantity: 40, unit: 'gr de', name: 'nata' },
      { id: '12', baseQuantity: 100, unit: 'gr de', name: 'leche' },
      { id: '13', baseQuantity: 150, unit: 'gr de', name: 'caldo de pollo' },
      { id: '14', baseQuantity: 70, unit: 'gr de', name: 'vino blanco' },
      { id: '15', baseQuantity: 2, unit: 'cucharadas de', name: 'curry' },
    ],
    steps: [
      'Mezclar bien la carne picada con media cebolla picada, huevo, pan remojado en leche, ajo machacado, sal y curry. Formar bolitas y colocar en bandeja de horno con papel vegetal.',
      'Hornear las albóndigas 30 minutos a 180ºC.',
      'Para la salsa: picar la cebolla y sofreír con AOVE. Añadir pimiento asado, nata, leche, caldo de pollo, vino blanco, sal y curry. Cocinar 20 minutos y triturar.',
      'Incorporar las albóndigas a la salsa. Acompañar con arroz, cuscús o patata asada.',
    ],
    nutrition: {
      totalWeightGrams: 1721,
      perServing: {"calories":734,"protein":37.4,"carbs":43.9,"fat":43.8,"fiber":2.5},
      per100g: {"calories":296,"protein":15.1,"carbs":17.8,"fat":17.8,"fiber":1},
    },
  },
  {
    id: 'albondigas-de-garbanzos',
    title: 'Albóndigas de Garbanzos',
    category: 'Legumbres',
    summary: 'Albóndigas vegetales de garbanzos al horno con salsa de verduras.',
    image: 'images/albondigas_albondigas3-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 100, unit: 'ml de', name: 'leche' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'harina integral' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura química' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'pan integral rallado' },
      { id: '6', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '9', baseQuantity: 2, unit: '', name: 'zanahorias (para la salsa)' },
      { id: '10', baseQuantity: 2, unit: '', name: 'pimientos verdes (para la salsa)' },
      { id: '11', baseQuantity: 2, unit: '', name: 'pimientos rojos (para la salsa)' },
      { id: '12', baseQuantity: 1, unit: '', name: 'cebolla grande (para la salsa)' },
      { id: '13', baseQuantity: 4, unit: 'dientes de', name: 'ajo (para la salsa)' },
      { id: '14', baseQuantity: 1, unit: '', name: 'vaso de vino blanco' },
      { id: '15', baseQuantity: 4, unit: 'cucharadas de', name: 'tomate triturado' },
      { id: '16', baseQuantity: 0.5, unit: 'cucharadita de', name: 'clavo molido' },
    ],
    steps: [
      'Triturar garbanzos, leche, levadura, harina, pan rallado, huevos, ajo y sal hasta masa homogénea. Refrigerar 1 hora.',
      'Formar bolitas, colocar en bandeja con papel vegetal, rociar con AOVE y hornear 30 minutos a 180ºC.',
      'Para la salsa: picar todas las verduras y sofreír con AOVE, sal, pimienta y clavo molido 5 minutos. Añadir tomate triturado y vino, cocinar 20 minutos.',
      'Incorporar las albóndigas a la salsa. Acompañar de quinoa cocida.',
    ],
    nutrition: {
      totalWeightGrams: 1204,
      perServing: {"calories":503,"protein":20.9,"carbs":54.1,"fat":22.1,"fiber":6.8},
      per100g: {"calories":208,"protein":8.6,"carbs":22.4,"fat":9.1,"fiber":2.8},
    },
  },
  {
    id: 'albondigas-de-soja-texturizada-con-salsa-de-pimientos-asados',
    title: 'Albóndigas de Soja Texturizada con Salsa de Pimientos Asados',
    category: 'Verdura',
    summary: 'Albóndigas vegetales de soja texturizada y brócoli con salsa cremosa de pimientos.',
    image: 'images/albondigas_albondigas3-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'soja texturizada' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'brócoli' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano rallado' },
      { id: '6', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '7', baseQuantity: null, unit: '', name: 'Harina de garbanzo' },
      { id: '8', baseQuantity: 150, unit: 'gr de', name: 'pimientos asados' },
      { id: '9', baseQuantity: 100, unit: 'gr de', name: 'queso fresco batido' },
      { id: '10', baseQuantity: null, unit: '', name: 'Orégano, sal y pimienta' },
      { id: '11', baseQuantity: null, unit: '', name: 'Chorro de limón' },
    ],
    steps: [
      'Hidratar la soja en el doble de agua durante 1 hora. Escurrir bien.',
      'Cocinar el brócoli al vapor en microondas 5 minutos y triturar. Picar y sofreír cebolla y puerro.',
      'Mezclar en un bol la soja, brócoli triturado, sofrito, parmesano, huevo y harina de garbanzo. Salpimentar y formar albóndigas.',
      'Hornear 30-35 minutos a 190ºC.',
      'Para la salsa: batir los pimientos asados con el queso fresco, orégano, sal, pimienta y limón.',
    ],
    nutrition: {
      totalWeightGrams: 851,
      perServing: {"calories":394,"protein":24.5,"carbs":24.5,"fat":20.8,"fiber":4.5},
      per100g: {"calories":185,"protein":11.6,"carbs":11.6,"fat":9.8,"fiber":2.1},
    },
  },
  {
    id: 'alcachofas-con-carne-picada',
    title: 'Alcachofas con Carne Picada',
    category: 'Carne',
    summary: 'Alcachofas y habitas con carne picada especiada, un plato rápido y nutritivo.',
    image: 'images/alcachofas_LENTEJAS-CON-ALCACHOFAS1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 450, unit: 'gr de', name: 'alcachofas' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'carne picada' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'habitas tiernas' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'maicena' },
      { id: '7', baseQuantity: null, unit: '', name: 'Chorrito de limón' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer las alcachofas y habitas 7 minutos. Escurrir y reservar.',
      'En sartén con AOVE, sofreír a fuego alto la carne picada con ajo en polvo, removiendo continuamente.',
      'Cuando la carne se dore, añadir sal, pimienta, alcachofas, habitas, chorrito de limón y 100 ml de caldo frío con 1 cucharadita de maicena desleída.',
      'Chup chup a fuego bajo 1-2 minutos removiendo constantemente.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":544,"protein":35.6,"carbs":24.4,"fat":34.9,"fiber":6.1},
      per100g: {"calories":227,"protein":14.9,"carbs":10.2,"fat":14.6,"fiber":2.6},
    },
  },
  {
    id: 'alcachofas-y-mozzarella',
    title: 'Alcachofas y Mozzarella',
    category: 'Verdura',
    summary: 'Alcachofas cocidas salteadas con gambas, ajos tiernos, tomate y mozzarella fundida.',
    image: 'images/alcachofas_LENTEJAS-CON-ALCACHOFAS1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 8, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Limpiar las alcachofas quitando hojas verdes, pelar el tallo y sumergir en agua con limón. Cocer en agua hirviendo con sal 15 minutos. Escurrir y cortar en cuartos.',
      'Sofreír los ajos tiernos picados con AOVE 2 minutos a fuego medio-bajo.',
      'Incorporar gambas, alcachofas, salsa de tomate, orégano, sal y pimienta. Fuego fuerte 1-2 minutos.',
      'Bajar el fuego, añadir la mozzarella a trocitos, tapar y dejar 2 minutos más hasta que funda.',
    ],
    nutrition: {
      totalWeightGrams: 941,
      perServing: {"calories":444,"protein":26.8,"carbs":20.9,"fat":28.5,"fiber":4.4},
      per100g: {"calories":188,"protein":11.4,"carbs":8.9,"fat":12.1,"fiber":1.9},
    },
  },
  {
    id: 'alitas-de-pollo-con-salsa-de-tomate',
    title: 'Alitas de Pollo con Salsa de Tomate',
    category: 'Carne',
    summary: 'Alitas de pollo horneadas en bolsa de asar con salsa de tomate concentrado y soja.',
    image: 'images/alitas_alitas1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'bandejas de alitas de pollo' },
      { id: '2', baseQuantity: 80, unit: 'gr de', name: 'tomate concentrado' },
      { id: '3', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla a temperatura ambiente' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'salsa de soja' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'vinagre de manzana' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta negra' },
    ],
    steps: [
      'Mezclar en un bol el tomate concentrado, mantequilla, salsa de soja y vinagre de manzana.',
      'Salpimentar las alitas e introducir en una bolsa de asar con la mezcla anterior.',
      'Cerrar la bolsa, impregnar bien las alitas, agujerear un poco y hornear a 180ºC durante 50 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 640,
      perServing: {"calories":360,"protein":24.1,"carbs":12.2,"fat":23.9,"fiber":1.4},
      per100g: {"calories":178,"protein":11.9,"carbs":6,"fat":11.8,"fiber":0.7},
    },
  },
  {
    id: 'alubias-con-coles-de-bruselas',
    title: 'Alubias con Coles de Bruselas',
    category: 'Legumbres',
    summary: 'Guiso de alubias con coles de bruselas, carne y salsa al curry.',
    image: 'images/alubias_alubias.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 350, unit: 'gr de', name: 'coles de bruselas' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'carne de cerdo o vacuno' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'curry en polvo' },
      { id: '8', baseQuantity: 250, unit: 'ml de', name: 'caldo de verduras o carne' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En olla con 2 cucharadas de AOVE, dorar la cebolla picada 3 minutos a fuego medio-fuerte y 3 más a fuego medio.',
      'Subir el fuego, añadir la carne troceada y sellar removiendo.',
      'Incorporar nata, ajo en polvo, curry, coles de bruselas, alubias y caldo. Salpimentar.',
      'Chup chup a fuego medio-bajo durante 7 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":555,"protein":31.9,"carbs":43.4,"fat":30.6,"fiber":8.4},
      per100g: {"calories":222,"protein":12.7,"carbs":17.3,"fat":12.2,"fiber":3.4},
    },
  },
  {
    id: 'alubias-con-esparragos',
    title: 'Alubias con Espárragos',
    category: 'Legumbres',
    summary: 'Guiso de alubias grandes con ternera, setas, espárragos y vino blanco.',
    image: 'images/alubias_alubias.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'alubias grandes cocidas' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'carne de ternera picada' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'setas' },
      { id: '4', baseQuantity: 2, unit: '', name: 'pimientos verdes italianos' },
      { id: '5', baseQuantity: 1, unit: '', name: 'manojo de espárragos' },
      { id: '6', baseQuantity: 2, unit: 'cucharaditas de', name: 'sal de hierbas' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '8', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '9', baseQuantity: 800, unit: 'ml de', name: 'caldo de carne o pollo' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '11', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
    ],
    steps: [
      'En olla con AOVE, dorar los pimientos en dados. Añadir espárragos y setas troceadas, remover 2 minutos.',
      'Subir temperatura, añadir la ternera picada y sellar removiendo 1-2 minutos.',
      'Agregar vino blanco y esperar a que evapore el alcohol.',
      'Incorporar sal de hierbas, tomillo, caldo, alubias, sal y pimienta. Chup chup 20 minutos a fuego medio-bajo.',
    ],
    nutrition: {
      totalWeightGrams: 2550,
      perServing: {"calories":734,"protein":37.4,"carbs":63.1,"fat":34.5,"fiber":9.3},
      per100g: {"calories":243,"protein":12.4,"carbs":21,"fat":11.4,"fiber":3.1},
    },
  },
  {
    id: 'alubias-con-quinoa-y-espinacas',
    title: 'Alubias con Quinoa y Espinacas',
    category: 'Legumbres',
    summary: 'Guiso de alubias con quinoa, espinacas, tomates secos y especias.',
    image: 'images/alubias_alubias.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 4, unit: '', name: 'tomates secos' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '7', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: 300, unit: 'gr de', name: 'espinacas' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'romero' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Saltear la cebolla picada con AOVE 2 minutos a fuego medio-alto.',
      'Triturar ajo, tomates secos, leche y 500 ml de caldo. Añadir a la olla junto con alubias, romero, pimentón y 500 ml más de caldo.',
      'Salpimentar, tapar y chup chup 12 minutos a fuego medio-bajo.',
      'A los 10 minutos incorporar las espinacas y dejar 2 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1701,
      perServing: {"calories":544,"protein":23.1,"carbs":63.9,"fat":20.5,"fiber":9.5},
      per100g: {"calories":204,"protein":8.6,"carbs":23.9,"fat":7.7,"fiber":3.6},
    },
  },
  {
    id: 'alubias-con-salsa-de-tomate',
    title: 'Alubias con Salsa de Tomate',
    category: 'Legumbres',
    summary: 'Alubias en salsa de tomate especiada con garam masala, cúrcuma y jengibre.',
    image: 'images/alubias_alubias.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 1, unit: 'trozo de', name: 'jengibre (2 cm aprox)' },
      { id: '6', baseQuantity: 15, unit: 'gr de', name: 'mantequilla' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'garam masala' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Trocear cebolla, ajo y jengibre. Sofreír con AOVE y mantequilla a fuego medio-alto 2 minutos, luego bajar y cocinar 8 minutos más.',
      'Añadir tomate triturado, garam masala, cúrcuma, sal y pimienta. Chup chup tapado 15 minutos a fuego bajo.',
      'Triturar bien el sofrito, incorporar las alubias y chup chup 10 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1015,
      perServing: {"calories":446,"protein":20.5,"carbs":54.1,"fat":20.1,"fiber":8.1},
      per100g: {"calories":192,"protein":8.8,"carbs":23.3,"fat":8.7,"fiber":3.5},
    },
  },
  {
    id: 'alubias-con-setas-y-chorizo-iberico',
    title: 'Alubias con Setas y Chorizo Ibérico',
    category: 'Legumbres',
    summary: 'Guiso de alubias con setas variadas, chorizo ibérico, arroz y salsa de soja.',
    image: 'images/alubias_alubias.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'setas variadas' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'chorizo ibérico' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '7', baseQuantity: 800, unit: 'ml de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: 100, unit: 'gr de', name: 'arroz' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír el chorizo troceado con AOVE un par de minutos. Reservar.',
      'En la misma olla sofreír ajo y cebolla picados a fuego medio.',
      'Cuando la cebolla dore, incorporar las setas troceadas y sofreír 2-3 minutos.',
      'Añadir salsa de soja, 700 ml de caldo, alubias, arroz, chorizo reservado, sal y pimienta. Chup chup 15 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: {"calories":573,"protein":26.3,"carbs":43.9,"fat":34.9,"fiber":7.3},
      per100g: {"calories":237,"protein":10.9,"carbs":18.2,"fat":14.5,"fiber":3},
    },
  },
  {
    id: 'arroz-caldoso-con-pollo-habas-y-aceitunas',
    title: 'Arroz Caldoso con Pollo, Habas y Aceitunas',
    category: 'Hidratos',
    summary: 'Arroz caldoso con pollo de corral, habas frescas y aceitunas negras.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'arroz' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'pollo de corral en trozos' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'habas frescas pequeñas' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'aceitunas negras' },
      { id: '5', baseQuantity: 2, unit: '', name: 'tomates maduros' },
      { id: '6', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '7', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '8', baseQuantity: 2, unit: 'litros de', name: 'caldo de pollo' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Dorar el pollo con AOVE a fuego medio. Retirar el exceso de grasa.',
      'Bajar el fuego, añadir cebolla y pimiento picados. Salar, remover, tapar y cocinar 10 minutos.',
      'Añadir tomate rallado, pimentón y aceitunas deshuesadas. Tapar y chup chup 20 minutos a fuego suave.',
      'Echar 1 litro de caldo, llevar a ebullición, bajar fuego y cocinar 15 minutos.',
      'Incorporar otro litro de caldo, habas y arroz. Fuego fuerte 6 minutos y medio-bajo 14 minutos. Reposar y servir.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":544,"protein":26.8,"carbs":63.9,"fat":20.9,"fiber":4.9},
      per100g: {"calories":206,"protein":10.2,"carbs":24.4,"fat":7.9,"fiber":1.9},
    },
  },
  {
    id: 'arroz-con-leche-de-coco-y-champinones',
    title: 'Arroz con Leche de Coco y Champiñones',
    category: 'Hidratos',
    summary: 'Arroz vaporizado cocido en leche de coco con champiñones salteados, comino y canela.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '2', baseQuantity: 400, unit: 'ml de', name: 'leche de coco' },
      { id: '3', baseQuantity: 2, unit: 'cucharadas de', name: 'coco rallado' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'canela' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En olla mezclar leche de coco, 400 ml de agua y coco rallado. Llevar a ebullición, añadir arroz y sal. Chup chup 20 minutos a fuego medio.',
      'Mientras, laminar los champiñones y saltear en sartén con AOVE a fuego fuerte, removiendo para que sellen.',
      'Cuando sellen, añadir comino y canela. Dar un último meneo.',
      'Escurrir el arroz, volcarlo en la sartén con los champiñones, hervor conjunto 1 minuto.',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":446,"protein":10.9,"carbs":54.5,"fat":25.1,"fiber":3.4},
      per100g: {"calories":223,"protein":5.4,"carbs":27.3,"fat":12.6,"fiber":1.7},
    },
  },
  {
    id: 'arroz-con-leche-de-coco-y-pescado-a-la-plancha',
    title: 'Arroz con Leche de Coco y Pescado a la Plancha',
    category: 'Pescado',
    summary: 'Arroz basmati cocido con leche de coco y verduras, acompañado de pescado blanco.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'arroz basmati' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 0.5, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '5', baseQuantity: 300, unit: 'ml de', name: 'agua' },
      { id: '6', baseQuantity: 4, unit: '', name: 'filetes de pescado blanco' },
      { id: '7', baseQuantity: null, unit: '', name: 'Lima' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'En olla echar arroz, zanahorias y pimiento muy picados, sal, leche de coco y agua.',
      'Llevar a ebullición, tapar, bajar fuego y chup chup 15 minutos.',
      'Mientras, dorar los filetes de pescado con AOVE en plancha o sartén.',
      'Servir el arroz con el pescado y aderezar con lima.',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: {"calories":360,"protein":23.8,"carbs":30.4,"fat":17.1,"fiber":2.1},
      per100g: {"calories":178,"protein":11.8,"carbs":15,"fat":8.5,"fiber":1},
    },
  },
  {
    id: 'arroz-con-salsa-de-soja-y-tahini',
    title: 'Arroz con Salsa de Soja y Tahini',
    category: 'Hidratos',
    summary: 'Arroz vaporizado salteado con ajos tiernos, judías verdes, salchichas y salsa de soja con tahini.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 250, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '2', baseQuantity: 6, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'judías verdes' },
      { id: '4', baseQuantity: 3, unit: '', name: 'salchichas frescas de pollo' },
      { id: '5', baseQuantity: 50, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 50, unit: 'ml de', name: 'salsa de soja' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'tahini' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer el arroz en agua con sal según el paquete. Escurrir.',
      'Dorar con AOVE los ajos tiernos picados y judías verdes troceadas a fuego medio-bajo 4-5 minutos.',
      'Subir el fuego e incorporar las salchichas troceadas para dorarlas.',
      'En un bol mezclar caldo, salsa de soja y tahini.',
      'Añadir el arroz a la sartén, remover a fuego alto. Incorporar la salsa y mezclar bien.',
    ],
    nutrition: {
      totalWeightGrams: 700,
      perServing: {"calories":394,"protein":18.5,"carbs":43.9,"fat":20.1,"fiber":3.9},
      per100g: {"calories":198,"protein":9.3,"carbs":22.1,"fat":10.1,"fiber":2},
    },
  },
  {
    id: 'arroz-con-verduras-y-bacalao',
    title: 'Arroz con Verduras y Bacalao',
    category: 'Pescado',
    summary: 'Arroz tipo paella con verduras pochadas, bacalao, atún y azafrán.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 250, unit: 'gr de', name: 'arroz tipo bomba' },
      { id: '2', baseQuantity: 1, unit: '', name: 'manojo de ajos tiernos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'ñora' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'judías verdes' },
      { id: '6', baseQuantity: 2, unit: '', name: 'tomates maduros' },
      { id: '7', baseQuantity: 0.5, unit: '', name: 'coliflor' },
      { id: '8', baseQuantity: 1, unit: '', name: 'lata de atún' },
      { id: '9', baseQuantity: null, unit: '', name: 'Migas de bacalao desalado' },
      { id: '10', baseQuantity: 1, unit: 'cucharada de', name: 'pimentón' },
      { id: '11', baseQuantity: null, unit: '', name: 'Azafrán de pelo' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Lavar y trocear las verduras. Sofreír una a una con AOVE a fuego medio-bajo. Reservar.',
      'En la misma olla, sofreír los tomates rallados con AOVE. Cuando pierda el agua añadir pimentón y sal.',
      'Sofreír el arroz con el tomate y la verdura en la paellera. Añadir 500 ml de caldo/agua con la ñora batida y azafrán.',
      'Cocer 17-20 minutos. Cuando falten 5 minutos añadir el atún y el bacalao.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":446,"protein":24.1,"carbs":43.4,"fat":23.5,"fiber":4.5},
      per100g: {"calories":205,"protein":11,"carbs":19.8,"fat":10.7,"fiber":2.1},
    },
  },
  {
    id: 'arroz-de-coliflor-con-bacalao',
    title: 'Arroz de Coliflor con Bacalao',
    category: 'Pescado',
    summary: 'Falso arroz de coliflor rallada con garbanzos, ajos tiernos y bacalao dorado.',
    image: 'images/arroz_arroz.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor' },
      { id: '2', baseQuantity: 1, unit: '', name: 'manojo de ajos tiernos' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'bacalao' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '5', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: 600, unit: 'ml de', name: 'agua o caldo de verduras' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Rallar la coliflor y picar los ajos tiernos.',
      'En sartén ancha con mantequilla y AOVE, saltear la verdura rallada 4 minutos a fuego fuerte removiendo.',
      'Añadir caldo, garbanzos, comino, sal y pimienta. Chup chup 10 minutos a fuego medio.',
      'En otra sartén, dorar los lomos de bacalao con AOVE 2 minutos por cada lado. Servir sobre el colirroz.',
    ],
    nutrition: {
      totalWeightGrams: 1220,
      perServing: {"calories":503,"protein":33.9,"carbs":20.5,"fat":29.5,"fiber":4.9},
      per100g: {"calories":217,"protein":14.7,"carbs":8.9,"fat":12.7,"fiber":2.1},
    },
  },
  {
    id: 'asado-de-garbanzos',
    title: 'Asado de Garbanzos',
    category: 'Legumbres',
    summary: 'Garbanzos asados al horno con patatas, pimiento, cebolla y hierbas aromáticas.',
    image: 'images/asado_asado2-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '5', baseQuantity: 150, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: null, unit: '', name: 'Zumo de medio limón' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En recipiente apto para horno, colocar patatas y pimiento troceados, garbanzos y cebolla pelada y troceada.',
      'En un vaso mezclar caldo, zumo de limón, AOVE, tomillo, orégano, sal y pimienta.',
      'Volcar la mezcla sobre las verduras y garbanzos, remover bien.',
      'Hornear 50 minutos a 180ºC.',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":394,"protein":18.5,"carbs":43.4,"fat":20.1,"fiber":6.8},
      per100g: {"calories":196,"protein":9.2,"carbs":21.6,"fat":10,"fiber":3.4},
    },
  },
  {
    id: 'asado-de-pollo-a-la-mandarina',
    title: 'Asado de Pollo a la Mandarina',
    category: 'Carne',
    summary: 'Muslos de pollo asados al horno con mandarinas, patatas, vino blanco y garam masala.',
    image: 'images/asado_asado2-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 5, unit: '', name: 'muslos y contramuslos de pollo' },
      { id: '2', baseQuantity: 3, unit: '', name: 'mandarinas' },
      { id: '3', baseQuantity: 3, unit: '', name: 'patatas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '5', baseQuantity: 150, unit: 'ml de', name: 'caldo de pollo' },
      { id: '6', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '7', baseQuantity: null, unit: '', name: 'Garam masala' },
      { id: '8', baseQuantity: null, unit: '', name: 'Tomillo y romero' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
    ],
    steps: [
      'Pelar y cortar patatas con grosor de un dedo, salar y disponer en bandeja de horno.',
      'Colocar encima las mandarinas peladas y separadas en gajos, y la cebolleta en juliana.',
      'Poner los muslos salpimentados y especiados con garam masala. Verter caldo y vino por encima. Espolvorear romero y tomillo.',
      'Hornear a 190ºC durante 1 hora aproximadamente.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":544,"protein":35.6,"carbs":24.4,"fat":34.5,"fiber":2.6},
      per100g: {"calories":228,"protein":14.9,"carbs":10.2,"fat":14.4,"fiber":1.1},
    },
  },
  // --- Batch cooking recipes (batch 2: 50 recipes) ---
  {
    id: 'asado-de-pollo-con-coles-de-bruselas',
    title: 'Asado de Pollo con Coles de Bruselas',
    category: 'Carne',
    summary: 'Asado de muslos de pollo al horno con coles de bruselas, patatas y una salsa cremosa de tomate y nata.',
    image: 'images/asado_asado2-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'muslos y contramuslos de pollo' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'coles de bruselas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'tomate gordo y maduro' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '6', baseQuantity: 1, unit: 'trozo de', name: 'jengibre fresco (2 cm)' },
      { id: '7', baseQuantity: 40, unit: 'gr de', name: 'queso semitierno' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'romero' },
      { id: '10', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '11', baseQuantity: 100, unit: 'ml de', name: 'agua o caldo de pollo' },
      { id: '12', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Precalentar el horno a 190º. Pelar y cortar las patatas por la mitad, lavar las coles de bruselas y disponer todo en una bandeja de horno junto con los muslos de pollo con piel.',
      'Triturar en batidora el tomate, nata fresca, ajo, tomillo, romero, agua o caldo, sal y pimienta. Verter sobre la carne, patatas y coles, mezclar bien.',
      'Hornear 40 minutos a 190º, dar la vuelta a la carne y patatas y hornear 30 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1870,
      perServing: {"calories":743,"protein":53.8,"carbs":43.1,"fat":43.8,"fiber":6.3},
      per100g: {"calories":398,"protein":28.8,"carbs":23.1,"fat":23.4,"fiber":3.4},
    },
  },
  {
    id: 'asado-de-pollo-con-salsa-de-coco',
    title: 'Asado de Pollo con Salsa de Coco',
    category: 'Carne',
    summary: 'Muslos de pollo al horno con patatas, calabaza y espárragos en una exótica salsa de leche de coco y curry.',
    image: 'images/asado_asado2-1.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'muslos y contramuslos de pollo' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas' },
      { id: '3', baseQuantity: 4, unit: '', name: 'rodajas de calabaza gruesas' },
      { id: '4', baseQuantity: 1, unit: 'manojo de', name: 'espárragos verdes' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'setas' },
      { id: '6', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'crema de cacahuete' },
      { id: '8', baseQuantity: 2, unit: 'cucharadas de', name: 'coco rallado' },
      { id: '9', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '10', baseQuantity: 1, unit: '', name: 'lima (zumo)' },
      { id: '11', baseQuantity: 1, unit: 'cucharadita de', name: 'curry en polvo' },
      { id: '12', baseQuantity: 100, unit: 'ml de', name: 'agua' },
    ],
    steps: [
      'Precalentar el horno a 190º. Mezclar leche de coco, crema de cacahuete, coco rallado, salsa de soja, zumo de lima, curry, agua y sal.',
      'Disponer en bandeja de horno los muslos, patatas y calabaza en cuartos. Verter la salsa, salpimentar, tapar con papel aluminio y hornear 30 minutos a 190º.',
      'Sacar, destapar, añadir espárragos y setas en trozos grandes, mezclar y hornear 30 minutos más a 210º.',
    ],
    nutrition: {
      totalWeightGrams: 2830,
      perServing: {"calories":1042,"protein":54.9,"carbs":63.1,"fat":64.9,"fiber":7.1},
      per100g: {"calories":369,"protein":19.4,"carbs":22.4,"fat":23.1,"fiber":2.5},
    },
  },
  {
    id: 'asado-en-salsa-de-tomates-secos-y-romero',
    title: 'Asado en Salsa de Tomates Secos y Romero',
    category: 'Carne',
    summary: 'Pechugas de pollo al horno con patatas y champiñones bañados en una salsa de tomates secos, nueces y romero.',
    image: 'images/asado_asado2-1.jpg',
    defaultServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'pechugas enteras de pollo' },
      { id: '2', baseQuantity: 3, unit: '', name: 'patatas grandes' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'champiñones enteros' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'tomates secos' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'nueces peladas' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Precalentar el horno a 190º. Disponer las pechugas en bandeja. Pelar y trocear patatas y 1 zanahoria, cortar champiñones en cuartos y añadir. Salpimentar.',
      'Triturar 1 zanahoria, tomates secos, nueces, salsa de soja, romero, 2 cucharadas de AOVE, 250 gr de agua, sal y pimienta. Verter sobre la carne y verdura, mezclar bien.',
      'Hornear a 190º durante 50 minutos. Al terminar cortar las pechugas en trozos grandes.',
    ],
    nutrition: {
      totalWeightGrams: 1930,
      perServing: {"calories":734,"protein":51.4,"carbs":34.9,"fat":43.1,"fiber":5.5},
      per100g: {"calories":382,"protein":26.7,"carbs":18.2,"fat":22.5,"fiber":2.9},
    },
  },
  {
    id: 'atun-al-jerez',
    title: 'Atún al Jerez',
    category: 'Pescado',
    summary: 'Tacos de atún sellados con una aromática salsa de vino de Jerez, ajo y perejil.',
    image: 'images/atun_atun.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomo de atún en tacos' },
      { id: '2', baseQuantity: 200, unit: 'ml de', name: 'vino de Jerez' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Perejil picado' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Zumo de medio limón' },
      { id: '7', baseQuantity: null, unit: '', name: 'Un poco de caldo de pollo' },
    ],
    steps: [
      'Picar muy finos los ajos y el perejil. Secar bien los tacos de atún.',
      'En sartén a fuego fuerte con 1 cucharada de AOVE, sellar los tacos de atún 1 minuto por cada lado. Reservar.',
      'En la misma sartén con 1 cucharada de AOVE, sofreír ajos y perejil a fuego medio-bajo. Cuando dore el ajo, añadir vino de Jerez y subir el fuego para evaporar el alcohol. Añadir un poco de caldo de pollo, salpimentar.',
      'Cuando deje de oler a alcohol la salsa está lista. Servir sobre los tacos de atún.',
    ],
    nutrition: {
      totalWeightGrams: 920,
      perServing: {"calories":440,"protein":53.5,"carbs":4.9,"fat":20.8,"fiber":0.8},
      per100g: {"calories":479,"protein":58.2,"carbs":5.3,"fat":22.6,"fiber":0.9},
    },
  },
  {
    id: 'atun-con-brocoli-y-setas',
    title: 'Atún con Brócoli y Setas',
    category: 'Pescado',
    summary: 'Dados de atún salteados al wok con brócoli, setas, aceite de sésamo y salsa de soja.',
    image: 'images/atun_atun.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomos de atún' },
      { id: '2', baseQuantity: 0.5, unit: '', name: 'brócoli' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'setas' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'aceite de sésamo' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja sin azúcar' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal de hierbas' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'eneldo picado' },
    ],
    steps: [
      'En wok con 1 cucharada de aceite de sésamo bien caliente, sellar el atún en dados durante 1 minuto a fuego fuerte. Reservar.',
      'En la misma sartén incorporar setas laminadas, arbolitos de brócoli, sal de hierbas y salsa de soja. Tapar y cocinar 5 minutos a fuego medio.',
      'Incorporar los dados de atún y el eneldo, cocinar 30 segundos más y listo.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":540,"protein":54.8,"carbs":11.1,"fat":31.4,"fiber":3.4},
      per100g: {"calories":433,"protein":44.1,"carbs":8.9,"fat":25.1,"fiber":2.7},
    },
  },
  {
    id: 'bacalao-a-la-americana',
    title: 'Bacalao a la Americana',
    category: 'Pescado',
    summary: 'Lomos de bacalao en una rica salsa americana de tomate, cebolla, pimiento y vino blanco.',
    image: 'images/bacalao_BACALAO.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'lomos de bacalao' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebollas grandes' },
      { id: '3', baseQuantity: 2, unit: '', name: 'pimientos verdes pequeños' },
      { id: '4', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 300, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'vino blanco' },
      { id: '7', baseQuantity: 2, unit: '', name: 'hojas de laurel' },
      { id: '8', baseQuantity: null, unit: '', name: 'Ajo y perejil para el majado' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Sofreír cebollas y pimientos picados con 2 cucharadas de AOVE. Cuando la cebolla dore, incorporar el tomate y sofreír.',
      'Añadir vino blanco, sal, pimienta y laurel. Esperar a que evapore el alcohol, bajar fuego y cocinar 20 minutos. Añadir agua si se seca.',
      'Hacer un majado de ajo y perejil en mortero, añadir a la cazuela y cocer 5 minutos. Batir la salsa si se prefiere sin trozos.',
      'Añadir los lomos de bacalao a la salsa y cocinar 5 minutos a fuego bajo.',
    ],
    nutrition: {
      totalWeightGrams: 2060,
      perServing: {"calories":823,"protein":53.9,"carbs":34.1,"fat":51.1,"fiber":5.3},
      per100g: {"calories":399,"protein":26.2,"carbs":16.5,"fat":24.8,"fiber":2.6},
    },
  },
  {
    id: 'bacalao-con-salsa-de-almendras',
    title: 'Bacalao con Salsa de Almendras',
    category: 'Pescado',
    summary: 'Lomos de bacalao al horno con una salsa tradicional de almendras, ajo, pan y tomate.',
    image: 'images/bacalao_BACALAO.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomos de bacalao desalado' },
      { id: '2', baseQuantity: 1, unit: '', name: 'rebanada de pan integral' },
      { id: '3', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'almendras' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 150, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '7', baseQuantity: 150, unit: 'ml de', name: 'caldo de verdura' },
      { id: '8', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Dorar en olla con 2 cucharadas de AOVE los ajos laminados. Reservar. Sofreír la rebanada de pan y almendras. Reservar.',
      'En mortero hacer majado con ajos, pan y almendras con sal. Desleír con 50 ml de caldo. Reservar.',
      'En la misma sartén sofreír la cebolla picada. Cuando dore añadir tomate triturado y cocinar 15 minutos a fuego medio-bajo.',
      'En recipiente de horno poner bacalao, sofrito y majado, mezclar. Añadir caldo de verduras y hornear 20 minutos a 180º.',
    ],
    nutrition: {
      totalWeightGrams: 1610,
      perServing: {"calories":694,"protein":51.1,"carbs":24.9,"fat":43.9,"fiber":4.1},
      per100g: {"calories":383,"protein":28.2,"carbs":13.8,"fat":24.2,"fiber":2.3},
    },
  },
  {
    id: 'bacalao-con-tomate-al-curry',
    title: 'Bacalao con Tomate al Curry',
    category: 'Pescado',
    summary: 'Lomos de bacalao en una sencilla salsa de tomate especiada con curry y salsa de soja.',
    image: 'images/bacalao_BACALAO.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lomos de bacalao' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'pan rallado' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'salsa de soja' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'curry en polvo' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pochar 1 cebolla picada con 2 cucharadas de AOVE a fuego medio durante 5 minutos.',
      'Incorporar tomate triturado, pan rallado, salsa de soja, curry, ajo en polvo, sal y pimienta. Tapar y cocinar 15 minutos.',
      'Añadir los lomos de bacalao y cocinar 3 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 920,
      perServing: {"calories":440,"protein":43.5,"carbs":14.1,"fat":22.1,"fiber":2.3},
      per100g: {"calories":479,"protein":47.4,"carbs":15.4,"fat":24.1,"fiber":2.5},
    },
  },
  {
    id: 'bacoreta-con-anchoas-y-cama-de-verduras',
    title: 'Bacoreta con Anchoas y Cama de Verduras',
    category: 'Pescado',
    summary: 'Lomos de bacoreta con anchoas sobre una cama de calabacín y cebolleta rehogados.',
    image: 'images/bacoreta.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'rodajas gruesas de bacoreta' },
      { id: '2', baseQuantity: 1, unit: 'lata pequeña de', name: 'anchoas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 2, unit: '', name: 'calabacines' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Con un cuchillo de punta hacer pequeños cortes en la carne del pescado e introducir trozos de anchoa. Reservar.',
      'Cortar en rodajas finas la cebolleta y calabacines. Rehogar en sartén ancha con 2 cucharadas de AOVE, tapado a fuego medio-bajo 7 minutos. Destapar y 4 minutos más a fuego fuerte.',
      'En otra sartén dorar los lomos de pescado con 1 cucharadita de AOVE. Servir sobre la cama de verduras.',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":580,"protein":44.8,"carbs":8.1,"fat":41.1,"fiber":2.5},
      per100g: {"calories":466,"protein":36.1,"carbs":6.5,"fat":33.1,"fiber":2},
    },
  },
  {
    id: 'berenjenas-rellenas-con-pollo-y-arroz',
    title: 'Berenjenas Rellenas con Pollo y Arroz',
    category: 'Verdura',
    summary: 'Berenjenas al horno rellenas de pechuga de pollo picada, arroz y salsa de tomate con especias.',
    image: 'images/berenjenas-rellenas-pollo.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pollo picada' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'arroz' },
      { id: '4', baseQuantity: 150, unit: 'gr de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 150, unit: 'ml de', name: 'caldo de carne o verdura' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón dulce o ahumado' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: null, unit: '', name: 'Queso rallado al gusto' },
    ],
    steps: [
      'Partir 4 berenjenas longitudinalmente, hacer cortes en la pulpa y hornear 30 minutos a 180º.',
      'Cocer 50 gr de arroz. En sartén ancha dorar la pechuga de pollo picada con AOVE a fuego medio-alto.',
      'Añadir caldo, salsa de tomate, pimentón, tomillo, sal y pimienta. Cocinar 5 minutos. Incorporar arroz cocido.',
      'Extraer pulpa de berenjenas, picar y añadir al relleno. Rellenar las 8 mitades, añadir queso rallado y gratinar 5 minutos a 180º.',
    ],
    nutrition: {
      totalWeightGrams: 1860,
      perServing: {"calories":803,"protein":33.9,"carbs":63.9,"fat":43.9,"fiber":8.1},
      per100g: {"calories":432,"protein":18.3,"carbs":34.4,"fat":23.6,"fiber":4.3},
    },
  },
  {
    id: 'berenpizzas',
    title: 'Berenpizzas',
    category: 'Verdura',
    summary: 'Rodajas de berenjena al horno con salsa de tomate, pimiento asado, lacón y queso, estilo pizza.',
    image: 'images/berenpizzas.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'berenjenas medianas' },
      { id: '2', baseQuantity: null, unit: '', name: 'Salsa de tomate' },
      { id: '3', baseQuantity: 3, unit: 'lonchas de', name: 'lacón' },
      { id: '4', baseQuantity: 5, unit: '', name: 'pimientos asados' },
      { id: '5', baseQuantity: 70, unit: 'gr de', name: 'queso semitierno' },
      { id: '6', baseQuantity: null, unit: '', name: 'Orégano' },
    ],
    steps: [
      'Lavar las berenjenas y cortar en rodajas de 1 cm. Colocar en bandeja de horno con papel vegetal.',
      'Poner una cucharadita de salsa de tomate en cada rodaja y espolvorear orégano.',
      'Añadir un trozo de pimiento asado, un trozo de lacón y un trozo fino de queso encima de cada rodaja.',
      'Hornear a 190º durante 30 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1130,
      perServing: {"calories":563,"protein":24.1,"carbs":34.9,"fat":37.1,"fiber":6.1},
      per100g: {"calories":497,"protein":21.3,"carbs":30.8,"fat":32.7,"fiber":5.4},
    },
  },
  {
    id: 'bhuja-de-lentejas',
    title: 'Bhuja de Lentejas',
    category: 'Legumbres',
    summary: 'Albóndigas de lentejas rojas al estilo hindú con una cremosa salsa de tomate, nata y jengibre.',
    image: 'images/bhuja-lentejas.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'lentejas rojas secas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'patata grande' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'pan integral rallado' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'levadura química' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '9', baseQuantity: 50, unit: 'gr de', name: 'tomate concentrado' },
      { id: '10', baseQuantity: 200, unit: 'ml de', name: 'agua' },
      { id: '11', baseQuantity: 200, unit: 'ml de', name: 'nata para cocinar' },
      { id: '12', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '13', baseQuantity: null, unit: '', name: 'Jengibre fresco' },
    ],
    steps: [
      'Hervir lentejas rojas 5 minutos, escurrir. Pelar y rallar cebolla y patata. Mezclar con lentejas, levadura, cúrcuma, comino y sal. Amasar aplastando las lentejas. Añadir pan rallado si está muy pegajoso. Refrigerar 1 hora.',
      'Formar bolitas y disponer en bandeja de horno con papel vegetal. Rociar con AOVE y hornear 30 minutos a 180º.',
      'Para la salsa: dorar jengibre picado y ajo picado con AOVE. Agregar tomate concentrado, agua y nata. Rectificar de sal.',
      'Cuando rompa a hervir, añadir las albóndigas. Cocinar a fuego medio-bajo 5 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":580,"protein":23.5,"carbs":63.1,"fat":24.9,"fiber":8.5},
      per100g: {"calories":466,"protein":18.9,"carbs":50.6,"fat":20,"fiber":6.8},
    },
  },
  {
    id: 'bizcocho-de-coco-y-te-matcha',
    title: 'Bizcocho de Coco y Té Matcha',
    category: 'Postres',
    summary: 'Bizcocho saludable sin azúcar con copos de avena, coco rallado, dátiles y té matcha.',
    image: 'images/bizcocho_BIZCOCHO-DE-PIÑA.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'dátiles' },
      { id: '2', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'yogur natural griego' },
      { id: '4', baseQuantity: null, unit: '', name: 'Una puntita de sal' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'canela en polvo' },
      { id: '6', baseQuantity: 2, unit: 'cucharaditas de', name: 'levadura química' },
      { id: '7', baseQuantity: 60, unit: 'gr de', name: 'copos de avena' },
      { id: '8', baseQuantity: 60, unit: 'gr de', name: 'coco rallado' },
      { id: '9', baseQuantity: 100, unit: 'ml de', name: 'leche' },
      { id: '10', baseQuantity: 1, unit: '', name: 'manzana dulce' },
      { id: '11', baseQuantity: 1, unit: 'cucharada de', name: 'té matcha' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE o aceite de coco' },
    ],
    steps: [
      'Triturar dátiles (previamente hidratados en agua hirviendo), huevos, yogur, leche, sal, vainilla y canela con la levadura.',
      'Agregar copos de avena, coco rallado, manzana rallada y té matcha. Triturar hasta integrar.',
      'Disponer en molde engrasado con AOVE o aceite de coco. Hornear a 190º durante 35 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1040,
      perServing: {"calories":494,"protein":8.1,"carbs":63.9,"fat":24.1,"fiber":4.9},
      per100g: {"calories":408,"protein":6.7,"carbs":52.8,"fat":19.9,"fiber":4.1},
    },
  },
  {
    id: 'bizcocho-de-pina',
    title: 'Bizcocho de Piña',
    category: 'Postres',
    summary: 'Bizcocho facilísimo de piña con harina integral, sin azúcar, cubierto de chocolate negro.',
    image: 'images/bizcocho_BIZCOCHO-DE-PIÑA.jpg',
    defaultServings: 8,
    ingredients: [
      { id: '1', baseQuantity: 140, unit: 'gr de', name: 'piña (sin azúcar añadido)' },
      { id: '2', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 160, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '4', baseQuantity: 1, unit: 'sobre de', name: 'levadura Royal' },
      { id: '5', baseQuantity: 4, unit: 'onzas de', name: 'chocolate 72% cacao' },
    ],
    steps: [
      'Batir la piña (escurrida), los huevos, la harina integral y la levadura hasta obtener una masa homogénea.',
      'Echar en molde engrasado y hornear a 180º durante 40 minutos.',
      'Derretir las onzas de chocolate en el microondas con cuidado y verter por encima del bizcocho ya hecho.',
    ],
    nutrition: {
      totalWeightGrams: 840,
      perServing: {"calories":563,"protein":10.3,"carbs":73.1,"fat":29.1,"fiber":3.4},
      per100g: {"calories":471,"protein":8.7,"carbs":61.4,"fat":24.4,"fiber":2.9},
    },
  },
  {
    id: 'bocaditos-de-espinacas-y-ricotta',
    title: 'Bocaditos de Espinacas y Ricotta',
    category: 'Entrantes',
    summary: 'Bocaditos horneados de patata, espinacas y queso ricotta. Fáciles y saludables.',
    image: 'images/bocaditos-espinacas.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'patatas cocidas' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'espinacas frescas' },
      { id: '3', baseQuantity: 120, unit: 'gr de', name: 'queso ricotta' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Cocer las patatas peladas en agua hirviendo 12 minutos. Picar espinacas, ajo y cebolla y saltear con 1 cucharada de AOVE.',
      'Chafar las patatas cocidas con tenedor, mezclar con ricotta, 1 cucharada de AOVE, huevo, sal y pimienta.',
      'Cuando las verduras salteadas templen, añadir a la mezcla de patata y mezclar bien.',
      'Dar forma a los bocaditos en bandeja de horno con papel vegetal. Hornear 20 minutos a 200º.',
    ],
    nutrition: {
      totalWeightGrams: 1040,
      perServing: {"calories":494,"protein":20.9,"carbs":24.1,"fat":33.5,"fiber":3.4},
      per100g: {"calories":408,"protein":17.2,"carbs":19.9,"fat":27.7,"fiber":2.8},
    },
  },
  {
    id: 'brochetas-de-solomillo-de-pavo',
    title: 'Brochetas de Solomillo de Pavo',
    category: 'Carne',
    summary: 'Solomillo de pavo marinado en yogur y mostaza, asado en brochetas con calabacín y champiñones.',
    image: 'images/brochetas_BROCHETAS.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'solomillo de pavo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'yogur griego' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'mostaza' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'salsa de soja' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: 1, unit: '', name: 'calabacín' },
      { id: '7', baseQuantity: null, unit: '', name: 'Champiñones' },
    ],
    steps: [
      'Marinar la carne troceada con yogur griego, mostaza, salsa de soja, sal y pimienta. Tapar y refrigerar mínimo 30 minutos.',
      'Ensartar en brochetas alternando trozos de carne, calabacín y champiñón.',
      'Asar en plancha a fuego medio-alto con 1 cucharada de AOVE, 3 minutos por cada lado.',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":580,"protein":53.1,"carbs":4.9,"fat":35.1,"fiber":1.3},
      per100g: {"calories":466,"protein":42.6,"carbs":3.9,"fat":28.2,"fiber":1.1},
    },
  },
  {
    id: 'caballa-con-picadillo',
    title: 'Caballa con Picadillo',
    category: 'Pescado',
    summary: 'Lomos de caballa a la plancha acompañados de un fresco picadillo de tomate, pimiento y cebolleta.',
    image: 'images/caballa-picadillo.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'caballas frescas de ración (en lomos)' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tomates grandes rojos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, vinagre y sal' },
    ],
    steps: [
      'Dorar los lomos de caballa a la plancha un par de minutos por cada lado con cuidado de no resecar.',
      'Sofreír cebolleta y pimiento picados 5 minutos con 1 cucharada de AOVE a fuego medio. Pelar y picar los tomates.',
      'Mezclar todo el picadillo en un recipiente con AOVE, sal y vinagre. Disponer la caballa encima.',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":580,"protein":43.5,"carbs":8.1,"fat":37.9,"fiber":2.1},
      per100g: {"calories":466,"protein":35.1,"carbs":6.5,"fat":30.6,"fiber":1.7},
    },
  },
  {
    id: 'calabacin-hasselback',
    title: 'Calabacín Hasselback',
    category: 'Verdura',
    summary: 'Calabacín al estilo Hasselback relleno de jamón ibérico y mozzarella, horneado con ajo y orégano.',
    image: 'images/calabacin_CALABACIN.jpg',
    defaultServings: 2,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'calabacín grande' },
      { id: '2', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'jamón ibérico' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Lavar el calabacín y cortar en rodajas de medio cm sin llegar al final, como un acordeón.',
      'Intercalar trozos de jamón ibérico y mozzarella entre cada rodaja.',
      'Mezclar 2 cucharadas de AOVE, ajo en polvo, orégano, sal y pimienta. Verter por encima del calabacín.',
      'Hornear 30 minutos a 190º.',
    ],
    nutrition: {
      totalWeightGrams: 520,
      perServing: {"calories":260,"protein":14.9,"carbs":8.1,"fat":17.1,"fiber":2.5},
      per100g: {"calories":500,"protein":28.7,"carbs":15.5,"fat":33.1,"fiber":4.8},
    },
  },
  {
    id: 'carne-de-pavo-y-pollo-al-estilo-cajun',
    title: 'Carne de Pavo y Pollo al Estilo Cajún',
    category: 'Carne',
    summary: 'Muslos de pavo y pechugas de pollo asados en bolsa con una mezcla de especias cajún casera.',
    image: 'images/pavo_pavo.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'muslos de pavo' },
      { id: '2', baseQuantity: 2, unit: '', name: 'pechugas de pollo' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón dulce' },
      { id: '4', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón picante' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimienta negra' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'orégano' },
      { id: '8', baseQuantity: 0.5, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'sal' },
      { id: '10', baseQuantity: 0.5, unit: 'cucharadita de', name: 'semillas de mostaza' },
      { id: '11', baseQuantity: 1, unit: 'cucharada de', name: 'AOVE' },
      { id: '12', baseQuantity: 1, unit: '', name: 'bolsa de asar' },
    ],
    steps: [
      'Machacar en mortero todas las especias cajún hasta que quede fino. Mezclar con AOVE y 50 ml de agua.',
      'Meter muslos de pavo en una bolsa de asar con la mitad de la mezcla, y pechugas en otra bolsa con la otra mitad. Agitar bien.',
      'Hornear a 190º durante 45 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1860,
      perServing: {"calories":803,"protein":53.9,"carbs":8.1,"fat":51.1,"fiber":2.5},
      per100g: {"calories":432,"protein":29.1,"carbs":4.4,"fat":27.6,"fiber":1.4},
    },
  },
  {
    id: 'cazuela-marinera',
    title: 'Cazuela Marinera',
    category: 'Pescado',
    summary: 'Cazuela Marinera al estilo La Vida Bonica.',
    image: 'images/2020_10_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'langostinos crudos' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'rape' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'tomate triturado' },
      { id: '7', baseQuantity: null, unit: '', name: '1/2 vaso de vino blanco' },
      { id: '8', baseQuantity: null, unit: '', name: 'Una cucharadita de pimentón dulce' },
      { id: '9', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '10', baseQuantity: 2, unit: 'puñados de', name: 'fideos gruesos' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pelamos los langostinos y cocemos las cabezas y pieles en 1 litro de agua con sal y 1 hoja de laurel durante 5 minutos una vez rompa a hervir Colamos y reservamos.',
      'Rehogamos a fuego medio en una cucharada de AOVE los 2 dientes de ajo, la cebolla y el pimiento, todo ello bien picado, hasta que estén bien pochados. Añadimos el tomate y el vino. Subimos el fuego y dejamos reducir el alcohol.',
      'Añadimos el pimentón, la patata pelada y troceada y el caldo reservado y esperamos que rompa a hervir. Ponemos después los fideos y bajamos el fuego. Chup chup el tiempo que establezca en el paquete.',
      'A falta de 5 minutos ponemos el pescado troceado y a falta de un par de minutos ponemos los langostinos y tapamos la olla. Con este tiempo es suficiente para que la proteína se cocine el tiempo justo. Podemos decorar con perejil picado.',
    ],
    nutrition: {
      totalWeightGrams: 2450,
      perServing: {"calories":742,"protein":43.8,"carbs":34.9,"fat":46.3,"fiber":4.3},
      per100g: {"calories":304,"protein":18,"carbs":14.3,"fat":19,"fiber":1.8},
    },
  },
  {
    id: 'champinones-rellenos-de-jamon-y-queso',
    title: 'Champiñones Rellenos de Jamón y Queso',
    category: 'Verdura',
    summary: 'Champiñones Rellenos de Jamón y Queso al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'jamón york (más del 90%-95% de carne nos asegura tomar un fiambre de calidad)' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Tras limpiarlos de tierra colocamos los champiñones en una bandeja apta para horno, les quitamos los rabitos y los picamos, así como 60 gr de jamón york con alto contenido de carne (más del 90%, yo utilizo uno de ALDI que lleva un 96%).',
      'Rallamos 50 gr de queso Emmental y mezclamos con el jamón y el champiñón picado. Con esta mezcla rellenamos los champiñones, cubrimos la bandeja con papel de aluminio o papel vegetal y horneamos a 180º durante 30 minutos.',
      'Debería ser suficiente, no conviene cocinar mucho los champiñones para que no suelten mucha agua. Mi horno es grande y lento, seguramente con el tuyo se hagan en menos tiempo, compruébalo.',
    ],
    nutrition: {
      totalWeightGrams: 450,
      perServing: {"calories":281,"protein":18.4,"carbs":5.1,"fat":20.6,"fiber":1.4},
      per100g: {"calories":624,"protein":40.9,"carbs":11.4,"fat":45.8,"fiber":3.1},
    },
  },
  {
    id: 'chili-ahumado-de-verduras',
    title: 'Chili Ahumado de Verduras',
    category: 'Verdura',
    summary: 'Chili Ahumado de Verduras al estilo La Vida Bonica.',
    image: 'images/2022_04_IMG_20220403_134617-1024x825.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'cebollas' },
      { id: '2', baseQuantity: 2, unit: '', name: 'pimientos grandes' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes (o 1 patata y 1 boniato)' },
      { id: '4', baseQuantity: 400, unit: 'gr de', name: 'alubias negras' },
      { id: '5', baseQuantity: 800, unit: 'gr de', name: 'tomate en conserva' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino en polvo' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'cacao puro en polvo' },
      { id: '8', baseQuantity: 2, unit: 'cucharaditas de', name: 'pimentón ahumado' },
      { id: '9', baseQuantity: 1, unit: 'cucharada de', name: 'colmada de mantequilla de cacahuete' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Tengo un libro de Jamie Oliver entre manos y he modificado una de sus recetas para que case bien en una sesión de batch cooking y además a los peques les pueda gustar, os cuento cómo: La idea de esta preparación es asar las verduras en una plancha para que cojan un punto ahumado, por lo que pelamos y cortamos en dados de 2 ó 3 centímetros los pimientos y las cebollas y las asamos 3 minutos por cada lado.',
      'Vamos incorporando en una olla de base ancha a fuego medio-bajo donde previamente hemos puesto 2 cucharadas de AOVE, 1 cucharadita de comino, 2 cucharaditas de cacao puro en polvo y otras 2 de pimentón ahumado y 1 cucharada colmada de mantequilla de cacahuete.',
      'A continuación asamos las patatas (sin pelar, así mantienen mejor sus nutrientes, las lavamos bien antes) cortadas en dados de 2 centímetros. Reservamos en la olla junto a la cebolla y el pimiento y removemos bien. Procedemos ahora a agregar las alubias.',
      'Yo he puesto alubias negras o frijoles, pero puedes poner las que tengas por casa.',
      'Añadimos entonces a la olla los tomates en conserva (junto con su caldo), aplastamos con una cuchara de madera, agregamos 200 ml de agua, salpimentamos al gusto y chup chup a fuego lento durante 1 hora o hasta que la salsa espese, removiendo de vez en cuando.',
      'Ya está, podemos tomar este plato solo o acompañarlo de algo de carne, huevo a la plancha…',
    ],
    nutrition: {
      totalWeightGrams: 3400,
      perServing: {"calories":531,"protein":14.1,"carbs":73.4,"fat":20.5,"fiber":10.3},
      per100g: {"calories":156,"protein":4.1,"carbs":21.5,"fat":6,"fiber":3},
    },
  },
  {
    id: 'chorizo-casero-con-carne-de-pollo',
    title: 'Chorizo Casero con Carne de Pollo',
    category: 'Carne',
    summary: 'Chorizo Casero con Carne de Pollo al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191116_151705-1024x566.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'pan integral seco' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'queso Cheddar' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 250, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'champiñones' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal, orégano y albahaca' },
    ],
    steps: [
      'Si el pan no lo tenemos rallado lo primero que hemos de hacer será rallarlo. Una vez hecho cogemos la mitad, es decir, 50 gr y mezclamos con una cucharadita de sal, una de orégano y una de albahaca.',
      'A continuación incorporamos a este pan rallado y especias el queso, el bacon y los champiñones y trituramos bien hasta que quede una masa uniforme.',
      'Por último hemos de formar croquetas, rebozarlas con la otra mitad de pan rallado y con el huevo previamente batido (lo ponemos en dos platos diferentes, primero pasamos por el pan y después por el huevo) Ya sólo queda hornear a 180º durante 20 minutos. Y tenemos unas croquetazas listas.',
      'Siempre podemos duplicar cantidades y congelar sin problema. Yo las voy a congelar ya horneadas, el día antes de consumir las sacaré del congelador y meteré en la nevera para que no se rompa la cadena de frío.',
      'Y antes de comerlas las podemos calentar un par de minutos en el horno porque al microondas se van a quedar más blandas. EXTRA: Snack de huevo y galletas de almendra y limón',
    ],
    nutrition: {
      totalWeightGrams: 650,
      perServing: {"calories":434,"protein":33.9,"carbs":10.3,"fat":29.5,"fiber":2.5},
      per100g: {"calories":283,"protein":22.1,"carbs":6.7,"fat":19.2,"fiber":1.6},
    },
  },
  {
    id: 'col-con-carne-adobada',
    title: 'Col con Carne Adobada',
    category: 'Carne',
    summary: 'Col con Carne Adobada al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220320_125957-1024x940.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '½ col' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'carne picada (yo he utilizado cerdo que me picaron en la carnicería)' },
      { id: '3', baseQuantity: null, unit: '', name: 'Especias al gusto: Yo he utilizado cebolla en polvo, curry, ajo en polvo, pimentón, sal y pimienta.' },
    ],
    steps: [
      'En primer lugar adobamos 500 gr de carne picada con 2 cucharaditas de ajo en polvo, 2 cucharaditas de cebolla en polvo, 1 cucharadita colmadas de curry molido, 1 cucharadita de pimentón ahumado y sal y pimienta al gusto, removemos bien, tapamos y metemos en la nevera mínimo 30 minutos.',
      'Mientras que la carne va cogiendo los aromas y sabores de las especias que hemos utilizado cocemos ½ col previamente troceada en una olla con abundante agua y sal durante 10 minutos aproximadamente. Escurrimos y reservamos.',
      'Una vez pasados los 30 minutos (si son más no pasa nada, al contrario) sólo nos queda dorar la carne con 1 cucharada de AOVE en una sartén a fuego medio-alto para que se selle bien y la carne quede jugosa además de sabrosa. Mezclamos la col y la carne y listo, ya tenemos nuestro plato preparado.',
      'Simple y nutritivo, lo que más me gusta hacer en las sesiones de batch cooking 😋',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":382,"protein":29.5,"carbs":14.1,"fat":23.9,"fiber":4.1},
      per100g: {"calories":181,"protein":14,"carbs":6.7,"fat":11.4,"fiber":2},
    },
  },
  {
    id: 'col-con-crema-de-yogur-y-manzana',
    title: 'Col con Crema de Yogur y Manzana',
    category: 'Sopa',
    summary: 'Col con Crema de Yogur y Manzana al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'coles de bruselas congeladas' },
      { id: '2', baseQuantity: null, unit: '', name: 'Sobras de salmón de hacer un caldo de pescado (el día anterior cocí 1 cabeza de salmón y su espina dorsal y la carne que había en ellos la desmenucé y la he utilizado con esta receta, pero es opcional)' },
      { id: '3', baseQuantity: 25, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'ajo en polvo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y pimienta al gusto.' },
    ],
    steps: [
      'En primer lugar llevamos a ebullición agua y sal en una olla. Cuando rompa a hervir echamos las coles de bruselas y cocinamos durante 4 minutos. Escurrimos y reservamos.',
      'Mientras tanto en la misma olla una vez quitada el agua (por no manchar dos recipientes) echamos 25 gr de mantequilla y cuando se derrita agregamos las coles de bruselas, 1 cucharada de ajo en polvo y sal y pimienta al gusto.',
      'Agregamos las sobras del salmón, lo tenemos un par de minutos a fuego medio alto removiendo de vez en cuando y listo, ya tenemos un completo plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 575,
      perServing: {"calories":201,"protein":13.4,"carbs":14.1,"fat":10.3,"fiber":4.5},
      per100g: {"calories":111,"protein":7.4,"carbs":7.8,"fat":5.7,"fiber":2.5},
    },
  },
  {
    id: 'coliflor-al-horno-con-bechamel-de-trufa',
    title: 'Coliflor al Horno con Bechamel de Trufa',
    category: 'Verdura',
    summary: 'Coliflor al Horno con Bechamel de Trufa al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191201_121322-1024x541.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor' },
      { id: '2', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'harina' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '5', baseQuantity: 700, unit: 'ml de', name: 'leche caliente' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'pasta de trufa' },
    ],
    steps: [
      'En primer lugar lavamos y partimos la coliflor en trozos pequeños, aderezamos con 1 cucharada de AOVE y sal y pimienta al gusto y horneamos a 180º durante 45 minutos o esté bien dorada.',
      'Mientras tanto podemos hacer la bechamel: Para ello ponemos en un cazo amplio la harina y la mantequilla y lo tostamos un poco, sin quitarle ojo para que no se queme.',
      'Una vez la harina y la mantequilla se han unido y tostado un poco agregamos la nuez moscada y la leche caliente en 3 veces y dejamos espesar unos minutos removiendo de vez en cuando. Por último añadimos la trufa rallada o pasta de trufa y ya tenemos preparada la salsa.',
      'Nosotros mezclaremos con la coliflor en el momento que vayamos a consumir. Hasta ese momento guardaremos en recipientes separados.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":442,"protein":14.9,"carbs":24.9,"fat":31.9,"fiber":4.9},
      per100g: {"calories":203,"protein":6.8,"carbs":11.5,"fat":14.7,"fiber":2.3},
    },
  },
  {
    id: 'coliflor-en-salsa',
    title: 'Coliflor en Salsa',
    category: 'Verdura',
    summary: 'Coliflor en Salsa al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210207_193855322_resized_20210207_073919808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'champiñones' },
      { id: '4', baseQuantity: 400, unit: 'ml de', name: 'caldo de verduras' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'jengibre seco' },
      { id: '7', baseQuantity: 10, unit: 'gr de', name: 'mantequilla' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'salmón' },
    ],
    steps: [
      'En primer lugar sofreímos un puerro picado en una olla de base ancha, a fuego medio y con 10 gr de mantequilla y 1 cucharada de AOVE. Lo tenemos a fuego medio hasta que empiece a tomar un color dorado.',
      'En ese momento añadimos 250 gr de champiñones troceados como más os guste, removemos y dejamos que doren.',
      'Añadimos entonces 400 gr de lentejas cocidas, 400 ml de caldo de verduras, 4 cucharadas de salsa de soja, ½ cucharadita de jengibre seco (o un trozo rallado de jengibre fresco), y sal y pimienta al gusto y dejamos chup chup durante 15 minutos. Mientras tanto cocinamos a la plancha el salmón.',
      'Reservamos y cuando enfríe desmenuzamos, incorporamos a la olla, removemos y listo, plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2100,
      perServing: {"calories":541,"protein":37.4,"carbs":23.1,"fat":34.5,"fiber":5.5},
      per100g: {"calories":260,"protein":17.9,"carbs":11.1,"fat":16.6,"fiber":2.6},
    },
  },
  {
    id: 'colirroz-estilo-asiatico',
    title: 'Colirroz Estilo Asiático',
    category: 'Verdura',
    summary: 'Colirroz Estilo Asiático al estilo La Vida Bonica.',
    image: 'images/2021_11_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor pequeña' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '3', baseQuantity: 5, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Un trozo (como un dedo pulgar) de jengibre fresco' },
      { id: '5', baseQuantity: 6, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal de hierbas ( https://lavidabonica.com/sal-de-hierbas/ )' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'aceite de sésamo' },
    ],
    steps: [
      'En un wok o sartén de base ancha introducimos 2 cucharadas de AOVE,5 dientes de ajo picados, jengibre fresco rallado (yo he puesto un trozo de unos 4-5 centímetros) y 6 cucharadas de salsa de soja, y mientras se va calentado picamos 2 cebolletas y 1 coliflor pequeña (yo he utilizado la Thermomix, rápido y limpio) Una vez picada la verdura añadimos a la sartén junto con sal (yo he utilizado sal de hierbas) y mezclamos bien para que se impregnen todos los ingredientes, dejamos a fuego medio-alto durante 10 minutos removiendo con frecuencia.',
      'Por último agregamos 1 cucharada de aceite de sésamo, removemos bien y apagamos el fuego. Listo, una forma diferente de tomar coliflor, ¿no os parece?',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":246,"protein":10.3,"carbs":24.9,"fat":12.1,"fiber":4.5},
      per100g: {"calories":117,"protein":4.9,"carbs":11.9,"fat":5.8,"fiber":2.2},
    },
  },
  {
    id: 'contramuslos-de-pollo-con-salsa-de-naranja-y-soja',
    title: 'Contramuslos de Pollo con Salsa de Naranja y Soja',
    category: 'Carne',
    summary: 'Contramuslos de Pollo con Salsa de Naranja y Soja al estilo La Vida Bonica.',
    image: 'images/2020_10_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'contramuslos de pollo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'naranja' },
      { id: '3', baseQuantity: 6, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Salpimentamos la carne y la embadurnamos con la ralladura de la naranja. La incorporamos en una olla de base ancha con 1 cucharada de AOVE y dejamos que se vaya dorando.',
      'Mientras la carne se está sellando hacemos un zumo con la naranja y lo incorporamos a la olla, al tiempo que agregamos 6 cucharadas de salsa de soja y 1 cucharadita de orégano. Una vez que empiece a hervir bajamos el fuego, tapamos y dejamos chup chup a fuego bajo durante 20 minutos.',
      'Si vemos que queda mucho líquido podemos destapar la olla para que evapore caldo y se quede más a nuestro gusto.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":361,"protein":31.9,"carbs":10.3,"fat":20.5,"fiber":2.1},
      per100g: {"calories":180,"protein":15.9,"carbs":5.1,"fat":10.2,"fiber":1.1},
    },
  },
  {
    id: 'contramuslos-de-pollo-en-crema',
    title: 'Contramuslos de Pollo en Crema',
    category: 'Sopa',
    summary: 'Contramuslos de Pollo en Crema al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210207_193855322_resized_20210207_073919808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'contramuslos de pollo' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'coles de bruselas' },
      { id: '3', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 250, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '5', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '7', baseQuantity: null, unit: '', name: 'Tomates cherry para decorar' },
    ],
    steps: [
      'En una sartén de base ancha doramos con 1 cucharada de AOVE 600 gr de contramuslos de pollo, primero a fuego medio-fuerte durante 2 minutos y después bajamos el fuego y los tenemos 5 minutos más. A continuación agregamos 500 gr de coles de bruselas y salteamos a fuego medio durante 2 minutos.',
      'Mientras tanto mezclamos en un bol 250 ml de leche o bebida vegetal, el zumo de ½ limón, 3 dientes de ajo y sal y pimienta al gusto, trituramos bien y añadimos a la sartén donde tenemos las coles de bruselas. Lo tenemos chup chup 9 minutos más y ya tenemos un pollo con rica salsa preparado.',
      'Acompañaremos de arroz cocido',
    ],
    nutrition: {
      totalWeightGrams: 1850,
      perServing: {"calories":444,"protein":37.4,"carbs":14.5,"fat":29.1,"fiber":4.3},
      per100g: {"calories":240,"protein":20.2,"carbs":7.9,"fat":15.7,"fiber":2.3},
    },
  },
  {
    id: 'contramuslos-de-pollo-marinados-con-soja',
    title: 'Contramuslos de Pollo Marinados con Soja',
    category: 'Carne',
    summary: 'Contramuslos de Pollo Marinados con Soja al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190928_184735-1024x593.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 50, unit: 'ml de', name: 'salsa de soja sin azúcar' },
      { id: '2', baseQuantity: 150, unit: 'ml de', name: 'agua' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Albahaca seca, orégano, sal y pimienta' },
      { id: '5', baseQuantity: 250, unit: 'gr de', name: 'patatas pequeñas' },
      { id: '6', baseQuantity: null, unit: '', name: '½ brócoli' },
      { id: '7', baseQuantity: 150, unit: 'gr de', name: 'judías verdes' },
      { id: '8', baseQuantity: 4, unit: '', name: 'contramuslos de pollo' },
    ],
    steps: [
      'En una olla de base ancha ponemos la soja, el agua, los dos dientes de ajo laminados y una cucharadita de albahaca seca, otra de orégano, otra de sal y otra de pimienta. Mezclamos bien, añadimos el pollo y las patatas y encendemos el fuego.',
      'Cuando rompa a hervir lo bajamos y chup chup durante 20 minutos. Incorporamos entonces los ramilletes de brócoli y las judías, chup chup a fuego bajo durante 15 minutos más y listo, receta preparada. MIÉRCOLES: Ensalada y albóndigas de soja texturizada con salsa de pimientos asados',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":321,"protein":29.1,"carbs":10.9,"fat":17.3,"fiber":2.9},
      per100g: {"calories":174,"protein":15.7,"carbs":5.9,"fat":9.3,"fiber":1.6},
    },
  },
  {
    id: 'cookies-brownie-sin-azucar',
    title: 'Cookies Brownie sin Azúcar',
    category: 'Postres',
    summary: 'Cookies Brownie sin Azúcar al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190915_145818-1024x510.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos y lavados' },
      { id: '2', baseQuantity: 10, unit: '', name: 'dátiles' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'cacao en polvo sin azúcar' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'crema de cacahuete, almendras o avellanas' },
      { id: '5', baseQuantity: 8, unit: 'gr de', name: 'levadura tipo “Royal”' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'chocolate puro picado en cuadraditos' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'vainilla líquida' },
      { id: '8', baseQuantity: 50, unit: 'gr de', name: 'harina de garbanzo' },
    ],
    steps: [
      'He intentado hacer fielmente la receta de las famosas cookies de Juan Llorca pero he tenido que añadir harina de garbanzo, pues estaba muy pegajosa.',
      'El resultado nos ha gustado mucho, los peques ya las han probado y han dado su veredicto: Un SÍ con mayúsculas 😊 En primer lugar, hidratamos los dátiles en un poco de agua hasta que se hinchen.',
      'A continuación ponemos en la trituradora los garbanzos con el cacao en polvo, la levadura, la crema de cacahuetes, la vainilla, los dátiles hidratados y la harina de garbanzo. Trituramos bien hasta que quede una masa blandita pero sin que se nos pegue a las manos.',
      'Formamos las galletas con las manos, picamos el chocolate a cuadraditos y lo vamos metiendo en la masa. Por último horneamos las cookies durante 20 minutos a 180ºC con calor arriba y abajo. Dejamos enfriar y listo. Y hasta aquí la sesión de hoy.',
      'Espero que os dé ideas para introducir el batch cooking en vuestra cocina. Ya veréis qué bien sienta tener la nevera y el congelador llenos de buenos alimentos.',
      'Lo más importante es la planificación, saber con anterioridad lo que vamos a cocinar, tener todos los ingredientes en casa y un ratito para encerrarnos en la cocina y disfrutar.',
      'Un saludo grande y hasta la próxima semana Navegación de entradas Anterior Pan integral Siguiente Arroz con salmón Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 770,
      perServing: {"calories":382,"protein":10.9,"carbs":34.5,"fat":22.1,"fiber":6.3},
      per100g: {"calories":368,"protein":10.5,"carbs":33.3,"fat":21.3,"fiber":6.1},
    },
  },
  {
    id: 'costillar-de-cerdo-a-las-finas-hierbas',
    title: 'Costillar de Cerdo a las Finas Hierbas',
    category: 'Carne',
    summary: 'Costillar de Cerdo a las Finas Hierbas al estilo La Vida Bonica.',
    image: 'images/2020_09_IMG_20200912_115454_resized_20200912_064004760.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 900, unit: 'gr de', name: 'costillas de cerdo' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'finas hierbas' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '8', baseQuantity: null, unit: '', name: 'Limón' },
    ],
    steps: [
      'La noche antes preparamos el adobo de la carne. Para ello disponemos las costillas en un recipiente, agregamos una cucharada de AOVE y restregamos bien para que quede toda la carne bien impregnada.',
      'Mezclamos entonces en un bol 1 cucharadita colmada de pimentón (dulce o picante), 1 cucharadita de finas hierbas y sal y pimienta al gusto, removemos bien y esta mezcla la repartimos por todo el costillar, Tapamos el recipiente y a la nevera.',
      'Al día siguiente disponemos la carne en una bandeja para horno y la acompañamos de 4 patatas peladas y cortadas por la mitad, 1 cebolla grande cortada en 3 rodajas gruesas y 2 tomates bien lavados (yo he elegido este acompañamiento pero lo puedes adaptar a vuestro gusto).',
      'Lo podemos aliñar con un trocito pequeño de mantequilla encima de cada trozo y sal y pimienta al gusto. Rociamos la carne, las patatas y las cebollas con el zumo de ½ limón y horneamos a 180º durante 30 minutos, le damos la vuelta a la carne y lo tenemos otros 30 minutos a 200º.',
      'Acompañaremos de una buena ensalada',
    ],
    nutrition: {
      totalWeightGrams: 2400,
      perServing: {"calories":743,"protein":43.8,"carbs":20.5,"fat":53.5,"fiber":3.5},
      per100g: {"calories":304,"protein":17.9,"carbs":8.4,"fat":21.9,"fiber":1.4},
    },
  },
  {
    id: 'crema-de-acelgas-y-zanahorias',
    title: 'Crema de Acelgas y Zanahorias',
    category: 'Sopa',
    summary: 'Crema de Acelgas y Zanahorias al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220326_113033-1024x885.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 8, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar vamos a poner a cocer abundante agua y sal al gusto y mientras ésta se va calentando limpiamos y cortamos en cuartos las alcachofas. Para ello las limpiamos quitando las primeras hojas, que son las de color verde más oscuro, hasta llegar a las que son más blancas y tiernas.',
      'Pelamos también el tallo y lo sumergimos todo en agua y limón o perejil para evitar la oxidación. En el momento en el que el agua de la olla empieza a hervir introducimos las alcachofas y tenemos chup chup a fuego medio durante 15 minutos. Escurrimos y reservamos.',
      'Para terminar con la receta sofreímos en una sartén de base ancha con 1 cucharada de AOVE 8 ajos tiernos limpios y picados. Los tenemos 2 minutos a fuego medio bajo hasta que se doren.',
      'A continuación incorporamos 300 gr de gambas peladas, las alcachofas que hemos cocido, 4 cucharadas de salsa de tomate,1 cucharadita de orégano y sal y pimienta al gusto y tenemos a fuego fuerte durante 1 ó 2 minutos hasta que las gambas se empiezan a dorar.',
      'Bajamos el fuego, incorporamos 1 bola de mozzarella a trocitos, tapamos y dejamos 2 minutos más. Y ya tenemos preparado un primer plato lleno de color, espero que os guste tanto como a nosotros.',
    ],
    nutrition: {
      totalWeightGrams: 1950,
      perServing: {"calories":444,"protein":24.1,"carbs":23.1,"fat":29.5,"fiber":4.5},
      per100g: {"calories":228,"protein":12.4,"carbs":11.9,"fat":15.2,"fiber":2.3},
    },
  },
  {
    id: 'crema-de-alubias-con-acelgas',
    title: 'Crema de Alubias con Acelgas',
    category: 'Sopa',
    summary: 'Crema de Alubias con Acelgas al estilo La Vida Bonica.',
    image: 'images/2020_01_IMG_20200118_171519-1024x592.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '4', baseQuantity: 200, unit: 'gr de', name: 'carne picada (por ti o por tu carnicero de confianza, sabrás lo que estáis comiendo)' },
      { id: '5', baseQuantity: 1, unit: 'lata de', name: 'pequeña de tomate natural triturado (unos 400 gr)' },
      { id: '6', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '7', baseQuantity: 500, unit: 'ml de', name: 'caldo de carne' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '10', baseQuantity: 50, unit: 'gr de', name: 'pan integral duro' },
      { id: '11', baseQuantity: 8, unit: '', name: 'almendras tostadas sin sal' },
      { id: '12', baseQuantity: 1, unit: 'cucharada de', name: 'piñones' },
    ],
    steps: [
      'En primer lugar cocemos en abundante agua 4 huevos (podemos poner más y aprovechar para las ensaladas de la semana o para otra receta que los necesite) durante unos 10 minutos. Dejamos enfriar y reservamos.',
      'En segundo lugar, en una olla ponemos una cucharada de AOVE e incorporamos una cebolla y un diente de ajo, todo ello bien picado.',
      'Cuando empiece a estar transparente añadimos la carne picada, removemos bien y lo dejamos a fuego medio 3 ó 4 minutos, lo suficiente para que la verdura y la carne se doran.',
      'Es el momento ahora de añadir la lata de tomate natural triturado, 1 cucharadita de comino, sal y pimienta al gusto y dejamos chup chup mientras que preparamos la picada.',
      'Para hacer la picada metemos en el vaso de un procesador de alimentos 50 gr de pan integral, 8 almendras tostadas sin sal y una cucharada de piñones. Trituramos bien con un poco de agua y agregamos a la olla, junto con el caldo de carne, y seguimos con el chup chup a fuego bajo 10 minutos.',
      'Cuando ha pasado este tiempo agregamos los garbanzos cocidos y chup chup 10 minutos más. Para terminar la receta desmenuzamos los huevos cocidos y añadimos a la olla, removemos bien y listo! ¿Qué os parece este plato? 😋 JUEVES: Crema de alubias con acelgas y albóndigas al curry con arroz',
    ],
    nutrition: {
      totalWeightGrams: 2150,
      perServing: {"calories":541,"protein":25.9,"carbs":43.9,"fat":29.1,"fiber":8.1},
      per100g: {"calories":260,"protein":12.4,"carbs":21.1,"fat":14,"fiber":3.9},
    },
  },
  {
    id: 'crema-de-calabaza-asada',
    title: 'Crema de Calabaza Asada',
    category: 'Sopa',
    summary: 'Crema de Calabaza Asada al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-2-1024x743.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pollo picado' },
      { id: '2', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo picados' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'perejil picado' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal, pimienta y jengibre seco' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'rasas de harina integral' },
    ],
    steps: [
      'En primer lugar mezclamos en un bol 600 gr de pollo picado, 2 huevos, 2 dientes de ajo picados, 2 cucharadas de perejil picado, 1 cucharadita de jengibre seco, sal y pimienta al gusto y 3 cucharadas rasas de harina integral.',
      'Removemos bien hasta que se integren bien todos los ingredientes y reservamos tapado en el frigo durante unos 30 minutos. Con la mezcla anterior hacemos albóndigas y metemos al horno precalentado a 180º durante 30 minutos. Mientras tanto vamos haciendo la salsa.',
      'Para ello en una olla ponemos 1 cucharada de AOVE y cuando esté caliente incorporamos 1 cebolla previamente picada y dejamos que poche durante 3 minutos a fuego medio y removiendo de vez en cuando.',
      'En el vaso de un procesador de alimentos incorporamos 50 gr de queso roquefort, 70 gr de almendras tostadas, 250 ml de caldo de pollo y sal al gusto. Batimos bien hasta que quede todo bien mezclado y añadimos a la olla donde se está pochando la cebolla.',
      'Dejamos chup chup durante 5 minutos más y ya tenemos la salsa preparada. Cuando las albóndigas se hayan terminado de hornear las podemos meter en la olla con la salsa para que hagan un hervor conjunto.',
      'En mi caso congelaré cada cosa en un recipiente por si la salsa necesita un batido exprés al descongelarse (si se queda grumosa) y haré el hervor conjunto cuando vayamos a comerlas.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":361,"protein":29.5,"carbs":14.1,"fat":20.9,"fiber":3.1},
      per100g: {"calories":204,"protein":16.6,"carbs":8,"fat":11.8,"fiber":1.8},
    },
  },
  {
    id: 'crema-de-calabaza-con-queso-de-rulo-de-cabra',
    title: 'Crema de Calabaza con Queso de Rulo de Cabra',
    category: 'Sopa',
    summary: 'Crema de Calabaza con Queso de Rulo de Cabra al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla grande' },
      { id: '2', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 1, unit: '', name: 'calabaza violina' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) y sal' },
      { id: '5', baseQuantity: null, unit: '', name: 'Agua o caldo de verduras' },
      { id: '6', baseQuantity: 80, unit: 'gr de', name: 'amos de queso de rulo de cabra' },
      { id: '7', baseQuantity: null, unit: '', name: 'Pipas de calabaza' },
    ],
    steps: [
      'A la búsqueda de matices con los que seguir haciendo cada semana nuevos purés me he encontrado con varios, y de todos ellos ha salido esta receta, ya veréis qué rica! Pochamos con una cucharada de AOVE 1 cebolla, 4 zanahoria y 1 calabaza, todo ello pelado y cortado en trozos más bien grandes.',
      'Lo tenemos a fuego medio-alto durante un par de minutos. A continuación añadimos 1 litro de agua o caldo de verduras y sal y chup chup unos 10 minutos a fuego medio bajo hasta que la verdura se cocine lo justo, no queremos dejar más nutrientes en el caldo que en la crema.',
      'En el vaso de un procesador de alimentos incorporamos la verdura cocida y un poco del caldo de cocción y batimos hasta que consigamos una consistencia cremosa, añadiendo caldo si vemos que es necesario. Añadimos entonces el queso de cabra y seguimos batiendo hasta que se integre bien en la crema.',
      'Rectificamos de sal si lo necesita y listo! Ya tenemos otra nutritiva y sabrosa crema de verduras. En el momento de servir añadiremos como topping unas semillas de calabaza.',
    ],
    nutrition: {
      totalWeightGrams: 1300,
      perServing: {"calories":381,"protein":14.1,"carbs":24.5,"fat":24.9,"fiber":4.3},
      per100g: {"calories":191,"protein":7.1,"carbs":12.3,"fat":12.5,"fiber":2.2},
    },
  },
  {
    id: 'crema-de-calabaza-y-zanahoria',
    title: 'Crema de Calabaza y Zanahoria',
    category: 'Sopa',
    summary: 'Crema de Calabaza y Zanahoria al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210612_191647-1024x705.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'calabaza violín' },
      { id: '2', baseQuantity: 3, unit: '', name: 'zanahorias grandes' },
      { id: '3', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), pimienta y sal' },
      { id: '4', baseQuantity: null, unit: '', name: 'Agua' },
      { id: '5', baseQuantity: null, unit: '', name: 'En primer lugar doramos a fuego medio alto con 1 cucharada de AOVE toda la verdura pelada y cortada en trozos grandes' },
      { id: '6', baseQuantity: null, unit: '', name: 'Pasados un par de minutos, que ya ha empezado a dorarse añadimos agua hasta cubrirlas.' },
      { id: '7', baseQuantity: null, unit: '', name: 'Rectificamos de sal y dejamos chup chup 10-12 minutos.' },
      { id: '8', baseQuantity: null, unit: '', name: 'Ya sólo nos queda incorporar la verdura en un procesador de alimentos y batir hasta conseguir la consistencia deseada (reservamos el agua de la cocción y vamos añadiendo conforme vayamos necesitando)' },
      { id: '9', baseQuantity: null, unit: '', name: 'Todo un clásico que en nuestra nevera no puede faltar: Huevos y arroz cocido' },
      { id: '10', baseQuantity: null, unit: '', name: 'Y ya está lista la sesión de esta semana. Y tan lista que la preparé ayer para poder tener el domingo libre e irnos de comida familiar 😃' },
      { id: '11', baseQuantity: null, unit: '', name: 'Como siempre os he dicho el batch cooking es una forma excelente de planificar los menús de una familia pero hay mil formas de ejecutar las sesiones: Desde semanales a quincenales e incluso mensuales; repitiendo menús cada «x» tiempo; los domingos por la mañana o los martes por la tarde… El caso es amoldarlo a nuestra rutina, y en cada casa es diferente.' },
      { id: '12', baseQuantity: null, unit: '', name: 'Hacedle un hueco y ya veréis el ahorro de tiempo, os lo garantizo' },
      { id: '13', baseQuantity: null, unit: '', name: '¡Feliz semana!' },
      { id: '14', baseQuantity: null, unit: '', name: 'Navegación de entradas' },
      { id: '15', baseQuantity: null, unit: '', name: 'Anterior  Sesión de batch cooking de ensaladas con legumbres (y más cosas, que los míos comen como limas)' },
      { id: '16', baseQuantity: null, unit: '', name: 'Siguiente   Sesión de batch cooking para despedirnos de las vacaciones' },
      { id: '17', baseQuantity: null, unit: '', name: 'Deja un comentario Cancelar respuesta' },
      { id: '18', baseQuantity: null, unit: '', name: 'Tu dirección de correo electrónico no será publicada. Los campos obligatorios están marcados con *' },
      { id: '19', baseQuantity: null, unit: '', name: 'Escribe aquí...Nombre*' },
      { id: '20', baseQuantity: null, unit: '', name: 'Correo electrónico*' },
    ],
    steps: [
      'Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":141,"protein":2.5,"carbs":24.9,"fat":4.5,"fiber":4.9},
      per100g: {"calories":67,"protein":1.2,"carbs":12,"fat":2.2,"fiber":2.4},
    },
  },
  {
    id: 'crema-de-champinones-y-mantequilla-de-avellanas',
    title: 'Crema de Champiñones y Mantequilla de Avellanas',
    category: 'Sopa',
    summary: 'Crema de Champiñones y Mantequilla de Avellanas al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191005_184221-1024x564.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones pequeños' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla de avellanas (puedes usar cualquier tipo de mantequilla de fruto seco: de anacardos, de cacahuete…)' },
      { id: '5', baseQuantity: 250, unit: 'ml de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: 250, unit: 'ml de', name: 'leche' },
      { id: '7', baseQuantity: null, unit: '', name: 'Orégano, tomillo y albahaca' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar sofreímos la cebolla y el ajo finamente picados, con una cucharada de AOVE. Cuando estén transparentes incorporamos los champiñones hasta que doren.',
      'A continuación incorporamos ½ cucharadita de orégano, ½ de tomillo y ½ de albahaca, agregamos el caldo de verdura, la leche y la mantequilla de avellanas, salpimentamos y chup chup 15 minutos a fuego bajo.',
      'Resultona, ¿no creéis? No recordé dejar reposar la masa así que estaba muy pegajosa y de forma han quedado más bien feujos. Aunque seguro que no ha afectado al sabor',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":281,"protein":10.9,"carbs":14.5,"fat":19.1,"fiber":2.9},
      per100g: {"calories":143,"protein":5.5,"carbs":7.4,"fat":9.7,"fiber":1.5},
    },
  },
  {
    id: 'crema-de-coliflor-y-calabacin',
    title: 'Crema de Coliflor y Calabacín',
    category: 'Sopa',
    summary: 'Crema de Coliflor y Calabacín al estilo La Vida Bonica.',
    image: 'images/2020_01_IMG_20200111_171232-1024x524.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '2', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 600, unit: 'gr de', name: 'coliflor' },
      { id: '4', baseQuantity: 2, unit: '', name: 'calabacines medianos' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 80, unit: 'gr de', name: 'jamón serrano sin aditivos' },
    ],
    steps: [
      'En primer lugar troceamos la cebolleta, los dientes de ajo y los calabacines y sofreímos en una olla de base ancha con una cucharada de AOVE.',
      'Mientras se está sofriendo esta verdura lavamos la coliflor y cortamos en ramilletes pequeños, incorporamos a la olla, añadimos agua hasta cubrir y salpimentamos al gusto. Chup chup durante 8 minutos o veamos que la verdura está cocida.',
      'Ya sólo nos queda pasarla por un procesador de alimentos para convertirla en crema y a la hora de tomarla acompañar de un poco de jamón serrano sin aditivos. Otra ración doble de esta receta que ha ido directa al congelador.',
    ],
    nutrition: {
      totalWeightGrams: 1280,
      perServing: {"calories":241,"protein":13.4,"carbs":14.1,"fat":16.2,"fiber":6.3},
      per100g: {"calories":188,"protein":10.5,"carbs":11,"fat":12.6,"fiber":4.9},
    },
  },
  {
    id: 'crema-de-espinacas-y-aguacate',
    title: 'Crema de Espinacas y Aguacate',
    category: 'Sopa',
    summary: 'Crema de Espinacas y Aguacate al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'jamón york (más del 90%-95% de carne nos asegura tomar un fiambre de calidad)' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Tras limpiarlos de tierra colocamos los champiñones en una bandeja apta para horno, les quitamos los rabitos y los picamos, así como 60 gr de jamón york con alto contenido de carne (más del 90%, yo utilizo uno de ALDI que lleva un 96%).',
      'Rallamos 50 gr de queso Emmental y mezclamos con el jamón y el champiñón picado. Con esta mezcla rellenamos los champiñones, cubrimos la bandeja con papel de aluminio o papel vegetal y horneamos a 180º durante 30 minutos.',
      'Debería ser suficiente, no conviene cocinar mucho los champiñones para que no suelten mucha agua. Mi horno es grande y lento, seguramente con el tuyo se hagan en menos tiempo, compruébalo.',
    ],
    nutrition: {
      totalWeightGrams: 450,
      perServing: {"calories":143,"protein":8.1,"carbs":6.4,"fat":9.5,"fiber":2.5},
      per100g: {"calories":317,"protein":18,"carbs":14.2,"fat":21.1,"fiber":5.6},
    },
  },
  {
    id: 'crema-de-espinacas-y-ricotta',
    title: 'Crema de Espinacas y Ricotta',
    category: 'Sopa',
    summary: 'Crema de Espinacas y Ricotta al estilo La Vida Bonica.',
    image: 'images/2020_09_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'espinacas frescas' },
      { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'ricota' },
      { id: '4', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Disponemos las espinacas para cocer al vapor durante 5 minutos. Lo podemos hacer con una vaporera o al microondas. Aprovechamos para cocinar también el ajo, al que previamente le hemos quitado la simiente.',
      'Una vez pasados los 5 minutos introducimos la verdura en el vaso de un procesador de alimentos y añadimos 200 gr de ricota, zumo de ½ limón, ½ cucharadita de comino, ½ cucharadita de nuez moscada, 2 cucharadas de AOVE y sal y pimienta al gusto.',
      'Batimos todo hasta que quede una mezcla homogénea y ya tenemos nuestra crema preparada. En nuestro caso nos va a servir para aliñar unas rodajas de pescado, pero también se puede utilizar con patata cocida, o incluso carne a la plancha o pasta hervida.',
      'Como dura varios días en la nevera podemos probar con varias opciones. Aunque no se vea la quinoa cocida está debajo',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: {"calories":186,"protein":13.4,"carbs":8.1,"fat":12.9,"fiber":2.9},
      per100g: {"calories":155,"protein":11.2,"carbs":6.8,"fat":10.8,"fiber":2.4},
    },
  },
  {
    id: 'crema-de-garbanzos-con-setas',
    title: 'Crema de Garbanzos con Setas',
    category: 'Sopa',
    summary: 'Crema de Garbanzos con Setas al estilo La Vida Bonica.',
    image: 'images/2020_02_IMG_20200209_094820-1024x746.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'setas variadas' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebollas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '8', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
    ],
    steps: [
      'Las cremas de legumbres son una buena forma de calentar el cuerpo en invierno, ¿no creéis? Para hacer ésta podemos utilizar garbanzo seco o ya cocido.',
      'Como en una sesión de batch cooking el tiempo que le dedicamos a cada receta es vital utilizaré legumbre ya cocida, que tiene las mismas propiedades que las que aún están secas.',
      'Es muy simple, sólo hemos de poner a cocer en una olla con abundante agua 3 dientes de ajo, 2 zanahorias, 2 cebollas previamente troceadas y un bote de garbanzos cocidos. Llevamos a ebullición y cuando rompa a hervir bajamos el fuego y tenemos 15 minutos.',
      'Una vez que han pasado los 15 minutos y la verdura ya está cocida sólo queda por incorporar ésta y los garbanzos en un vaso de un procesador de alimentos y triturarlo todo muy bien, incorporando agua de esta cocción para darle melosidad así como 1 cucharadita de pimentón, ½ de comino y sal y pimienta al gusto.',
      'Para terminar sólo nos queda saltear las setas laminadas con una cucharada de AOVE en una sartén a fuego medio-alto.',
      'Si no le quitamos ojo y removemos constantemente no tardarán más de 2 minutos en hacerse (yo lo haré en el momento de consumir, mientras la crema se está calentando, pero también lo podemos hacer en la sesión de batch cooking y después calentar todo al mismo tiempo) Listo.',
      'Como no lo vamos a consumir de forma inmediata guardamos la crema en un recipiente y las setas salteadas en otro. Si lo congelamos recordad que el agua de la crema cristalizará y al descongelarse la textura puede quedar grumosa.',
      'Para homogeneizarlo tan sólo hemos de batir de nuevo unos segundos y ya está.',
    ],
    nutrition: {
      totalWeightGrams: 1606,
      perServing: {"calories":322,"protein":17.1,"carbs":34.9,"fat":14.1,"fiber":8.1},
      per100g: {"calories":200,"protein":10.6,"carbs":21.7,"fat":8.8,"fiber":5},
    },
  },
  {
    id: 'crema-de-guisantes-con-curry-y-manzana',
    title: 'Crema de Guisantes con Curry y Manzana',
    category: 'Sopa',
    summary: 'Crema de Guisantes con Curry y Manzana al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'guisantes congelados.' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla tierna.' },
      { id: '4', baseQuantity: 2, unit: '', name: 'manzanas con piel.' },
      { id: '5', baseQuantity: 2, unit: 'cucharaditas de', name: 'curry en polvo' },
      { id: '6', baseQuantity: 1, unit: '', name: 'cm de jengibre fresco.' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
    ],
    steps: [
      'Es una preparación bien sencilla: En una cazuela con agua metemos todos los ingredientes y lo llevamos a ebullición. Bajamos el fuego y chup chup durante 15 min hasta que esté todo bien tierno.',
      'Escurrimos las verduras aunque les dejamos un poco del agua de cocción y lo batimos junto a un par de cucharadas de AOVE. Rectificamos de sal y listo, ya tenemos nuestra crema preparada. A la hora de tomarla le echaremos un poco de queso rallado.',
    ],
    nutrition: {
      totalWeightGrams: 1202,
      perServing: {"calories":201,"protein":5.5,"carbs":30.4,"fat":8.1,"fiber":4.9},
      per100g: {"calories":167,"protein":4.6,"carbs":25.3,"fat":6.8,"fiber":4.1},
    },
  },
  {
    id: 'crema-de-guisantes-y-patatas',
    title: 'Crema de Guisantes y Patatas',
    category: 'Sopa',
    summary: 'Crema de Guisantes y Patatas al estilo La Vida Bonica.',
    image: 'images/2021_08_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'guisantes (yo los he utilizado congelados)' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '4', baseQuantity: null, unit: '', name: 'Agua o caldo de verdura' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de curry' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una olla sofreímos con 2 cucharadas de AOVE 2 cebolletas, peladas y cortadas en trozos homogéneos. Lo tenemos a fuego medio y mientras se doran lavamos, pelamos y cortamos en trozos iguales 2 patatas y las incorporamos a la olla.',
      'Una vez que ha cogido un poco de color añadimos 300 gr de guisamtes, caldo de verdura o agua hasta cubrir, 1 cucharadita de curry, salpimentamos al gusto y dejamos chup chup a fuego medio-bajo hasta que la patata esté cocinada (mejor cortarla en dados no muy grandes para que en 8-10 minutos esté hecha) Una vez que esté hecho incorporamos en el vaso de un procesador de alimentos (reservamos el caldo) la patata, los guisantes y las cebolletas y trituramos muy bien hasta que se quede una consistencia cremosa.',
      'Si vemos que es necesario añadimos caldo de la cocción que teníamos reservado.',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":143,"protein":4.3,"carbs":24.1,"fat":4.1,"fiber":4.1},
      per100g: {"calories":179,"protein":5.4,"carbs":30.1,"fat":5.1,"fiber":5.1},
    },
  },
  {
    id: 'crema-de-judias-verdes',
    title: 'Crema de Judías Verdes',
    category: 'Sopa',
    summary: 'Crema de Judías Verdes al estilo La Vida Bonica.',
    image: 'images/2020_02_IMG_20200201_153742-1024x691.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'kg de', name: 'judías verdes' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Hervir las judías y la cebolla en agua y sal hasta que estén tiernas (trocea la cebolla para que tarde lo mismo que las judías) Escurrimos, echamos en el vaso de un procesador de alimentos y batimos bien.',
      'Incorporamos un chorrito de AOVE, otro de limón, salpimentamos al gusto y listo, crema de verduras preparada.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":55,"protein":2.6,"carbs":10.3,"fat":0.3,"fiber":3.9},
      per100g: {"calories":52,"protein":2.5,"carbs":9.8,"fat":0.3,"fiber":3.7},
    },
  },
  {
    id: 'crema-de-lentejas-con-pavo',
    title: 'Crema de Lentejas con Pavo',
    category: 'Sopa',
    summary: 'Crema de Lentejas con Pavo al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pavo' },
      { id: '3', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '4', baseQuantity: null, unit: '', name: '½  litro de caldo de pollo' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'nata' },
    ],
    steps: [
      'Es una receta muy sencilla pero nos sirve para incrementar el consumo de legumbres de una forma diferente a la habitual. En una sartén con 1 cucharada de AOVE salteamos la pechuga de pavo previamente fileteada y salpimentada.',
      'Cuando esté dorada añadimos la nata y las lentejas y chup chup 2 minutos antes de verter poco a poco el caldo de pollo. Lo dejamos 10 minutos más a fuego flojo, dejamos enfriar, pasamos por la batidora y ya está la crema preparada.',
      'Cuando vayamos a consumir podemos incorporar un poco más de caldo y darle así más cremosidad.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":321,"protein":30.8,"carbs":20.6,"fat":16.2,"fiber":6.3},
      per100g: {"calories":184,"protein":17.7,"carbs":11.8,"fat":9.3,"fiber":3.6},
    },
  },
  {
    id: 'crema-de-lombarda-con-manzana-asada',
    title: 'Crema de Lombarda con Manzana Asada',
    category: 'Sopa',
    summary: 'Crema de Lombarda con Manzana Asada al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201129_173206_resized_20201129_053240299.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '½ lombarda' },
      { id: '2', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'nata fresca' },
      { id: '4', baseQuantity: 15, unit: 'ml de', name: 'vinagre de manzana' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '6', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '7', baseQuantity: 2, unit: '', name: 'manzanas' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'pasas' },
    ],
    steps: [
      'En una olla agregamos 1 cucharada de AOVE y sofreímos 2 puerros y ½ lombarda, todo ello bien troceado. Primero lo tenemos a fuego medio-alto pero enseguida le bajamos el fuego para que no se nos queme. Y lo movemos con una espátula de tanto en tanto.',
      'Cuando han pasado 5 minutos subimos el fuego, añadimos 1 litro de caldo de verduras, removemos bien y dejamos chup chup 7-8 minutos más con fuego medio-bajo.',
      'Mientras la verdura se termina de cocer disponemos en una sartén pequeña 30 gr de mantequilla y cuando se empiece a derretir añadimos 2 manzanas cortadas en dados pequeños y 1 cucharada de pasas bien picadas.',
      'Y lo tenemos a fuego bajo para que las manzanas se vayan caramelizando lentamente, aproximadamente 15 minutos.',
      'Cuando la verdura esté ya hecha la incorporamos en el vaso de un procesador de alimentos, añadimos un poco del agua de cocción, 50 gr de nata fresca o ácida y 15 ml de vinagre de manzana y trituramos bien la mezcla hasta que nos quede una crema.',
      'A la hora de comerla le pondremos de topping la manzana y las pasas caramelizadas.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":186,"protein":2.9,"carbs":24.9,"fat":9.5,"fiber":4.5},
      per100g: {"calories":141,"protein":2.2,"carbs":19,"fat":7.3,"fiber":3.4},
    },
  },
  {
    id: 'crema-de-manzana-y-aguacate',
    title: 'Crema de Manzana y Aguacate',
    category: 'Sopa',
    summary: 'Crema de Manzana y Aguacate al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190928_184735-1024x593.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'manzanas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '3', baseQuantity: null, unit: '', name: 'Zumo de 1 limón' },
      { id: '4', baseQuantity: null, unit: '', name: 'Hojas de menta' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar lavamos, pelamos y cortamos las manzanas y el aguacate. A continuación lo incorporamos todo en el vaso de una batidora, añadimos el zumo de un limón y unas hojas de menta, salpimentamos y batimos bien hasta conseguir una mezcla homogénea.',
      'Para ello podemos utilizar también un poco de AOVE, emulsiona la mezcla. A la hora de servir aliñamos con un poco de AOVE y listo. Muy refrescante, ¿verdad?',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: {"calories":143,"protein":1.4,"carbs":22.1,"fat":8.1,"fiber":4.9},
      per100g: {"calories":143,"protein":1.4,"carbs":22.1,"fat":8.1,"fiber":4.9},
    },
  },
  // --- Batch cooking recipes (batch 3: 70 recipes) ---
  {
    id: 'crema-de-pimientos-asados',
    title: 'Crema de Pimientos Asados',
    category: 'Sopa',
    summary: 'Crema de Pimientos Asados al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220312_122729-1024x852.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pollo entera' },
      { id: '3', baseQuantity: null, unit: '', name: '½ repollo o col' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '9', baseQuantity: 2, unit: '', name: 'yogures griegos' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '11', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '12', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
    ],
    steps: [
      'En primer lugar hemos de marinar la pechuga y dejarla reposar para que se impregne bien con todos los sabores y aromas.',
      'Podemos utilizar las especias que más nos inspiren o que tengamos por caso, en este caso voy a utilizar 1 cucharadita de ajo en polvo, 1 cucharadita de cebolla en polvo, 1 cucharadita de orégano seco, 1 cucharadita de pimentón ahumado y sal y pimienta.',
      'Para adobar la carne primero la troceo como más convenga (en este caso en dados de 2 centímetros aproximadamente), la masajeo con un poco de AOVE y posteriormente le echo las especias y las restriego bien para que no quede ni un trozo sin ellas.',
      'Tapo el recipiente y a la nevera un mínimo de 1 hora, aunque si puede ser más mucho mejor. Mientras la carne se impregna de las especias cocemos en abundante agua hirviendo y sal al gusto 1⁄2 repollo bien picado. En este caso he aprovechado para cocer más repollo y tener un primer plato preparado.',
      'Lo tenemos unos 7-8 minutos a fuego medio. Una vez que la col está cocida, escurrimos y en la misma olla (ya sin la col) incorporamos 1 cucharada de AOVE y sofreímos la carne especiada que teníamos en la nevera.',
      'Lo tenemos a fuego medio y cuando se empiece a dorar añadimos la col escurrida, removemos bien para que se integren bien ambos ingredientes y apagamos el fuego.',
      'Para hacer el aliño tenemos que mezclar 2 yogures griegos con 1 cucharadita de comino, ½ cucharadita de nuez moscada, 1 cucharada de AOVE, sal y el zumo de ½ limón.',
      'Reservamos En un recipiente hermético incorporamos el contenido de la sartén y en otro 400 gr de alubias cocidas y la crema de yogur y llevamos a la nevera hasta que toque comerlo.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":276,"protein":24.9,"carbs":14.9,"fat":16.2,"fiber":4.5},
      per100g: {"calories":173,"protein":15.6,"carbs":9.3,"fat":10.2,"fiber":2.8},
    },
  },
  {
    id: 'crema-de-verduras-asadas',
    title: 'Crema de Verduras Asadas',
    category: 'Sopa',
    summary: 'Crema de Verduras Asadas al estilo La Vida Bonica.',
    image: 'images/2020_06_IMG_20200620_180713-1024x551.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'calabaza' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'tomate' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'zanahoria' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '8', baseQuantity: null, unit: '', name: 'Requesón' },
    ],
    steps: [
      'Disponemos la verdura en una bandeja de horno, cortada en trozos homogéneos (no muy grandes) y aliñada con 2 cucharadas de AOVE, 1 cucharadita de orégano y 1 cucharadita de albahaca.',
      'Horneamos durante 40 minutos a 190º Trituramos añadiendo agua o caldo de verduras para darle un poco de melosidad y listo, ya tenemos nuestra crema preparada. La podemos acompañar con un poco de requesón, ¿qué os parece?',
    ],
    nutrition: {
      totalWeightGrams: 1700,
      perServing: {"calories":186,"protein":4.5,"carbs":25.9,"fat":8.5,"fiber":5.5},
      per100g: {"calories":109,"protein":2.6,"carbs":15.1,"fat":5,"fiber":3.2},
    },
  },
  {
    id: 'crema-de-verduras-con-crema-de-cacahuete',
    title: 'Crema de Verduras con Crema de Cacahuete',
    category: 'Sopa',
    summary: 'Crema de Verduras con Crema de Cacahuete al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191123_130841-1024x566.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: null, unit: '', name: '½ kg de gambas' },
      { id: '3', baseQuantity: null, unit: '', name: '½ kg de calamar o pota (yo he utilizado esta última)' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '7', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino en polvo' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'En primer lugar haremos un fumet con las cabezas y pieles de las gambas. Las llevamos a ebullición junto a 500 ml de agua y 150 ml de vino blanco, esperamos a que evapore el alcohol y lo tenemos a fuego medio unos 10 minutos. Escurrimos bien y nos quedamos con el líquido, desechando las cáscaras.',
      'Reservamos el fumet. A continuación sofreímos la verdura previamente picada en una sartén de base ancha con un poco de AOVE. Cuando haya empezado a dorar agregamos los calamares cortados en anillas y mantenemos a fuego medio durante 10 minutos.',
      'Añadimos entonces la cúrcuma, el pimentón, el comino y el fumet y dejamos chup chup 10 minutos. Ya sólo queda añadir los garbanzos y chup chup otros 10 minutos. Cuando queden 2 minutos añadimos las gambas.',
      'E voilà, otra receta de legumbres preparada JUEVES: Crema de verduras con crema de cacahuete y hamburguesas de quinoa y remolacha. Ración para dos días, congeladas por separado.',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: {"calories":276,"protein":20.8,"carbs":14.5,"fat":18.5,"fiber":4.9},
      per100g: {"calories":179,"protein":13.5,"carbs":9.4,"fat":12,"fiber":3.2},
    },
  },
  {
    id: 'crema-de-zanahorias-con-hinojo',
    title: 'Crema de Zanahorias con Hinojo',
    category: 'Sopa',
    summary: 'Crema de Zanahorias con Hinojo al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201108_103308.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '2', baseQuantity: 10, unit: '', name: 'almendras' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento italiano' },
      { id: '5', baseQuantity: 4, unit: '', name: 'muslos de pollo' },
      { id: '6', baseQuantity: 200, unit: 'gr de', name: 'garbanzos' },
      { id: '7', baseQuantity: 200, unit: 'gr de', name: 'setas' },
      { id: '8', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '10', baseQuantity: 700, unit: 'ml de', name: 'caldo de pollo' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una olla de base ancha incorporamos 1 cucharada de AOVE, 4 dientes de ajo laminados y 10 almendras y sofreímos con cuidado de que no se queme. Para ello es preferible tenerlo a fuego medio y estar pendiente, no nos llevará más de 2 minutos.',
      'Reservamos en un mortero y machacamos junto con 1 cucharadita de pimentón ahumado y un poco de agua. En esa misma olla agregamos 1 cucharada de AOVE y sofreímos 1 pimiento verde italiano bien picado. Dejamos que se dore a temperatura media durante 2-3 minutos y añadimos entonces 4 muslos de pollo.',
      'Mientras que la carne se está sellando troceamos las setas y las patatas en cuartos e incorporamos a la olla junto con 200 gr de garbanzos, 1 cucharadita de tomillo, el majado que teníamos reservado en el mortero, 700 ml de caldo de pollo, salpimentamos al gusto y dejamos chup chup a fuego medio durante 20 minutos.',
      'Y listo, un rico guiso preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2400,
      perServing: {"calories":345,"protein":26.9,"carbs":24.5,"fat":18.9,"fiber":6.1},
      per100g: {"calories":144,"protein":11.3,"carbs":10.2,"fat":7.9,"fiber":2.6},
    },
  },
  {
    id: 'crema-de-zanahorias-y-leche-de-coco',
    title: 'Crema de Zanahorias y Leche de Coco',
    category: 'Sopa',
    summary: 'Crema de Zanahorias y Leche de Coco al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-2-1024x741.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '2', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 8, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 1, unit: '', name: 'trozo de jengibre fresco (de unos 2 centímetros de grosor)' },
      { id: '6', baseQuantity: 600, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '9', baseQuantity: null, unit: '', name: 'Un chorrito de limón' },
    ],
    steps: [
      'En una olla de base ancha incorporamos 20 gr de mantequilla, 2 puerros y 8 zanahorias grandes cortado todo ello en dados. Lo tenemos a fuego medio durante 3 minutos removiendo de vez en cuando hasta que la verdura empiece a dorarse.',
      'A continuación añadimos 2 dientes de ajo y 1 trozo de jengibre de 2 centímetros de grosor, todo ello picado, removemos y dejamos que se saltee de forma conjunta durante 2 minutos.',
      'Es el momento entonces de incorporar 600 ml de caldo de verduras, 200 ml de leche de coco y sal y pimienta al gusto, dejamos chup chup a fuego medio durante 5 minutos más y retiramos del fuego.',
      'En el vaso de un procesador de alimentos disponemos la verdura y el caldo, aunque no lo incorporamos todo al principio sino que reservamos una parte por si no hiciese falta todo para conseguir la textura que más guste en casa.',
      'Y trituramos todo a conciencia hasta que consigamos una crema cuya consistencia nos guste. Podemos incorporar un chorrito de limón, le da un toque muy rico. Y listo, una ya tenemos nuestra crema preparada.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: {"calories":186,"protein":2.9,"carbs":25.5,"fat":10.3,"fiber":4.9},
      per100g: {"calories":133,"protein":2.1,"carbs":18.2,"fat":7.4,"fiber":3.5},
    },
  },
  {
    id: 'curry-de-garbanzos-y-arroz-cocido',
    title: 'Curry de Garbanzos y Arroz Cocido',
    category: 'Legumbres',
    summary: 'Curry de Garbanzos y Arroz Cocido al estilo La Vida Bonica.',
    image: 'images/2022_01_collage-777x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de Garam Masala' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'jengibre picado' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla' },
      { id: '4', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '6', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '7', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '8', baseQuantity: null, unit: '', name: 'Col lombarda' },
      { id: '9', baseQuantity: null, unit: '', name: 'Lima' },
    ],
    steps: [
      'En una sartén ancha cocinamos las especias, el jengibre rallado y el garam masala con la cucharada de mantequilla durante 3 minutos a fuego medio.',
      'Aumentamos la temperatura, incorporamos el tomate natural triturado, la leche de coco y los garbanzos y cuando rompa a hervir bajamos el fuego y chup chup por 15 minutos. Mientras tanto cocemos arroz del tipo que más os guste. Ya tenemos listo nuestro curry de garbanzos.',
      'En el momento de servir acompañaremos del arroz cocido y por encima pondremos col lombarda cortada en juliana (los peques no creo que quieran, pero es lila, es un color chulo, ¿no? Lo intentaremos, como siempre, y que ellos decidan, y escurriremos una lima por encima.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":276,"protein":14.1,"carbs":36.5,"fat":12.9,"fiber":6.9},
      per100g: {"calories":173,"protein":8.9,"carbs":22.9,"fat":8.1,"fiber":4.3},
    },
  },
  {
    id: 'curry-de-lentejas-y-guisantes',
    title: 'Curry de Lentejas y Guisantes',
    category: 'Legumbres',
    summary: 'Curry de Lentejas y Guisantes al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1024x710.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'guisantes' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: '', name: 'pimiento' },
      { id: '6', baseQuantity: 200, unit: 'gr de', name: 'tomate natural triturado' },
      { id: '7', baseQuantity: 400, unit: 'ml de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'curry' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '10', baseQuantity: 0.5, unit: 'cucharadita de', name: 'canela' },
      { id: '11', baseQuantity: 1, unit: 'cucharadita de', name: 'jengibre fresco' },
      { id: '12', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) y sal' },
    ],
    steps: [
      'En una sartén con 1 cucharada de AOVE echamos 1 cebolla, 2 dientes de ajo y 1 pimiento, todo ello troceado, y rehogamos.',
      'A los 2 minutos bajamos el fuego e incorporamos 1 cucharadita de curry, 1 cucharadita de comino, ½ cucharadita de canela y sal al gusto y removemos bien para que no se quemen las especias.',
      'A continuación añadimos 1 cucharadita de jengibre fresco rallado, 200 gr de tomate natural triturado y 400 ml de caldo de verduras y lo dejamos chup chup a fuego lento durante 10 minutos.',
      'Podemos dejar la verdura troceada o triturarla con un procesador de alimentos (yo elegiré esta última opción) Para terminar incorporamos 400 gr de lentejas cocidas y 200 gr de guisantes al sofrito (triturado o entero) y chup chup a fuego bajo unos 5 minutos. Listo.',
      'Sencillo y sabroso, como más nos gusta en casa.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: {"calories":201,"protein":13.4,"carbs":25.9,"fat":8.1,"fiber":6.1},
      per100g: {"calories":143,"protein":9.6,"carbs":18.5,"fat":5.8,"fiber":4.3},
    },
  },
  {
    id: 'curry-de-pescado',
    title: 'Curry de Pescado',
    category: 'Pescado',
    summary: 'Curry de Pescado al estilo La Vida Bonica.',
    image: 'images/2019_03_IMG_20190331_114316-1024x841.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'alcachofas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'pan rallado integral' },
    ],
    steps: [
      'Temporada de alcachofas en el huerto así que toca darles salida con diferentes recetas que aprovecho para enseñaros por aquí por si os animáis a hacerlas.',
      'Comentaros que cuando tengo excedente de verdura (por el huerto o porque pillo una buena oferta) y no voy a consumir pronto la congelo lavada y escaldada o mínimamente cocinada al vapor.',
      'El motivo es inactivar las enzimas, las proteínas que oxidan las verduras cuando entran en contacto con el oxígeno del aire, y que comienzan a trabajar en el mismo momento de recolectarlas.',
      'Como estas enzimas desaparecen al estar sometidas a temperaturas que rozan la ebullición, de esta manera nos aseguramos que la verdura que congelamos se encuentra en óptimas condiciones para su posterior cocción.',
      'Además de todo esto nos viene genial porque adelantamos tiempos de cocinado, ya que la verdura no está cruda cuando la incorporamos a la receta en cuestión. Bueno, vamos a la receta: Lavamos y pelamos las alcachofas y cocemos con agua y sal, si es en olla normal tardará unos 20-25 minutos.',
      'Nosotros lo haremos en olla a presión, que con 10 minutos será suficiente (si puedes cocinar más hazlo y ya las puedes congelar cocinadas, ahorrarás tiempo para las sesiones futuras de batch cooking) Mientras tanto, picamos la cebolla y los ajos tiernos y sofreímos en una sartén de base ancha con dos cucharadas de AOVE.',
      'Bajamos el fuego para que no se pegue y removemos de vez en cuando. Cuando la cebolla y el ajete ya se han sofrito añadimos las alcachofas que previamente hemos cocinado. Salpimentamos y añadimos una cucharada de pan rallado integral.',
      'Mezclamos un par de minutos para que se integren los sabores y ya está, primer plato preparado. LENTEJAS AL CURRY',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":143,"protein":10.5,"carbs":10.3,"fat":6.9,"fiber":3.5},
      per100g: {"calories":143,"protein":10.5,"carbs":10.3,"fat":6.9,"fiber":3.5},
    },
  },
  {
    id: 'cus-cus-con-guisantes-salteados-con-curry-y-coco',
    title: 'Cus Cus con Guisantes Salteados con Curry y Coco',
    category: 'Verdura',
    summary: 'Cus Cus con Guisantes Salteados con Curry y Coco al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211206_135954-1024x762.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'cus cus' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'guisantes (yo los utilizo congelados)' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'curry' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'leche de coco' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'coco rallado' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Cocemos 200 gr de cus cus siguiendo las indicaciones del paquete. Reservamos Ponemos en una sartén de base ancha 2 cucharadas de mantequilla y cuando empiece a licuarse añadimos 1 cucharada de curry en polvo y 1 cucharada de coco rallado.',
      'Agregamos entonces 1 cebolla previamente pelada y picada y sofreímos a fuego medio hasta que empiece a tomar color. Añadimos entonces 400 gr de guisantes tiernos. Yo los utilizo congelados por evitarme desgranarlos, pero puedes usarlos como mejor te convenga.',
      'Subimos un poco el fuego y salteamos con fuego vivo y removiendo de forma constante, para que no se pegue a la sartén. Lo que queremos es que se doren, pero no que se terminen quemando.',
      'Cuando veamos que ya han cogido un poco de color agregamos 100 ml de leche de coco, el cus cus ya cocinado y sal y pimienta al gusto, removemos durante 1 ó 2 minutos a fuego fuerte y apagamos el fuego.Ya tenemos un plato bien sabroso preparado, lo podemos tomar sólo o acompañado.',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: {"calories":241,"protein":8.1,"carbs":34.5,"fat":10.9,"fiber":4.5},
      per100g: {"calories":179,"protein":6,"carbs":25.5,"fat":8.1,"fiber":3.3},
    },
  },
  {
    id: 'dorada-a-la-plancha-con-vinagreta-de-pimientos-asados',
    title: 'Dorada a la Plancha con Vinagreta de Pimientos Asados',
    category: 'Pescado',
    summary: 'Dorada a la Plancha con Vinagreta de Pimientos Asados al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191005_184221-1024x564.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Medio pollo sin piel cortado en trozos' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 2, unit: '', name: 'ramitas de apio' },
      { id: '4', baseQuantity: null, unit: '', name: 'Media cebolla roja' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'judías verdes' },
      { id: '6', baseQuantity: 1, unit: '', name: 'mazorca de maíz' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '8', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '9', baseQuantity: 300, unit: 'ml de', name: 'caldo de pollo' },
      { id: '10', baseQuantity: 2, unit: '', name: 'patatas (yo no le he puesto)' },
      { id: '11', baseQuantity: null, unit: '', name: 'Media manzana' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En una olla de base ancha echamos una cucharada de AOVE y sofreímos la cebolla, la zanahoria y el apio, todo ello finamente picado y a fuego medio-bajo para que no se dore demasiado. Cuando empiece a ponerse transparente añadimos el pollo troceado, que previamente hemos salpimentado.',
      'Lo doramos y cuando esté añadimos las judías verdes troceadas y el maíz cortado en 4 ó 5 trozos. Incorporamos el caldo, el tomillo, el laurel y las patatas cortadas en trozos pequeños. Y chup chup a fuego bajo durante unos 25 minutos.',
      'Pinta bien este guiso,verdad? 😋 MIÉRCOLES: Crema de champiñones con mantequilla de avellanas y falafel con pimientos de piquillo y salsa de yogur',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: {"calories":276,"protein":30.8,"carbs":10.6,"fat":16.2,"fiber":3.9},
      per100g: {"calories":173,"protein":19.4,"carbs":6.7,"fat":10.2,"fiber":2.5},
    },
  },
  {
    id: 'empanada-de-carne',
    title: 'Empanada de Carne',
    category: 'Carne',
    summary: 'Empanada de Carne al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190928_184735-1024x593.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'manzanas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '3', baseQuantity: null, unit: '', name: 'Zumo de 1 limón' },
      { id: '4', baseQuantity: null, unit: '', name: 'Hojas de menta' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar lavamos, pelamos y cortamos las manzanas y el aguacate. A continuación lo incorporamos todo en el vaso de una batidora, añadimos el zumo de un limón y unas hojas de menta, salpimentamos y batimos bien hasta conseguir una mezcla homogénea.',
      'Para ello podemos utilizar también un poco de AOVE, emulsiona la mezcla. A la hora de servir aliñamos con un poco de AOVE y listo. Muy refrescante, ¿verdad?',
    ],
    nutrition: {
      totalWeightGrams: 760,
      perServing: {"calories":191,"protein":2.5,"carbs":24.8,"fat":10.3,"fiber":4.5},
      per100g: {"calories":251,"protein":3.3,"carbs":32.7,"fat":13.6,"fiber":5.9},
    },
  },
  {
    id: 'empanada-de-pollo-y-guisantes',
    title: 'Empanada de Pollo y Guisantes',
    category: 'Carne',
    summary: 'Empanada de Pollo y Guisantes al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210207_193855322_resized_20210207_073919808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 425, unit: 'gr de', name: 'harina integral' },
      { id: '2', baseQuantity: 2, unit: '', name: 'yogures naturales' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 20, unit: 'gr de', name: 'mantequilla a temperatura ambiente' },
      { id: '5', baseQuantity: 10, unit: 'gr de', name: 'levadura seca' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'sal' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '9', baseQuantity: 250, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '10', baseQuantity: 150, unit: 'gr de', name: 'guisantes (yo los uso congelados)' },
      { id: '11', baseQuantity: 150, unit: 'gr de', name: 'mozzarella' },
      { id: '12', baseQuantity: 75, unit: 'gr de', name: 'emmental' },
      { id: '13', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '14', baseQuantity: 1, unit: '', name: 'huevo para pintar' },
      { id: '15', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En un bol ponemos 2 yogures, 1 huevo, 20 gr de mantequilla a temperatura ambiente, 1 cucharadita de sal, 1 cucharadita de orégano, 1 cucharadita de pimentón y removemos bien.',
      'Le añadimos entonces 425 gr de harina tamizada y 10 gr de levadura seca, lo mezclamos todo y dejamos leudar tapada al menos 60 minutos (yo lo he dejado 2 horas) Mientras la masa reposa preparamos el relleno.',
      'Para ello picamos y salteamos 250 gr de pechuga de pollo picada en una sartén con un poco de AOVE.',
      'Dejamos enfriar En un bol rallamos entonces 150 gr de queso mozzarella y 75 gr de queso Emmental, añadimos la carne ya atemperada, 150 gr de guisantes y 3 cucharadas de salsa de tomate, salpimentamos, removemos hasta mezclar bien y reservamos.',
      'Forramos el fondo de un molde apto para horno con mantequilla o AOVE, le sacamos el aire a la masa, partimos en 2 mitades y estiramos con el rodillo hasta hacer 2 formas redondas. Ponemos la primera mitad de la masa sobre la base del molde e incorporamos el relleno.',
      'Cerramos con la otra mitad, pegamos con los dedos y quitamos el exceso de masa si lo hubiese. Sellamos con un tenedor, pincelamos con huevo batido y al horno a 180º durante 30 minutos',
    ],
    nutrition: {
      totalWeightGrams: 1425,
      perServing: {"calories":520,"protein":31.9,"carbs":43.8,"fat":24.5,"fiber":4.3},
      per100g: {"calories":365,"protein":22.5,"carbs":30.8,"fat":17.2,"fiber":3},
    },
  },
  {
    id: 'ensalada-con-bacalao-y-naranja',
    title: 'Ensalada con Bacalao y Naranja',
    category: 'Verdura',
    summary: 'Ensalada con Bacalao y Naranja al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211211_122934-1000x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Verdes varios' },
      { id: '2', baseQuantity: null, unit: '', name: 'Gajos de 3 naranjas' },
      { id: '3', baseQuantity: 25, unit: 'gr de', name: 'piñones' },
      { id: '4', baseQuantity: 4, unit: '', name: 'lomos de bacalao' },
      { id: '5', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen extra (AOVE), sal y vinagre' },
    ],
    steps: [
      'En primer lugar, doramos a fuego medio bajo 25 gr de piñones en una sartén antiadherente. Los vigilamos para retirar del fuego en cuanto veamos que se doran. En esa misma sartén doramos con 1 cucharada de AOVE 4 lomos el bacalao a fuego medio. Reservamos Pelamos y sacamos los gajos de 3 naranjas.',
      'Reservamos. Como la ensalada no la vamos a comer inmediatamente utilizaremos varios recipientes para guardar los diferentes ingredientes, que mezclaremos al momento de consumir: Por un lado, las hojas verdes que más nos inspiren (yo he utilizado hoja de roble) Por otro lado 4 lomos de bacalao salteados y los piñones, y en otro recipiente los gajos de 3 naranjas.',
      'Y a la hora de comer lo unimos todo y añadimos 1 aguacate laminado, 2 cucharadas de pasas, 3 cucharadas de AOVE y sal y vinagre al gusto. Listo, súper ensalada preparada, ahora sólo queda disfrutarla.',
    ],
    nutrition: {
      totalWeightGrams: 820,
      perServing: {"calories":240,"protein":29.8,"carbs":8.3,"fat":12.3,"fiber":2.8},
      per100g: {"calories":293,"protein":36.3,"carbs":10.1,"fat":15,"fiber":3.4},
    },
  },
  {
    id: 'ensalada-con-quinoa-y-espinacas',
    title: 'Ensalada con Quinoa y Espinacas',
    category: 'Verdura',
    summary: 'Ensalada con Quinoa y Espinacas al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211211_122934-1000x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Verdes varios' },
      { id: '2', baseQuantity: null, unit: '', name: 'Gajos de 3 naranjas' },
      { id: '3', baseQuantity: 25, unit: 'gr de', name: 'piñones' },
      { id: '4', baseQuantity: 4, unit: '', name: 'lomos de bacalao' },
      { id: '5', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen extra (AOVE), sal y vinagre' },
    ],
    steps: [
      'En primer lugar, doramos a fuego medio bajo 25 gr de piñones en una sartén antiadherente. Los vigilamos para retirar del fuego en cuanto veamos que se doran. En esa misma sartén doramos con 1 cucharada de AOVE 4 lomos el bacalao a fuego medio. Reservamos Pelamos y sacamos los gajos de 3 naranjas.',
      'Reservamos. Como la ensalada no la vamos a comer inmediatamente utilizaremos varios recipientes para guardar los diferentes ingredientes, que mezclaremos al momento de consumir: Por un lado, las hojas verdes que más nos inspiren (yo he utilizado hoja de roble) Por otro lado 4 lomos de bacalao salteados y los piñones, y en otro recipiente los gajos de 3 naranjas.',
      'Y a la hora de comer lo unimos todo y añadimos 1 aguacate laminado, 2 cucharadas de pasas, 3 cucharadas de AOVE y sal y vinagre al gusto. Listo, súper ensalada preparada, ahora sólo queda disfrutarla.',
    ],
    nutrition: {
      totalWeightGrams: 820,
      perServing: {"calories":240,"protein":29.8,"carbs":8.3,"fat":12.3,"fiber":2.8},
      per100g: {"calories":293,"protein":36.3,"carbs":10.1,"fat":15,"fiber":3.4},
    },
  },
  {
    id: 'ensalada-cremosa-con-uvas-pollo-y-picatostes',
    title: 'Ensalada Cremosa con Uvas, Pollo y Picatostes',
    category: 'Verdura',
    summary: 'Ensalada Cremosa con Uvas, Pollo y Picatostes al estilo La Vida Bonica.',
    image: 'images/2020_03_IMG_20200301_135407.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'rebanadas de', name: 'gruesas de pan integral' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'yogur natural' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca' },
      { id: '5', baseQuantity: 2, unit: '', name: 'pimientos rojos grandes' },
      { id: '6', baseQuantity: 1, unit: '', name: 'lechuga' },
      { id: '7', baseQuantity: 6, unit: '', name: 'cebolletas' },
      { id: '8', baseQuantity: 300, unit: 'gr de', name: 'pollo' },
      { id: '9', baseQuantity: 50, unit: 'gr de', name: 'queso de cabra' },
      { id: '10', baseQuantity: 200, unit: 'gr de', name: 'uvas' },
    ],
    steps: [
      'En primer lugar hemos de asar los pimientos y las cebolletas en el horno durante 40 minutos a 180º. Ya sabéis, porque siempre os lo digo, que aprovechemos la ocasión para hornear algo más y ser más eficientes en cuanto a tiempo y aprovechemos mejor la energía.',
      'En segundo lugar vamos a hacer los picatostes y para ello troceamos en dados las rebanadas de pan integral, disponemos en una bandeja y horneamos durante 15 minutos, removiendo de vez en cuando (así, podemos aprovechar que tenemos los pimientos en el horno para hacer también el pan, ahorramos tiempo y energía) Mientras tenemos el horno haciendo su trabajo podemos continuar preparando la salsa de yogur, para lo cual sólo hemos de mezclar el yogur, el comino y la albahaca junto con una cucharada de AOVE.',
      'Reservamos A continuación doramos con una cucharadita de AOVE el pollo en una sartén y una vez hecho dejamos enfriar y troceamos.',
      'Como la ensalada no la vamos a consumir al momento guardamos en diferentes recipientes los distintos ingredientes para unirlos todos a la hora de comer: en un recipiente troceamos la lechuga y guardamos con papel de cocina para que absorba la humedad. en otro recipiente guardamos los pimientos y las cebolletas horneadas y troceadas en un tercero el pollo ya troceado en un cuarto la salsa de yogur Y a la hora de comer lo unimos todo en el plato y añadimos uva, picatostes y unos trocitos de queso de cabra.',
      'Parece un poco lioso pero sólo es cuestión de organizar los diferentes pasos para que podamos disfrutar de una completa ensalada en 2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":440,"protein":37.5,"carbs":34.5,"fat":20.8,"fiber":4.5},
      per100g: {"calories":369,"protein":31.4,"carbs":29,"fat":17.4,"fiber":3.8},
    },
  },
  {
    id: 'ensalada-de-acelgas-y-quinoa-con-vinagreta',
    title: 'Ensalada de Acelgas y Quinoa con Vinagreta',
    category: 'Verdura',
    summary: 'Ensalada de Acelgas y Quinoa con Vinagreta al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1-1024x798.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'tahini' },
      { id: '3', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de ajo en polvo' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'Aceite de Olvia Virgen Extra (AOVE)' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Para la preparación de esta ensalada necesitamos una olla con agua hirviendo y sal para cocer las acelgas y el kale, previamente picadas, a fuego medio durante 5 minutos. Escurrimos y reservamos.',
      'Otra olla con agua hirviendo (o la misma si no lo haces al mismo tiempo) y agua donde cocer durante 12 minutos 160 gr de quinoa (lo que siempre os digo, aprovechamos la oportunidad para cocer más quinoa y tener un acompañamiento extra preparado con el que llenar nuestra cocina de buenas opciones).',
      'Mientras tanto podemos preparar la vinagreta. Para ello sólo necesitamos mezclar con vigor 6 cucharadas de salsa de soja, 1 cucharadita de tahini, el zumo de ½ limón, 2 cucharadas de AOVE, 1 cucharadita colmada de ajo en polvo y sal y pimienta al gusto. Reservamos.',
      'Y en una sartén grande con 1 cucharada de AOVE salteamos 1 cebolleta previamente picada, a fuego medio durante 3 minutos aproximadamente. Añadimos entonces 100 gr de jamón serrano picado y removemos bien.',
      'Incorporamos entonces la verdura (acelgas y kale) que ya tenemos cocida y subimos el fuego para que se dore bien y pierda el agua que le pueda quedar de la cocción.',
      'Agregamos entonces la vinagreta, removemos de forma consciente durante unos segundos y cuando veamos que todos los ingredientes quedan bien impregnados apagamos el fuego. Y listo.',
      'En el recipiente donde vamos a guardar la ensalada disponemos la quinoa cocida y la verdura salteada con el jamón y la vinagreta, a falta de disfrutar cuando nos toque.',
    ],
    nutrition: {
      totalWeightGrams: 200,
      perServing: {"calories":120,"protein":2.5,"carbs":12.8,"fat":7.5,"fiber":2},
      per100g: {"calories":600,"protein":12.5,"carbs":64,"fat":37.5,"fiber":10},
    },
  },
  {
    id: 'ensalada-de-aguacate-y-gambas',
    title: 'Ensalada de Aguacate y Gambas',
    category: 'Verdura',
    summary: 'Ensalada de Aguacate y Gambas al estilo La Vida Bonica.',
    image: 'images/2019_04_IMG_20190426_220626_resized_20190426_100900215.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'dientes de', name: 'ajo, troceados' },
      { id: '2', baseQuantity: null, unit: '', name: '1/2 cebolla roja, troceada' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo, troceado (yo no tenía y le he puesto 3 alcachofas)' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'concentrado de tomate' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'orégano seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'comino molido' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'sal' },
      { id: '8', baseQuantity: null, unit: '', name: '1/8 cucharadita de cayena' },
      { id: '9', baseQuantity: null, unit: '', name: '1/8 cucharadita de pimienta negra molida' },
      { id: '10', baseQuantity: 4, unit: 'cucharadas de', name: 'pasas (yo no tenía y he puesto 6 higos secos)' },
      { id: '11', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras' },
      { id: '12', baseQuantity: 2, unit: '', name: 'patatas medianas, peladas y troceadas en cubos' },
      { id: '13', baseQuantity: 1, unit: 'bote de', name: 'lentejas cocidas' },
      { id: '14', baseQuantity: 100, unit: 'gr de', name: 'aceitunas verdes sin hueso' },
      { id: '15', baseQuantity: 2, unit: 'cucharadas de', name: 'alcaparras' },
      { id: '16', baseQuantity: null, unit: '', name: 'Cocina las verduras en un poco de' },
      { id: '17', baseQuantity: null, unit: '', name: 'agua o aceite (ajo, cebolla y pimiento) en una sartén profunda, wok u olla a' },
      { id: '18', baseQuantity: null, unit: '', name: 'fuego medio-alto hasta que empiecen a dorarse.' },
      { id: '19', baseQuantity: null, unit: '', name: 'Añade el concentrado de tomate y' },
    ],
    steps: [
      'durante al menos 5 minutos, removiendo de vez en cuando. Echa las pasas (en mi caso los higos troceados), el caldo de verduras y las patatas y cocina a fuego alto hasta que rompa a hervir, luego baja a fuego medio y chup chup unos 20 minutos o hasta que las patatas estén tiernas.',
      'Echa el resto de los ingredientes (lentejas, aceitunas y alcaparras), remueve y cocina 5 minutos a fuego medio.',
      'Y ya está listo para consumir, o en nuestro caso refrigerar hasta que nos toque, ya veréis qué delicia de sabores 😊 En el momento de consumir añadiré más caldo de verduras o agua, para que quede más caldosito, pero eso va en gustos de cada familia, hacedlo como más os guste, pero hacedlo, que está muy sabrosón, sabrosón MARTES: Ensalada de aguacate y gambas y tzatziki griego con carne a la planche ENSALADA DE AGUACATE Y GAMBAS INGREDIENTRES 250 gr gambas peladas Zumo de 1 limón 2 cucharadas de AOVE 1 cucharadita colmada de comino Sal y pimienta al gusto 2 tomates maduros 1 aguacate 1 cebolla dulce 1 lechuga baby PREPARACIÓN Sofreímos las gambas con 1 cucharada de AOVE, troceamos y reservamos en un bol.',
      'Mezclamos el zumo de 1 limón, 1 cucharada de AOVE, 1 cucharadita de comino y sal y pimienta al gusto. Ya tenemos hecha la vinagreta En el bol o recipiente donde hemos',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":380,"protein":20.3,"carbs":24.5,"fat":23.8,"fiber":6.3},
      per100g: {"calories":284,"protein":15.1,"carbs":18.2,"fat":17.8,"fiber":4.7},
    },
  },
  {
    id: 'ensalada-de-alubias-blancas-con-vinagreta-de-mostaza',
    title: 'Ensalada de Alubias Blancas con Vinagreta de Mostaza',
    category: 'Verdura',
    summary: 'Ensalada de Alubias Blancas con Vinagreta de Mostaza al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210607_153431_resized_20210607_103043405.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 2, unit: 'latas de', name: 'atún al natural o con aceite de oliva' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'tomates cherry' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'mostaza' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'miel' },
      { id: '8', baseQuantity: null, unit: '', name: 'Zumo de medio limón' },
      { id: '9', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar cocemos los huevos en agua hirviendo durante 9 minutos, cortamos la cocción con agua fría y reservamos. En un bol amplio disponemos 400 gr de alubias cocidas, 3 zanahorias ralladas, 2 latas de atún al natural o en aceite de oliva y 100 gr de tomates cherry.',
      'Preparamos ahora la vinagreta y para ello incorporamos en un bol 4 cucharadas de AOVE, 1 cucharadita de mostaza, 1 cucharadita de miel, el zumo de medio limón y sal y pimienta al gusto, y removemos vigorosamente para ligar estos ingredientes.',
      'Ya sólo nos queda añadir esta vinagreta por encima de la ensalada así como los huevos que hemos cocido, previamente troceados, y listo, ensalada veraniega preparada.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: {"calories":360,"protein":24.3,"carbs":30.3,"fat":17.3,"fiber":6},
      per100g: {"calories":379,"protein":25.6,"carbs":31.9,"fat":18.2,"fiber":6.3},
    },
  },
  {
    id: 'ensalada-de-alubias-con-cerdo-adobado-y-remolacha',
    title: 'Ensalada de Alubias con Cerdo Adobado y Remolacha',
    category: 'Verdura',
    summary: 'Ensalada de Alubias con Cerdo Adobado y Remolacha al estilo La Vida Bonica.',
    image: 'images/2022_05_IMG_20220522_191620-1024x856.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'remolacha cruda' },
      { id: '3', baseQuantity: 10, unit: '', name: 'rábanos' },
      { id: '4', baseQuantity: 300, unit: 'gr de', name: 'solomillo de cerdo' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'aceite de sésamo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '8', baseQuantity: 1, unit: '', name: 'trozo de 2 centímetros de jengibre rallado' },
      { id: '9', baseQuantity: 1, unit: 'cucharada de', name: 'zumo de limón' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar adobamos 300 gr de solomillo de cerdo troceado en dados de 2 centímetros.',
      'Para ello disponemos los trozos en un bol, agregamos 1 cucharada de aceite de sésamo, 2 cucharadas de salsa de soja, 1 cucharadita de orégano seco, 1 cucharada de zumo de limón, 1 trozo de jengibre rallado y sal y pimienta al gusto, y mezclamos bien para que todos los trozos queden bien impregnados con la mezcla.',
      'Tapamos y reservamos en la nevera un mínimo de 30 minutos. Mientras esperamos que la carne se adoba podemos dejar preparados el resto de ingredientes. Para ello incorporamos 400 gr de alubias cocidas, 1 remolacha cruda cortada en láminas finas y 10 rábanos.',
      'Reservamos Cuando ya hayan pasado al menos 30 minutos sacamos la carne de la nevera y la salteamos en una plancha o sartén a fuego vivo para que quede bien sellada y no pierda su jugo. Al ser trozos pequeños no le quitamos ojo porque se van a hacer enseguida y no queremos que quede seco.',
      'Lo incorporamos a nuestra bol con el resto de la ensalada y listo, platazo lleno de color preparado, a disfrutarlo.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":420,"protein":35.5,"carbs":24.5,"fat":24.5,"fiber":5.8},
      per100g: {"calories":401,"protein":33.9,"carbs":23.4,"fat":23.4,"fiber":5.5},
    },
  },
  {
    id: 'ensalada-de-alubias-con-crema-de-yogur',
    title: 'Ensalada de Alubias con Crema de Yogur',
    category: 'Sopa',
    summary: 'Ensalada de Alubias con Crema de Yogur al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220312_122729-1024x852.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pollo entera' },
      { id: '3', baseQuantity: null, unit: '', name: '½ repollo o col' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '9', baseQuantity: 2, unit: '', name: 'yogures griegos' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '11', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '12', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
    ],
    steps: [
      'En primer lugar hemos de marinar la pechuga y dejarla reposar para que se impregne bien con todos los sabores y aromas.',
      'Podemos utilizar las especias que más nos inspiren o que tengamos por caso, en este caso voy a utilizar 1 cucharadita de ajo en polvo, 1 cucharadita de cebolla en polvo, 1 cucharadita de orégano seco, 1 cucharadita de pimentón ahumado y sal y pimienta.',
      'Para adobar la carne primero la troceo como más convenga (en este caso en dados de 2 centímetros aproximadamente), la masajeo con un poco de AOVE y posteriormente le echo las especias y las restriego bien para que no quede ni un trozo sin ellas.',
      'Tapo el recipiente y a la nevera un mínimo de 1 hora, aunque si puede ser más mucho mejor. Mientras la carne se impregna de las especias cocemos en abundante agua hirviendo y sal al gusto 1⁄2 repollo bien picado. En este caso he aprovechado para cocer más repollo y tener un primer plato preparado.',
      'Lo tenemos unos 7-8 minutos a fuego medio. Una vez que la col está cocida, escurrimos y en la misma olla (ya sin la col) incorporamos 1 cucharada de AOVE y sofreímos la carne especiada que teníamos en la nevera.',
      'Lo tenemos a fuego medio y cuando se empiece a dorar añadimos la col escurrida, removemos bien para que se integren bien ambos ingredientes y apagamos el fuego.',
      'Para hacer el aliño tenemos que mezclar 2 yogures griegos con 1 cucharadita de comino, ½ cucharadita de nuez moscada, 1 cucharada de AOVE, sal y el zumo de ½ limón.',
      'Reservamos En un recipiente hermético incorporamos el contenido de la sartén y en otro 400 gr de alubias cocidas y la crema de yogur y llevamos a la nevera hasta que toque comerlo.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: {"calories":340,"protein":24.8,"carbs":28.8,"fat":16.5,"fiber":5.8},
      per100g: {"calories":359,"protein":26.1,"carbs":30.3,"fat":17.4,"fiber":6.1},
    },
  },
  {
    id: 'ensalada-de-arroz-con-toque-oriental',
    title: 'Ensalada de Arroz con Toque Oriental',
    category: 'Verdura',
    summary: 'Ensalada de Arroz con Toque Oriental al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'trozo pequeño de calabaza' },
      { id: '4', baseQuantity: 1, unit: '', name: 'manojo de ajos tiernos' },
      { id: '5', baseQuantity: 500, unit: 'gr de', name: 'edamames (yo los utilizo congelados)' },
      { id: '6', baseQuantity: null, unit: '', name: '1/2 aguacate' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'vinagre de arroz' },
      { id: '8', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '9', baseQuantity: 1, unit: '', name: 'trozo de jengibre fresco rallado' },
      { id: '10', baseQuantity: null, unit: '', name: 'Un chorro de limón' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer ligar cocemos 200 gr de arroz vaporizado en abundante agua hierviendo y sal (podemos aprovechar para cocer más arroz y tener una guarnición más preparada) durante 15-17 minutos a fuego medio.',
      'Mientras tanto incorporamos 1 cucharada de AOVE en una sartén de base ancha y sofreímos 2 cebolletas troceadas así como 1 manojo de ajos tiernos y 1 trozo de calabaza cortado en trozos pequeños para que se sofría al mismo tiempo. Lo tenemos a fuego bajo y removemos de vez en cuando.',
      'En otra olla cocemos 500 gr de edamames en agua hirviendo y sal durante 4 minutos. Escurrimos y reservamos. Una vez que el arroz está cocido escurrimos e incorporamos a la sartén.',
      'Agregamos también los edamames pelados, 3 cucharadas de salsa de soja, 2 cucharadas de vinagre de arroz, 1 trozo de jengibre fresco rallado y un chorro de limón.',
      'Removemos bien para que se mezclen bien los ingredientes sólidos con los líquidos, añadimos 1/2 aguacate troceado y listo, ya tenemos otra rica opción preparada, espero que os guste. Estos básicos no fallan y ayudan a tener buenas opciones ya listas para ser consumidas.',
      'Y hasta aquí la sesión de hoy, espero que nos alcance hasta el viernes, de todas formas tengo platos en el congelador de otras semanas de los que echar mano si me he quedado corta 😀 Deseo que estas sesiones os sirvan de inspiración para preparar vuestros propios menús.',
      'Ya sabéis que las sesiones de batch cooking son ideales para organizar mejor el tiempo, para comer más sano y variado, para poder tener hobbies, para ir al parque con los peques, para muchas cosas que nos merecemos y que a las que tenemos que buscarle un hueco en nuestras vidas 💪 ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking polivalente: Monte, casa y oficina 💪 Siguiente Sesión de batch cooking otoñal Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":400,"protein":20.5,"carbs":44.8,"fat":16.8,"fiber":5.5},
      per100g: {"calories":381,"protein":19.5,"carbs":42.6,"fat":15.9,"fiber":5.2},
    },
  },
  {
    id: 'ensalada-de-calabaza-asada-y-maiz',
    title: 'Ensalada de Calabaza Asada y Maíz',
    category: 'Verdura',
    summary: 'Ensalada de Calabaza Asada y Maíz al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1024x744.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'calabaza' },
      { id: '2', baseQuantity: 2, unit: 'latas de', name: 'pequeñas de maíz' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 20, unit: '', name: 'tomates cherry' },
      { id: '5', baseQuantity: null, unit: '', name: 'Olivas troceadas' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '7', baseQuantity: 1, unit: '', name: 'chorro de limón' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
    ],
    steps: [
      'Yo al final he asado 1 calabaza entera, troceada y en 2 recipientes, en la publicación os oriento un poco en cuanto a cantidades.',
      'En un recipiente apto para horno disponemos 400 gr de calabaza pelada en dados de 2 centímetros, aliñamos con 2 cucharadas de AOVE, 1 cucharadita de albahaca seca y sal y pimienta al gusto y horneamos durante 35 minutos a 200º.',
      'Cuando hayan pasado 15 minutos (o sea, que queden 20 para terminar de asar la calabaza) abrimos el horno y en la misma bandeja incorporamos el contenido escurrido de 2 latas pequeñas de maíz. Cerramos y dejamos que se termine de asar de forma conjunta.',
      'Mientras tanto pelamos y picamos 1 cebolleta, partimos por la mitad 20 tomates cherry y troceamos unas cuantas aceitunas sin hueso.',
      'Y ya sólo nos queda mezclar bien todos los ingredientes: La calabaza asada con el maíz, 1 cebolleta y los tomates cherry, las aceitunas troceadas y aliñar con una cucharada de AOVE, un chorrito de limón y sal al gusto. Ñam, ñam, ¿no os parece?',
    ],
    nutrition: {
      totalWeightGrams: 650,
      perServing: {"calories":260,"protein":5.5,"carbs":34.5,"fat":12.3,"fiber":5},
      per100g: {"calories":401,"protein":8.5,"carbs":53.1,"fat":19,"fiber":7.7},
    },
  },
  {
    id: 'ensalada-de-col',
    title: 'Ensalada de Col',
    category: 'Verdura',
    summary: 'Ensalada de Col al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'guisantes (yo los uso congelados)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 3, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y 1 cucharadita de comino' },
    ],
    steps: [
      'Salteamos la cebolleta y los ajos tiernos bien picados en una sartén de base ancha con 1 cucharada de AOVE.',
      'Lo tenemos a fuego medio 3 minutos removiendo de vez en cuando tras lo cual añadimos los guisantes (yo los uso congelados muy tiernos), 1 cucharadita de comino y sal y pimienta al gusto y seguimos salteándolo todo a fuego medio 5 minutos más.',
      'Mientras tanto batimos 6 huevos, echamos la verdura que ya tenemos sofrita, mezclamos bien y ya sólo nos queda cuajar la tortilla en la misma sartén que hemos utilizado.',
    ],
    nutrition: {
      totalWeightGrams: 550,
      perServing: {"calories":220,"protein":14.3,"carbs":20.5,"fat":12,"fiber":4.3},
      per100g: {"calories":400,"protein":26,"carbs":37.3,"fat":21.8,"fiber":7.8},
    },
  },
  {
    id: 'ensalada-de-coliflor',
    title: 'Ensalada de Coliflor',
    category: 'Verdura',
    summary: 'Ensalada de Coliflor al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor' },
      { id: '2', baseQuantity: 80, unit: 'gr de', name: 'jamón curado' },
      { id: '3', baseQuantity: null, unit: '', name: 'aceitunas' },
      { id: '4', baseQuantity: 12, unit: '', name: 'ajos tiernos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), pimentón y sal' },
    ],
    steps: [
      'Lavamos y partimos en trozos más bien pequeños la coliflor y la cocemos en abundante agua hirviendo y sal durante 8 minutps. Reservamos Mientras tanto en una sartén con 1 cucharada de AOVE sofreímos 12 ajos tiernos troceados bien menudos.',
      'Cuando estén empezando a coger color añadimos 2 cucharaditas de pimentón, 80 gr de jamón curado, 50 ml de caldo de verduras, mantenemos 1 minuto más al fuego removiendo para que se impregnen bien y apagamos.',
      'Ya sólo nos queda mezclar todos los ingredientes en un recipiente: La coliflor, este sofrito y unas aceitunas. Regamos con 2 cucharadas de AOVE y sal al gusto, removemos bien ya ya tenemos el plato preparado. Sencillo, ¿no os parece?',
    ],
    nutrition: {
      totalWeightGrams: 450,
      perServing: {"calories":180,"protein":11.5,"carbs":8.8,"fat":12,"fiber":3.5},
      per100g: {"calories":400,"protein":25.6,"carbs":19.6,"fat":26.7,"fiber":7.8},
    },
  },
  {
    id: 'ensalada-de-cus-cus',
    title: 'Ensalada de Cus Cus',
    category: 'Verdura',
    summary: 'Ensalada de Cus Cus al estilo La Vida Bonica.',
    image: 'images/2019_06_new-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'arroz basmati' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: null, unit: '', name: '½ pimiento rojo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '6', baseQuantity: 300, unit: 'ml de', name: 'agua' },
      { id: '7', baseQuantity: 4, unit: '', name: 'filetes de pescado blanco' },
      { id: '8', baseQuantity: null, unit: '', name: 'Lima' },
    ],
    steps: [
      'En una olla echamos el arroz basmati, las zanahorias y el pimiento muy picados, 1 cucharadita de sal, la leche de coco y el agua. Llevamos a ebullición, tapamos, bajamos el fuego y chup chup durante 15 minutos.',
      'Mientras tanto, con un poco de AOVE doramos en una plancha o sartén los filetes de merluza. En mi caso, y como en esta sesión de batch cooking voy a hornear salmón, aprovecharé que hay espacio de sobra en el horno y cocinaré en él los 2 pescados al mismo tiempo.',
      'Reservamos Ya está, tenemos las dos partes de la receta preparadas. Si no las vamos a consumir inmediatamente las guardaremos en recipientes herméticos, en uno el arroz y en otro el pescado. Ya sólo faltará unirlas en el momento de comer. Acompañamos con una lima para aderezar.',
      'MARTES: Ensalada de cus cus y salmón al horno con espárragos',
    ],
    nutrition: {
      totalWeightGrams: 700,
      perServing: {"calories":300,"protein":25.5,"carbs":30.5,"fat":14.5,"fiber":3.8},
      per100g: {"calories":429,"protein":36.4,"carbs":43.6,"fat":20.7,"fiber":5.4},
    },
  },
  {
    id: 'ensalada-de-endibia-con-granada',
    title: 'Ensalada de Endibia con Granada',
    category: 'Verdura',
    summary: 'Ensalada de Endibia con Granada al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191019_173700-1-1024x879.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: 'hojas de', name: 'endibia' },
      { id: '2', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 1, unit: 'lata de', name: 'sardinas en aceite de oliva' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'mostaza' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'yogur natural' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y vinagre' },
      { id: '8', baseQuantity: 1, unit: 'gr de', name: 'anada' },
    ],
    steps: [
      'En primer lugar cocemos la patata y el huevo. Aprovechemos el momento para cocer más y tener disponibles para otras recetas. Una vez cocidos y atemperados cortamos en trozos pequeños e introducimos en un bol junto a una lata de sardinas previamente escurridas.',
      'A continuación hacemos la vinagreta mezclando en un bol 1 cucharada de yogur natural, 1 cucharadita de mostaza, 2 cucharadas de AOVE y sal y vinagre al gusto. Removemos bien hasta que se integran todos los ingredientes e incorporamos al recipiente donde tenemos la patata, el huevo y las sardinas.',
      'Ya sólo nos falta desgranar una granada. Sé que hay varias formas pero a mí me gusta partirla con cuidado por la mitad y darle por detrás con el mango de un mortero. Así salen todas las pepitas en un minuto.',
      'Como no lo vamos a consumir de forma inmediata guardamos la granada en un recipiente, las hojas de endibia en otro y la mezcla con la vinagreta en un tercero. Sólo quedará emplatar con más o menos esmero y comerlo 😉',
    ],
    nutrition: {
      totalWeightGrams: 500,
      perServing: {"calories":240,"protein":18.5,"carbs":15.5,"fat":14.5,"fiber":3.5},
      per100g: {"calories":480,"protein":37,"carbs":31,"fat":29,"fiber":7},
    },
  },
  {
    id: 'ensalada-de-fruta-con-crema-dulce-de-yogur',
    title: 'Ensalada de Fruta con Crema Dulce de Yogur',
    category: 'Sopa',
    summary: 'Ensalada de Fruta con Crema Dulce de Yogur al estilo La Vida Bonica.',
    image: 'images/2021_08_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'yogur griego' },
      { id: '2', baseQuantity: 2, unit: 'cucharadas de', name: 'miel' },
      { id: '3', baseQuantity: 1, unit: 'puñado de', name: 'anacardos' },
    ],
    steps: [
      'Es muy simple, sólo hay que lavar y cortar la fruta que vayamos a utilizar, disponerla en un recipiente hermético y rociar con el zumo de ½ limón (actúa de conservante y le da un sabor rico, rico) Para la crema trituramos 1 puñado de anacardos, 2 cucharadas soperas de miel y 1 yogur griego natural (lo podemos sustituir por queso fresco batido, está muy rico también) Y a la hora de comer mezclamos un poco de la crema de yogur con fruta y a disfrutar.',
      'El brócoli se puede hacer con un pelín de agua (unas gotas) en el microondas, a máxima temperatura 4-5 minutos. Y los huevos, si son medianos como los que yo he utilizado, los dejamos en agua hirviendo 9 minutos.',
      'Si son más grandes 10-12 minutos Bueno, pues ya está la sesión de esta semana, fácil, nutritiva y muy rica. Espero con ella daros ideas para vuestras sesiones. ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking llena de color Siguiente Sesión de batch cooking para empezar el cole con mucha energía Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 200,
      perServing: {"calories":140,"protein":5,"carbs":25.5,"fat":5.5,"fiber":2},
      per100g: {"calories":700,"protein":25,"carbs":127.5,"fat":27.5,"fiber":10},
    },
  },
  {
    id: 'ensalada-de-garbanzos-con-pollo-y-queso',
    title: 'Ensalada de Garbanzos con Pollo y Queso',
    category: 'Verdura',
    summary: 'Ensalada de Garbanzos con Pollo y Queso al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210607_153431_resized_20210607_103043405.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'queso semi o tierno' },
      { id: '4', baseQuantity: 2, unit: '', name: 'pepinos' },
      { id: '5', baseQuantity: 1, unit: 'bote de', name: 'maíz' },
      { id: '6', baseQuantity: 2, unit: '', name: 'yogures griegos' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'comino en polvo' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '9', baseQuantity: null, unit: '', name: 'Zumo de medio limón' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar salteamos la pechuga de pollo cortada en dados en una sartén con un poco de AOVE y dejamos que atempere.',
      'Mientras tanto incorporamos en un bol 400 gr de garbanzos cocidos, 60 gr de queso (el que más os guste) cortado en dados pequeños, 2 pepinos pelados y troceados y 1 bote de maíz en conserva.',
      'Mezclamos ahora 2 yogures griegos con 1 cucharadita de comino en polvo, 1 cucharada de semillas de sésamos trituradas con el molinillo o unmortero, 1 cucharada de AOVE, el zumo de medio limón y sal y pimienta al gusto.',
      'Y ya sólo nos queda incorporar la pechuga de pollo que teníamos reservada y esta vinagreta, mezclar bien y guardar en un recipiente hermético en la nevera hasta que no la vayamos a degustar.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: {"calories":380,"protein":29.3,"carbs":26.8,"fat":20.5,"fiber":5.8},
      per100g: {"calories":401,"protein":30.9,"carbs":28.3,"fat":21.6,"fiber":6.1},
    },
  },
  {
    id: 'ensalada-de-garbanzos-y-bacalao',
    title: 'Ensalada de Garbanzos y Bacalao',
    category: 'Verdura',
    summary: 'Ensalada de Garbanzos y Bacalao al estilo La Vida Bonica.',
    image: 'images/2021_05_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lomos de bacalao' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla dulce' },
      { id: '3', baseQuantity: 4, unit: '', name: 'tomates maduros' },
      { id: '4', baseQuantity: 1, unit: 'bote de', name: 'pequeño de alcaparras (yo no tenía y he puesto pepinillos)' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '6', baseQuantity: 2, unit: '', name: 'huevos cocidos' },
      { id: '7', baseQuantity: 1, unit: '', name: 'yogur natural' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Olvida Virgen Extra (AOVE), vinagre, sal y pimienta' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
    ],
    steps: [
      'En una sartén agregamos 1 cucharada de AOVE y doramos a fuego medio 400 gr de lomos de bacalao, y en un cazo con agua hirviendo cocemos durante 10 minutos 2 huevos.',
      'Mientras tanto añadimos en un recipiente que podamos cerrar herméticamente 400 gr de garbanzos cocidos, 4 tomates gordos maduros pelados y picados, 1 cebolla dulce picada y un bote pequeño de alcaparras. ¿Hacemos la vinagreta? Pues bien, para ello incorporamos en un yogur natural 2 cucharadas de AOVE, otras 2 de vinagre, y sal y pimienta al gusto y removemos bien hasta que se queden todos los ingredientes bien mezclados.',
      'Reservamos Una vez que el bacalao esté cocinado lo incorporamos al recipiente junto con los huevos cocidos y troceados. Añadimos también la vinagreta, mezclamos todo muy bien. Y mientras que no lo vayamos a comer lo cerramos bien y a la nevera',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":360,"protein":30.5,"carbs":24.5,"fat":18.5,"fiber":5.5},
      per100g: {"calories":343,"protein":29.1,"carbs":23.4,"fat":17.6,"fiber":5.2},
    },
  },
  {
    id: 'ensalada-de-garbanzos-y-pimientos-asados',
    title: 'Ensalada de Garbanzos y Pimientos Asados',
    category: 'Verdura',
    summary: 'Ensalada de Garbanzos y Pimientos Asados al estilo La Vida Bonica.',
    image: 'images/2021_09_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'lomos de merluza' },
      { id: '2', baseQuantity: 2, unit: 'latas de', name: 'atún al natural' },
      { id: '3', baseQuantity: null, unit: '', name: 'Ajo y cebolla en polvo' },
      { id: '4', baseQuantity: 2, unit: '', name: 'huevos' },
    ],
    steps: [
      'De lo más sencillo, desmenuzamos la merluza en un bol y añadimos el resto de ingredientes. Le podemos echar también un poco de harina integral si viésemos que hace falta porque admita un poco más de espesor la masa. En este caso no ha sido necesario. Yo haré hasta aquí porque voy a congelar la masa.',
      'Cuando las vayamos a consumir sólo habrá que moldearlas y hacerlas en una sartén o plancha con una cucharadita de AOVE un par de minutos por cada lado. Animaos a hacerlas, es otra forma de que los peques tomen pescado y que no sea siempre a la plancha.',
    ],
    nutrition: {
      totalWeightGrams: 700,
      perServing: {"calories":280,"protein":20.5,"carbs":20.8,"fat":14.8,"fiber":4.5},
      per100g: {"calories":400,"protein":29.3,"carbs":29.8,"fat":21.2,"fiber":6.4},
    },
  },
  {
    id: 'ensalada-de-judias-verdes-y-anchoas',
    title: 'Ensalada de Judías Verdes y Anchoas',
    category: 'Verdura',
    summary: 'Ensalada de Judías Verdes y Anchoas al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20181109_215540-1024x561.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'amos de arroz para paella' },
      { id: '2', baseQuantity: 600, unit: 'gr de', name: 'amos de carne de pollo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'bolsa de preparado para paella del Mercadona (está en la zona de los congelados)' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'pimentón rojo' },
      { id: '5', baseQuantity: 150, unit: 'gr de', name: 'amos de tomate triturado' },
      { id: '6', baseQuantity: null, unit: '', name: 'unas hebras de azafrán' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '8', baseQuantity: 800, unit: 'gr de', name: 'agua' },
    ],
    steps: [
      'En este caso he preparado el sofrito, que congelaré en un recipiente apto. El viernes sólo tendremos que tenerlo ya descongelado (ponte una alarma para el jueves y lo metes al frigo) y echar el arroz y el azafrán, con 20 minutos tendréis un rico plato de arroz en vuestra mesa.',
      'Echamos un par de cucharadas de AOVE en el recipiente y lo ponemos a calentar. Cuando esté caliente echamos la carne de pollo previamente troceada y salada. Vamos removiendo para que se vaya dorando por parte iguales y se vaya haciendo también por dentro a fuego medio.',
      'Cuando la carne ya ha ‘cogido color’, echamos la verdura; es decir, la judía y el garrofón. Removemos todo durante un par de minutos y bajamos el fuego. Vamos colocando el contenido en los bordes de la paella dejando un hueco en el centro.',
      'Aquí echamos el tomate triturado y el pimentón para que coja un poco de sabor junto con el resto de ingredientes. Tras un par de minutos subimos el fuego y echamos el agua, para que se haga el caldo. Lo tendremos a fuego medio durante 20 minutos. En este paso he parado.',
      'El viernes continuaremos echando este sofrito en un recipiente al fuego, y cuando el mismo rompa a hervir añadiremos el arroz y el azafrán, tendremos a fuego fuerte 6 minutos y a fuego medio bajo unos 14, en total 20 minutos. Dejaremos reposar mientras nos comemos la ensalada y listo!',
      'EXTRAS: Salteado de setas con garam masala, pan de pita, bizcocho de arándanos y piña colada con chía En esta sesión he añadido la comida de hoy, así que también os la muestro',
    ],
    nutrition: {
      totalWeightGrams: 2250,
      perServing: {"calories":945,"protein":43.8,"carbs":93.1,"fat":41.9,"fiber":6.3},
      per100g: {"calories":420,"protein":19.4,"carbs":41.4,"fat":18.6,"fiber":2.8},
    },
  },
  {
    id: 'ensalada-de-lentejas-con-arroz',
    title: 'Ensalada de Lentejas con Arroz',
    category: 'Verdura',
    summary: 'Ensalada de Lentejas con Arroz al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'arroz' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'langostinos pelados' },
      { id: '4', baseQuantity: 200, unit: 'gr de', name: 'tomates cherry' },
      { id: '5', baseQuantity: 80, unit: 'gr de', name: 'queso curado' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'nueces peladas' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '9', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
    ],
    steps: [
      'En primer lugar cocemos en abundante agua hirviendo con sal 200 gr de arroz durante el tiempo que especifique el paquete. En mi caso he utilizado arroz vaporizado porque nos gusta más la textura que queda para ensalada, se queda más suelto.',
      'Y he cocido el doble para tener otra ración extra que nos llene la cocina de buenas opciones. Mientras que se cuece el arroz preparamos en un recipiente hermético el resto de ingredientes: 400 gr de lentejas cocidas, 200 gr de tomates cherry, 80 gr de queso curado y 40 gr de nueces peladas.',
      'En un bol preparamos la vinagreta: 4 cucharadas de AOVE, 1 cucharadita de comino, zumo de ½ limón, sal y pimienta al gusto y removemos muy bien. Una vez cocido y bien escurrido incorporamos el arroz al recipiente así como la vinagreta, mezclamos bien y listo, sólo queda esperar a que toque comerlo.',
    ],
    nutrition: {
      totalWeightGrams: 1930,
      perServing: {"calories":813,"protein":37.4,"carbs":83.9,"fat":30.8,"fiber":8.1},
      per100g: {"calories":422,"protein":19.4,"carbs":43.5,"fat":16,"fiber":4.2},
    },
  },
  {
    id: 'ensalada-de-lentejas-con-mayonesa-de-aguacate',
    title: 'Ensalada de Lentejas con Mayonesa de Aguacate',
    category: 'Verdura',
    summary: 'Ensalada de Lentejas con Mayonesa de Aguacate al estilo La Vida Bonica.',
    image: 'images/2021_09_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '3', baseQuantity: 2, unit: '', name: 'berenjenas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'tomates secos' },
      { id: '6', baseQuantity: 30, unit: 'gr de', name: 'anacardos' },
      { id: '7', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '8', baseQuantity: 50, unit: 'ml de', name: 'leche animal o vegetal' },
      { id: '9', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Cocemos en abundante agua hirviendo y sal al gusto 200 gr de arroz (yo lo he utilizado vaporizado porque se queda más suelto y nos gusta más esta textura para tomarlo frío, pero puedes usar el que más os guste en casa) Mientras el arroz se está cociendo lavamos 2 berenjenas y las cortamos en dados de 2 cm aproximadamente.',
      'Las disponemos en una bandeja de horno, salpimentamos y horneamos a 190º durante 30 minutos.',
      'Reservamos Para hacer la mayonesa trituramos 1 aguacate, 30 gr de tomates secos, 30 gr de anacardos, 4 cucharadas de AOVE, zumo de ½ limón, sal al gusto, 1 cucharadita de comino, 50 ml de leche vegetal o animal y 100 ml de agua si queremos darle más cremosidad.',
      'Y listo, en un recipiente hermético disponemos en un lado el arroz, escurrido y mezclado con 400 gr de lentejas ya cocidas, y la berenjena asada en el otro, y guardamos en la nevera hasta que lo vayamos a comer.',
      'Para ello lo emplatamos como más nos guste y aliñamos con la mayonesa de aguacate y tomates secos, que le va a dar un sabor muy especial a esta comida.',
    ],
    nutrition: {
      totalWeightGrams: 1730,
      perServing: {"calories":734,"protein":24.9,"carbs":69.1,"fat":34.9,"fiber":9.5},
      per100g: {"calories":383,"protein":13,"carbs":36,"fat":18.2,"fiber":5},
    },
  },
  {
    id: 'ensalada-de-pasta-con-lentejas',
    title: 'Ensalada de Pasta con Lentejas',
    category: 'Verdura',
    summary: 'Ensalada de Pasta con Lentejas al estilo La Vida Bonica.',
    image: 'images/2019_06_IMG_20190623_202556_resized_20190623_083334136.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pepino pequeño' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'pimiento' },
      { id: '5', baseQuantity: 1, unit: 'kg de', name: 'tomates maduros' },
      { id: '6', baseQuantity: 150, unit: 'gr de', name: 'remolacha cocida' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y vinagre de manzana' },
      { id: '8', baseQuantity: null, unit: '', name: 'Agua' },
    ],
    steps: [
      'Tenemos excedente de remolacha en el huerto y he visto varias recetas de gazpacho con este ingrediente, así que me he animado a hacerlo 😊 Utilizaré la Thermomix, aunque puedes usar también cualquier otro procesador de alimentos, pues es batir y listo.',
      'En el vaso del procesador echamos todos los ingredientes sólidos: pepino, cebolla, ajo, pimiento, tomate y remolacha previamente cocida y troceamos 30 segundos en velocidad 5. Incorporamos 30 gramos de vinagre de manzana y 1 cucharadita de sal y programamos 4 minutos velocidad máxima.',
      'Cuando termine añadimos un chorrito de AOVE y mezclamos unos segundos en velocidad 5 Añadimos 250 ml de agua, mezclamos unos segundos y listo, ya está el gazpacho preparado, sólo queda refrigerar para tomar bien fresquito.',
      'Para acompañar, en vez de picatostes tostados lo podemos acompañar de dados de queso fresco o queso tierno.',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: {"calories":541,"protein":20.8,"carbs":63.9,"fat":16.1,"fiber":7.3},
      per100g: {"calories":233,"protein":9,"carbs":27.6,"fat":7,"fiber":3.2},
    },
  },
  {
    id: 'ensalada-de-pasta-de-lentejas-y-langostinos-con-pesto-de-albahaca',
    title: 'Ensalada de Pasta de Lentejas y Langostinos con Pesto de Albahaca',
    category: 'Verdura',
    summary: 'Ensalada de Pasta de Lentejas y Langostinos con Pesto de Albahaca al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210612_191647-1024x705.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'pasta (yo he utilizado espirales de lentejas)' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'langostinos' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'tomates cherry (yo no tenía tantos y he puesto un par de tomates raf)' },
      { id: '4', baseQuantity: 1, unit: '', name: 'ramillete de albahaca fresca' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano' },
      { id: '6', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'piñones' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) , sal y pimienta' },
    ],
    steps: [
      'Ponemos la pasta a hervir el tiempo que especifique en el paquete (yo he utilizado pasta de lentejas rojas de GUTBio de ALDI y nos han encantado) y mientras tanto vamos preparando el pesto.',
      'Para ello sólo hemos de triturar 1 ramillete de albahaca fresca, 50 gr de parmesano, 1 cucharada de piñones, AOVE, sal y pimienta al gusto hasta que tenga la consistencia que más nos guste (yo le he añadido unos 50 ml de agua para evitar echarle más aceite) Reservamos Nos queda preparar los diferentes elementos que nos van a acompañar esta ensalada de pasta: En cuanto a los langostinos, si los compramos ya cocidos este paso nos lo evitamos y sólo nos queda pelarlos.',
      'Añadimos unos tomates cherry, la pasta que ya tendremos cocida y escurrida y el pesto. Removemos bien y a la nevera en un recipiente hermético hasta que le hinquemos el diente La foto no le hace justicia, pero a ver quién sabe sacarle el lado más fotogénico a un revuelto… yo no 😅',
    ],
    nutrition: {
      totalWeightGrams: 2150,
      perServing: {"calories":944,"protein":43.8,"carbs":63.1,"fat":43.9,"fiber":6.1},
      per100g: {"calories":439,"protein":20.4,"carbs":29.4,"fat":20.5,"fiber":2.9},
    },
  },
  {
    id: 'ensalada-de-patata-y-naranja',
    title: 'Ensalada de Patata y Naranja',
    category: 'Verdura',
    summary: 'Ensalada de Patata y Naranja al estilo La Vida Bonica.',
    image: 'images/2020_03_IMG_20200301_135407.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'rebanadas de', name: 'gruesas de pan integral' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'yogur natural' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca' },
      { id: '5', baseQuantity: 2, unit: '', name: 'pimientos rojos grandes' },
      { id: '6', baseQuantity: 1, unit: '', name: 'lechuga' },
      { id: '7', baseQuantity: 6, unit: '', name: 'cebolletas' },
      { id: '8', baseQuantity: 300, unit: 'gr de', name: 'pollo' },
      { id: '9', baseQuantity: 50, unit: 'gr de', name: 'queso de cabra' },
      { id: '10', baseQuantity: 200, unit: 'gr de', name: 'uvas' },
    ],
    steps: [
      'En primer lugar hemos de asar los pimientos y las cebolletas en el horno durante 40 minutos a 180º. Ya sabéis, porque siempre os lo digo, que aprovechemos la ocasión para hornear algo más y ser más eficientes en cuanto a tiempo y aprovechemos mejor la energía.',
      'En segundo lugar vamos a hacer los picatostes y para ello troceamos en dados las rebanadas de pan integral, disponemos en una bandeja y horneamos durante 15 minutos, removiendo de vez en cuando (así, podemos aprovechar que tenemos los pimientos en el horno para hacer también el pan, ahorramos tiempo y energía) Mientras tenemos el horno haciendo su trabajo podemos continuar preparando la salsa de yogur, para lo cual sólo hemos de mezclar el yogur, el comino y la albahaca junto con una cucharada de AOVE.',
      'Reservamos A continuación doramos con una cucharadita de AOVE el pollo en una sartén y una vez hecho dejamos enfriar y troceamos.',
      'Como la ensalada no la vamos a consumir al momento guardamos en diferentes recipientes los distintos ingredientes para unirlos todos a la hora de comer: en un recipiente troceamos la lechuga y guardamos con papel de cocina para que absorba la humedad. en otro recipiente guardamos los pimientos y las cebolletas horneadas y troceadas en un tercero el pollo ya troceado en un cuarto la salsa de yogur Y a la hora de comer lo unimos todo en el plato y añadimos uva, picatostes y unos trocitos de queso de cabra.',
      'Parece un poco lioso pero sólo es cuestión de organizar los diferentes pasos para que podamos disfrutar de una completa ensalada en 2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1850,
      perServing: {"calories":761,"protein":34.4,"carbs":74.9,"fat":29.5,"fiber":6.5},
      per100g: {"calories":369,"protein":16.7,"carbs":36.4,"fat":14.3,"fiber":3.2},
    },
  },
  {
    id: 'ensalada-de-patatas-alemana',
    title: 'Ensalada de Patatas Alemana',
    category: 'Verdura',
    summary: 'Ensalada de Patatas Alemana al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 5, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'pepinillos agridulces' },
      { id: '3', baseQuantity: 200, unit: 'ml de', name: 'caldo de pollo' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'mayonesa casera' },
      { id: '5', baseQuantity: 2, unit: 'cucharaditas de', name: 'ajo en polvo' },
      { id: '6', baseQuantity: null, unit: '', name: 'Cebollino' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal' },
    ],
    steps: [
      'En una olla con abundante agua y sal al gusto cocemos 5 patatas medianas, bien lavadas y sin pelar.',
      'El tiempo dependerá del tamaño de la patata, para saber el tiempo podemos pinchar con un palillo y ver que el centro de la patata ya está hecho (si está un pelín duro no pasa nada porque se va a seguir cocinando una vez las saquemos de la olla).',
      'Yo he utilizado una olla rápida y el tiempo que he utilizado ha sido de 20 minutos. Reservamos En un cazo calentamos 200 ml de caldo de pollo y antes de que hierva le añadimos 4 cucharadas de mayonesa y removemos con unas varillas hasta que ligue.',
      'Reservamos Una vez atemperadas las patatas las pelamos y cortamos en dados pequeños, añadimos 50 gr de pepinillos bien picados y 2 cucharaditas de ajo en polvo, así como la mezcla del caldo y mayonesa y removemos bien para que todos los ingredientes se liguen bien (podemos para ello utilizar una olla, introducimos toda la mezcla, la tapamos, cogemos de las asas y le damos unos “meneos” sujetando bien la tapadera para que no se pueda derramar) Para terminar, incorporamos cebollino picado por encima y ya tenemos un rico acompañamiento preparado.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":541,"protein":20.8,"carbs":43.9,"fat":26.1,"fiber":4.5},
      per100g: {"calories":289,"protein":11.1,"carbs":23.4,"fat":14,"fiber":2.4},
    },
  },
  {
    id: 'ensalada-de-pimientos-y-bacalao',
    title: 'Ensalada de Pimientos y Bacalao',
    category: 'Verdura',
    summary: 'Ensalada de Pimientos y Bacalao al estilo La Vida Bonica.',
    image: 'images/2019_05_IMG_20190504_141225_resized_20190505_093153048.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '1/2 kg carne de cerdo picada' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'tocino fresco picada' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'salchicha blanca picada' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'piñones' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Canela molida' },
      { id: '7', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Perejil' },
      { id: '9', baseQuantity: null, unit: '', name: '1/2 limón' },
      { id: '10', baseQuantity: 100, unit: 'gr de', name: 'molla de pan integral' },
      { id: '11', baseQuantity: 1, unit: '', name: 'chorro leche' },
      { id: '12', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '13', baseQuantity: null, unit: '', name: 'Lo primero que haremos serán las albóndigas, esta receta es' },
      { id: '14', baseQuantity: null, unit: '', name: 'inspiración de las típicas pelotas murcianas.' },
      { id: '15', baseQuantity: null, unit: '', name: 'Ponemos en un bol la miga de pan con el chorro de leche.' },
      { id: '16', baseQuantity: null, unit: '', name: 'Reservamos' },
      { id: '17', baseQuantity: null, unit: '', name: 'En otro bol ponemos el resto de los ingredientes: la carne, el' },
      { id: '18', baseQuantity: null, unit: '', name: 'tocino, la salchicha (todo ello picado, yo se lo pido al carnicero), los' },
      { id: '19', baseQuantity: null, unit: '', name: 'piñones tal cual, el ajo y el perejil picadito, sal y pimienta al gusto, un' },
      { id: '20', baseQuantity: null, unit: '', name: 'puntito de canela molida y el zumo de medio limón. Mezclamos bien.' },
    ],
    steps: [
      'hidratada en leche, terminamos de mezclar bien y metemos un ratito al frigorífico. Mientras tanto podemos preparar el guiso, que es lo más fácil del mundo: ¿Ves la lista de ingredientes? Pues nada, todos a la olla a presión. No hay más historia.',
      'Una vez que la olla esté cerrada y rompa a hervir le bajamos el fuego y chup chup unos 20 minutos. Cuando termine abrimos la olla, echamos el caldo en otra y vamos haciendo pelotas y metiendo en este caldo y cocinando a fuego medio unos 15 minutos.',
      'En mi caso he preferido no meter las pelotas en la olla desde un principio porque estaba ya muy llena y no quería que perdieran la forma, pero si tú te apañas, adelante. Y ya está, ya veréis qué rico, rico, los peques se lo comen que da gusto 😊.',
      'He hecho de más para que sobre para sopa y para ropa vieja.',
      'MARTES: Ensalada y marmitako MARMITAKO INGREDIENTES 500 gr bonito 600 gr patata 1 cebolla 2 tomates 1 pimiento Una cucharadita colmada de pimentón Perejil picado Sal y pimienta 1 l de caldo de pescado PREPARACIÓN Rehogamos en una olla con una cucharada de AOVE el pimiento, los tomates y la cebolla bien picados, a fuego medio bajo y removiendo de vez en cuando, aproximadamente 10 minutos.',
      'Cuando estén pochados añadimos el pimentón y el caldo de pescado y subimos el fuego para que rompa a hervir. Cuando ello ocurra incorporamos las patatas partidas en trozos grandes (si las cascamos con un cuchillo y rompemos',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":944,"protein":43.4,"carbs":43.1,"fat":43.9,"fiber":4.1},
      per100g: {"calories":454,"protein":20.9,"carbs":20.8,"fat":21.1,"fiber":2},
    },
  },
  {
    id: 'ensalada-de-remolacha-asada',
    title: 'Ensalada de Remolacha Asada',
    category: 'Verdura',
    summary: 'Ensalada de Remolacha Asada al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'remolachas enteras' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: null, unit: '', name: 'Un puñado de nueces' },
      { id: '4', baseQuantity: 2, unit: '', name: 'naranjas' },
      { id: '5', baseQuantity: null, unit: '', name: 'Hojas verdes' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y vinagre' },
    ],
    steps: [
      'Vamos a preparar una ensalada invernal con productos típicos de esta época del año, como remolacha y naranjas. Mucho me temo que nos la comeremos mi marido y yo, mis hijos no querrán ni probarla. Realmente no me preocupa, lo importante es que coman verdura.',
      'Lo que siempre os digo es que les demos a elegir opciones, todas ellas saludables, y que ellos decidan qué tomar. Así ellos se sienten importantes porque ven que deciden qué comen y nosotros nos sentimos tranquilos porque sabemos que se están alimentando de forma correcta.',
      'La preparación no tiene mucha historia: Lavamos bien las remolachas, pelamos la cebolla y envolvemos en papel vegetal o de aluminio cada pieza de forma individual. Y al horno a 190º durante 45 minutos.',
      'En esta sesión aprovecharemos para asar unos muslos de pavo al estilo cajún, así ahorramos energía y tiempo 😊 Pelamos las nueces y desgajamos las naranjas. Reservamos Cuando tengamos la verdura asada y esté atemperada la troceamos.',
      'Y ya sólo nos queda guardar en recipientes herméticos diferentes y unir en el momento que vayamos a consumir.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":401,"protein":14.1,"carbs":44.9,"fat":16.5,"fiber":6.9},
      per100g: {"calories":194,"protein":6.8,"carbs":21.7,"fat":8,"fiber":3.3},
    },
  },
  {
    id: 'ensalada-verde-de-quinoa',
    title: 'Ensalada Verde de Quinoa',
    category: 'Verdura',
    summary: 'Ensalada Verde de Quinoa al estilo La Vida Bonica.',
    image: 'images/2021_08_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '3', baseQuantity: 2, unit: '', name: 'pepinos' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'aceitunas verdes' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra, vinagre y sal' },
    ],
    steps: [
      'Muchas veces da pereza preparar una ensalada que tomar como primer plato o acompañamiento de principal, así que en las sesiones de batch cooking podemos aprovechar para hacer 2 ó 3 tipos y así no hay excusa para comer verde.',
      'Ésta que traigo es muy sencilla pero no por ello menos apetecible, a ver qué os parece: En primer lugar ponemos a cocer en abundante agua hirviendo y sal al gusto 200 gr de quinoa previamente lavada y la dejamos cocer a fuego medio 12 minutos.',
      'Mientras tanto preparamos el resto de los ingredientes para la ensalada: 1 aguacate y 2 pepinos pelados y cortados en cuadrados y 100 gr de aceitunas verdes. Y ya sólo nos queda escurrir la quinoa y disponerla en un recipiente hermético con el resto de ingredientes.',
      'A la hora de comer la aliñamos y a disfrutar 😀',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: {"calories":469,"protein":18.4,"carbs":43.1,"fat":23.9,"fiber":6.3},
      per100g: {"calories":278,"protein":10.9,"carbs":25.6,"fat":14.2,"fiber":3.7},
    },
  },
  {
    id: 'ensaladilla-con-mayonesa-de-aguacate',
    title: 'Ensaladilla con Mayonesa de Aguacate',
    category: 'Verdura',
    summary: 'Ensaladilla con Mayonesa de Aguacate al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190922_144306-1024x532.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '2', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'guisantes congelados' },
      { id: '4', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: 3, unit: 'latas de', name: 'atún al natural o en aceite de oliva' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'amos de pepinillos o encurtidos' },
    ],
    steps: [
      'En primer lugar pelamos y troceamos en dados las patatas y las zanahorias y las introducimos en una olla con agua. Tapamos, llevamos a ebullición, bajamos el fuego y chup chup durante 10 minutos. En segundo lugar añadimos los guisantes y seguimos cociendo durante 5 minutos más.',
      'Escurrimos y reservamos para que se vaya atemperando.',
      'Los huevos los podemos cocer al microondas: Cascamos un huevo, lo introducimos en un bol, echamos agua hasta que lo cubra y programamos el microondas a máxima potencia durante 2 minutos (incluso con 1:30 será suficiente, lo podéis comprobar y ajustar a vuestro electrodoméstico) Ya está.',
      'A continuación echamos la verdura y la patata ya cocidas y los huevos previamente picados en un bol. Añadimos entonces las 3 latas de atún desmigadas así como los pepinillos previamente picados o los encurtidos en el caso de que utilicemos estos últimos. Ahora sólo queda hacer la mayonesa.',
      'Para ello introducimos todos los ingredientes en el vaso del procesador de alimentos y batimos todo bien hasta que liguen los ingredientes. Ya sólo falta añadir esta mayonesa con el resto de ingredientes, remover bien y listo, ya tenemos una rica y nutritiva ensaladilla preparada.',
      'Cuando las vayamos a consumir les daremos forma.',
    ],
    nutrition: {
      totalWeightGrams: 1650,
      perServing: {"calories":734,"protein":24.5,"carbs":63.1,"fat":30.9,"fiber":6.1},
      per100g: {"calories":353,"protein":11.8,"carbs":30.3,"fat":14.8,"fiber":2.9},
    },
  },
  {
    id: 'ensaladilla-de-coliflor',
    title: 'Ensaladilla de Coliflor',
    category: 'Verdura',
    summary: 'Ensaladilla de Coliflor al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'ml de', name: 'leche' },
      { id: '2', baseQuantity: null, unit: '', name: 'zumo de medio limón' },
      { id: '3', baseQuantity: null, unit: '', name: 'Sal' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
    ],
    steps: [
      'En primer lugar, cortamos la coliflor en trozos pequeños y la cocemos en agua hirviendo. A los 4 minutos de cocción añadimos 300 gr de guisantes muy tiernos y seguimos 4 minutos más con la cocción. Escurrimos y reservamos Mientras tanto hacemos la mayonesa casera.',
      'Para ello incorporamos 100 ml de leche en el vaso de la batidora, el zumo de medio limón y sal al gusto. Metemos el brazo de la batidora, apoyamos en el fondo y empezamos a batir. Para hacer la emulsión que nos va a crear la mayonesa necesitamos un aceite.',
      'Yo he utilizado AOVE, sale más fuerte de sabor, pero nosotros ya tenemos el paladar acostumbrado (además por el hecho de tener más sabor que la mayonesa que se hace con aceite de girasol utilizamos menos cantidad) Yo no os puedo decir cuál es el secreto para que no se corte.',
      'Lo que sí os puedo decir es lo que yo he hecho: He ido echando el aceite poco a poco, sin prisa pero sin pausa y con el brazo de la batidora en el fondo del vaso. Y ya está, al cabo de 1 ó 2 minutos tenía la emulsión hecha, he continuado batiendo un minuto más y he parado.',
      'Ya sólo nos queda agregar todos los ingredientes en un bol: La coliflor, los guisantes, las aceitunas, las 2 latas de atún y la mayonesa. Mezclamos bien y listo, ya tenemos la ensaladilla preparada.',
    ],
    nutrition: {
      totalWeightGrams: 200,
      perServing: {"calories":94,"protein":4.5,"carbs":6.3,"fat":4.5,"fiber":2.5},
      per100g: {"calories":470,"protein":22.5,"carbs":31.5,"fat":22.5,"fiber":12.5},
    },
  },
  {
    id: 'espaguetis-con-pesto-de-guisantes',
    title: 'Espaguetis con Pesto de Guisantes',
    category: 'Hidratos',
    summary: 'Espaguetis con Pesto de Guisantes al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210207_193855322_resized_20210207_073919808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'guisantes frescos (yo he usado una bolsa de guisantes muy tiernos de Mercadona)' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'espaguetis' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'dados de pechuga de pollo (esta vez he utilizado carne picada)' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'pistachos' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano rallado' },
      { id: '6', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '7', baseQuantity: 4, unit: 'hojas de', name: 'albahaca fresca' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Llevamos a ebullición agua y sal en una olla, metemos los guisantes, bajamos el fuego y mantenemos durante 4 minutos. Retiramos del fuego si ya están tiernos.',
      'Metemos en un procesador de alimentos y agregamos las hojas de albahaca, los pistachos, el ajo (yo le quito la simiente de dentro para que no repita), 50 gr de queso parmesano y 3 cucharadas de AOVE. Batimos bien hasta obtener una crema, aunque no es necesario que quede fina, fina.',
      'Reservamos Salteamos en una sartén la carne que vayamos a utilizar de acompañamiento y reservamos. Mientras tanto cocemos los espaguetis y cuando estén “al dente” los escurrimos reservando un vaso de esta agua de cocción.',
      'Volvemos a poner la pasta en la olla, sin agua, incorporamos el pesto de guisantes y medio vaso de agua de cocción. Lo mezclamos todo muy bien y ya tenemos la receta preparada. En mi caso he hecho el pesto que voy a congelar.',
      'El día que lo utilicemos sólo tendremos que cocer la pasta y añadir el pesto y la carne. Lo solemos tomar como aderezo de nuestras ensaladas',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: {"calories":734,"protein":34.9,"carbs":63.9,"fat":29.1,"fiber":6.5},
      per100g: {"calories":383,"protein":18.2,"carbs":33.3,"fat":15.1,"fiber":3.4},
    },
  },
  {
    id: 'estofado-de-patatas-con-setas',
    title: 'Estofado de Patatas con Setas',
    category: 'Verdura',
    summary: 'Estofado de Patatas con Setas al estilo La Vida Bonica.',
    image: 'images/2020_11_RBC-e1665940576600.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'contramuslos de pollo' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'arroz de grano largo' },
      { id: '3', baseQuantity: 1, unit: 'litro de', name: 'caldo de pollo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '6', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de ajo en polvo' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de comino' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de pimentón ahumado' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta al gusto (yo he utilizado sal de hierbas: https://lavidabonica.com/sal-de-hierbas/ )' },
    ],
    steps: [
      'Precalentamos el horno a 190º, y mientras va cogiendo temperatura mezclamos en un bol el ajo en polvo, el comino, el pimentón ahumado y sal y pimienta al gusto. Removemos y reservamos.',
      'A continuación cortamos en tiras una cebolla, un pimiento rojo y un pimiento verde y mezclamos con las especias que teníamos reservadas.',
      'En una fuente apta para horno (yo he utilizado 2 más pequeñas) incorporamos las verduras adobadas, 6 contramuslos de pollo, 200 gr de arroz de grano largo, 1 litro de caldo de pollo y salpimentamos al gusto.',
      'Tapamos con papel de aluminio o una tapadera apta y lo horneamos durante 45 minutos a 190º, destapamos y dejamos 10 minutos más a 220º. Listo',
    ],
    nutrition: {
      totalWeightGrams: 2350,
      perServing: {"calories":1061,"protein":43.8,"carbs":93.1,"fat":41.9,"fiber":6.3},
      per100g: {"calories":455,"protein":18.7,"carbs":39.7,"fat":17.9,"fiber":2.7},
    },
  },
  {
    id: 'falafel-con-pimientos-del-piquillo',
    title: 'Falafel con Pimientos del Piquillo',
    category: 'Entrantes',
    summary: 'Falafel con Pimientos del Piquillo al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191005_184221-1024x564.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 250, unit: 'gr de', name: 'amos de garbanzos crudos' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'amos de avena' },
      { id: '3', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 3, unit: '', name: 'pimientos de piquillo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: null, unit: '', name: 'Un puñado de perejil' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '8', baseQuantity: null, unit: '', name: 'Pimienta y sal' },
    ],
    steps: [
      'Lo primero que haremos será poner los garbanzos a remojo al menos 4 horas antes, y si los ponemos la noche antes mucho mejor. Los lavamos y los escurrimos bien. Ponemos todos los ingredientes en el vaso del procesador de alimentos y trituramos bien.',
      'Dejamos reposar al menos media hora en la nevera (yo no lo he hecho, de ahí que la masa estuviera pegajosa) Ponemos papel vegetal en una bandeja de horno y vamos poniendo la masa como mejor podamos.',
      'Yo he utilizado una cuchara y he formado pequeños volcanes,pues la masa es pegajosa y no he podido darle mejor forma. Horneamos 45 minutos a 180 grados.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":469,"protein":20.4,"carbs":43.9,"fat":20.5,"fiber":6.1},
      per100g: {"calories":278,"protein":12.1,"carbs":26.1,"fat":12.2,"fiber":3.6},
    },
  },
  {
    id: 'fiambre-de-pollo-con-calabaza',
    title: 'Fiambre de Pollo con Calabaza',
    category: 'Carne',
    summary: 'Fiambre de Pollo con Calabaza al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191019_173700-1-1024x879.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: 'hojas de', name: 'endibia' },
      { id: '2', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 1, unit: 'lata de', name: 'sardinas en aceite de oliva' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'mostaza' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'yogur natural' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y vinagre' },
      { id: '8', baseQuantity: 1, unit: 'gr de', name: 'anada' },
    ],
    steps: [
      'En primer lugar cocemos la patata y el huevo. Aprovechemos el momento para cocer más y tener disponibles para otras recetas. Una vez cocidos y atemperados cortamos en trozos pequeños e introducimos en un bol junto a una lata de sardinas previamente escurridas.',
      'A continuación hacemos la vinagreta mezclando en un bol 1 cucharada de yogur natural, 1 cucharadita de mostaza, 2 cucharadas de AOVE y sal y vinagre al gusto. Removemos bien hasta que se integran todos los ingredientes e incorporamos al recipiente donde tenemos la patata, el huevo y las sardinas.',
      'Ya sólo nos falta desgranar una granada. Sé que hay varias formas pero a mí me gusta partirla con cuidado por la mitad y darle por detrás con el mango de un mortero. Así salen todas las pepitas en un minuto.',
      'Como no lo vamos a consumir de forma inmediata guardamos la granada en un recipiente, las hojas de endibia en otro y la mezcla con la vinagreta en un tercero. Sólo quedará emplatar con más o menos esmero y comerlo 😉',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":541,"protein":24.9,"carbs":34.9,"fat":26.1,"fiber":4.1},
      per100g: {"calories":289,"protein":13.3,"carbs":18.6,"fat":14,"fiber":2.2},
    },
  },
  {
    id: 'fiambre-de-pollo-de-especias',
    title: 'Fiambre de Pollo de Especias',
    category: 'Carne',
    summary: 'Fiambre de Pollo de Especias al estilo La Vida Bonica.',
    image: 'images/2019_03_IMG_20190331_114316-1024x841.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'alcachofas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'pan rallado integral' },
    ],
    steps: [
      'Temporada de alcachofas en el huerto así que toca darles salida con diferentes recetas que aprovecho para enseñaros por aquí por si os animáis a hacerlas.',
      'Comentaros que cuando tengo excedente de verdura (por el huerto o porque pillo una buena oferta) y no voy a consumir pronto la congelo lavada y escaldada o mínimamente cocinada al vapor.',
      'El motivo es inactivar las enzimas, las proteínas que oxidan las verduras cuando entran en contacto con el oxígeno del aire, y que comienzan a trabajar en el mismo momento de recolectarlas.',
      'Como estas enzimas desaparecen al estar sometidas a temperaturas que rozan la ebullición, de esta manera nos aseguramos que la verdura que congelamos se encuentra en óptimas condiciones para su posterior cocción.',
      'Además de todo esto nos viene genial porque adelantamos tiempos de cocinado, ya que la verdura no está cruda cuando la incorporamos a la receta en cuestión. Bueno, vamos a la receta: Lavamos y pelamos las alcachofas y cocemos con agua y sal, si es en olla normal tardará unos 20-25 minutos.',
      'Nosotros lo haremos en olla a presión, que con 10 minutos será suficiente (si puedes cocinar más hazlo y ya las puedes congelar cocinadas, ahorrarás tiempo para las sesiones futuras de batch cooking) Mientras tanto, picamos la cebolla y los ajos tiernos y sofreímos en una sartén de base ancha con dos cucharadas de AOVE.',
      'Bajamos el fuego para que no se pegue y removemos de vez en cuando. Cuando la cebolla y el ajete ya se han sofrito añadimos las alcachofas que previamente hemos cocinado. Salpimentamos y añadimos una cucharada de pan rallado integral.',
      'Mezclamos un par de minutos para que se integren los sabores y ya está, primer plato preparado. LENTEJAS AL CURRY',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":401,"protein":20.4,"carbs":24.9,"fat":16.5,"fiber":4.5},
      per100g: {"calories":194,"protein":9.9,"carbs":12.1,"fat":8,"fiber":2.2},
    },
  },
  {
    id: 'fiambre-vegano-con-sabor-a-chorizo',
    title: 'Fiambre Vegano con Sabor a Chorizo',
    category: 'Carne',
    summary: 'Fiambre Vegano con Sabor a Chorizo al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190831_203539-1024x463.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 80, unit: 'gr de', name: '. de soja texturizada fina' },
      { id: '2', baseQuantity: 350, unit: 'ml de', name: '. de agua' },
      { id: '3', baseQuantity: 4, unit: 'cucharadas de', name: 'AOVE' },
      { id: '4', baseQuantity: 5, unit: 'cucharadas de', name: 'harina integral de trigo' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'pan integral rallado' },
      { id: '6', baseQuantity: 2, unit: 'cucharaditas de', name: 'cebolla en polvo' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: 2, unit: 'cucharaditas de', name: 'orégano seco' },
      { id: '9', baseQuantity: 2, unit: 'cucharaditas de', name: 'sal' },
      { id: '10', baseQuantity: 6, unit: 'cucharaditas de', name: 'pimentón dulce' },
      { id: '11', baseQuantity: 2, unit: 'cucharaditas de', name: 'pimentón picante (podemos aumentar este número y disminuir el de pimentón dulce, lo importante es que haya 8 cucharaditas en total)' },
      { id: '12', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja sin azúcar' },
    ],
    steps: [
      'Mezclamos en un bol la soja con el ajo en polvo, la cebolla en polvo, el orégano, la sal, y el pimentón. Añadimos el agua (si la calentamos previamente en el microondas la soja hidratará antes) Dejamos reposar durante 20 minutos.',
      'Una vez pasado este tiempo añadimos la harina, el pan rallado, el aceite y la salsa de soja. Mezclamos y debe quedar una masa densa y pegajosa pero que se pueda manipular con las manos. Si vemos que es necesario se puede añadir un poco más de harina integral.',
      'Separamos la masa en 4 y la enrollamos con papel film dándole la forma y el grosor de un chorizo. Cerramos bien los extremos a modo de caramelo y luego les hacemos unos nudos, aunque con cuidado de no apretar al 100% para que no explote durante la cocción.',
      'Ya sólo nos queda cocinarlo al vapor, para evitar en lo posible el contacto con el agua. En mi caso lo cocinaré en la vaporera Lekue. Ponemos 4 dedos de agua en una olla y la vaporera con los el fiambre dentro.',
      'Llevamos a ebullición el agua y dejamos por 60 minutos, vigilando de vez en cuando que la olla no se quede sin agua. Lo dejamos enfriar y lo desenrollamos. Podemos dejarlo así o darle una vuelta en la sartén con un poco de AOVE. Se puede congelar una vez cocido.',
      'Y lo podemos usar para guisos, hacer en la sartén vuelta y vuelta, incluso tal y como están. Espero que os animéis a hacerlos y me contéis impresiones. A los peques les han encantado. Yo no lo tenía muy claro porque a chorizo chorizo no sabe, la verdad, aunque se le asemeja.',
      'Pero el caso es que se lo han zampado a la primera. Así que tan contentos! 😀 Y por aquí ya hemos terminado por hoy. Tenemos nuestra nevera y congelador llenos de buenos alimentos, ahora podemos dedicar el tiempo libre a otras actividades que también nos llenan.',
      'Espero veros por aquí esta nueva temporada que acabamos de empezar. Un saludo grande y feliz semana Navegación de entradas Anterior Hamburguesas de pollo y garbanzos Siguiente Patatas aliñadas Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 850,
      perServing: {"calories":294,"protein":14.5,"carbs":24.5,"fat":12.3,"fiber":4.9},
      per100g: {"calories":174,"protein":8.6,"carbs":14.5,"fat":7.3,"fiber":2.9},
    },
  },
  {
    id: 'filetes-de-merluza-en-salsa-de-zanahoria',
    title: 'Filetes de Merluza en Salsa de Zanahoria',
    category: 'Pescado',
    summary: 'Filetes de Merluza en Salsa de Zanahoria al estilo La Vida Bonica.',
    image: 'images/2019_06_PhotoEditor_20190616_204242351_resized_20190616_084307451.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'bote de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'gambas peladas (pueden ser congeladas)' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '4', baseQuantity: 1, unit: 'litro de', name: 'caldo de pescado' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: null, unit: '', name: 'Una rama de perejil' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'En un mortero machacamos los ajos pelados, el perejil, el comino y una cucharada de caldo de pescado. Reservamos Salteamos en una sartén con una cucharada de AOVE las gambas.',
      'Reservamos Incorporamos entonces el arroz en la sartén, y una vez salteado, subimos el fuego y agregamos el caldo de pescado, cuando rompa a hervir añadiremos la mezcla del mortero y un pellizco de sal.',
      'Cocemos el arroz a fuego medio-bajo durante 20 minutos En este momento añadimos los garbanzos y cocinamos durante 5 minutos más. Agregamos las gambas y quitamos el fuego. En el momento de consumir echamos un poco más de caldo de pescado y agua y calentamos.',
      'MARTES: Gazpacho con manzana y ensalada de pasta con salmón',
    ],
    nutrition: {
      totalWeightGrams: 1850,
      perServing: {"calories":734,"protein":43.4,"carbs":43.1,"fat":29.5,"fiber":4.3},
      per100g: {"calories":369,"protein":21.8,"carbs":21.7,"fat":14.8,"fiber":2.2},
    },
  },
  {
    id: 'frittata-de-verduras',
    title: 'Frittata de Verduras',
    category: 'Entrantes',
    summary: 'Frittata de Verduras al estilo La Vida Bonica.',
    image: 'images/2022_05_IMG_20220522_191620-1024x856.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'remolacha cruda' },
      { id: '3', baseQuantity: 10, unit: '', name: 'rábanos' },
      { id: '4', baseQuantity: 300, unit: 'gr de', name: 'solomillo de cerdo' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'aceite de sésamo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '8', baseQuantity: 1, unit: '', name: 'trozo de 2 centímetros de jengibre rallado' },
      { id: '9', baseQuantity: 1, unit: 'cucharada de', name: 'zumo de limón' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar adobamos 300 gr de solomillo de cerdo troceado en dados de 2 centímetros.',
      'Para ello disponemos los trozos en un bol, agregamos 1 cucharada de aceite de sésamo, 2 cucharadas de salsa de soja, 1 cucharadita de orégano seco, 1 cucharada de zumo de limón, 1 trozo de jengibre rallado y sal y pimienta al gusto, y mezclamos bien para que todos los trozos queden bien impregnados con la mezcla.',
      'Tapamos y reservamos en la nevera un mínimo de 30 minutos. Mientras esperamos que la carne se adoba podemos dejar preparados el resto de ingredientes. Para ello incorporamos 400 gr de alubias cocidas, 1 remolacha cruda cortada en láminas finas y 10 rábanos.',
      'Reservamos Cuando ya hayan pasado al menos 30 minutos sacamos la carne de la nevera y la salteamos en una plancha o sartén a fuego vivo para que quede bien sellada y no pierda su jugo. Al ser trozos pequeños no le quitamos ojo porque se van a hacer enseguida y no queremos que quede seco.',
      'Lo incorporamos a nuestra bol con el resto de la ensalada y listo, platazo lleno de color preparado, a disfrutarlo.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":761,"protein":37.4,"carbs":53.9,"fat":30.8,"fiber":6.5},
      per100g: {"calories":383,"protein":18.8,"carbs":27.1,"fat":15.5,"fiber":3.3},
    },
  },
  {
    id: 'galletas-de-queso-y-nueces',
    title: 'Galletas de Queso y Nueces',
    category: 'Postres',
    summary: 'Galletas de Queso y Nueces al estilo La Vida Bonica.',
    image: 'images/2019_04_IMG_20190426_220626_resized_20190426_100900215.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 150, unit: 'gr de', name: 'harina integral de trigo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'queso de cabra a temperatura ambiente' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'queso azul a temperatura ambiente' },
      { id: '5', baseQuantity: 80, unit: 'gr de', name: 'nueces' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'mantequilla blanda' },
      { id: '7', baseQuantity: null, unit: '', name: 'Pimienta y sal' },
    ],
    steps: [
      'Picamos las nueces en un mortero. Reservamos. Trituramos con un tenedor los quesos, añadimos la mantequilla blanda, un poco de sal y la pimienta y batimos todo bien hasta que quedo todo bien mezclado.',
      'Incorporamos la harina y mezclamos Añadimos las nueces y el huevo previamente batido, y mezclamos hasta conseguir una masa fina. Formamos un cilindro con la masa, los envolvemos en film transparente y dejamos reposar en la nevera una hora para que la masa tome consistencia y se endurezca un poco.',
      'Cuando las vayamos a preparar precalentamos el horno a 180º Sacamos los rulos, cortamos en rodajas de algo menos de 1 cm y las colocamos sobre papel en una bandeja de horno. Horneamos unos 10 min.',
      'Po r un lado, volteamos y seguimos horneando 10 minutos más hasta que doren, y dejamos enfriar completamente. Ya tenemos un snack saludable preparado para la semana.',
      'Ya tenemos los menús de la semana preparados, los conservaremos en recipientes herméticos, y en nevera o congelador en función de cuando lo vayamos a comer.',
      'Y así podremos tener más tiempo en el día a día para otras actividades, en esta casa el batch cooking ha venido para quedarse, sólo le vemos ventajas, ¿vosotros qué opináis Bueno, espero que hayáis sacado ideas para vuestras sesiones de batch cooking. Nos vemos la semana que viene!',
      'Navegación de entradas Anterior Yogures con confitura de fresa y frambuesa Siguiente Picadillo cubano vegano Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 620,
      perServing: {"calories":541,"protein":23.4,"carbs":29.1,"fat":40.6,"fiber":3.4},
      per100g: {"calories":437,"protein":11.9,"carbs":14.8,"fat":20.7,"fiber":1.7},
    },
  },
  {
    id: 'garbanzos-al-vino-blanco',
    title: 'Garbanzos al Vino Blanco',
    category: 'Legumbres',
    summary: 'Garbanzos al Vino Blanco al estilo La Vida Bonica.',
    image: 'images/2020_03_IMG_20200301_135407.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'rebanadas de', name: 'gruesas de pan integral' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'yogur natural' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca' },
      { id: '5', baseQuantity: 2, unit: '', name: 'pimientos rojos grandes' },
      { id: '6', baseQuantity: 1, unit: '', name: 'lechuga' },
      { id: '7', baseQuantity: 6, unit: '', name: 'cebolletas' },
      { id: '8', baseQuantity: 300, unit: 'gr de', name: 'pollo' },
      { id: '9', baseQuantity: 50, unit: 'gr de', name: 'queso de cabra' },
      { id: '10', baseQuantity: 200, unit: 'gr de', name: 'uvas' },
    ],
    steps: [
      'En primer lugar hemos de asar los pimientos y las cebolletas en el horno durante 40 minutos a 180º. Ya sabéis, porque siempre os lo digo, que aprovechemos la ocasión para hornear algo más y ser más eficientes en cuanto a tiempo y aprovechemos mejor la energía.',
      'En segundo lugar vamos a hacer los picatostes y para ello troceamos en dados las rebanadas de pan integral, disponemos en una bandeja y horneamos durante 15 minutos, removiendo de vez en cuando (así, podemos aprovechar que tenemos los pimientos en el horno para hacer también el pan, ahorramos tiempo y energía) Mientras tenemos el horno haciendo su trabajo podemos continuar preparando la salsa de yogur, para lo cual sólo hemos de mezclar el yogur, el comino y la albahaca junto con una cucharada de AOVE.',
      'Reservamos A continuación doramos con una cucharadita de AOVE el pollo en una sartén y una vez hecho dejamos enfriar y troceamos.',
      'Como la ensalada no la vamos a consumir al momento guardamos en diferentes recipientes los distintos ingredientes para unirlos todos a la hora de comer: en un recipiente troceamos la lechuga y guardamos con papel de cocina para que absorba la humedad. en otro recipiente guardamos los pimientos y las cebolletas horneadas y troceadas en un tercero el pollo ya troceado en un cuarto la salsa de yogur Y a la hora de comer lo unimos todo en el plato y añadimos uva, picatostes y unos trocitos de queso de cabra.',
      'Parece un poco lioso pero sólo es cuestión de organizar los diferentes pasos para que podamos disfrutar de una completa ensalada en 2 minutos.',
    ],
    nutrition: {
      totalWeightGrams: 1854,
      perServing: {"calories":462,"protein":37.4,"carbs":34.9,"fat":20.9,"fiber":6.4},
      per100g: {"calories":250,"protein":20.3,"carbs":19,"fat":11.4,"fiber":3.5},
    },
  },
  {
    id: 'garbanzos-con-bolonesa-de-carne',
    title: 'Garbanzos con Boloñesa de Carne',
    category: 'Legumbres',
    summary: 'Garbanzos con Boloñesa de Carne al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191109_185425-1024x629.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'boloñesa de carne' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'queso al gusto' },
      { id: '4', baseQuantity: null, unit: '', name: 'Orégano' },
    ],
    steps: [
      'Lo principal es preparar una buena boloñesa. Por aquí os dejo la receta que yo utilizo: https://lavidabonica.com/salsa-bolonesa/ Una vez hecha la boloñesa la disponemos en un recipiente apto para horno junto con los garbanzos cocidos. Removemos bien.',
      'Coronamos con queso rallado y orégano al gusto y horneamos a 180º unos 15 minutos o hasta que el queso se funda. Y listo, ahora a cruzar los dedos para que al peque le atraiga el plato 💪 MIÉRCOLES: Crema de calabacín y albóndigas de merluza en salsa con arroz cocido',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: {"calories":644,"protein":34.9,"carbs":43.1,"fat":37.4,"fiber":8.4},
      per100g: {"calories":716,"protein":38.9,"carbs":48.1,"fat":41.7,"fiber":9.4},
    },
  },
  {
    id: 'garbanzos-con-leche-de-coco-y-tomates-secos',
    title: 'Garbanzos con Leche de Coco y Tomates Secos',
    category: 'Legumbres',
    summary: 'Garbanzos con Leche de Coco y Tomates Secos al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-2-1024x743.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pollo picado' },
      { id: '2', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo picados' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'perejil picado' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal, pimienta y jengibre seco' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'rasas de harina integral' },
    ],
    steps: [
      'En primer lugar mezclamos en un bol 600 gr de pollo picado, 2 huevos, 2 dientes de ajo picados, 2 cucharadas de perejil picado, 1 cucharadita de jengibre seco, sal y pimienta al gusto y 3 cucharadas rasas de harina integral.',
      'Removemos bien hasta que se integren bien todos los ingredientes y reservamos tapado en el frigo durante unos 30 minutos. Con la mezcla anterior hacemos albóndigas y metemos al horno precalentado a 180º durante 30 minutos. Mientras tanto vamos haciendo la salsa.',
      'Para ello en una olla ponemos 1 cucharada de AOVE y cuando esté caliente incorporamos 1 cebolla previamente picada y dejamos que poche durante 3 minutos a fuego medio y removiendo de vez en cuando.',
      'En el vaso de un procesador de alimentos incorporamos 50 gr de queso roquefort, 70 gr de almendras tostadas, 250 ml de caldo de pollo y sal al gusto. Batimos bien hasta que quede todo bien mezclado y añadimos a la olla donde se está pochando la cebolla.',
      'Dejamos chup chup durante 5 minutos más y ya tenemos la salsa preparada. Cuando las albóndigas se hayan terminado de hornear las podemos meter en la olla con la salsa para que hagan un hervor conjunto.',
      'En mi caso congelaré cada cosa en un recipiente por si la salsa necesita un batido exprés al descongelarse (si se queda grumosa) y haré el hervor conjunto cuando vayamos a comerlas.',
    ],
    nutrition: {
      totalWeightGrams: 1306,
      perServing: {"calories":654,"protein":43.8,"carbs":24.9,"fat":43.8,"fiber":3.4},
      per100g: {"calories":501,"protein":33.5,"carbs":19.1,"fat":33.5,"fiber":2.6},
    },
  },
  {
    id: 'garbanzos-con-picada-y-huevo',
    title: 'Garbanzos con Picada y Huevo',
    category: 'Legumbres',
    summary: 'Garbanzos con Picada y Huevo al estilo La Vida Bonica.',
    image: 'images/2022_04_IMG_20220423_130751-1024x976.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'muslos y contramuslos de pollo deshuesados' },
      { id: '2', baseQuantity: 1, unit: 'lata de', name: 'pequeña de piña en su jugo' },
      { id: '3', baseQuantity: 2, unit: 'cucharaditas de', name: 'pimentón picante' },
      { id: '4', baseQuantity: 2, unit: 'cucharaditas de', name: 'ajo en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'colmada de harina integral' },
      { id: '6', baseQuantity: 150, unit: 'ml de', name: 'caldo de pollo' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En esta ocasión vamos a rebozar el pollo con un poco de harina acompañada de especias picantes. El nivel picantón lo ponemos nosotros en función de los gustos de cada casa.',
      'Nosotros vamos a mezclar 1 cucharada colmada de harina integral con 2 cucharaditas de pimentón picante, 2 cucharaditas de ajo en polvo y sal al gusto. Todo ello lo metemos en una bolsa. Vamos metiendo los trozos de pollo en la bolsa de uno en uno, cerramos con las manos y agitamos cual coctelera.',
      'Antes de sacar el pollo lo agitamos bien dentro de la bolsa para que suelte todo el exceso de harina. Vamos impregnando todos los trozos con esta mezcla y reservando.',
      'En una sartén de base ancha añadimos 2 cucharadas de AOVE y cuando esté caliente agregamos los trozos de pollo con el fin de dorarlos y sellar su carne. Lo hemos de hacer a fuego bajo para que la harina no se queme en tan poco aceite. Vamos sacando y reservando.',
      'Ahora vamos a desglasar, es decir, a sacar el jugo de la carne del fondo de la sartén. Para ello incorporamos el caldo de un bote pequeño de piña en su jugo en la sartén donde hemos dorado la carne y damos un pequeño hervor mientras removemos con una cuchara de madera.',
      'Lo tenemos así 2 minutos, añadimos el pollo y 150 ml de caldo de pollo y dejamos chup chup durante 10 minutos más. Y ya está, un pollo especiado y picantón nos está esperando en la nevera. Ah!!',
      'Nosotros nos hemos merendado la piña de la lata pero por aquí os dejo un bizcocho por si queréis aprovechar la sesión y hacerlo: https://lavidabonica.com/bizcocho-de-pina/',
    ],
    nutrition: {
      totalWeightGrams: 1074,
      perServing: {"calories":432,"protein":37.4,"carbs":14.9,"fat":26.4,"fiber":3.4},
      per100g: {"calories":402,"protein":34.7,"carbs":13.8,"fat":24.5,"fiber":3.2},
    },
  },
  {
    id: 'garbanzos-especiados',
    title: 'Garbanzos Especiados',
    category: 'Legumbres',
    summary: 'Garbanzos Especiados al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211206_135954-1024x762.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'manojo grande de acelgas frescas' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'jamón serrano sin aditivos' },
      { id: '4', baseQuantity: 25, unit: 'gr de', name: 'piñones' },
      { id: '5', baseQuantity: 150, unit: 'gr de', name: 'garbanzos especiados https://lavidabonica.com/garbanzos-especiados/' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '7', baseQuantity: 3, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar, ponemos a cocer 150 gr de arroz en abundante agua hirviendo y sal durante el tiempo que especifique el paquete.',
      'Siempre os lo digo y esta vez no va a ser menos, aprovechamos para cocer más arroz y así tenemos un extra que nos va a ayudar a completar una comida o cena durante la semana.',
      'Mientras el arroz se está cociendo (a nosotros nos gusta el arroz vaporizado para estas elaboraciones porque se queda más suelto) ponemos otra olla con abundante agua y sal al gusto.',
      'Llevamos a ebullición y mientras tanto lavamos bien y troceamos de forma homogénea las pencas de las acelgas (podemos cocer más cantidad y tener apañado otro primer plato de la semana.',
      'En ese caso introducimos las hojas cuando las pencas lleven 5 minutos de cocción) Cuando rompa a hervir introducimos sólo las pencas y las tenemos a fuego medio durante 7 minutos. Escurrimos y reservamos.',
      'En una sartén de base ancha agregamos 2 cucharadas de AOVE y cuando esté caliente incorporamos 100 gr de jamón serrano sin aditivos finamente picado.',
      'A continuación, añadimos el arroz ya cocido, las pencas de las acelgas que ya tenemos cocidas, 1 cucharadita de ajo en polvo y 25 gr de piñones y sofreímos de forma conjunta.',
      'Ya sólo nos falta añadir las hojas de las acelgas, los garbanzos especiados y 3 cucharadas soperas de salsa de soja y removemos hasta que las hojas se cocinen (en un par de minutos estarán hechas) Listo, a un recipiente hermético hasta que la vayamos a consumir.',
      'En ese momento la podemos calentar un poco con el fin de tomarla templada.',
    ],
    nutrition: {
      totalWeightGrams: 725,
      perServing: {"calories":421,"protein":23.1,"carbs":36.4,"fat":24.1,"fiber":6.1},
      per100g: {"calories":582,"protein":31.9,"carbs":50.3,"fat":33.3,"fiber":8.4},
    },
  },
  {
    id: 'gazpacho-con-remolacha',
    title: 'Gazpacho con Remolacha',
    category: 'Verdura',
    summary: 'Gazpacho con Remolacha al estilo La Vida Bonica.',
    image: 'images/2020_05_IMG_20200509_215253-2-1024x785.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pepino pequeño' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'pimiento' },
      { id: '5', baseQuantity: 1, unit: 'kg de', name: 'tomates maduros' },
      { id: '6', baseQuantity: 150, unit: 'gr de', name: 'remolacha cocida' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y vinagre de manzana' },
      { id: '8', baseQuantity: null, unit: '', name: 'Agua' },
      { id: '9', baseQuantity: null, unit: '', name: 'Queso fresco como topping' },
    ],
    steps: [
      'Tenemos excedente de remolacha en el huerto y he visto varias recetas de gazpacho con este ingrediente, así que me he animado a hacerlo 😊 Utilizaré la Thermomix, aunque puedes usar también cualquier otro procesador de alimentos, pues es batir y listo.',
      'En el vaso del procesador echamos todos los ingredientes sólidos: pepino, cebolla, ajo, pimiento, tomate y remolacha y troceamos 30 segundos en velocidad 5. Incorporamos 30 gramos de vinagre de manzana y 1 cucharadita de sal y programamos 4 minutos velocidad máxima.',
      'Cuando termine añadimos un chorrito de AOVE y mezclamos unos segundos en velocidad 5 (yo no lo pongo desde el principio porque si no el gazpacho se queda rosa) Añadimos 300 ml de agua, mezclamos unos segundos y listo, ya está el gazpacho preparado, sólo queda refrigerar para tomar bien fresquito.',
      'Para acompañar, en vez de picatostes tostados lo podemos acompañar de dados de queso fresco o queso tierno.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":122,"protein":3.4,"carbs":25.1,"fat":2.4,"fiber":4.4},
      per100g: {"calories":98,"protein":2.7,"carbs":20.1,"fat":1.9,"fiber":3.5},
    },
  },
  {
    id: 'guiso-de-alubias-con-coles-de-bruselas',
    title: 'Guiso de Alubias con Coles de Bruselas',
    category: 'Legumbres',
    summary: 'Guiso de Alubias con Coles de Bruselas al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220320_125957-1024x940.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'coles de bruselas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'zanahoria' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 400, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'leche evaporada' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'curry en polvo' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón picante' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar pochamos 1 cebolla y los 2 dientes de ajo, todo ello bien picado, en una olla con 1 cucharada de AOVE.',
      'Lo tenemos 1 minuto a fuego medio-alto y una vez pasado ese tiempo bajamos la temperatura para que no se dore en exceso (incluso le podemos añadir un pelín de agua para evitar poner más aceite) y lo dejamos 3 minutos más. Picamos mientras tanto 1 zanahoria y la incorporamos a la olla.',
      'Lavamos ahora 300 gr de coles de bruselas y escurrimos las alubias del bote. Reservamos Una vez que han pasado los 3 minutos incorporamos a la olla 400 ml de caldo de verduras, 100 ml de leche evaporada, 1 cucharadita de curry en polvo, ½ cucharadita de pimentón picante y sal y pimienta al gusto.',
      'Removemos bien para que las especias y la leche evaporada se integren bien en el caldo. Añadimos ahora las coles de bruselas y las alubias, dejamos chup chup a fuego medio bajo con la tapa un poco abierta durante 8 minutos y ya tenemos un rico guiso preparado, ¿qué os parece?',
    ],
    nutrition: {
      totalWeightGrams: 1700,
      perServing: {"calories":394,"protein":22.9,"carbs":43.1,"fat":17.4,"fiber":9.4},
      per100g: {"calories":232,"protein":13.5,"carbs":25.5,"fat":10.3,"fiber":5.6},
    },
  },
  {
    id: 'guiso-de-carrillera-iberica',
    title: 'Guiso de Carrillera Ibérica',
    category: 'Carne',
    summary: 'Guiso de Carrillera Ibérica al estilo La Vida Bonica.',
    image: 'images/2022_04_IMG_20220423_130751-1024x976.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'carrillera ibérica' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 5, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'vino tinto' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En la misma olla donde vamos a hacer el guiso doramos por ambas caras previamente 800 gr de carrillera ibérica. Lo hacemos con 1 cucharada de AOVE y reservamos. En la misma olla rehogamos ahora 1 diente de ajo, 1 cebolla, 5 zanahorias y 2 puerros, todo ellos cortado en trozos grandes.',
      'Lo tenemos a fuego medio-bajo durante 5 minutos. A continuación subimos el fuego y añadimos la carne que tenemos ya sellada, 200 ml de vino tinto, 250 ml de agua, 1 cucharadita de tomillo seco, 1 cucharadita de romero seco y sal y pimienta al gusto, tapamos y tenemos chup chup a fuego bajo durante 45 minutos.',
      'Cuando hay pasado el tiempo quitamos la tapa y si vemos que aún conserva mucho líquido subimos el fuego y tenemos unos minutos más (yo lo he tenido 5 minutos más).',
      'Sacamos las carrilleras y el contenido de la olla (verdura y caldo) lo trituramos bien con el fin de que se nos quede una salsa espesita con la que acompañar la carne. Ea, otra rica opción dispuesta, espero que la disfrutéis 😋',
    ],
    nutrition: {
      totalWeightGrams: 2100,
      perServing: {"calories":844,"protein":53.9,"carbs":10.4,"fat":63.9,"fiber":2.4},
      per100g: {"calories":402,"protein":25.7,"carbs":5,"fat":30.5,"fiber":1.1},
    },
  },
  {
    id: 'guiso-de-garbanzos-con-langostinos',
    title: 'Guiso de Garbanzos con Langostinos',
    category: 'Legumbres',
    summary: 'Guiso de Garbanzos con Langostinos al estilo La Vida Bonica.',
    image: 'images/2020_06_IMG_20200614_154040-1024x508.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'ajos laminados' },
      { id: '2', baseQuantity: 1, unit: '', name: 'trozo de pan integral' },
      { id: '3', baseQuantity: null, unit: '', name: '½ cebolla picada' },
      { id: '4', baseQuantity: 1, unit: '', name: 'tomate picado' },
      { id: '5', baseQuantity: null, unit: '', name: 'comino' },
    ],
    steps: [
      'En primer lugar se doran los ajos con una cucharada de AOVE y se reservan. En segundo lugar doramos el pan y también reservamos. Metemos pan y ajos en el mortero y los vamos majando mientras en la sartén sofreímos el tomate y la cebolla con 1 cucharada de AOVE.',
      'Cuando se evapora el líquido de esta verdura añadimos al mortero junto con 1 cucharadita colmada de comino y mezclamos bien. Cuando han pasado los 30 minutos, y con mucho cuidado, abrimos la olla a presión e incorporamos la majada.',
      'Lo tenemos chup chup unos 10 minutos a fuego medio bajo, y cuando han pasado 8 incorporamos los cuerpos de los langostinos, pues con un par de minutos de cocción será suficiente. Y listo! Otro rico plato de legumbres preparado. JUEVES: Crema de calabacín y carne a la plancha con arroz cocido',
    ],
    nutrition: {
      totalWeightGrams: 500,
      perServing: {"calories":282,"protein":18.4,"carbs":24.1,"fat":12.1,"fiber":4.4},
      per100g: {"calories":282,"protein":18.4,"carbs":24.1,"fat":12.1,"fiber":4.4},
    },
  },
  {
    id: 'guiso-de-lentejas-y-berenjena',
    title: 'Guiso de Lentejas y Berenjena',
    category: 'Legumbres',
    summary: 'Guiso de Lentejas y Berenjena al estilo La Vida Bonica.',
    image: 'images/2020_08_IMG_20200816_133725.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'lentejas seca pardina' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'arroz (yo he puesto integral)' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'canela' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'clavo molido' },
      { id: '7', baseQuantity: 2, unit: 'cucharaditas de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: 2, unit: 'cucharaditas de', name: 'pimentón' },
      { id: '9', baseQuantity: null, unit: '', name: '1\'2 litro de caldo de verduras' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Este guiso no lleva sofrito, así que más fácil no puede ser: En una olla rápida incorporamos todos los ingredientes (previamente remojadas las lentejas si nos acordamos y bien lavado el arroz integral), llevamos a ebullición y dejamos chup chup durante 25 minutos Y listo.',
      'Ya veréis qué sabor más suave y al tiempo peculiar tienen. JUEVES: Judías verdes y hamburguesas de cerdo con champiñón y calabacín',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: {"calories":444,"protein":24.1,"carbs":54.4,"fat":18.4,"fiber":10.4},
      per100g: {"calories":287,"protein":15.6,"carbs":35.2,"fat":11.9,"fiber":6.7},
    },
  },
  {
    id: 'guiso-de-patatas-con-alcachofas',
    title: 'Guiso de Patatas con Alcachofas',
    category: 'Verdura',
    summary: 'Guiso de Patatas con Alcachofas al estilo La Vida Bonica.',
    image: 'images/2021_08_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'manojo de ajetes' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'alcachofas' },
      { id: '4', baseQuantity: 2, unit: '', name: 'tomates troceados' },
      { id: '5', baseQuantity: null, unit: '', name: 'Azafrán' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '7', baseQuantity: null, unit: '', name: 'Caldo de verdura' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una olla de base ancha incorporamos 2 ó 3 cucharadas de AOVE y sofreímos a fuego medio 1 manojo de ajetes previamente picados. Cuando estén cogiendo color añadimos 400 gr alcachofas y 2 tomates troceados y dejamos que se rehogue todo junto durante 2 ó 3 minutos.',
      'Pasado este tiempo incorporamos a la olla 4 patatas medianas, peladas y cortadas, 1 cucharadita de pimentón, azafrán y caldo de verdura hasta cubrir. Salpimentamos al gusto y dejamos chup chup a fuego bajo durante 20 minutos. Ya tenemos un guiso con el que alimentarnos bien esta semana.',
    ],
    nutrition: {
      totalWeightGrams: 1600,
      perServing: {"calories":314,"protein":14.1,"carbs":43.9,"fat":12.4,"fiber":6.4},
      per100g: {"calories":196,"protein":8.8,"carbs":27.4,"fat":7.7,"fiber":4},
    },
  },
  {
    id: 'guiso-de-pollo-con-alubias-negras',
    title: 'Guiso de Pollo con Alubias Negras',
    category: 'Legumbres',
    summary: 'Guiso de Pollo con Alubias Negras al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191027_144805-1024x576.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla pelada y entera' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'judías verdes (yo las he utilizado congeladas)' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'harina integral' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
    ],
    steps: [
      'Ponemos 3 dedos de agua en la olla rápida y ponemos al fuego. Mientras, vamos pelando las patatas, las lavamos y cortamos en 3 trozos grandes e incorporamos a la olla. Pelamos la cebolla y le hacemos un corte sin llegar a partir por la mitad. Incorporamos.',
      'Añadimos también las judías verdes, echamos sal y tapamos. 15 minutos a fuego medio a partir de que rompa a hervir. Apagamos y reservamos Mientras tanto en una sartén agregamos 2 cucharadas de AOVE y doramos 2 dientes de ajo picados con mucho cuidado de que no se quemen.',
      'Cuando empiezan a estar dorados apagamos el fuego, añadimos 1 cucharadita de pimentón y otra de harina, removemos bien. Una vez que la verdura ya está hecha añadimos este refrito en la olla, le damos un suave hervor de un par de minutos y listo.',
    ],
    nutrition: {
      totalWeightGrams: 1800,
      perServing: {"calories":444,"protein":35.1,"carbs":34.1,"fat":22.4,"fiber":6.4},
      per100g: {"calories":247,"protein":19.5,"carbs":19,"fat":12.4,"fiber":3.6},
    },
  },
  {
    id: 'guiso-de-pollo-y-maiz',
    title: 'Guiso de Pollo y Maíz',
    category: 'Carne',
    summary: 'Guiso de Pollo y Maíz al estilo La Vida Bonica.',
    image: 'images/2020_12_RBC4-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla pelada y entera' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'judías verdes (yo las he utilizado congeladas)' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal' },
    ],
    steps: [
      'Ponemos 3 dedos de agua en la olla rápida y ponemos al fuego. Mientras, vamos pelando las patatas, las lavamos y cortamos en 3 trozos grandes. Incorporamos a la olla Pelamos la cebolla y le hacemos un corte sin llegar a partir por la mitad. Incorporamos.',
      'Añadimos también las judías verdes (yo las uso congeladas), echamos sal y tapamos 20 minutos a fuego medio a partir de que rompa a hervir. Listo, tenemos nuestra ración de vitaminas preparada',
    ],
    nutrition: {
      totalWeightGrams: 1600,
      perServing: {"calories":362,"protein":29.4,"carbs":28.4,"fat":17.4,"fiber":4.4},
      per100g: {"calories":226,"protein":18.4,"carbs":17.8,"fat":10.9,"fiber":2.8},
    },
  },
  {
    id: 'guiso-de-quinoa-con-ternera',
    title: 'Guiso de Quinoa con Ternera',
    category: 'Carne',
    summary: 'Guiso de Quinoa con Ternera al estilo La Vida Bonica.',
    image: 'images/2019_03_IMG_20190331_114316-1024x841.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'alcachofas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 4, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'pan rallado integral' },
    ],
    steps: [
      'Temporada de alcachofas en el huerto así que toca darles salida con diferentes recetas que aprovecho para enseñaros por aquí por si os animáis a hacerlas.',
      'Comentaros que cuando tengo excedente de verdura (por el huerto o porque pillo una buena oferta) y no voy a consumir pronto la congelo lavada y escaldada o mínimamente cocinada al vapor.',
      'El motivo es inactivar las enzimas, las proteínas que oxidan las verduras cuando entran en contacto con el oxígeno del aire, y que comienzan a trabajar en el mismo momento de recolectarlas.',
      'Como estas enzimas desaparecen al estar sometidas a temperaturas que rozan la ebullición, de esta manera nos aseguramos que la verdura que congelamos se encuentra en óptimas condiciones para su posterior cocción.',
      'Además de todo esto nos viene genial porque adelantamos tiempos de cocinado, ya que la verdura no está cruda cuando la incorporamos a la receta en cuestión. Bueno, vamos a la receta: Lavamos y pelamos las alcachofas y cocemos con agua y sal, si es en olla normal tardará unos 20-25 minutos.',
      'Nosotros lo haremos en olla a presión, que con 10 minutos será suficiente (si puedes cocinar más hazlo y ya las puedes congelar cocinadas, ahorrarás tiempo para las sesiones futuras de batch cooking) Mientras tanto, picamos la cebolla y los ajos tiernos y sofreímos en una sartén de base ancha con dos cucharadas de AOVE.',
      'Bajamos el fuego para que no se pegue y removemos de vez en cuando. Cuando la cebolla y el ajete ya se han sofrito añadimos las alcachofas que previamente hemos cocinado. Salpimentamos y añadimos una cucharada de pan rallado integral.',
      'Mezclamos un par de minutos para que se integren los sabores y ya está, primer plato preparado. LENTEJAS AL CURRY',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":522,"protein":35.4,"carbs":24.9,"fat":33.4,"fiber":4.4},
      per100g: {"calories":435,"protein":29.5,"carbs":20.8,"fat":27.9,"fiber":3.7},
    },
  },
  {
    id: 'habas-rehogadas-con-tomate-y-huevo',
    title: 'Habas Rehogadas con Tomate y Huevo',
    category: 'Legumbres',
    summary: 'Habas Rehogadas con Tomate y Huevo al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'habas frescas' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'tomate frito (si no es casero procurad que lleve AOVE y menos de un 10% de azúcar añadido, leed las etiquetas por costumbre)' },
      { id: '4', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimentón' },
    ],
    steps: [
      'Picamos la cebolla y ponemos a pochar con una cucharada de AOVE en una sartén ancha, a fuego medio-bajo 5 minutos. Añadimos las habas frescas, y salteamos 5 minutos removiendo de vez en cuando. Incorporamos la sal y una cucharadita de pimentón, removemos y a continuación el tomate frito y los huevos.',
      'Con ello conseguimos darle un puntito de melosidad. Chup chup mientras removemos a fuego medio bajo y hasta que cuajen los huevos. Y listo!! Ya os podéis imaginar lo rico que está y el poco tiempo que hemos invertido en ello.',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: {"calories":294,"protein":18.4,"carbs":23.1,"fat":16.4,"fiber":4.4},
      per100g: {"calories":327,"protein":20.5,"carbs":25.7,"fat":18.3,"fiber":4.9},
    },
  },
  {
    id: 'hamburguesas-de-alubias',
    title: 'Hamburguesas de Alubias',
    category: 'Legumbres',
    summary: 'Hamburguesas de Alubias al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'calabaza asada' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tallos de apio' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'bebida vegetal' },
      { id: '6', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'queso' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'romero' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'La semana pasada preparé una sopa con calabaza asada que nos encantó, así que esta semana repetimos ingrediente principal y cambiamos los demás, a ver cuál nos gusta más. En primer lugar asamos 400 gr de calabaza durante 30 minutos a 190º.',
      'Y como os digo siempre, aprovechamos la energía que estamos consumiendo para meter algo más en el horno y que se haga al mismo tiempo (en mi caso + lasaña y pollo con tomates cherry) Mientras la calabaza se está asando podemos sofreír la cebolla y los tallos de apio en una olla con una cucharada de AOVE.',
      'Lo tendremos a fuego medio-alto durante 2 minutos y medio-bajo 5 minutos más.',
      'Reservamos Una vez que la calabaza está asada la incorporamos a la olla junto con 200 ml de bebida vegetal, 300 ml de caldo de verduras, 1 cucharadita de ajo en polvo, 1 cucharadita de romero seco y sal y pimienta al gusto, y dejamos chup chup a fuego bajo durante 5 minutos más.',
      'Una vez pasado este tiempo trituramos muy bien el contenido de la olla (podemos meter en ella el brazo de la batidora, aunque siempre con mucho cuidado no nos vaya a salpicar y nos podamos quemar), y una vez bien triturado incorporamos 3 zanahorias ralladas, dejamos chup chup a fuego medio-bajo durante 3 minutos, tras los cuales añadimos 100 gr de queso previamente rallado y apagamos el fuego, dejamos que se derrita con el calor residual de la olla.',
      'Ya está, el crunchy de la zanahoria rallada le da un toque muy original y el queso rallado le da saborazo. Esta vez he utilizado parmesano, pero puedes utilizar el que tengas por casa o el que más se os antoje.',
    ],
    nutrition: {
      totalWeightGrams: 1500,
      perServing: {"calories":394,"protein":20.4,"carbs":34.4,"fat":20.9,"fiber":6.4},
      per100g: {"calories":262,"protein":13.6,"carbs":23,"fat":13.9,"fiber":4.3},
    },
  },
  {
    id: 'hamburguesas-de-atun-y-lentejas',
    title: 'Hamburguesas de Atún y Lentejas',
    category: 'Legumbres',
    summary: 'Hamburguesas de Atún y Lentejas al estilo La Vida Bonica.',
    image: 'images/2021_11_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 4, unit: 'latas de', name: 'atún al natural o AOVE' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'harina integral' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal, pimienta y Aceite de Oliva Virgen Extra (AOVE)' },
    ],
    steps: [
      'Una forma de comer legumbres y que no sea en forma de guiso puede ser como hamburguesa. Los que seguís mis publicaciones sabréis que las cocino con bastante frecuencia porque son muy fáciles de hacer, muy versátiles y están llenas de sabor y vitaminas.',
      'En cuanto a la preparación de esta receta es muy simple, sólo hay que chafar con un tenedor las lentejas cocidas y mezclar con el resto de ingredientes: 4 latas de atún, 1 cucharadita de pimentón, 1 cucharadita de oréganos eco, 2 cucharaditas de harina integral para hacer más manejable y menos pegajosa la masa y sal y pimienta al gusto.',
      'Tras mezclar bien los ingredientes y tener una masa compacta formamos las hamburguesas. Yo tengo un molde que es muy cómodo, pero si no tenemos se pueden hacer con las manos, quizá no salgan tan bonitas, pero igual de ricas seguro.',
      'En este caso las he dorado en una plancha con un par de cucharadas de AOVE, y así las tenemos listas para consumir. Otras veces las congelo y las cocinamos el día que toque comerlas, como apenas lleva tiempo es una buena opción.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":444,"protein":39.4,"carbs":24.1,"fat":24.1,"fiber":6.4},
      per100g: {"calories":370,"protein":32.9,"carbs":20.1,"fat":20.1,"fiber":5.3},
    },
  },
  {
    id: 'hamburguesas-de-cerdo-con-calabacin-y-champinones',
    title: 'Hamburguesas de Cerdo con Calabacín y Champiñones',
    category: 'Carne',
    summary: 'Hamburguesas de Cerdo con Calabacín y Champiñones al estilo La Vida Bonica.',
    image: 'images/2020_08_IMG_20200816_133725.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 2, unit: '', name: 'pimientos verdes' },
      { id: '3', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '6', baseQuantity: 4, unit: '', name: 'muslos de pollo' },
      { id: '7', baseQuantity: 300, unit: 'ml de', name: 'caldo de pollo' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de curry' },
    ],
    steps: [
      'En primer lugar sofreímos 1 cebolla y 2 pimientos verdes con 1 cucharada de AOVE en una olla de base ancha.',
      'Lo tenemos 3 minutos a fuego alto y 10 minutos a fuego medio-bajo (le podemos incorporar un poco de agua si vemos que se queda muy seco,o más aceite) Una vez pasado este tiempo añadimos 100 ml de nata fresca y trituramos bien.',
      'Volvemos a poner en la misma olla y agregamos 4 muslos de pollo, 300 ml de caldo de pollo y sal y pimienta y dejamos chup chup a fuego medio bajo durante 20 minutos.',
      'Cuando lleve 10 minutos abrimos la olla, incorporamos 400 gr de alubias cocidas y dejamos chup chup otros 10 minutos con la olla abierta, a fuego medio-bajo y removiendo de vez en cuando para que la legumbre no se pegue.',
      'Y listo, ya tenemos otro rico guiso con el que alimentarnos 👌🏼 Como veis la sesión de hoy ha sido muy sencilla pero no por ello menos válida que otras más largas.',
      'Tenéis que adaptar las sesiones de batch cooking a vuestros ritmos y vuestros planes, habrá ocasiones en las que podáis pasaros 3 horas en la cocina y otras veces no dispongáis de tanto tiempo.',
      'En esos casos priorizad las verduras y los guisos, que es lo que más pereza da hacer cuando tenemos hambre y llegamos a casa sin tener nada preparado en la nevera. Seguid así de bonitos y nos vemos en la próxima sesión. ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking primera semana de agosto Siguiente Batch cooking exprés cuarta semana de agosto Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1700,
      perServing: {"calories":542,"protein":34.9,"carbs":20.9,"fat":36.4,"fiber":4.4},
      per100g: {"calories":318,"protein":20.5,"carbs":12.3,"fat":21.4,"fiber":2.6},
    },
  },
  {
    id: 'hamburguesas-de-lentejas-con-sesamo',
    title: 'Hamburguesas de Lentejas con Sésamo',
    category: 'Legumbres',
    summary: 'Hamburguesas de Lentejas con Sésamo al estilo La Vida Bonica.',
    image: 'images/2020_01_IMG_20200125_141605-1-1024x610.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '½ kg de setas y champiñones' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'harina integral' },
      { id: '6', baseQuantity: 1, unit: '', name: 'vaso de caldo de verduras' },
      { id: '7', baseQuantity: null, unit: '', name: 'Pimentón dulce' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Mientras sofreímos la cebolla y el puerro con la mantequilla vamos limpiando las setas y champiñones.',
      'Cuando la cebolla y el puerro esté sofrito (4 ó 5 minutos a fuego medio) añadimos los hongos, la sal, el pimentón y la pimienta y removemos durante un minuto a fuego medio-bajo para que el pimentón no se queme porque si no amarga. Incorporamos la harina y dejamos hacer durante 1 minuto.',
      'Añadimos poco a poco el caldo de verduras y chup chup a fuego medio bajo hasta que empiece a espesar, aproximadamente 5 minutos. Luego pasamos por la batidora para que quede textura de crema y ya está.',
      'Recuerda que si la congelas, cuando la descongeles y vayas a consumir es más que probable que el agua haya cristalizado y quede con aspecto grumoso. Para arreglarlo no hay más que volver a batir unos segundos y todos los ingredientes volverán a unirse con una textura cremosa.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":462,"protein":24.1,"carbs":34.1,"fat":26.4,"fiber":6.4},
      per100g: {"calories":385,"protein":20.1,"carbs":28.4,"fat":22,"fiber":5.3},
    },
  },
  // --- Batch cooking recipes (batch 4: 70 recipes) ---
  {
    id: 'hamburguesas-de-lentejas-y-zanahorias',
    title: 'Hamburguesas de Lentejas y Zanahorias',
    category: 'Legumbres',
    summary: 'Hamburguesas de Lentejas y Zanahorias al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220320_125957-1024x940.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lenteja pardina cocida' },
      { id: '2', baseQuantity: 3, unit: '', name: 'zanahorias ralladas' },
      { id: '3', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja sin azúcar' },
      { id: '4', baseQuantity: null, unit: '', name: 'Comino, sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'harina de avena (o de cualquier otro tipo)' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta.' },
    ],
    steps: [
      'En un bol grande echamos las lentejas cocidas previamente lavadas y escurridas y las chafamos, pero no en exceso para que no quede como una papilla sino que queden lentejas enteras y así la hamburguesa tenga más consistencia.',
      'Yo suelo utilizar las manos antes que un tenedor, voy más rápido y me canso menos. Rallamos 3 zanahorias y las incorporamos al bol. Removemos bien y añadimos 2 cucharadas de salsa de soja, 1 cucharadita de comino, y sal y pimienta al gusto.',
      'Para poder darle forma y que adquieran consistencia usamos 1 huevo y 1 cucharada colmada de harina de avena (avena molida).',
      'Una vez que tengamos todos los ingredientes bien mezclados es conveniente meter la asa en la nevera con el fin de que tengamos menos problemas a la hora de formar las hamburguesas. En mi caso voy a congelar esta masa porque las consumiremos a final de semana y aguanta perfectamente la congelación.',
      'El día antes las metemos en la nevera para que no se rompa la cadena de frío en la descongelación y ya sólo nos quedará formar las hamburguesas y dorarlas en una sartén con un poco de AOVE 2 ó 3 minutos por cada lado. Huevos cocidos con los que enriquecer las ensaladas.',
      'Yo los tengo 9 minutos a fuego medio una vez que el agua rompe a hervir. Y a otra cosa mariposa, ¿qué os parece? Sencillo y colorido. Con productos de temporada y sin más pretensiones que hacernos disfrutar los momentos de mesa estos próximos días.',
      'Os deseo una feliz semana, sin calima y con lluvia, a ver si así se queda todo bien limpio para que el sol brille bien bonito esta recién estrenada primavera.',
      'Navegación de entradas Anterior Sesión de batch cooking de comienzo de primavera Siguiente Primera sesión de batch cooking en horario de primavera-verano Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 734,
      perServing: {"calories":372,"protein":22.8,"carbs":43.8,"fat":14.5,"fiber":6.3},
      per100g: {"calories":184,"protein":11.1,"carbs":21.6,"fat":7.1,"fiber":3.1},
    },
  },
  {
    id: 'hamburguesas-de-merluza',
    title: 'Hamburguesas de Merluza',
    category: 'Pescado',
    summary: 'Hamburguesas de Merluza al estilo La Vida Bonica.',
    image: 'images/2021_09_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 150, unit: 'gr de', name: 'arroz vaporizado' },
      { id: '3', baseQuantity: 2, unit: '', name: 'berenjenas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'aguacate' },
      { id: '5', baseQuantity: 30, unit: 'gr de', name: 'tomates secos' },
      { id: '6', baseQuantity: 30, unit: 'gr de', name: 'anacardos' },
      { id: '7', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '8', baseQuantity: 50, unit: 'ml de', name: 'leche animal o vegetal' },
      { id: '9', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Cocemos en abundante agua hirviendo y sal al gusto 200 gr de arroz (yo lo he utilizado vaporizado porque se queda más suelto y nos gusta más esta textura para tomarlo frío, pero puedes usar el que más os guste en casa) Mientras el arroz se está cociendo lavamos 2 berenjenas y las cortamos en dados de 2 cm aproximadamente.',
      'Las disponemos en una bandeja de horno, salpimentamos y horneamos a 190º durante 30 minutos.',
      'Reservamos Para hacer la mayonesa trituramos 1 aguacate, 30 gr de tomates secos, 30 gr de anacardos, 4 cucharadas de AOVE, zumo de ½ limón, sal al gusto, 1 cucharadita de comino, 50 ml de leche vegetal o animal y 100 ml de agua si queremos darle más cremosidad.',
      'Y listo, en un recipiente hermético disponemos en un lado el arroz, escurrido y mezclado con 400 gr de lentejas ya cocidas, y la berenjena asada en el otro, y guardamos en la nevera hasta que lo vayamos a comer.',
      'Para ello lo emplatamos como más nos guste y aliñamos con la mayonesa de aguacate y tomates secos, que le va a dar un sabor muy especial a esta comida.',
    ],
    nutrition: {
      totalWeightGrams: 1230,
      perServing: {"calories":543,"protein":34.9,"carbs":63.1,"fat":20.6,"fiber":8.5},
      per100g: {"calories":221,"protein":14.2,"carbs":25.7,"fat":8.4,"fiber":3.5},
    },
  },
  {
    id: 'hamburguesas-de-patata-y-brocoli',
    title: 'Hamburguesas de Patata y Brócoli',
    category: 'Entrantes',
    summary: 'Hamburguesas de Patata y Brócoli al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201129_173206_resized_20201129_053240299.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'brócoli' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Comino y nuez moscada' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'harina de garbanzo' },
    ],
    steps: [
      'En primer lugar pelamos las patatas y las cocemos. Reservamos Mientras se hacen cortamos y picamos la cebolla y el diente de ajo y los sofreímos con una cucharada de AOVE en una sartén de base ancha.',
      'Picamos el brócoli y lo añadimos a la sartén junto con 50 ml de agua y chup chup durante 5 minutos hasta que todo se sofría bien.',
      'Reservamos Una vez que tanto el sofrito como la patata se han enfriado mezclamos en un bol junto a 100 gr de harina de garbanzo, 1 cucharadita de comino, 1 cucharadita de nuez moscada, y sal y pimienta al gusto.',
      'Ya sólo queda darles forma de hamburguesa y dorar en una sartén con un poco de AOVE 2 ó 3 minutos a fuego medio por cada lado.',
    ],
    nutrition: {
      totalWeightGrams: 940,
      perServing: {"calories":394,"protein":15.1,"carbs":55.5,"fat":15.6,"fiber":7.3},
      per100g: {"calories":167,"protein":6.4,"carbs":23.6,"fat":6.6,"fiber":3.1},
    },
  },
  {
    id: 'hamburguesas-de-pollo-y-garbanzos',
    title: 'Hamburguesas de Pollo y Garbanzos',
    category: 'Legumbres',
    summary: 'Hamburguesas de Pollo y Garbanzos al estilo La Vida Bonica.',
    image: 'images/2019_08_IMG_20190826_190620-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 1, unit: '', name: 'calabaza' },
      { id: '4', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal, pimienta y comino' },
    ],
    steps: [
      'Tenemos un montón de calabazas violinas en el huerto, así que todas las semanas solemos hacer alguna asada y cremas de verduras. A los peques les gusta más de esta última manera, así que probamos diferentes ingredientes para no hacerlas siempre de la misma manera.',
      'Os enseño a continuación lo que lleva ésta: En primer lugar pelamos y troceamos en trozos grandes la cebolla, las zanahorias y la calabaza para incorporarlas a una olla con una cucharada de AOVE y sofreírlas 5 minutos a fuego medio.',
      'En segundo lugar, y una vez sofrita la verdura, subimos el fuego y añadimos 500 ml de caldo de verduras o agua y 200 ml de leche de coco. A continuación salpimentamos y podemos incorporar una cucharadita de comino, a nosotros nos encanta el sabor, pero en todo caso lo podemos obviar.',
      'Una vez que rompa a hervir bajamos el fuego y chup chup durante 10 minutos o la verdura esté «al dente» (intentaremos no hacerlas mucho para que no pierdan muchos nutrientes) En último lugar sólo queda trituar muy bien la verdura con parte del caldo de cocción, el cual vamos añadiendo poco a poco, en función de lo que se vaya necesitando.',
      'Rectificamos de sal y listo. En nuestro caso congelaremos y el día anes de consumir pasaremos del congelador a la nevera para no romper la cadena de frío. Hemos de tener en cuenta que cuando se congela una crema de verdura cristaliza el agua que ésta lleva, que es un alto porcentaje.',
      'Por ello, cuando descongelamos a textura cambia, queda como grumosa. ¿Sabéis cómo conseguir que vuelva a tener la textura cremosa de antes de congelarla? Pues muy fácil, volvedla a batir durante unos segundos. De esta manera trituramos los cristales de agua y homogeneizamos la mezcla.',
      'Y lista para comsumir como recién hecha.',
    ],
    nutrition: {
      totalWeightGrams: 1410,
      perServing: {"calories":503,"protein":29.5,"carbs":54.9,"fat":23.1,"fiber":7.1},
      per100g: {"calories":196,"protein":11.5,"carbs":21.4,"fat":9,"fiber":2.8},
    },
  },
  {
    id: 'hamburguesas-de-pollo-y-quinoa',
    title: 'Hamburguesas de Pollo y Quinoa',
    category: 'Carne',
    summary: 'Hamburguesas de Pollo y Quinoa al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191208_202851_resized_20191208_082950144.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 50, unit: 'gr de', name: 'tomates secos' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'anacardos' },
      { id: '3', baseQuantity: 1, unit: '', name: 'patata pequeña cocida' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'pimentón dulce' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'agua' },
      { id: '8', baseQuantity: 2, unit: 'cucharadas de', name: 'AOVE' },
    ],
    steps: [
      'Es bien sencilla, trituramos todo hasta que quede con la consistencia que nos gusta. Guardamos en un recipiente de cristal en la nevera. Listo, hasta aquí 120 minutos de batch cooking con los que hemos conseguido llenar nuestra despensa de buenos alimentos.',
      'Así no tendremos excusas para reucrrir a productos ultraprocesados, y además tendremos tiempo para estar con los peques, hacer deporte, preparar los trajes de las funciones de Navidad … Espero que paséis una bonita semana y nos vemos el próximo domingo Navegación de entradas Anterior Tarta de calabaza y chocolate Siguiente Puré de patatas con toque de tomillo Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 630,
      perServing: {"calories":335,"protein":20.9,"carbs":36.5,"fat":15.1,"fiber":4.9},
      per100g: {"calories":212,"protein":13.2,"carbs":23.1,"fat":9.6,"fiber":3.1},
    },
  },
  {
    id: 'hamburguesas-de-pollo-y-verduras',
    title: 'Hamburguesas de Pollo y Verduras',
    category: 'Carne',
    summary: 'Hamburguesas de Pollo y Verduras al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211211_122934-1000x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pimiento' },
      { id: '2', baseQuantity: 2, unit: '', name: 'puerros' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 2, unit: '', name: 'pechugas de pollo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Cebolla en polvo' },
      { id: '6', baseQuantity: null, unit: '', name: 'Ajo en polvo' },
      { id: '7', baseQuantity: null, unit: '', name: 'Orégano en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '10', baseQuantity: null, unit: '', name: 'Pan integral rallado' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Vamos a preparar unas hamburguesas llenas de sabor y de vegetales. En este caso vamos a utilizar verduras típicas de esta época del año, aunque las puedes sustituir por otras en función de cuándo las vayas a consumir.',
      'Para preparar estas verduras simplemente las vamos a rallar y a sofreír en una sartén con 1 cucharada de AOVE. Las tenemos 6 ó 7 minutos a fuego medio bajo hasta que estén pochadas.',
      'Reservamos en un bol Picamos 2 pechugas de pollo (o que las pique tu carnicero de confianza) y las agregamos al bol donde tenemos las verduras sofritas. Añadimos también 1 cucharadita de cebolla en polvo y 1 cucharadita de ajo en polvo.',
      'Para que la hamburguesa compacte incorporamos 2 huevos y 3 cucharadas de pan integral rallado al bol mientras mezclamos bien. Dejamos reposar en la nevera durante 1 hora. Ya sólo falta formar las hamburguesas y dorarlas en una sartén con una cucharada de AOVE 3 ó 4 minutos por cada lado.',
      'O bien congelarlas ya formadas y simplemente hacer este paso de dorarlas el día que las vayamos a consumir. Y listo, sesión terminada, volvemos a llenar la cocina de buenas opciones y volvemos a tener tiempo para dedicarnos a otras actividades.',
      'Los que seguís este blog sabéis que soy súper fan de ambas cosas, supongo que si estás leyendo estás líneas es porque te preocupa tu alimentación y la de tu familia así como la de pasar tiempo con ellos.',
      'El batch cooking es tu solución, no lo pienses más y empieza a probar haciendo sesiones sencillas de 2 ó 3 días y ya verás como en poco tiempo vas cogiendo destreza y puedes alargarlas hasta completar la semana.',
      'Os deseo una feliz Navidad y un 2022 lleno de buenos momentos con vuestra familia y amigos. Hasta después de las fiestas no volveré a publicar, vamos a estar de aquí para allá y no tendré tiempo de pasar por este blog. Pero seguro que el año que viene nos volvemos a ver. ¡Feliz Navidad!',
      'Navegación de entradas Anterior Sesión de batch cooking rápida, que hay que aprovechar el fin de semana Siguiente Sesión de batch cooking de 90 minutos con lo que había por casa Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":456,"protein":37.4,"carbs":25.9,"fat":22.5,"fiber":4.5},
      per100g: {"calories":184,"protein":15.1,"carbs":10.5,"fat":9.1,"fiber":1.8},
    },
  },
  {
    id: 'hamburguesas-de-quinoa-y-aguacate',
    title: 'Hamburguesas de Quinoa y Aguacate',
    category: 'Entrantes',
    summary: 'Hamburguesas de Quinoa y Aguacate al estilo La Vida Bonica.',
    image: 'images/2019_06_IMG_20190623_202556_resized_20190623_083334136.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'La fruta que más os guste y que sea de temporada. En nuestro caso hemos elegido:' },
      { id: '2', baseQuantity: null, unit: '', name: 'Manzana' },
      { id: '3', baseQuantity: null, unit: '', name: 'Piña' },
      { id: '4', baseQuantity: null, unit: '', name: 'Ciruela' },
      { id: '5', baseQuantity: null, unit: '', name: 'Mango' },
      { id: '6', baseQuantity: null, unit: '', name: 'ALIÑO' },
      { id: '7', baseQuantity: 1, unit: '', name: 'yogur natural o griego' },
      { id: '8', baseQuantity: 50, unit: 'gr de', name: 'queso fresco batido' },
      { id: '9', baseQuantity: null, unit: '', name: 'Canela' },
      { id: '10', baseQuantity: 2, unit: 'cucharadas de', name: 'miel' },
      { id: '11', baseQuantity: null, unit: '', name: 'Un poco de agua' },
    ],
    steps: [
      'Lavamos, pelamos y cortamos la fruta en trozos homogéneos. En un recipiente mezclamos el yogur con el queso fresco batido y añadimos canela en polvo al gusto y la miel mezclada con un poco de agua, para que su manipulación sea más fácil.',
      'Guardamos la fruta en un recipiente hermético y el aliño en otro. Lo mezclaremos a la hora de consumir. No tiene mucho misterio, pero muchas veces lo más sencillo es lo más apetecible. Y nada, hasta aquí la sesión de hoy.',
      'Quería comentaros que llevo unos días publicando diariamente las impresiones que tenemos en casa con la receta del día. Quería hacerlo desde un principio pero no sabía cómo hacerlo sin editar las entradas al blog.',
      'He pensado que por ahora lo haré por Facebook, y si más adelante se me ocurre cómo hacerlo por aquí os lo haré saber. Pasad una bonita semana y nos vemos el próximo domingo.',
      'Navegación de entradas Anterior Tortitas Siguiente Merluza a la cazuela Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 840,
      perServing: {"calories":374,"protein":14.5,"carbs":51.9,"fat":18.5,"fiber":7.5},
      per100g: {"calories":177,"protein":6.9,"carbs":24.7,"fat":8.8,"fiber":3.6},
    },
  },
  {
    id: 'hamburguesas-de-quinoa-y-remolacha',
    title: 'Hamburguesas de Quinoa y Remolacha',
    category: 'Entrantes',
    summary: 'Hamburguesas de Quinoa y Remolacha al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191123_130841-1024x566.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '2', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'calabaza' },
      { id: '4', baseQuantity: 1, unit: '', name: 'patata mediana' },
      { id: '5', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y curry' },
      { id: '7', baseQuantity: 1, unit: '', name: 'naranja' },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'crema de cacahuete sin sal añadida' },
    ],
    steps: [
      'En una olla de base ancha sofreímos el puerro, las zanahorias, la calabaza y la patata, todo ello cortado en trozos medianos (la patata en trozos más pequeños, que tarda más en hacerse), removiendo de vez en cuando.',
      'Cuando vemos que empieza a dorarse incorporamos el litro de caldo de verduras (también puede ser agua), sal y una cucharadita de curry. Chup chup unos 12 minutos, lo suficiente para que la verdura se cocine al dente y no pierda así muchas vitaminas.',
      'Echamos en el vaso de un procesador de alimentos junto a una naranja pelada y una cucharada colmada de mantequilla de cacahuete. Batimos bien hasta que se integren bien todos los ingredientes y ya tenemos lista la crema, esta vez con el toque del cacahuete, ya veréis qué rica.',
      'En este caso voy a duplicar cantidades y así podré congelar 4 raciones en un recipiente y otras 4 raciones en otro. Meteré al congelador. Ya sabéis que al descongelar la verdura el agua que está presente en ella cristaliza y hace que el puré quede grumoso.',
      'Para que vuelva a su consistencia anterior sólo hay que batir unos segundos para que los ingredientes se homogeneicen. De topping nada mejor que unos cuantos cacahuetes machacados, ya veréis qué sabor! 👌🏼😋',
    ],
    nutrition: {
      totalWeightGrams: 1540,
      perServing: {"calories":544,"protein":20.8,"carbs":73.1,"fat":22.1,"fiber":9.3},
      per100g: {"calories":206,"protein":7.9,"carbs":27.8,"fat":8.4,"fiber":3.5},
    },
  },
  {
    id: 'hamburguesas-de-salmon',
    title: 'Hamburguesas de Salmón',
    category: 'Pescado',
    summary: 'Hamburguesas de Salmón al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190922_144306-1024x532.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '2', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '3', baseQuantity: 5, unit: 'cucharadas de', name: 'soperas de harina integral de trigo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso rallado' },
      { id: '6', baseQuantity: 3, unit: 'puñados de', name: 'espinacas frescas' },
    ],
    steps: [
      'Es súper fácil, sólo hay que batir bien todos los ingredientes y freír en una sartén antiadherente engrasada con un poco de mantequilla o AOVE. Si tapamos la sartén necesitaremos menos grasa para hacerlas. Luego las podemos tomar solas o acompañar de lo que se nos ocurra.',
      'En nuestro caso utilizaremos como relleno un poco del pollo especiado que hemos hecho en la misma sesión de batch cooking. Y a ti ¿qué se te ocurre? MARTES: Ensaladilla y hamburguesas de salmón',
    ],
    nutrition: {
      totalWeightGrams: 740,
      perServing: {"calories":343,"protein":26.4,"carbs":20.5,"fat":18.3,"fiber":2.5},
      per100g: {"calories":207,"protein":16,"carbs":12.4,"fat":11.1,"fiber":1.5},
    },
  },
  {
    id: 'hamburguesas-de-verduras-con-garbanzos',
    title: 'Hamburguesas de Verduras con Garbanzos',
    category: 'Legumbres',
    summary: 'Hamburguesas de Verduras con Garbanzos al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200426_151045-1024x548.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 4, unit: '', name: 'lomos de bacalao (yo los uso ya desalados)' },
      { id: '6', baseQuantity: 200, unit: 'ml de', name: 'caldo de pescado' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'rasas de harina' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
    ],
    steps: [
      'Picamos la cebolla, el diente de ajo y los dos pimientos y sofreímos en una sartén de base ancha con 1 cucharada de AOVE durante 15 minutos. Si vemos que le hace falta más líquido podemos añadir más aceite o bien un poco de agua.',
      'Salpimentamos al gusto Una vez que la verdura ya está hecha la introducimos en el vaso de una batidora junto con 200 ml de agua o caldo de pescado y trituramos bien hasta que se nos quede con consistencia de crema. Reservamos.',
      'En la misma sartén donde hemos pochado la verdura vamos a dorar ahora el pescado.',
      'Para ello introducimos en una bolsa un par de cucharadas rasas de harina integral y enharinamos cada lomo de bacalao de forma individual, introduciéndolo en la bolsa, la cual cerramos y agitamos bien para que se impregne todo el lomo.',
      'Una vez enharinados los marcamos en la sartén donde previamente hemos calentado 1 cucharada de AOVE. Los marcamos 2 minutos por cada lado y añadimos la crema de verduras que teníamos reservada, dejamos chup chup a fuego medio durante 2 minutos más y listo.',
      'Nosotros acompañaremos de quinoa cocida MIÉRCOLES: Alcachofas con carne y soufflé de berenjena',
    ],
    nutrition: {
      totalWeightGrams: 1340,
      perServing: {"calories":483,"protein":28.9,"carbs":55.6,"fat":20.9,"fiber":8.1},
      per100g: {"calories":204,"protein":12.2,"carbs":23.5,"fat":8.8,"fiber":3.4},
    },
  },
  {
    id: 'hamburguesas-de-verduras-con-lentejas',
    title: 'Hamburguesas de Verduras con Lentejas',
    category: 'Legumbres',
    summary: 'Hamburguesas de Verduras con Lentejas al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200419_181113-1024x580.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'calabacines medianos.' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'anacardos' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'albahaca fresca' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 30, unit: 'g de', name: 'parmesano rallado' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '7', baseQuantity: null, unit: '', name: 'Pasta integral al gusto' },
      { id: '8', baseQuantity: 250, unit: 'gr de', name: 'colas de gambas peladas' },
      { id: '9', baseQuantity: null, unit: '', name: 'Guindilla (opcional)' },
    ],
    steps: [
      'Pochamos la cebolla bien picada en una olla con una cucharada de AOVE y a fuego medio durante 5 minutos. Cuando empiece a estar dorada añadimos los calabacines a rodajas con la piel.',
      'Dejamos que pochen bien hasta que quede sin caldo (unos 7 minutos a fuego medio-bajo) Metemos la cebolla y el calabacín sofritos, los anacardos, la albahaca y el parmesano en un vaso de batidora y trituramos todo junto. Reservamos.',
      'En la misma sartén doramos 250 gr de colas de gambas con 1 cucharada de AOVE y un poco de guindilla. Reservamos Nosotros haremos hasta aquí. Vamos al congelar este pesto por un lado y las gambas por otro y el día antes de comer lo sacaremos del congelador y directo a la nevera.',
      'Al día siguiente sólo tenemos que cocer la pasta integral en abundante agua con sal, escurrir reservando un vaso del agua de cocción y mezclar con el pesto. Terminaremos añadiendo las gambas sofritas con guindilla Si es necesario añadimos para darle melosidad agua de cocción.',
      'Podemos poner un poco de queso rallado por encima, aunque el pesto ya lleva parmesano. Listo, esta semana tenía un extra pero se me ha quemado y se ha ido a la basura 😔 Creo que es la primera vez que me pasa.',
      'Había hecho un muesli con una muy buena pinta, pero no ha podido ser, a ver si en la próxima me sale, que tampoco era tan dificil, la verdad. ¿Se nota que nos han regalado calabacines? Espero que os gusten a vosotros también porque si no es así esta sesión os va a servir de poco 😄 Os deseo una semana tranquila, espero que no lo estéis pasando muy mal con este confinamiento, os mando mucho ánimo y a seguir luchando 💪 Navegación de entradas Anterior Hummus de habas Siguiente Sopa de espinacas Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1040,
      perServing: {"calories":421,"protein":25.6,"carbs":48.9,"fat":19.3,"fiber":7.1},
      per100g: {"calories":203,"protein":12.3,"carbs":23.5,"fat":9.3,"fiber":3.4},
    },
  },
  {
    id: 'hamburguesas-especiadas-de-pavo',
    title: 'Hamburguesas Especiadas de Pavo',
    category: 'Carne',
    summary: 'Hamburguesas Especiadas de Pavo al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200412_155820-1024x552.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'tomates maduros' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 700, unit: 'ml de', name: 'agua o caldo de verduras' },
      { id: '8', baseQuantity: null, unit: '', name: 'Jengibre fresco' },
      { id: '9', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '10', baseQuantity: 12, unit: '', name: 'aceitunas' },
    ],
    steps: [
      'En una olla con 1 cucharada de AOVE incorporamos 1 pimiento rojo, 2 zanahorias, 1 cebolla y 1 diente de ajo, todo ello troceado. Removemos bien y sofreímos durante 3 minutos a fuego medio.',
      'A continuación añadimos 500 gr de tomates maduros cortados en dados grandes, jengibre fresco picado (al gusto, yo he utilizado un trozo de 1 cm aproximadamente), 700 ml de agua o caldo de verduras, salpimentamos al gusto y dejamos chup chup durante 15 minutos.',
      'Ya sólo nos queda triturar bien hasta dejar la consistencia que más nos gusta. A la hora de comer acompañaremos de huevo cocido y aceitunas',
    ],
    nutrition: {
      totalWeightGrams: 1740,
      perServing: {"calories":574,"protein":34.8,"carbs":63.1,"fat":25.5,"fiber":8.5},
      per100g: {"calories":233,"protein":14.2,"carbs":25.7,"fat":10.4,"fiber":3.5},
    },
  },
  {
    id: 'hamburguesas-vegetales-de-garbanzos-y-calabacin',
    title: 'Hamburguesas Vegetales de Garbanzos y Calabacín',
    category: 'Legumbres',
    summary: 'Hamburguesas Vegetales de Garbanzos y Calabacín al estilo La Vida Bonica.',
    image: 'images/2019_03_BATCH-COOKING-1024x562.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 1, unit: '', name: 'calabacín' },
      { id: '3', baseQuantity: 1, unit: '', name: 'huevo' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'pan integral rallado' },
      { id: '5', baseQuantity: 70, unit: 'gr de', name: 'nueces' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, pimienta y sal' },
    ],
    steps: [
      'Rallamos el calabacín y apretamos con las manos para que suelte la mayor cantidad de agua. Trituramos los garbanzos en un procesador de alimentos junto con la sal, pimienta, comino y perejil. Añadimos el huevo, pan rallado y las nueces y batimos hasta dejar la masa homogénea. Dejamos reposar.',
      'Formamos las hamburguesas y las congelamos. Cuando vayamos a consumnir cocinaremos con una cucharada de AOVE en una sartén, vuelta y vuelta un par de minutos. VIERNES: Ensalada y arroz caldoso con pollo, habas y aceitunas',
    ],
    nutrition: {
      totalWeightGrams: 940,
      perServing: {"calories":394,"protein":22.5,"carbs":43.8,"fat":18.5,"fiber":6.3},
      per100g: {"calories":184,"protein":10.6,"carbs":20.6,"fat":8.7,"fiber":3},
    },
  },
  {
    id: 'hervido-de-judias-verdes-con-refrito',
    title: 'Hervido de Judías Verdes con Refrito',
    category: 'Verdura',
    summary: 'Hervido de Judías Verdes con Refrito al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191027_144805-1024x576.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla pelada y entera' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'judías verdes (yo las he utilizado congeladas)' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'harina integral' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
    ],
    steps: [
      'Ponemos 3 dedos de agua en la olla rápida y ponemos al fuego. Mientras, vamos pelando las patatas, las lavamos y cortamos en 3 trozos grandes e incorporamos a la olla. Pelamos la cebolla y le hacemos un corte sin llegar a partir por la mitad. Incorporamos.',
      'Añadimos también las judías verdes, echamos sal y tapamos. 15 minutos a fuego medio a partir de que rompa a hervir. Apagamos y reservamos Mientras tanto en una sartén agregamos 2 cucharadas de AOVE y doramos 2 dientes de ajo picados con mucho cuidado de que no se quemen.',
      'Cuando empiezan a estar dorados apagamos el fuego, añadimos 1 cucharadita de pimentón y otra de harina, removemos bien. Una vez que la verdura ya está hecha añadimos este refrito en la olla, le damos un suave hervor de un par de minutos y listo.',
    ],
    nutrition: {
      totalWeightGrams: 1540,
      perServing: {"calories":245,"protein":6.3,"carbs":43.5,"fat":7.5,"fiber":6.5},
      per100g: {"calories":101,"protein":2.6,"carbs":17.9,"fat":3.1,"fiber":2.7},
    },
  },
  {
    id: 'hummus-de-alubias-boniato-asado-y-tomates-secos',
    title: 'Hummus de Alubias, Boniato Asado y Tomates Secos',
    category: 'Legumbres',
    summary: 'Hummus de Alubias, Boniato Asado y Tomates Secos al estilo La Vida Bonica.',
    image: 'images/2020_11_RBC-e1665940576600.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Pulpa de un boniato asado' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '3', baseQuantity: 40, unit: 'gr de', name: 'tomates secos' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'colmada de semillas de sésamo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '6', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) sal y pimienta' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '9', baseQuantity: 150, unit: 'ml de', name: 'agua o caldo de verduras' },
    ],
    steps: [
      'Cada vez nos gusta más tener recetas de este tipo en la nevera, tipo hummus, pesto, patés vegetales… Porque los usamos como toppings en las ensaladas, como salsa de un plato de pasta o como snack con crudités a media tarde y son recetas muy resultonas al tiempo que buenas opciones.',
      'Aguantan varios días en la nevera y son súper fáciles de hacer, sólo hemos de introducir todos los ingredientes en el vaso de un potente procesador de alimentos y triturar bien hasta que se nos quede con la consistencia deseada.',
      'En este caso utilizaremos la carne de un boniato asado, 400 gr de alubias cocidas, 40 gr de tomates secos, 1 cucharada colmada de semillas de sésamo, el zumo de ½ limón, 1 diente de ajo sin simiente, 2 cucharadas de AOVE, 1 cucharadita de albahaca seca y sal y pimienta al gusto.',
      'Como ingrediente opcional, y para conseguir la cremosidad que más guste en casa podemos utilizar más AOVE, aunque en mi caso prefiero sustituirlo por agua o caldo de verduras, porque también queda muy rico y no añadimos tantas calorías al plato. Y ya está, directo a un recipiente hermético.',
      'Ya tenemos alegría para las ensaladas de los próximos días 😍',
    ],
    nutrition: {
      totalWeightGrams: 840,
      perServing: {"calories":335,"protein":15.1,"carbs":43.9,"fat":17.3,"fiber":7.1},
      per100g: {"calories":177,"protein":8,"carbs":23.2,"fat":9.2,"fiber":3.8},
    },
  },
  {
    id: 'hummus-de-garbanzos-con-nueces',
    title: 'Hummus de Garbanzos con Nueces',
    category: 'Legumbres',
    summary: 'Hummus de Garbanzos con Nueces al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1-1024x798.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '2', baseQuantity: 10, unit: '', name: 'nueces' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'tahini' },
      { id: '4', baseQuantity: 1, unit: '', name: 'ajo (le quito la simiente)' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '6', baseQuantity: null, unit: '', name: 'zumo de limón' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) y sal' },
    ],
    steps: [
      'Como cualquier hummus no tiene más que incorporar los ingredientes (menos el caldo de verduras) en el vaso de un procesador de alimentos y batir bien hasta que tenga la consistencia que más nos guste: 400 gr de garbanzos cocidos, 10 nueces peladas, 1 cucharada de tahini, 1 diente de ajo sin simiente, 1 cucharadita colmada de comino molido, 1 cucharada de AOVE y sal al gusto.',
      'Como en casa nos gusta meloso le voy incorporando caldo de verduras mientras lo estoy triturando y así le da también más sabor.',
      'El limón lo suelo incorporar poco a poco porque a tiempo de añadir siempre estamos, ¿no os parece? Y listo, con este sabroso hummus podemos aliñar una ensalada, acompañar unas patatas cocidas, comer con unas rebanadas de pan integral, hasta solo a cucharadas se presta de lo rico que está.',
      'Esta semana de acompañamiento tenemos quinoa y huevos cocidos. Y nada más (y nada menos), hasta aquí la sesión de hoy. Espero que le saquéis provecho y os animéis a incorporar el batch cooking en vuestra rutina.',
      'Si no queréis comer siempre lo mismo y os preocupa llevar una alimentación saludable esta herramienta os puede ayudar a ahorrar un buen montón de tiempo, que podéis utilizar para hacer otras cosas bonitas.',
      'Y en la cabeza cero estrés por lo que se va a comer en casa ese día. ¿Te lo imaginas? ¡Feliz semana! Navegación de entradas Anterior Sesión de batch cooking con horno y microondas, que se nos ha roto la placa.',
      'Siguiente Sesión de batch cooking para un regimiento (y sólo somos 4 en casa) Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 740,
      perServing: {"calories":394,"protein":16.5,"carbs":43.5,"fat":23.9,"fiber":7.3},
      per100g: {"calories":212,"protein":8.9,"carbs":23.4,"fat":12.9,"fiber":3.9},
    },
  },
  {
    id: 'hummus-de-garbanzos-con-tomates-secos',
    title: 'Hummus de Garbanzos con Tomates Secos',
    category: 'Legumbres',
    summary: 'Hummus de Garbanzos con Tomates Secos al estilo La Vida Bonica.',
    image: 'images/2022_01_collage-777x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de sésamo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'ajo (le quito la simiente)' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '4', baseQuantity: null, unit: '', name: 'El zumo de un limón grande' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'tomates secos' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'caldo de verduras' },
      { id: '8', baseQuantity: null, unit: '', name: 'Pimentón y Aceite de Oliva Virgen Extra (AOVE) para decorar' },
    ],
    steps: [
      'Es cuestión de batirlo todo muy bien hasta que quede una crema homogénea. El caldo de verduras le da un toque de sabor que en casa nos gusta mucho, pero lo podemos sustituir por agua. En el momento de consumir presentamos en un cuenco y añadiremos pimentón y un chorrito de AOVE.',
    ],
    nutrition: {
      totalWeightGrams: 640,
      perServing: {"calories":294,"protein":14.9,"carbs":36.5,"fat":16.5,"fiber":6.5},
      per100g: {"calories":173,"protein":8.8,"carbs":21.6,"fat":9.8,"fiber":3.8},
    },
  },
  {
    id: 'kebabs-de-pollo-marinado',
    title: 'Kebabs de Pollo Marinado',
    category: 'Carne',
    summary: 'Kebabs de Pollo Marinado al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190915_145818-1024x510.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'quinoa.' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tomates crudos cortados en dados' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla cortada en dados (yo lo hago lo primero y la meto en un bowl con agua y mucho vinagre, para que luego no pique)' },
      { id: '4', baseQuantity: 2, unit: 'latas de', name: 'atún natural' },
      { id: '5', baseQuantity: null, unit: '', name: 'un puñado de nueces troceadas' },
      { id: '6', baseQuantity: 1, unit: '', name: 'aguacate' },
    ],
    steps: [
      'En primer lugar lavamos bien la quinoa y cocemos en una olla con agua. Llevamos a ebullición y a fuego medio unos 15 minutos. A continuación dejamos escurrir bien. Mientras tanto picamos los tomates, la cebolla y el aguacate. Reservamos Troceamos un puñado de nueces.',
      'Por último sólo nos queda mezclar todos los ingredientes: La quinoa bien escurrida, la verdura picada, las 2 latas de atún y el puñado de nueces. La aliñamos con aceite, sal y vinagre cuando la vamos a consumir, no antes',
    ],
    nutrition: {
      totalWeightGrams: 1040,
      perServing: {"calories":421,"protein":35.5,"carbs":25.9,"fat":23.9,"fiber":4.5},
      per100g: {"calories":203,"protein":17.1,"carbs":12.5,"fat":11.5,"fiber":2.2},
    },
  },
  {
    id: 'lasana-de-calabacin',
    title: 'Lasaña de Calabacín',
    category: 'Hidratos',
    summary: 'Lasaña de Calabacín al estilo La Vida Bonica.',
    image: 'images/2020_09_rbc-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '2', baseQuantity: 2, unit: '', name: 'trozos de apio' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Morcillo y carne de pollo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'ajos enteros pelados' },
      { id: '6', baseQuantity: null, unit: '', name: 'el zumo de un limón' },
      { id: '7', baseQuantity: 1, unit: '', name: 'tomate rallado' },
      { id: '8', baseQuantity: null, unit: '', name: 'sal y pimienta' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
    ],
    steps: [
      'Esta receta es de lo más socorrida para aquellas sesiones de batch cooking exprés en las que tenemos poco tiempo, y ello es porque es muy rápida de hacer y tenemos comida resuelta para dos días.',
      'Es tan sencillo como incorporar todos los ingredientes en una olla rápida: 4 zanahorias grandes, 2 trozos de apio, 2 ó 3 patatas grandes, carne como morcillo, pollo, huesos para que le dé sabor (en hipermercados ya venden bandejas especiales para este guiso y si no preguntamos al carnicero), 2 ajos enteros pelados, el zumo de un limón, 1 tomate rallado, 400 gr garbanzos y sal y pimienta al gusto.',
      'A continuación ponemos agua hasta que cubra, cerramos la olla y ponemos a fuego fuerte. Una vez que rompa a hervir bajamos el fuego medio y tenemos chup chup 20 minutos. Y ya lo tenemos.',
      'A mi me gusta, una vez atemperado, separar los diferentes ingredientes para que el emplatado sea más rápido: Desmenuzo la carne y dispongo aparte de las patatas, garbanzos y verdura. Así en el momento de consumir todo es más rápido.',
    ],
    nutrition: {
      totalWeightGrams: 1640,
      perServing: {"calories":543,"protein":29.5,"carbs":55.6,"fat":25.9,"fiber":7.3},
      per100g: {"calories":221,"protein":12,"carbs":22.7,"fat":10.6,"fiber":3},
    },
  },
  {
    id: 'lasana-de-coliflor',
    title: 'Lasaña de Coliflor',
    category: 'Hidratos',
    summary: 'Lasaña de Coliflor al estilo La Vida Bonica.',
    image: 'images/2020_10_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor pequeña' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'carne picada (pícala tú mismo o tu carnicero de confianza, así sabes que lo que estás tomando es carne 100%)' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'tomates maduros' },
      { id: '4', baseQuantity: 2, unit: '', name: 'cebollas pequeñas' },
      { id: '5', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'queso rallado' },
      { id: '7', baseQuantity: null, unit: '', name: 'Nuez moscada y pimentón ahumado' },
      { id: '8', baseQuantity: 3, unit: 'cucharadas de', name: 'harina de garbanzo' },
      { id: '9', baseQuantity: null, unit: '', name: 'Varios pellizcos de mantequilla' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'En primer lugar rallamos la coliflor e incorporamos en un bol. Le añadimos sal y pimienta al gusto, ½ cucharadita de nuez moscada y 2 huevos. Mezclamos bien y reservamos. En otro bol agregamos 500 gr de carne picada, 400 gr de tomates maduros pelados y picados y 2 cebollas también picadas.',
      'Removemos bien y añadimos sal y pimienta al gusto, 1 cucharadita de pimentón ahumado y 3 cucharadas de harina de garbanzo.',
      'En un recipiente apto para horno previamente engrasado formamos una base de coliflor, por encima se distribuye una capa del preparado de carne y seguimos haciendo capas hasta que terminemos las 2 mezclas. Espolvoreamos 50 gr de queso rallado y unos pequeños pellizquitos de mantequilla.',
      'Tapamos con papel de aluminio y horneamos a 180º durante 30 minutos, quitamos el papel y seguimos horneando 15 minutos más a 210º Y ya tenemos una especie de lasaña, pero en vez de utilizar placas de pasta hemos usado coliflor picada. ¿Os apetece probar?',
    ],
    nutrition: {
      totalWeightGrams: 1440,
      perServing: {"calories":503,"protein":34.9,"carbs":43.1,"fat":25.5,"fiber":6.3},
      per100g: {"calories":217,"protein":15.1,"carbs":18.7,"fat":11,"fiber":2.7},
    },
  },
  {
    id: 'lasana-de-espinacas',
    title: 'Lasaña de Espinacas',
    category: 'Hidratos',
    summary: 'Lasaña de Espinacas al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220326_113033-1024x885.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 8, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar vamos a poner a cocer abundante agua y sal al gusto y mientras ésta se va calentando limpiamos y cortamos en cuartos las alcachofas. Para ello las limpiamos quitando las primeras hojas, que son las de color verde más oscuro, hasta llegar a las que son más blancas y tiernas.',
      'Pelamos también el tallo y lo sumergimos todo en agua y limón o perejil para evitar la oxidación. En el momento en el que el agua de la olla empieza a hervir introducimos las alcachofas y tenemos chup chup a fuego medio durante 15 minutos. Escurrimos y reservamos.',
      'Para terminar con la receta sofreímos en una sartén de base ancha con 1 cucharada de AOVE 8 ajos tiernos limpios y picados. Los tenemos 2 minutos a fuego medio bajo hasta que se doren.',
      'A continuación incorporamos 300 gr de gambas peladas, las alcachofas que hemos cocido, 4 cucharadas de salsa de tomate,1 cucharadita de orégano y sal y pimienta al gusto y tenemos a fuego fuerte durante 1 ó 2 minutos hasta que las gambas se empiezan a dorar.',
      'Bajamos el fuego, incorporamos 1 bola de mozzarella a trocitos, tapamos y dejamos 2 minutos más. Y ya tenemos preparado un primer plato lleno de color, espero que os guste tanto como a nosotros.',
    ],
    nutrition: {
      totalWeightGrams: 1410,
      perServing: {"calories":523,"protein":37.8,"carbs":23.9,"fat":34.9,"fiber":4.8},
      per100g: {"calories":371,"protein":26.8,"carbs":16.9,"fat":24.7,"fiber":3.4},
    },
  },
  {
    id: 'lasana-de-pollo-y-bechamel-de-setas',
    title: 'Lasaña de Pollo y Bechamel de Setas',
    category: 'Carne',
    summary: 'Lasaña de Pollo y Bechamel de Setas al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pechugas de pollo' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE) sal y pimienta' },
      { id: '7', baseQuantity: 2, unit: '', name: 'bolas de queso mozzarella' },
      { id: '8', baseQuantity: 80, unit: 'gr de', name: 'tomates secos' },
      { id: '9', baseQuantity: 300, unit: 'gr de', name: 'queso crema' },
      { id: '10', baseQuantity: 250, unit: 'ml de', name: 'leche' },
      { id: '11', baseQuantity: 250, unit: 'gr de', name: 'setas' },
      { id: '12', baseQuantity: 12, unit: '', name: 'láminas de pasta para lasaña cocidas' },
    ],
    steps: [
      'En primer lugar adobamos 600 gr de pechuga de pollo con 1 cucharada de AOVE, 1 cucharadita de ajo en polvo, otra de pimentón, otra de orégano seco, otra de albahaca seca, sal y pimienta al gusto y dejamos en la nevera durante al menos 30 minutos en un recipiente tapado.',
      'Mientras el adobo está impregnando la carne con su aroma y sabor podemos preparar la salsa que la va a acompañar: Para ello trituramos 250 gr de setas y mezclamos bien con 300 gr de queso crema, 250 ml de leche, sal y pimienta al gusto.',
      'Una vez que ha pasado el tiempo doramos la pechuga con un poco de AOVE en una sartén a fuego medio alto para que la carne selle bien. La trituramos y la mezclamos con 80 gr de tomates secos y 1 bola de mozarella, todo ello también picado.',
      'Precalentamos el horno a 180º y mientras alcanza la temperatura disponemos en un recipiente apto para horno ⅓ de la salsa de setas, placas de lasaña precocida y relleno de carne. Y vuelta a empezar: Salsa de setas, placas y relleno de carne. Nos han de salir 3 pisos.',
      'Terminamos con salsa de setas y una bola de mozzarella picada por encima, tapamos con papel vegetal o aluminio y horneamos 20 minutos a 180º, destapamos y dejamos 10 minutos más a la misma temperatura. ¡Ya veréis qué rica!',
    ],
    nutrition: {
      totalWeightGrams: 2830,
      perServing: {"calories":943,"protein":63.9,"carbs":54.8,"fat":57.8,"fiber":6.1},
      per100g: {"calories":334,"protein":22.7,"carbs":19.4,"fat":20.5,"fiber":2.2},
    },
  },
  {
    id: 'lentejas-a-las-1001-noches',
    title: 'Lentejas a las 1001 Noches',
    category: 'Legumbres',
    summary: 'Lentejas a las 1001 Noches al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1-1024x798.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'tahini' },
      { id: '3', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de ajo en polvo' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'Aceite de Olvia Virgen Extra (AOVE)' },
      { id: '6', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Para la preparación de esta ensalada necesitamos una olla con agua hirviendo y sal para cocer las acelgas y el kale, previamente picadas, a fuego medio durante 5 minutos. Escurrimos y reservamos.',
      'Otra olla con agua hirviendo (o la misma si no lo haces al mismo tiempo) y agua donde cocer durante 12 minutos 160 gr de quinoa (lo que siempre os digo, aprovechamos la oportunidad para cocer más quinoa y tener un acompañamiento extra preparado con el que llenar nuestra cocina de buenas opciones).',
      'Mientras tanto podemos preparar la vinagreta. Para ello sólo necesitamos mezclar con vigor 6 cucharadas de salsa de soja, 1 cucharadita de tahini, el zumo de ½ limón, 2 cucharadas de AOVE, 1 cucharadita colmada de ajo en polvo y sal y pimienta al gusto. Reservamos.',
      'Y en una sartén grande con 1 cucharada de AOVE salteamos 1 cebolleta previamente picada, a fuego medio durante 3 minutos aproximadamente. Añadimos entonces 100 gr de jamón serrano picado y removemos bien.',
      'Incorporamos entonces la verdura (acelgas y kale) que ya tenemos cocida y subimos el fuego para que se dore bien y pierda el agua que le pueda quedar de la cocción.',
      'Agregamos entonces la vinagreta, removemos de forma consciente durante unos segundos y cuando veamos que todos los ingredientes quedan bien impregnados apagamos el fuego. Y listo.',
      'En el recipiente donde vamos a guardar la ensalada disponemos la quinoa cocida y la verdura salteada con el jamón y la vinagreta, a falta de disfrutar cuando nos toque.',
    ],
    nutrition: {
      totalWeightGrams: 240,
      perServing: {"calories":120,"protein":2.5,"carbs":6.3,"fat":10.5,"fiber":1.9},
      per100g: {"calories":500,"protein":10.4,"carbs":26.3,"fat":43.8,"fiber":7.9},
    },
  },
  {
    id: 'lentejas-con-acelgas',
    title: 'Lentejas con Acelgas',
    category: 'Legumbres',
    summary: 'Lentejas con Acelgas al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220326_113033-1024x885.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 8, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar vamos a poner a cocer abundante agua y sal al gusto y mientras ésta se va calentando limpiamos y cortamos en cuartos las alcachofas. Para ello las limpiamos quitando las primeras hojas, que son las de color verde más oscuro, hasta llegar a las que son más blancas y tiernas.',
      'Pelamos también el tallo y lo sumergimos todo en agua y limón o perejil para evitar la oxidación. En el momento en el que el agua de la olla empieza a hervir introducimos las alcachofas y tenemos chup chup a fuego medio durante 15 minutos. Escurrimos y reservamos.',
      'Para terminar con la receta sofreímos en una sartén de base ancha con 1 cucharada de AOVE 8 ajos tiernos limpios y picados. Los tenemos 2 minutos a fuego medio bajo hasta que se doren.',
      'A continuación incorporamos 300 gr de gambas peladas, las alcachofas que hemos cocido, 4 cucharadas de salsa de tomate,1 cucharadita de orégano y sal y pimienta al gusto y tenemos a fuego fuerte durante 1 ó 2 minutos hasta que las gambas se empiezan a dorar.',
      'Bajamos el fuego, incorporamos 1 bola de mozzarella a trocitos, tapamos y dejamos 2 minutos más. Y ya tenemos preparado un primer plato lleno de color, espero que os guste tanto como a nosotros.',
    ],
    nutrition: {
      totalWeightGrams: 1410,
      perServing: {"calories":523,"protein":37.8,"carbs":23.9,"fat":34.9,"fiber":4.8},
      per100g: {"calories":371,"protein":26.8,"carbs":16.9,"fat":24.7,"fiber":3.4},
    },
  },
  {
    id: 'lentejas-con-leche-de-coco',
    title: 'Lentejas con Leche de Coco',
    category: 'Legumbres',
    summary: 'Lentejas con Leche de Coco al estilo La Vida Bonica.',
    image: 'images/2021_05_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo grande' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'bacalao fresco' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'La idea era hacer escalivada en el horno y asar un pimiento más para utilizar en esta receta, pero como el horno no ha querido funcionar he optado por asarlo en el microondas a máxima potencia durante 10 minutos, con unas gotas de agua y tapado.',
      'Reservamos Las patatas las suelo hacer en el microondas, por el ahorro de aceite sobre todo. Bien lavadas y cortadas en rodajas más bien finas, con una cucharada de AOVE, una cucharada de agua y sal y pimienta al gusto. Las programo 12-14 minutos a máxima potencia y listo.',
      'Mientras tenemos las patatas cocinándose ponemos una cucharada de AOVE en la sartén donde vamos a hacer la tortilla y con el fuego medio salteamos el bacalao durante uno o dos minutos. Reservamos.',
      'Batimos 6 huevos, añadimos 1 cucharadita de orégano, 1 cucharadita de ajo en polvo, sal y pimienta al gusto, el bacalao salteado, el pimiento asado previamente picado y las patatas ya cocinadas, y mezclamos bien todos los ingredientes. Ya sólo nos queda cuajar la tortilla.',
      'Para ello calentamos un poco de AOVE en esa misma sartén que hemos utilizado para saltear el bacalao, y cuando esté caliente volcamos la mezcla. Yo suelo tener el fuego alto al principio, pero no más de 30 segundos, enseguida le bajo el fuego a media temperatura para que no se queme.',
      'Y enseguida le damos la vuelta para que se termine de cuajar, Es importante que no se haga mucho porque da gusto que se quede jugosa, y el bacalao seco no es muy apetecible al paladar. Lo he ido poniendo todo por capas y en la foto no se aprecian todos los ingredientes',
    ],
    nutrition: {
      totalWeightGrams: 1820,
      perServing: {"calories":734,"protein":43.8,"carbs":34.9,"fat":51.9,"fiber":5.5},
      per100g: {"calories":403,"protein":24.1,"carbs":19.2,"fat":28.5,"fiber":3},
    },
  },
  {
    id: 'lentejas-con-pavo-y-coliflor',
    title: 'Lentejas con Pavo y Coliflor',
    category: 'Legumbres',
    summary: 'Lentejas con Pavo y Coliflor al estilo La Vida Bonica.',
    image: 'images/2020_08_IMG_20200802_105415.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 500, unit: 'gr de', name: 'coliflor' },
      { id: '5', baseQuantity: 800, unit: 'gr de', name: 'solomillo de pavo' },
      { id: '6', baseQuantity: 60, unit: 'gr de', name: 'chorizo ibérico' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '8', baseQuantity: null, unit: '', name: 'Comino, pimentón y cúrcuma' },
      { id: '9', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
    ],
    steps: [
      'En primer lugar sofreímos el pimiento, la cebolla y el puerro con 1 cucharada de AOVE en una olla de base ancha y a fuego alto durante 3 minutos. Una vez pasado este tiempo bajamos el fuego, añadimos medio vaso de agua (o más aceite) y dejamos que se siga sofriendo durante 12 minutos.',
      'Como veis he usado el mismo sofrito para los 2 guisos, así que la explicación es la misma.',
      'Mientras que el sofrito se hace podemos selllar la carne de pavo que vamos a utilizar en una sartén aparte, con 1 cuchadita de AOVE y a fuego medio alto para que se haga rápido y no se pierdan los jugos, aunque al ser un guiso no es necesario (pero acortamos tiempo, y hoy quería hacer una sesión corta) Una vez pasado el tiempo trituramos bien el sofrito hasta que quede una consistencia cremosa, añadimos 300 ml de caldo de verduras, 400 gr de lentejas cocidas, la carne de pavo previamente sellada, 60 gr de chorizo ibérico bien picado, 1 cucharadita colmada de pimentón, otra de comino, otra de cúrcuma y sal y pimienta al gusto.',
      'Lo dejamos chup chup durante 5 minutos, incorporamos los arbolitos de coliflor (yo los he utilizado congelados), seguimos con el chup chup 5-7 minutos más y listo, ya tenemos otro rico guiso preparado.',
      'Estos acompañamientos semanales nunca faltan en casa HUEVOS COCIDOS: Nos encantan, no lo podemos remediar. Es una gran fueste de proteína natural llena de vitaminas A,D,K y algunas Bs y minerales como potasio y hierro.',
      'Nos gusta tener a mano huevos cocidos para un tentempie, un desayuno, acompañar una ensalada… Y también los consumimos en forma de tortilla y revueltos con verduras.',
      'Cada vez leo más estudios que demuestran el gran mito con el que muchos hemos crecido, el de «no es bueno comer más de 2-3 huevos por semana», y después de documentarme hemos incrementado su consumo y los resultados de nuestras analíticas siguen siendo buenos, no tenemos más colesterol ahora que antes.',
      'Así que los utilizamos como fuente de proteína y los compramos de gallinas ecológicas (código 1) o ecológicos (código 0) Os dejo aquí algunos links que corroboran lo que os comento: https://www.fitnessrevolucionario.com/2015/01/24/cuantos-huevos-puedes-comer-crudos-blancos-o-marrones-y-mas-sobre-tus-huevos/ https://blogs.alimente.elconfidencial.com/mas-anos-mas-vida/2019-08-06/huevo-colesterol-ciencia-salud-cardiovascular_2163727/ ARROZ COCIDO: Nos saca de un apuro para cualquier comida pues admite casi cualquier acompañamiento.',
      'En casa solemos tener arroz integral, vaporizado y de grano largo y los voy alternando.',
    ],
    nutrition: {
      totalWeightGrams: 2460,
      perServing: {"calories":857,"protein":54.5,"carbs":24.1,"fat":53.9,"fiber":7.1},
      per100g: {"calories":348,"protein":22.2,"carbs":9.8,"fat":22,"fiber":2.9},
    },
  },
  {
    id: 'lentejas-con-salmon',
    title: 'Lentejas con Salmón',
    category: 'Legumbres',
    summary: 'Lentejas con Salmón al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210207_193855322_resized_20210207_073919808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'champiñones' },
      { id: '4', baseQuantity: 400, unit: 'ml de', name: 'caldo de verduras' },
      { id: '5', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'jengibre seco' },
      { id: '7', baseQuantity: 10, unit: 'gr de', name: 'mantequilla' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'salmón' },
    ],
    steps: [
      'En primer lugar sofreímos un puerro picado en una olla de base ancha, a fuego medio y con 10 gr de mantequilla y 1 cucharada de AOVE. Lo tenemos a fuego medio hasta que empiece a tomar un color dorado.',
      'En ese momento añadimos 250 gr de champiñones troceados como más os guste, removemos y dejamos que doren.',
      'Añadimos entonces 400 gr de lentejas cocidas, 400 ml de caldo de verduras, 4 cucharadas de salsa de soja, ½ cucharadita de jengibre seco (o un trozo rallado de jengibre fresco), y sal y pimienta al gusto y dejamos chup chup durante 15 minutos. Mientras tanto cocinamos a la plancha el salmón.',
      'Reservamos y cuando enfríe desmenuzamos, incorporamos a la olla, removemos y listo, plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2140,
      perServing: {"calories":734,"protein":51.5,"carbs":24.9,"fat":46.9,"fiber":6.3},
      per100g: {"calories":343,"protein":24.1,"carbs":11.7,"fat":22,"fiber":2.9},
    },
  },
  {
    id: 'lentejas-con-setas-y-arroz',
    title: 'Lentejas con Setas y Arroz',
    category: 'Legumbres',
    summary: 'Lentejas con Setas y Arroz al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'jamón york (más del 90%-95% de carne nos asegura tomar un fiambre de calidad)' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Tras limpiarlos de tierra colocamos los champiñones en una bandeja apta para horno, les quitamos los rabitos y los picamos, así como 60 gr de jamón york con alto contenido de carne (más del 90%, yo utilizo uno de ALDI que lleva un 96%).',
      'Rallamos 50 gr de queso Emmental y mezclamos con el jamón y el champiñón picado. Con esta mezcla rellenamos los champiñones, cubrimos la bandeja con papel de aluminio o papel vegetal y horneamos a 180º durante 30 minutos.',
      'Debería ser suficiente, no conviene cocinar mucho los champiñones para que no suelten mucha agua. Mi horno es grande y lento, seguramente con el tuyo se hagan en menos tiempo, compruébalo.',
    ],
    nutrition: {
      totalWeightGrams: 1010,
      perServing: {"calories":454,"protein":23.9,"carbs":26.5,"fat":29.5,"fiber":4.5},
      per100g: {"calories":449,"protein":23.7,"carbs":26.2,"fat":29.3,"fiber":4.5},
    },
  },
  {
    id: 'lentejas-estofadas-con-arroz',
    title: 'Lentejas Estofadas con Arroz',
    category: 'Legumbres',
    summary: 'Lentejas Estofadas con Arroz al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191019_173700-1-1024x879.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 200, unit: 'gr de', name: 'lentejas pardinas secas' },
      { id: '2', baseQuantity: 120, unit: 'gr de', name: 'arroz' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla grande' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'tomates maduros' },
      { id: '6', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '7', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '8', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '9', baseQuantity: 1, unit: 'hoja de', name: 'laurel' },
      { id: '10', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras' },
      { id: '11', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, cúrcuma y sal.' },
    ],
    steps: [
      'Si recordamos dejar la noche antes las lentejas a remojo mucho mejor. En primer lugar picamos la cebolla y el ajo y sofreímos en una olla rápida a fuego medio con una cucharada de AOVE y mucho cuidado de que no se queme.',
      'Pelamos el tomate, quitamos las pepitas, cortamos en dados y lo añadimos a la olla junto con otra cucharada de AOVE. Hacemos lo mismo con las zanahorias y el pimiento, lo rectificamos de sal y dejamos a fuego medio-bajo durante 5 minutos más.',
      'Seguidamente añadimos la cúrcuma, la hoja de laurel, el zumo de ½ limón, las patatas cortadas en dados, 500 ml de caldo de verduras, el arroz y las lentejas y cerramos la olla. Lo tenemos a fuego medio desde que rompa a hervir 20 minutos.',
      'Y ya están preparadas, un plato de lo más completo para saciar nuestro apetito. MIÉRCOLES: Pescado en salsa de piquillos y patatas aliñadas con limón',
    ],
    nutrition: {
      totalWeightGrams: 1720,
      perServing: {"calories":573,"protein":21.1,"carbs":73.5,"fat":20.5,"fiber":8.9},
      per100g: {"calories":333,"protein":12.3,"carbs":42.9,"fat":11.9,"fiber":5.2},
    },
  },
  {
    id: 'lomos-de-atun-con-soja',
    title: 'Lomos de Atún con Soja',
    category: 'Pescado',
    summary: 'Lomos de Atún con Soja al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1024x710.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'lomo de atún cortado en tacos regulares' },
      { id: '2', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '5', baseQuantity: null, unit: '', name: 'Zumo de medio limón' },
      { id: '6', baseQuantity: 50, unit: 'ml de', name: 'caldo de pollo' },
    ],
    steps: [
      'Secamos muy bien los tacos de atún para que no tengan nada de líquido. En mi caso son congelados, así que los he dejado descongelar y los he secado con papel de cocina.',
      'Ponemos una sartén a fuego fuerte con una cucharada de AOVE y sellamos los tacos de atún por todos los lados apenas 1 minuto por cada lado, lo justo para sellarlos.',
      'Reservamos Para hacer la salsa y una vez reservados los lomos incorporamos una cucharada de AOVE en la sartén y sofreímos a fuego medio bajo 2 dientes de ajo bien picados.',
      'Cuando el ajo esté dorado y con cuidado de que no se queme añadimos 50 ml de caldo de pollo, 4 cucharadas de salsa de soja,el zumo de medio limón y sal y pimienta al gusto.',
      'Lo tenemos 2 minutos a fuego fuerte, incorporamos los tacos de atún, lo tenemos 1 minuto más y listo, es mejor no hacer mucho este pescado para que no se reseque.',
    ],
    nutrition: {
      totalWeightGrams: 950,
      perServing: {"calories":369,"protein":43.8,"carbs":4.1,"fat":23.5,"fiber":1.3},
      per100g: {"calories":389,"protein":46.3,"carbs":4.3,"fat":24.9,"fiber":1.4},
    },
  },
  {
    id: 'lomos-de-atun-marinado-con-salsa-de-pimientos',
    title: 'Lomos de Atún Marinado con Salsa de Pimientos',
    category: 'Pescado',
    summary: 'Lomos de Atún Marinado con Salsa de Pimientos al estilo La Vida Bonica.',
    image: 'images/2020_08_IMG_20200823_115506-1024x845.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'pimientos asados' },
      { id: '2', baseQuantity: 50, unit: 'ml de', name: 'nata fresca' },
      { id: '3', baseQuantity: 1, unit: '', name: 'tomate maduro' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y pimentón' },
    ],
    steps: [
      'Lo primero que hemos de hacer es marinar los lomos de atún y para ello disponemos en un recipiente hondo 4 cucharadas de salsa de soja sin azúcar, 2 dientes de ajo picado, un trozo de jengibre fresco rallado, 1 cucharadita de hierbas provenzales y sal y pimienta al gusto.',
      'Introducimos los lomos de atún en él y les damos la vuelta con cuidado, para que ambos lados queden bien impregnados. Tapamos el recipiente y reservamos en la nevera al menos 30 minutos.',
      'Mientras tanto preparamos la salsa: En el vaso de la batidora incorporamos 100 gr de pimientos asados (yo los he utilizado de bote, sin azúcar añadido) 50 ml de nata fresca, 1 tomate maduro pelado, 1 cucharadita colmada de sal y otra de pimentón.',
      'Batimos muy bien hasta que queden incorporados todos los ingredientes y reservamos. Ya sólo nos queda dorar los lomos 1 minuto a fuego fuerte por cada lado en una sartén o plancha. Y ya tenemos nuestro plato preparado.',
      'A la hora de comer acompañaremos de la salsa de pimientos, así que lo guardamos en la nevera en recipientes distintos. MIÉRCOLES: Ensalada con escalivada y patatas y pavo al estilo Cajún Aprovechamos que queda espacio en la bandeja y horneamos al mismo tiempo esta verdura con el pavo y las patatas.',
    ],
    nutrition: {
      totalWeightGrams: 250,
      perServing: {"calories":141,"protein":12.3,"carbs":6.9,"fat":8.5,"fiber":2.1},
      per100g: {"calories":564,"protein":49.2,"carbs":27.6,"fat":34,"fiber":8.4},
    },
  },
  {
    id: 'lomos-de-bacalao-con-coles-de-bruselas',
    title: 'Lomos de Bacalao con Coles de Bruselas',
    category: 'Pescado',
    summary: 'Lomos de Bacalao con Coles de Bruselas al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'calabaza asada' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tallos de apio' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'bebida vegetal' },
      { id: '6', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'queso' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'romero' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'La semana pasada preparé una sopa con calabaza asada que nos encantó, así que esta semana repetimos ingrediente principal y cambiamos los demás, a ver cuál nos gusta más. En primer lugar asamos 400 gr de calabaza durante 30 minutos a 190º.',
      'Y como os digo siempre, aprovechamos la energía que estamos consumiendo para meter algo más en el horno y que se haga al mismo tiempo (en mi caso + lasaña y pollo con tomates cherry) Mientras la calabaza se está asando podemos sofreír la cebolla y los tallos de apio en una olla con una cucharada de AOVE.',
      'Lo tendremos a fuego medio-alto durante 2 minutos y medio-bajo 5 minutos más.',
      'Reservamos Una vez que la calabaza está asada la incorporamos a la olla junto con 200 ml de bebida vegetal, 300 ml de caldo de verduras, 1 cucharadita de ajo en polvo, 1 cucharadita de romero seco y sal y pimienta al gusto, y dejamos chup chup a fuego bajo durante 5 minutos más.',
      'Una vez pasado este tiempo trituramos muy bien el contenido de la olla (podemos meter en ella el brazo de la batidora, aunque siempre con mucho cuidado no nos vaya a salpicar y nos podamos quemar), y una vez bien triturado incorporamos 3 zanahorias ralladas, dejamos chup chup a fuego medio-bajo durante 3 minutos, tras los cuales añadimos 100 gr de queso previamente rallado y apagamos el fuego, dejamos que se derrita con el calor residual de la olla.',
      'Ya está, el crunchy de la zanahoria rallada le da un toque muy original y el queso rallado le da saborazo. Esta vez he utilizado parmesano, pero puedes utilizar el que tengas por casa o el que más se os antoje.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":494,"protein":37.5,"carbs":23.5,"fat":29.9,"fiber":6.1},
      per100g: {"calories":282,"protein":21.5,"carbs":13.4,"fat":17.1,"fiber":3.5},
    },
  },
  {
    id: 'lubina-a-la-naranja',
    title: 'Lubina a la Naranja',
    category: 'Pescado',
    summary: 'Lubina a la Naranja al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191208_202851_resized_20191208_082950144.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 25, unit: 'gr de', name: 'mantequilla' },
      { id: '3', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '4', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de tomillo' },
    ],
    steps: [
      'Vamos a intentar preparar un buen puré de patatas. Para ello intentaremos elegir patatas que tengan un alto porcentaje de fécula, que sean harinosas. Buscando por Internet (no soy yo una especialista en patatas 😇) he encontrado las siguientes variedades: Baraka, Kennebec o Monalisa.',
      'En todo caso también las venden ya “especiales para cocer” o “para freír”, elegimos las primeras y listo. Una vez elegidas las patatas, que han de ser del mismo tamaño para que el punto de cocción sea el mismo, las lavamos bien y las cocemos con piel.',
      'De esta manera evitamos que el agua entre en la patata y la deje aguada.',
      'Las cocemos en agua y sal durante 30 minutos o menos si utilizamos olla a presión (con unos 17 será suficiente) Mientras tanto ponemos la leche en un cazo con una cucharadita de tomillo, llevamos a ebullición y en cuanto rompa a hervir apagamos el fuego y dejamos enfriar.',
      'Cuando ya ha pasado el tiempo de cocción de las patatas las escurrimos y quitamos la piel con cuidado de no quemarnos. Las chafamos con un tenedor, pasapuré o colador chino, pero evitamos utilizar batidora para queno se quede chicloso.',
      'Nos queda incorporar la mantequilla, que es importante que esté a temperatura ambiente para que se derrita con el calor de la patata, así como la leche infusionada con el tomillo (la colamos antes para no echar la hierba).',
      'Rectificamos de sal y listo, ya tenemos el puré con el toque de tomillo preparado.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":454,"protein":26.5,"carbs":30.9,"fat":28.5,"fiber":3.9},
      per100g: {"calories":432,"protein":25.4,"carbs":29.6,"fat":27.3,"fiber":3.7},
    },
  },
  {
    id: 'magdalenas-de-platano-y-manzana',
    title: 'Magdalenas de Plátano y Manzana',
    category: 'Postres',
    summary: 'Magdalenas de Plátano y Manzana al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191005_184221-1024x564.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 220, unit: 'gr de', name: 'Pimientos Asados' },
      { id: '2', baseQuantity: 75, unit: 'gr de', name: 'Nueces' },
      { id: '3', baseQuantity: null, unit: '', name: '2-3 Dientes Ajo' },
      { id: '4', baseQuantity: 1, unit: 'Cucharada de', name: 'Pimienta' },
      { id: '5', baseQuantity: 1, unit: 'Cucharada de', name: 'Pan rallado' },
      { id: '6', baseQuantity: 1, unit: 'Cucharada de', name: 'Comino' },
      { id: '7', baseQuantity: 1, unit: 'Cucharada de', name: 'Miel' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE,, sal y pimienta' },
    ],
    steps: [
      'Ponemos todos los ingredientes menos el aceite en el vaso de la batidora y batimos bien durante unos minutos. A continuación paramos, añadimos 2 cucharadas de AOVE y seguimos batiendo hasta que se integren bien todos los ingredientes.',
      'Si nos gusta más espeso le podemos añadir un poco de pan integral rallado. Listo, ya tenemos un snack saludable que podemos tomar de acompañamiento, de primer plato, para rellenar bocadillos, aderezo de ensalada…',
    ],
    nutrition: {
      totalWeightGrams: 520,
      perServing: {"calories":283,"protein":4.8,"carbs":34.9,"fat":14.5,"fiber":4.3},
      per100g: {"calories":543,"protein":9.2,"carbs":66.9,"fat":27.8,"fiber":8.3},
    },
  },
  {
    id: 'menestra-con-fideos',
    title: 'Menestra con Fideos',
    category: 'Verdura',
    summary: 'Menestra con Fideos al estilo La Vida Bonica.',
    image: 'images/2020_09_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'guisantes' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'jamón curado' },
      { id: '5', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'fideos integrales' },
      { id: '7', baseQuantity: 30, unit: 'gr de', name: 'queso rallado' },
      { id: '8', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En una olla disponemos una cucharada de AOVE y 20 gr de mantequilla y sofreímos una cebolla previamente picada. Mientras se sofríe a fuego medio pelamos y cortamos en dados 2 patatas medianas e incorporamos a la olla.',
      'Junto a las patatas añadimos 200 ml de leche y 300 de agua, salpimentamos al gusto y dejamos chup chup a fuego medio 10 minutos.',
      'Una vez pasado este tiempo incorporamos 300 gr de guisantes (yo los utilizo congelados), 50 gr de fideos integrales y 30 gr de queso rallado (yo lo he lascado con un pelador de patatas), mezclamos bien y dejamos chup chup 5 minutos más. Y listo, ya tenemos esta menestra preparada, espero que os guste',
    ],
    nutrition: {
      totalWeightGrams: 1120,
      perServing: {"calories":503,"protein":20.5,"carbs":54.9,"fat":25.9,"fiber":5.5},
      per100g: {"calories":448,"protein":18.3,"carbs":49.1,"fat":23.1,"fiber":4.9},
    },
  },
  {
    id: 'menestra-de-judias-verdes-con-pesto',
    title: 'Menestra de Judías Verdes con Pesto',
    category: 'Verdura',
    summary: 'Menestra de Judías Verdes con Pesto al estilo La Vida Bonica.',
    image: 'images/2022_05_IMG_20220522_191620-1024x856.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'ramillete de hojas de albahaca fresca' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'piñones' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Vamos a preparar una simple menestra y la vamos a enriquecer con un pesto de albahaca de nuestras macetas, no sé si saldrá más sabroso pero os aseguro que sí que es más económico.',
      'La idea me rondó cuando vi que en casa nos gustaba mucho el pesto pero la albahaca no era fácil de encontrar y donde había costaba 1€ el paquete con 20-30 gramos. Un día pasé por una tienda de plantas y vi macetas de albahaca por 1,2€ cada una, compré 2 y me las llevé a casa.',
      'Tengo que decir que no necesitan grandes cuidados (no como el romero o tomillo, a mí se me acaban muriendo), simplemente regar de vez en cuando y cada pocos días tenemos albahaca fresca para usar en la cocina.',
      'Es una planta de temporada así que después de verano tendremos que despedirnos de ellas, pero durante unos meses os aseguro que vais a tener pesto asegurado y al mismo tiempo podréis mantener a raya a los mosquitos (los mantiene bien alejados de vuestras cocinas) Para preparar esta menestra ponemos a hervir una olla con abundante agua y sal al gusto y cocemos 1 kg de judías verdes troceadas y 4 zanahorias grandes cortadas en trozos pequeños.',
      'Con 7-8 minutos una vez que rompa a hervir será suficiente para cocer la verdura. Escurrimos y reservamos.',
      'Para preparar el pesto trituramos 1 ramillete de albahaca fresca, 50 gr de parmesano, 1 cucharada de piñones, AOVE, sal y pimienta al gusto hasta que tenga la consistencia que más nos guste (yo le he añadido unos 50 ml de agua para evitar echar más aceite).',
      'Mezclamos con la verdura, añadimos 2 huevos cocidos por encima y ya tenemos nuestra menestra “enriquecida” lista para hincarle el diente.',
    ],
    nutrition: {
      totalWeightGrams: 250,
      perServing: {"calories":141,"protein":4.5,"carbs":6.5,"fat":11.9,"fiber":2.5},
      per100g: {"calories":564,"protein":18,"carbs":26,"fat":47.6,"fiber":10},
    },
  },
  {
    id: 'menestra-y-salchichas-con-salsa-de-yogur-y-tahini',
    title: 'Menestra y Salchichas con Salsa de Yogur y Tahini',
    category: 'Verdura',
    summary: 'Menestra y Salchichas con Salsa de Yogur y Tahini al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211206_135954-1024x762.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'yogures griegos o 250 gr de queso fresco batido desnatado (más o menos misma consistencia y bastante menos aporte calórico)' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'tahini' },
      { id: '3', baseQuantity: 0.5, unit: 'cucharadita de', name: 'sal' },
      { id: '4', baseQuantity: 1, unit: '', name: 'chorro pequeño de limón (si vemos que hace falta más siempre se puede añadir)' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
    ],
    steps: [
      'En una olla con abundante agua y sal cocemos 500 gr de judías verdes, 1 coliflor pequeña cortada en arbolitos y 3 zanahorias grandes en rodajas gruesas. Lo tenemos 6-7 minutos a fuego medio, hasta que veamos que la verdura está al dente. Escurrimos y reservamos.',
      'En una sartén de base ancha salteamos las salchichas previamente troceadas. Si lo hacemos con muy poco aceite y a fuego fuerte tenemos que estar pendientes porque en apenas un par de minutos estarán doradas. Reservamos Por último, hacemos la salsa de yogur y tahini.',
      'Para ello mezclamos muy bien en un bol 2 yogures griegos o 250 gr de queso fresco batido desnatado (si queremos menos aporte calórico), 1 cucharadita de pasta de tahini, ½ cucharadita de sal, 1 chorro pequeño de limón, 1 cucharadita de orégano seco y 2 cucharadas de AOVE.',
      'Probamos y rectificamos si consideramos que le falta sabor. Ya lo tenemos preparado. Lo podemos mezclar todo en este momento o refrigerar de forma separada y unirlo en el momento en el que vayamos a consumir.',
    ],
    nutrition: {
      totalWeightGrams: 530,
      perServing: {"calories":258,"protein":10.3,"carbs":14.9,"fat":17.5,"fiber":2.9},
      per100g: {"calories":486,"protein":19.4,"carbs":28.1,"fat":33.1,"fiber":5.5},
    },
  },
  {
    id: 'merluza-a-la-cazuela',
    title: 'Merluza a la Cazuela',
    category: 'Pescado',
    summary: 'Merluza a la Cazuela al estilo La Vida Bonica.',
    image: 'images/2019_06_IMG_20190623_202556_resized_20190623_083334136.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'merluza en rodajas' },
      { id: '2', baseQuantity: 250, unit: 'gr de', name: 'gambas' },
      { id: '3', baseQuantity: 25, unit: 'gr de', name: 'harina de trigo integral' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'guisantes' },
      { id: '5', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 250, unit: 'ml de', name: 'caldo de pescado' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Comenzamos dorando los dientes de ajo previamente picados en una cazuela con una cucharada de AOVE, seguidamente añadimos la harina, removemos un poco y echamos el caldo de pescado. Dejamos cocer sin dejar de remover hasta que veamos que la salsa ha espesado un poco.',
      'Seguidamente incorporamos las rodajas de merluza salpimentadas a la sartén y las dejamos cocer unos 5 minutos a fuego medio, después les damos la vuelta y las dejamos cocer el mismo tiempo.',
      'Finalmente hay que terminar la receta en el horno por lo que en mi caso, tras cocinarlo en una sartén que no se puede meter al horno (si tú tienes una úsala y así te ahorras tener que cambiar de recipiente) lo he pasado con cuidado a un recipiente apto.',
      'Añadimos las gambas, los guisantes y salpimentamos. Lo metemos al horno y chup chup a 180º durante 10 minutos. Retiramos la cazuela del horno y listo, ya tenemos nuestra primera receta preparada. MARTES: Gazpacho con remolacha y ensalada de pasta y lentejas',
    ],
    nutrition: {
      totalWeightGrams: 1650,
      perServing: {"calories":573,"protein":43.1,"carbs":14.5,"fat":37.5,"fiber":3.5},
      per100g: {"calories":347,"protein":26.1,"carbs":8.8,"fat":22.7,"fiber":2.1},
    },
  },
  {
    id: 'migas-de-coliflor',
    title: 'Migas de Coliflor',
    category: 'Verdura',
    summary: 'Migas de Coliflor al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201129_173206_resized_20201129_053240299.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'pechugas enteras de pollo' },
      { id: '2', baseQuantity: 3, unit: '', name: 'patatas grandes' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'champiñones enteros' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'tomates secos' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'nueces peladas' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '9', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Me encanta utilizar el horno en las sesiones de batch cooking, podemos cocinar varias cosas a la vez casi sin darnos cuenta, y mientras tanto seguimos cocinando otras recetas con el fuego o placa.',
      'En esta receta para empezar precalentamos el horno a 190º y mientras alcanza la temperatura disponemos 3 pechugas enteras en una bandeja de horno. Lavamos y pelamos 3 patatas y 1 zanahoria grande, las cortamos en trozos más o menos del mismo tamaño y las añadimos a la bandeja.',
      'A los champiñones les quitamos la tierra que puedan llevar, los cortamos en cuartos y a la bandeja. Salpimentamos.',
      'Ahora vamos a hacer la salsa que le va a dar un saborazo y una melosidad súper: En el vaso de un procesador de alimentos incorporamos 1 zanahoria pelada y troceada, 50 gr de tomates secos, 40 gr de nueces peladas, 2 cucharadas de salsa de soja, 1 cucharadita de romero seco, 2 cucharadas de AOVE, 250 gr de agua y sal y pimienta al gusto y trituramos hasta que los ingredientes se integren, aunque no hace falta dejarlo muy bien batido, si queda con algún trocito no pasa nada.',
      'Lo echamos por encima de la carne, las patatas y la verdura, lo mezclamos bien para que todo quede bien impregnado y horneamos a 190º durante 50 minutos. Cuando termine podemos cortar en trozos grandes la pechuga, pero no antes de cocinarse para que no se reseque.',
      'Y listo, recetaza preparada sin apenas faena, las que más me gustan 😀',
    ],
    nutrition: {
      totalWeightGrams: 2230,
      perServing: {"calories":734,"protein":43.5,"carbs":34.1,"fat":46.9,"fiber":6.9},
      per100g: {"calories":329,"protein":19.5,"carbs":15.3,"fat":21.1,"fiber":3.1},
    },
  },
  {
    id: 'mujol-con-crema-de-puerro-y-manzana',
    title: 'Mújol con Crema de Puerro y Manzana',
    category: 'Sopa',
    summary: 'Mújol con Crema de Puerro y Manzana al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-2-1024x743.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pollo picado' },
      { id: '2', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 2, unit: 'dientes de', name: 'ajo picados' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'perejil picado' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal, pimienta y jengibre seco' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'rasas de harina integral' },
    ],
    steps: [
      'En primer lugar mezclamos en un bol 600 gr de pollo picado, 2 huevos, 2 dientes de ajo picados, 2 cucharadas de perejil picado, 1 cucharadita de jengibre seco, sal y pimienta al gusto y 3 cucharadas rasas de harina integral.',
      'Removemos bien hasta que se integren bien todos los ingredientes y reservamos tapado en el frigo durante unos 30 minutos. Con la mezcla anterior hacemos albóndigas y metemos al horno precalentado a 180º durante 30 minutos. Mientras tanto vamos haciendo la salsa.',
      'Para ello en una olla ponemos 1 cucharada de AOVE y cuando esté caliente incorporamos 1 cebolla previamente picada y dejamos que poche durante 3 minutos a fuego medio y removiendo de vez en cuando.',
      'En el vaso de un procesador de alimentos incorporamos 50 gr de queso roquefort, 70 gr de almendras tostadas, 250 ml de caldo de pollo y sal al gusto. Batimos bien hasta que quede todo bien mezclado y añadimos a la olla donde se está pochando la cebolla.',
      'Dejamos chup chup durante 5 minutos más y ya tenemos la salsa preparada. Cuando las albóndigas se hayan terminado de hornear las podemos meter en la olla con la salsa para que hagan un hervor conjunto.',
      'En mi caso congelaré cada cosa en un recipiente por si la salsa necesita un batido exprés al descongelarse (si se queda grumosa) y haré el hervor conjunto cuando vayamos a comerlas.',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":523,"protein":37.9,"carbs":23.1,"fat":34.1,"fiber":3.9},
      per100g: {"calories":422,"protein":30.6,"carbs":18.6,"fat":27.6,"fiber":3.1},
    },
  },
  {
    id: 'muslos-de-pavo-al-estilo-cajun',
    title: 'Muslos de Pavo al Estilo Cajún',
    category: 'Carne',
    summary: 'Muslos de Pavo al Estilo Cajún al estilo La Vida Bonica.',
    image: 'images/2020_08_IMG_20200823_115506-1024x845.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'habas tiernas (yo las he utilizado congeladas)' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'coles de bruselas (las he utilizado congeladas)' },
      { id: '3', baseQuantity: 20, unit: 'gr de', name: 'mantequilla' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'cebolla en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'ajo en polvo' },
      { id: '6', baseQuantity: 20, unit: 'ml de', name: 'Oporto' },
      { id: '7', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'En una olla llevamos a ebullición abundante agua y cuando rompa a hervir incorporamos 400 gr de habas tiernas y 300 gr de coles de bruselas (yo las he utilizado congeladas). Lo tenemos 3 minutos a fuego fuerte. Escurrimos y reservamos.',
      'En una sartén de base ancha agregamos 20 gr de mantequilla y dejamos que vaya fundiendo con el calor. Mientras tanto añadimos 1 cucharada de ajo en polvo y 1 cucharada de cebolla en polvo y mezclamos bien para que la mantequilla y estas especias se integren.',
      'Cuando esté caliente se incorporan las habas y las coles de bruselas y mezclamos bien. Añadimos 20 ml de oporto, sal y pimienta al gusto y lo dejamos chup chup a fuego medio-alto 2 minutos para que evapore el poco alcohol que hemos incorporado y ya lo tenemos listo.',
      'Lo acompañaremos de merluza a la plancha que haremos el día que vayamos a consumir. Ésta ha sido la sesión de hoy. Últimamente estoy haciendo sesiones más cortas, más sencillas pero igualmente válidas para llenar la cocina de buenas opciones.',
      'Espero que os sirva de motivación para incorporar el batch cooking a vuestras rutinas y me contéis impresiones. ¡Feliz semana!',
      'Navegación de entradas Anterior Batch cooking exprés tercera semana de agosto Siguiente El poder de las especias Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 740,
      perServing: {"calories":241,"protein":14.8,"carbs":23.4,"fat":10.3,"fiber":5.6},
      per100g: {"calories":109,"protein":6.7,"carbs":10.6,"fat":4.7,"fiber":2.5},
    },
  },
  {
    id: 'muslos-de-pollo-a-la-naranja',
    title: 'Muslos de Pollo a la Naranja',
    category: 'Carne',
    summary: 'Muslos de Pollo a la Naranja al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1024x710.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'bandeja de muslos de pollo.' },
      { id: '2', baseQuantity: 2, unit: '', name: 'naranjas' },
      { id: '3', baseQuantity: 3, unit: '', name: 'patatas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'manojo de ajos tiernos' },
      { id: '5', baseQuantity: 150, unit: 'ml de', name: 'caldo de pollo' },
      { id: '6', baseQuantity: 50, unit: 'ml de', name: 'vino blanco' },
      { id: '7', baseQuantity: null, unit: '', name: 'Tomillo y romero.' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
    ],
    steps: [
      'Pelamos y cortamos las patatas con un dedo de grosor, las salamos y las disponemos en una bandeja de horno. Sobre ella ponemos la naranja en rodajas y los ajos tiernos cortados en trocitos.',
      'Aprovechamos la piel de la naranja, sin la parte blanca, y la disponemos también en la bandeja, de esta manera se aromatizará todo el plato. Por último ponemos los muslos salpimentados. Vertemos el caldo y el vino por encima y espolvoreamos con un poco de tomillo y romero.',
      'Metemos al horno precalentado a 180º y tenemos durante apx 1 hora.',
    ],
    nutrition: {
      totalWeightGrams: 2500,
      perServing: {"calories":734,"protein":43.9,"carbs":43.1,"fat":34.9,"fiber":4.9},
      per100g: {"calories":147,"protein":8.8,"carbs":8.6,"fat":7,"fiber":1},
    },
  },
  {
    id: 'nachos-de-garbanzos',
    title: 'Nachos de Garbanzos',
    category: 'Legumbres',
    summary: 'Nachos de Garbanzos al estilo La Vida Bonica.',
    image: 'images/2020_06_IMG_20200620_180713-1024x551.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'aguacates' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tomates rojos maduros' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal, pimienta' },
      { id: '5', baseQuantity: null, unit: '', name: 'Zumo de limón' },
    ],
    steps: [
      'Pertenecemos a ese sector de la población al que no le gusta el cilantro (leí a un tecnólogo de los alimentos que se debe a una predisposición genética el que nos guste o no), pero si eres fan siéntete muy libre de utilizarlo en la receta.',
      'Nosotros en casa chafamos con un tenedor 2 aguacates maduros e incorporamos 2 tomates rojos maduros y 1 cebolleta, todo ello rallado.',
      'Aliñamos con zumo de limón y sal y pimienta al gusto y ya está, no nos complicamos mucho, la verdad 😉 Y hasta aquí la sesión de esta semana, preparada para que le vayamos hincando el diente. Quería despedirme de vosotros hasta después del verano.',
      'Julio ya casi está aquí y es mi mes de vacaciones así que seguiré haciendo sesiones de batch cooking pero repitiendo platos que nos han gustado durante el año, o haciendo menos platos si no vamos a comer todos los días en casa… Necesito descansar también de tanta foto de comida y tanta publicación.',
      'Últimamente estoy un poco agotada, supongo que todo este confinamiento no ha ayudado mucho. El trabajo está siendo muy estresante y la vida en general también.',
      'Queremos simplificar comidas este verano y este blog que con tanto cariño hago se merece más atención de la que le puedo dar estas próximas semanas. Os deseo un buen verano y nos vemos a la vuelta.',
      'Sed felices Navegación de entradas Anterior Helado de frutos rojos y almendras Siguiente Ensalada de alubias con patatas Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: {"calories":255,"protein":4.4,"carbs":25.9,"fat":14.1,"fiber":7.4},
      per100g: {"calories":106,"protein":1.8,"carbs":10.8,"fat":5.9,"fiber":3.1},
    },
  },
  {
    id: 'nuggets-vegetales',
    title: 'Nuggets Vegetales',
    category: 'Entrantes',
    summary: 'Nuggets Vegetales al estilo La Vida Bonica.',
    image: 'images/2019_04_IMG_20190421_160653_resized_20190421_041024702.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'latas de', name: 'grandes de tomates en conserva' },
      { id: '2', baseQuantity: 1, unit: '', name: 'manojo de ajos tiernos' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'bacalao' },
      { id: '4', baseQuantity: 100, unit: 'gr de', name: 'olivas de cuquillo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'pimiento rojo asado' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '7', baseQuantity: null, unit: '', name: 'En primer lugar asamos el pimiento y el bacalao en el horno.' },
      { id: '8', baseQuantity: null, unit: '', name: 'Yo por mi parte ya he comprado el pimiento asado, así ahorro tiempo para la' },
      { id: '9', baseQuantity: null, unit: '', name: 'sesión de batch cooking, y le bacalao lo he cocinado a la plancha, con un poco' },
      { id: '10', baseQuantity: null, unit: '', name: 'de AOVE, durante 2 ó 3 minutos a fuego medio.' },
      { id: '11', baseQuantity: null, unit: '', name: 'Sofreímos los ajos tiernos limpios y partidos en trozos' },
      { id: '12', baseQuantity: null, unit: '', name: 'pequeños, a fuego medio bajo y con una cucharada de AOVE.' },
      { id: '13', baseQuantity: null, unit: '', name: 'Ponemos en un recipiente el tomate partido y añadimos el' },
      { id: '14', baseQuantity: null, unit: '', name: 'bacalao desmenuzado, el pimiento a tiras, las olivas y los ajetes ya sofritos.' },
      { id: '15', baseQuantity: null, unit: '', name: 'Removemos bien y aliñamos con AOVE y sal al gusto.' },
      { id: '16', baseQuantity: null, unit: '', name: 'PASTEL DE PESCADO' },
      { id: '17', baseQuantity: null, unit: '', name: 'JAMIE OLIVER' },
      { id: '18', baseQuantity: null, unit: '', name: 'INGREDIENTES' },
      { id: '19', baseQuantity: 4, unit: '', name: 'patatas granes' },
    ],
    steps: [
      'Leche de vaca o vegetal 4 tomates Sal y pimienta Ralladura de limón Zumo de un limón 1 diente de ajo picado Cebollino 2 yogures griegos naturales Queso rallado 300 gr de bacalao fresco PREPARACIÓN Lo mío es pura devoción con Jamie Oliver y su forma de trabajar, lo sigo desde hace años y he cocinado muchas de sus recetas.',
      'Aquí os traigo una que vi el otro día en su perfil de Instagram. Lo primero que haremos será cocer las patatas en agua y sal para hacer seguidamente hacer un puré con mantequilla y leche. Ha de quedar bastante espeso. Reservamos Troceamos 4 tomates maduros e introducimos en un bol.',
      'Salpimentamos y añadimos la ralladura y el zumo de un limón, 2 cucharadas de AOVE, un diente de ajo, cebollino y un chile, todo ello picado.',
      'Dejamos macerar durante 20 minutos y escurrimos bien sin tirar el líquido, que lo podremos usar para la vinagreta de la ensalada con la que acompañaremos el pastel. Troceamos las gambas crudas y disponemos en un recipiente apto para el horno.',
      'Incorporamos los filetes de bacalao en trozos grandes y hacemos el primer “piso” de este pastel',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":444,"protein":24.9,"carbs":24.1,"fat":26.3,"fiber":4.1},
      per100g: {"calories":127,"protein":7.1,"carbs":6.9,"fat":7.5,"fiber":1.2},
    },
  },
  {
    id: 'pakoras',
    title: 'Pakoras',
    category: 'Verdura',
    summary: 'Pakoras al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191027_144805-1024x576.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla pelada y entera' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'judías verdes (yo las he utilizado congeladas)' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y AOVE' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'harina integral' },
      { id: '7', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
    ],
    steps: [
      'Ponemos 3 dedos de agua en la olla rápida y ponemos al fuego. Mientras, vamos pelando las patatas, las lavamos y cortamos en 3 trozos grandes e incorporamos a la olla. Pelamos la cebolla y le hacemos un corte sin llegar a partir por la mitad. Incorporamos.',
      'Añadimos también las judías verdes, echamos sal y tapamos. 15 minutos a fuego medio a partir de que rompa a hervir. Apagamos y reservamos Mientras tanto en una sartén agregamos 2 cucharadas de AOVE y doramos 2 dientes de ajo picados con mucho cuidado de que no se quemen.',
      'Cuando empiezan a estar dorados apagamos el fuego, añadimos 1 cucharadita de pimentón y otra de harina, removemos bien. Una vez que la verdura ya está hecha añadimos este refrito en la olla, le damos un suave hervor de un par de minutos y listo.',
    ],
    nutrition: {
      totalWeightGrams: 1700,
      perServing: {"calories":394,"protein":7.4,"carbs":54.9,"fat":15.6,"fiber":6.3},
      per100g: {"calories":116,"protein":2.2,"carbs":16.3,"fat":4.6,"fiber":1.9},
    },
  },
  {
    id: 'pasta-con-crema-de-verduras',
    title: 'Pasta con Crema de Verduras',
    category: 'Sopa',
    summary: 'Pasta con Crema de Verduras al estilo La Vida Bonica.',
    image: 'images/2020_10_RBC-3.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Pasta integral del tipo que más os guste' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'carne picada por vosotros o por vuestro carnicero de confianza, las que venden envasadas llevan mil cosas además de carne' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla picada' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Queso rallado (Opcional)' },
    ],
    steps: [
      'En primer lugar sofreímos una cebolla y 2 dientes de ajo bien picados en una sartén con 1 cucharada de AOVE. Una vez que se ha puesto transparente añadimos la carne picada y sofreímos removiendo de vez en cuando hasta que veamos que está hecha. Salpimentamos. Yo haré la receta hasta aquí.',
      'Y congelaré el sofrito por un lado y la crema por otro. El día que vayamos a consumir sólo tenemos que coger pasta integral en abundante agua, escurrir y mezclar con la carne picada y la crema de verduras. Si nos apetece le añadimos queso rallado, y ya está preparada para hincar el diente',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":421,"protein":26.8,"carbs":34.4,"fat":20.5,"fiber":3.5},
      per100g: {"calories":158,"protein":10.1,"carbs":12.9,"fat":7.7,"fiber":1.3},
    },
  },
  {
    id: 'pasta-integral-con-crema-de-acelgas-y-zanahoria-y-carne-picada',
    title: 'Pasta Integral con Crema de Acelgas y Zanahoria y Carne Picada',
    category: 'Sopa',
    summary: 'Pasta Integral con Crema de Acelgas y Zanahoria y Carne Picada al estilo La Vida Bonica.',
    image: 'images/2020_05_IMG_20200503_094746-1024x662.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Por aquí os dejo el enlace para preparar la crema de verduras: https://lavidabonica.com/crema-de-acelgas-y-zanahorias/' },
      { id: '2', baseQuantity: null, unit: '', name: 'Pasta integral' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'carne picada' },
      { id: '4', baseQuantity: null, unit: '', name: 'Las especias que más os gusten: Yo he puesto cebolla y ajo en polvo, sal y pimienta.' },
    ],
    steps: [
      'En una sesión de batch cooking podemos duplicar cantidades de la crema de acelgas y zanahorias: Un día la tomamos como primer plato y otro día como salsa que acompañe un nutritivo plato de pasta.',
      'Así pues, preparamos la crema(puedes ver cómo se hace pinchando en el enlace que he puesto arriba) Mientras se está haciendo adobamos 400 gr de carne picada con 1 cucharadita de cebolla en polvo, 1 cucharadita de ajo en polvo y sal y pimienta al gusto, removemos bien, tapamos y metemos en la nevera mínimo 30 minutos.',
      'Una vez que la carne se ha impregnado bien de las especias que le hemos puesto sólo nos queda dorarla con 1 cucharada de AOVE en una sartén. De esta manera conseguimos que el plato tenga más sabor, pues la salsa que vamos a utilizar está muy rica pero es más bien suave.',
      'Yo haré hasta aquí, y congelaré la crema de acelgas y zanahorias por un lado y la carne sofrita por otro, simplemente a falta de cocer pasta integral al gusto el día que vayamos a consumir y comer con deleite 😁 EXTRAS: Carrot cake y zanahorias al horno',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":544,"protein":35.6,"carbs":35.1,"fat":28.4,"fiber":4.3},
      per100g: {"calories":163,"protein":10.7,"carbs":10.5,"fat":8.5,"fiber":1.3},
    },
  },
  {
    id: 'pasta-integral-con-crema-de-calabaza-y-tomates-asados',
    title: 'Pasta Integral con Crema de Calabaza y Tomates Asados',
    category: 'Sopa',
    summary: 'Pasta Integral con Crema de Calabaza y Tomates Asados al estilo La Vida Bonica.',
    image: 'images/2020_06_IMG_20200620_180713-1024x551.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Pasta integral' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'calabaza' },
      { id: '3', baseQuantity: 500, unit: 'gr de', name: 'tomate' },
      { id: '4', baseQuantity: 200, unit: 'gr de', name: 'zanahorias' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '8', baseQuantity: 4, unit: 'latas de', name: 'atún natural' },
      { id: '9', baseQuantity: null, unit: '', name: 'Queso parmesano' },
    ],
    steps: [
      'Disponemos la verdura en una bandeja de horno, cortada en trozos homogéneos (no muy grandes) y aliñada con 2 cucharadas de AOVE, 1 cucharadita de orégano y 1 cucharadita de albahaca.',
      'Horneamos durante 40 minutos a 190º Trituramos añadiendo agua o caldo de verduras para darle un poco de melosidad y listo, ya tenemos nuestra crema preparada. Yo haré la receta hasta aquí.',
      'El día que vayamos a consumir cocemos pasta integral al gusto y acompañamos de atún natural y queso parmesano rallado EXTRAS: Nachos con guacamole',
    ],
    nutrition: {
      totalWeightGrams: 2400,
      perServing: {"calories":644,"protein":29.5,"carbs":69.4,"fat":26.8,"fiber":6.8},
      per100g: {"calories":142,"protein":6.5,"carbs":15.3,"fat":5.9,"fiber":1.5},
    },
  },
  {
    id: 'pasta-integral-con-crema-de-zanahorias-y-carne-adobada',
    title: 'Pasta Integral con Crema de Zanahorias y Carne Adobada',
    category: 'Sopa',
    summary: 'Pasta Integral con Crema de Zanahorias y Carne Adobada al estilo La Vida Bonica.',
    image: 'images/2020_10_IMG_20201003_121044.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Crema de zanahorias (esta semana hacemos ración doble y una de ellas la utilizamos como salsa de este rico plato de pasta)' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'carne picada (pícala tú o tu carnicero de confianza, sabrás que sólo es carne lo que estás comiendo)' },
      { id: '3', baseQuantity: null, unit: '', name: 'Especias al gusto: Yo he utilizado garam masala, ajo en polvo, sal y pimienta.' },
    ],
    steps: [
      'Mientras la crema de zanahorias se está haciendo adobamos 500 gr de carne picada con 1 cucharadita de ajo en polvo, 2 cucharaditas colmadas de garam masala y sal y pimienta al gusto, removemos bien, tapamos y metemos en la nevera mínimo 30 minutos.',
      'Una vez que la carne se ha impregnado bien de las especias que le hemos puesto sólo nos queda dorarla con 1 cucharada de AOVE en una sartén a fuego medio-alto para que se selle bien y la carne quede jugosa además de sabrosa.. Yo haré hasta aquí y congelaré la crema por un lado y la carne por otro.',
      'El día que la vayamos a consumir sólo tendremos que cocer pasta integral al gusto, añadir la salsa, la carne adobada y queso rallado y disfrutar este plato. También podéis cocer la pasta y congelarla bien escurrida y ella sola.',
      'A nosotros no nos gusta la textura por eso preferimos hacerla en el momento de consumirla. ¿Y a vosotros?',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":521,"protein":30.8,"carbs":34.4,"fat":27.9,"fiber":4.4},
      per100g: {"calories":155,"protein":9.2,"carbs":10.3,"fat":8.3,"fiber":1.3},
    },
  },
  {
    id: 'pasta-integral-con-soja-texturizada',
    title: 'Pasta Integral con Soja Texturizada',
    category: 'Hidratos',
    summary: 'Pasta Integral con Soja Texturizada al estilo La Vida Bonica.',
    image: 'images/2020_09_rbc-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: 'Pasta integral al gusto' },
      { id: '2', baseQuantity: 125, unit: 'gr de', name: 'soja texturizada' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: '', name: 'tallo de apio' },
      { id: '5', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '6', baseQuantity: 1, unit: '', name: 'pimiento gordo rojo' },
      { id: '7', baseQuantity: 800, unit: 'gr de', name: 'tomate natural triturado.' },
      { id: '8', baseQuantity: 100, unit: 'ml de', name: 'de vino blanco' },
      { id: '9', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '11', baseQuantity: null, unit: '', name: 'Orégano' },
    ],
    steps: [
      'Yo esta vez he duplicado cantidades, una mitad para rellenar la lasaña de calabacín y la otra mitad que nos servirá de salsa para un rico plato de pasta integral.',
      'Hidratamos la soja texturizada en agua (lo ponemos al menos 20 minutos antes) Picamos las verduras (yo lo he hecho en la Thermomix, así tardo menos, pero ya como prefiráis) y rehogamos con AOVE en una olla ancha y grande, a fuego fuerte, durante 5 minutos, removiendo de forma frecuente.',
      'Una vez pasado este tiempo escurrimos la soja texturizada y echamos a la olla, removemos y dejamos que se rehogue todo junto unos 5 minutos a fuego fuerte y removiendo de vez en cuando.',
      'Añadimos entonces el vino y esperamos a que se evapore el alcohol (acerca la nariz y lo notarás, el olor cambia) Es el momento de incorporar 800 gr de tomate natural triturado, 1 cucharada de salsa de soja, 1 cucharadita de orégano y sal y pimienta al gusto.',
      'Y chup chup por 30 minutos a fuego medio-bajo. Listo, ya tenemos doble ración preparada 💪 Se congela sin problema. A la hora de consumir sólo hay que cocer pasta y tendremos una rica comida preparada. Mis hijos se vuelven locos con ella, y yo con ellos 😍',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: {"calories":533,"protein":24.1,"carbs":63.9,"fat":18.4,"fiber":7.9},
      per100g: {"calories":133,"protein":6,"carbs":16,"fat":4.6,"fiber":2},
    },
  },
  {
    id: 'pastel-de-alcachofas-y-esparragos',
    title: 'Pastel de Alcachofas y Espárragos',
    category: 'Verdura',
    summary: 'Pastel de Alcachofas y Espárragos al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220326_113033-1024x885.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'alcachofas grandes' },
      { id: '2', baseQuantity: 8, unit: '', name: 'ajos tiernos' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '5', baseQuantity: 1, unit: '', name: 'bola de mozzarella' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar vamos a poner a cocer abundante agua y sal al gusto y mientras ésta se va calentando limpiamos y cortamos en cuartos las alcachofas. Para ello las limpiamos quitando las primeras hojas, que son las de color verde más oscuro, hasta llegar a las que son más blancas y tiernas.',
      'Pelamos también el tallo y lo sumergimos todo en agua y limón o perejil para evitar la oxidación. En el momento en el que el agua de la olla empieza a hervir introducimos las alcachofas y tenemos chup chup a fuego medio durante 15 minutos. Escurrimos y reservamos.',
      'Para terminar con la receta sofreímos en una sartén de base ancha con 1 cucharada de AOVE 8 ajos tiernos limpios y picados. Los tenemos 2 minutos a fuego medio bajo hasta que se doren.',
      'A continuación incorporamos 300 gr de gambas peladas, las alcachofas que hemos cocido, 4 cucharadas de salsa de tomate,1 cucharadita de orégano y sal y pimienta al gusto y tenemos a fuego fuerte durante 1 ó 2 minutos hasta que las gambas se empiezan a dorar.',
      'Bajamos el fuego, incorporamos 1 bola de mozzarella a trocitos, tapamos y dejamos 2 minutos más. Y ya tenemos preparado un primer plato lleno de color, espero que os guste tanto como a nosotros.',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: {"calories":321,"protein":18.2,"carbs":20.5,"fat":17.4,"fiber":4.5},
      per100g: {"calories":114,"protein":6.5,"carbs":7.3,"fat":6.2,"fiber":1.6},
    },
  },
  {
    id: 'pastel-de-atun-y-gambas',
    title: 'Pastel de Atún y Gambas',
    category: 'Pescado',
    summary: 'Pastel de Atún y Gambas al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191116_151705-1024x566.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor' },
      { id: '2', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Es una preparación muy sencilla y que a los peques les gusta 😁: Lavamos y partimos la coliflor en trozos pequeños, aderezamos con 1 cucharada de AOVE y sal y pimienta al gusto y horneamos a 190º durante 40 minutos o esté bien dorada. Y listo.',
      'También le podemos poner las especias que más nos gusten: Curry, cúrcuma, pimentón…. Así tendrán un toque más especial. Coliflor cocida en abundante agua y sal durante 5 ó 6 minutos. Dejadla más bien crunchy, para que no pierda muchas vitaminas durante la cocción',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: {"calories":201,"protein":20.9,"carbs":4.1,"fat":10.3,"fiber":1.9},
      per100g: {"calories":84,"protein":8.7,"carbs":1.7,"fat":4.3,"fiber":0.8},
    },
  },
  {
    id: 'pastel-de-brocoli',
    title: 'Pastel de Brócoli',
    category: 'Verdura',
    summary: 'Pastel de Brócoli al estilo La Vida Bonica.',
    image: 'images/2020_09_rbc-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '2', baseQuantity: 2, unit: '', name: 'trozos de apio' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Morcillo y carne de pollo' },
      { id: '5', baseQuantity: 2, unit: '', name: 'ajos enteros pelados' },
      { id: '6', baseQuantity: null, unit: '', name: 'el zumo de un limón' },
      { id: '7', baseQuantity: 1, unit: '', name: 'tomate rallado' },
      { id: '8', baseQuantity: null, unit: '', name: 'sal y pimienta' },
      { id: '9', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
    ],
    steps: [
      'Esta receta es de lo más socorrida para aquellas sesiones de batch cooking exprés en las que tenemos poco tiempo, y ello es porque es muy rápida de hacer y tenemos comida resuelta para dos días.',
      'Es tan sencillo como incorporar todos los ingredientes en una olla rápida: 4 zanahorias grandes, 2 trozos de apio, 2 ó 3 patatas grandes, carne como morcillo, pollo, huesos para que le dé sabor (en hipermercados ya venden bandejas especiales para este guiso y si no preguntamos al carnicero), 2 ajos enteros pelados, el zumo de un limón, 1 tomate rallado, 400 gr garbanzos y sal y pimienta al gusto.',
      'A continuación ponemos agua hasta que cubra, cerramos la olla y ponemos a fuego fuerte. Una vez que rompa a hervir bajamos el fuego medio y tenemos chup chup 20 minutos. Y ya lo tenemos.',
      'A mi me gusta, una vez atemperado, separar los diferentes ingredientes para que el emplatado sea más rápido: Desmenuzo la carne y dispongo aparte de las patatas, garbanzos y verdura. Así en el momento de consumir todo es más rápido.',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: {"calories":444,"protein":25.9,"carbs":34.9,"fat":22.5,"fiber":6.1},
      per100g: {"calories":124,"protein":7.2,"carbs":9.7,"fat":6.3,"fiber":1.7},
    },
  },
  {
    id: 'pastel-de-calabacin',
    title: 'Pastel de Calabacín',
    category: 'Verdura',
    summary: 'Pastel de Calabacín al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220312_122729-1024x852.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pechuga de pollo entera' },
      { id: '3', baseQuantity: null, unit: '', name: '½ repollo o col' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '9', baseQuantity: 2, unit: '', name: 'yogures griegos' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '11', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '12', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
    ],
    steps: [
      'En primer lugar hemos de marinar la pechuga y dejarla reposar para que se impregne bien con todos los sabores y aromas.',
      'Podemos utilizar las especias que más nos inspiren o que tengamos por caso, en este caso voy a utilizar 1 cucharadita de ajo en polvo, 1 cucharadita de cebolla en polvo, 1 cucharadita de orégano seco, 1 cucharadita de pimentón ahumado y sal y pimienta.',
      'Para adobar la carne primero la troceo como más convenga (en este caso en dados de 2 centímetros aproximadamente), la masajeo con un poco de AOVE y posteriormente le echo las especias y las restriego bien para que no quede ni un trozo sin ellas.',
      'Tapo el recipiente y a la nevera un mínimo de 1 hora, aunque si puede ser más mucho mejor. Mientras la carne se impregna de las especias cocemos en abundante agua hirviendo y sal al gusto 1⁄2 repollo bien picado. En este caso he aprovechado para cocer más repollo y tener un primer plato preparado.',
      'Lo tenemos unos 7-8 minutos a fuego medio. Una vez que la col está cocida, escurrimos y en la misma olla (ya sin la col) incorporamos 1 cucharada de AOVE y sofreímos la carne especiada que teníamos en la nevera.',
      'Lo tenemos a fuego medio y cuando se empiece a dorar añadimos la col escurrida, removemos bien para que se integren bien ambos ingredientes y apagamos el fuego.',
      'Para hacer el aliño tenemos que mezclar 2 yogures griegos con 1 cucharadita de comino, ½ cucharadita de nuez moscada, 1 cucharada de AOVE, sal y el zumo de ½ limón.',
      'Reservamos En un recipiente hermético incorporamos el contenido de la sartén y en otro 400 gr de alubias cocidas y la crema de yogur y llevamos a la nevera hasta que toque comerlo.',
    ],
    nutrition: {
      totalWeightGrams: 1600,
      perServing: {"calories":411,"protein":30.8,"carbs":25.6,"fat":20.9,"fiber":5.3},
      per100g: {"calories":129,"protein":9.6,"carbs":8,"fat":6.5,"fiber":1.7},
    },
  },
  {
    id: 'pastel-de-calabaza',
    title: 'Pastel de Calabaza',
    category: 'Verdura',
    summary: 'Pastel de Calabaza al estilo La Vida Bonica.',
    image: 'images/2020_09_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'espinacas frescas' },
      { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '3', baseQuantity: 200, unit: 'gr de', name: 'ricota' },
      { id: '4', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '6', baseQuantity: 0.5, unit: 'cucharadita de', name: 'comino' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Disponemos las espinacas para cocer al vapor durante 5 minutos. Lo podemos hacer con una vaporera o al microondas. Aprovechamos para cocinar también el ajo, al que previamente le hemos quitado la simiente.',
      'Una vez pasados los 5 minutos introducimos la verdura en el vaso de un procesador de alimentos y añadimos 200 gr de ricota, zumo de ½ limón, ½ cucharadita de comino, ½ cucharadita de nuez moscada, 2 cucharadas de AOVE y sal y pimienta al gusto.',
      'Batimos todo hasta que quede una mezcla homogénea y ya tenemos nuestra crema preparada. En nuestro caso nos va a servir para aliñar unas rodajas de pescado, pero también se puede utilizar con patata cocida, o incluso carne a la plancha o pasta hervida.',
      'Como dura varios días en la nevera podemos probar con varias opciones. Aunque no se vea la quinoa cocida está debajo',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":224,"protein":14.1,"carbs":17.3,"fat":12.1,"fiber":2.9},
      per100g: {"calories":112,"protein":7.1,"carbs":8.7,"fat":6.1,"fiber":1.5},
    },
  },
  {
    id: 'pasteles-de-apio',
    title: 'Pasteles de Apio',
    category: 'Verdura',
    summary: 'Pasteles de Apio al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200412_155820-1024x552.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'habas peladas (las podemos comprar ya congeladas)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '3', baseQuantity: null, unit: '', name: '⅓  repollo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'puerro' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '6', baseQuantity: 1, unit: 'litro de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '9', baseQuantity: null, unit: '', name: 'Pan integral tostado' },
      { id: '10', baseQuantity: 40, unit: 'gr de', name: 'queso rallado' },
    ],
    steps: [
      'En una olla de base ancha derretimos 30 gramos de mantequilla y sofreímos 2 dientes de ajo y 1 puerro previamente picado. Rehogamos durante 3 minutos a fuego medio y añadimos entonces las habas peladas (yo las he utilizado congeladas), 1 patata cortada en dados y ⅓ de repollo (unos 250 gramos).',
      'Salpimentamos al gusto, añadimos 1 litro de caldo de verduras y dejamos chup chup durante 15 minutos. Ya sólo nos queda triturar todo muy bien hasta que se nos quede una consistencia de crema. A la hora de comerla la podemos acompañar de picatostes de pan tostado y un poco de queso rallado.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":341,"protein":15.6,"carbs":34.5,"fat":16.4,"fiber":5.6},
      per100g: {"calories":113,"protein":5.2,"carbs":11.5,"fat":5.5,"fiber":1.9},
    },
  },
  {
    id: 'patatas-a-la-riojana-con-chorizo-casero',
    title: 'Patatas a la Riojana con Chorizo Casero',
    category: 'Verdura',
    summary: 'Patatas a la Riojana con Chorizo Casero al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191201_121322-1024x541.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'guisantes frescos (yo he usado una bolsa de guisantes muy tiernos de Mercadona)' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'espaguetis' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'dados de pechuga de pollo' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'pistachos' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano rallado' },
      { id: '6', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '7', baseQuantity: 4, unit: 'hojas de', name: 'albahaca fresca' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Llevamos a ebullición en una olla agua y sal y metemos los guisantes, bajamos el fuego y mantenemos durante 4 minutos. Retiramos del fuego si ya están tiernos.',
      'Metemos en un procesador de alimentos y agregamos las hojas de albahaca, los pistachos, el ajo (yo le quito la simiente de dentro para que no repita) y 3 cucharadas de AOVE. Batimos bien hasta obtener una crema, aunque no es necesario que quede fina, fina.',
      'Reservamos Salteamos en una sartén los dados de pechuga de pollo y reservamos. Mientras tanto cocemos los espaguetis y cuando estén “al dente” los escurrimos reservando un vaso de esta agua de cocción.',
      'Volvemos a poner la pasta en la olla, sin agua, incorporamos el pesto de guisantes y medio vaso del agua de cocción. Lo mezclamos todo muy bien, añadimos el queso rallado y receta preparada. En nuestro caso hemos hecho el pesto que vamos a congelar.',
      'El día que lo utilicemos sólo tendremos que cocer la pasta y añadir el pesto, los dados de pechuga de pollo y el queso rallado.',
      'EXTRA: Tarta de calabaza y chocolate Receta inspirada en una de @naturalfood_inmacortes INGREDIENTES PARA LA BASE 8 dátiles 90 gr de anacardos tostados sin sal 90 gr de avellanas tostadas sin sal 2 cucharadas de mantequilla 2 cucharadas de aceite de coco INGREDIENTES PARA EL RELLENO 1 tableta de chocolate 75% 250 gr de calabaza asada 50 gr de cacao desgrasado en polvo 0% 400 gr de requesón 6 dátiles 3-4 gotas de esencia de vainilla PREPARACIÓN Es una receta muy sencilla que encontré en el perfil de @naturalfood_inmacortes, y a la que le he hecho un par de pequeñas variaciones.',
      'En primer lugar hidratamos los 6 dátiles que utilizaremos para el relleno. Si utilizamos agua bien caliente mejor, se hidratarán antes. En segundo lugar asamos la calabaza para el relleno.',
      'Mejor si aprovechamos el horno para asar más verduras, pan, patatas adobadas… Así aprovechamos la energía consumida por este electrodoméstico para hacer un par de recetas. Si la partimos por la mitad y precalentamos a 180º será suficiente con tenerla 45 minutos.',
      'En tercer lugar y mientras la calabaza se está horneando y caramelizando (no usaremos calabaza hervida por el exceso de agua) trituramos todos los ingredientes de la base y los vamos aplastando en una base para tarta. Reservamos en la nevera mientras preparamos el relleno.',
      'Así pues, una vez asada la calabaza y enfriada, en un vaso de batidora incorporamos la calabaza asada , el cacao desgrasado, el requesón, los 6 dátiles previamente hidratados y las gotas de esencia de vainilla y batimos todo hasta que esté todo integrado.',
      'Por último derretimos la tableta de chocolate con mucho cuidado en el micro para que no se nos queme y se lo añadimos a la mezcla. Batimos de nuevo muy bien y se lo agregamos al molde encima de la base.',
      'Refrigeramos unas horas antes de hincarle el diente para que la mezcla cuaje y listo, ya podemos disfrutar de un rico postre 😋',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":394,"protein":20.5,"carbs":34.4,"fat":19.1,"fiber":4.4},
      per100g: {"calories":131,"protein":6.9,"carbs":11.5,"fat":6.4,"fiber":1.5},
    },
  },
  {
    id: 'patatas-adobadas-al-horno',
    title: 'Patatas Adobadas al Horno',
    category: 'Verdura',
    summary: 'Patatas Adobadas al Horno al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'cebollas secas o cebolletas' },
      { id: '2', baseQuantity: 800, unit: 'gr de', name: 'calabacines' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una sartén de base ancha incorporamos 2 cucharadas de AOVE y cuando esté caliente añadimos 2 cebollas o cebolletas bien picadas y 2 patatas medianas cortadas en rodajas finas. Salpimentamos y tenemos a fuego bajo y tapado para que se vaya pochando poco a poco y no pierda líquido.',
      'Una vez que vemos que la cebolla se ha pochado y la patata empieza a estar blanda agregamos 800 gr de calabacines previamente picados. Para que suelten el agua subimos el fuego a la sartén, salpimentamos y removemos de forma constante, sin quitarle ojo.',
      'Pasados 2 minutos el calabacín habrá perdido la mayor parte del agua, así que bajamos de nuevo el fuego y chup chup tapado durante 12 minutos, destapamos y lo tenemos 4 minutos más. Cuando ha pasado este tiempo incorporamos 6 huevos SIN batir, rectificamos de sal y removemos suavemente.',
      'Lo ideal es que el huevo se cuaje lo justo para que la textura del plato quede melosa, así que cuando vemos que la clara está hecha ya podemos quitar del fuego. Listo, platazo preparado, no dejéis de hacerlo, cuando lleva cocinándose tantos años por algo será ¿no creéis?',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: {"calories":276,"protein":7.4,"carbs":33.5,"fat":12.1,"fiber":4.6},
      per100g: {"calories":99,"protein":2.7,"carbs":12.1,"fat":4.4,"fiber":1.7},
    },
  },
  {
    id: 'patatas-al-horno-con-limon',
    title: 'Patatas al Horno con Limón',
    category: 'Verdura',
    summary: 'Patatas al Horno con Limón al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191019_173700-1-1024x879.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '2', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 150, unit: 'ml de', name: 'vino blanco' },
      { id: '4', baseQuantity: 150, unit: 'ml de', name: 'caldo de pollo' },
      { id: '5', baseQuantity: 150, unit: 'gr de', name: 'queso fresco batido' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'tomates secos' },
      { id: '7', baseQuantity: 150, unit: 'gr de', name: 'guisantes' },
      { id: '8', baseQuantity: null, unit: '', name: 'Queso parmesano' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar doramos las pechugas de pollo. Para ello echamos 1 cucharada de AOVE en una sartén, fileteamos las pechugas para que se hagan antes, salpimentamos y doramos a fuego medio 2 ó 3 minutos por cada lado.',
      'Troceamos y reservamos En esa misma sartén sofreímos ahora los 3 dientes de ajo picados en una cucharada de AOVE.',
      'Cuando hayan tomado color incorporamos el vino blanco y dejamos que evapore el alcohol (acerca la nariz a la sartén, verás que ya no huele a alcohol, sino a algo más tirando a dulzón) Una vez evaporado el alcohol añadimos 150 ml de caldo de pollo, 150 gr de queso fresco batido, los tomates secos, los guisantes (yo los suelo usar congelados y los compro de la categoría “muy tierno”, así me aseguro que son pequeños), 50 gr de parmesano rallado y rectificamos de sal y pimienta.',
      'Chup chup a fuego medio – bajo 5 minutos. Añadimos entonces las pechugas de pollo previamente desmenuzadas y seguimos con el chup chup otros 5 minutos.',
      'Yo haré la receta hasta aquí, nos gusta tomar pasta los viernes así que la salsa la congelo siempre, el día antes la saco y la meto en la nevera y el día que la vamos a tomar sólo hemos de cocer la pasta.',
      'Os tengo que decir que la pasta se congela, no pasa nada por hacerlo, procura hacerlo separada de la salsa y sécala previamente con papel de cocina.',
      'Nosotros no lo hacemos porque lo cierto es que no nos gusta la textura, pero conozco mucha gente que lo hace, así que animaos a hacerlo también y así probáis, todo va en cuestión de gustos.',
      'Si conoces algún truco con el que la pasta congelada quede igual que recién hecha ¿lo compartirías conmigo? 👌👍☺ EXTRAS: Fiambre de pollo y clabaza y tarta de alubias negras',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":324,"protein":15.6,"carbs":30.9,"fat":15.6,"fiber":4.1},
      per100g: {"calories":108,"protein":5.2,"carbs":10.3,"fat":5.2,"fiber":1.4},
    },
  },
  {
    id: 'patatas-alinadas-con-limon-ajo-y-tomillo',
    title: 'Patatas Aliñadas con Limón, Ajo y Tomillo',
    category: 'Verdura',
    summary: 'Patatas Aliñadas con Limón, Ajo y Tomillo al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191215_204545-2-1024x596.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: 'cucharada de', name: 'tomillo seco' },
      { id: '3', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '4', baseQuantity: null, unit: '', name: 'Zumo de 1 limón' },
      { id: '5', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
    ],
    steps: [
      'En primer lugar lavamos muy bien las patatas y no las pelamos, les dejamos la piel y las cortamos por la mitad o en gajos. En todo caso nos aseguramos de que los trozos sean homogéneos.',
      'A continuación las ponemos en una bolsa de asar y agregamos el tomillo, 1 cucharada de AOVE, sal y pimienta al gusto, ralladura y zumo de 1 limón, 3 dientes de ajo machacados y un chorro pequeño de agua (o más AOVE) Horneamos a 200º unos 30 minutos o nosotros veamos que están doradas.',
      'Ya tenemos preparado un rico acompañamiento. Ya sabéis además, porque os lo he comentado en otras ocasiones, que si cocinamos la patata (mejor con piel), la dejamos enfriar y pasadas 24 horas la volvemos a calentar sin superar los 100º, habremos generado almidón resistente, es decir, no digerible, por lo que sirve de alimento a las bacterias “buenas” de nuestro intestino grueso, tiene de esta manera un efecto prebiótico.',
      'Y bien conservadas aguantan varios días en la nevera.',
    ],
    nutrition: {
      totalWeightGrams: 600,
      perServing: {"calories":174,"protein":3.4,"carbs":25.1,"fat":7.4,"fiber":3.9},
      per100g: {"calories":87,"protein":1.7,"carbs":12.6,"fat":3.7,"fiber":2},
    },
  },
  {
    id: 'patatas-y-huevos-en-salsa-verde',
    title: 'Patatas y Huevos en Salsa Verde',
    category: 'Entrantes',
    summary: 'Patatas y Huevos en Salsa Verde al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210214_181330351_resized_20210214_061405487.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'patatas' },
      { id: '2', baseQuantity: 4, unit: '', name: 'huevos medianos' },
      { id: '3', baseQuantity: null, unit: '', name: '1/2 cebolla' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '5', baseQuantity: null, unit: '', name: '1/2 vaso de vino blanco' },
      { id: '6', baseQuantity: 1, unit: 'litro de', name: 'caldo de pescado o verdura' },
      { id: '7', baseQuantity: 1, unit: '', name: 'bolsa pequeña de guisantes muy tiernos' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Picamos el ajo y la cebolla y lo ponemos a rehogar en una cazuela amplia con un par de cucharadas de AOVE y sal hasta que empiecen a coger color y esté blando. Mientras tanto pelamos las patatas, las lavamos y cortamos en rodajas no muy gruesas como de medio dedo y reservamos.',
      'Cuando la cebolla y el ajo estén, les añadimos las patatas un poco de sal y rehogamos; seguido le añadimos el vino blanco y dejamos un par de minutos. Ahora cubrimos las patatas con caldo de pescado o si preferís caldo de verduras y dejamos cocer unos 25 minutos.',
      'En este tiempo cocemos los huevos en abundante agua con sal durante 10 minutos, refrescamos, pelamos y partimos a la mitad.',
      'A los 15 minutos le añadimos los guisantes y los huevos partidos a la mitad y si hiciera falta más caldo también se lo incorporamos y dejamos que las patatas se terminen de hacer unos 10 minutos más.',
      'Comprobamos que las patatas estén cocidas pinchándolas, rectificamos el punto de sal si fuera necesario y si tenemos perejil le podemos espolvorear un poco por encima.',
    ],
    nutrition: {
      totalWeightGrams: 2150,
      perServing: {"calories":541,"protein":33.8,"carbs":43.9,"fat":26.3,"fiber":6.3},
      per100g: {"calories":252,"protein":15.7,"carbs":20.4,"fat":12.2,"fiber":2.9},
    },
  },
  {
    id: 'pate-de-lentejas-rojas-y-boniato-asado',
    title: 'Paté de Lentejas Rojas y Boniato Asado',
    category: 'Legumbres',
    summary: 'Paté de Lentejas Rojas y Boniato Asado al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191103_202846_resized_20191103_083532885.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'lentejas rojas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'boniato mediano' },
      { id: '3', baseQuantity: 150, unit: 'ml de', name: 'agua' },
      { id: '4', baseQuantity: 100, unit: 'ml de', name: 'leche de coco' },
      { id: '5', baseQuantity: 60, unit: 'gr de', name: 'almendras tostadas' },
      { id: '6', baseQuantity: null, unit: '', name: 'Curry, cúrcuma y pimentón dulce' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar asamos el boniato a 200º unos 25-30 minutos (podemos aprovechar para asar algo más en el horno y así aprovechamos la energía que en ese momento estamos gastando) Mientras el boniato se asa ponemos las lentejas rojas a cocer en agua y sal, no más de 10 minutos pues son de cocción rápida.',
      'Una vez asado el boniato y cocidas y escurridas las lentejas, introducimos ambos ingredientes en el vaso de un procesador de alimentos así como 150 ml de agua, 100 ml de leche de coco, una cucharadita de curry, otra de comino, otra de pimentón dulce, 2 cucharadas de AOVE y sal y pimienta al gusto.',
      'Y por último sólo nos queda licuar bien todo lo anterior hasta conseguir un paté cremoso. Listo, envasamos en un recipiente hermético y a la nevera.',
      'Nosotros lo utilizaremos para bocadillos y como acompañamiento de una ensalada verde (la ensalada la aliñamos un poco y en el centro ponemos una cucharada de este paté, removemos bien y a comer) pero le pega a la verdura asada e incluso como salsa de una pasta integral cualquiera (mezclada con un poco de agua de la cocción para hacerla más cremosa) Y hasta aquí la sesión de hoy, espero que podáis aprovechar ideas para llevarlas a la práctica y poder compaginar un poco más la vida doméstica con la laboral y personal. ¡Feliz semana!',
      'Navegación de entradas Anterior Paté de anchoas Siguiente Salmón marinado con soja, boniato asado y brócoli al vapor Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 760,
      perServing: {"calories":369,"protein":14.5,"carbs":43.8,"fat":17.4,"fiber":8.5},
      per100g: {"calories":193,"protein":7.6,"carbs":22.9,"fat":9.1,"fiber":4.5},
    },
  },
  {
    id: 'pate-de-tomates-secos',
    title: 'Paté de Tomates Secos',
    category: 'Verdura',
    summary: 'Paté de Tomates Secos al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'remolachas enteras' },
      { id: '2', baseQuantity: 2, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: null, unit: '', name: 'Un puñado de nueces' },
      { id: '4', baseQuantity: 2, unit: '', name: 'naranjas' },
      { id: '5', baseQuantity: null, unit: '', name: 'Hojas verdes' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y vinagre' },
    ],
    steps: [
      'Vamos a preparar una ensalada invernal con productos típicos de esta época del año, como remolacha y naranjas. Mucho me temo que nos la comeremos mi marido y yo, mis hijos no querrán ni probarla. Realmente no me preocupa, lo importante es que coman verdura.',
      'Lo que siempre os digo es que les demos a elegir opciones, todas ellas saludables, y que ellos decidan qué tomar. Así ellos se sienten importantes porque ven que deciden qué comen y nosotros nos sentimos tranquilos porque sabemos que se están alimentando de forma correcta.',
      'La preparación no tiene mucha historia: Lavamos bien las remolachas, pelamos la cebolla y envolvemos en papel vegetal o de aluminio cada pieza de forma individual. Y al horno a 190º durante 45 minutos.',
      'En esta sesión aprovecharemos para asar unos muslos de pavo al estilo cajún, así ahorramos energía y tiempo 😊 Pelamos las nueces y desgajamos las naranjas. Reservamos Cuando tengamos la verdura asada y esté atemperada la troceamos.',
      'Y ya sólo nos queda guardar en recipientes herméticos diferentes y unir en el momento que vayamos a consumir.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":201,"protein":3.4,"carbs":24.9,"fat":9.5,"fiber":4.2},
      per100g: {"calories":167,"protein":2.8,"carbs":20.7,"fat":7.9,"fiber":3.5},
    },
  },
  {
    id: 'pechugas-de-la-abuela',
    title: 'Pechugas de la Abuela',
    category: 'Verdura',
    summary: 'Pechugas de la Abuela al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'guisantes (yo los uso congelados)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 3, unit: '', name: 'ajos tiernos' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y 1 cucharadita de comino' },
    ],
    steps: [
      'Salteamos la cebolleta y los ajos tiernos bien picados en una sartén de base ancha con 1 cucharada de AOVE.',
      'Lo tenemos a fuego medio 3 minutos removiendo de vez en cuando tras lo cual añadimos los guisantes (yo los uso congelados muy tiernos), 1 cucharadita de comino y sal y pimienta al gusto y seguimos salteándolo todo a fuego medio 5 minutos más.',
      'Mientras tanto batimos 6 huevos, echamos la verdura que ya tenemos sofrita, mezclamos bien y ya sólo nos queda cuajar la tortilla en la misma sartén que hemos utilizado.',
    ],
    nutrition: {
      totalWeightGrams: 1040,
      perServing: {"calories":321,"protein":30.6,"carbs":14.1,"fat":17.3,"fiber":4.5},
      per100g: {"calories":154,"protein":14.7,"carbs":6.8,"fat":8.3,"fiber":2.2},
    },
  },
  {
    id: 'pechugas-de-pavo-en-salsa-de-champinon-y-queso',
    title: 'Pechugas de Pavo en Salsa de Champiñón y Queso',
    category: 'Carne',
    summary: 'Pechugas de Pavo en Salsa de Champiñón y Queso al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210612_191647-1024x705.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'pechugas de pavo' },
      { id: '2', baseQuantity: 1, unit: '', name: 'yogur griego' },
      { id: '3', baseQuantity: 50, unit: 'gr de', name: 'queso' },
      { id: '4', baseQuantity: 200, unit: 'gr de', name: 'champiñones' },
      { id: '5', baseQuantity: 100, unit: 'ml de', name: 'caldo de pollo' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'hierbas provenzales' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta al gusto' },
    ],
    steps: [
      'En primer lugar adobamos la carne. Para ello la manchamos con un poco de AOVE y la masajeamos bien con el fin de que se adhieran bien todas las especias.',
      'En esta ocasión vamos a utilizar orégano, hierbas provenzales, pimentón, sal y pimienta, distribuimos bien por toda la carne, tapamos y reservamos en la nevera al menos 1 hora. Para hacer la salsa salteamos los champiñones previamente limpiados de tierra y troceados.',
      'Si lo hacemos con el fuego alto conseguimos sellar la carne, no le quitamos ojo, removemos constantemente y en 1 minuto están hechos A continuación incorporamos los champiñones ya salteados, 1 yogur griego, 50 gr de queso y 100 ml de caldo de pollo en el vaso de un procesador de alimentos y batimos bien hasta que se nos queden todos los ingredientes bien integrados.',
      'Y ya sólo nos falta dorar la carne previamente troceada cuando haya reposado en la nevera. Lo hacemos en una sartén con un poco de AOVE y a fuego alto sin quitarle ojo. Se hace enseguida. Guardamos con la salsa y ya tenemos otro plato preparado, espero que os guste',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":407,"protein":41.9,"carbs":8.5,"fat":26.5,"fiber":2.1},
      per100g: {"calories":205,"protein":21.1,"carbs":4.3,"fat":13.4,"fiber":1.1},
    },
  },
  {
    id: 'pechugas-de-pollo-con-leche-de-coco',
    title: 'Pechugas de Pollo con Leche de Coco',
    category: 'Carne',
    summary: 'Pechugas de Pollo con Leche de Coco al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'pechugas enteras de pollo' },
      { id: '2', baseQuantity: 100, unit: 'ml de', name: 'leche de coco' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de curry en polvo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'puntita de canela molida' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal' },
    ],
    steps: [
      'Siempre me gusta llenar el horno cuando voy a utilizarlo, es una buena manera de ahorrar energía y tiempo, porque de una vez cocinamos varios platos. Por aquí puedes ver cómo hacer una sesión con solamente un horno y un microondas.',
      'En este caso tenía preparados los champiñones y las patatas pero quedaba espacio así que he ideado esta sencilla receta sobre la marcha. En una bolsa de asar introducimos 3 pechugas enteras de pollo.',
      'En un bol mezclamos 100 ml de leche de coco, 1 cucharadita colmada de curry en polvo, ¼ cucharadita de canela molida y sal al gusto, removemos bien y añadimos a la bolsa de asar. Impregnamos bien todas las pechugas con esta mezcla y horneamos a 180º durante 40 minutos. Y listo, otro plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 630,
      perServing: {"calories":246,"protein":34.8,"carbs":4.3,"fat":12.9,"fiber":0.5},
      per100g: {"calories":163,"protein":23.1,"carbs":2.9,"fat":8.6,"fiber":0.3},
    },
  },
  {
    id: 'pechugas-de-pollo-con-salsa-de-tomates-asados',
    title: 'Pechugas de Pollo con Salsa de Tomates Asados',
    category: 'Carne',
    summary: 'Pechugas de Pollo con Salsa de Tomates Asados al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'pechugas de pollo' },
      { id: '2', baseQuantity: 250, unit: 'gr de', name: 'tomates cherry' },
      { id: '3', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE),sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '6', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '7', baseQuantity: 50, unit: 'gr de', name: 'anacardos tostados sin sal' },
    ],
    steps: [
      'Antes de nada vamos a poner en remojo los anacardos. Aunque tengo entendido que en el proceso de recolección de este fruto seco se alcanzan temperaturas de hasta 70º y no es necesaria su activación poniéndolos a remojo, sí que lo haremos para que la salsa nos quede más cremosa.',
      'A continuación adobamos 3 pechugas de pollo enteras y 250 gr de tomates cherrys con AOVE, albahaca, sal y pimienta al gusto y disponemos todo ello en una bandeja apta para horno.',
      'Horneamos durante 30 minutos a 180º Una vez horneado vamos a hacer una salsa de rechupete con los tomates: En el vaso de un procesador de alimentos incorporamos estos tomates asados así como los anacardos escurridos, 2 dientes de ajo sin simiente, el zumo de ½ limón y sal y pimienta al gusto.',
      'Batimos bien hasta que se integren bien los ingredientes y nos quede una salsa cremosa Ya sólo nos queda mezclar con las pechugas y listo, plato preparado, ¿qué os parece? Nosotros acompañaremos con arroz integral cocido en la misma sesión de batch cooking, y una buena ensalada verde de primero 😋 Esta semana los acompañamientos van a ser arroz integral y huevos, que cada vez cuezo más porque ahora los peques me los piden para llevar de almuerzo al cole junto con una pieza de fruta: Es una muy buena opción proteíca y les encanta.',
      'Bueno, y hasta aquí la sesión de esta semana. Esta vez ha sido sábado por la tarde, como siempre os digo es cuestión de organización, nosotros hoy domingo queríamos salir a pasear por la mañana, está haciendo buen tiempo y queríamos aprovechar para tomar una buena ración de vitamina D, de ahí cambiar el día del batch cooking.',
      'Lo importante es mantener la cocina llena de buenas opciones, y a nosotros este sistema nos ayuda un montón. Ahora os dejo, que tengo que seguir estudiando 😅 ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking con lista de la compra inversa Siguiente Sesión de batch cooking de bienvenida a un diciembre atípico Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1030,
      perServing: {"calories":344,"protein":37.4,"carbs":10.9,"fat":18.5,"fiber":3.1},
      per100g: {"calories":167,"protein":18.1,"carbs":5.3,"fat":9,"fiber":1.5},
    },
  },
  {
    id: 'pescado-blanco-con-leche-de-coco',
    title: 'Pescado Blanco con Leche de Coco',
    category: 'Pescado',
    summary: 'Pescado Blanco con Leche de Coco al estilo La Vida Bonica.',
    image: 'images/2020_09_rbc-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pescado blanco (yo he utilizado filetes de merluza sin espina)' },
      { id: '2', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 2, unit: 'dientes de', name: 'ajos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra, sal y orégano' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'pimienta' },
      { id: '8', baseQuantity: null, unit: '', name: 'zumo de limón' },
    ],
    steps: [
      'Cortamos la cebolla en juliana y rehogamos en una cucharada de AOVE, junto con el ajo bien picado, unos 3-4 minutos a fuego medio-alto Una vez pasado este tiempo agregamos 200 ml de leche de coco, 1 cucharadita de orégano, 1 cucharadita de cúrcuma, zumo de ½ limón, sal y pimienta al gusto y un pelín de agua o caldo de verduras.',
      'Removemos y dejamos reducir a fuego medio bajo unos 10 minutos. Mientras tanto en otra sartén doramos los filetes de pescado, sacamos y reservamos Una vez pochada la verdura batimos para que la salsa quede homogénea y añadimos el pescado, chup chup 1 minuto y listo.',
    ],
    nutrition: {
      totalWeightGrams: 1220,
      perServing: {"calories":341,"protein":37.4,"carbs":8.5,"fat":20.6,"fiber":2.1},
      per100g: {"calories":159,"protein":17.3,"carbs":4,"fat":9.6,"fiber":1},
    },
  },
  {
    id: 'pescado-blanco-en-salsa-de-citricos',
    title: 'Pescado Blanco en Salsa de Cítricos',
    category: 'Pescado',
    summary: 'Pescado Blanco en Salsa de Cítricos al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'jamón york (más del 90%-95% de carne nos asegura tomar un fiambre de calidad)' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Tras limpiarlos de tierra colocamos los champiñones en una bandeja apta para horno, les quitamos los rabitos y los picamos, así como 60 gr de jamón york con alto contenido de carne (más del 90%, yo utilizo uno de ALDI que lleva un 96%).',
      'Rallamos 50 gr de queso Emmental y mezclamos con el jamón y el champiñón picado. Con esta mezcla rellenamos los champiñones, cubrimos la bandeja con papel de aluminio o papel vegetal y horneamos a 180º durante 30 minutos.',
      'Debería ser suficiente, no conviene cocinar mucho los champiñones para que no suelten mucha agua. Mi horno es grande y lento, seguramente con el tuyo se hagan en menos tiempo, compruébalo.',
    ],
    nutrition: {
      totalWeightGrams: 910,
      perServing: {"calories":374,"protein":35.6,"carbs":6.3,"fat":25.9,"fiber":2.5},
      per100g: {"calories":206,"protein":19.7,"carbs":3.5,"fat":14.3,"fiber":1.4},
    },
  },
  {
    id: 'pescado-blanco-en-salsa-de-limon',
    title: 'Pescado Blanco en Salsa de Limón',
    category: 'Pescado',
    summary: 'Pescado Blanco en Salsa de Limón al estilo La Vida Bonica.',
    image: 'images/2020_09_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 800, unit: 'gr de', name: 'pescado blanco' },
      { id: '2', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '3', baseQuantity: null, unit: '', name: 'Zumo de ½ limón' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'perejil' },
      { id: '8', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '9', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '10', baseQuantity: 300, unit: 'gr de', name: 'habitas tiernas' },
      { id: '11', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón picante' },
      { id: '12', baseQuantity: 100, unit: 'ml de', name: 'agua o caldo' },
      { id: '13', baseQuantity: null, unit: '', name: 'AOVE' },
    ],
    steps: [
      'Incorporamos en un bol un 100 ml de nata fresca, el zumo de ½ limón, 1 cucharadita de orégano, 1 cucharadita de albahaca, 1 cucharadita de perejil y sal y pimienta al gusto, removemos bien y reservamos.',
      'Disponemos los lomos de pescado en un recipiente apto para horno, agregamos la salsa por encima y horneamos a 190º durante 20 minutos.',
      'Mientras el pescado se está horneando hacemos el acompañamiento: En una sartén incorporamos 1 cucharada de AOVE y cuando esté caliente añadimos 1 cebolleta cortada en dados y 2 dientes de ajo picados. Removemos y llevamos cuidado de que no se quemen los ajos.',
      'Cuando empiecen a estar dorados añadimos 300 gr de habitas tiernas congeladas, 1 cucharadita de pimentón picante, 100 ml de agua o caldo, salpimentamos al gusto y cocinamos conjuntamente durante el tiempo que especifique la bolsa.',
      'Y ya tenemos el plato preparado, espero que os guste He dejado unos arbolitos sin triturar porque el brócoli que compré era muy grande',
    ],
    nutrition: {
      totalWeightGrams: 1610,
      perServing: {"calories":382,"protein":41.5,"carbs":14.1,"fat":20.5,"fiber":3.5},
      per100g: {"calories":168,"protein":18.3,"carbs":6.2,"fat":9,"fiber":1.5},
    },
  },
  // --- Batch cooking recipes (batch 5: 61 recipes) ---
  {
    id: 'pescado-blanco-en-salsa-de-mandarina',
    title: 'Pescado Blanco en Salsa de Mandarina',
    category: 'Pescado',
    summary: 'Pescado Blanco en Salsa de Mandarina al estilo La Vida Bonica.',
    image: 'images/2021_02_Polish_20210214_181330351_resized_20210214_061405487.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'filetes de pescado blanco' },
      { id: '2', baseQuantity: 2, unit: '', name: 'mandarinas trituradas (sin parte blanca)' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'zumo limón' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 1, unit: '', name: 'brócoli' },
      { id: '6', baseQuantity: 2, unit: '', name: 'yemas huevo' },
      { id: '7', baseQuantity: 1, unit: '', name: 'poco vino blanco' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: null, unit: '', name: 'Cáscara rallada de 1/2 mandarina' },
      { id: '10', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
    ],
    steps: [
      'Ponemos en el vaso de la Thermomix las dos mandarinas y las trituramos. Seguidamente añadimos la piel de mandarina rallada y el vino blanco. Ponemos en el Varoma 2 zanahorias cortadas y los filetes de pescado en la parte alta del Varoma previamente pincelada de aceite.',
      'Programamos 15’ velocidad 1, Varoma. Reservamos una vez hecho Colocamos la mariposa en las cuchillas. Añadimos zumo de limón, 30 gr de mantequilla, sal, pimienta y por último 2 yemas de huevo. Programamos 4’, 70 grados, velocidad 3. Y ya tenemos el plato preparado',
    ],
    nutrition: {
      totalWeightGrams: 1230,
      perServing: {"calories":394,"protein":38.9,"carbs":16.5,"fat":23.1,"fiber":3.3},
      per100g: {"calories":176,"protein":17.4,"carbs":7.4,"fat":10.4,"fiber":1.5},
    },
  },
  {
    id: 'pescado-blanco-en-salsa-de-romero-y-avellanas',
    title: 'Pescado Blanco en Salsa de Romero y Avellanas',
    category: 'Pescado',
    summary: 'Pescado Blanco en Salsa de Romero y Avellanas al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1-1024x798.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'pescado blanco sin espinas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 5, unit: 'dientes de', name: 'ajo' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'avellanas tostadas' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'tomate concentrado' },
      { id: '6', baseQuantity: 100, unit: 'ml de', name: 'caldo de verdura' },
      { id: '7', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de romero seco' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón ahumado' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una sartén de base ancha incorporamos 2 cucharadas de AOVE y sofreímos 1 cebolla previamente picada. Lo tenemos a fuego medio removiendo de vez en cuando y mientras se dora pelamos y laminamos 5 dientes de ajo, que añadiremos a la sartén para que se doren también.',
      'Antes de que empiecen a tomar mucho color y se doren en exceso sacamos de la sartén y disponemos en el vaso de un procesador de alimentos junto a 50 gr de avellanas tostadas, 50 gr de tomate concentrado, 100 ml de caldo de verdura o agua, 100 ml de nata fresca, 1 cucharadita colmada de romero seco, ½ cucharadita de pimentón ahumado y sal y pimienta al gusto.',
      'Trituramos todo bien hasta conseguir una consistencia sin grumos. Reservamos En la misma sartén doramos los lomos de pescado con un poco de AOVE 1 minuto por cada lado, incorporamos la salsa y damos un hervor conjunto durante 3 minutos. Y ya está, menú de pescado preparado.',
    ],
    nutrition: {
      totalWeightGrams: 1250,
      perServing: {"calories":421,"protein":42.1,"carbs":10.3,"fat":28.9,"fiber":3.9},
      per100g: {"calories":191,"protein":19.1,"carbs":4.7,"fat":13.1,"fiber":1.8},
    },
  },
  {
    id: 'pescado-en-salsa-de-piquillos',
    title: 'Pescado en Salsa de Piquillos',
    category: 'Pescado',
    summary: 'Pescado en Salsa de Piquillos al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191019_173700-1-1024x879.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'amos filetes de pescado blanco' },
      { id: '2', baseQuantity: 1, unit: 'lata de', name: 'pimientos del Piquillo' },
      { id: '3', baseQuantity: 100, unit: 'ml de', name: 'nata' },
      { id: '4', baseQuantity: 100, unit: 'ml de', name: 'leche' },
      { id: '5', baseQuantity: 3, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pelamos y picamos los ajos. Escurrimos los pimientos, los limpiamos de pepitas y partimos en tiras. En una sartén, con una cucharada de AOVE sofreímos los ajos un par de minutos. Añadimos los pimientos y sofreímos otros 10 minutos en fuego medio bajo con cuidado de no quemar el ajo.',
      'Vertemos la nata y la leche, sazonamos y cocemos otros 5 minutos, que espese la salsa. Sacar a un vaso de batidora y trituramos fino. Mientras tanto hacemos a la plancha el pescado y ya esta la receta lista, otra forma fácil, nutritiva y rica de tomar pescado',
    ],
    nutrition: {
      totalWeightGrams: 900,
      perServing: {"calories":306,"protein":31.4,"carbs":12.1,"fat":18.3,"fiber":2.9},
      per100g: {"calories":170,"protein":17.5,"carbs":6.8,"fat":10.2,"fiber":1.6},
    },
  },
  {
    id: 'picadillo-cubano-vegano',
    title: 'Picadillo Cubano Vegano',
    category: 'Verdura',
    summary: 'Picadillo Cubano Vegano al estilo La Vida Bonica.',
    image: 'images/2020_10_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'langostinos crudos' },
      { id: '2', baseQuantity: 400, unit: 'gr de', name: 'rape' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 3, unit: 'cucharadas de', name: 'tomate triturado' },
      { id: '7', baseQuantity: null, unit: '', name: '1/2 vaso de vino blanco' },
      { id: '8', baseQuantity: null, unit: '', name: 'Una cucharadita de pimentón dulce' },
      { id: '9', baseQuantity: 1, unit: '', name: 'patata' },
      { id: '10', baseQuantity: 2, unit: 'puñados de', name: 'fideos gruesos' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pelamos los langostinos y cocemos las cabezas y pieles en 1 litro de agua con sal y 1 hoja de laurel durante 5 minutos una vez rompa a hervir Colamos y reservamos.',
      'Rehogamos a fuego medio en una cucharada de AOVE los 2 dientes de ajo, la cebolla y el pimiento, todo ello bien picado, hasta que estén bien pochados. Añadimos el tomate y el vino. Subimos el fuego y dejamos reducir el alcohol.',
      'Añadimos el pimentón, la patata pelada y troceada y el caldo reservado y esperamos que rompa a hervir. Ponemos después los fideos y bajamos el fuego. Chup chup el tiempo que establezca en el paquete.',
      'A falta de 5 minutos ponemos el pescado troceado y a falta de un par de minutos ponemos los langostinos y tapamos la olla. Con este tiempo es suficiente para que la proteína se cocine el tiempo justo. Podemos decorar con perejil picado.',
    ],
    nutrition: {
      totalWeightGrams: 1700,
      perServing: {"calories":544,"protein":34.8,"carbs":43.1,"fat":29.5,"fiber":6.1},
      per100g: {"calories":255,"protein":16.3,"carbs":20.3,"fat":13.8,"fiber":2.9},
    },
  },
  {
    id: 'pipirrana-on-my-way',
    title: 'Pipirrana On My Way',
    category: 'Verdura',
    summary: 'Pipirrana On My Way al estilo La Vida Bonica.',
    image: 'images/2019_04_IMG_20190413_155711_resized_20190413_045529236.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'tomate en rama' },
      { id: '3', baseQuantity: 3, unit: '', name: 'huevos duros' },
      { id: '4', baseQuantity: 1, unit: 'bote de', name: 'aceitunas de' },
      { id: '5', baseQuantity: null, unit: '', name: 'cuquillo' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'alcaparras' },
      { id: '7', baseQuantity: 2, unit: 'latas de', name: 'caballa o atún en' },
      { id: '8', baseQuantity: null, unit: '', name: 'aceite de oliva o al natural' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Pelamos y picamos la cebolleta y la sumergimos en agua con un chorro de vinagre. La dejamos al menos 30 minutos. Pelamos y picamos el tomate, le podemos quitar las semillas y el agua, así quedará más seco, el huevo y el atún o caballa.',
      'Disponemos en un bol la anterior mezcla y añadimos el bote de aceitunas y la cebolleta previamente escurrida de agua y vinagre. Ya sólo queda aliñar con AOVE y sal. A un recipiente hermético y a la nevera. TORTILLA',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: {"calories":321,"protein":20.5,"carbs":15.1,"fat":20.9,"fiber":4.5},
      per100g: {"calories":165,"protein":10.5,"carbs":7.7,"fat":10.7,"fiber":2.3},
    },
  },
  {
    id: 'pollo-a-la-mostaza',
    title: 'Pollo a la Mostaza',
    category: 'Carne',
    summary: 'Pollo a la Mostaza al estilo La Vida Bonica.',
    image: 'images/2022_04_IMG_20220403_134617-1024x825.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'rodajas gruesas de bacoreta (o cualquier otro pescado)' },
      { id: '2', baseQuantity: 1, unit: 'lata de', name: 'pequeña de anchoas' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 2, unit: '', name: 'calabacines' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra AOVE), sal y pimienta' },
    ],
    steps: [
      'Creo que os comenté que hace unas semanas hice un curso sobre compra responsable de pescado y estoy intentando seguir las pautas que allí nos dieron.',
      'Por eso últimamente utilizo pescados que no están muy “al uso actual”, y en este caso traigo una receta realizada con bacoreta, un pequeño túnido que se pesca, entre otros lugares, en el mediterráneo.',
      'Es un pescado azul con altos niveles de ácidos grasos poliinsaturados, es decir, a tope de Omega-3 y podemos decir que es el hermano pequeño del atún. Como su pesca se realiza por pesquerías locales y artesanales lo puedes encontrar en el mercado de marzo a agosto aproximadamente.',
      'Su relación calidad-precio es muy buena, si no recuerdo mal me costó a 6€/kilo. Os paso la receta a ver si os gusta: Comenzamos con un cuchillo de punta, con el que hacemos pequeños cortes en la carne del pescado e introducimos trozos de anchoa. Reservamos.',
      'Cortamos en rodajas finas 1 cebolleta y 2 calabacines, las rehogamos en una sartén de base ancha con 2 cucharadas de AOVE. Lo tenemos tapado a fuego medio bajo durante 7 minutos, subimos el fuego, destapamos y tenemos 4 minutos más a fuego fuerte dando la vuelta de vez en cuando a la verdura.',
      'En otra sartén doramos los lomos de pescado que tenemos reservados, con una cucharadita de AOVE. Para saber si el lomo del pescado está cocinado nada más sencillo que meterle la espátula por debajo con el fin de darle la vuelta. Si entra con facilidad es que la carne está ya sellada.',
      'Si se resiste y se pega al fondo dejamos unos segundos más para que termine de cocinarse.',
      'Recordad que al ser una receta que no vamos a consumir, y que cuando lo hagamos vamos a volver a calentar, el tiempo de cocción del pescado lo tenemos que limitar mucho, con el fin de que al final la carne del pescado no se reseque.',
    ],
    nutrition: {
      totalWeightGrams: 1000,
      perServing: {"calories":374,"protein":35.9,"carbs":6.5,"fat":25.9,"fiber":2.3},
      per100g: {"calories":187,"protein":18,"carbs":3.3,"fat":13,"fiber":1.2},
    },
  },
  {
    id: 'pollo-al-ajillo-con-vinagre',
    title: 'Pollo al Ajillo con Vinagre',
    category: 'Carne',
    summary: 'Pollo al Ajillo con Vinagre al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220312_122729-1024x852.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'kg de', name: 'carne de pollo cortada tipo BBQ (en mi caso he utilizado pechugas de pollo por error al hacer la compra, pero quedará mejor con pollo entero troceado)' },
      { id: '2', baseQuantity: 6, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 6, unit: 'cucharadas de', name: 'vinagre' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '5', baseQuantity: null, unit: '', name: 'En una sartén de base ancha incorporamos 2 cucharadas de AOVE y sofreímos 1 kg de pollo ( o conejo) en trozos cortados tipo barbacoa. Los tenemos a fuego medio y vigilamos bien que se vayan dorando.' },
      { id: '6', baseQuantity: null, unit: '', name: 'Una vez que toda la carne esté sellada añadimos sal y pimienta al gusto, bajamos el fuego, tapamos y tenemos a fuego medio-bajo 15 minutos.' },
      { id: '7', baseQuantity: null, unit: '', name: 'Mientras tanto machacamos en un mortero 6 dientes de ajo con un poco de sal. Una vez bien machacados añadimos 6 cucharadas de vinagre, removemos bien e incorporamos a la sartén donde tenemos chup chup a fuego bajo la carne.' },
      { id: '8', baseQuantity: null, unit: '', name: 'Lo tenemos 5 minutos más chup chup para que todo el pollo quede bien impregnado y listo, una forma sencilla y sabrosa de tomar proteína animal.' },
      { id: '9', baseQuantity: null, unit: '', name: 'ESCALIVADA' },
      { id: '10', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '11', baseQuantity: 2, unit: '', name: 'pimientos rojos' },
      { id: '12', baseQuantity: 2, unit: '', name: 'cebolla' },
      { id: '13', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Pelamos la cebolla y la envolvemos en papel de aluminio o papel vegetal. Así conseguimos que no se tueste y se quede más crunchy, pero eso lo dejo a vuestra elección. Disponemos de la verdura en una bandeja de horno e introducimos en el mismo, precalentado a 180º, durante 60 minutos. Dejamos enfriar.',
      'Pelamos los tomates y los pimientos. Troceamos junto con la cebolla y mezclamos toda la verdura. Condimentamos con AOVE, sal y pimienta. Este plato aguanta varios días en la nevera,bien guardado en un recipiente hermético. Y está de rechupete 😋',
    ],
    nutrition: {
      totalWeightGrams: 1400,
      perServing: {"calories":364,"protein":33.5,"carbs":14.5,"fat":20.9,"fiber":4.1},
      per100g: {"calories":163,"protein":15,"carbs":6.5,"fat":9.4,"fiber":1.8},
    },
  },
  {
    id: 'pollo-al-horno-con-quinoa',
    title: 'Pollo al Horno con Quinoa',
    category: 'Carne',
    summary: 'Pollo al Horno con Quinoa al estilo La Vida Bonica.',
    image: 'images/2021_11_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '3', baseQuantity: 150, unit: 'ml de', name: 'leche de coco' },
      { id: '4', baseQuantity: 250, unit: 'ml de', name: 'caldo de carne' },
      { id: '5', baseQuantity: 200, unit: 'gr de', name: 'champiñones' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Precalentamos el horno a 200º Mientras alcanza temperatura doramos 500 gr de pechuga de pollo cortada en dados grandes en una sartén con 1 cucharada de AOVE. Lo hacemos a fuego fuerte para que se sellen bien los jugos de la carne, removiendo de forma frecuente y el tiempo justo.',
      'A continuación, incorporamos esta carne en un recipiente apto para horno y añadimos el resto de ingredientes: 100 gr de quinoa previamente lavada, 150 ml de leche de coco, 250 ml de caldo de carne, 200 gr de champiñones laminados, 1 cucharadita de orégano y sal y pimienta al gusto.',
      'Lo tapamos con papel de aluminio o vegetal, metemos al horno y dejamos hacer durante 60 minutos, 30 minutos tapado con papel vegetal o aluminio y 30 minutos sin tapar. Listo, plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 1200,
      perServing: {"calories":421,"protein":38.5,"carbs":25.9,"fat":23.9,"fiber":4.5},
      per100g: {"calories":196,"protein":18,"carbs":12.1,"fat":11.2,"fiber":2.1},
    },
  },
  {
    id: 'pollo-asado-a-la-cerveza',
    title: 'Pollo Asado a la Cerveza',
    category: 'Carne',
    summary: 'Pollo Asado a la Cerveza al estilo La Vida Bonica.',
    image: 'images/2020_10_IMG_20201003_121044.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pollo entero de corral' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'cebollas' },
      { id: '4', baseQuantity: 3, unit: '', name: 'tomates' },
      { id: '5', baseQuantity: 1, unit: 'lata de', name: 'cerveza' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'Precalentamos el horno a 190º En primer lugar mezclamos 1 cucharadita de tomillo, 1 cucharadita de orégano, 1 cucharadita de ajo en polvo y sal y pimienta al gusto en un pequeño bol.',
      'Echamos 1 cucharada de AOVE por el pollo y restregamos bien, tras lo cual embadurnamos con las especias mezcladas y masajeamos un pelín, hasta que quede bien impregnado.',
      'Reservamos En una bandeja de horno disponemos las patatas cortadas por la mitad, las cebollas en aros, los tomates bien lavados y enteros y ponemos encima el pollo. Echamos la lata de cerveza por encima y llevamos al horno.',
      'Lo dejamos hornear a 190º durante 60 minutos, le damos la vuelta y lo tenemos 30 minutos más a 220º y tapado con papel aluminio o vegetal. Así se dorará pero no se quedará seco. Y ya tenemos el pollo asado, sólo nos queda desmenuzarlo y guardarlo en un recipiente hermético en la nevera.',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: {"calories":544,"protein":41.9,"carbs":24.5,"fat":30.9,"fiber":4.9},
      per100g: {"calories":227,"protein":17.5,"carbs":10.2,"fat":12.9,"fiber":2.1},
    },
  },
  {
    id: 'pollo-en-salsa-de-tomate-y-coco',
    title: 'Pollo en Salsa de Tomate y Coco',
    category: 'Carne',
    summary: 'Pollo en Salsa de Tomate y Coco al estilo La Vida Bonica.',
    image: 'images/2021_06_IMG_20210607_153431_resized_20210607_103043405.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pollo troceado' },
      { id: '2', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '3', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de curry' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'cebolla en polvo' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '7', baseQuantity: 150, unit: 'ml de', name: 'agua' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar sellamos la carne del pollo en una olla de base ancha con 1 cucharadita de AOVE. Lo tenemos a fuego medio alto durante un par de minutos y removiendo de ver en cuando.',
      'Mientras tanto en un vaso grande agregamos el resto de ingredientes, es decir: 200 ml de leche de coco, 4 cucharadas de salsa de tomate, 1 cucharadita de cebolla en polvo, 1 cucharadita de ajo en polvo, 1 cucharadita de curry, 150 ml de agua y sal y pimienta al gusto, removemos bien e incorporamos a la olla.',
      'Dejamos chup chup a fuego bajo durante 50 minutos y listo, ya tenemos el pollo preparado. No tiene mucho misterio y el resultado os va a encantar.',
    ],
    nutrition: {
      totalWeightGrams: 1130,
      perServing: {"calories":366,"protein":32.9,"carbs":15.3,"fat":22.5,"fiber":3.5},
      per100g: {"calories":174,"protein":15.7,"carbs":7.3,"fat":10.7,"fiber":1.7},
    },
  },
  {
    id: 'pollo-entero-asado-con-especias-y-salsa-de-coco',
    title: 'Pollo Entero Asado con Especias y Salsa de Coco',
    category: 'Carne',
    summary: 'Pollo Entero Asado con Especias y Salsa de Coco al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190922_144306-1024x532.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'amos de arroz para paella' },
      { id: '2', baseQuantity: 600, unit: 'gr de', name: 'amos de carne de pollo' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'preparado para paella del Mercadona (está en la zona de los congelados)' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'pimentón rojo' },
      { id: '5', baseQuantity: 150, unit: 'gr de', name: 'amos de tomate triturado' },
      { id: '6', baseQuantity: null, unit: '', name: 'unas hebras de azafrán' },
      { id: '7', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '8', baseQuantity: 800, unit: 'gr de', name: 'agua' },
    ],
    steps: [
      'En este caso he preparado el sofrito, que congelaré en un recipiente apto. El viernes sólo tendremos que tenerlo ya descongelado (ponte una alarma para el jueves y lo metes al frigo) y echar el arroz y el azafrán, con 20 minutos tendréis un rico plato de arroz en vuestra mesa.',
      'Echamos un par de cucharadas de AOVE en el recipiente y lo ponemos a calentar. Cuando esté caliente echamos la carne de pollo previamente troceada y salada. Vamos removiendo para que se vaya dorando por parte iguales y se vaya haciendo también por dentro a fuego medio.',
      'Cuando la carne ya ha ‘cogido color’, echamos la verdura; es decir, la judía y el garrofón. Removemos todo durante un par de minutos y bajamos el fuego. Vamos colocando el contenido en los bordes de la paella dejando un hueco en el centro.',
      'Aquí echamos el tomate triturado y el pimentón para que coja un poco de sabor junto con el resto de ingredientes. Tras un par de minutos subimos el fuego y echamos el agua, para que se haga el caldo. Lo tendremos a fuego medio durante 20 minutos. En este paso he parado.',
      'El viernes continuaremos echando este sofrito en un recipiente al fuego, y cuando el mismo rompa a hervir añadiremos el arroz y el azafrán, tendremos a fuego fuerte 6 minutos y a fuego medio bajo unos 14, en total 20 minutos. Dejaremos reposar mientras nos comemos la ensalada y listo!',
      'EXTRAS: Gazpacho de remolacha y bombones de plátano',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":743,"protein":43.8,"carbs":63.9,"fat":34.9,"fiber":4.3},
      per100g: {"calories":261,"protein":15.3,"carbs":22.5,"fat":12.3,"fiber":1.5},
    },
  },
  {
    id: 'pollo-especiado-con-arroz',
    title: 'Pollo Especiado con Arroz',
    category: 'Carne',
    summary: 'Pollo Especiado con Arroz al estilo La Vida Bonica.',
    image: 'images/2020_11_RBC-e1665940576600.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 6, unit: '', name: 'contramuslos de pollo' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'arroz de grano largo' },
      { id: '3', baseQuantity: 1, unit: 'litro de', name: 'caldo de pollo' },
      { id: '4', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '5', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '6', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de ajo en polvo' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de comino' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'colmada de pimentón ahumado' },
      { id: '10', baseQuantity: null, unit: '', name: 'Sal y pimienta al gusto (yo he utilizado sal de hierbas: https://lavidabonica.com/sal-de-hierbas/ )' },
    ],
    steps: [
      'Precalentamos el horno a 190º, y mientras va cogiendo temperatura mezclamos en un bol el ajo en polvo, el comino, el pimentón ahumado y sal y pimienta al gusto. Removemos y reservamos.',
      'A continuación cortamos en tiras una cebolla, un pimiento rojo y un pimiento verde y mezclamos con las especias que teníamos reservadas.',
      'En una fuente apta para horno (yo he utilizado 2 más pequeñas) incorporamos las verduras adobadas, 6 contramuslos de pollo, 200 gr de arroz de grano largo, 1 litro de caldo de pollo y salpimentamos al gusto.',
      'Tapamos con papel de aluminio o una tapadera apta y lo horneamos durante 45 minutos a 190º, destapamos y dejamos 10 minutos más a 220º. Listo',
    ],
    nutrition: {
      totalWeightGrams: 2400,
      perServing: {"calories":654,"protein":37.4,"carbs":54.8,"fat":25.5,"fiber":3.5},
      per100g: {"calories":272,"protein":15.5,"carbs":22.8,"fat":10.6,"fiber":1.5},
    },
  },
  {
    id: 'pollo-marinado-con-salsa-de-soja-y-naranja',
    title: 'Pollo Marinado con Salsa de Soja y Naranja',
    category: 'Carne',
    summary: 'Pollo Marinado con Salsa de Soja y Naranja al estilo La Vida Bonica.',
    image: 'images/2020_02_IMG_20200209_094820-1024x746.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'judías verdes' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'queso curado' },
      { id: '5', baseQuantity: 2, unit: 'latas de', name: 'sardinas en aceite de oliva' },
    ],
    steps: [
      'Para optimizar tiempo en una sesión de batch cooking podemos aprovechar para hacer una crema de judías verdes (como en este caso) o un simple hervido y añadir más. En una olla llevamos agua a ebullición y añadimos 500 gr de judías verdes y 1 cebolla troceada.',
      'Salamos y dejamos hervir hasta que la verdura esté cocida, con 8 minutos será suficiente. Una vez cocida la verdura la incorporamos junto con 50 gr de queso curado en el vaso de un procesador de alimentos y batimos bien hasta que quede una consistencia cremosa. Yo haré hasta aquí.',
      'Congelaré la crema y el día que la vayamos a consumir coceremos pasta integral y mezclaremos junto con 2 latas de sardinas en aceite de oliva previamente escurrido.',
      'Y hasta aquí la sesión de esta semana,como veis es un poco especial, pero quería mostraros cómo el congelador puede ser nuestro gran aliado a la hora de tener buenas opciones sienpre presentes en la cocina.',
      'Si queréis una buena textura con un alimento congelado seguid estás indicaciones: Disponemos en un recipiente con cierre hermético a unas 3/4 partes de su capacidad.',
      'Dejamos atemperar el alimento con una servilleta o tapa por encima (para evitar que caigan bacterias nocivas) Cerramos bien y expulsamos el aire.',
      'Metemos en el congelador y, si es posible, con el botón de ultracongelación encendido (buscadlo en el libro de instrucciones,lo más probable es que lo lleve y ni lo sepáis,eso me pasó a mí 🤦🏻‍♀️) A la hora de descongelar,sacamos del congelador y metemos en la nevera o descongelamos con el microondas.',
      'Sí es un puré lo podemos volver a batir unos segundos para que la textura se homogeneice. Si es hidrato de carbono (arroz,quinoa…) y vemos que tiene un poco de agua lo podemos saltear con un poco de AOVE en una sartén unos minutos,removiendo de vez en cuando.',
      'Seguro que me dejo algo,pero no se me ocurre nada más. Si tenéis alguna duda estaré encantada de contestarla.',
      'Os deseo una feliz semana 💪🏽💚🤗 Navegación de entradas Anterior Paté de aceitunas verdes Siguiente Batch cooking tercera semana de febrero Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":351,"protein":26.3,"carbs":14.1,"fat":20.5,"fiber":4.5},
      per100g: {"calories":334,"protein":25.1,"carbs":13.4,"fat":19.5,"fiber":4.3},
    },
  },
  {
    id: 'pollo-satay-con-salsa-de-cacahuetes',
    title: 'Pollo Satay con Salsa de Cacahuetes',
    category: 'Carne',
    summary: 'Pollo Satay con Salsa de Cacahuetes al estilo La Vida Bonica.',
    image: 'images/2019_03_IMG_20190323_164742-1024x808.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'cebollas grandes' },
      { id: '2', baseQuantity: 2, unit: '', name: 'trozos de apio mediano' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias medianas' },
      { id: '4', baseQuantity: 3, unit: '', name: 'pimientos italianos' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'bacon ahumado' },
      { id: '6', baseQuantity: 1000, unit: 'gr de', name: 'carne mixta de vacuno y cerdo' },
      { id: '7', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '8', baseQuantity: 300, unit: 'ml de', name: 'vino tinto' },
      { id: '9', baseQuantity: 1, unit: '', name: 'vaso de caldo de carne' },
      { id: '10', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '11', baseQuantity: 60, unit: 'gr de', name: 'concentrado de tomate' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Picamos la cebolla, la zanahoria, el apio y el pimiento muy finito, yo lo haré en la Thermomix. En una olla grande echar tres cucharadas de AOVE y la mantequilla, poner a fuego medio, y esperar a que la mantequilla esté totalmente disuelta. Acto seguido, incorporar el picadillo de verdura.',
      'Dejamos sofreír las hortalizas hasta que estén blanditas. Picamos el bacon en trozos pequeños, de modo que se integre bien con la carne picada. Mezclamos bien con la carne y lo añadimos al sofrito cuando éste esté listo.',
      'Subimos el fuego para que la carne se fría y no se cueza, hasta que haya perdido el tono rosado por completo. Añadimos el vino tinto y dejamos evaporar por completo. Una vez haya evaporado por completo, añadir la sal y la pimienta al gusto.',
      'Calentamos el caldo y mezclamos con el concentrado de tomate para que no baje la temperatura de la carne. Bajamos el fuego e incorporamos el preparado a la olla, removiéndolo bien para que se mezcle.',
      'Ahora es importante mantener a fuego suave, chup chup muy flojito moviéndolo de vez en cuando para que se vaya consumiendo el caldo. Cuando lleve 45 minutos de cocción, añadimos la leche y mezclamos bien hasta que se consuma el líquido. Seguimos con el chup chup otros 30 minutos y listo.',
      'Ya sólo queda cocer pasta integral el día que vayamos a consumir y rallar queso por encima 💚👌🏼😋 Bueno,por ahora eso es todo, está sesión no trae ninguna receta nueva, pero sirve para que veáis que con planificación y un congelador el batch cooking saludable es 100% práctico.',
      'Y así no caemos en prisas de última hora,de qué vamos a comer hoy y nos arreglamos con cualquier cosa 👌🏼💪🏼💚 Espero que paséis una bonita semana y nos vemos el próximo domingo 🤗😘 Navegación de entradas Anterior Pan de avena y nueces Siguiente Batch cooking de alcachofas con ajos tiernos, lentejas al curry, espinacas con patatas, fiambre de pollo con especias, guiso de quinoa con ternera, curry de pescado, macarrones integrales con salsa de bechamel, pollo y brócoli y bocaditos de manzana fitness Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 3450,
      perServing: {"calories":1034,"protein":43.8,"carbs":43.9,"fat":63.9,"fiber":5.8},
      per100g: {"calories":299,"protein":12.7,"carbs":12.7,"fat":18.5,"fiber":1.7},
    },
  },
  {
    id: 'pollo-tikka-masala',
    title: 'Pollo Tikka Masala',
    category: 'Carne',
    summary: 'Pollo Tikka Masala al estilo La Vida Bonica.',
    image: 'images/2019_05_IMG_20190504_141225_resized_20190505_093153048.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '1/2 kg carne de cerdo picada' },
      { id: '2', baseQuantity: 100, unit: 'gr de', name: 'tocino fresco picada' },
      { id: '3', baseQuantity: 150, unit: 'gr de', name: 'salchicha blanca picada' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'piñones' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'Canela molida' },
      { id: '7', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Perejil' },
      { id: '9', baseQuantity: null, unit: '', name: '1/2 limón' },
      { id: '10', baseQuantity: 100, unit: 'gr de', name: 'molla de pan integral' },
      { id: '11', baseQuantity: 1, unit: '', name: 'chorro leche' },
      { id: '12', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '13', baseQuantity: null, unit: '', name: 'Lo primero que haremos serán las albóndigas, esta receta es' },
      { id: '14', baseQuantity: null, unit: '', name: 'inspiración de las típicas pelotas murcianas.' },
      { id: '15', baseQuantity: null, unit: '', name: 'Ponemos en un bol la miga de pan con el chorro de leche.' },
      { id: '16', baseQuantity: null, unit: '', name: 'Reservamos' },
      { id: '17', baseQuantity: null, unit: '', name: 'En otro bol ponemos el resto de los ingredientes: la carne, el' },
      { id: '18', baseQuantity: null, unit: '', name: 'tocino, la salchicha (todo ello picado, yo se lo pido al carnicero), los' },
      { id: '19', baseQuantity: null, unit: '', name: 'piñones tal cual, el ajo y el perejil picadito, sal y pimienta al gusto, un' },
      { id: '20', baseQuantity: null, unit: '', name: 'puntito de canela molida y el zumo de medio limón. Mezclamos bien.' },
    ],
    steps: [
      'hidratada en leche, terminamos de mezclar bien y metemos un ratito al frigorífico. Mientras tanto podemos preparar el guiso, que es lo más fácil del mundo: ¿Ves la lista de ingredientes? Pues nada, todos a la olla a presión. No hay más historia.',
      'Una vez que la olla esté cerrada y rompa a hervir le bajamos el fuego y chup chup unos 20 minutos. Cuando termine abrimos la olla, echamos el caldo en otra y vamos haciendo pelotas y metiendo en este caldo y cocinando a fuego medio unos 15 minutos.',
      'En mi caso he preferido no meter las pelotas en la olla desde un principio porque estaba ya muy llena y no quería que perdieran la forma, pero si tú te apañas, adelante. Y ya está, ya veréis qué rico, rico, los peques se lo comen que da gusto 😊.',
      'He hecho de más para que sobre para sopa y para ropa vieja.',
      'MARTES: Ensalada y marmitako MARMITAKO INGREDIENTES 500 gr bonito 600 gr patata 1 cebolla 2 tomates 1 pimiento Una cucharadita colmada de pimentón Perejil picado Sal y pimienta 1 l de caldo de pescado PREPARACIÓN Rehogamos en una olla con una cucharada de AOVE el pimiento, los tomates y la cebolla bien picados, a fuego medio bajo y removiendo de vez en cuando, aproximadamente 10 minutos.',
      'Cuando estén pochados añadimos el pimentón y el caldo de pescado y subimos el fuego para que rompa a hervir. Cuando ello ocurra incorporamos las patatas partidas en trozos grandes (si las cascamos con un cuchillo y rompemos',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":634,"protein":31.9,"carbs":34.9,"fat":37.4,"fiber":2.8},
      per100g: {"calories":362,"protein":18.3,"carbs":20.1,"fat":21.5,"fiber":1.6},
    },
  },
  {
    id: 'pure-de-brocoli-con-semillas-y-huevo',
    title: 'Puré de Brócoli con Semillas y Huevo',
    category: 'Sopa',
    summary: 'Puré de Brócoli con Semillas y Huevo al estilo La Vida Bonica.',
    image: 'images/2020_02_IMG_20200223_152625-1024x538.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'brócoli grande' },
      { id: '2', baseQuantity: 1, unit: '', name: 'nabo' },
      { id: '3', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '4', baseQuantity: 100, unit: 'ml de', name: 'leche de coco' },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '6', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'semillas de calabaza' },
    ],
    steps: [
      'En una olla con abundante agua y 1 cucharadita de sal cocemos el tallo del brócoli y el nabo, previamente pelado y cortado en trozos grandes, así como 4 huevos (lávalos bien antes) Lo tenemos a fuego medio durante 6 minutos, añadimos los ramilletes de brócoli y seguimos con el chup chup 3 minutos más.',
      'Escurrimos e incorporamos en el vaso de un procesador de alimentos junto a ½ cucharadita de nuez moscada y 100 ml de leche de coco. Salpimentamos al gusto y listo. en el momento de consumir pondremos como topping huevo cocido y unas semillas de calabaza.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":184,"protein":11.4,"carbs":14.9,"fat":8.5,"fiber":4.9},
      per100g: {"calories":175,"protein":10.8,"carbs":14.1,"fat":8.1,"fiber":4.7},
    },
  },
  {
    id: 'quinoa-con-pechuga-de-pavo-y-verdura',
    title: 'Quinoa con Pechuga de Pavo y Verdura',
    category: 'Carne',
    summary: 'Quinoa con Pechuga de Pavo y Verdura al estilo La Vida Bonica.',
    image: 'images/2019_08_IMG_20190826_190620-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'berenjenas medianas' },
      { id: '2', baseQuantity: null, unit: '', name: 'Salsa de tomate' },
      { id: '3', baseQuantity: 3, unit: '', name: 'lonchas de lacón' },
      { id: '4', baseQuantity: 5, unit: '', name: 'pimientos asados' },
      { id: '5', baseQuantity: 70, unit: 'gr de', name: 'queso semitierno' },
      { id: '6', baseQuantity: null, unit: '', name: 'Orégano' },
    ],
    steps: [
      'En plena época de berenjenas y con la producción a tope en el huerto he hecho varias semanas ya esta receta. Si bien el primer día pensé que los peques no se iban a animar a probarlas, cuando llegué a casa del trabajo me recibieron los dos con un súper abrazo… Y yo más feliz que una perdiz.',
      'He de reconocer que a mis hijos la pizza les pierde, y esta forma de sustituir la masa por una rodaja de berenjena les ha encantado. Así que hoy la he vuelto a hacer para enseñárosla. Lavamos bien las berenjenas y cortamos en rodajas no muy finas, de 1 cm de grosor aproximado.',
      'Una vez cortadas las colocamos en una bandeja de horno con papel vegetal. Tras ello echamos un poco de salsa de tomate encima de cada rodaja. Para haceros una idea con una cucharadita rasa tengo para 3 rodajas.',
      'Después de haber incorporado la salsa de tomate espolvoreamos un poco de orégano seco por encima.',
      'Una vez hecho este paso ponemos un trozo de pimiento asado (yo lo he puesto en la mitad de las rodajas, no sé si a los peques este invento les va a gustar, en todo caso lo voy a intentar), encima un trozo de lacón y por último un trozo de queso (yo lo corto con un pela patatas, así salen trozos finos de queso) En resumen, y para recapitular va en primer lugar la rodaja de berenjena apenas manchada con un poco de salsa de tomate y orégano seco.',
      'En segundo lugar el relleno, que en este caso ha sido un trozo de pimiento asado y un poco de lacón. Y en último lugar un poco de queso. Y al horno previamente precalentado a 190º unos 30 minutos. Ya veréis qué delicia! Nosotros lo acompañaremos de arroz cocido y de ensalada verde de primero.',
      'MARTES: Ensalada y quinoa con pavo y verduras',
    ],
    nutrition: {
      totalWeightGrams: 2250,
      perServing: {"calories":543,"protein":29.5,"carbs":34.5,"fat":26.3,"fiber":5.5},
      per100g: {"calories":241,"protein":13.1,"carbs":15.3,"fat":11.7,"fiber":2.4},
    },
  },
  {
    id: 'ragu-de-carne-a-la-bolonesa',
    title: 'Ragú de Carne a la Boloñesa',
    category: 'Carne',
    summary: 'Ragú de Carne a la Boloñesa al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1-1024x798.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'cebollas grandes' },
      { id: '2', baseQuantity: 2, unit: '', name: 'trozos de apio mediano' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias medianas' },
      { id: '4', baseQuantity: 3, unit: '', name: 'pimientos italianos' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'bacon ahumado' },
      { id: '6', baseQuantity: 1000, unit: 'gr de', name: 'carne mixta de vacuno y cerdo' },
      { id: '7', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '8', baseQuantity: 300, unit: 'ml de', name: 'vino tinto' },
      { id: '9', baseQuantity: 1, unit: '', name: 'vaso de caldo de carne' },
      { id: '10', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '11', baseQuantity: 60, unit: 'gr de', name: 'concentrado de tomate' },
      { id: '12', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Picamos la cebolla, la zanahoria, el apio y el pimiento muy finito, yo lo haré con la Thermomix. En una olla grande echar tres cucharadas de AOVE y 30 gr de mantequilla, poner a fuego medio, y esperar a que la mantequilla esté totalmente disuelta. Acto seguido, incorporar el picadillo de verdura.',
      'Dejamos sofreír las hortalizas hasta que estén blanditas, a fuego medio y removiendo de vez en cuando. A continuación picamos el bacon en trozos pequeños, de modo que se integre bien con la carne picada. Mezclamos bien con la carne y lo añadimos al sofrito cuando éste esté listo.',
      'Subimos el fuego para que la carne se fría y no se cueza, hasta que haya perdido el tono rosado por completo. Añadimos el vino tinto y dejamos evaporar por completo. Una vez haya evaporado por completo, añadir la sal y la pimienta al gusto.',
      'Calentamos el caldo y mezclamos con el concentrado de tomate para que no baje la temperatura de la carne. Bajamos el fuego e incorporamos el preparado a la olla, removiéndolo bien para que se mezcle.',
      'Ahora es importante mantener a fuego suave, chup chup muy flojito moviéndolo de vez en cuando para que se vaya consumiendo el caldo. Cuando lleve 45 minutos de cocción, añadimos la leche y mezclamos bien hasta que se consuma el líquido. Seguimos con el chup chup otros 30 minutos y listo.',
      'En este caso he hecho el doble de cantidad, congelaré en tuppers preparados para consumir en dos veces. El día que la vayamos a consumir haremos la pasta integral y tendremos nuestro plato de rica pasta preparado.',
    ],
    nutrition: {
      totalWeightGrams: 3450,
      perServing: {"calories":1039,"protein":43.5,"carbs":43.9,"fat":63.5,"fiber":5.5},
      per100g: {"calories":300,"protein":12.5,"carbs":12.6,"fat":18.3,"fiber":1.6},
    },
  },
  {
    id: 'reganas-de-queso',
    title: 'Regañás de Queso',
    category: 'Pan',
    summary: 'Regañás de Queso al estilo La Vida Bonica.',
    image: 'images/2020_03_IMG_20200329_180018_resized_20200329_060903018.jpg',
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
      'En una olla de base ancha se derriten 2 cucharadas de mantequilla y con ellas se doran la cebolla y los pimientos, todo ello bien picado. Removemos y dejamos que dore a fuego medio durante 3 minutos.',
      'Añadimos entonces la carne troceada y dejamos que vaya dorando, removiendo bien de vez en cuando para que la carne quede sellada por todos los lados. Incorporamos mientras tanto 1 cucharadita de tomillo, 1 cucharadita de comino, 1 cucharadita de pimentón y sal y pimienta al gusto.',
      'Agregamos entonces 750 ml de caldo de verduras, 100 ml de vino blanco y chup chup durante 60 minutos. Listo. Nosotros vamos a acompañar de arroz cocido MARTES: Sopa de almejas y arroz y lentejas con coliflor',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: {"calories":573,"protein":30.9,"carbs":24.9,"fat":36.4,"fiber":2.9},
      per100g: {"calories":286,"protein":15.5,"carbs":12.5,"fat":18.2,"fiber":1.5},
    },
  },
  {
    id: 'rulo-de-carne-picada-y-setas',
    title: 'Rulo de Carne Picada y Setas',
    category: 'Carne',
    summary: 'Rulo de Carne Picada y Setas al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1024x744.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'paquete de bacon ahumado' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
    ],
    steps: [
      'Con otra ⅓ parte de esta masa vamos a hacer unos rollitos con bacon. Para ello tomamos 1 loncha y la rellenamos con 1 cucharada de la masa. Envolvemos como si fuese un rulo y lo colocamos en un recipiente apto para horno. Así con todo el paquete.',
      'Si utilizamos un recipiente grande podemos añadir algo de verdura y que se cocine al mismo tiempo. Yo he añadido 1 pimiento italiano y 1 pimiento rojo. Horneamos tapado con papel vegetal o aluminio durante 30 minutos a 200º con calor arriba y abajo.',
      'Quitamos el papel y ya destapado seguimos horneando a 220º 15 minutos más.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":351,"protein":23.5,"carbs":10.5,"fat":23.9,"fiber":2.5},
      per100g: {"calories":334,"protein":22.4,"carbs":10.1,"fat":22.9,"fiber":2.4},
    },
  },
  {
    id: 'salmon-al-horno-con-esparragos',
    title: 'Salmón al Horno con Espárragos',
    category: 'Pescado',
    summary: 'Salmón al Horno con Espárragos al estilo La Vida Bonica.',
    image: 'images/2019_12_IMG_20191215_204545-2-1024x596.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'rodajas de', name: 'salmón' },
      { id: '2', baseQuantity: 1, unit: '', name: 'manojo de espárragos verdes' },
      { id: '3', baseQuantity: 1, unit: '', name: 'limón' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Precalentamos el horno a 190º Salpimentamos las rodajas de salmón y las disponemos en un recipiente apto para horno. Después de lavar los espárragos les quitamos la parte dura (yo voy empujando suavemente con el dedo índice y pulgar desde la base hasta que él solo se rompe) y añadimos a la bandeja.',
      'Salpimentamos y regamos con 1 ó 2 cucharadas de AOVE. Partimos un limón por la mitad y todo al horno durante unos 15 minutos a 190º (depende de vuestro horno). Cuando pase el tiempo sacamos del horno y rociamos con el limón el salmón y los espárragos.',
      'Hay que llevar cuidado para que no se pase de cocción y quede seco.',
      'Además, como no lo vamos a consumir inmediatamente, es mejor quedarnos un poco cortos de cocción y que el pescado se termine de hacer en el momento de comerlo (normalmente calentamos la comida en el microondas, donde se terminará de hacer) MARTES Y MIÉRCOLES: Ensalada de col lombarda y cocido: Haciendo bunas raciones podemos comer dos días la misma comida.',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":278,"protein":29.5,"carbs":0.9,"fat":16.5,"fiber":0.5},
      per100g: {"calories":264,"protein":28.1,"carbs":0.9,"fat":15.7,"fiber":0.5},
    },
  },
  {
    id: 'salmon-al-horno-con-verduras',
    title: 'Salmón al Horno con Verduras',
    category: 'Pescado',
    summary: 'Salmón al Horno con Verduras al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-1.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: 'rodajas de', name: 'salmón' },
      { id: '2', baseQuantity: 1, unit: '', name: 'trozo de calabada' },
      { id: '3', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'limón' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Precalentamos el horno a 190º Salpimentamos las rodajas de salmón y las disponemos en un recipiente apto para horno. Pelamos y troceamos las cebolletas y la calabaza en forma de bastones estrachos, para que tarde poco en cocinarse, y añadimos a la bandeja.',
      'Salpimentamos y regamos con 1 ó 2 cucharadas de AOVE. Partimos un limón por la mitad y todo al horno durante unos 15 minutos a 190º (depende de vuestro horno). Cuando pase el tiempo sacamos del horno y rociamos con el limón el salmón y la verdura.',
      'Hay que llevar cuidado para que no se pase de cocción y quede seco.',
      'Además, como no lo vamos a consumir inmediatamente, es mejor quedarnos un poco cortos de cocción y que el pescado se termine de hacer en el momento de comerlo (normalmente calentamos la comida en el microondas, donde se terminará de hacer)',
    ],
    nutrition: {
      totalWeightGrams: 1550,
      perServing: {"calories":364,"protein":30.9,"carbs":10.5,"fat":20.9,"fiber":2.5},
      per100g: {"calories":235,"protein":20.1,"carbs":6.8,"fat":13.5,"fiber":1.6},
    },
  },
  {
    id: 'salmon-con-hierbas-aromaticas',
    title: 'Salmón con Hierbas Aromáticas',
    category: 'Pescado',
    summary: 'Salmón con Hierbas Aromáticas al estilo La Vida Bonica.',
    image: 'images/2019_11_IMG_20191109_185425-1024x629.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 600, unit: 'gr de', name: 'acelgas' },
      { id: '2', baseQuantity: 5, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 200, unit: 'ml de', name: 'leche de coco' },
      { id: '4', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
      { id: '5', baseQuantity: null, unit: '', name: 'Curry, sal y pimienta' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE' },
    ],
    steps: [
      'Os presento por aquí otra amena forma de tomar puré de verduras, en esta ocasión de acelgas, que en casa los peques no la toleran aún entera, aunque sí en forma de crema. En primer lugar lavamos bien las acelgas y separamos las pencas de las hojas.',
      'Incorporamos estas últimas en una olla con una cucharada de AOVE y las sofreímos un poco junto con las zanahorias cortadas en trozos.',
      'Lo tenemos a fuego medio bajo durante 3 ó 4 minutos y una vez que ha tomado color añadimos 300 ml de agua o caldo vegetal, 200 ml de leche de coco, 1 cucharadita de curry y salpimentamos al gusto. Dejamos que haga chup chup durante 5 minutos y apagamos el fuego.',
      'En ese momento añadimos las hojas de las acelgas y tapamos la olla. Por último batimos bien todo hasta que quede una consistencia de crema y listo, ya tenemos el plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2350,
      perServing: {"calories":444,"protein":34.9,"carbs":20.5,"fat":24.5,"fiber":4.9},
      per100g: {"calories":189,"protein":14.9,"carbs":8.7,"fat":10.4,"fiber":2.1},
    },
  },
  {
    id: 'salteado-de-setas-con-garam-masala',
    title: 'Salteado de Setas con Garam Masala',
    category: 'Verdura',
    summary: 'Salteado de Setas con Garam Masala al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20181109_215540-1024x561.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla pelada y entera' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'judías verdes (yo las he utilizado congeladas)' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal' },
    ],
    steps: [
      'Ponemos 3 dedos de agua en la olla rápida y ponemos al fuego. Mientras, vamos pelando las patatas, las lavamos y cortamos en 3 trozos grandes. Incorporamos a la olla Pelamos la cebolla y le hacemos un corte sin llegar a partir por la mitad. Incorporamos.',
      'Añadimos también las judías verdes, echamos sal y tapamos 20 minutos a fuego medio a partir de que rompa a hervir. Listo, tenemos nuestra ración de vitaminas preparada',
    ],
    nutrition: {
      totalWeightGrams: 1650,
      perServing: {"calories":201,"protein":10.5,"carbs":24.1,"fat":6.5,"fiber":4.5},
      per100g: {"calories":122,"protein":6.4,"carbs":14.6,"fat":3.9,"fiber":2.7},
    },
  },
  {
    id: 'san-jacobos-de-coliflor',
    title: 'San Jacobos de Coliflor',
    category: 'Verdura',
    summary: 'San Jacobos de Coliflor al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-2-1024x741.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'coliflor' },
      { id: '2', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 80, unit: 'gr de', name: 'queso parmesano' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'hierbas provenzales' },
      { id: '5', baseQuantity: 2, unit: 'cucharaditas de', name: 'cebolla en polvo' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '7', baseQuantity: 80, unit: 'gr de', name: 'queso' },
      { id: '8', baseQuantity: 4, unit: '', name: 'lonchas de fiambre de york o cerdo (con más del 90% de carne nos aseguramos que es más saludable)' },
    ],
    steps: [
      'En primer lugar rallamos 1 coliflor pequeña, la disponemos en un recipiente, agregamos 1 cucharadita de sal y dejamos que repose durante 20 minutos.',
      'Una vez pasados los 20 minutos escurrimos la coliflor en un paño de cocina limpio o con las manos (es importante escurrir la mayor cantidad de agua posible) y volvemos a colocar en el recipiente.',
      'Añadimos entonces 4 huevos, 80 gr de queso parmesano, 1 cucharadita de hierbas provenzales, 2 cucharaditas de cebolla en polvo y sal y pimienta al gusto y mezclamos todo muy bien. Ahora nos toca hacer los “San Jacobos”.',
      'En una sartén o plancha incorporamos 1 cucharada de AOVE y cuando esté caliente vertemos parte de la mezcla que tenemos en el recipiente, cuidando de hacer trozos rectangulares para que se parezcan lo más posible al original.',
      'Lo tenemos a fuego medio-bajo 3 minutos, le damos la vuelta y le añadimos 20 gr de queso de vuestra elección y una loncha de fiambre y lo tenemos 3 minutos más. Lo cerramos y ya tenemos nuestro fake “San Jacobo” preparado, hacemos el resto y a disfrutar.',
    ],
    nutrition: {
      totalWeightGrams: 1450,
      perServing: {"calories":394,"protein":24.5,"carbs":14.9,"fat":25.9,"fiber":4.5},
      per100g: {"calories":271,"protein":16.9,"carbs":10.3,"fat":17.9,"fiber":3.1},
    },
  },
  {
    id: 'setas-y-brocoli-en-salsa-americana',
    title: 'Setas y Brócoli en Salsa Americana',
    category: 'Verdura',
    summary: 'Setas y Brócoli en Salsa Americana al estilo La Vida Bonica.',
    image: 'images/2019_03_BATCH-COOKING-1024x562.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'habas (yo las tengo congeladas)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla.' },
      { id: '3', baseQuantity: 4, unit: '', name: 'huevos.' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Bastante sencillo, ¿verdad? Picamos la cebolla y sofreímos con 1 cucharada de AOVE a fuego medio bajo. Cuando empiece a ponerse transparente añadimos las habas y si es necesario otra cucharada de AOVE. Mientras se sofríen las verduras batimos 4 huevos.',
      'Y ya sólo queda hacer la tortilla, le damos la vuelta con cuidado y ya tenemos nuestro primer plato preparado. BACALAO A LA AMERICANA La semana pasada estuvimos con los abuelos y comimos calamares en salsa americana.',
      'El caso es que a los peques les gustó la salsa pero los calamares no, así que he pensado en cambiar el ingrediente, y como el bacalao se lo comen bien…adjudicado!',
      'Es más, voy a hacer el doble de salsa porque voy a utilizar la otra ración con verduras, la abuela hizo setas y estaban espectaculares, así que me voy a copiar de mi mami, que seguro que me da permiso 😊 INGREDIENTES 4 lomos de bacalao 2 cebollas grandes 2 pimientos verdes pequeños 4 ajos 300 gr de tomate natural triturado 100 ml de vino blanco 2 vaso de agua AOVE, sal y pimienta 2 hojas de laurel ajo y perejil PREPARACIÓN Hacemos un sofrito con las cebollas y pimientos picado y un par de cucharadas de AOVE.',
      'Cuando la cebolla esté dorada incorporar el tomate, que sofría un poco. A continuación echar el vino blanco, la sal, la pimienta y el laurel Removemos un poco, esperamos a que se evapore el alcohol y bajamos el fuego, chup chup unos 20 minutos.',
      'Si notamos que la salsa se va quedando seca le añadimos agua. Hacemos un majado en el mortero con ajo y perejil y añadimos a la cazuela, removemos y dejamos cocer 5 minutos. A continuación, si no queremos encontrar la verdura troceada batiremos bien.',
      'Es el momento de hacer dos raciones, a una mitad añadiremos los lomos de bacalao y lo tendremos chup chup unos 5 minutos. La otra mitad de la salsa la reservamos para la siguiente receta. MARTES: Ensalada y pollo en salsa de yogur pollo en salsa de yogur INGREDIENTES 2 pechugas de pollo campero',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":246,"protein":14.9,"carbs":14.5,"fat":14.5,"fiber":3.5},
      per100g: {"calories":234,"protein":14.2,"carbs":13.8,"fat":13.8,"fiber":3.3},
    },
  },
  {
    id: 'setas-y-patatas-al-ajillo',
    title: 'Setas y Patatas al Ajillo',
    category: 'Verdura',
    summary: 'Setas y Patatas al Ajillo al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220320_125957-1024x940.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'coles de bruselas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'zanahoria' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '6', baseQuantity: 400, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'leche evaporada' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'curry en polvo' },
      { id: '9', baseQuantity: 0.5, unit: 'cucharadita de', name: 'pimentón picante' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar pochamos 1 cebolla y los 2 dientes de ajo, todo ello bien picado, en una olla con 1 cucharada de AOVE.',
      'Lo tenemos 1 minuto a fuego medio-alto y una vez pasado ese tiempo bajamos la temperatura para que no se dore en exceso (incluso le podemos añadir un pelín de agua para evitar poner más aceite) y lo dejamos 3 minutos más. Picamos mientras tanto 1 zanahoria y la incorporamos a la olla.',
      'Lavamos ahora 300 gr de coles de bruselas y escurrimos las alubias del bote. Reservamos Una vez que han pasado los 3 minutos incorporamos a la olla 400 ml de caldo de verduras, 100 ml de leche evaporada, 1 cucharadita de curry en polvo, ½ cucharadita de pimentón picante y sal y pimienta al gusto.',
      'Removemos bien para que las especias y la leche evaporada se integren bien en el caldo. Añadimos ahora las coles de bruselas y las alubias, dejamos chup chup a fuego medio bajo con la tapa un poco abierta durante 8 minutos y ya tenemos un rico guiso preparado, ¿qué os parece?',
    ],
    nutrition: {
      totalWeightGrams: 2050,
      perServing: {"calories":421,"protein":17.5,"carbs":43.5,"fat":22.5,"fiber":6.5},
      per100g: {"calories":205,"protein":8.5,"carbs":21.1,"fat":10.9,"fiber":3.2},
    },
  },
  {
    id: 'shakshuka',
    title: 'Shakshuka',
    category: 'Entrantes',
    summary: 'Shakshuka al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190908_153926-1024x373.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'tomate' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento verde italiano' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: null, unit: '', name: 'Pimentón dulce' },
      { id: '6', baseQuantity: 500, unit: 'gr de', name: 'patatas' },
      { id: '7', baseQuantity: 400, unit: 'ml de', name: 'caldo de pescado' },
      { id: '8', baseQuantity: 400, unit: 'gr de', name: 'lomos de salmón' },
      { id: '9', baseQuantity: 250, unit: 'ml de', name: 'vino blanco' },
      { id: '10', baseQuantity: null, unit: '', name: 'AOVE, sal y perejil' },
    ],
    steps: [
      'Comenzamos la receta picando la cebolla, el pimiento y el ajo y dorando esta verdura con una cucharada de AOVE en una olla de base ancha. Lo tenemos 5 minutos a fuego medio bajo y añadimos el tomate previamente rallado. Removemos bien y cocinamos hasta que la verdura esté pochada.',
      'A continuación incorporamos una cucharadita colmada de pimentón dulce y removemos bien. Agregamos entonces 250 ml de vino blanco y cocinamos hasta que se evapore el alcohol.',
      'En el momento en que el alcohol está evaporado incorporamos 500 gr de patatas chascadas, 300 ml de caldo de pescado y chup chup durante 10 minutos. Para finalizar agregamos 400 gr de lomos de salmón cortados en dados y cocinamos durante 2 minutos más.',
      'A la hora de consumir (y si nos acordamos, porque a mi se me olvida facilmente 😉) espolvoreamos perejil picado. MARTES: Ensalada de cruditès y shakshuka con arroz cocido',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":654,"protein":37.4,"carbs":43.9,"fat":34.9,"fiber":5.8},
      per100g: {"calories":229,"protein":13.1,"carbs":15.3,"fat":12.2,"fiber":2.1},
    },
  },
  {
    id: 'solomillo-de-cerdo-en-salsa-de-castanas',
    title: 'Solomillo de Cerdo en Salsa de Castañas',
    category: 'Carne',
    summary: 'Solomillo de Cerdo en Salsa de Castañas al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'solomillo de cerdo' },
      { id: '2', baseQuantity: 30, unit: 'gr de', name: 'mantequilla' },
      { id: '3', baseQuantity: 150, unit: '', name: 'castañas' },
      { id: '4', baseQuantity: 300, unit: 'gr de', name: '. de setas' },
      { id: '5', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '6', baseQuantity: 4, unit: 'dientes de', name: 'ajo' },
      { id: '7', baseQuantity: 300, unit: 'ml de', name: 'caldo de carne' },
      { id: '8', baseQuantity: 100, unit: 'ml de', name: 'nata fresca' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '11', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En primer lugar cocemos las castañas. Para ello les hacemos un corte para que no exploten y las tenemos en abundante agua hirviendo con sal durante 25 minutos aproximadamente, a fuego medio.',
      'Pelamos y reservamos Mientras tanto troceamos en medallones el solomillo, los salpimentamos y los doramos en una sartén donde previamente hemos calentado la mantequilla.',
      'Reservamos En esa misma sartén, y una vez reservado el solomillo, incorporamos 1 cucharada de AOVE y doramos 4 dientes de ajo laminados. Antes de que se doren en exceso y nos puedan amargar la receta agregamos 1 cebolla laminada y 300 gr de setas y sofreímos todo junto.',
      'Cuando esté dorado el contenido de la sartén añadimos 250 ml de caldo de carne, 100 ml de nata fresca, 1 cucharadita de tomillo, 1 cucharadita de orégano y sal y pimienta al gusto y dejamos chup chup a fuego medio-bajo durante 8 minutos.',
      'Una vez pasado este tiempo trituramos el sofrito junto con las castañas cocidas y peladas hasta conseguir que todos los ingredientes se mezclen bien y lo volvemos a incorporar a la sartén junto con los medallones del solomillo, damos un hervor conjunto de 2 minutos y listo, ya tenemos esta otoñal experiencia preparada.',
      'Nosotros acompañaremos de arroz cocido',
    ],
    nutrition: {
      totalWeightGrams: 2350,
      perServing: {"calories":634,"protein":34.9,"carbs":34.5,"fat":37.4,"fiber":4.5},
      per100g: {"calories":269,"protein":14.8,"carbs":14.6,"fat":15.8,"fiber":1.9},
    },
  },
  {
    id: 'solomillo-de-pavo-adobado',
    title: 'Solomillo de Pavo Adobado',
    category: 'Carne',
    summary: 'Solomillo de Pavo Adobado al estilo La Vida Bonica.',
    image: 'images/2021_05_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: null, unit: '', name: '600-700 gr de solomillo de pavo' },
      { id: '2', baseQuantity: null, unit: '', name: 'Especias al gusto (esta vez he utilizado pimentón dulce y un poco del picante, ajo y cebolla en polvo, orégano y sal)' },
      { id: '3', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
    ],
    steps: [
      'Es importante tiempo para que la carne absorba bien todas las especias que queramos utilizar.',
      'Por ello es una receta tan socorrida en una sesión de batch cooking, sólo hay que hacerlo al principio de la sesión y dorar la carne al final de la misma, con ello nos aseguramos de que todos los sabores y los aromas están bien presentes.',
      'Al principio podemos untar nuestras manos con un poco de AOVE y masajear bien la carne. Después mezclamos en un bol todas las especias que queramos utilizar y una vez mezcladas las echamos por encima de la carne, restregamos bien para que impregne toda ella, tapamos y a la nevera.',
      'Mínimo 1 hora, si es posible más tiempo. Luego sólo hemos de dorarla con un poco de AOVE en una sartén o plancha antiadherente y ya tenemos un plato preparado que nos salva más de un menú, ¿no os parece? Y arroz cocido que nos sirve para completar cualquier plato 😃 Bueno, y hasta aquí la sesión de esta semana.',
      'Espero que os haya gustado y os dé ideas para vuestras sesiones. Cualquier comentario que me queráis hacer ya sabéis que estoy por aquí y por RRSS como https://www.instagram.com/realbatchcooking/ o https://www.facebook.com/realbatchcooking. ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking improvisada Siguiente Sesión de batch cooking de ensaladas con legumbres (y más cosas, que los míos comen como limas) Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 1050,
      perServing: {"calories":351,"protein":29.5,"carbs":10.5,"fat":20.5,"fiber":2.5},
      per100g: {"calories":334,"protein":28.1,"carbs":10.1,"fat":19.5,"fiber":2.4},
    },
  },
  {
    id: 'sopa-con-pelotas',
    title: 'Sopa con Pelotas',
    category: 'Sopa',
    summary: 'Sopa con Pelotas al estilo La Vida Bonica.',
    image: 'images/2019_05_IMG_20190504_141225_resized_20190505_093153048.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'bacalao' },
      { id: '2', baseQuantity: 1, unit: 'kg de', name: 'tomates' },
      { id: '3', baseQuantity: 3, unit: '', name: 'pimientos italianos' },
      { id: '4', baseQuantity: 150, unit: 'gr de', name: 'olivas negras' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE y sal' },
      { id: '6', baseQuantity: 2, unit: 'dientes de', name: 'ajo sin simiente (para que no indigeste)' },
    ],
    steps: [
      'Asamos en una plancha o sartén antiadherente el bacalao. Mientras se hace metemos los pimentos en el microondas y lo programamos 6 minutos a máxima potencia. Reservamos.',
      'En un mortero picamos los 2 dientes de ajo y añadimos AOVE y sal al gusto para ligarlo todo (yo no he echado más de 2 cucharadas) En un recipiente incorporamos el bacalao desmenuzado, los pimientos y los tomates troceados. Añadimos el majado y adornamos con olivas de cuquillo.',
      'Listo, otra forma rica de comer ensalada.',
    ],
    nutrition: {
      totalWeightGrams: 2150,
      perServing: {"calories":442,"protein":34.8,"carbs":23.9,"fat":24.9,"fiber":4.2},
      per100g: {"calories":205,"protein":16.2,"carbs":11.1,"fat":11.6,"fiber":2},
    },
  },
  {
    id: 'sopa-de-alubias-al-pesto',
    title: 'Sopa de Alubias al Pesto',
    category: 'Sopa',
    summary: 'Sopa de Alubias al Pesto al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-1-1024x1008.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'ramillete de hojas de albahaca fresca' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano' },
      { id: '3', baseQuantity: 1, unit: 'cucharada de', name: 'piñones' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Esta receta la he encontrado navegando por la web y aunque no la he visto con legumbres he preferido incorporarle alubias y de esta manera hacer un plato completo que nos sirva como plato único.',
      'Y lo que me ha animado a hacerla es que lleva pesto, y a mis criaturas les encanta 😊 En una olla de base ancha incorporamos 2 cebollas con 1 cucharada de AOVE y sofreímos a fuego medio bajo durante 2 minutos.',
      'A continuación, agregamos 400 gr de alubias cocidas, 50 gr de arroz, 800 ml de caldo de verduras, 1 cucharadita de tomillo seco y sal y pimienta al gusto y dejamos chup chup durante el tiempo que necesite el arroz para cocinarse (normalmente entre 15 y 20 minutos si usamos arroz blanco normal) Cuando le falten 7 minutos para que termine la cocción añadimos 300 gr de habas tiernas y rectificamos de sal si es necesario.',
      'Con este tiempo de cocción será suficiente para que le haba se cocine.',
      'Mientras que termina la cocción preparamos el pesto: Trituramos 1 ramillete de albahaca fresca, 50 gr de parmesano, 1 cucharada de piñones, AOVE, sal y pimienta al gusto hasta que tenga la consistencia que más nos guste (yo le he añadido unos 50 ml de agua para evitar echarle más aceite).',
      'Incorporamos al guiso y listo, ya tenemos otra rica receta preparada.',
    ],
    nutrition: {
      totalWeightGrams: 550,
      perServing: {"calories":174,"protein":8.5,"carbs":12.4,"fat":10.3,"fiber":2.5},
      per100g: {"calories":316,"protein":15.5,"carbs":22.5,"fat":18.7,"fiber":4.5},
    },
  },
  {
    id: 'sopa-de-alubias-y-coliflor-asada',
    title: 'Sopa de Alubias y Coliflor Asada',
    category: 'Sopa',
    summary: 'Sopa de Alubias y Coliflor Asada al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211211_122934-1000x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 2, unit: '', name: 'zanahorias' },
      { id: '3', baseQuantity: 2, unit: '', name: 'tallos de apio' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '5', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras o agua' },
      { id: '6', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '7', baseQuantity: 400, unit: 'gr de', name: 'alubias blancas cocidas, enjuagadas y escurridas' },
      { id: '8', baseQuantity: 150, unit: 'ml de', name: 'leche de coco' },
      { id: '9', baseQuantity: null, unit: '', name: 'Unos floretes de coliflor asada' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
    ],
    steps: [
      'En primer lugar, vamos a asar una coliflor, utilizaremos algunos floretes para enriquecer esta sopa y el resto lo guardaremos en un recipiente hermético para comer como snack durante la semana.',
      'Para asar la coliflor, y mientras precalentamos el horno a 190º, la lavamos bien y le separamos todos los arbolitos. El tronco lo troceamos en trozos homogéneos, lo disponemos en un bol y añadimos 2 cucharadas de AOVE y mezclamos bien. Ahora es el momento de añadir las especias que más nos apetezcan.',
      'En este caso voy a utilizar comino molido, curry, ajo en polvo y sal. Las cantidades son a ojo, lo importante es que todos los trozos queden bien impregnados. Y a hornear.',
      'Ya sabéis que tenemos que aprovechar el gasto energético y hornear algo más al mismo tiempo, nos va a costar lo mismo y nos va a apañar otro menú, seguro.',
      'Ahora vamos a por la sopa: En una olla agregamos 1 cucharada de AOVE y sofreímos una cebolla, 2 zanahorias y 2 tallos de apio, todo ello previamente picado, y seguimos removiendo para que la verdura se sofría y coja color.',
      'Añadimos 1 cucharadita de orégano seco, 500 ml de caldo de verduras, sal y pimienta al gusto y dejamos chup chup a fuego medio-bajo 5 minutos. Una vez pasado este tiempo agregamos 400 gr de alubias blancas cocidas, 150 ml de leche de coco y dejamos chup chup 5 minutos más.',
      'Ahora podemos triturar la mitad del contenido de la olla y que la sopa coja “más cuerpo” o dejarla así, como más nos guste.',
      'Ya por último añadimos unos cuantos floretes de la coliflor que hemos asado, le damos un hervor conjunto de 1 minuto y listo, ya tenemos una sopa sabrosona con la que calentarnos el cuerpo esta semana.',
    ],
    nutrition: {
      totalWeightGrams: 2350,
      perServing: {"calories":394,"protein":20.9,"carbs":43.8,"fat":17.1,"fiber":7.3},
      per100g: {"calories":168,"protein":8.9,"carbs":18.7,"fat":7.3,"fiber":3.1},
    },
  },
  {
    id: 'sopa-de-alubias-y-kale',
    title: 'Sopa de Alubias y Kale',
    category: 'Sopa',
    summary: 'Sopa de Alubias y Kale al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-2-1024x741.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'alubias cocidas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'setas  (le he puesto champiñón)' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'tomillo seco' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '7', baseQuantity: 50, unit: 'ml de', name: 'leche o bebida vegetal' },
      { id: '8', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras' },
      { id: '9', baseQuantity: 100, unit: 'gr de', name: 'kale' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una olla disponemos 1 cebolla y 1 ajo, todo ello bien picado, con 1 cucharada de AOVE y salteamos a fuego medio durante 2 minutos. A continuación añadimos 250 gr de setas laminadas y dejamos que se doren de forma conjunta y removiendo de vez en cuando.',
      'Incorporamos cuando han pasado 3 minutos 400 gr de alubias cocidas, 1 cucharadita de tomillo seco, 2 cucharadas de salsa de soja, 500 ml de caldo de verduras, 50 ml de leche o bebida vegetal y sal y pimienta al gusto y dejamos chup chup a fuego medio bajo durante 10 minutos.',
      'Cogemos entonces un cucharón del contenido de la olla y lo incorporamos en el vaso de un procesador de alimentos, trituramos bien y volvemos a echar a la olla. De esta manera conseguimos un caldo mucho más espeso.',
      'Incorporamos también 100 gr de hojas de kale, dejamos chup chup 10 minutos más y listo, otro sencillo guiso para la semana preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2000,
      perServing: {"calories":321,"protein":19.2,"carbs":34.5,"fat":12.9,"fiber":6.3},
      per100g: {"calories":161,"protein":9.6,"carbs":17.2,"fat":6.4,"fiber":3.1},
    },
  },
  {
    id: 'sopa-de-arroz-con-pollo',
    title: 'Sopa de Arroz con Pollo',
    category: 'Sopa',
    summary: 'Sopa de Arroz con Pollo al estilo La Vida Bonica.',
    image: 'images/2022_05_IMG_20220508_200645-1024x803.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'pechuga de pollo' },
      { id: '2', baseQuantity: 200, unit: 'gr de', name: 'arroz' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento asado' },
      { id: '4', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '5', baseQuantity: 2, unit: '', name: 'tomates' },
      { id: '6', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '7', baseQuantity: 1, unit: 'litro de', name: 'caldo de carne' },
      { id: '8', baseQuantity: null, unit: '', name: 'Azafrán' },
      { id: '9', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '10', baseQuantity: 4, unit: '', name: 'huevos cocidos' },
    ],
    steps: [
      'En una olla de base ancha agregamos 1 cebolla y 2 tomates previamente pelados y picados. Sofreímos con 1 cucharada de AOVE durante 2 minutos a fuego medio. A continuación incorporamos 1 pechuga de pollo troceada en dados de 1 centímetro y salteamos de forma conjunta.',
      'Una vez que la carne está sellada añadimos 1 litro de caldo de carne y cuando comience a hervir agregamos 200 gr de arroz, 2 dientes de ajo picados, 1 pimiento asado y cortado a tiras, 6 pelos de azafrán y sal y pimienta al gusto y chup chup de 12 a 15 minutos, lo necesario para que el arroz se haga.',
      'Ya tenemos una rica sopa preparada. A la hora de comer acompañaremos de huevo cocido. Como siempre, aprovechamos para cocer arroz y huevos y tenerlos listos para consumir al momento. Y hasta aquí la sesión de hoy, espero que os dé ideas para la confección de vuestros menús. ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking de vuelta a la normalidad Siguiente Sesión de batch cooking en plena ola de calor Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 2800,
      perServing: {"calories":544,"protein":35.6,"carbs":54.1,"fat":20.5,"fiber":2.5},
      per100g: {"calories":193,"protein":12.6,"carbs":19.2,"fat":7.3,"fiber":0.9},
    },
  },
  {
    id: 'sopa-de-calabaza-asada-y-queso-cheddar',
    title: 'Sopa de Calabaza Asada y Queso Cheddar',
    category: 'Sopa',
    summary: 'Sopa de Calabaza Asada y Queso Cheddar al estilo La Vida Bonica.',
    image: 'images/2021_12_IMG_20211211_122934-1000x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 2, unit: 'dientes de', name: 'ajo' },
      { id: '3', baseQuantity: 2, unit: 'rodajas de', name: 'gruesas de calabaza asada (unos 300 gr)' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias ralladas' },
      { id: '5', baseQuantity: 400, unit: 'gr de', name: 'lentejas cocidas' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
      { id: '7', baseQuantity: 500, unit: 'ml de', name: 'caldo de verdura' },
      { id: '8', baseQuantity: 200, unit: 'ml de', name: 'leche animal o vegetal' },
      { id: '9', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '10', baseQuantity: 50, unit: 'gr de', name: 'queso Cheddar rallado' },
      { id: '11', baseQuantity: null, unit: '', name: 'Rebanada de pan integral tostado (opcional)' },
    ],
    steps: [
      'Lo primero que vamos a hacer es cortar 2 gruesas rebanadas de calabaza (apx unos 300 gr) y hornearla a 190º durante 40 minutos. En esta sesión vamos a utilizar el horno para asar coliflor, pimientas y cebolletas así que lo haremos a la vez, ahorrando así tiempo y dinero.',
      'Reservamos A continuación, sofreímos en una olla con 1 cucharada de AOVE 1 cebolla y 2 dientes de ajo previamente picados. Lo tenemos a fuego medio-bajo durante 5 minutos.',
      'Subimos el fuego para seguir añadiendo ingredientes: 400 gr de letnejas cocidas, 500 ml de caldo de verdura, 1 cucharadita colmada de pimentón, 200 ml de leche animal o vegetal donde hemos triturado previamente la pulpa de la calabaza asada y sal y pimienta al gusto.',
      'Cuando rompa a hervir (cuidado que cuando el caldo es espeso burbujea en exceso) añadimos 2 zanahorias ralladas y 50 gr de queso Cheddar también rallado, bajamos el fuego, tapamos y dejamos chup chup 2 ó 3 minutos.',
      'A la hora de comer podemos acompañar esta rica sopa de una rebanada de pan tostado con un poco de mantequilla, ya veréis qué reconfortante y saciante es esta sopa.',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":451,"protein":22.1,"carbs":46.9,"fat":23.4,"fiber":6.9},
      per100g: {"calories":178,"protein":8.7,"carbs":18.5,"fat":9.2,"fiber":2.7},
    },
  },
  {
    id: 'sopa-de-calabaza-y-zanahoria',
    title: 'Sopa de Calabaza y Zanahoria',
    category: 'Sopa',
    summary: 'Sopa de Calabaza y Zanahoria al estilo La Vida Bonica.',
    image: 'images/2020_11_Polish_20201115_195603593_resized_20201115_080313623.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'calabaza asada' },
      { id: '2', baseQuantity: 2, unit: '', name: 'tallos de apio' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '4', baseQuantity: 3, unit: '', name: 'zanahorias' },
      { id: '5', baseQuantity: 200, unit: 'ml de', name: 'bebida vegetal' },
      { id: '6', baseQuantity: 300, unit: 'ml de', name: 'caldo de verduras' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'queso' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'romero' },
      { id: '10', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'La semana pasada preparé una sopa con calabaza asada que nos encantó, así que esta semana repetimos ingrediente principal y cambiamos los demás, a ver cuál nos gusta más. En primer lugar asamos 400 gr de calabaza durante 30 minutos a 190º.',
      'Y como os digo siempre, aprovechamos la energía que estamos consumiendo para meter algo más en el horno y que se haga al mismo tiempo (en mi caso + lasaña y pollo con tomates cherry) Mientras la calabaza se está asando podemos sofreír la cebolla y los tallos de apio en una olla con una cucharada de AOVE.',
      'Lo tendremos a fuego medio-alto durante 2 minutos y medio-bajo 5 minutos más.',
      'Reservamos Una vez que la calabaza está asada la incorporamos a la olla junto con 200 ml de bebida vegetal, 300 ml de caldo de verduras, 1 cucharadita de ajo en polvo, 1 cucharadita de romero seco y sal y pimienta al gusto, y dejamos chup chup a fuego bajo durante 5 minutos más.',
      'Una vez pasado este tiempo trituramos muy bien el contenido de la olla (podemos meter en ella el brazo de la batidora, aunque siempre con mucho cuidado no nos vaya a salpicar y nos podamos quemar), y una vez bien triturado incorporamos 3 zanahorias ralladas, dejamos chup chup a fuego medio-bajo durante 3 minutos, tras los cuales añadimos 100 gr de queso previamente rallado y apagamos el fuego, dejamos que se derrita con el calor residual de la olla.',
      'Ya está, el crunchy de la zanahoria rallada le da un toque muy original y el queso rallado le da saborazo. Esta vez he utilizado parmesano, pero puedes utilizar el que tengas por casa o el que más se os antoje.',
    ],
    nutrition: {
      totalWeightGrams: 2100,
      perServing: {"calories":246,"protein":6.3,"carbs":37.4,"fat":10.3,"fiber":5.5},
      per100g: {"calories":123,"protein":3.1,"carbs":18.6,"fat":5.1,"fiber":2.7},
    },
  },
  {
    id: 'sopa-de-lentejas-con-leche-de-coco',
    title: 'Sopa de Lentejas con Leche de Coco',
    category: 'Sopa',
    summary: 'Sopa de Lentejas con Leche de Coco al estilo La Vida Bonica.',
    image: 'images/2019_08_IMG_20190826_190620-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'muslos de pavo' },
      { id: '2', baseQuantity: 4, unit: '', name: 'patatas medianas' },
      { id: '3', baseQuantity: null, unit: '', name: 'Especias cajún' },
      { id: '4', baseQuantity: 2, unit: '', name: 'bolsas de asar' },
    ],
    steps: [
      'Este asado está espectacularmente rico y no nos va a llevar más de 5 minutos prepararlo, porque el horno hará el resto.',
      'En primer lugar precalentamos el horno a 190º Mientras que el horno va cogiendo temperatura cogemos un vaso largo y echamos la mezcla cajún de especias, 2 cucharadas de AOVE y unos 100 ml de agua. Removemos bien. En una bolsa de asar introducimos el muslo y en la otra las patatas.',
      'Es el momento de echar el líquido que hemos preparado en cada una de ellas. Yo siempre echo un poco más en la bolsa de las patatas que en la de la carne, por el hecho de que ésta suelta jugo y requiere de menos líquido para su asado, pero vamos, cosas mías, haced mitad y mitad si queréis.',
      'Cerramos las bolsas, las agitamos más o menos para que todos los ingredientes queden impregnados de la mezcla y al horno 45 minutos a 190 grados. JUEVES: Ensalada y sopa de lentejas con leche de coco',
    ],
    nutrition: {
      totalWeightGrams: 2500,
      perServing: {"calories":632,"protein":37.4,"carbs":54.2,"fat":34.9,"fiber":8.1},
      per100g: {"calories":252,"protein":14.9,"carbs":21.6,"fat":13.9,"fiber":3.2},
    },
  },
  {
    id: 'sopa-de-verduras-con-pollo-adobado',
    title: 'Sopa de Verduras con Pollo Adobado',
    category: 'Sopa',
    summary: 'Sopa de Verduras con Pollo Adobado al estilo La Vida Bonica.',
    image: 'images/2022_01_RBC-2-1024x741.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'zanahorias' },
      { id: '2', baseQuantity: 2, unit: '', name: 'trozos de apio' },
      { id: '3', baseQuantity: 2, unit: '', name: 'patatas grandes' },
      { id: '4', baseQuantity: 300, unit: 'gr de', name: 'judías verdes' },
      { id: '5', baseQuantity: null, unit: '', name: 'Morcillo y carne de pollo' },
      { id: '6', baseQuantity: 2, unit: '', name: 'ajos enteros pelados' },
      { id: '7', baseQuantity: null, unit: '', name: 'El zumo de un limón' },
      { id: '8', baseQuantity: 1, unit: '', name: 'tomate rallado' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
      { id: '10', baseQuantity: 400, unit: 'gr de', name: 'garbanzos cocidos' },
      { id: '11', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentón' },
    ],
    steps: [
      'Esta receta es de lo más socorrida para aquellas sesiones de batch cooking exprés en las que tenemos poco tiempo, y ello es porque es muy rápida de hacer y tenemos comida resuelta para dos días.',
      'Es tan sencillo como incorporar todos los ingredientes en una olla rápida: 4 zanahorias grandes, 2 trozos de apio, 2 ó 3 patatas grandes, 300 gr de judías verdes, carne como morcillo, pollo, huesos para que le dé sabor (en hipermercados ya venden bandejas especiales para este guiso y si no preguntamos al carnicero), 2 ajos enteros pelados, el zumo de un limón, 1 tomate rallado, 400 gr garbanzos, 1 cucharadita de pimentón y sal y pimienta al gusto.',
      'A continuación ponemos agua hasta que cubra, cerramos la olla y ponemos a fuego fuerte. Una vez que rompa a hervir bajamos el fuego medio y tenemos chup chup 20 minutos. Y ya lo tenemos.',
      'A mi me gusta, una vez atemperado, separar los diferentes ingredientes para que el emplatado sea más rápido: Desmenuzo la carne y dispongo aparte de las patatas, garbanzos y verdura. Así en el momento de consumir todo es más rápido.',
    ],
    nutrition: {
      totalWeightGrams: 3400,
      perServing: {"calories":444,"protein":30.8,"carbs":37.2,"fat":20.5,"fiber":6.3},
      per100g: {"calories":147,"protein":10.2,"carbs":12.3,"fat":6.8,"fiber":2.1},
    },
  },
  {
    id: 'sopa-serrana',
    title: 'Sopa Serrana',
    category: 'Sopa',
    summary: 'Sopa Serrana al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201129_173206_resized_20201129_053240299.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'pechugas enteras de pollo' },
      { id: '2', baseQuantity: 3, unit: '', name: 'patatas grandes' },
      { id: '3', baseQuantity: 250, unit: 'gr de', name: 'champiñones enteros' },
      { id: '4', baseQuantity: 2, unit: '', name: 'zanahorias grandes' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'tomates secos' },
      { id: '6', baseQuantity: 40, unit: 'gr de', name: 'nueces peladas' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'romero seco' },
      { id: '9', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Me encanta utilizar el horno en las sesiones de batch cooking, podemos cocinar varias cosas a la vez casi sin darnos cuenta, y mientras tanto seguimos cocinando otras recetas con el fuego o placa.',
      'En esta receta para empezar precalentamos el horno a 190º y mientras alcanza la temperatura disponemos 3 pechugas enteras en una bandeja de horno. Lavamos y pelamos 3 patatas y 1 zanahoria grande, las cortamos en trozos más o menos del mismo tamaño y las añadimos a la bandeja.',
      'A los champiñones les quitamos la tierra que puedan llevar, los cortamos en cuartos y a la bandeja. Salpimentamos.',
      'Ahora vamos a hacer la salsa que le va a dar un saborazo y una melosidad súper: En el vaso de un procesador de alimentos incorporamos 1 zanahoria pelada y troceada, 50 gr de tomates secos, 40 gr de nueces peladas, 2 cucharadas de salsa de soja, 1 cucharadita de romero seco, 2 cucharadas de AOVE, 250 gr de agua y sal y pimienta al gusto y trituramos hasta que los ingredientes se integren, aunque no hace falta dejarlo muy bien batido, si queda con algún trocito no pasa nada.',
      'Lo echamos por encima de la carne, las patatas y la verdura, lo mezclamos bien para que todo quede bien impregnado y horneamos a 190º durante 50 minutos. Cuando termine podemos cortar en trozos grandes la pechuga, pero no antes de cocinarse para que no se reseque.',
      'Y listo, recetaza preparada sin apenas faena, las que más me gustan 😀',
    ],
    nutrition: {
      totalWeightGrams: 3200,
      perServing: {"calories":540,"protein":43.9,"carbs":24.9,"fat":30.8,"fiber":4.9},
      per100g: {"calories":212,"protein":17.2,"carbs":9.8,"fat":12.1,"fiber":1.9},
    },
  },
  {
    id: 'souffle-de-berenjena',
    title: 'Soufflé de Berenjena',
    category: 'Verdura',
    summary: 'Soufflé de Berenjena al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200426_151045-1024x548.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento verde' },
      { id: '4', baseQuantity: 1, unit: 'diente de', name: 'ajo' },
      { id: '5', baseQuantity: 4, unit: '', name: 'lomos de bacalao (yo los uso ya desalados)' },
      { id: '6', baseQuantity: 200, unit: 'ml de', name: 'caldo de pescado' },
      { id: '7', baseQuantity: 2, unit: 'cucharadas de', name: 'rasas de harina' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '9', baseQuantity: 200, unit: 'gr de', name: 'quinoa' },
    ],
    steps: [
      'Picamos la cebolla, el diente de ajo y los dos pimientos y sofreímos en una sartén de base ancha con 1 cucharada de AOVE durante 15 minutos. Si vemos que le hace falta más líquido podemos añadir más aceite o bien un poco de agua.',
      'Salpimentamos al gusto Una vez que la verdura ya está hecha la introducimos en el vaso de una batidora junto con 200 ml de agua o caldo de pescado y trituramos bien hasta que se nos quede con consistencia de crema. Reservamos.',
      'En la misma sartén donde hemos pochado la verdura vamos a dorar ahora el pescado.',
      'Para ello introducimos en una bolsa un par de cucharadas rasas de harina integral y enharinamos cada lomo de bacalao de forma individual, introduciéndolo en la bolsa, la cual cerramos y agitamos bien para que se impregne todo el lomo.',
      'Una vez enharinados los marcamos en la sartén donde previamente hemos calentado 1 cucharada de AOVE. Los marcamos 2 minutos por cada lado y añadimos la crema de verduras que teníamos reservada, dejamos chup chup a fuego medio durante 2 minutos más y listo.',
      'Nosotros acompañaremos de quinoa cocida MIÉRCOLES: Alcachofas con carne y soufflé de berenjena',
    ],
    nutrition: {
      totalWeightGrams: 2200,
      perServing: {"calories":421,"protein":32.9,"carbs":23.1,"fat":23.9,"fiber":4.5},
      per100g: {"calories":191,"protein":14.9,"carbs":10.5,"fat":10.9,"fiber":2},
    },
  },
  {
    id: 'tarta-de-boniato-y-coco',
    title: 'Tarta de Boniato y Coco',
    category: 'Postres',
    summary: 'Tarta de Boniato y Coco al estilo La Vida Bonica.',
    image: 'images/2020_11_IMG_20201129_173206_resized_20201129_053240299.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'boniato mediano' },
      { id: '2', baseQuantity: 125, unit: 'gr de', name: 'chocolate más del 70% cacao' },
      { id: '3', baseQuantity: 200, unit: 'ml de', name: 'nata fresca' },
      { id: '4', baseQuantity: 1, unit: 'cucharada de', name: 'canela' },
    ],
    steps: [
      'En primer lugar hidratamos los dátiles en agua muy caliente. Mientras se hidratan: Tostamos 100 gr de almendras en el horno a 160º durante 8 minutos. Ponemos a cocer el boniato en el microondas: Para ello lo envolvemos en film transparente apto para cocer y programamos 14 minutos a máxima potencia.',
      'Reservamos Una vez tostadas las almendras las trituramos bien junto con 15 ml de aceite de coco, 100 gr de coco rallado y los 4 dátiles que tenemos ya hidratados. El resultado será la base para la tarta.',
      'Lo aplanamos bien en un molde (yo he utilizado uno rectangular de paredes altas) y metemos en la nevera mientras seguimos con el proceso. Vamos ahora a hacer el relleno.',
      'Para ello ponemos en un cazo 200 ml de nata fresca y llevamos al punto de ebullición (con cuidado de que no se agarre al fondo del cazo).',
      'En ese momento lo apartamos del fuego y volcamos la nata sobre 125 gr de chocolate de más del 70% de cacao previamente troceado y vamos moviendo cuidadosamente hasta que veamos que el chocolate funde gracias al calor de la nata y ambos ingredientes quedan integrados.',
      'Y una vez que lo tenemos sólo hemos de incorporar el boniato cocido en el microondas (así nos aseguramos que no tiene agua, también lo podemos hacer en el horno, pero tardaremos más), que previamente hemos chafado con un tenedor, 1 cucharada de canela, removemos bien y agregamos al molde que teníamos en la nevera, encima de la base.',
      'Ya sólo nos queda esperar unas horas para que refrigere y listo, tenemos un snack preparado, espero que os guste. De acompañamiento esta semana tendremos patatas cocidas y huevos.',
      'Bueno, y hasta aquí la sesión de hoy, volvemos a tener la cocina llena de buenas opciones, nos encanta saber que los menús están preparados y que podemos utilizar nuestras tardes en diferentes rutinas. Espero que saquéis ideas para vuestros menús. Os espero la semana que viene. ¡Feliz semana!',
      'Navegación de entradas Anterior Sesión de batch cooking de sábado por la tarde Siguiente Sesión de batch cooking exprés en el puente de la Constitución Deja un comentario Cancelar respuesta Tu dirección de correo electrónico no será publicada.',
      'Los campos obligatorios están marcados con * Escribe aquí...Nombre* Correo electrónico* Copyright &copy; 2026 La Vida Bonica Scroll al inicio',
    ],
    nutrition: {
      totalWeightGrams: 925,
      perServing: {"calories":394,"protein":4.8,"carbs":43.9,"fat":23.1,"fiber":4.9},
      per100g: {"calories":425,"protein":5.2,"carbs":47.4,"fat":25.1,"fiber":5.3},
    },
  },
  {
    id: 'tarta-de-patata-cebolla-y-queso',
    title: 'Tarta de Patata, Cebolla y Queso',
    category: 'Postres',
    summary: 'Tarta de Patata, Cebolla y Queso al estilo La Vida Bonica.',
    image: 'images/2020_10_rbc.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'patatas peladas' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'acelgas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '4', baseQuantity: 4, unit: '', name: 'huevos grandes' },
      { id: '5', baseQuantity: 250, unit: 'gr de', name: 'queso fresco batido desnatado' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'queso Gorgonzola' },
      { id: '7', baseQuantity: null, unit: '', name: 'Ralladura de un limón' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar pelamos las patatas, las rallamos y las extendemos sobre una bandeja apta para horno, aderezamos con unas gotas de AOVE, sal y pimienta al gusto. Horneamos a 180º durante 15-20 minutos.',
      'Reservamos A continuación limpiamos y troceamos las acelgas y las cebolletas y sofreímos en una sartén con una cucharada de AOVE y fuego medio-alto, durante 5 minutos. Reservamos.',
      'En un bol mezclamos 4 huevos, 250 gr de queso fresco batido desnatado, 50 gr de queso Gorgonzola y la ralladura de un limón. Incorporamos las acelgas y las cebolletas sofritas y rectificamos de sal y pimienta.',
      'Volcamos esta mezcla en la bandeja donde ya habíamos puesto la patata rallada, que actuará de base y horneamos a 180º durante 30 minutos o hasta que veamos que está cuajado.',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":544,"protein":24.5,"carbs":43.9,"fat":32.1,"fiber":4.9},
      per100g: {"calories":191,"protein":8.6,"carbs":15.4,"fat":11.3,"fiber":1.7},
    },
  },
  {
    id: 'tartaletas-de-patata-con-carne-especiada',
    title: 'Tartaletas de Patata con Carne Especiada',
    category: 'Postres',
    summary: 'Tartaletas de Patata con Carne Especiada al estilo La Vida Bonica.',
    image: 'images/2020_10_RBC-3.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 4, unit: '', name: 'huevos' },
      { id: '3', baseQuantity: 4, unit: 'cucharadas de', name: 'salsa de tomate' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso parmesano' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '7', baseQuantity: 200, unit: 'gr de', name: 'carne picada' },
      { id: '8', baseQuantity: 100, unit: 'gr de', name: 'calabaza' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'ras al hanut' },
      { id: '10', baseQuantity: null, unit: '', name: 'Jengibre' },
      { id: '11', baseQuantity: null, unit: '', name: 'Canela' },
      { id: '12', baseQuantity: null, unit: '', name: 'Cúrcuma' },
      { id: '13', baseQuantity: 50, unit: 'ml de', name: 'caldo de pollo' },
    ],
    steps: [
      'En primer lugar cocemos 4 patatas con la piel para que no absorban mucha agua y tampoco pierdan propiedades. Podemos aprovechar para cocer más patatas y tener así un acompañamiento preparado para otro día. Reservamos para que atemperen y las podamos pelar.',
      'Mientras las patatas van bajando su temperatura podemos ir preparando el relleno.',
      'Para ello sofreímos con 1 cucharada de AOVE 200 gr de carne picada, 100 gr de calabaza bien picada, 1 cucharadita de ras al hanut, ½ cucharadita de jengibre seco, ½ cucharadita de canela y 1 cucharadita de cúrcuma,salpimentamos y dejamos que se haga a fuego medio durante 5 minutos.',
      'Le podemos añadir 50 ml de caldo de pollo para darle melosidad. Una vez enfriadas y peladas las patatas las chafamos y mezclamos con 1 huevo y 3 yemas de huevo, 1 cucharada de albahaca seca, 50 gr de queso parmesano y 4 cucharadas de salsa de tomate.',
      'Y ésta será la masa de nuestras tartaletas Nos queda engrasar moldes individuales,poner una base de patata, en medio el relleno y cubrir con más patata.',
      'Horneamos a 190° durante 20 minutos y ya tenemos nuestras pataletas listas para hincarles el diente 😋 Como han sobrado 3 claras y parte del relleno lo he mezclado todo y tenemos otro rico plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2450,
      perServing: {"calories":523,"protein":26.8,"carbs":36.2,"fat":29.5,"fiber":4.3},
      per100g: {"calories":233,"protein":12,"carbs":16.2,"fat":13.2,"fiber":1.9},
    },
  },
  {
    id: 'tartar-de-patata-cebolla-y-gorgonzola',
    title: 'Tartar de Patata, Cebolla y Gorgonzola',
    category: 'Postres',
    summary: 'Tartar de Patata, Cebolla y Gorgonzola al estilo La Vida Bonica.',
    image: 'images/2021_10_RBC-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'patatas peladas' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'acelgas' },
      { id: '3', baseQuantity: 2, unit: '', name: 'cebolletas' },
      { id: '4', baseQuantity: 4, unit: '', name: 'huevos grandes' },
      { id: '5', baseQuantity: 250, unit: 'gr de', name: 'queso fresco batido desnatado' },
      { id: '6', baseQuantity: 50, unit: 'gr de', name: 'queso Gorgonzola' },
      { id: '7', baseQuantity: null, unit: '', name: 'Ralladura de un limón' },
      { id: '8', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar pelamos las patatas, las rallamos y las extendemos sobre una bandeja apta para horno, aderezamos con unas gotas de AOVE, sal y pimienta al gusto. Horneamos a 180º durante 15-20 minutos.',
      'Reservamos A continuación limpiamos y troceamos las acelgas y las cebolletas y sofreímos en una sartén con una cucharada de AOVE y fuego medio-alto, durante 5 minutos. Reservamos.',
      'En un bol mezclamos 4 huevos, 250 gr de queso fresco batido desnatado, 50 gr de queso Gorgonzola y la ralladura de un limón. Incorporamos las acelgas y las cebolletas sofritas y rectificamos de sal y pimienta.',
      'Volcamos esta mezcla en la bandeja donde ya habíamos puesto la patata rallada, que actuará de base y horneamos a 180º durante 30 minutos o hasta que veamos que está cuajado.',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":544,"protein":24.5,"carbs":43.9,"fat":32.1,"fiber":4.9},
      per100g: {"calories":191,"protein":8.6,"carbs":15.4,"fat":11.3,"fiber":1.7},
    },
  },
  {
    id: 'ternera-al-horno-con-boniato',
    title: 'Ternera al Horno con Boniato',
    category: 'Carne',
    summary: 'Ternera al Horno con Boniato al estilo La Vida Bonica.',
    image: 'images/2021_11_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 100, unit: 'gr de', name: 'quinoa' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'pechuga de pollo' },
      { id: '3', baseQuantity: 150, unit: 'ml de', name: 'leche de coco' },
      { id: '4', baseQuantity: 250, unit: 'ml de', name: 'caldo de carne' },
      { id: '5', baseQuantity: 200, unit: 'gr de', name: 'champiñones' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Precalentamos el horno a 200º Mientras alcanza temperatura doramos 500 gr de pechuga de pollo cortada en dados grandes en una sartén con 1 cucharada de AOVE. Lo hacemos a fuego fuerte para que se sellen bien los jugos de la carne, removiendo de forma frecuente y el tiempo justo.',
      'A continuación, incorporamos esta carne en un recipiente apto para horno y añadimos el resto de ingredientes: 100 gr de quinoa previamente lavada, 150 ml de leche de coco, 250 ml de caldo de carne, 200 gr de champiñones laminados, 1 cucharadita de orégano y sal y pimienta al gusto.',
      'Lo tapamos con papel de aluminio o vegetal, metemos al horno y dejamos hacer durante 60 minutos, 30 minutos tapado con papel vegetal o aluminio y 30 minutos sin tapar. Listo, plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 2100,
      perServing: {"calories":462,"protein":37.4,"carbs":23.9,"fat":24.5,"fiber":4.1},
      per100g: {"calories":220,"protein":17.8,"carbs":11.4,"fat":11.7,"fiber":2},
    },
  },
  {
    id: 'torta-de-calabacin',
    title: 'Torta de Calabacín',
    category: 'Verdura',
    summary: 'Torta de Calabacín al estilo La Vida Bonica.',
    image: 'images/2020_04_IMG_20200419_181113-1024x580.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 500, unit: 'gr de', name: 'espinacas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla (yo la he puesto morada)' },
      { id: '3', baseQuantity: 600, unit: 'ml de', name: 'caldo de ave' },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'harina integral' },
      { id: '5', baseQuantity: 2, unit: 'cucharadas de', name: 'mantequilla' },
      { id: '6', baseQuantity: 2, unit: 'cucharadas de', name: 'nata fresca' },
      { id: '7', baseQuantity: 100, unit: 'gr de', name: 'salmón ahumado' },
      { id: '8', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '9', baseQuantity: null, unit: '', name: 'Sal, pimienta y nuez moscada' },
    ],
    steps: [
      'Cocemos 2 huevos en abundante agua durante 10 minutos (podemos cocer más y tener para las ensaladas de la semana) Reservamos Mientras tanto en una olla de base ancha y a fuego medio incorporamos 2 cucharadas de mantequilla y sofreímos con ella 1 cebolla previamente picada hasta que quede transparente.',
      'En ese momento incorporamos 2 cucharadas de harina integral y removemos durante 1 minuto, hasta que veamos que la harina va quedando ligeramente dorada. En ese momento añadimos 600 ml de caldo y cuando rompa a hervir agregamos 500 gr de espinacas picadas.',
      'Dejamos chup chup durante 5 minutos y añadimos 2 cucharadas de nata fresca, ½ cucharadita de nuez moscada y sal y pimienta al gusto. Removemos bien, dejamos 2 minutos más y listo, A la hora de comer añadimos los huevos cocidos y el salmón ahumado.',
    ],
    nutrition: {
      totalWeightGrams: 2850,
      perServing: {"calories":444,"protein":29.8,"carbs":29.2,"fat":24.1,"fiber":3.9},
      per100g: {"calories":196,"protein":13.2,"carbs":12.9,"fat":10.7,"fiber":1.7},
    },
  },
  {
    id: 'tortilla-de-alcahofas-y-cebolla',
    title: 'Tortilla de Alcahofas y Cebolla',
    category: 'Entrantes',
    summary: 'Tortilla de Alcahofas y Cebolla al estilo La Vida Bonica.',
    image: 'images/2022_01_collage-777x1024.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 500, unit: 'gr de', name: 'alcachofas (yo he utilizado 2 botes en conserva)' },
      { id: '3', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'queso rallado' },
      { id: '5', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano seco' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'En una olla con agua hirviendo y sal cocemos 500 de alcachofas durante 15 minutos. Reservamos y cuando estén atemperadas picamos. A continuación, pelamos la cebolla, la picamos y la ponemos en una sartén con una cucharada de AOVE para que se vaya sofriendo, removiendo de vez en cuando.',
      'Los tendremos unos 3 minutos. Incorporamos entonces las alcachofas picadas y lo tenemos todo otros 2 ó 3 minutos a fuego medio removiendo de vez en cuando para que no se nos pegue al fondo.',
      'Ya sólo nos queda batir 6 huevos con un poco de sal y pimienta en un recipiente amplio, incorporar 50 gr de queso rallado, 1 cucharadita de orégano seco y la verdura sofrita y cuajar la tortilla en la sartén. ¡Listo! No me digáis que no tiene pintaza.',
    ],
    nutrition: {
      totalWeightGrams: 1750,
      perServing: {"calories":321,"protein":19.2,"carbs":23.1,"fat":17.3,"fiber":4.3},
      per100g: {"calories":184,"protein":11,"carbs":13.3,"fat":9.9,"fiber":2.5},
    },
  },
  {
    id: 'tortilla-de-bacalao-patatas-y-pimientos-asados',
    title: 'Tortilla de Bacalao, Patatas y Pimientos Asados',
    category: 'Pescado',
    summary: 'Tortilla de Bacalao, Patatas y Pimientos Asados al estilo La Vida Bonica.',
    image: 'images/2021_05_RBC.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'pimiento rojo grande' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'bacalao fresco' },
      { id: '4', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE)' },
      { id: '6', baseQuantity: 1, unit: 'cucharadita de', name: 'orégano' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '8', baseQuantity: null, unit: '', name: 'Sal y pimienta' },
    ],
    steps: [
      'La idea era hacer escalivada en el horno y asar un pimiento más para utilizar en esta receta, pero como el horno no ha querido funcionar he optado por asarlo en el microondas a máxima potencia durante 10 minutos, con unas gotas de agua y tapado.',
      'Reservamos Las patatas las suelo hacer en el microondas, por el ahorro de aceite sobre todo. Bien lavadas y cortadas en rodajas más bien finas, con una cucharada de AOVE, una cucharada de agua y sal y pimienta al gusto. Las programo 12-14 minutos a máxima potencia y listo.',
      'Mientras tenemos las patatas cocinándose ponemos una cucharada de AOVE en la sartén donde vamos a hacer la tortilla y con el fuego medio salteamos el bacalao durante uno o dos minutos. Reservamos.',
      'Batimos 6 huevos, añadimos 1 cucharadita de orégano, 1 cucharadita de ajo en polvo, sal y pimienta al gusto, el bacalao salteado, el pimiento asado previamente picado y las patatas ya cocinadas, y mezclamos bien todos los ingredientes. Ya sólo nos queda cuajar la tortilla.',
      'Para ello calentamos un poco de AOVE en esa misma sartén que hemos utilizado para saltear el bacalao, y cuando esté caliente volcamos la mezcla. Yo suelo tener el fuego alto al principio, pero no más de 30 segundos, enseguida le bajo el fuego a media temperatura para que no se queme.',
      'Y enseguida le damos la vuelta para que se termine de cuajar, Es importante que no se haga mucho porque da gusto que se quede jugosa, y el bacalao seco no es muy apetecible al paladar. Lo he ido poniendo todo por capas y en la foto no se aprecian todos los ingredientes',
    ],
    nutrition: {
      totalWeightGrams: 2350,
      perServing: {"calories":394,"protein":29.5,"carbs":24.9,"fat":20.5,"fiber":4.1},
      per100g: {"calories":168,"protein":12.6,"carbs":10.7,"fat":8.8,"fiber":1.8},
    },
  },
  {
    id: 'tortilla-de-berenjena-y-queso',
    title: 'Tortilla de Berenjena y Queso',
    category: 'Entrantes',
    summary: 'Tortilla de Berenjena y Queso al estilo La Vida Bonica.',
    image: 'images/2022_04_IMG_20220423_130751-1024x976.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'berenjenas' },
      { id: '2', baseQuantity: 1, unit: 'cucharadita de', name: 'comino molido' },
      { id: '3', baseQuantity: 6, unit: '', name: 'huevos' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'tahini' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Pelamos y troceamos 2 berenjenas en dados de 2 centímetros aproximadamente y reservamos en un bol con agua fría y sal durante 10 minutos. De esta forma nos aseguramos de quitarles el posible amargor que tengan.',
      'Cuando han pasado 10 minutos escurrimos las berenjenas y las cocinamos en el microondas a máxima potencia durante 5 minutos.',
      'A continuación incorporamos 1 cucharada de AOVE en la sartén que vamos a utilizar para hacer la tortilla y salteamos las berenjenas con 1 cucharadita de comino molido y sal y pimienta al gusto durante unos 3 ó 4 minutos.',
      'De esta manera van a coger un color dorado y una textura menos blanda que si las dejamos sólo con la cocción al microondas. Mientras las berenjenas están en la sartén batimos 6 huevos.',
      'Añadimos 1 cucharadita de tahini y mezclamos bien hasta que quede bien integrado, así como 50 gr de queso previamente rallado y sal y pimienta al gusto. Ya sólo nos queda hacer la tortilla.',
      'Personalmente prefiero incorporar la berenjena en la mezcla de huevo y queso, remover bien, pasarle un papel de cocina a la sartén aún caliente (mucho cuidado) por si hubiese algún trocito de berenjena pegada al fondo, echar 1 cucharada de AOVE y entonces cuajar la tortilla.',
      'Así nos aseguramos de que quede más uniforme. A un recipiente hermético y a consumir en las siguientes 24-48 horas.',
    ],
    nutrition: {
      totalWeightGrams: 1850,
      perServing: {"calories":276,"protein":15.6,"carbs":20.3,"fat":15.1,"fiber":4.1},
      per100g: {"calories":149,"protein":8.4,"carbs":10.9,"fat":8.1,"fiber":2.2},
    },
  },
  {
    id: 'tortilla-de-guisantes-y-gambas',
    title: 'Tortilla de Guisantes y Gambas',
    category: 'Pescado',
    summary: 'Tortilla de Guisantes y Gambas al estilo La Vida Bonica.',
    image: 'images/2020_10_RBC-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 8, unit: '', name: 'huevos' },
      { id: '2', baseQuantity: 300, unit: 'gr de', name: 'guisantes tiernos (yo los uso congelados)' },
      { id: '3', baseQuantity: 300, unit: 'gr de', name: 'gambas peladas' },
      { id: '4', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '5', baseQuantity: 0.5, unit: 'cucharadita de', name: 'cúrcuma' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Ponemos una sartén al fuego con 1 cucharadita de AOVE y salteamos las gambas hasta que se doren.',
      'Reservamos A continuación y en esa misma sartén agregamos 1 cucharadita de AOVE, 300 gr de guisantes tiernos, 1 cucharadita de ajo en polvo, ½ cucharadita de cúrcuma y sal y pimienta al gusto y lo tenemos durante 3 minutos más con el fuego controlado y removiendo de vez en cuando.',
      'Mientras la verdura se está haciendo batimos 8 huevos (pero no batimos mucho para no introducir demasiado aire y que ello produzca que la tortilla quede menos jugosa y más seca, hay que batir lo justo), agregamos la mezcla que tenemos en la sartén junto con las gambas, removemos bien para que quede todo bien impregnado de huevo y hacemos la tortilla con cuidado de que no se nos caiga al darle la vuelta 😉 Y listo, tenemos nuestra tortilla preparada.',
    ],
    nutrition: {
      totalWeightGrams: 1308,
      perServing: {"calories":321,"protein":26.8,"carbs":10.9,"fat":20.4,"fiber":2.3},
      per100g: {"calories":245,"protein":20.5,"carbs":8.3,"fat":15.6,"fiber":1.8},
    },
  },
  {
    id: 'tortilla-de-habas-y-cebolla',
    title: 'Tortilla de Habas y Cebolla',
    category: 'Legumbres',
    summary: 'Tortilla de Habas y Cebolla al estilo La Vida Bonica.',
    image: 'images/2019_03_BATCH-COOKING-1024x562.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 300, unit: 'gr de', name: 'habas (yo las tengo congeladas)' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla.' },
      { id: '3', baseQuantity: 4, unit: '', name: 'huevos.' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE y sal' },
    ],
    steps: [
      'Bastante sencillo, ¿verdad? Picamos la cebolla y sofreímos con 1 cucharada de AOVE a fuego medio bajo. Cuando empiece a ponerse transparente añadimos las habas y si es necesario otra cucharada de AOVE. Mientras se sofríen las verduras batimos 4 huevos.',
      'Y ya sólo queda hacer la tortilla, le damos la vuelta con cuidado y ya tenemos nuestro primer plato preparado.',
    ],
    nutrition: {
      totalWeightGrams: 604,
      perServing: {"calories":201,"protein":14.1,"carbs":12.2,"fat":11.4,"fiber":3.5},
      per100g: {"calories":333,"protein":23.4,"carbs":20.3,"fat":18.9,"fiber":5.8},
    },
  },
  {
    id: 'tortilla-de-verduras',
    title: 'Tortilla de Verduras',
    category: 'Entrantes',
    summary: 'Tortilla de Verduras al estilo La Vida Bonica.',
    image: 'images/2019_02_BATCH-COOKING.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: '', name: 'cebolla' },
      { id: '2', baseQuantity: 1, unit: '', name: 'calabaza pequeña' },
      { id: '3', baseQuantity: 400, unit: 'gr de', name: 'zanahorias' },
      { id: '4', baseQuantity: null, unit: '', name: 'caldo de verduras' },
      { id: '5', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
      { id: '6', baseQuantity: 1, unit: '', name: 'mango' },
    ],
    steps: [
      'Esta idea del mango me la dio en un grupo de facebook una chica llamada Ana Granda. Cortamos en trozos medianos la verdura y sofreímos con una cucharada de AOVE a fuego medio durante unos minutos hasta que se dore.',
      'Le añadimos caldo de verduras hasta casi cubrirlas, sal y pimienta al gusto y llevamos a ebullición, bajamos el fuego y chup chup unos 10 minutos o hasta que la verdura se haga (recuerda no cocerla mucho para que no pierda propiedades) Introducimos la verdura con un mango troceado en un procesador de alimentos y batimos bien hasta que quede una textura homogénea, rectificamos de sal y punto.',
    ],
    nutrition: {
      totalWeightGrams: 1206,
      perServing: {"calories":143,"protein":3.4,"carbs":25.6,"fat":4.9,"fiber":4.1},
      per100g: {"calories":119,"protein":2.8,"carbs":21.3,"fat":4.1,"fiber":3.4},
    },
  },
  {
    id: 'tortitas-de-calabacin-con-queso',
    title: 'Tortitas de Calabacín con Queso',
    category: 'Verdura',
    summary: 'Tortitas de Calabacín con Queso al estilo La Vida Bonica.',
    image: 'images/2020_10_IMG_20201003_121044.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'calabacines' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'queso' },
      { id: '4', baseQuantity: 3, unit: '', name: 'huevos' },
      { id: '5', baseQuantity: null, unit: '', name: 'Orégano y albahaca' },
      { id: '6', baseQuantity: 100, unit: 'gr de', name: 'harina de garbanzo' },
      { id: '7', baseQuantity: 0.5, unit: 'cucharadita de', name: 'nuez moscada' },
      { id: '8', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Rallamos los calabacines bien lavados y sin pelar, añadimos 1 cucharadita de sal y los dejamos en un escurridor para que suelten su agua.',
      'Mientras tanto en un bol grande rallamos 1 cebolleta y 100 gr de queso (yo he utilizado emmental y parmesano) y mezclamos con 1 cucharadita de orégano, 1 cucharadita de albahaca, 3 huevos, 100 gr de harina de garbanzo, ½ cucharadita de nuez moscada y sal y pimienta al gusto.',
      'Agregamos los calabacines previamente bien escurridos, mezclamos bien, tapamos y dejamos en la nevera 30 minutos, así podremos manejar mejor la masa.',
      'Una vez pasado este tiempo formamos bolitas y las aplastamos para darles forma de tortita y las horneamos durante 20 minutos a 180º o bien las hacemos en una plancha con un poco de AOVE, 2 minutos a fuego medio por cada lado, lo que mejor nos venga.',
      'Yo al final he utilizado unos moldes para horno, pero puedes hacerlo como mejor te convenga.',
    ],
    nutrition: {
      totalWeightGrams: 822,
      perServing: {"calories":234,"protein":11.9,"carbs":15.1,"fat":15.6,"fiber":3.5},
      per100g: {"calories":284,"protein":14.5,"carbs":18.3,"fat":19,"fiber":4.3},
    },
  },
  {
    id: 'tortitas-de-calabaza',
    title: 'Tortitas de Calabaza',
    category: 'Verdura',
    summary: 'Tortitas de Calabaza al estilo La Vida Bonica.',
    image: 'images/2022_02_RBC-1024x744.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'calabaza' },
      { id: '2', baseQuantity: 2, unit: 'latas de', name: 'pequeñas de maíz' },
      { id: '3', baseQuantity: 1, unit: '', name: 'cebolleta' },
      { id: '4', baseQuantity: 20, unit: '', name: 'tomates cherry' },
      { id: '5', baseQuantity: null, unit: '', name: 'Olivas troceadas' },
      { id: '6', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
      { id: '7', baseQuantity: 1, unit: '', name: 'chorro de limón' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'albahaca seca' },
    ],
    steps: [
      'Yo al final he asado 1 calabaza entera, troceada y en 2 recipientes, en la publicación os oriento un poco en cuanto a cantidades.',
      'En un recipiente apto para horno disponemos 400 gr de calabaza pelada en dados de 2 centímetros, aliñamos con 2 cucharadas de AOVE, 1 cucharadita de albahaca seca y sal y pimienta al gusto y horneamos durante 35 minutos a 200º.',
      'Cuando hayan pasado 15 minutos (o sea, que queden 20 para terminar de asar la calabaza) abrimos el horno y en la misma bandeja incorporamos el contenido escurrido de 2 latas pequeñas de maíz. Cerramos y dejamos que se termine de asar de forma conjunta.',
      'Mientras tanto pelamos y picamos 1 cebolleta, partimos por la mitad 20 tomates cherry y troceamos unas cuantas aceitunas sin hueso.',
      'Y ya sólo nos queda mezclar bien todos los ingredientes: La calabaza asada con el maíz, 1 cebolleta y los tomates cherry, las aceitunas troceadas y aliñar con una cucharada de AOVE, un chorrito de limón y sal al gusto. Ñam, ñam, ¿no os parece?',
    ],
    nutrition: {
      totalWeightGrams: 1240,
      perServing: {"calories":181,"protein":4.3,"carbs":29.5,"fat":6.8,"fiber":4.9},
      per100g: {"calories":146,"protein":3.5,"carbs":23.9,"fat":5.5,"fiber":4},
    },
  },
  {
    id: 'tortitas-de-espinacas-con-queso',
    title: 'Tortitas de Espinacas con Queso',
    category: 'Verdura',
    summary: 'Tortitas de Espinacas con Queso al estilo La Vida Bonica.',
    image: 'images/2019_09_IMG_20190922_144306-1024x532.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'huevos' },
      { id: '2', baseQuantity: 200, unit: 'ml de', name: 'leche' },
      { id: '3', baseQuantity: 5, unit: 'cucharadas de', name: 'soperas de harina integral de trigo' },
      { id: '4', baseQuantity: null, unit: '', name: 'Sal' },
      { id: '5', baseQuantity: 50, unit: 'gr de', name: 'queso rallado' },
      { id: '6', baseQuantity: 3, unit: 'puñados de', name: 'espinacas frescas' },
    ],
    steps: [
      'Es súper fácil, sólo hay que batir bien todos los ingredientes y freír en una sartén antiadherente engrasada con un poco de mantequilla o AOVE. Si tapamos la sartén necesitaremos menos grasa para hacerlas. Luego las podemos tomar solas o acompañar de lo que se nos ocurra.',
      'En nuestro caso utilizaremos como relleno un poco del pollo especiado que hemos hecho en la misma sesión de batch cooking. Y a ti ¿qué se te ocurre? MARTES: Ensaladilla y hamburguesas de salmón',
    ],
    nutrition: {
      totalWeightGrams: 520,
      perServing: {"calories":163,"protein":9.5,"carbs":14.1,"fat":8.5,"fiber":2.5},
      per100g: {"calories":313,"protein":18.3,"carbs":27.1,"fat":16.3,"fiber":4.8},
    },
  },
  {
    id: 'trucha-crujiente-con-avena-y-tomillo',
    title: 'Trucha Crujiente con Avena y Tomillo',
    category: 'Pescado',
    summary: 'Trucha Crujiente con Avena y Tomillo al estilo La Vida Bonica.',
    image: 'images/2020_10_RBC-3.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 4, unit: '', name: 'truchas pequeñas sin escamas y abiertas en libro' },
      { id: '2', baseQuantity: 15, unit: 'gr de', name: 'amos de tomillo' },
      { id: '3', baseQuantity: 2, unit: 'cucharadas de', name: 'copos de avena' },
      { id: '4', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'Buscando diferentes formas de comer pescado me he encontrado con esta receta de Jamie Oliver. Es muy sencilla así que viene genial para una sesión de batch cooking.',
      'En primer lugar rociamos con una cucharada de AOVE los filetes de pescado y salpimentamos al gusto y ponemos en una plancha con la carne hacia abajo durante 5 minutos, el primer minuto a temperatura alta y los otros 4 a temperatura media.',
      'A continuación espolvoreamos el tomillo y los copos de avena sobre la piel de las truchas, les damos la vuelta y dejamos hacer durante 4 minutos a fuego medio, mientras apretamos el pescado con una espátula, para que toda la piel esté en contacto con la plancha. Y listo, no tiene mucho más misterio.',
    ],
    nutrition: {
      totalWeightGrams: 800,
      perServing: {"calories":223,"protein":29.8,"carbs":2.5,"fat":12.9,"fiber":0.5},
      per100g: {"calories":178,"protein":23.9,"carbs":2,"fat":10.3,"fiber":0.4},
    },
  },
  {
    id: 'truchas-rellenas-de-cuscus',
    title: 'Truchas Rellenas de Cuscús',
    category: 'Pescado',
    summary: 'Truchas Rellenas de Cuscús al estilo La Vida Bonica.',
    image: 'images/2019_10_IMG_20191027_144805-1024x576.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: '', name: 'patatas medianas' },
      { id: '2', baseQuantity: 1, unit: '', name: 'cebolla morada' },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias ralladas.' },
      { id: '4', baseQuantity: null, unit: '', name: 'Medio pimiento verde' },
      { id: '5', baseQuantity: 100, unit: 'gr de', name: 'harina de garbanzo' },
      { id: '6', baseQuantity: 125, unit: 'ml de', name: 'agua.' },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'Garam masala' },
      { id: '8', baseQuantity: 1, unit: 'cucharadita de', name: 'pimentòn dulce' },
      { id: '9', baseQuantity: 1, unit: 'cucharadita de', name: 'comino' },
      { id: '10', baseQuantity: 1, unit: 'cucharadita de', name: 'ajo en polvo' },
      { id: '11', baseQuantity: null, unit: '', name: 'AOVE, sal y pimienta' },
    ],
    steps: [
      'En primer lugar picamos la cebolla morada y el pimiento en dados y rallamos las patatas y las zanahorias. En segundo lugar añadimos las especias: Garam Masala, pimentón dulce, comino, ajo en polvo y sal y pimienta al gusto, y removemos bien para que todas las verduras queden bien impregnadas.',
      'A continuación añadimos la harina de garbanzo y el agua y removemos bien hasta que se quede todo bien mezclado. Reservamos en el frigo durante al menos 30 minutos para que se asienten bien todos los ingredientes.',
      'A continuación, en una plancha con un poquito de AOVE vamos poniendo cucharadas de la mezcla y cocinamos a fuego medio – alto durante 3 minutos por cada lado.',
    ],
    nutrition: {
      totalWeightGrams: 1220,
      perServing: {"calories":264,"protein":20.9,"carbs":24.5,"fat":12.1,"fiber":4.3},
      per100g: {"calories":216,"protein":17.1,"carbs":20.1,"fat":9.9,"fiber":3.5},
    },
  },
  {
    id: 'tzatziki-griego',
    title: 'Tzatziki Griego',
    category: 'Verdura',
    summary: 'Tzatziki Griego al estilo La Vida Bonica.',
    image: 'images/2019_08_IMG_20190826_190620-2.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 3, unit: '', name: 'berenjenas medianas' },
      { id: '2', baseQuantity: null, unit: '', name: 'Salsa de tomate' },
      { id: '3', baseQuantity: 3, unit: '', name: 'lonchas de lacón' },
      { id: '4', baseQuantity: 5, unit: '', name: 'pimientos asados' },
      { id: '5', baseQuantity: 70, unit: 'gr de', name: 'queso semitierno' },
      { id: '6', baseQuantity: null, unit: '', name: 'Orégano' },
    ],
    steps: [
      'En plena época de berenjenas y con la producción a tope en el huerto he hecho varias semanas ya esta receta. Si bien el primer día pensé que los peques no se iban a animar a probarlas, cuando llegué a casa del trabajo me recibieron los dos con un súper abrazo… Y yo más feliz que una perdiz.',
      'He de reconocer que a mis hijos la pizza les pierde, y esta forma de sustituir la masa por una rodaja de berenjena les ha encantado. Así que hoy la he vuelto a hacer para enseñárosla. Lavamos bien las berenjenas y cortamos en rodajas no muy finas, de 1 cm de grosor aproximado.',
      'Una vez cortadas las colocamos en una bandeja de horno con papel vegetal. Tras ello echamos un poco de salsa de tomate encima de cada rodaja. Para haceros una idea con una cucharadita rasa tengo para 3 rodajas.',
      'Después de haber incorporado la salsa de tomate espolvoreamos un poco de orégano seco por encima.',
      'Una vez hecho este paso ponemos un trozo de pimiento asado (yo lo he puesto en la mitad de las rodajas, no sé si a los peques este invento les va a gustar, en todo caso lo voy a intentar), encima un trozo de lacón y por último un trozo de queso (yo lo corto con un pela patatas, así salen trozos finos de queso) En resumen, y para recapitular va en primer lugar la rodaja de berenjena apenas manchada con un poco de salsa de tomate y orégano seco.',
      'En segundo lugar el relleno, que en este caso ha sido un trozo de pimiento asado y un poco de lacón. Y en último lugar un poco de queso. Y al horno previamente precalentado a 190º unos 30 minutos. Ya veréis qué delicia! Nosotros lo acompañaremos de arroz cocido y de ensalada verde de primero.',
      'MARTES: Ensalada y quinoa con pavo y verduras',
    ],
    nutrition: {
      totalWeightGrams: 940,
      perServing: {"calories":142,"protein":6.8,"carbs":10.3,"fat":9.5,"fiber":3.9},
      per100g: {"calories":151,"protein":7.3,"carbs":11,"fat":10.1,"fiber":4.2},
    },
  },
  {
    id: 'verduras-al-vapor-con-salsa-de-yogur',
    title: 'Verduras al Vapor con Salsa de Yogur',
    category: 'Verdura',
    summary: 'Verduras al Vapor con Salsa de Yogur al estilo La Vida Bonica.',
    image: 'images/2019_04_IMG_20190426_220626_resized_20190426_100900215.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'dientes de', name: 'ajo, troceados' },
      { id: '2', baseQuantity: null, unit: '', name: '1/2 cebolla roja, troceada' },
      { id: '3', baseQuantity: 1, unit: '', name: 'pimiento rojo, troceado (yo no tenía y le he puesto 3 alcachofas)' },
      { id: '4', baseQuantity: 4, unit: 'cucharadas de', name: 'concentrado de tomate' },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'orégano seco' },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'comino molido' },
      { id: '7', baseQuantity: 1, unit: 'cucharadita de', name: 'sal' },
      { id: '8', baseQuantity: null, unit: '', name: '1/8 cucharadita de cayena' },
      { id: '9', baseQuantity: null, unit: '', name: '1/8 cucharadita de pimienta negra molida' },
      { id: '10', baseQuantity: 4, unit: 'cucharadas de', name: 'pasas (yo no tenía y he puesto 6 higos secos)' },
      { id: '11', baseQuantity: 500, unit: 'ml de', name: 'caldo de verduras' },
      { id: '12', baseQuantity: 2, unit: '', name: 'patatas medianas, peladas y troceadas en cubos' },
      { id: '13', baseQuantity: 1, unit: 'bote de', name: 'lentejas cocidas' },
      { id: '14', baseQuantity: 100, unit: 'gr de', name: 'aceitunas verdes sin hueso' },
      { id: '15', baseQuantity: 2, unit: 'cucharadas de', name: 'alcaparras' },
      { id: '16', baseQuantity: null, unit: '', name: 'Cocina las verduras en un poco de' },
      { id: '17', baseQuantity: null, unit: '', name: 'agua o aceite (ajo, cebolla y pimiento) en una sartén profunda, wok u olla a' },
      { id: '18', baseQuantity: null, unit: '', name: 'fuego medio-alto hasta que empiecen a dorarse.' },
      { id: '19', baseQuantity: null, unit: '', name: 'Añade el concentrado de tomate y' },
    ],
    steps: [
      'durante al menos 5 minutos, removiendo de vez en cuando. Echa las pasas (en mi caso los higos troceados), el caldo de verduras y las patatas y cocina a fuego alto hasta que rompa a hervir, luego baja a fuego medio y chup chup unos 20 minutos o hasta que las patatas estén tiernas.',
      'Echa el resto de los ingredientes (lentejas, aceitunas y alcaparras), remueve y cocina 5 minutos a fuego medio.',
      'Y ya está listo para consumir, o en nuestro caso refrigerar hasta que nos toque, ya veréis qué delicia de sabores 😊 En el momento de consumir añadiré más caldo de verduras o agua, para que quede más caldosito, pero eso va en gustos de cada familia, hacedlo como más os guste, pero hacedlo, que está muy sabrosón, sabrosón MARTES: Ensalada de aguacate y gambas y tzatziki griego con carne a la planche ENSALADA DE AGUACATE Y GAMBAS INGREDIENTRES 250 gr gambas peladas Zumo de 1 limón 2 cucharadas de AOVE 1 cucharadita colmada de comino Sal y pimienta al gusto 2 tomates maduros 1 aguacate 1 cebolla dulce 1 lechuga baby PREPARACIÓN Sofreímos las gambas con 1 cucharada de AOVE, troceamos y reservamos en un bol.',
      'Mezclamos el zumo de 1 limón, 1 cucharada de AOVE, 1 cucharadita de comino y sal y pimienta al gusto. Ya tenemos hecha la vinagreta En el bol o recipiente donde hemos',
    ],
    nutrition: {
      totalWeightGrams: 1636,
      perServing: {"calories":196,"protein":5.6,"carbs":30.6,"fat":7.3,"fiber":6.3},
      per100g: {"calories":120,"protein":3.4,"carbs":18.7,"fat":4.5,"fiber":3.8},
    },
  },
  {
    id: 'zarangollo',
    title: 'Zarangollo',
    category: 'Verdura',
    summary: 'Zarangollo al estilo La Vida Bonica.',
    image: 'images/2022_03_IMG_20220306_193841-1024x938.jpg',
    defaultServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 400, unit: 'gr de', name: 'champiñones' },
      { id: '2', baseQuantity: 50, unit: 'gr de', name: 'queso Emmental' },
      { id: '3', baseQuantity: 60, unit: 'gr de', name: 'jamón york (más del 90%-95% de carne nos asegura tomar un fiambre de calidad)' },
      { id: '4', baseQuantity: null, unit: '', name: 'Aceite de Oliva Virgen Extra (AOVE), sal y pimienta' },
    ],
    steps: [
      'Tras limpiarlos de tierra colocamos los champiñones en una bandeja apta para horno, les quitamos los rabitos y los picamos, así como 60 gr de jamón york con alto contenido de carne (más del 90%, yo utilizo uno de ALDI que lleva un 96%).',
      'Rallamos 50 gr de queso Emmental y mezclamos con el jamón y el champiñón picado. Con esta mezcla rellenamos los champiñones, cubrimos la bandeja con papel de aluminio o papel vegetal y horneamos a 180º durante 30 minutos.',
      'Debería ser suficiente, no conviene cocinar mucho los champiñones para que no suelten mucha agua. Mi horno es grande y lento, seguramente con el tuyo se hagan en menos tiempo, compruébalo.',
    ],
    nutrition: {
      totalWeightGrams: 610,
      perServing: {"calories":206,"protein":14.1,"carbs":5.9,"fat":15.6,"fiber":1.9},
      per100g: {"calories":338,"protein":23.2,"carbs":9.7,"fat":25.6,"fiber":3.1},
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
    if (!recipe.nutrition) return null;
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

      {recipe.nutrition && (
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
            { label: 'Calorías', value: getNutritionValues()?.calories, unit: 'kcal' },
            { label: 'Proteínas', value: getNutritionValues()?.protein, unit: 'g' },
            { label: 'Carbohidratos', value: getNutritionValues()?.carbs, unit: 'g' },
            { label: 'Grasas', value: getNutritionValues()?.fat, unit: 'g' },
            { label: 'Fibra', value: getNutritionValues()?.fiber, unit: 'g' },
          ].map((item, idx) => (
            <View key={idx} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
              <Text style={styles.nutritionValue}>{item.value} {item.unit}</Text>
            </View>
          ))}
        </View>
      </View>
      )}

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
  const batchHeaderRef = useRef<View>(null);

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
      setTimeout(() => {
        (batchHeaderRef.current as any)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }, 300);
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
  const allCats = [...SHOPPING_CATEGORIES, { key: 'otros', label: 'Otros', icon: ShoppingBasket, keywords: [] }];
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
          <TouchableOpacity
            style={[styles.copyButton, { marginTop: 16 }]}
            onPress={copyShoppingList}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>Copiar lista</Text>
          </TouchableOpacity>
          </View>
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
            <View ref={batchHeaderRef}><Text style={[styles.dayHeader, { marginTop: 20, marginBottom: 12 }]}>Batch cooking</Text></View>
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  navLogo: {
    width: 100,
    height: 36,
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
    marginTop: 2,
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
