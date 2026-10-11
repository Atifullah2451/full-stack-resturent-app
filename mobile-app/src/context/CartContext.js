/**
 * Cart Context & Provider
 * Manages cart items, item quantity modifications, totals calculation,
 * local persistence using AsyncStorage, and placing orders to Firestore/Backend.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = '@savoria_cart_items_v1';
const TAX_RATE = 0.0825; // 8.25% sales tax

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from AsyncStorage on initial launch
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load cart from AsyncStorage:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCart();
  }, []);

  // Sync to AsyncStorage on every change
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch((err) =>
        console.warn('Failed to save cart to storage:', err)
      );
    }
  }, [items, isLoaded]);

  // Add item or increment count
  const addToCart = (product, quantityToAdd = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          category: product.category,
          quantity: quantityToAdd,
        },
      ];
    });
  };

  // Increase quantity
  const increaseQuantity = (itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity (removes if reaches 0)
  const decreaseQuantity = (itemId) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove specific item
  const removeFromCart = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Clear entire cart
  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  // Calculated totals
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const grandTotal = parseFloat((subtotal + tax).toFixed(2));

  // Place order into Firestore "orders" collection
  const placeOrder = async ({ deliveryAddress = '', notes = '' } = {}) => {
    if (items.length === 0) {
      throw new Error('Your cart is empty.');
    }
    if (!user) {
      throw new Error('Please login to complete your order.');
    }

    const orderPayload = {
      userId: user.uid,
      userEmail: user.email || '',
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        category: i.category,
        subtotal: parseFloat((i.price * i.quantity).toFixed(2)),
      })),
      subtotal,
      tax,
      total: grandTotal,
      itemCount: totalItemCount,
      deliveryAddress: deliveryAddress || 'Dine-In / Counter Pickup',
      notes: notes || '',
      status: 'pending', // pending -> preparing -> ready -> completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save directly to Firestore collection "orders"
    const docRef = await addDoc(collection(db, 'orders'), orderPayload);
    
    // Clear cart on successful order
    await clearCart();

    return {
      id: docRef.id,
      ...orderPayload,
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        tax,
        grandTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
