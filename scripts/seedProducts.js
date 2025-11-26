const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    id: 'prod_001',
    name: 'Fresh Apples',
    description: 'Crisp and sweet red apples, perfect for snacking or baking. Rich in fiber and vitamins.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
    stock: 50,
  },
  {
    id: 'prod_002',
    name: 'Ripe Bananas',
    description: 'Fresh yellow bananas, great source of potassium and energy. Perfect for smoothies.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
    stock: 100,
  },
  {
    id: 'prod_003',
    name: 'Sweet Oranges',
    description: 'Juicy citrus oranges packed with Vitamin C. Perfect for fresh juice or snacking.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500',
    stock: 75,
  },
  {
    id: 'prod_004',
    name: 'Fresh Strawberries',
    description: 'Sweet and juicy strawberries, rich in antioxidants. Great for desserts and smoothies.',
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500',
    stock: 40,
  },
  {
    id: 'prod_005',
    name: 'Red Grapes',
    description: 'Seedless red grapes, naturally sweet and perfect for snacking or making juice.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1599819177841-c590e0e91bb8?w=500',
    stock: 60,
  },
  {
    id: 'prod_006',
    name: 'Ripe Mangoes',
    description: 'Sweet tropical mangoes, rich in vitamins. Perfect for smoothies and desserts.',
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1605664515813-4f8340313d7c?w=500',
    stock: 45,
  },
  {
    id: 'prod_007',
    name: 'Fresh Watermelon',
    description: 'Juicy and refreshing watermelon, perfect for hot summer days. Low in calories.',
    price: 100,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
    stock: 30,
  },
  {
    id: 'prod_008',
    name: 'Sweet Pineapple',
    description: 'Tropical pineapple with sweet tangy flavor. Great source of vitamin C and manganese.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=500',
    stock: 35,
  },
  {
    id: 'prod_009',
    name: 'Fresh Blueberries',
    description: 'Plump blueberries packed with antioxidants. Perfect for breakfast or baking.',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500',
    stock: 50,
  },
  {
    id: 'prod_010',
    name: 'Ripe Avocados',
    description: 'Creamy avocados rich in healthy fats. Perfect for salads, toast, and smoothies.',
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
    stock: 55,
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...');
  
  try {
    const productsCollection = collection(db, 'products');
    
    for (const product of products) {
      await addDoc(productsCollection, product);
      console.log(`✅ Added: ${product.name}`);
    }
    
    console.log('🎉 All products added successfully!');
    console.log(`📦 Total products: ${products.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
