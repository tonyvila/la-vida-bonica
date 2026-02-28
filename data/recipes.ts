export interface Ingredient {
  id: string;
  baseQuantity: number | null;
  unit: string;
  name: string;
  checked: boolean;
}

export interface Step {
  id: string;
  text: string;
  checked: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  image: string;
  thumbnail: string;
  baseServings: number;
  ingredients: Ingredient[];
  steps: Step[];
}

export const recipes: Recipe[] = [
  {
    id: 'costillas-cerdo-horno',
    title: 'Costillas de cerdo al horno',
    summary: 'Costillas de cerdo al horno en papillote. Se tarda poco en preparar, el horno hace el trabajo, y le gustan a pequeños y mayores.',
    image: 'https://lavidabonica.com/wp-content/uploads/2022/07/COSTILLAS.jpg',
    thumbnail: 'https://lavidabonica.com/wp-content/uploads/2022/07/COSTILLAS-300x162.jpg',
    baseServings: 6,
    ingredients: [
      { id: '1', baseQuantity: 2, unit: 'kg de', name: 'costillas de cerdo', checked: false },
      { id: '2', baseQuantity: null, unit: '', name: 'Sal y pimienta', checked: false },
      { id: '3', baseQuantity: 100, unit: 'gr de', name: 'tomate natural triturado', checked: false },
      { id: '4', baseQuantity: 2, unit: 'cucharadas de', name: 'salsa de soja', checked: false },
      { id: '5', baseQuantity: 1, unit: 'cucharada de', name: 'mantequilla a temperatura ambiente', checked: false },
      { id: '6', baseQuantity: 1, unit: 'cucharada de', name: 'tomillo', checked: false },
      { id: '7', baseQuantity: 1, unit: 'cucharada de', name: 'ajo en polvo', checked: false },
      { id: '8', baseQuantity: 1, unit: 'cucharada de', name: 'cebolla en polvo', checked: false },
    ],
    steps: [
      {
        id: '1',
        text: 'Precalentar el horno a 150º. Preparar la salsa mezclando el tomate triturado, salsa de soja, mantequilla, tomillo, ajo en polvo y cebolla en polvo.',
        checked: false,
      },
      {
        id: '2',
        text: 'Extender papel aluminio sobre la bandeja de horno, colocar el costillar, salpimentar y embadurnar con la salsa por ambas caras.',
        checked: false,
      },
      {
        id: '3',
        text: 'Envolver herméticamente el costillar en el papel (técnica papillote) e introducir al horno 90 minutos a 150º.',
        checked: false,
      },
      {
        id: '4',
        text: 'Sacar del horno, subir temperatura a 180º, quitar el papel y hornear 30 minutos más hasta que quede crujiente.',
        checked: false,
      },
    ],
  },
  {
    id: 'salmorejo-sin-pan',
    title: 'Salmorejo sin pan',
    summary: 'Salmorejo sin pan y con menos aceite que la receta original. Más ligero pero igual de sabrosón.',
    image: 'https://lavidabonica.com/wp-content/uploads/2019/06/IMG_20190610_124831-1-1024x641.jpg',
    thumbnail: 'https://lavidabonica.com/wp-content/uploads/2019/06/IMG_20190610_124831-1-1024x641.jpg',
    baseServings: 4,
    ingredients: [
      { id: '1', baseQuantity: 1, unit: 'kg de', name: 'tomates maduros', checked: false },
      { id: '2', baseQuantity: 1, unit: 'diente de', name: 'ajo sin simiente', checked: false },
      { id: '3', baseQuantity: 2, unit: '', name: 'zanahorias', checked: false },
      { id: '4', baseQuantity: 50, unit: 'gr de', name: 'AOVE', checked: false },
      { id: '5', baseQuantity: null, unit: '', name: 'Sal y vinagre de Jérez', checked: false },
      { id: '6', baseQuantity: 2, unit: '', name: 'huevos', checked: false },
      { id: '7', baseQuantity: null, unit: '', name: 'Jamón serrano sin aditivos', checked: false },
    ],
    steps: [
      {
        id: '1',
        text: 'Echar en el vaso los tomates sin pelar y las zanahorias peladas, todo bien lavado y en trozos homogéneos. Añadir el diente de ajo y programar 30 segundos en Vel 5.',
        checked: false,
      },
      {
        id: '2',
        text: 'Bajar la verdura de las paredes del vaso, añadir 25 gr de vinagre de Jérez y una cucharadita de sal y programar 4 minutos en Vel máxima.',
        checked: false,
      },
      {
        id: '3',
        text: 'Una vez pasados los 4 minutos volver a programar en Vel 5 y por el brocal ir añadiendo AOVE (4 cucharadas aprox).',
        checked: false,
      },
      {
        id: '4',
        text: 'Acompañar de huevo cocido y jamón picado. Si se prepara antes, envasar en recipiente hermético y a la nevera.',
        checked: false,
      },
    ],
  },
];
