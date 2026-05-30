import toast from "react-hot-toast";
import axios from "axios";

export const addAddress = async (formState, token, id="user") => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/address/${id}`,
      formState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 201) throw new Error(response.response.data.message ?? "Network response was not ok");

    return await true;
  } catch (error) {
    console.error("Error adding address:", error);
    toast.error(error.response.data.message ?? "Can't add more address.");
    return false;
  }
};

export const getAddressByUserId = async (id, token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/address/${id}`,
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
    console.error("Error fetching address:", error);
    toast.error("Failed to fetch address");
    return false;
  }
};


export const getAddressType = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/address/types`,
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
    console.error("Error fetching address:", error);
    // toast.error("Failed to fetch address");
    return false;
  }
};

export const updateAddresses = async (formState, token, id) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/address/${id}`,
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
    console.error("Error updating address:", error);
    toast.error("Failed to update address");
    return false;
  }
};

export const deleteAddress = async (id, token) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/address/${id}`,
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
    console.error("Error deleting address:", error);
    toast.error("Failed to delete address");
    return false;
  }
};

export const fetchUserAddress = async (token) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/address/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching address:", error);
  }
};
export const updateUserAddress = async (formdata, token, id) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/address/user/${id}`,
      formdata,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(response?.data?.message || "Failed to update address");
    }

    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    toast.error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update address"
    );
    return null;
  }
};
