import { create } from "zustand";
import { fetchUserWishlist, addItemToWishlist, deleteItemFromWishlist, clearUserWishlist } from "@/app/api/wishlist";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";


// Zustand store for the wishlist
const useWishlistStore = create((set) => ({
  wishlist: [],
  isLoading: false,

  // Fetch wishlist from the server
  fetchWishlist: async (token) => {
    set({ isLoading: true });
    
    if (!token) {
      // toast.error("Please log in first.");
      set({ isLoading: false });
      return;
    }

    const data = await fetchUserWishlist(token);
    if (data) {
      set({ wishlist: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  // Add an item to the wishlist
  addToWishlist: async (token, id) => {
    set({ isLoading: true });
    if (!token) {
      toast.error("Please log in first.");
      set({ isLoading: false });
      return;
    }

    const newItem = await addItemToWishlist(token, id);
    if (newItem) {
      set((state) => ({ wishlist: [...state.wishlist, newItem] }));
    }
    set({ isLoading: false });
  },

  // Remove an item from the wishlist
  removeFromWishlist: async (token, id) => {
    set({ isLoading: true });
    if (!token) {
      toast.error("Please log in first.");
      set({ isLoading: false });
      return;
    }

    const success = await deleteItemFromWishlist(token, id);
    if (success) {
      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.product.id !== id),
      }));
    }
    set({ isLoading: false });
  },

  // Clear all items from the wishlist
  clearWishlist: async (token) => {
    set({ isLoading: true });
    if (!token) {
      toast.error("Please log in first.");
      set({ isLoading: false });
      return;
    }

    const success = await clearUserWishlist(token);
    if (success) {
      set({ wishlist: [] });
    }
    set({ isLoading: false });
  },
}));

export default useWishlistStore;
