import toast from "react-hot-toast";
import axios from "axios";
export const addBanner = async (formState, token) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/banner`,
      formState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 201) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error adding Banner:", error);
    toast.error("Failed to add Banner");
    return false;
  }
};
export const fetchBanner = async () => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/banner`);
    if (response.status !== 200) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error fetch Banners:", error);
    toast.error("Failed to fetch Banners");
    return false;
  }
};

export const updateBanner = async (id, token, formState) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/banner/${id}`,
      formState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) throw new Error("Network response was not ok");
    return await response.data;
  } catch (error) {
    console.error("Error update Banners:", error);
    toast.error("Failed to update Banners");
    return false;
  }
};

export const deleteBanner = async (id, token) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/banner/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status !== 200) throw new Error("Network response was not ok");
    return await response.data;
  } catch (error) {
    console.error("Error delete Banners:", error);
    toast.error("Failed to delete Banners");
    return false;
  }
};
