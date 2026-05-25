import toast from "react-hot-toast";
import axios from "axios";

export const fetchSearchProducts = async (querys) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/search?${querys}`
    );

    if (!response.ok) throw new Error("Failed to fetch wishlist");

    return await response.json();
  } catch (error) {
    console.error(error);
    toast.error("Failed to load wishlist");
    return null;
  }
};

export const fetchProductBySlug = async (productSlug) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/product/by-slug/${productSlug}`
    );

    if (!response.ok) throw new Error("Failed to fetch product");

    return await response.json();
  } catch (error) {
    console.error(error);
    toast.error("Failed to load product");
    return null;
  }
};
export const fetchReviewByProductId = async (productSlug, offset, limit) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/review/product/${productSlug}`,
      {
        params: {
          offset,
          limit,
        },
      }
    );

    if (response.status !== 200) throw new Error("Failed to fetch product");

    return await response.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to load product");
    return null;
  }
};

export const fetchRelativeProducts = async (
  offset = 0,
  limit = 10,
  slug,
  options
) => {
  try {
    // offset = 0;
    const response = await axios.get(
      `${process.env.SERVER_URL}/product/relative/${slug}`,
      {
        params: {
          offset,
          limit,
          ...options,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching Products Card:", error);
    toast.error("Failed to fetch Products Card");
    return false;
  }
};

export const fetchCategory = async (url) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/category/user/${url}`
    );

    if (!response.ok) throw new Error("Failed to fetch Category");

    return await response.json();
  } catch (error) {
    console.error(error);
    toast.error("Failed to load Category");
    return null;
  }
};

export const fetchCategoryProducts = async (url, query) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/product/filter/${url}?${query}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Error fetching products.");
    return false;
  }
};

export const fetchProductsCard = async (
  currentPage = 0,
  limit = 10,
  options
) => {
  try {
    // currentPage = 0;
    const response = await axios.get(
      `${process.env.SERVER_URL}/product/products-card`,
      {
        params: {
          currentPage,
          limit,
          ...options,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching Products Card:", error);
    toast.error("Failed to fetch Products Card");
    return false;
  }
};

export const fetchAllProducts = async (offset = 0, limit = 10, options) => {
  try {
    // offset = 0;
    const response = await axios.get(`${process.env.SERVER_URL}/product`, {
      params: {
        offset,
        limit,
        ...options,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Products:", error);
    toast.error("Failed to fetch Products");
    return false;
  }
};

export const addProduct = async (productData, token) => {
  try {
    // //console.log("add",productData,token)
    const response = await axios.post(
      `${process.env.SERVER_URL}/product/`,
      productData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    toast.error("Error adding product.");
    return false;
  }
};

export const fetchProductById = async (id, token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/product/by-id/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is passed
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    } else if (error.request) {
      console.error(
        "No response received from API. Request details:",
        error.request
      );
    } else {
      console.error("Error setting up the request:", error.message);
    }

    toast.error("Error fetching product.");
    return false;
  }
};

export const deleteProductById = async (id, token) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/product/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is passed
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Product deleted successfully!");
    return response.data; // Return response if needed
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    } else if (error.request) {
      console.error(
        "No response received from API. Request details:",
        error.request
      );
    } else {
      console.error("Error setting up the request:", error.message);
    }

    toast.error("Error deleting product.");
    return false;
  }
};

export const updateProduct = async (productId, productData, token) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/product/${productId}`, // ✅ Use productId in URL
      productData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Error updating product.");
    return false;
  }
};

export const getProductsByCategoryId = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/product/user/${id}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching products:", error);
    toast.error(error.response.data.message);
    return false;
  }
};
