const fs = require('fs');
const catalogue = JSON.parse(fs.readFileSync('/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json', 'utf8'));

const updates = {
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-febrero/": [
    "Pastel de patata y carne", "Col salteada con salsa de soja", "Sopa cortijera",
    "Garbanzos con bacalao", "Puré de brócoli con huevo y semillas",
    "Hamburguesas de alubias", "Galletas de almendra", "Sobrasada vegana"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-febrero/": [
    "Crema de puerros con migas de bacalao", "Patatas con pimentón",
    "Garbanzos y arroz al horno", "Quinoa con verduras",
    "Hamburguesas de pollo y verduras", "Pesto de guisantes", "Tarta de manzana"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-febrero/": [
    "Crema de garbanzos con setas", "Alitas de pollo en escabeche",
    "Albóndigas al curry", "Crema de setas", "Hamburguesas de lentejas con sésamo",
    "Pasta con paté de caballa"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-febrero/": [
    "Alubias con setas y bacalao", "Puré de coliflor", "Hamburguesas de patata y brócoli",
    "Crema de judías verdes", "Carne marinada con salsa de soja y naranja",
    "Curry de garbanzos", "Pasta con crema de verduras y carne", "Paté de aceitunas verdes"
  ],
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-enero/": [
    "Sopa de patatas estilo alemán", "Curry de lentejas y guisantes",
    "Crema de verduras", "Pechugas de pavo al curry", "Crema de setas",
    "Hamburguesas de lentejas con sésamo", "Pasta con crema de verduras y carne"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-enero/": [
    "Alubias con quinoa, rape y langostinos", "Guiso de pollo con garam masala",
    "Garbanzos con picada y huevo", "Crema de alubias con acelgas",
    "Albóndigas al curry", "Paté de caballa y sardinas"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-enero/": [
    "Tortilla de patatas con verdura", "Crema de garbanzos con setas",
    "Quinoa con pollo y pomelo", "Crema de coliflor y calabacín",
    "Alitas de pollo en escabeche", "Arroz meloso con chipirones",
    "Hamburguesas de atún y espinacas"
  ]
};

for (const entry of catalogue) {
  if (updates[entry.postUrl]) {
    entry.recipes = updates[entry.postUrl];
  }
}

// Count stats
const totalPosts = catalogue.length;
const fetchedPosts = catalogue.filter(p => !p.recipes.includes("_NOT_FETCHED_"));
const notFetchedPosts = catalogue.filter(p => p.recipes.includes("_NOT_FETCHED_"));
const totalRecipes = fetchedPosts.reduce((sum, p) => sum + p.recipes.length, 0);

fs.writeFileSync(
  '/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json',
  JSON.stringify(catalogue, null, 2),
  'utf8'
);

console.log("=== FINAL SUMMARY ===");
console.log("Total posts:", totalPosts);
console.log("Posts with recipes:", fetchedPosts.length);
console.log("Posts remaining:", notFetchedPosts.length);
console.log("Total recipes:", totalRecipes);
console.log("\nRemaining URLs:");
notFetchedPosts.forEach(p => console.log(" -", p.postUrl));
