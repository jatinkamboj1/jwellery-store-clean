"use client";
import "@/styles/login.scss";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import "react-phone-input-2/lib/style.css";
import { useSession } from "next-auth/react";
import { ResendOtp, verifyOtp } from "@/app/api/users";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SignUp() {

  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  useEffect(() => {
    if (token) {
      toast.success("You are already logged in");
      router.push("/");
    }
  }, [token]);

  const [formData, setFormData] = useState({
    phone: null,
    email: null,
    otp: null,
  });

  useEffect(() => {
    const storedPhone = localStorage.getItem("to-verify-phone");
    const storedEmail = localStorage.getItem("to-verify-email");
    if (storedPhone || storedEmail) {
      setFormData((prev) => {
        return {
          ...prev,
          phone: storedPhone || null,
          email: storedEmail || null,
        };
      });
    } else {
      router.push("/signup");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyOtp(formData);
      if (response) {
        localStorage.removeItem("to-verify-phone");
        localStorage.removeItem("to-verify-email");
        router.push("/signin");
      }
    } catch (error) {}
  };

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.success("OTP resent");
      const response = await ResendOtp(formData);
    } catch (error) {}
  };

  return (
    <div className="login-register-wrapper section-padding">
      <div className="container">
        <div className="member-area-from-wrap">
          <div className="row">
            <div className="col-lg-6 d-none d-lg-block">
            <img style={{aspectRatio:'1/1', objectFit: "cover"}} src="/assets/images/about.jpg" alt="sigup" />
            </div>
            <div className="col-lg-6">
              <div className="login-reg-form-wrap sign-up-form">
                <h5>OTP Verification</h5>
                <form onSubmit={handleSubmit}>
                  <div className="single-input-item">
                    <input
                      type="otp"
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={(e) => handleChange(e)}
                      required
                    />
                  </div>
                  <div className="single-input-item">
                    <button type="submit" className="btn btn-sqr">
                      Verify
                    </button>
                    <button type="button" onClick={handleResendSubmit} className="btn btn-sqr ms-4">
                      ReSent OTP
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
