"use client";
import "@/styles/login.scss";
import Link from "next/link";
import { useState } from "react";
import { useAuthHandler } from "@/hooks/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const { handleLogin, error, rememberMe, setRememberMe } = useAuthHandler();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleLogin(formData.get("email"), formData.get("password"), `/`);
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
                alt="signin"
              />
            </div>
            <div className="col-lg-6">
              <div className="login-reg-form-wrap">
                <h5>Sign In</h5>
                <form method="post" onSubmit={handleSubmit}>
                  <div className="single-input-item">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email or Username"
                      required
                    />
                  </div>
                  <div className="single-input-item">
                    <div style={{ position: "relative" }}>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your Password"
                        required
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
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
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="single-input-item">
                    <div className="login-reg-form-meta d-flex align-items-center justify-content-between">
                      <div className="remember-meta">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                          />
                          <label className="custom-control-label" htmlFor="rememberMe">
                            Remember Me
                          </label>
                        </div>
                      </div>
                      <Link href="/forgot-password" className="forget-pwd">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                  <div className="single-input-item">
                    <button className="btn btn-sqr">Login</button>
                  </div>
                  {error && <p className="error-text">{error}</p>}
                </form>
                <p className="mt-3">
                  Don&&apos;t have an Account? <a href="/signup">Create Account</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
