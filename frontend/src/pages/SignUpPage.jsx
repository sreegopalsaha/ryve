import React, { useState } from "react";
import Container from "../components/atoms/Container";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/atoms/Card";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [signupLoading, setSignupLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [usernameError, setUsernameError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      if (/\s/.test(value)) {
        setUsernameError("Username cannot contain spaces");
        return;
      } else {
        setUsernameError("");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordMatch(
        name === "password" ? value === formData.confirmPassword : value === formData.password
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch || usernameError) {
      return;
    }
    setSignupLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Signing up with:", formData);
    setSignupLoading(false);
    navigate("/login");
  };

  return (
    <Container className="w-full h-full min-w-screen min-h-screen flex items-center justify-center theme-background">
      <Card>
        <h2 className="text-xl font-semibold text-center theme-text">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            name="fullName"
            label="Full Name"
            autoComplete="name"
            placeholder="Enter your full name"
            className="theme-input"
            required
          />
          <Input
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            name="email"
            label="Email"
            autoComplete="email"
            placeholder="Enter your email"
            className="theme-input"
            required
          />
          <div className="relative">
            <Input
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              name="username"
              label="Choose a username"
              autoComplete="username"
              placeholder="Choose a username"
              className="theme-input"
              required
            />
            {usernameError && (
              <p className="absolute top-full left-0 text-red-500 text-xs mt-1">
                {usernameError}
              </p>
            )}
          </div>

          <Input
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            className="theme-input"
            required
          />
          <div className="relative">
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              name="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="theme-input"
              required
            />
            {!passwordMatch && formData.confirmPassword && (
              <p className="absolute top-full left-0 text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="w-full">
          <p className="text-sm theme-text">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-blue-600 hover:underline theme-link">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline theme-link">
                Privacy Policy
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            disabled={signupLoading || !passwordMatch || usernameError}
            loading={signupLoading}
            className="mt-2 w-full py-3 theme-button"
          >
            Sign Up
          </Button>
        </form>

        <div className="w-full mt-4 flex gap-3 items-center justify-center theme-text">
          <p>
            Already have an account?
            <span className="hover:underline transition-all theme-link">
              <Link to="/login"> Login</Link>
            </span>
          </p>
        </div>
      </Card>
    </Container>
  );
}

export default SignUpPage;