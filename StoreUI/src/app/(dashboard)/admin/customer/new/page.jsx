"use client";

import { useState, useEffect } from "react";
import "@/styles/login.scss";
import toast from "react-hot-toast";
import { signupUser } from "@/app/api/users";
import { useSession } from "next-auth/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function SignUp() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      setToken(session?.user?.token || null);
    }
  }, [status, session]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!token) {
    return <p>You need to be logged in to register.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    if (formData.email) e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(formData.email)) {
    } else {
      toast.error("Invalid Email!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const signupData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const response = await signupUser(signupData, token);
      if (response) {
        toast.success("Signup successful!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    }
  };

  return (
    <div className="login-register-wrapper section-padding">
      <div className="container">
        <div className="member-area-from-wrap">
          <div className="row">
            <div className="col-lg-6">
              <img src="/assets/images/about.jpg" alt="about thumb" />
            </div>
            <div className="col-lg-6">
              <div className="login-reg-form-wrap sign-up-form">
                <h5>Add Customer</h5>
                <form onSubmit={handleSubmit}>
                  <div className="single-input-item">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="single-input-item">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="single-input-item">
                    <PhoneInput
                      country={"in"}
                      name="phone"
                      value={formData.phone}
                      onChange={(phone) =>
                        setFormData((prev) => ({ ...prev, phone }))
                      }
                      containerClass="w-100"
                      inputClass="form-control w-100"
                      buttonClass="btn w-auto"
                    />
                  </div>

                  <div className="row">
                    <div className="col-lg-6">
                      <div className="single-input-item">
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter your Password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="single-input-item">
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Repeat your Password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="single-input-item">
                    <button type="submit" className="btn btn-sqr">
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
