import toast from "react-hot-toast";
import axios from "axios";

export const addTags = async (tags, token) => {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/tags`, tags, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 201) toast.error("Unable to create tag");
    return response.data;
  } catch (error) {
    console.error("Error adding tags:", error);
    toast.error("Error adding tags.");
    return false;
  }
};

export const fetchTags = async (token) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/tags`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) toast.error("Tags not found");
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    toast.error("Error fetching tags.");
    return false;
  }
};
