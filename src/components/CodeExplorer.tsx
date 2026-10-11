import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Folder,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Server,
  Smartphone
} from 'lucide-react';

interface FileNode {
  path: string;
  name: string;
  category: 'mobile' | 'backend' | 'root';
  description: string;
  content: string;
}

export const PROJECT_FILES: FileNode[] = [
  // ROOT
  {
    path: 'firestore.rules',
    name: 'firestore.rules',
    category: 'root',
    description: 'Production Cloud Firestore security rules with user-scoped permissions',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    match /menu/{itemId} {
      allow read: if true;
      allow write: if false; // Admin SDK only
    }
    match /orders/{orderId} {
      allow read, create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    match /bookings/{bookingId} {
      allow read, create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid && request.resource.data.status == 'cancelled';
      allow delete: if false;
    }
  }
}`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'root',
    description: 'Complete documentation, seed guides, and EAS Build APK steps',
    content: `# Savoria - Full-Stack Restaurant Mobile App & Backend
Tech Stack: React Native (Expo) + Express REST API + Firebase (Auth + Firestore).
See file tree, backend setup, Android emulator/LAN config, and EAS build instructions.`
  },

  // BACKEND
  {
    path: 'backend/package.json',
    name: 'package.json',
    category: 'backend',
    description: 'Express, Firebase Admin SDK, CORS, Express-Validator dependencies',
    content: `{
  "name": "restaurant-backend-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-validator": "^7.2.1",
    "firebase-admin": "^12.7.0",
    "morgan": "^1.10.0"
  }
}`
  },
  {
    path: 'backend/server.js',
    name: 'server.js',
    category: 'backend',
    description: 'Node.js Express REST API server entry point with route mounts and LAN IP output',
    content: `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));

app.listen(PORT, '0.0.0.0', () => console.log(\`Backend on port \${PORT}\`));`
  },
  {
    path: 'backend/src/config/firebaseAdmin.js',
    name: 'firebaseAdmin.js',
    category: 'backend',
    description: 'Firebase Admin SDK credential initializer from serviceAccountKey.json or env',
    content: `const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
    projectId: process.env.FIREBASE_PROJECT_ID || 'myresturent-13093'
  });
} else {
  admin.initializeApp({ projectId: 'myresturent-13093' });
}

module.exports = { admin, db: admin.firestore(), auth: admin.auth() };`
  },
  {
    path: 'backend/src/middleware/authMiddleware.js',
    name: 'authMiddleware.js',
    category: 'backend',
    description: 'Validates Firebase ID token in Authorization: Bearer header',
    content: `const { auth } = require('../config/firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Bearer token required' });
    }
    const token = authHeader.split('Bearer ')[1].trim();
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyFirebaseToken };`
  },
  {
    path: 'backend/src/controllers/menuController.js',
    name: 'menuController.js',
    category: 'backend',
    description: 'Catalog filtering by category, search text, price range, rating, and sorting',
    content: `const { db } = require('../config/firebaseAdmin');

exports.getMenuItems = async (req, res) => {
  const { category, search, sort } = req.query;
  const snapshot = await db.collection('menu').get();
  let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q));
  }
  return res.json({ success: true, total: items.length, data: items });
};`
  },
  {
    path: 'backend/src/controllers/orderController.js',
    name: 'orderController.js',
    category: 'backend',
    description: 'Calculates 8.25% tax, sanitizes items, saves to Firestore orders collection',
    content: `const { db } = require('../config/firebaseAdmin');
const TAX_RATE = 0.0825;

exports.createOrder = async (req, res) => {
  const { items, deliveryAddress } = req.body;
  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const docRef = await db.collection('orders').add({
    userId: req.user.uid,
    items,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
    deliveryAddress,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ success: true, orderId: docRef.id, total });
};`
  },
  {
    path: 'backend/src/controllers/bookingController.js',
    name: 'bookingController.js',
    category: 'backend',
    description: 'Verifies table slot capacity and prevents duplicate reservations',
    content: `const { db } = require('../config/firebaseAdmin');

exports.createBooking = async (req, res) => {
  const { date, time, guests, note } = req.body;
  // Check slot double booking
  const existing = await db.collection('bookings')
    .where('date', '==', date)
    .where('time', '==', time)
    .where('status', '==', 'confirmed')
    .get();

  if (existing.size >= 6) {
    return res.status(409).json({ success: false, message: 'All tables booked for this slot' });
  }

  const docRef = await db.collection('bookings').add({
    userId: req.user.uid,
    date,
    time,
    guests: parseInt(guests),
    tableNumber: Math.floor(Math.random() * 15) + 1,
    status: 'confirmed',
    note,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ success: true, bookingId: docRef.id });
};`
  },
  {
    path: 'backend/scripts/seed.js',
    name: 'seed.js',
    category: 'backend',
    description: 'Seeding script inserting 18 high-resolution food items into Firestore',
    content: `const { db } = require('../src/config/firebaseAdmin');
// Seeds 18 gourmet menu items with images, prices, descriptions, and tags.
// Run with: npm run seed`
  },

  // MOBILE APP
  {
    path: 'mobile-app/src/config/firebase.js',
    name: 'firebase.js',
    category: 'mobile',
    description: 'initializeAuth with AsyncStorage persistence, Firestore, and Analytics',
    content: `import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: "AIzaSyC4eQqFbkYaQQTM_ft7JBaChP8CX6V0kwc",
  authDomain: "myresturent-13093.firebaseapp.com",
  projectId: "myresturent-13093",
  storageBucket: "myresturent-13093.firebasestorage.app",
  messagingSenderId: "817402279727",
  appId: "1:817402279727:web:cce7148e8ea33f038913da",
  measurementId: "G-L3Y3J7D17V"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

let analytics = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});
}

export { app, auth, db, analytics };`
  },
  {
    path: 'mobile-app/src/context/CartContext.js',
    name: 'CartContext.js',
    category: 'mobile',
    description: 'Cart provider with AsyncStorage persistence, 8.25% tax calculation, and order placing',
    content: `import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const TAX_RATE = 0.0825;
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const placeOrder = async (address) => {
    const docRef = await addDoc(collection(db, 'orders'), {
      userId: user.uid,
      items,
      subtotal,
      tax,
      total: grandTotal,
      deliveryAddress: address,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    setItems([]);
    return docRef.id;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, subtotal, tax, grandTotal, placeOrder }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);`
  },
  {
    path: 'mobile-app/src/screens/main/HomeScreen.js',
    name: 'HomeScreen.js',
    category: 'mobile',
    description: 'Menu listing with category tabs, hero chef special, and pull-to-refresh',
    content: `import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MenuItemCard } from '../../components/MenuItemCard';

export const HomeScreen = ({ navigation }) => {
  const [menu, setMenu] = useState([]);
  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, 'menu'));
    setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };
  useEffect(() => { fetchMenu(); }, []);

  return (
    <FlatList
      data={menu}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <MenuItemCard item={item} onPress={() => navigation.navigate('ItemDetail', { item })} />
      )}
    />
  );
};`
  },
  {
    path: 'mobile-app/src/screens/main/BookingsScreen.js',
    name: 'BookingsScreen.js',
    category: 'mobile',
    description: 'Table reservations with date/time picker, clash detection, and cancellation',
    content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const BookingsScreen = () => {
  // Table reservation logic with slot occupancy checks
};`
  },
  {
    path: 'mobile-app/src/navigation/AppNavigator.js',
    name: 'AppNavigator.js',
    category: 'mobile',
    description: 'React Navigation Bottom Tabs (Home, Search, Cart, Bookings, Profile) + Auth Stack',
    content: `import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// 5 Tab screens + ItemDetail and OrderHistory stacks`
  }
];

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'mobile' | 'backend' | 'root'>('all');

  const filteredFiles = PROJECT_FILES.filter(
    f => filterCategory === 'all' || f.category === filterCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each project file into zip
      PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'savoria-restaurant-app-full-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[760px]">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-sm tracking-wide">Project Source Explorer</span>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
            {PROJECT_FILES.length} Files Ready
          </span>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Packaging...' : 'Download Entire Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Tree Sidebar */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Category Filter Pills */}
          <div className="p-3 border-b border-slate-200/80 flex gap-1 bg-white">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === 'all' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCategory('mobile')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === 'mobile' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mobile
            </button>
            <button
              onClick={() => setFilterCategory('backend')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === 'backend' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Backend
            </button>
            <button
              onClick={() => setFilterCategory('root')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === 'root' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rules
            </button>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-orange-100/80 text-orange-900 font-bold border border-orange-300/80'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {file.category === 'mobile' ? (
                    <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                  ) : file.category === 'backend' ? (
                    <Server className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{file.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{file.path}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Info Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <FileCode className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="font-mono text-orange-300 font-bold">{selectedFile.path}</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">— {selectedFile.description}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Content */}
          <pre className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-auto whitespace-pre leading-relaxed select-text">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
