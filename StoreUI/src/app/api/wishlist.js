import toast from "react-hot-toast";

const BASE_URL = process.env.SERVER_URL;

export const fetchUserWishlist = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch wishlist");

        return await response.json();
    } catch (error) {
        console.error("Wishlist Fetch Error:", error);
        toast.error("Failed to load wishlist");
        return null;
    }
};

export const addItemToWishlist = async (token, productSlug) => {
    try {
        const response = await fetch(`${BASE_URL}/wishlist/${productSlug}`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to add item to wishlist");

        toast.success("Added to wishlist!");
        return await response.json();
    } catch (error) {
        console.error("Wishlist Add Error:", error);
        toast.error("Error adding to wishlist");
        return null;
    }
};

export const deleteItemFromWishlist = async (token, productSlug) => {
    try {
        const response = await fetch(`${BASE_URL}/wishlist/${productSlug}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to remove item");

        toast.success("Removed from wishlist!");
        return true;
    } catch (error) {
        console.error("Wishlist Delete Error:", error);
        toast.error("Error removing item");
        return false;
    }
};

export const clearUserWishlist = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/wishlist`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to clear wishlist");

        toast.success("Wishlist cleared!");
        return true;
    } catch (error) {
        console.error("Wishlist Clear Error:", error);
        toast.error("Error clearing wishlist");
        return false;
    }
};
