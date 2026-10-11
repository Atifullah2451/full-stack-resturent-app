/**
 * Firestore Database Seeder Script
 * Inserts 18 premium restaurant menu items with categories, images, and prices.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */
require('dotenv').config();
const { db, admin } = require('../src/config/firebaseAdmin');

const seedItems = [
  // 1. BURGERS
  {
    name: 'Truffle Angus Burger',
    description: 'Juicy 100% Angus beef patty, black truffle aioli, aged Vermont cheddar, caramelized shallots on toasted brioche.',
    price: 15.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 780,
    preparationTime: '15-20 min',
    tags: ['Popular', 'Chef Special', 'Beef']
  },
  {
    name: 'Smoky BBQ Bacon Burger',
    description: 'Applewood smoked bacon, double cheddar, tangy bourbon barbecue reduction, crispy fried tobacco onions.',
    price: 14.50,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 820,
    preparationTime: '15 min',
    tags: ['Smoky', 'Bacon']
  },
  {
    name: 'Crispy Nashville Hot Chicken Burger',
    description: 'Southern buttermilk fried chicken thigh tossed in fiery Cayenne butter, house pickles, cool garlic slaw.',
    price: 13.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 710,
    preparationTime: '15 min',
    tags: ['Spicy', 'Poultry']
  },
  {
    name: 'Avocado Green Goddess Veggie Burger',
    description: 'House-made quinoa and black bean patty, crushed hass avocado, pickled red onions, microgreens, green goddess dressing.',
    price: 13.50,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.6,
    calories: 540,
    preparationTime: '12 min',
    tags: ['Vegetarian', 'Healthy']
  },

  // 2. PIZZA
  {
    name: 'Artisan Margherita Pizza',
    description: 'Slow-fermented dough, San Marzano tomato pulp, creamy Fior di Latte mozzarella, hand-torn basil, extra virgin olive oil.',
    price: 16.50,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 650,
    preparationTime: '20 min',
    tags: ['Classic', 'Vegetarian', 'Woodfired']
  },
  {
    name: 'Diavola Hot Pepperoni Crunch',
    description: 'Spicy artisanal Calabrian pepperoni, whole milk mozzarella, hot chili wildflower honey, fresh oregano.',
    price: 18.00,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 780,
    preparationTime: '20 min',
    tags: ['Spicy', 'Crowd Favorite']
  },
  {
    name: 'Wild Truffle Forest Pizza',
    description: 'Roasted cremini & shiitake mushrooms, melted fontina cheese, fresh rosemary, white truffle cream drizzle.',
    price: 19.50,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 720,
    preparationTime: '20 min',
    tags: ['Vegetarian', 'Gourmet']
  },
  {
    name: 'Prosciutto e Rucola Pizza',
    description: 'Aged 18-month Prosciutto di Parma, shaved Parmigiano Reggiano, organic baby arugula, balsamic glaze reduction.',
    price: 20.00,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 700,
    preparationTime: '20 min',
    tags: ['Chef Pick']
  },

  // 3. PASTA
  {
    name: 'Creamy Tagliatelle Carbonara',
    description: 'Traditional Roman recipe with crisp cured guanciale, rich farm egg yolk cream, aged Pecorino Romano, fresh cracked pepper.',
    price: 17.50,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 690,
    preparationTime: '15 min',
    tags: ['Classic', 'Italian']
  },
  {
    name: 'Tuscan Rigatoni Bolognese',
    description: 'Six-hour simmered prime beef and pork ragù, soffritto herbs, plum tomatoes, generous snow of 24-month Parmigiano.',
    price: 18.50,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 740,
    preparationTime: '15 min',
    tags: ['Comfort Food']
  },
  {
    name: 'Wild Garlic & Prawn Linguine',
    description: 'Pan-seared jumbo tiger prawns, white wine butter emulsion, cherry vine tomatoes, fresh wild garlic herbs.',
    price: 21.00,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 620,
    preparationTime: '18 min',
    tags: ['Seafood']
  },

  // 4. SIDES & STARTERS
  {
    name: 'Parmesan Herb Truffle Fries',
    description: 'Double fried hand-cut Idaho russets, Sicilian white truffle oil, grated aged parmesan, fresh parsley, garlic aioli.',
    price: 7.50,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 390,
    preparationTime: '10 min',
    tags: ['Snack', 'Bestseller']
  },
  {
    name: 'Golden Crispy Calamari',
    description: 'Lightly seasoned calamari flash fried to golden perfection, served with scorched lemon and house spicy remoulade.',
    price: 11.50,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 420,
    preparationTime: '12 min',
    tags: ['Seafood']
  },

  // 5. DRINKS
  {
    name: 'Sparkling Hibiscus Berry Cooler',
    description: 'Infusion of sun-dried Egyptian hibiscus blossoms, crushed wild blackberries, fresh mint leaves, sparkling artisanal soda.',
    price: 5.50,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.6,
    calories: 110,
    preparationTime: '5 min',
    tags: ['Refreshing', 'Organic']
  },
  {
    name: 'Meyer Lemon Passionfruit Fizz',
    description: 'Freshly squeezed Meyer lemons, exotic purple passionfruit puree, cane syrup, sprig of rosemary.',
    price: 6.00,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 140,
    preparationTime: '5 min',
    tags: ['Citrus', 'Iced']
  },
  {
    name: 'Iced Madagascar Vanilla Latte',
    description: 'Specialty roasted espresso poured over iced creamy oat milk and fragrant organic Madagascar vanilla bean syrup.',
    price: 6.25,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 180,
    preparationTime: '5 min',
    tags: ['Coffee', 'Energy']
  },

  // 6. DESSERTS
  {
    name: 'Traditional Venetian Tiramisu',
    description: 'Espresso-drenched Savoiardi sponge, layered with velvet mascarpone zabaglione and dusted with Valrhona cocoa.',
    price: 8.50,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 450,
    preparationTime: '5 min',
    tags: ['Sweet', 'Italian']
  },
  {
    name: 'Molten Belgian Chocolate Soufflé Cake',
    description: 'Warm rich Belgian dark chocolate cake with flowing molten lava core, paired with a scoop of Madagascar vanilla bean gelato.',
    price: 9.50,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 5.0,
    calories: 580,
    preparationTime: '10 min',
    tags: ['Indulgent', 'Top Rated']
  }
];

async function seedDatabase() {
  console.log('🌱 Starting Firestore Menu Seeding...\n');

  try {
    const menuCollection = db.collection('menu');
    let insertedCount = 0;

    for (const item of seedItems) {
      const docData = {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to Firestore collection
      const docRef = await menuCollection.add(docData);
      console.log(`✓ Added [${item.category}] "${item.name}" ($${item.price.toFixed(2)}) -> ID: ${docRef.id}`);
      insertedCount++;
    }

    console.log(`\n🎉 Successfully seeded ${insertedCount} menu items to Firestore collection 'menu'!`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Ensure your serviceAccountKey.json is placed in /backend or FIREBASE_SERVICE_ACCOUNT_JSON is set.');
    process.exit(1);
  }
}

seedDatabase();
