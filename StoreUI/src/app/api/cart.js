import axios from "axios";

// 🔹 Update Cart Item Quantity (Increment or Decrement)
export const updateCartItemQuantity = async (token, cartItemId, action) => {
    try {
        const response = await axios.put(
            `${process.env.SERVER_URL}/cart/update-quantity`, // Your API endpoint for updating quantity
            {
                id: cartItemId,    // Cart Item ID
                action: action     // "increment" or "decrement"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Bearer token for authentication
                },
            }
        );
        return response.data;  // Return the updated cart item or success message
    } catch (error) {
        console.error('Error updating cart item quantity:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to update cart item quantity');
    }
};

// 🔹 Add Item to Cart
export const addItemToCart = async (token, productId, productVariantId, quantity = 1) => {
    try {
        const response = await axios.post(`${process.env.SERVER_URL}/cart/product/add`,
            { productId, productVariantId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data; // Return the added cart item details
    } catch (error) {
        console.error("Error adding item to cart:", error);
        throw new Error(error.response?.data?.error || "Failed to add item to cart");
    }
};

// 🔹 Fetch Cart Items
export const fetchUserCart = async (token) => {
    try {
        const response = await axios.get(`${process.env.SERVER_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // Return the cart data
    } catch (error) {
        console.error("Error fetching cart items:", error);
        throw new Error(error.response?.data?.error || "Failed to fetch cart items");
    }
};

// 🔹 Clear Cart
export const clearUserCart = async (token) => {
    try {
        const response = await axios.delete(`${process.env.SERVER_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.status === 200; // Return true if the cart is cleared successfully
    } catch (error) {
        console.error("Error clearing the cart:", error);
        throw new Error(error.response?.data?.error || "Failed to clear cart");
    }
};

// 🔹 Remove Item from Cart
export const removeItemFromCart = async (token, cartProductId) => {
    try {
        const response = await axios.delete(`${process.env.SERVER_URL}/cart/product/${cartProductId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.status === 200; // Return true if item is removed successfully
    } catch (error) {
        console.error("Error removing item from cart:", error);
        throw new Error(error.response?.data?.error || "Failed to remove item from cart");
    }
};

// 🔹 Get Cart Product Count
export const getCartProductCount = async (token) => {
    try {
        const response = await axios.get(`${process.env.SERVER_URL}/cart/count`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.count; // Return the cart item count
    } catch (error) {
        console.error("Error getting cart product count:", error);
        throw new Error(error.response?.data?.error || "Failed to get cart product count");
    }
};
