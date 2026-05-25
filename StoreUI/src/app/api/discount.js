import toast from "react-hot-toast";
import axios from "axios";

export const getAllCoupons = async (token, offset = 0, limit = 10, options) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/discount`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        offset,
        limit,
        ...options,
      },
    });

    if (response.status !== 200) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    toast.error("Failed to fetch coupons");
    return false;
  }
};

export const createCoupon = async (formState, token) => {
  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/discount`,
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
    console.error("Error creating coupon:", error);
    toast.error("Failed to create coupon");
    return false;
  }
};

export const getCouponById = async (id, token) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/discount/${id}`,
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
    console.error("Error deleting coupon:", error);
    toast.error("Failed to delete coupon");
    return false;
  }
};

export const updateCoupons = async (id, formState, token) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/discount/${id}`,
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
    console.error("Error deleting coupon:", error);
    toast.error("Failed to delete coupon");
    return false;
  }
};

export const deleteCoupon = async (id, token) => {
  try {
    const response = await axios.delete(
      `${process.env.SERVER_URL}/discount/${id}`,
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
    console.error("Error deleting coupon:", error);
    toast.error("Failed to delete coupon");
    return false;
  }
};

export const applyCoupon = async (amount, code, token) => {
  try {
    const options = { code };
    const response = await axios.get(
      `${process.env.SERVER_URL}/discount/apply`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          amount,
          ...options,
        },
      }
    );
    if (response.status !== 200) throw new Error("Network response was not ok");
    return await response.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    toast.error("Invalid coupon code");
  }
};
