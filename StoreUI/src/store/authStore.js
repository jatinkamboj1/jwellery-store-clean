import { create } from "zustand";
import { useSession, signOut, signIn } from "next-auth/react";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  user: null, // Holds the user data after authentication
  token: null, // Authentication token
  isLoggedIn: false, // Whether the user is logged in or not
  isLoading: false, // Loading state for authentication
  error: null, // Store error messages if needed

  // Login function
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // Use NextAuth signIn to authenticate the user
      const res = await signIn("credentials", {
        redirect: false,
        ...credentials,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Please try again.");
        set({ isLoading: false, error: res.error });
        return;
      }

      // Update the Zustand store state on successful login
      set({
        user: res?.user,
        token: res?.token,
        isLoggedIn: true,
        isLoading: false,
      });
      
      // Store the token in localStorage
      localStorage.setItem("token", res?.token);
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Login failed. Please try again.");
      set({ isLoading: false, error: error.message });
    }
  },

  // Logout function
  logout: async () => {
    try {
      // Call signOut from NextAuth to log the user out
      await signOut({ redirect: false });

      set({
        user: null,
        token: null,
        isLoggedIn: false,
      });

      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Logout failed.");
    }
  }
}));

export default useAuthStore;
