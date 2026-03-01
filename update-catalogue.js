const fs = require('fs');
const catalogue = JSON.parse(fs.readFileSync('/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json', 'utf8'));

// Updates for newly fetched posts
const updates = {
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-abril/": [
    "Sopa de espinacas", "Bacalao dorado", "Crema de lentejas", "Torta de calabacín",
    "Calabacines con tomate", "Guiso de pavo con alubias", "Crema de guisantes",
    "Hamburguesas de verduras y lentejas", "Pesto de calabacín"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-abril/": [
    "Crema de habas", "Garbanzos con arroz", "Ensalada de arroz", "Pasteles de apio",
    "Codillo con cus cus", "Sopa de tomate", "Hamburguesas especiadas de pavo",
    "Hummus de habas tiernas", "Macarrones con bechamel y pollo", "Bizcocho de piña"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-abril/": [
    "Hervido de judías verdes", "Merluza con salsa de jamón", "Chili ahumado de verduras",
    "Guiso de pollo con cúrcuma", "Ensalada de judías verdes y anchoas",
    "Hamburguesas de guisantes", "Arroz con pollo", "Salteado de setas con garam masala",
    "Pan de pita", "Bizcocho de arándanos"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-abril/": [
    "Sopa Goulash", "Sopa de almejas y arroz", "Lentejas con coliflor",
    "Quinoa con guisantes", "Hamburguesas de merluza",
    "Albóndigas de garbanzos", "Ragú de carne", "Regañás de queso"
  ],
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-marzo/": [
    "Migas de coliflor", "Tortilla de ajetes y patata rallada", "Merluza en salsa verde",
    "Lentejas con puré de patatas gratinado", "Alubias con nata y queso",
    "Hamburguesas de garbanzos y zanahorias", "Paté de sardinas", "Coliflor al horno", "Sobrasada vegana"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-marzo/": [
    "Tortitas de pescado y boniato", "Crema de acelgas y zanahorias",
    "Ensalada de quinoa con pollo", "Lentejas con verduras",
    "Albóndigas de pollo con salsa de almendras", "Pasta integral con crema de acelgas y carne picada",
    "Garbanzos especiados", "Croquetas"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-marzo/": [
    "Ensalada cremosa de pollo y uvas", "Sopa de arroz", "Ensaladilla de coliflor",
    "Garbanzos al vino blanco", "Ensalada de patata y naranja",
    "Hamburguesas de champiñones y calabacín", "Croquetas de pollo", "Sobrasada vegana"
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

console.log("=== SUMMARY ===");
console.log("Total posts in catalogue:", totalPosts);
console.log("Posts with recipes extracted:", fetchedPosts.length);
console.log("Posts NOT yet fetched:", notFetchedPosts.length);
console.log("Total recipes extracted:", totalRecipes);
console.log("\nNot fetched URLs:");
notFetchedPosts.forEach(p => console.log(" -", p.postUrl));
