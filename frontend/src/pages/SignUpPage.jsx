import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Eye, EyeOff, ArrowLeft, Check, X, LoaderCircle } from "lucide-react";
import Container from "../components/atoms/Container";
import Button from "../components/atoms/Button";
import Card from "../components/molecules/Card";
import { registerUser, checkUsernameAvailability } from "../services/ApiServices";
import { useCurrentUser } from "../contexts/CurrentUserProvider";

const inputStyle =
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 " +
  "bg-primary-light-input dark:bg-primary-dark-input " +
  "border-primary-light-border dark:border-primary-dark-border " +
  "text-primary-light-text dark:text-primary-dark-text " +
  "placeholder-gray-400 dark:placeholder-gray-600 " +
  "focus:ring-2 focus:ring-primary-light-accent dark:focus:ring-primary-dark-accent focus:border-transparent";

function SignUpPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get("token")) navigate("/");
  }, [navigate]);

  const [step, setStep] = useState(0); // 0: Username, 1: Profile (Name & Email), 2: Password
  const [direction, setDirection] = useState("forward");
  const [isVisible, setIsVisible] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null); // null | "checking" | { available: boolean, message: string }
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const debounceTimer = useRef(null);
  const usernameInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Auto-focus active step's input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) usernameInputRef.current?.focus();
      if (step === 1) nameInputRef.current?.focus();
      if (step === 2) passwordInputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, [step]);

  // Live debounced username check
  const checkUsername = useCallback((val) => {
    clearTimeout(debounceTimer.current);
    if (!val || val.length < 3 || !/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus("checking");
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(val);
        setUsernameStatus({
          available: res.data.data.available,
          message: res.data.message,
        });
      } catch {
        setUsernameStatus(null);
      }
    }, 450);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "username") {
      setUsernameStatus(null);
      checkUsername(value);
    }
  };

  const changeStep = (nextStep) => {
    setDirection(nextStep > step ? "forward" : "back");
    setIsVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setApiError("");
      setIsVisible(true);
    }, 150);
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Must be at least 3 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = "Only letters, numbers, and underscores allowed";
      } else if (usernameStatus && !usernameStatus.available) {
        newErrors.username = usernameStatus.message;
      }
    }

    if (step === 1) {
      if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isContinueDisabled = () => {
    if (step === 0) {
      return (
        !formData.username.trim() ||
        formData.username.length < 3 ||
        !/^[a-zA-Z0-9_]+$/.test(formData.username) ||
        usernameStatus === "checking" ||
        (usernameStatus && !usernameStatus.available)
      );
    }
    if (step === 1) {
      return !formData.fullname.trim() || !formData.email.trim();
    }
    if (step === 2) {
      return !formData.password || formData.password.length < 6;
    }
    return false;
  };

  const { fetchCurrentUser } = useCurrentUser() || {};

  const handleNext = async (e) => {
    e?.preventDefault();
    if (!validateCurrentStep()) return;

    if (step < 2) {
      changeStep(step + 1);
      return;
    }

    // Submit registration & auto-login
    setLoading(true);
    setApiError("");
    try {
      const res = await registerUser(formData);
      const token = res.data?.data?.accessToken;
      if (token) {
        Cookies.set("token", token);
        if (fetchCurrentUser) {
          await fetchCurrentUser();
        }
      }
      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNext(e);
  };

  const stepHeaders = [
    { title: "Pick a username", subtitle: "Choose your unique handle to get started." },
    { title: "Tell us about you", subtitle: "Enter your full name and email." },
    { title: "Create a password", subtitle: "Set up a secure password for your account." },
  ];

  return (
    <Container className="w-full min-h-screen flex items-center justify-center theme-background p-4">
      <Card className="max-w-md w-full">
        {/* Navigation & Progress */}
        <div className="flex items-center justify-between mb-4 min-h-[28px]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => changeStep(step - 1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step
                    ? "w-6 bg-primary-light-accent dark:bg-primary-dark-accent"
                    : idx < step
                    ? "w-2 bg-primary-light-accent dark:bg-primary-dark-accent opacity-60"
                    : "w-2 bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content with Smooth Animation */}
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateX(0)"
              : direction === "forward"
              ? "translateX(-12px)"
              : "translateX(12px)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold theme-text">{stepHeaders[step].title}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {stepHeaders[step].subtitle}
            </p>
          </div>

          {/* STEP 0: Username */}
          {step === 0 && (
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">
                  @
                </span>
                <input
                  ref={usernameInputRef}
                  id="signup-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                  placeholder="username"
                  className={`${inputStyle} pl-8 pr-10 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : usernameStatus?.available
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
                {/* Status indicator inside input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {usernameStatus === "checking" && (
                    <LoaderCircle size={16} className="animate-spin text-gray-400" />
                  )}
                  {usernameStatus && typeof usernameStatus === "object" && (
                    usernameStatus.available ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )
                  )}
                </div>
              </div>

              {/* Status Message / Error */}
              {errors.username ? (
                <p className="text-xs text-red-500">{errors.username}</p>
              ) : usernameStatus && typeof usernameStatus === "object" ? (
                <p className={`text-xs ${usernameStatus.available ? "text-green-500" : "text-red-500"}`}>
                  {usernameStatus.message}
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Use letters, numbers, and underscores
                </p>
              )}
            </div>
          )}

          {/* STEP 1: Full Name & Email */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="signup-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  ref={nameInputRef}
                  id="signup-name"
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") document.getElementById("signup-email")?.focus();
                  }}
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`${inputStyle} ${errors.fullname ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.fullname && <p className="text-xs text-red-500">{errors.fullname}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="signup-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`${inputStyle} ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Password */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="signup-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="new-password"
                    placeholder="Enter at least 6 characters"
                    className={`${inputStyle} pr-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="theme-link hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="theme-link hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}

          {/* General API error */}
          {apiError && <p className="mt-3 text-sm text-red-500 text-center">{apiError}</p>}

          {/* Continue / Submit Button */}
          <div className="mt-6">
            <Button
              type="button"
              onClick={handleNext}
              disabled={isContinueDisabled() || loading}
              loading={loading}
              className="w-full py-3 text-sm font-medium theme-button"
            >
              {step < 2 ? "Continue" : "Create Account"}
            </Button>
          </div>
        </div>

        {/* Footer: Link to Login */}
        <div className="mt-6 text-center text-sm theme-text">
          <span>Already have an account? </span>
          <Link to="/login" className="font-medium theme-link hover:underline">
            Log in
          </Link>
        </div>
      </Card>
    </Container>
  );
}

export default SignUpPage;

