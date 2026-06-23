"use client";

import "@/styles/login.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { forgotPassword } from "@/app/api/users";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPassword() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password must match");
      return;
    }

    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    const response = await forgotPassword(formData.email, formData.password);
    setLoading(false);

    if (response?.success) {
      setFormData({ email: "", password: "", confirmPassword: "" });
      router.push("/signin");
    }
  };

  return (
    <div className="login-register-wrapper section-padding">
      <div className="container">
        <div className="member-area-from-wrap">
          <div className="row">
            <div className="col-lg-6 d-none d-lg-block">
              <img
                style={{ aspectRatio: "1/1", objectFit: "cover" }}
                src="/assets/images/about.jpg"
                alt="forgot-password"
              />
            </div>
            <div className="col-lg-6">
              <div className="login-reg-form-wrap">
                <h5>Forgot Password</h5>
                <form onSubmit={handleSubmit}>
                  <div className="single-input-item">
                    <label htmlFor="forgot-email" className="mb-2">
                      Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="single-input-item">
                    <label htmlFor="forgot-password" className="mb-2">
                      New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="forgot-password"
                        type={showPassword.password ? "text" : "password"}
                        name="password"
                        placeholder="Enter New Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        aria-label={showPassword.password ? "Hide password" : "Show password"}
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            password: !prev.password,
                          }))
                        }
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          lineHeight: 0,
                        }}
                      >
                        {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="single-input-item">
                    <label htmlFor="forgot-confirm-password" className="mb-2">
                      Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="forgot-confirm-password"
                        type={showPassword.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        aria-label={showPassword.confirmPassword ? "Hide password" : "Show password"}
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          }))
                        }
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          lineHeight: 0,
                        }}
                      >
                        {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="single-input-item">
                    <button type="submit" className="btn btn-sqr" disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
                <p className="mt-3">
                  Back to <Link href="/signin">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
