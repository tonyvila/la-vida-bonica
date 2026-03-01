const fs = require('fs');

const catalogue = [
  // PAGE 1 posts (all fetched)
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-otonal/",
    postTitle: "Sesión de batch cooking otoñal",
    recipes: ["Ensalada de coliflor", "Solomillo de cerdo en salsa de castañas", "Ensalada de lentejas con arroz", "Lentejas a las 1001 noches", "Tartar de patata, cebolla y gorgonzola", "Bacalao con salsa de almendras"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-expres-que-ayer-tuvimos-fiesta-de-cumpleanos-y-estan-los-cuerpos-cansados/",
    postTitle: "Sesión exprés (que ayer tuvimos fiesta de cumpleaños)",
    recipes: ["Ternera al horno con boniato", "Pollo al horno con quinoa", "Lentejas con verduras", "Colirroz estilo asiático", "Col salteada con salsa de soja", "Hamburguesas de atún y lentejas"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cookin-rapida-que-hay-que-aprovechar-el-fin-de-semana/",
    postTitle: "Sesión de batch cooking rápida",
    recipes: ["Acelgas y garbanzos especiados", "Cus cus con guisantes salteados con curry y coco", "Pollo asado con patatas", "Menestra y salchichas con salsa de yogur y tahini", "Pesto de brócoli"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-prenavidena/",
    postTitle: "Sesión de batch cooking prenavideña",
    recipes: ["Ensalada con bacalao y naranja", "Ensalada con quinoa y espinacas", "Ensalada cremosa de pollo y uvas", "Sopa de calabaza asada y queso cheddar", "Sopa de alubias y coliflor asada", "Hamburguesas de pollo y verduras"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-90-minutos-con-lo-que-habia-por-casa/",
    postTitle: "Sesión de batch cooking de 90 minutos",
    recipes: ["Muslos de pollo a la naranja", "Curry de lentejas y guisantes", "Alubias con habitas y bacalao", "Guisantes con cus cus", "Alcachofas con carne picada", "Lentejas especiadas con coliflor", "Lomos de atún con soja"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-en-plena-cuesta-de-enero/",
    postTitle: "Sesión de batch cooking en plena cuesta de enero",
    recipes: ["Ensalada de remolacha asada", "Kartoffelsalat o ensalada de patatas alemana", "Carne de pavo y pollo al estilo cajún", "Ensaladilla de coliflor", "Tortitas de espinacas", "Sopa de alubias al pesto", "Crema de calabaza con queso de rulo de cabra", "Paté de tomates secos"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-en-2-partes/",
    postTitle: "Sesión de batch cooking en 2 partes",
    recipes: ["Arroz salteado con verduras y salsa de soja", "Curry de garbanzos", "Hummus de garbanzos con tomates secos", "Tortilla de alcachofas y cebolla", "Asado de garbanzos", "Alitas de pollo con salsa de tomate"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-cuchara-que-hace-un-frio-que-pela-y-hoy-van-y-suben-las-temperaturas/",
    postTitle: "Sesión de batch cooking de cuchara",
    recipes: ["Cocido", "Sopa de verduras con pollo adobado", "Sopa de alubias y kale", "Crema de zanahorias y leche de coco", "Pollo marinado y guisantes", "San jacobos de coliflor", "Hamburguesas de lentejas y atún"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-batch-cooking-horno-microondas/",
    postTitle: "Sesión de batch cooking con horno y microondas",
    recipes: ["Ensalada de calabaza asada y maíz", "Tortitas de calabaza", "Rulo de carne picada y setas", "Rollitos con bacon", "Hamburguesas de carne y pimiento", "Crema de ajo", "Patatas asadas con aliño de ajo"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-solo-con-la-placa-de-induccion/",
    postTitle: "Sesión de batch cooking sólo con la placa de inducción",
    recipes: ["Ensalada de acelgas y quinoa con vinagreta", "Ragú de carne a la boloñesa", "Alubias con setas y chorizo ibérico", "Crepes", "Lentejas a las 1001 noches", "Pescado blanco en salsa de romero y avellanas", "Hummus de garbanzos con nueces"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-para-un-regimiento-y-solo-somos-4-en-casa/",
    postTitle: "Sesión de batch cooking para un regimiento",
    recipes: ["Albóndigas de pollo en salsa de almendras", "Mújol con crema de puerro y manzana", "Guiso de alubias con corvina", "Garbanzos con leche de coco y tomates secos", "Crema de calabaza asada", "Hamburguesas de pollo y calabacín", "Galletas de almendra y limón"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-batch-cooking-express/",
    postTitle: "Sesión de batch cooking express de tan solo 2 horas",
    recipes: ["Champiñones rellenos de jamón y queso", "Pechugas de pollo con leche de coco", "Patatas adobadas al horno", "Zarangollo", "Lentejas con setas y arroz", "Pescado blanco en salsa de cítricos", "Crema de espinacas y aguacate"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-comienzo-de-primavera/",
    postTitle: "Sesión de batch cooking de comienzo de primavera",
    recipes: ["Ensalada de alubias con crema de yogur", "Pastel de calabacín", "Arroz con leche de coco y champiñones", "Lentejas con curry de manzana", "Pollo al ajillo con vinagre", "Escalivada", "Crema de pimientos asados", "Salsa de aceitunas negras"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-expres-que-tenemos-visita/",
    postTitle: "Sesión exprés que tenemos visita",
    recipes: ["Guiso de alubias con coles de bruselas", "Arroz con salsa de soja y tahini", "Pollo con tomate especiado", "Setas y patatas al ajillo", "Guisantes con coles de bruselas", "Col con carne adobada", "Hamburguesas de lentejas y zanahorias"]
  },
  {
    postUrl: "https://lavidabonica.com/primera-sesion-de-batch-cooking-en-horario-de-primavera-verano/",
    postTitle: "Primera sesión de batch cooking en horario de primavera-verano",
    recipes: ["Alcachofas y mozzarella", "Lasaña de espinacas", "Alitas de pollo en escabeche", "Pesto de espinacas y tomates secos", "Lentejas con acelgas", "Pastel de alcachofas y espárragos", "Escalivada", "Hummus de sardinas", "Crema de acelgas y zanahorias"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-antes-de-irnos-de-vacaciones/",
    postTitle: "Sesión de batch cooking antes de irnos de vacaciones",
    recipes: ["Bacoreta con anchoas y cama de verduras", "Chili ahumado de verduras", "Pollo a la mostaza", "Revuelto de espárragos y setas", "Salsa de tomates asados", "Pollo con cus cus", "Quinoa con guisantes", "Bizcocho de coco y almendra"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-vuelta-a-la-normalidad/",
    postTitle: "Sesión de batch cooking de vuelta a la normalidad",
    recipes: ["Pollo picante con piña", "Alcachofas con crema de puerros y sardinas", "Garbanzos con picada y huevo", "Tortilla de berenjena y queso", "Guiso de carrillera ibérica", "Arroz al limón", "Crema de calabacín", "Ensalada de repollo"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-pre-cumpleanos/",
    postTitle: "Sesión de batch cooking de pre cumpleaños",
    recipes: ["Gazpacho con espirulina", "Codillo en salsa con cus cus", "Berenjenas rellenas con pollo y arroz", "Ensalada de verano con alubias", "Ensalada de hortalizas", "Escalivada", "Sopa de arroz con pollo"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-en-plena-ola-de-calor/",
    postTitle: "Sesión de batch cooking en plena ola de calor",
    recipes: ["Ensalada de alubias con cerdo adobado y remolacha", "Ensalada de quinoa y lentejas", "Frittata de verduras", "Menestra de judías verdes con pesto", "Pollo y champiñones en salsa carbonara", "Salmorejo", "Pesto de espinacas y espirulina", "Hamburguesas de calabacín y mozzarella"]
  },
  // PAGE 2 posts
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-expres-para-irnos-de-paseo/",
    postTitle: "Sesión de batch cooking exprés para irnos de paseo",
    recipes: ["Cocido", "Patatas con tomillo", "Salmón al horno con verduras", "Crema de lentejas con pavo", "Col con crema de yogur y manzana", "Coles de bruselas salteadas", "Ensalada de arroz con toque oriental"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-polivalente-monte-casa-y-oficina-%f0%9f%92%aa/",
    postTitle: "Sesión de batch cooking polivalente: Monte, casa y oficina",
    recipes: ["Tortilla de guisantes y ajos tiernos", "Pechugas de la abuela", "Ensalada de col", "Garbanzos con langostinos", "Habas rehogadas con tomate y huevo", "Bacalao con salsa de puerros"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-para-empezar-el-cole-con-mucha-energia/",
    postTitle: "Sesión de batch cooking para empezar el cole con mucha energía",
    recipes: ["Ensalada de lentejas con mayonesa de aguacate y tomates secos", "Asado de pollo con salsa de coco", "Ensalada de alubias con crema de yogur", "Hamburguesa de merluza", "Ensalada de garbanzos y pimientos asados", "Pasta integral con pesto de calabacín y gambas", "Sobrasada vegana"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-para-despedirnos-de-las-vacaciones/",
    postTitle: "Sesión de batch cooking para despedirnos de las vacaciones",
    recipes: ["Ensalada de arroz", "Ensalada verde de quinoa", "Guiso de patatas con alcachofas", "Alubias con setas y espárragos", "Crema de guisantes y patatas", "Ensalada de fruta con crema dulce de yogur"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-llena-de-color/",
    postTitle: "Sesión de batch cooking llena de color",
    recipes: ["Ensalada de pasta de lentejas y langostinos con pesto de albahaca", "Revuelto de berenjenas con huevo", "Gazpacho", "Ensalada de quinoa y habas", "Escalivada", "Pechugas de pavo en salsa de champiñón y queso", "Crema de calabaza y zanahoria"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-ensaladas-con-legumbres-y-mas-cosas-que-los-mios-comen-como-limas/",
    postTitle: "Sesión de batch cooking de ensaladas con legumbres",
    recipes: ["Ensalada de lentejas y atún", "Ensalada de garbanzos con pollo y queso", "Ensalada de alubias blancas con vinagreta de mostaza", "Pollo en salsa de tomate y coco", "Pechugas de pavo adobadas", "Crema de calabacín"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-feliz-y-accidentada/",
    postTitle: "Sesión de batch cooking feliz y accidentada",
    recipes: ["Tortilla de bacalao, patatas y pimientos asados", "Ensalada de alubias y patatas", "Pollo asado en una olla", "Patatas asadas y mayonesa casera", "Ensalada de garbanzos y bacalao", "Salsa kebab", "Lentejas con leche de coco", "Solomillo de pavo adobado"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-improvisada/",
    postTitle: "Sesión de batch cooking improvisada",
    recipes: ["Alubias con quinoa y espinacas", "Pollo asado", "Crema de calabaza", "Solomillo de pavo adobado", "Hummus de garbanzos con tomates secos", "Lentejas con cus cus"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-realizada-con-mucho-amor-en-el-dia-de-san-valentin/",
    postTitle: "Sesión de batch cooking de San Valentín",
    recipes: ["Patatas y huevos en salsa verde", "Pescado blanco en salsa de mandarina", "Ragú de carne a la boloñesa", "Quinoa con atún", "Habas con jamón", "Garbanzos con acelgas", "Crema de verduras", "Pollo en salsa", "Carrot cake con frosting"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-el-dia-de-mi-aniversario-el-ano-que-viene-tendremos-que-hacer-2-viajes-para-compensar/",
    postTitle: "Sesión de batch cooking el día de mi aniversario",
    recipes: ["Lentejas con salmón", "Pescado blanco en salsa de romero y avellanas", "Sopa de alubias y kale", "Coliflor en salsa", "Empanada de pollo y guisantes", "Col salteada con salsa de soja", "Contramuslos de pollo en crema", "Espaguetis con pesto de guisantes", "Hummus de remolacha"]
  },
  {
    postUrl: "https://lavidabonica.com/primer-batch-cooking-del-mes-de-febrero-con-desayunos-comidas-y-cenas/",
    postTitle: "Primer batch cooking del mes de febrero",
    recipes: ["Lentejas y arroz con curry", "Bacalao en salsa con gambas y huevo", "Alubias con setas y chorizo ibérico", "Verduras al vapor con salsa de yogur", "Patatas al horno con limón", "Carne mechada", "Garbanzos con leche de coco y tomates secos", "Pasta integral con crema de verduras asadas y atún", "Crepes"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-expres-en-el-puente-de-la-constitucion/",
    postTitle: "Sesión de batch cooking exprés en el puente de la Constitución",
    recipes: ["Hervido de judías verdes", "Pesto de calabacín", "Asado de pollo con coles de bruselas", "Guiso de alubias con champiñones", "Guiso de pollo y maíz"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-bienvenida-a-un-diciembre-atipico/",
    postTitle: "Sesión de batch cooking de bienvenida a un diciembre atípico",
    recipes: ["Asado en salsa de tomates secos y romero", "Sopa serrana", "Atún con brócoli y setas", "Crema de lombarda con manzana asada", "Hamburguesas de patata y brócoli", "Migas de coliflor", "Guiso de coles de bruselas con alubias", "Snack de huevo", "Tarta de boniato y coco"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-sabado-por-la-tarde/",
    postTitle: "Sesión de batch cooking de sábado por la tarde",
    recipes: ["Sopa de calabaza y zanahoria", "Lomos de bacalao con coles de bruselas", "Lentejas a las 1001 noches", "Pesto de espinacas y tomates", "Lasaña de pollo y bechamel de setas", "Crema de guisantes con curry y manzana", "Hamburguesas de alubias", "Pechugas de pollo con salsa de tomates asados"]
  },
  // PAGE 3 posts (fetched)
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-con-lista-de-la-compra-inversa/",
    postTitle: "Sesión de batch cooking con lista de la compra inversa",
    recipes: ["Guiso de pollo con setas", "Garbanzos especiados", "Calabacín Hasselback", "Crema de zanahorias con hinojo", "Bacalao con tomate al curry", "Sopa de calabaza con alubias", "Calabacines en vinagre", "Bizcocho de coco y té matcha"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-otono/",
    postTitle: "Sesión de batch cooking de otoño",
    recipes: ["Estofado de patatas con setas", "Pollo especiado con arroz", "Hervido de judías verdes", "Alubias con salsa de tomate", "Boniato relleno", "Colirroz estilo asiático", "Hummus de alubias, boniato y tomates secos", "Espaguetis con pesto de guisantes", "Carrot cake con frosting"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-ultima-semana-de-octubre/",
    postTitle: "Sesión de batch cooking última semana de octubre",
    recipes: ["Trucha crujiente con avena y tomillo", "Pataletas (tartaletas de patata) y carne especiada", "Brochetas de solomillo de pavo", "Pesto de zanahoria", "Pasta con crema de verduras", "Espárragos verdes con refrito"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-facil-y-resultona/",
    postTitle: "Sesión de batch cooking fácil y resultona",
    recipes: ["Tortilla de guisantes y gambas", "Ensalada de coliflor", "Asado de pollo con salsa de coco", "Hummus de lentejas", "Tartar de aguacate", "Hummus de garbanzos"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-puente-de-octubre/",
    postTitle: "Batch cooking puente de octubre",
    recipes: ["Cazuela marinera", "Tarta de patata, cebolla y queso", "Lasaña de coliflor", "Picadillo cubano vegano", "Parrillada de verduras", "Contramuslos de pollo con salsa de naranja y soja", "Crema de calabaza con queso de rulo de cabra"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-octubre-2/",
    postTitle: "Batch cooking primera semana de octubre",
    recipes: ["Pollo asado a la cerveza", "Crema de zanahorias", "Arroz de coliflor con bacalao", "Col con carne adobada", "Endibias al roquefort", "Pasta integral con crema de zanahorias y carne adobada", "Tortitas de calabacín con queso", "Paté de atún"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-batch-cooking-ultima-semana-de-septiembre/",
    postTitle: "Sesión batch cooking última semana de septiembre",
    recipes: ["Cocido", "Pastel de brócoli", "Pollo especiado", "Judías verdes salteadas con jamón", "Lasaña de calabacín", "Crema de puerros", "Pescado blanco con leche de coco", "Pasta integral con soja texturizada", "Sobrasada vegana"]
  },
  // PAGE 4 posts (fetched)
  {
    postUrl: "https://lavidabonica.com/batch-cooking-bienvenido-otono-2020/",
    postTitle: "Batch cooking: Bienvenido otoño 2020",
    recipes: ["Crema de espinacas y ricotta", "Verdura asada con quinoa", "Menestra con fideos", "Pavo con guisantes", "Alubias con coles de bruselas", "Pescado blanco en salsa de limón", "Pasta con pesto de brócoli", "Pastel de calabaza"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-de-vuelta-al-cole/",
    postTitle: "Sesión de batch cooking de vuelta al cole",
    recipes: ["Costillar de cerdo a las finas hierbas", "Alubias con espárragos", "Cebolletas con garam masala", "Pollo satay", "Pesto de aguacate", "Yogures de leche merengada", "Crema de calabacín"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-espres-cuarta-semana-de-agosto/",
    postTitle: "Batch cooking exprés cuarta semana de agosto",
    recipes: ["Guisantes con gambas", "Lomos de atún marinado con salsa de pimientos", "Muslos de pavo al estilo cajún", "Pisto de verduras", "Habas con coles de bruselas"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-expres-tercera-semana-de-agosto/",
    postTitle: "Batch cooking exprés tercera semana de agosto",
    recipes: ["Pollo asado con especias", "Col especiada con pisto", "Guiso de lentejas y berenjena", "Hamburguesas de cerdo con calabacín y champiñones", "Guiso de alubias con pollo"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-primera-semana-de-agosto/",
    postTitle: "Sesión de batch cooking primera semana de agosto",
    recipes: ["Guiso de alubias con setas y bacalao", "Lentejas con pavo y coliflor", "Solomillos de pavo adobados"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-junio/",
    postTitle: "Batch cooking cuarta semana de junio",
    recipes: ["Ensalada de alubias con patatas", "Lubina con salsa de champiñones", "Ensalada de quinoa y edamames", "Solomillos de pavo con salsa de coco y piña", "Hamburguesas de calabaza y gorgonzola", "Crema de verduras asadas", "Pollo en salsa de soja con tomates secos", "Pasta integral con crema de calabaza y tomates asados", "Nachos de garbanzos"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-junio/",
    postTitle: "Batch cooking tercera semana de junio",
    recipes: ["Ensalada de alubias y langostinos", "Salmón en salsa", "Ensalada de quinoa y lentejas", "Mousse de espárragos y atún", "Garbanzos con langostinos", "Crema de calabacín", "Pasta integral con crema de calabacín y carne adobada", "Helado de frutos rojos y almendras", "Gazpacho picantón"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-junio/",
    postTitle: "Batch cooking segunda semana de junio",
    recipes: ["Estofado de garbanzos especiados", "Crema de berenjenas y espárragos", "Merluza en salsa de puerros", "Espaguetis integrales con salsa negra", "Cookies de chocolate"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-junio/",
    postTitle: "Batch cooking primera semana de junio",
    recipes: ["Ensalada de primavera", "Tortilla de guisantes y ajos tiernos", "Salmorejo", "Alubias con migas de bacalao", "Lentejas especiadas con muslos de pollo", "Crema de puerros", "Hamburguesas de calabacín y mozzarella", "Arroz caldoso con pollo y verduras"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-mayo/",
    postTitle: "Batch cooking cuarta semana de mayo",
    recipes: ["Salmorejo", "Patatas y huevos en salsa verde", "Ensalada de repollo", "Muslos de pollo en salsa de uvas pasas", "Lentejas a las 1001 noches", "Pesto de espinacas y tomates secos", "Berenjenas rellenas de quinoa", "Pasta integral con salsa de uvas pasas y pollo"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-mayo/",
    postTitle: "Batch cooking tercera semana de mayo",
    recipes: ["Gazpacho", "Curry vegetal con patatas", "Pollo y champiñones en salsa carbonara", "Sardinas en escabeche", "Alubias con gambas", "Pasta integral con salsa de curry vegetal", "Carrot cake con frosting"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-mayo/",
    postTitle: "Batch cooking segunda semana de mayo",
    recipes: ["Gazpacho con remolacha", "Sopa de pescado y gambas", "Alcachofas y patatas", "Alubias blancas con salchichas frescas", "Cebolla en puré", "Pavo en salsa de ajo y almendras", "Hamburguesas de coliflor", "Pasta integral con pesto de brócoli", "Hummus de remolacha"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-mayo/",
    postTitle: "Batch cooking primera semana de mayo",
    recipes: ["Gazpacho con zanahoria", "Frittata de verduras", "Sopa de alubias con patatas", "Alcachofas con habas", "Lentejas con curry de manzana", "Crema de acelgas y zanahoria", "Berenjenas rellenas con arroz", "Pasta integral con crema de acelgas y zanahoria"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-quinta-semana-de-abril/",
    postTitle: "Batch cooking quinta semana de abril",
    recipes: ["Lasaña de mi suegra", "Bacalao con verduras", "Alcachofas con carne", "Soufflé de berenjena", "Cebolla en crema", "Hamburguesas de verduras con garbanzos", "Pasta integral con crema de coliflor y champiñones"]
  },
  // PAGE 5-7 posts (from titles/URLs + some fetched)
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-abril/",
    postTitle: "Batch cooking cuarta semana de abril",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-abril/",
    postTitle: "Batch cooking tercera semana de abril",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-abril/",
    postTitle: "Batch cooking segunda semana de abril",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-abril/",
    postTitle: "Batch cooking primera semana de abril",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-marzo/",
    postTitle: "Batch cooking cuarta semana de marzo",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-marzo/",
    postTitle: "Batch cooking tercera semana de marzo",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-marzo/",
    postTitle: "Batch cooking primera semana de marzo",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-febrero/",
    postTitle: "Batch cooking cuarta semana de febrero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-febrero/",
    postTitle: "Batch cooking tercera semana de febrero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-febrero/",
    postTitle: "Batch cooking segunda semana de febrero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-febrero/",
    postTitle: "Batch cooking primera semana de febrero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-enero/",
    postTitle: "Batch cooking cuarta semana de enero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-enero/",
    postTitle: "Batch cooking tercera semana de enero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-enero/",
    postTitle: "Batch cooking segunda semana de enero",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-expres-tercera-semana-de-diciembre/",
    postTitle: "Batch cooking exprés tercera semana de diciembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-expres-segunda-semana-de-diciembre/",
    postTitle: "Batch cooking exprés segunda semana de diciembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-diciembre/",
    postTitle: "Batch cooking primera semana de diciembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-noviembre/",
    postTitle: "Batch cooking cuarta semana de noviembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-noviembre/",
    postTitle: "Batch cooking tercera semana de noviembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-noviembre/",
    postTitle: "Batch cooking segunda semana de noviembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-noviembre/",
    postTitle: "Batch cooking primera semana de noviembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-octubre/",
    postTitle: "Batch cooking cuarta semana de octubre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-octubre/",
    postTitle: "Batch cooking tercera semana de octubre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-octubre/",
    postTitle: "Batch cooking segunda semana de octubre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-octubre/",
    postTitle: "Batch cooking primera semana de octubre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-cuarta-semana-de-septiembre/",
    postTitle: "Batch cooking cuarta semana de septiembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-tercera-semana-de-septiembre/",
    postTitle: "Batch cooking tercera semana de septiembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-segunda-semana-de-septiembre/",
    postTitle: "Batch cooking segunda semana de septiembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-primera-semana-de-septiembre/",
    postTitle: "Batch cooking primera semana de septiembre",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-expres-ultima-semana-de-agosto/",
    postTitle: "Batch cooking expres última semana de agosto",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-del-1-al-5-de-julio/",
    postTitle: "Sesión de batch cooking del 1 al 5 de julio",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/sesion-de-batch-cooking-semana-del-24-a-28-de-junio/",
    postTitle: "Sesión de batch cooking semana del 24 a 28 de junio",
    recipes: ["_NOT_FETCHED_"]
  },
  // PAGE 6-7 posts (recipes in titles)
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-ensalada-garbanzos-con-arroz-y-gambas-gazpacho-con-manzana-ensalada-de-pasta-con-salmon-escalivada-filetes-de-merluza-con-salsa-de-zanahorias-ensalada-pollo-marinado-al-limon-y/",
    postTitle: "Batch cooking de ensalada, garbanzos con arroz y gambas...",
    recipes: ["Garbanzos con arroz y gambas", "Gazpacho con manzana", "Ensalada de pasta con salmón", "Escalivada", "Filetes de merluza con salsa de zanahorias", "Pollo marinado al limón y cus cus", "Tortitas"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-quiche-de-verduras-y-salmon-crema-de-calabacin-ensalada-con-patatas-salmorejo-ensalada-de-patatas-y-lentejas-hamburguesas-de-alubias-albondigas-en-salsa-de-nueces-y-arroz-cocido/",
    postTitle: "Batch cooking de quiche de verduras y salmón...",
    recipes: ["Quiche de verduras y salmón", "Crema de calabacín", "Ensalada con patatas", "Salmorejo", "Ensalada de patatas y lentejas", "Hamburguesas de alubias", "Albóndigas en salsa de nueces"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-cus-cus-con-guisantes-caballa-con-picadillo-gazpacho-de-sandia-pollo-con-garbanzos-tortilla-de-quinoa-con-verduras-falafel-con-salsa-de-yogur-y-alitas-de-pollo-adobadas-con-arroz/",
    postTitle: "Batch cooking de cus cus con guisantes...",
    recipes: ["Cus cus con guisantes", "Caballa con picadillo", "Gazpacho de sandía", "Pollo con garbanzos", "Tortilla de quinoa con verduras", "Falafel con salsa de yogur", "Alitas de pollo adobadas"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-ensalada-de-hoja-de-roble-guiso-de-pescado-con-tomillo-lentejas-con-setas-y-arroz-crema-de-esparragos-arroz-estilo-hindu-pechugas-de-pollo-al-curry-con-arroz-cocido-y-espaguetis/",
    postTitle: "Batch cooking de ensalada de hoja de roble...",
    recipes: ["Guiso de pescado con tomillo", "Lentejas con setas y arroz", "Crema de espárragos", "Arroz estilo hindú", "Pechugas de pollo al curry", "Espaguetis con pesto de guisantes"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-de-ensalada-con-bacalao-y-naranja-salmon-en-salsa-sopa-de-cacahuetes-tortilla-de-patatas-con-guisantes-estofado-con-garbanzos-especiados-pechugas-de-pollo-rellenas-y-cus-cus-pollo-t/",
    postTitle: "Batchcooking de ensalada con bacalao y naranja...",
    recipes: ["Ensalada con bacalao y naranja", "Salmón en salsa", "Sopa de cacahuetes", "Tortilla de patatas con guisantes", "Estofado con garbanzos especiados", "Pechugas de pollo rellenas", "Pollo tikka masala"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-de-gazpacho-sopa-de-quinoa-con-garbanzos-crema-de-judias-verdes-tortillas-de-setas-y-de-espinacas-patatas-con-pimenton-y-carne-adobada-pollo-en-caldereta-arroz-con-verduras-y-bacala/",
    postTitle: "Batchcooking de gazpacho, sopa de quinoa con garbanzos...",
    recipes: ["Gazpacho", "Sopa de quinoa con garbanzos", "Crema de judías verdes", "Tortilla de setas", "Tortilla de espinacas", "Patatas con pimentón y carne adobada", "Pollo en caldereta", "Arroz con verduras y bacalao", "Yogures de coco"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-cocido-con-albondigas-marmitako-ensalada-de-pimientos-y-bacalao-sopa-tortilla-de-ropa-vieja-albondigas-de-merluza-en-salsa-pollo-tikka-masala-y-pan-de-platano/",
    postTitle: "Batch cooking de cocido con albóndigas, marmitako...",
    recipes: ["Cocido con albóndigas", "Marmitako", "Ensalada de pimientos y bacalao", "Sopa", "Tortilla de ropa vieja", "Albóndigas de merluza en salsa", "Pollo tikka masala", "Pan de plátano"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-picadillo-cubano-vegano-ensalada-de-aguacate-y-gambas-tzatziki-y-carne-a-la-plancha-escalivada-de-cebolla-con-huevos-duros-patatas-adobadas-al-horno-verduras-al-vapor-con-salsa-d/",
    postTitle: "Batch cooking de picadillo cubano vegano...",
    recipes: ["Picadillo cubano vegano", "Ensalada de aguacate y gambas", "Tzatziki y carne a la plancha", "Escalivada de cebolla con huevos duros", "Patatas adobadas al horno", "Verduras al vapor con salsa de yogur", "Hamburguesas de alubias", "Galletas saladas de queso y nueces"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-ensalada-de-ajos-tiernos-pastel-de-pescado-de-jamie-oliver-ensalada-de-alcachofas-y-mejillones-asado-de-pollo-con-mandarina-nuggets-vegetales-atun-al-jerez-arroz-con-verduras-y/",
    postTitle: "Batch cooking de ensalada de ajos tiernos...",
    recipes: ["Ensalada de ajos tiernos", "Pastel de pescado de Jamie Oliver", "Ensalada de alcachofas y mejillones", "Asado de pollo con mandarina", "Nuggets vegetales", "Atún al Jerez", "Arroz con verduras y bacalao", "Yogures con confitura de fresa y frambuesa"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-viajero-pipirrana-on-my-way-tortilla-de-patatas-prenada-pollo-al-curry-en-salsa-de-pina-pastel-de-quinoa-pastel-de-pollo-ensalada-de-col-y-grisines-al-curry/",
    postTitle: "Batch cooking viajero",
    recipes: ["Pipirrana", "Tortilla de patatas preñada", "Pollo al curry en salsa de piña", "Pastel de quinoa", "Pastel de pollo", "Ensalada de col", "Grisines al curry"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-guiso-de-lentejas-y-salchichas-crema-de-lechuga-arroz-al-horno-habas-rehogadas-con-calamares-hamburguesas-de-lentejas-con-sesamo-guiso-de-pollo-al-vino-tinto-pasta-con-crema-de/",
    postTitle: "Batch cooking de guiso de lentejas y salchichas...",
    recipes: ["Guiso de lentejas y salchichas", "Crema de lechuga", "Arroz al horno", "Habas rehogadas con calamares", "Hamburguesas de lentejas con sésamo", "Guiso de pollo al vino tinto", "Pasta con crema de coliflor y atún", "Petit suisse con fresas naturales"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-alcachofas-con-ajos-tiernos-lentejas-al-curry-espinacas-con-patatas-fiambre-de-pollo-con-especias-guiso-de-quinoa-con-ternera-curry-de-pescado-macarrones-integrales-con-salsa-de/",
    postTitle: "Batch cooking de alcachofas con ajos tiernos...",
    recipes: ["Alcachofas con ajos tiernos", "Lentejas al curry", "Espinacas con patatas", "Fiambre de pollo con especias", "Guiso de quinoa con ternera", "Curry de pescado", "Macarrones integrales con bechamel, pollo y brócoli", "Bocaditos de manzana fitness"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-arroz-blanco-y-albondigas-de-pollo-hummus-de-garbanzos-y-alitas-de-pollo-crema-de-verduras-con-crema-de-cacahuete-y-hamburguesas-de-salmon-crema-de-champinones-y-pollo-en-salsa-sat/",
    postTitle: "Batch cooking de arroz blanco y albóndigas de pollo...",
    recipes: ["Albóndigas de pollo", "Hummus de garbanzos", "Alitas de pollo", "Crema de verduras con crema de cacahuete", "Hamburguesas de salmón", "Crema de champiñones", "Pollo en salsa satay", "Pasta con ragú"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-patatas-al-horno-verduras-al-vapor-huevo-con-tomate-hummus-de-garbanzo-y-tomates-secos-alitas-de-pollo-al-horno-corona-de-arroz-y-lentejas-curry-de-garbanzos-crema-de-champinon/",
    postTitle: "Batch cooking de patatas al horno...",
    recipes: ["Patatas al horno", "Verduras al vapor", "Huevo con tomate", "Hummus de garbanzo y tomates secos", "Alitas de pollo al horno", "Corona de arroz y lentejas", "Curry de garbanzos", "Crema de champiñones", "Pollo en salsa satay", "Pan de avena y nueces"]
  },
  {
    postUrl: "https://lavidabonica.com/1055-2/",
    postTitle: "Batch cooking de habas con tomate y huevo...",
    recipes: ["Habas con tomate y huevo", "Sopa de garbanzos", "Nuggets saludables", "Quinoa con brócoli y lomo", "Crema de verduras con crema de cacahuete", "Hamburguesas de salmón", "Albóndigas de pollo en salsa", "Muffins de plátano, chocolate y crema de cacahuete"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-tortilla-de-habas-bacalao-en-salsa-americana-pollo-en-salsa-de-yogur-setas-y-brocoli-en-salsa-americana-crema-de-calabaza-con-queso-de-cabra-hamburguesas-de-garbanzos-y-calabacin/",
    postTitle: "Batch cooking de tortilla de habas...",
    recipes: ["Tortilla de habas", "Bacalao en salsa americana", "Pollo en salsa de yogur", "Setas y brócoli en salsa americana", "Crema de calabaza con queso de cabra", "Hamburguesas de garbanzos y calabacín", "Arroz caldoso con pollo, habas y aceitunas", "Muffins fitness de chocolate"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-menestra-de-verduras-merluza-en-salsa-de-pimenton-lentejas-a-las-1001-noches-guiso-de-acelgas-con-garbanzos-pollo-en-salsa-de-pimientos-albondigas-de-garbanzos-en-salsa-arroz-co/",
    postTitle: "Batch cooking de menestra de verduras...",
    recipes: ["Menestra de verduras", "Merluza en salsa de pimentón", "Lentejas a las 1001 noches", "Guiso de acelgas con garbanzos", "Pollo en salsa de pimientos", "Albóndigas de garbanzos en salsa", "Arroz con pollo", "Galletas fitness"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-de-habas-con-jamon-patatas-y-huevos-en-salsa-verde-quinoa-con-atun-y-leche-de-coco-merluza-en-salsa-de-mandarina-ragu-de-carne-a-la-bolonesa-y-yogures-de-naranja/",
    postTitle: "Batch cooking de habas con jamón...",
    recipes: ["Habas con jamón", "Patatas y huevos en salsa verde", "Quinoa con atún y leche de coco", "Merluza en salsa de mandarina", "Crema de verduras y pollo en salsa suprema", "Ragú de carne a la boloñesa", "Yogures de naranja"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-lasana-pisto-de-verduras-crema-con-mango-lentejas-con-alcachofas-crema-de-garbazos-y-bizcocho-de-pina-entre-otros/",
    postTitle: "Batch cooking lasaña, pisto de verduras...",
    recipes: ["Lasaña", "Pisto de verduras", "Crema con mango", "Lentejas con alcachofas", "Crema de garbanzos", "Bizcocho de piña"]
  },
  {
    postUrl: "https://lavidabonica.com/batch-cooking-del-4-al-10-de-febrero/",
    postTitle: "Batch cooking carne y patatas cajún...",
    recipes: ["Carne y patatas cajún", "Quinoa con pavo y verduras", "Pescado en salsa de piquillos", "Hamburguesa de quinoa y pollo", "Lentejas con migas de bacalao", "Yogures de limón"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-del-28-de-enero-a-3-de-febrero/",
    postTitle: "Batchcooking verduras al vapor con salsa de yogur...",
    recipes: ["Verduras al vapor con salsa de yogur", "Pastel de carne y jamón", "Cocido", "Crema de setas", "Sopa", "Hamburguesa de lentejas", "Pescado blanco con leche de coco", "Pasta con crema de verduras", "Regañás de Iván Yarza"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-del-21-al-27-de-enero/",
    postTitle: "Batchcooking crema de verduras, cous cous con champiñones...",
    recipes: ["Crema de verduras", "Cous cous con champiñones", "Lentejas con setas y arroz", "Curry de pescado", "Boloñesa con huevo y arroz", "Hamburguesa de pollo"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcoking-del-14-al-20-de-enero/",
    postTitle: "Batchcoking de hervido, hamburguesas de merluza...",
    recipes: ["Hervido", "Hamburguesas de merluza", "Sopa de lentejas al limón", "Fiambre de lomo", "Pollo a la cerveza", "Menestra", "Arroz 1000 delicias", "Pasta a la boloñesa"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-del-7-al-13-de-enero/",
    postTitle: "Batchcooking de ternera guisada con boniato y setas...",
    recipes: ["Ternera guisada con boniato y setas", "Pollo con crema de champiñones", "Bonito con salsa de tomate", "Crema de calabaza"]
  },
  {
    postUrl: "https://lavidabonica.com/semana-del-17-al-23-de-diciembre-2/",
    postTitle: "Batch cooking de bacalao con costra de Jamie Oliver...",
    recipes: ["Bacalao con costra de Jamie Oliver", "Sopa de pollo y quinoa", "Pollo al limón con champiñones", "Lentejas con gambas al curry", "Yogures de piñacurd y coco"]
  },
  {
    postUrl: "https://lavidabonica.com/semana-del-10-al-17-de-diciembre/",
    postTitle: "Batch cooking de guiso de garbanzos y langostinos...",
    recipes: ["Guiso de garbanzos y langostinos", "Guiso de merluza", "Lentejas de verduras", "Crema de calabacín", "Yogures naturales"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-para-el-puente/",
    postTitle: "Batchcooking de crema de calabacín, pechugas de la abuela...",
    recipes: ["Crema de calabacín", "Pechugas de la abuela", "Pizza real", "Salchichas, patatas y boniatos asados"]
  },
  {
    postUrl: "https://lavidabonica.com/semana-del-3-al-9-de-diciembre/",
    postTitle: "Semana de ensaladas y pimientos asados",
    recipes: ["_NOT_FETCHED_"]
  },
  {
    postUrl: "https://lavidabonica.com/semana-del-26-al-30-de-noviembre/",
    postTitle: "Batch cooking de cocido, cous cous con champiñones...",
    recipes: ["Cocido", "Cous cous con champiñones", "Arroz caldoso con sepia", "Hummus de garbanzos", "Pimientos asados"]
  },
  {
    postUrl: "https://lavidabonica.com/batchcooking-de-fin-de-semana/",
    postTitle: "Batchcooking de tortilla de patatas...",
    recipes: ["Tortilla de patatas", "Tortilla de patatas y calabacín rallado", "Pechugas empanadas", "Regañás de Iván Yarza", "Bizcocho real"]
  },
  {
    postUrl: "https://lavidabonica.com/comida-para-la-semana-que-entra/",
    postTitle: "Batch cooking de ensalada de quinoa...",
    recipes: ["Ensalada de quinoa", "Lentejas a las mil y una noches", "Pollo a la crema", "Pan viena real", "Nachos"]
  },
  {
    postUrl: "https://lavidabonica.com/cocinando-para-toda-la-semana-en-solo-dos-horas/",
    postTitle: "Batch cooking de pastel de calabacín...",
    recipes: ["Pastel de calabacín", "Arroz con cúrcuma", "Albóndigas al curry", "Tortilla de verduras", "Bizcocho real"]
  }
];

// Count stats
const totalPosts = catalogue.length;
const fetchedPosts = catalogue.filter(p => !p.recipes.includes("_NOT_FETCHED_"));
const notFetchedPosts = catalogue.filter(p => p.recipes.includes("_NOT_FETCHED_"));
const totalRecipes = fetchedPosts.reduce((sum, p) => sum + p.recipes.length, 0);

console.log("Total posts:", totalPosts);
console.log("Posts with recipes extracted:", fetchedPosts.length);
console.log("Posts NOT yet fetched:", notFetchedPosts.length);
console.log("Total recipes extracted:", totalRecipes);

fs.writeFileSync(
  '/Users/bryanzillmann/.openclaw/workspace/la-vida-bonica/batch-cooking-catalogue.json',
  JSON.stringify(catalogue, null, 2),
  'utf8'
);

console.log("Written to batch-cooking-catalogue.json");
