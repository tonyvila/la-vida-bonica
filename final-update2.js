const fs = require('fs');
const catalogue = JSON.parse(fs.readFileSync('/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json', 'utf8'));

const updates = {
  "https://lavidabonica.com/batch-cooking-expres-tercera-semana-de-diciembre/": [
    "Patatas aliñadas con limón, ajo y tomillo", "Salmón al horno con espárragos",
    "Ensalada de col lombarda con salsa cremosa de yogur", "Cocido",
    "Pisto", "Crema de lentejas y pavo", "Yogures caseros"
  ],
  "https://lavidabonica.com/batch-cooking-expres-segunda-semana-de-diciembre/": [
    "Puré de patatas con toque de tomillo", "Lubina a la naranja",
    "Solomillo de cerdo con salsa de cebolla", "Crema de verduras",
    "Lentejas con quinoa", "Hamburguesas de quinoa y brócoli", "Sobrasada vegana"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-diciembre/": [
    "Coliflor al horno con bechamel de trufa", "Patatas a la riojana con chorizo casero",
    "Pollo en salsa de queso azul", "Lentejas con gambas al curry",
    "Hamburguesas de lentejas", "Pesto de guisantes", "Tarta de calabaza"
  ],
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-noviembre/": [
    "Caballa a la plancha", "Pollo y chorizo con patatas de Jamie Oliver",
    "Garbanzos a la marinera", "Tarta de setas",
    "Crema de verduras con crema de cacahuete", "Hamburguesas",
    "Arroz con leche y anís estrellado"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-noviembre/": [
    "Coliflor al horno", "Pastel de atún y gambas",
    "Ensalada de patatas con garbanzos", "Chorizo casero de pollo",
    "Chili con carne", "Croquetas", "Galletas"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-noviembre/": [
    "Crema de acelgas y zanahorias", "Salmón con hierbas aromáticas",
    "Crema de calabacín", "Garbanzos con boloñesa de carne",
    "Albóndigas de merluza", "Hamburguesas de quinoa y lentejas",
    "Hummus de guisantes", "Tarta de queso"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-noviembre/": [
    "Salmón marinado con naranja y soja", "Pollo y champiñones en salsa de coco",
    "Dhal de lentejas", "Crema de guisantes con curry y manzana",
    "Hamburguesas de pavo", "Paté de lentejas rojas", "Bizcocho"
  ],
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-octubre/": [
    "Hervido de judías verdes con refrito", "Truchas rellenas de cuscús",
    "Pakoras", "Sopa de quinoa con almejas",
    "Guiso de pollo con alubias negras", "Macarrones con paté de anchoas",
    "Hamburguesas de lentejas", "Praliné"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-octubre/": [
    "Pechugas de pollo rellenas con salsa de queso azul y nueces",
    "Ensalada de endibia con granada", "Lentejas con arroz",
    "Fiambre de pollo con calabaza", "Garbanzos en salsa de tomate",
    "Pescado con salsa de piquillos", "Pasta con crema de guisantes",
    "Tarta de alubias con chocolate"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-octubre/": [
    "Bocaditos de espinacas y ricotta", "Dorada a la plancha con vinagreta de pimientos asados",
    "Estofado de pollo", "Crema de champiñones con mantequilla de avellanas",
    "Falafel con pimientos de piquillo", "Hamburguesas",
    "Muhammara", "Magdalenas"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-octubre/": [
    "Crema de manzana y aguacate", "Pescado blanco con leche de coco",
    "Hervido de judías verdes", "Contramuslos de pollo marinados con soja",
    "Albóndigas de soja texturizada con salsa de pimientos asados",
    "Empanadas de carne", "Hamburguesas de berenjena",
    "Mantequilla de avellanas y semillas"
  ],
  "https://lavidabonica.com/batch-cooking-cuarta-semana-de-septiembre/": [
    "Ensalada de atún con manzana", "Tortitas de espinacas con queso",
    "Ensaladilla con mayonesa de aguacate", "Hamburguesas de salmón",
    "Gazpacho con remolacha", "Pollo especiado al horno",
    "Fabes con almejas", "Bombones de plátano"
  ],
  "https://lavidabonica.com/batch-cooking-tercera-semana-de-septiembre/": [
    "Arroz con salmón", "Ensalada de quinoa",
    "Kebabs de pollo marinado con pan de pita",
    "Crema de calabaza", "Lentejas al curry",
    "Arroz caldoso con gambas", "Hamburguesas de alubias",
    "Paté de tomates secos", "Cookies"
  ],
  "https://lavidabonica.com/batch-cooking-segunda-semana-de-septiembre/": [
    "Guiso de salmón", "Ensalada de crudités", "Shakshuka",
    "Lentejas con quinoa", "Pesto de calabacín",
    "Pan casero", "Paté de atún"
  ],
  "https://lavidabonica.com/batch-cooking-primera-semana-de-septiembre/": [
    "Pisto de verduras", "Patatas aliñadas",
    "Bacalao en salsa de almendras", "Fiambre de chorizo vegano",
    "Pollo marinado", "Pasta con bechamel de calabacín",
    "Crema de maíz", "Morrococo"
  ],
  "https://lavidabonica.com/batch-cooking-expres-ultima-semana-de-agosto/": [
    "Berenjenas-pizza", "Quinoa con pavo y verduras",
    "Pavo y patatas al estilo cajún", "Crema de verduras",
    "Sopa de lentejas con leche de coco", "Tzatziki griego",
    "Hamburguesas de garbanzos y pollo"
  ],
  "https://lavidabonica.com/sesion-de-batch-cooking-del-1-al-5-de-julio/": [
    "Arroz con leche de coco y pescado blanco", "Ensalada de cuscús",
    "Salmón al horno con espárragos", "Rollitos de pollo marinado con pan de pita",
    "Bhuja de lentejas", "Tzatziki", "Soja texturizada en salsa"
  ],
  "https://lavidabonica.com/sesion-de-batch-cooking-semana-del-24-a-28-de-junio/": [
    "Merluza a la cazuela", "Gazpacho con remolacha",
    "Ensalada de pasta con lentejas", "Asado de pollo a la naranja",
    "Pollo guisado", "Hamburguesas de quinoa"
  ],
  "https://lavidabonica.com/semana-del-3-al-9-de-diciembre/": [
    "Pimientos asados con especias"
  ]
};

let updated = 0;
for (const entry of catalogue) {
  if (updates[entry.postUrl]) {
    entry.recipes = updates[entry.postUrl];
    updated++;
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

console.log("Updated", updated, "entries");
console.log("=== FINAL SUMMARY ===");
console.log("Total posts:", totalPosts);
console.log("Posts with recipes:", fetchedPosts.length);
console.log("Posts remaining:", notFetchedPosts.length);
console.log("Total recipes:", totalRecipes);
if (notFetchedPosts.length > 0) {
  console.log("\nRemaining URLs:");
  notFetchedPosts.forEach(p => console.log(" -", p.postUrl));
}
