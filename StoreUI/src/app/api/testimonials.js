import axios from "axios";
import toast from "react-hot-toast";

export const addTestimonial = async (token, formState) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/testimonials`,
      formState,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success("Testimonial added successfully");
    return response.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to add testimonial");
  }
};

export const fetchAllTestimonials = async (
  token,
  offset = 1,
  limit = 10,
  options
) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/testimonials`, {
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
    console.error("Error fetching testimonials:", error);
    toast.error("Failed to fetch testimonials");
    return false;
  }
};

export const fetchTestimonialById = async (token, id) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/testimonials/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    toast.error("Failed to fetch testimonials");
    return false;
  }
};

export const deleteTestimonial = async (token, id) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/testimonials/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    toast.error("Failed to delete testimonials");
    return false;
  }
};

export const updateTestimonials = async (token, id, formState) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/testimonials/${id}`,
      formState,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    toast.error("Failed to delete testimonials");
    return false;
  }
};
