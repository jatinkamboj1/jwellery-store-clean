"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { signupUser } from "@/app/api/users";


export function useSignupHandler() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/"); // Redirect logged-in users
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        subscribe: false,
    });

    const [errors, setErrors] = useState({});

    if (status === "loading") return { isLoading: true, message: "Loading..." };
    if (status === "authenticated") return { isLoading: false, message: "You're already logged in." };

    const validateForm = () => {
        let newErrors = {};
        if (formData.fullName.length < 3) newErrors.fullName = "Full Name must be at least 3 characters";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!/^[0-9]{10,}$/.test(formData.phone)) newErrors.phone = "Phone number must be at least 10 digits";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlePhoneChange = (value, country, event, formattedValue) => {
        setFormData((prev) => ({
            ...prev,
            phone: value, // Use the provided phone number string
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const signupData = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            };

            const response = await signupUser(signupData);
            const {userId, phone, email} = response
            if (response) {
                toast.success("Signup successful! Please log in.");
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: "",
                    subscribe: false,
                });
                setErrors({});
                localStorage.setItem("to-verify-phone", phone || formData.phone);
                localStorage.setItem("to-verify-email", email || formData.email);
                router.push("/otp"); // Redirect to login page
            }
        } catch (error) {
            toast.error("Signup failed. Please try again.");
        }
    };

    return { formData, handleChange, handlePhoneChange, handleSubmit, errors, isLoading: false, message: null };
}

export function useAuthHandler() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || `${process.env.NEXTAUTH_URL}/`;

    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            router.replace(callbackUrl);
        }
    }, [sessionStatus, router, callbackUrl]);

    const handleLogin = async (email, password, url) => {
        const handleError = (message) => {
            setError(message);
            toast.error(message);
        };

        if (!email.includes("@")) return handleError("Invalid Email Format");
        if (!password || password.length < 8) return handleError("Password must be at least 8 characters");

        try {
            const result = await signIn("credentials", { redirect: false, email, password });

            if (result?.error) {
                handleError("Invalid email or password");
            } else {
                toast.success("Login successful!");
                if (rememberMe) {
                    localStorage.setItem("rememberMe", email);
                }
                router.push(url ?? callbackUrl);
            }
        } catch (error) {
            handleError("Something went wrong, please try again.");
        }
    };

    return { handleLogin, error, rememberMe, setRememberMe };
}