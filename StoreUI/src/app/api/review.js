import axios from "axios";
import toast from "react-hot-toast";

export const fetchAllReviews = async (
  token,
  offset = 1,
  limit = 10,
  options
) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/review`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        offset,
        limit,
        ...options,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    toast.error("Failed to fetch reviews");
    return false;
  }
};

export const deleteReview = async (token, id) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/review/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    toast.error("Failed to delete review");
    return false;
  }
};

export const updateReview = async (token, id, formState) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/review/${id}`,
      formState,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    toast.error("Failed to delete review");
    return false;
  }
};

export const createReview = async (token, formState) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/review`,
      formState,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    toast.error("Failed to delete review");
    return false;
  }
};
