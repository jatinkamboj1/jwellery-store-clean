import toast from "react-hot-toast";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.SERVER_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const user = await res.json();

          if (!res.ok || !user) {
            console.error("Login failed:", user?.message || "Unknown error");
            return null;
          }

          // Ensure required fields exist
          if (user?.id && user?.token) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              token: user.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.token = token.token;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const updateUserInfo = async (updateData, email, token) => {
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/user/updateInfo/${email}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
  }
};

export const updateUserPassword = async (
  id,
  oldPassword,
  newPassword,
  token
) => {
  try {
    const response = await fetch(`/user/updatePass/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (err) {
    console.error(err);
    toast.error("Error on updatePass");
    return false;
  }
};

export const allUsers = async (token, offset = 0, limit = 10, options) => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
    console.error("Error getting all users:", error);
    toast.error("Failed to get all users");
  }
};

export const fetchUser = async (id, token) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/user/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error("Error getting all users:", error);
    toast.error("Failed to get all users");
  }
};

export const deleteUser = async (token, id) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/user/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.ok;
  } catch (error) {
    console.error(error);
    toast.error("Error while hitting wishlist delete api");
    return false;
  }
};

export const updateUserIdInfo = async (updateData, id, token) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/user/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
  }
};

export const updateUserInfoByAdmin = async (updateData, id, token) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/user/admin/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
  }
};

export const signupUser = async (signupData, token) => {
  // if (!token) {
  //   console.error("Error: No authentication token provided.");
  //   toast.error("Authentication token is missing.");
  //   return;
  // }

  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error Response:", errorMessage);
      toast.error(`Signup failed: ${errorMessage}`);
      return;
    }

    const data = await response.json();
    // //console.log("Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error during signup:", error);
    toast.error("Signup failed. Please try again.");
  }
};

export const ResendOtp = async (formData) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      toast.error(errorMessage.error);
      return;
    }

    const data = await response.json();
    toast.success(data.message)
    return true;
  } catch (error) {
    toast.error("OTP Sent Failed.");
  }
};

export const verifyOtp = async (formData) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      toast.error(errorMessage.error);
      return;
    }

    const data = await response.json();
    toast.success(data.message)
    return true;
  } catch (error) {
    toast.error("OTP Verification Failed.");
  }
};

export const getUserById = async (token, id = "user") => {
  try {
    const resposne = await axios.get(`${process.env.SERVER_URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return resposne.data;
  } catch (error) {
    console.error("Error during fetching the user ", error);
    toast.error("Error during fetching the user ");
  }
};

export const forgotPassword = async (email, password) => {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/user/pass`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data?.message || "Failed to update password");
      return null;
    }

    toast.success(data?.message || "Password updated successfully");
    return data;
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error("Failed to update password");
    return null;
  }
};

export const updateUser = async (token, userdata) => {
  try {
    const response = await axios.put(
      `${process.env.SERVER_URL}/user`,
      userdata,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during updating the user ", error);
    toast.error("Error during updating the user");
  }
};
