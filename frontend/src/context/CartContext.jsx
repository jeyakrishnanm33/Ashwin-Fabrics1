// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@utils/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync cart from Firestore when user logs in
  useEffect(() => {
    if (!user) { setItems([]); return; }

    const cartRef = doc(db, 'cart', user.uid);
    const unsub = onSnapshot(cartRef, (snap) => {
      if (snap.exists()) {
        setItems(snap.data().items || []);
      } else {
        setItems([]);
      }
    });
    return unsub;
  }, [user]);

  // Save cart to Firestore
  const syncCart = async (newItems) => {
    if (!user) return;
    await setDoc(doc(db, 'cart', user.uid), {
      items: newItems,
      updatedAt: new Date(),
    });
  };

  const addItem = async (product, size, color, quantity = 1) => {
    const key = `${product.id}_${size}_${color}`;
    const existing = items.find(i => `${i.productId}_${i.size}_${i.color}` === key);

    let newItems;
    if (existing) {
      newItems = items.map(i =>
        `${i.productId}_${i.size}_${i.color}` === key
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newItems = [...items, {
        productId: product.id,
        name: product.name,
        image: product.images?.[0],
        price: product.discountPrice || product.price,
        size, color, quantity,
      }];
    }
    setItems(newItems);
    await syncCart(newItems);
  };

  const removeItem = async (productId, size, color) => {
    const newItems = items.filter(
      i => !(i.productId === productId && i.size === size && i.color === color)
    );
    setItems(newItems);
    await syncCart(newItems);
  };

  const updateQuantity = async (productId, size, color, quantity) => {
    if (quantity < 1) return removeItem(productId, size, color);
    const newItems = items.map(i =>
      i.productId === productId && i.size === size && i.color === color
        ? { ...i, quantity }
        : i
    );
    setItems(newItems);
    await syncCart(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    await syncCart([]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loading, total, count,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
