"use client";
import "@/styles/login.scss";
import {useSignupHandler} from "@/hooks/auth";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";


export default function SignUp() {
    const { formData, handleChange, handlePhoneChange, handleSubmit, isLoading, message } = useSignupHandler();

    if (isLoading) return <LoadingScreen />;
    if (message) return <p>{message}</p>;

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
                                <h5>Signup</h5>
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
                                        onChange={handlePhoneChange}
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
                                        <div className="login-reg-form-meta">
                                            <div className="remember-meta">
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="subnewsletter"
                                                        name="subscribe"
                                                        checked={formData.subscribe}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="custom-control-label" htmlFor="subnewsletter">
                                                        Subscribe to Our Newsletter
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="single-input-item">
                                        <button type="submit" className="btn btn-sqr">
                                            Register
                                        </button>
                                    </div>
                                </form>
                                <p className="mt-3">Already have an Account? <a href="/signin">SignIn</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
