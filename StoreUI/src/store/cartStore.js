import {create} from 'zustand';
import { addItemToCart, fetchUserCart, removeItemFromCart, updateCartItemQuantity, clearUserCart, getCartProductCount } from '@/app/api/cart'; // Adjust the import path

// Zustand store for managing the cart state
const useCartStore = create((set) => ({
  cartItems: [],
  cartCount: 0,
  loading: false,
  error: null,

  // Action to fetch the user's cart
  fetchCart: async (token) => {
    set({ loading: true });
    try {
      const data = await fetchUserCart(token);
      set({
        cartItems: data || [],
        cartCount: data.length || 0,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Action to add an item to the cart
  addToCart: async (token, productId, productVariantId, quantity = 1) => {
    set({ loading: true });
    try {
      const data = await addItemToCart(token, productId, productVariantId, quantity);
      set((state) => ({
        cartItems: [...state.cartItems, data],
        cartCount: state.cartCount + 1,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Action to remove an item from the cart
  removeFromCart: async (token, cartItemId) => {
    set({ loading: true });
    try {
      const success = await removeItemFromCart(token, cartItemId);
      if (success) {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== cartItemId),
          cartCount: state.cartCount - 1,
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Action to update the quantity of a cart item (increment or decrement)
  updateQuantity: async (token, cartItemId, action) => {
    set({ loading: true });
    try {
      const data = await updateCartItemQuantity(token, cartItemId, action);
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: data.quantity } : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Action to clear the entire cart
  clearCart: async (token) => {
    set({ loading: true });
    try {
      const success = await clearUserCart(token);
      if (success) {
        set({ cartItems: [], cartCount: 0, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Action to get the total product count in the cart
  getCartProductCount: async (token) => {
    try {
      const count = await getCartProductCount(token);
      set({ cartCount: count });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

export default useCartStore;
