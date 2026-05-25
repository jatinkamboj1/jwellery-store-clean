import toast from "react-hot-toast";
import axios from "axios";
export const userOrders = async (
  token,
  currentPage = 0,
  limit = 10,
  options,
  id = "user"
) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/orders/user/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          currentPage,
          limit,
          ...options,
        },
      }
    );

    if (response.status !== 200) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to fetch orders");
    return false;
  }
};

export const allUserOrders = async (token, offset = 0, limit = 10, options, sort) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/orders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        offset,
        limit,
        ...options,
        ...sort,
      },
    });
    if (response.status !== 200) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to fetch orders");
    return false;
  }
};

export const userOrder = async (token, id) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch order");
    return await response.json();
  } catch (error) {
    toast.error("Error fetching order data");
    return false;
  }
};

export const orderedProducts = async (token, id) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/order-product/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch order products");
    return await response.json();
  } catch (error) {
    toast.error("Error fetching order products");
    return false;
  }
};

export const updateUserOrder = async (formState, id, token) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/orders/${id}`,
      formState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status !== 200) throw new Error("Failed to update order");
    return true;
  } catch (error) {
    toast.error("Error updating order");
    return false;
  }
};

export const deleteUserOrder = async (id, token) => {
  try {
    await fetch(`${process.env.SERVER_URL}/orders/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    await fetch(`${process.env.SERVER_URL}/orders/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    toast.error("Error deleting order");
    return false;
  }
};

export const addOrder = async (token, formState) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/orders`,
      formState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status !== 201) throw new Error("Failed to add order");
    return response.data;
  } catch (error) {
    console.error("Error in add:", error);
    toast.error("Something went wrong.");
  }
};

export const getUserOrders = async (token) => {
  try {
    if (!token) throw new Error("No token found");

    const response = await axios.get(
      `${process.env.SERVER_URL}/orders/userOrder`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.orders; // Return only the orders array
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to fetch orders");
    return [];
  }
};
