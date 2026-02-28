import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
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
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200121_154409-e1660130606874.jpg',
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
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200115_154632-e1660131471336.jpg',
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
    image: 'https://lavidabonica.com/wp-content/uploads/2020/01/IMG_20200114_154636-e1660132018907.jpg',
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

// --- Home Screen ---
const ALL_CATEGORIES = [...new Set(RECIPES.map(r => r.category))].sort();

function HomeScreen({ onSelectRecipe }: { onSelectRecipe: (recipe: RecipeData) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const filteredRecipes = RECIPES.filter(r => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
          <Text style={[styles.filterArrow, selectedCategory && styles.filterButtonTextActive]}>▼</Text>
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
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Receta</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Categoría</Text>
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
    backgroundColor: '#EBEEDD',
  },
  modalOptionText: {
    fontFamily: 'Karla',
    fontSize: 18,
    color: '#424242',
  },
  modalOptionTextSelected: {
    color: '#707940',
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
});
