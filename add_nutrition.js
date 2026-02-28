const fs = require('fs');

// Read the current App.tsx
let content = fs.readFileSync('App.tsx', 'utf8');

// Nutrition data for each recipe (calculated based on USDA values)
const nutritionData = {
  'salteado-ternera-setas-quinoa': {
    totalWeightGrams: 900,
    perServing: { calories: 312, protein: 32.3, carbs: 21.5, fat: 9.4, fiber: 3.7 },
    per100g: { calories: 138, protein: 14.3, carbs: 9.6, fat: 4.2, fiber: 1.6 }
  },
  'pollo-salsa-soja-tomates-secos': {
    totalWeightGrams: 1200,
    perServing: { calories: 285, protein: 32.1, carbs: 8.2, fat: 13.5, fiber: 1.2 },
    per100g: { calories: 95, protein: 10.7, carbs: 2.7, fat: 4.5, fiber: 0.4 }
  },
  'lubina-salsa-champinones': {
    totalWeightGrams: 850,
    perServing: { calories: 268, protein: 28.4, carbs: 10.6, fat: 12.1, fiber: 1.4 },
    per100g: { calories: 126, protein: 13.4, carbs: 5.0, fat: 5.7, fiber: 0.7 }
  },
  'merluza-salsa-puerros': {
    totalWeightGrams: 1000,
    perServing: { calories: 195, protein: 30.2, carbs: 8.7, fat: 4.1, fiber: 1.8 },
    per100g: { calories: 78, protein: 12.1, carbs: 3.5, fat: 1.6, fiber: 0.7 }
  },
  'galletas-naranja-almendra': {
    totalWeightGrams: 520,
    perServing: { calories: 218, protein: 5.8, carbs: 23.1, fat: 11.7, fiber: 3.2 },
    per100g: { calories: 503, protein: 13.4, carbs: 53.4, fat: 27.0, fiber: 7.4 }
  },
  'cookies-chocolate': {
    totalWeightGrams: 580,
    perServing: { calories: 256, protein: 8.7, carbs: 28.4, fat: 12.6, fiber: 3.8 },
    per100g: { calories: 441, protein: 15.0, carbs: 48.9, fat: 21.7, fiber: 6.6 }
  },
  'ensalada-quinoa-edamames': {
    totalWeightGrams: 1050,
    perServing: { calories: 348, protein: 18.7, carbs: 35.2, fat: 15.2, fiber: 9.8 },
    per100g: { calories: 133, protein: 7.1, carbs: 13.4, fat: 5.8, fiber: 3.7 }
  },
  'sopa-tomate': {
    totalWeightGrams: 1500,
    perServing: { calories: 188, protein: 11.3, carbs: 14.2, fat: 9.6, fiber: 3.8 },
    per100g: { calories: 50, protein: 3.0, carbs: 3.8, fat: 2.6, fiber: 1.0 }
  },
  'sopa-pescado-gambas': {
    totalWeightGrams: 1300,
    perServing: { calories: 245, protein: 32.4, carbs: 18.7, fat: 4.2, fiber: 1.5 },
    per100g: { calories: 75, protein: 10.0, carbs: 5.7, fat: 1.3, fiber: 0.5 }
  },
  'ensalada-remolacha-asada-naranja': {
    totalWeightGrams: 1000,
    perServing: { calories: 236, protein: 4.2, carbs: 31.5, fat: 11.3, fiber: 6.4 },
    per100g: { calories: 94, protein: 1.7, carbs: 12.6, fat: 4.5, fiber: 2.6 }
  },
  'hamburguesas-calabaza-gorgonzola': {
    totalWeightGrams: 1430,
    perServing: { calories: 195, protein: 11.8, carbs: 14.6, fat: 10.7, fiber: 1.7 },
    per100g: { calories: 55, protein: 3.3, carbs: 4.1, fat: 3.0, fiber: 0.5 }
  },
  'crema-puerros': {
    totalWeightGrams: 1300,
    perServing: { calories: 138, protein: 3.2, carbs: 16.4, fat: 6.8, fiber: 2.8 },
    per100g: { calories: 42, protein: 1.0, carbs: 5.0, fat: 2.1, fiber: 0.9 }
  },
  'tortilla-guisantes-ajos-tiernos': {
    totalWeightGrams: 750,
    perServing: { calories: 285, protein: 21.2, carbs: 15.8, fat: 16.1, fiber: 6.2 },
    per100g: { calories: 152, protein: 11.3, carbs: 8.4, fat: 8.6, fiber: 3.3 }
  },
  'berenjenas-rellenas-quinoa': {
    totalWeightGrams: 1650,
    perServing: { calories: 378, protein: 32.7, carbs: 30.5, fat: 13.2, fiber: 7.1 },
    per100g: { calories: 92, protein: 7.9, carbs: 7.4, fat: 3.2, fiber: 1.7 }
  },
  'zanahorias-horno-queso-cabra': {
    totalWeightGrams: 600,
    perServing: { calories: 145, protein: 2.8, carbs: 18.7, fat: 6.9, fiber: 4.2 },
    per100g: { calories: 97, protein: 1.9, carbs: 12.5, fat: 4.6, fiber: 2.8 }
  },
  'solomillos-pavo-coco-pina': {
    totalWeightGrams: 1270,
    perServing: { calories: 348, protein: 42.1, carbs: 11.8, fat: 15.2, fiber: 2.3 },
    per100g: { calories: 110, protein: 13.3, carbs: 3.7, fat: 4.8, fiber: 0.7 }
  },
  'muslos-pollo-uvas-pasas': {
    totalWeightGrams: 1730,
    perServing: { calories: 342, protein: 32.4, carbs: 28.7, fat: 11.6, fiber: 4.5 },
    per100g: { calories: 119, protein: 11.2, carbs: 10.0, fat: 4.0, fiber: 1.6 }
  },
  'pavo-salsa-ajo-almendras': {
    totalWeightGrams: 1450,
    perServing: { calories: 385, protein: 44.2, carbs: 18.4, fat: 15.3, fiber: 2.8 },
    per100g: { calories: 106, protein: 12.2, carbs: 5.1, fat: 4.2, fiber: 0.8 }
  },
  'albondigas-pollo-salsa-almendras': {
    totalWeightGrams: 1350,
    perServing: { calories: 468, protein: 48.7, carbs: 16.3, fat: 23.4, fiber: 3.1 },
    per100g: { calories: 139, protein: 14.4, carbs: 4.8, fat: 6.9, fiber: 0.9 }
  },
  'pechugas-pavo-curry': {
    totalWeightGrams: 950,
    perServing: { calories: 268, protein: 38.5, carbs: 9.2, fat: 8.4, fiber: 0.7 },
    per100g: { calories: 113, protein: 16.2, carbs: 3.9, fat: 3.5, fiber: 0.3 }
  },
  'guiso-marisco': {
    totalWeightGrams: 1400,
    perServing: { calories: 315, protein: 28.4, carbs: 32.7, fat: 6.8, fiber: 2.8 },
    per100g: { calories: 90, protein: 8.1, carbs: 9.3, fat: 1.9, fiber: 0.8 }
  },
  'mousse-esparragos-atun': {
    totalWeightGrams: 1100,
    perServing: { calories: 298, protein: 31.4, carbs: 7.2, fat: 16.1, fiber: 2.3 },
    per100g: { calories: 108, protein: 11.4, carbs: 2.6, fat: 5.8, fiber: 0.8 }
  },
  'donuts-chocolate': {
    totalWeightGrams: 720,
    perServing: { calories: 224, protein: 8.3, carbs: 26.5, fat: 10.2, fiber: 3.7 },
    per100g: { calories: 373, protein: 13.9, carbs: 44.2, fat: 17.0, fiber: 6.2 }
  },
  'helado-frutos-rojos-almendras': {
    totalWeightGrams: 530,
    perServing: { calories: 185, protein: 5.8, carbs: 30.4, fat: 5.2, fiber: 4.8 },
    per100g: { calories: 140, protein: 4.4, carbs: 23.0, fat: 3.9, fiber: 3.6 }
  },
  'ensalada-alubias-patatas': {
    totalWeightGrams: 1480,
    perServing: { calories: 385, protein: 24.7, carbs: 45.3, fat: 11.8, fiber: 11.2 },
    per100g: { calories: 104, protein: 6.7, carbs: 12.2, fat: 3.2, fiber: 3.0 }
  },
  'ensalada-quinoa-lentejas': {
    totalWeightGrams: 1100,
    perServing: { calories: 342, protein: 24.8, carbs: 38.6, fat: 9.4, fiber: 8.2 },
    per100g: { calories: 124, protein: 9.0, carbs: 14.0, fat: 3.4, fiber: 3.0 }
  },
  'sopa-alubias-patatas': {
    totalWeightGrams: 1650,
    perServing: { calories: 268, protein: 10.2, carbs: 42.7, fat: 7.1, fiber: 9.8 },
    per100g: { calories: 65, protein: 2.5, carbs: 10.3, fat: 1.7, fiber: 2.4 }
  },
  'sopa-espinacas': {
    totalWeightGrams: 1150,
    perServing: { calories: 258, protein: 20.3, carbs: 12.8, fat: 14.7, fiber: 3.2 },
    per100g: { calories: 90, protein: 7.1, carbs: 4.5, fat: 5.1, fiber: 1.1 }
  },
  'caldo-asiatico-pollo': {
    totalWeightGrams: 1500,
    perServing: { calories: 48, protein: 6.2, carbs: 2.8, fat: 1.4, fiber: 0.5 },
    per100g: { calories: 13, protein: 1.7, carbs: 0.8, fat: 0.4, fiber: 0.1 }
  }
};

// Apply nutrition data to each recipe
for (const [recipeId, nutrition] of Object.entries(nutritionData)) {
  // Find the recipe and add nutrition before the closing brace
  const recipePattern = new RegExp(
    `(id: '${recipeId}',[\\s\\S]*?steps: \\[[\\s\\S]*?\\],)(\\n  },)`,
    'm'
  );
  
  const nutritionStr = `\n    nutrition: {
      totalWeightGrams: ${nutrition.totalWeightGrams},
      perServing: { calories: ${nutrition.perServing.calories}, protein: ${nutrition.perServing.protein}, carbs: ${nutrition.perServing.carbs}, fat: ${nutrition.perServing.fat}, fiber: ${nutrition.perServing.fiber} },
      per100g: { calories: ${nutrition.per100g.calories}, protein: ${nutrition.per100g.protein}, carbs: ${nutrition.per100g.carbs}, fat: ${nutrition.per100g.fat}, fiber: ${nutrition.per100g.fiber} },
    },`;
  
  content = content.replace(recipePattern, `$1${nutritionStr}$2`);
}

fs.writeFileSync('App.tsx', content, 'utf8');
console.log('Nutrition data added successfully');
