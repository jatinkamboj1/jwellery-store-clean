import axios from "axios";
import toast from "react-hot-toast";

export const fetchAllCategories = async (offset = 1, limit = 10, options) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/category`, {
      params: {
        offset,
        limit,
        ...options,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Failed to fetch categories");
    return false;
  }
};

export const fetchAllCategoriesName = async () => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/names`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Failed to fetch categories");
    return false;
  }
};

export const fetchAllSubCategoriesName = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/subcategories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Failed to fetch categories");
    return false;
  }
};

export const fetchCategoryById = async (id, token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // //console.log("data", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    toast.error("Failed to fetch category");
    return false;
  }
};

export const updateCategoryById = async (id, token, data) => {
  // //console.log(id);

  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/category/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // //console.log("data is :", data );
    toast.success("Category updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating category by ID:", error);
    toast.error("Failed to update category");
    return false;
  }
};

export const deleteCategoryId = async (id, token) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/category/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is passed
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Category deleted successfully!");
    return response.data; // Return response if needed
  } catch (error) {
    console.error("Error deleting Category:", error);

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

    toast.error("Error deleting Category.");
    return false;
  }
};

// user-side
export const fetchCategoryBySlug = async (slug) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/slug/${slug}`,
    );
    // //console.log("data", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    toast.error("Failed to fetch category");
    return false;
  }
};