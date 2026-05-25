import toast from "react-hot-toast";
import axios from "axios";
import { Prosto_One } from "next/font/google";

export const getbannerhomepage = async (options) => {
  // //console.log("getbannerhomepage: ", options);

  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/banner/homebanner`,
      {
        params: {
          type: options,
        },
      }
    );

    if (response.status !== 200) throw new Error("Network response was not ok");

    return await response.data;
  } catch (error) {
    console.error("Error fetching Banner:", error);
    toast.error("Failed to fetch Banner");
    return false;
  }
};

export const getFeaturedProducts = async (options) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/product/home-featured`,
      {
        params: {
          type: options,
        },
      }
    );
    return await response.data;
  } catch (error) {
    console.error("Error fetchingFeaturedProducts :", error);
    toast.error("Failed to fetch FeaturedProducts ");
  }
};

export const getFeaturedCategory = async (visible_on) => {
  try {
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/category-banner`,
      {
        params: {
          visible_on,
        },
      }
    );
    return await response.data;
  } catch (error) {
    console.error("Error getFeaturedCategory :", error);
    toast.error("Failed to fetch getFeaturedCategory ");
  }
};

export const getNavCategory = async (visible_on) => {
  try {
    let filter;
    if (visible_on) {
      filter.visible_on = visible_on;
    }
    const response = await axios.get(
      `${process.env.SERVER_URL}/category/navcategories`,
      {
        params: filter,
      }
    );
    return await response.data;
  } catch (error) {
    console.error("Error getFeaturedCategory :", error);
    toast.error("Failed to fetch getFeaturedCategory ");
  }
};
