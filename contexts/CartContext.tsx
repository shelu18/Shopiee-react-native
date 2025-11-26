import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, CartContextType } from '../types';
import { updateProductStock, getProductById } from '../services/productService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setCartItems as setCartItemsRedux, 
  addItem, 
  updateItemQuantity, 
  removeItem, 
  clearCart as clearCartRedux 
} from '../store/slices/cartSlice';
import { updateProductStock as updateProductStockRedux } from '../store/slices/productsSlice';

const CART_STORAGE_KEY = '@shopping_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes (skip initial load)
  useEffect(() => {
    if (isInitialized) {
      saveCart();
    }
  }, [cartItems, isInitialized]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const items = JSON.parse(cartData);
        dispatch(setCartItemsRedux(items));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart:', error);
      setIsInitialized(true);
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

      // Update Redux store
      dispatch(updateProductStockRedux({ productId: product.id, stock: newStock }));
      dispatch(addItem({ product: { ...product, stock: newStock }, quantity }));
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
          
          // Update Redux store
          dispatch(updateProductStockRedux({ productId, stock: restoredStock }));
        }
      }

      // Remove from Redux cart
      dispatch(removeItem(productId));
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
      const newStock = currentProduct.stock - quantityDifference;
      await updateProductStock(productId, newStock);

      // Update Redux store
      dispatch(updateProductStockRedux({ productId, stock: newStock }));
      dispatch(updateItemQuantity({ productId, quantity: newQuantity }));
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
          dispatch(updateProductStockRedux({ productId: item.product.id, stock: restoredStock }));
        }
      }

      // Clear Redux cart
      dispatch(clearCartRedux());
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const completeOrder = async () => {
    try {
      // Clear cart WITHOUT restoring stock (order is completed)
      dispatch(clearCartRedux());
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
