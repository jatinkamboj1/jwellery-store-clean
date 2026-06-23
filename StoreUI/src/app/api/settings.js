import toast from "react-hot-toast";
import axios from "axios";

export const getSettings = async () => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/settings`);
    if (response.status !== 200) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};
