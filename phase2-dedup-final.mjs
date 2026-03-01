import fs from 'fs';

const recipes = JSON.parse(fs.readFileSync('phase2-final-recipes.json', 'utf8'));

// Near-duplicates: keep first, remove rest
const dupeGroups = [
  ['Ensalada Cremosa con Uvas, Pollo y Picatostes', 'Ensalada Cremosa de Pollo y Uvas'],
  ['Hamburguesas de Atún y Lentejas', 'Hamburguesas de Lentejas y Atún'],
  ['Solomillo de Pavo Adobado', 'Solomillos de Pavo Adobados'],
  ['Patatas al Horno con Limón', 'Patatas al Limón'],
  ['Hamburguesas de Patata y Brócoli', 'Hamburguesa de Patata y Brócoli'],
  ['Hamburguesas de Merluza', 'Hamburguesa de Merluza'],
  ['Hamburguesas de Salmón', 'Hamburguesa de Salmón'],
  ['Hamburguesas de Pollo y Quinoa', 'Hamburguesa de Pollo y Quinoa'],
  ['Paté de Tomates Secos', 'Pate de Tomates Secos'],
  ['Hummus de Garbanzos con Tomates Secos', 'Hummus de Garbanzoscon Tomates Secos'],
  ['Tortitas de Espinacas', 'Tortitas de Espinacas con Queso'], // keep with queso, more specific
  ['Crema de Calabaza', 'Crema de Calabaza Asada'], // keep Asada, more specific
  ['Crema de Guisantes', 'Crema de Guisantes y Patatas'], // keep with patatas
  ['Espaguetis con Pesto de Guisantes', 'Espaguetis con Pesto'],
  ['Hervido de Judías Verdes', 'Hervido de Judías Verdes con Refrito'], // keep con refrito
  ['Pollo Satay con Salsa de Cacahuetes', 'Pollo Satay'], // keep fuller name
  ['Muslos de Pollo a la Naranja', 'Asado de Pollo a la Naranja'], // similar dish
  ['Alcachofas con Carne', 'Alcachofas con Carne Picada'], // keep more specific
  ['Guiso de Alubias con Coles de Bruselas', 'Guiso de Coles de Bruselas con Alubias'],
  ['Crema de Zanahorias', 'Crema de Zanahorias y Leche de Coco'], // keep more specific
  ['Crema de Verduras', 'Crema de Verduras Asadas'], // keep asadas
  ['Pollo Asado con Especias', 'Pollo Entero Asado con Especias y Salsa de Coco'],
  ['Tortilla de Patatas y Verduras', 'Tortilla de Verduras'],
  ['Pechugas de Pavo al Curry', 'Pollo al Curry'], // different proteins, keep both actually
  ['Hamburguesas de Alubias', 'Hamburguesas de Alubias Negras'], // keep both, different
  ['Ensalada de Col', 'Ensalada de Col Lombarda con Salsa Cremosa de Yogur'], // keep both, different
  ['Lentejas a las 1001 Noches', 'Lentejas al Curry'], // keep both, different
  ['Gazpacho con Remolacha', 'Gazpacho con Zanahoria', 'Gazpacho con Espirulina', 'Gazpacho con Manzana'], // keep all, different
];

// Build removal set (remove the duplicates, keeping the preferred one)
const removeSet = new Set();
for (const group of dupeGroups) {
  // Keep first, remove rest (unless noted above to keep both)
  for (let i = 1; i < group.length; i++) {
    removeSet.add(group[i].toLowerCase());
  }
}

// Override: for some pairs, remove the FIRST (less specific) and keep the second
const removeFirst = [
  'tortitas de espinacas', 'crema de calabaza', 'crema de guisantes',
  'hervido de judías verdes', 'pollo satay', 'alcachofas con carne',
  'crema de zanahorias', 'crema de verduras', 'pollo asado con especias',
  'tortilla de patatas y verduras', 'espaguetis con pesto',
];
removeFirst.forEach(r => {
  removeSet.add(r);
  // Remove the less specific from the removeSet if we added it
});
// Re-add the specific ones we want to keep
const keepSpecific = [
  'tortitas de espinacas con queso', 'crema de calabaza asada', 'crema de guisantes y patatas',
  'hervido de judías verdes con refrito', 'pollo satay con salsa de cacahuetes',
  'alcachofas con carne picada', 'crema de zanahorias y leche de coco',
  'crema de verduras asadas', 'pollo entero asado con especias y salsa de coco',
  'tortilla de verduras', 'espaguetis con pesto de guisantes',
];
keepSpecific.forEach(r => removeSet.delete(r));

// Too simple recipes to remove
const tooSimple = [
  'arroz al limón', 'col lombarda cocida', 'patatas con tomillo',
  'patatas con pimentón', 'col especiada', 'crema de ajo',
  'pisto de verduras', 'patatas asadas con aliño de ajo',
  'patatas asadas y mayonesa casera', 'mantequilla de avellanas y semillas',
  'cebolletas con garam masala', 'espárragos verdes con refrito',
  'guisantes con cus cus', 'cus cus con guisantes',
  'rollitos con bacon', 'cebolla en crema',
  'patatas gratinadas con queso', 'calabacines con tomate',
  'calabacines en vinagre', 'coliflor al horno',
  'puré de coliflor', 'puré de patatas con toque de tomillo',
  'col salteada con salsa de soja', 'judías verdes salteadas con jamón',
  'arroz estilo hindú', 'arroz salteado con verduras y salsa de soja',
  'verdura asada con quinoa', 'pollo con tomate', 'pollo en salsa',
  'pollo asado con patatas', 'pollo a la crema',
  'salmón en salsa', 'revuelto de berenjenas con huevo',
  'revuelto de espárragos y setas', 'huevos hervidos con escalivada de cebollas',
  'yogures con confitura', 'yogures de leche merengada',
  'guisantes con coles de bruselas', 'guisantes con gambas',
  'bocaditos de manzana fitness', 'petit suisse con fresas naturales',
  'pan de pita', 'parrillada de verduras a la plancha',
  'calabaza asada', 'boniato relleno', 'endibias al roquefort',
  'quinoa con atún', 'crema de maíz', 'crema de champiñones',
  'crema de setas', 'crema de lechuga', 'crema de habas',
  'crema de espárragos', 'crema de lentejas', 'crema de garbanzos',
  'crema de calabacín', 'crema de verduras con leche de coco',
  'arroz al horno', 'habas con jamón', 'pollo marinado y guisantes',
  'pavo con guisantes', 'pollo con cus cus', 'lentejas con cus cus',
  'lentejas con verduras', 'sobrasada vegana',
  'espinacas con patatas', 'paté de anchoas', 'paté de atún',
  'hummus de guisantes', 'hummus de lentejas',
  'tartar de aguacate', 'caldo de huesos',
  'garbanzos con acelgas', 'pollo marinado con limón',
  'ensalada de hortalizas', 'ensalada de crudités',
  'tortilla de ropa vieja',
];
tooSimple.forEach(r => removeSet.add(r));

let filtered = recipes.filter(r => !removeSet.has(r.name.toLowerCase()));

// Sort
filtered.sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Categorize for display
function categorize(name) {
  const n = name.toLowerCase();
  if (/ensalad/.test(n)) return 'Ensaladas';
  if (/sopa|crema|puré|caldo/.test(n)) return 'Sopas y Cremas';
  if (/lentejas|garbanzos|alubias|habas|guiso de/.test(n)) return 'Legumbres';
  if (/pollo|pavo|cerdo|ternera|carne|solomillo|costill|carrillera|ragú|contramuslo|brocheta|kebab/.test(n)) return 'Carne';
  if (/merluza|salmón|bacalao|atún|pescado|lubina|dorada|trucha|caballa|mújol|cazuela|gambas|langostino/.test(n)) return 'Pescado';
  if (/hamburguesa|falafel|nugget|croqueta|albóndiga/.test(n)) return 'Hamburguesas y Albóndigas';
  if (/tortill|huev|revuelto|frittata|shakshuka/.test(n)) return 'Huevos y Tortillas';
  if (/pasta|arroz|lasaña|espagueti|macarron/.test(n)) return 'Pasta y Arroz';
  if (/tarta |bizcocho|galleta|cookie|helado|mousse|muffin|magdalena/.test(n)) return 'Postres';
  return 'Otros';
}

const cats = {};
filtered.forEach(r => {
  const cat = categorize(r.name);
  if (!cats[cat]) cats[cat] = [];
  cats[cat].push(r);
});

let msg = `📋 *Batch Cooking — New Recipes for Review*\n\n`;
msg += `*${filtered.length} new recipes* to add to the app.\n`;
msg += `Reply with any numbers to ❌ remove.\n\n`;

let num = 1;
const order = ['Ensaladas', 'Sopas y Cremas', 'Legumbres', 'Carne', 'Pescado', 'Hamburguesas y Albóndigas', 'Huevos y Tortillas', 'Pasta y Arroz', 'Postres', 'Otros'];
for (const cat of order) {
  const items = cats[cat];
  if (!items || items.length === 0) continue;
  msg += `*${cat} (${items.length})*\n`;
  items.forEach(r => {
    msg += `${num}. ${r.name}\n`;
    num++;
  });
  msg += '\n';
}

fs.writeFileSync('phase2-final-list.txt', msg);
fs.writeFileSync('phase2-final-filtered.json', JSON.stringify(filtered, null, 2));
console.log(`Final count: ${filtered.length} recipes`);
console.log('Saved phase2-final-list.txt and phase2-final-filtered.json');
