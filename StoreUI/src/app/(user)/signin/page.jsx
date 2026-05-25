"use client";
import "@/styles/login.scss";
import Link from "next/link";
import {useAuthHandler} from "@/hooks/auth";

export default function SignIn() {
    const { handleLogin, error, rememberMe, setRememberMe } = useAuthHandler();

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
                            <img style={{aspectRatio:'1/1', objectFit: "cover"}} src="/assets/images/about.jpg" alt="signin" />
                        </div>
                        <div className="col-lg-6">
                            <div className="login-reg-form-wrap">
                                <h5>Sign In</h5>
                                <form method="post" onSubmit={handleSubmit}>
                                    <div className="single-input-item">
                                        <input name="email" type="email" placeholder="Email or Username" required />
                                    </div>
                                    <div className="single-input-item">
                                        <input name="password" type="password" placeholder="Enter your Password" required />
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
                                <p className="mt-3">Don&&apos;t have an Account? <a href="/signup">Create Account</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
