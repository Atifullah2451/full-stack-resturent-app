const { db } = require('../config/firebaseAdmin');

// Default fallback items if database is empty or awaiting initial seed
const sampleMenuItems = [
  {
    id: 'burger-01',
    name: 'Truffle Angus Burger',
    description: 'Juicy 100% Angus beef patty, black truffle aioli, aged cheddar, caramelized onion, brioche bun.',
    price: 15.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 780,
    preparationTime: '15-20 min'
  },
  {
    id: 'burger-02',
    name: 'Smoky BBQ Bacon Burger',
    description: 'Double smoked bacon, house BBQ glaze, crispy onions, melted pepper jack cheese.',
    price: 14.50,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 820,
    preparationTime: '15 min'
  },
  {
    id: 'burger-03',
    name: 'Spicy Crispy Chicken Burger',
    description: 'Buttermilk fried chicken breast, fiery sriracha slaw, pickled jalapeños, dill ranch.',
    price: 13.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 710,
    preparationTime: '15 min'
  },
  {
    id: 'pizza-01',
    name: 'Artisan Margherita Pizza',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, extra virgin olive oil.',
    price: 16.50,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 650,
    preparationTime: '20 min'
  },
  {
    id: 'pizza-02',
    name: 'Diavola Pepperoni Crunch',
    description: 'Spicy Calabrian salami, hand-pulled mozzarella, hot chili honey drizzle, oregano.',
    price: 18.00,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 780,
    preparationTime: '20 min'
  },
  {
    id: 'pizza-03',
    name: 'Wild Forest Truffle Pizza',
    description: 'Roasted wild forest mushrooms, fontina & taleggio blend, white truffle oil, fresh thyme.',
    price: 19.50,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 720,
    preparationTime: '20 min'
  },
  {
    id: 'pasta-01',
    name: 'Creamy Tagliatelle Carbonara',
    description: 'Handmade fresh egg pasta, crispy guanciale, pecorino romano, cracked black pepper.',
    price: 17.00,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 690,
    preparationTime: '15 min'
  },
  {
    id: 'pasta-02',
    name: 'Tuscan Rigatoni Bolognese',
    description: 'Slow-braised beef and pork ragù, San Marzano tomatoes, 24-month aged Parmigiano Reggiano.',
    price: 18.50,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 740,
    preparationTime: '15 min'
  },
  {
    id: 'drinks-01',
    name: 'Berry Hibiscus Cooler',
    description: 'Cold-brewed organic hibiscus tea, crushed blackberries, mint sprig, sparkling water.',
    price: 5.50,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.6,
    calories: 110,
    preparationTime: '5 min'
  },
  {
    id: 'drinks-02',
    name: 'Passionfruit Mint Lemonade',
    description: 'Fresh pressed Meyer lemons, pure passionfruit pulp, fresh garden mint, agave nectar.',
    price: 6.00,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 140,
    preparationTime: '5 min'
  },
  {
    id: 'drinks-03',
    name: 'Iced Vanilla Bean Latte',
    description: 'Double shot espresso, Madagascar vanilla bean syrup, creamy oat milk over artisanal ice.',
    price: 6.25,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 180,
    preparationTime: '5 min'
  },
  {
    id: 'dessert-01',
    name: 'Classic Venetian Tiramisu',
    description: 'Espresso-soaked ladyfingers, velvety mascarpone cream, dark cocoa dust.',
    price: 8.50,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.9,
    calories: 450,
    preparationTime: '5 min'
  },
  {
    id: 'dessert-02',
    name: 'Molten Belgian Chocolate Lava Cake',
    description: 'Warm dark chocolate ganache center, served with house bourbon vanilla ice cream.',
    price: 9.50,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 5.0,
    calories: 580,
    preparationTime: '10 min'
  },
  {
    id: 'sides-01',
    name: 'Parmesan Herb Truffle Fries',
    description: 'Crispy skin-on russet potatoes tossed in white truffle oil, grated parmesan, fresh rosemary.',
    price: 7.50,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.8,
    calories: 390,
    preparationTime: '10 min'
  },
  {
    id: 'sides-02',
    name: 'Crispy Calamari Fritti',
    description: 'Flash-fried tender calamari rings, charred lemon wedges, spicy smoked paprika remoulade.',
    price: 11.50,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    rating: 4.7,
    calories: 420,
    preparationTime: '12 min'
  }
];

/**
 * Get all menu items with search, filter, and sorting
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, rating, availableOnly, sort } = req.query;

    let items = [];

    // Attempt to query Firestore
    try {
      const snapshot = await db.collection('menu').get();
      if (!snapshot.empty) {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        items = sampleMenuItems;
      }
    } catch (err) {
      console.warn('Firestore query fell back to in-memory items:', err.message);
      items = sampleMenuItems;
    }

    // Filter by Category
    if (category && category !== 'All') {
      items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
    }

    // Filter by Search text (Item name or description)
    if (search && search.trim() !== '') {
      const query = search.toLowerCase().trim();
      items = items.filter(i => 
        (i.name || '').toLowerCase().includes(query) ||
        (i.description || '').toLowerCase().includes(query)
      );
    }

    // Filter by Min Price
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) items = items.filter(i => Number(i.price) >= min);
    }

    // Filter by Max Price
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) items = items.filter(i => Number(i.price) <= max);
    }

    // Filter by Rating
    if (rating !== undefined && rating !== '') {
      const r = parseFloat(rating);
      if (!isNaN(r)) items = items.filter(i => Number(i.rating) >= r);
    }

    // Filter by Availability
    if (availableOnly === 'true' || availableOnly === true) {
      items = items.filter(i => i.isAvailable !== false);
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          items.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case 'price-desc':
          items.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case 'rating-desc':
          items.sort((a, b) => Number(b.rating) - Number(a.rating));
          break;
        case 'name-asc':
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    return res.status(200).json({
      success: true,
      total: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get distinct categories with counts
 */
const getCategories = async (req, res, next) => {
  try {
    let items = [];
    try {
      const snapshot = await db.collection('menu').get();
      if (!snapshot.empty) {
        items = snapshot.docs.map(doc => doc.data());
      } else {
        items = sampleMenuItems;
      }
    } catch (err) {
      items = sampleMenuItems;
    }

    const counts = {};
    items.forEach(item => {
      const cat = item.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryList = [
      { name: 'All', count: items.length },
      ...Object.keys(counts).map(name => ({ name, count: counts[name] }))
    ];

    return res.status(200).json({
      success: true,
      categories: categoryList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single menu item by ID
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const doc = await db.collection('menu').doc(id).get();
      if (doc.exists) {
        return res.status(200).json({
          success: true,
          data: { id: doc.id, ...doc.data() }
        });
      }
    } catch (err) {
      // fallback to sample array
    }

    const item = sampleMenuItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Menu item with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getCategories,
  getMenuItemById,
  sampleMenuItems
};
