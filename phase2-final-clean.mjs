// Final cleanup: remove obvious noise, merge broken titles, prepare Tony's review list
import fs from 'fs';

const recipes = JSON.parse(fs.readFileSync('phase2-new-recipes.json', 'utf8'));

// Remove obvious noise/fragments/non-recipes
const removeExact = new Set([
  '¿qué preparar con 900 gr de carne comprada para hacer ragú?',
  'alcachofas', 'con ajos tiernos', 'con salsa de bechamel de calabacín y pollo',
  'con salsa de piña ingrediente pastel de pollo grisines al curry',
  'con tomate hummus de alitas de pollo con salsa de tomate',
  'de cacahuetes pan con avena y nueces', 'de fresa y frambuesa',
  'de patatas preñada', 'de quinoa y vegetales', 'texturizada',
  'tiernos jamie oliver', 'y mejillones', 'y quinoa', 'tortilla',
  'preparació', 'rehogadas con calamares', 'revuelto de huevos',
  'hummus', 'pollo asado', 'ensalada de ajos', 'ensalada de alcachofas',
  'ensalada con patatas', 'sobrasada vegana galletas escandinavas sopa cortijera',
  'haburguesas de lentejas con sésamo guiso de pollo con vino tinto',
  'picadillo cubano vegano ingredientres tzatziki griega',
  'gazpacho con sandía pollo con garbanzos',
  'guiso de lentejas y salchichas ingreidentes: habas',
  'pollo picante con piña alcachofas con crema de puerros y sardinas',
  'ensalada de hoja de roble guiso de pescado con tomillo',
  'pollo marinado listo para ser cocinado',
  'hamburguesas con sobras (que aquí no se tira nada)',
  'pollo asado …. en una olla',
  'bechamel de calabacín y pollo', 'masa de hamburguesas de carne y pimiento',
  'hambrguesas de pollo', 'haburguesas de lentejas con sésamo',
  'qucihe de verduras y salmón', 'albóndigas de merluza en salsa de vino blanc',
  'cocido marmitako', 'macarrones integrales', 'petit suisse con fresas naturales',
  'pechugas de pavo adobadas', // already exists as "Pechugas de pavo al curry" similar
  'ensalada de pasta con salmón escalivada',
  'pollo especiado', 'calabaza asada', 'praliné', 'crepes',
  'espaguetis con pesto', 'pan integral', 
  'pesto de zanahoria', 'salsa kebab', 
  'ensalada de patatas y lenteja', // duplicate of ensalada de patatas
  'de guisantes', 'pseudo-pesto de calabacín',
  'patatas al horno y verdura al vapor',
  'pollo satay con salsa',
  'carne en adobo',
  'acompañamiento: arroz y huevos cocidos',
]);

const removePatterns = [
  /^extras?\b/i, /^receta de/i, /^boloñesa de soja$/i,
];

const filtered = recipes.filter(r => {
  const lower = r.name.toLowerCase().trim();
  if (removeExact.has(lower)) return false;
  if (removePatterns.some(p => p.test(lower))) return false;
  return true;
});

// Fix typos and clean names
const nameFixups = {
  'pate de tomates secos': 'Paté de Tomates Secos',
  'haburguesas de lentejas con sésamo': 'Hamburguesas de Lentejas con Sésamo',
  'hamburguesa de patata y brócoli': 'Hamburguesas de Patata y Brócoli',
  'hamburguesa de merluza': 'Hamburguesas de Merluza',
  'hamburguesa de salmón': 'Hamburguesas de Salmón', 
  'hamburguesa de pollo y quinoa': 'Hamburguesas de Pollo y Quinoa',
  'hummus de garbanzoscon tomates secos': 'Hummus de Garbanzos con Tomates Secos',
  'berenjena – pizza o berenpizzas': 'Berenpizzas',
  'cookies brownie sin azúcar (receta inspirada en una de juan llorca)': 'Cookies Brownie sin Azúcar',
  'kartoffelsalat o ensalada de patatas alemana': 'Ensalada de Patatas Alemana',
  'pataletas (tartaletas de patata) y carne especiada': 'Tartaletas de Patata con Carne Especiada',
  'extra: gallletas saludables de coco y manzana rallada': 'Galletas de Coco y Manzana',
  'extra: muffins fitness con chocolate 72% cacao': 'Muffins de Chocolate',
  'pechugas de pavo al curr': 'Pechugas de Pavo al Curry',
  'ensalada de lentejas con mayonesa de aguacate y tomates secos': 'Ensalada de Lentejas con Mayonesa de Aguacate',
};

const final = filtered.map(r => {
  const lower = r.name.toLowerCase().trim();
  const fixedName = nameFixups[lower] || r.name;
  return { ...r, name: fixedName };
});

// Remove duplicates after fixups
const seen = new Set();
const deduped = final.filter(r => {
  const key = r.name.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Sort alphabetically
deduped.sort((a, b) => a.name.localeCompare(b.name, 'es'));

console.log(`After final cleanup: ${deduped.length} new recipes\n`);

// Group by rough category for easier review
const categories = {
  'Ensaladas': [], 'Sopas y Cremas': [], 'Legumbres': [], 'Carne': [],
  'Pescado': [], 'Verduras': [], 'Pasta y Arroz': [], 'Postres': [],
  'Hamburguesas': [], 'Huevos y Tortillas': [], 'Otros': []
};

deduped.forEach(r => {
  const n = r.name.toLowerCase();
  if (/ensalad/.test(n)) categories['Ensaladas'].push(r);
  else if (/sopa|crema|puré|caldo/.test(n)) categories['Sopas y Cremas'].push(r);
  else if (/lentejas|garbanzos|alubias|habas|guiso de/.test(n)) categories['Legumbres'].push(r);
  else if (/pollo|pavo|cerdo|ternera|carne|solomillo|costill|carrillera|ragú|contramuslo|brocheta/.test(n)) categories['Carne'].push(r);
  else if (/merluza|salmón|bacalao|atún|pescado|lubina|dorada|trucha|caballa|mújol|cazuela marinera|marmitako|gambas|langostino/.test(n)) categories['Pescado'].push(r);
  else if (/hamburguesa|falafel|nugget|croqueta/.test(n)) categories['Hamburguesas'].push(r);
  else if (/tortill|huev|revuelto|frittata|shakshuka/.test(n)) categories['Huevos y Tortillas'].push(r);
  else if (/pasta|arroz|lasaña|espagueti|macarron|quinoa con/.test(n)) categories['Pasta y Arroz'].push(r);
  else if (/tarta|bizcocho|galleta|cookie|helado|mousse|muffin|yogur|magdalena|carrot/.test(n)) categories['Postres'].push(r);
  else if (/calabac|berenjenas|alcachof|coliflor|patata|col |verdur|espinaca|endib|boniato|champiñon|migas|torti[lt]a|parrillada|pimiento|zarangollo|escalivada/.test(n)) categories['Verduras'].push(r);
  else categories['Otros'].push(r);
});

let output = `# Batch Cooking - New Recipes for Review\n\n`;
output += `**Total: ${deduped.length} new recipes** (not yet in the app)\n\n`;
output += `Mark with ❌ any you want to skip. Everything else will be extracted and added.\n\n`;

let num = 1;
for (const [cat, items] of Object.entries(categories)) {
  if (items.length === 0) continue;
  output += `## ${cat} (${items.length})\n\n`;
  items.forEach(r => {
    const src = r.sourceCount > 1 ? ` _(${r.sourceCount} sources)_` : '';
    output += `${String(num++).padStart(3)}. ${r.name}${src}\n`;
  });
  output += '\n';
}

fs.writeFileSync('phase2-review-list.md', output);
fs.writeFileSync('phase2-final-recipes.json', JSON.stringify(deduped, null, 2));
console.log('Saved phase2-review-list.md and phase2-final-recipes.json');
