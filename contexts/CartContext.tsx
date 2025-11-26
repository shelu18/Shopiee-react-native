import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, CartContextType } from '../types';
import { updateProductStock, getProductById } from '../services/productService';

const CART_STORAGE_KEY = '@shopping_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    saveCart();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    try {
      // Check if we have enough stock in Firestore
      const currentProduct = await getProductById(product.id);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const existingItem = cartItems.find((item) => item.product.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalQuantity = currentCartQuantity + quantity;

      if (totalQuantity > currentProduct.stock) {
        throw new Error(`Only ${currentProduct.stock} items available in stock`);
      }

      // Decrement stock in Firestore immediately
      const newStock = currentProduct.stock - quantity;
      await updateProductStock(product.id, newStock);

      // Update local cart
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  product: { ...item.product, stock: newStock }
                }
              : item
          );
        } else {
          // Add new item with updated stock
          return [...prevItems, { 
            product: { ...product, stock: newStock }, 
            quantity 
          }];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      // Find the item being removed
      const itemToRemove = cartItems.find((item) => item.product.id === productId);
      
      if (itemToRemove) {
        // Restore stock to Firestore when item is removed
        const currentProduct = await getProductById(productId);
        if (currentProduct) {
          const restoredStock = currentProduct.stock + itemToRemove.quantity;
          await updateProductStock(productId, restoredStock);
        }
      }

      // Remove from local cart
      setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const cartItem = cartItems.find((item) => item.product.id === productId);
      if (!cartItem) return;

      const quantityDifference = newQuantity - cartItem.quantity;

      // Get current stock from Firestore
      const currentProduct = await getProductById(productId);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      // If increasing quantity, check if we have enough stock
      if (quantityDifference > 0 && quantityDifference > currentProduct.stock) {
        throw new Error(`Only ${currentProduct.stock} more items available`);
      }

      // Update stock in Firestore
      // If increasing quantity (quantityDifference > 0), decrease stock
      // If decreasing quantity (quantityDifference < 0), increase stock
      const newStock = currentProduct.stock - quantityDifference;
      await updateProductStock(productId, newStock);

      // Update local cart
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId 
            ? { 
                ...item, 
                quantity: newQuantity,
                product: { ...item.product, stock: newStock }
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Restore stock for all items in cart
      for (const item of cartItems) {
        const currentProduct = await getProductById(item.product.id);
        if (currentProduct) {
          const restoredStock = currentProduct.stock + item.quantity;
          await updateProductStock(item.product.id, restoredStock);
        }
      }

      // Clear local cart
      setCartItems([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const completeOrder = async () => {
    try {
      // Clear cart WITHOUT restoring stock (order is completed)
      setCartItems([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
