const coffeeSizes = [
  { id: "small",  label: "Pequeno", price: 0 },
  { id: "medium", label: "Médio",   price: 2 },
  { id: "large",  label: "Grande",  price: 4 }
];

const milkOption = {
  id: "milk",
  label: "Tipo de leite",
  required: true,
  choices: [
    { id: "integral", label: "Integral", price: 0 },
    { id: "veg",      label: "Vegetal",  price: 3 }
  ]
};

const coffeeAddons = [
  { id: "extra_shot", label: "Extra shot", price: 2 }
];

const foodAddons = [
  { id: "extra_cheese", label: "Extra queijo", price: 3 },
  { id: "extra_bacon",  label: "Extra bacon",  price: 4 },
  { id: "molho",        label: "Molho especial", price: 2 }
];

const sweetAddons = [
  { id: "calda_chocolate", label: "Calda de chocolate", price: 2 },
  { id: "calda_caramelo",  label: "Calda de caramelo",  price: 2 },
  { id: "sorvete",         label: "Bola de sorvete",    price: 4 }
];

const menuData = [

  /* ===== CAFÉS CLÁSSICOS ===== */

  {
    id: "espresso",
    name: "Espresso",
    price: 8,
    category: "classicos",
    description: "Dose intensa de café, aroma marcante e sabor encorpado.",
    img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80", 
    
  sizes: coffeeSizes,
  addons: coffeeAddons
  },
  {
    id: "cappuccino",
    name: "Cappuccino Tradicional",
    price: 12,
    category: "classicos",
    description: "Espresso, leite vaporizado e espuma cremosa.",
    img: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=800&q=80",

  sizes: coffeeSizes,
  addons: coffeeAddons
  },
  {
    id: "latte",
    name: "Latte",
    price: 11,
    category: "classicos",
    description: "Café suave com leite cremoso e textura aveludada.",
    img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=800&q=80",

  sizes: coffeeSizes,
  addons: coffeeAddons
  },

  /* ===== CAFÉS ESPECIAIS ===== */

  {
    id: "flatwhite",
    name: "Flat White",
    price: 15,
    category: "especiais",
    description: "Bebida equilibrada com microespuma e sabor sofisticado.",
    img: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=800&q=80",

  sizes: coffeeSizes,
  addons: coffeeAddons
  },
  {
    id: "coldbrew",
    name: "Cold Brew",
    price: 16,
    category: "especiais",
    description: "Extração lenta, sabor suave e refrescante.",
    img: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",

  sizes: coffeeSizes,
  addons: coffeeAddons
  },
  {
    id: "lattepistache",
    name: "Latte Pistache",
    price: 18,
    category: "especiais",
    description: "Cremoso, aromático e assinatura premium da casa.",
    img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",

  sizes: coffeeSizes,
  addons: coffeeAddons
  },

  /* ===== COMIDAS CLÁSSICAS ===== */

  {
    id: "paodequeijo",
    name: "Pão de Queijo",
    price: 8,
    category: "comidas",
    description: "Crocante por fora, macio por dentro. Clássico brasileiro.",
    img: "https://msabores.com/wp-content/uploads/2024/02/Design-sem-nome.webp",

  addons: foodAddons
  },
  {
    id: "coxinha",
    name: "Coxinha Tradicional",
    price: 10,
    category: "comidas",
    description: "Salgado clássico, perfeito para acompanhar um café.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGB13GJVlJ3mi2V1IbJEgJZo8LUMFJoaAPxQ&s",

  addons: foodAddons
  },
  {
    id: "croissant",
    name: "Croissant",
    price: 12,
    category: "comidas",
    description: "Folhado, leve e amanteigado.",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",

  addons: foodAddons
  },

  /* ===== DOCES ===== */

  {
    id: "brownie",
    name: "Brownie",
    price: 14,
    category: "doces",
    description: "Chocolate intenso, textura macia e sabor marcante.",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",

  addons: sweetAddons
  },
  {
    id: "cheesecake",
    name: "Cheesecake",
    price: 14,
    category: "doces",
    description: "Base crocante e creme leve. Calda opcional.",
    img: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80",

  addons: sweetAddons
  }

];