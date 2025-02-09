import React, { useState } from "react";
import Container from "../components/atoms/Container";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { Link } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Logging in with:", formData);
    setLoginLoading(false);
  };

  return (
    <Container className="w-full h-full min-w-screen min-h-screen flex items-center justify-center theme-background">
      <div className="flex flex-col w-full max-w-md p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl theme-card">
        <h2 className="text-xl font-semibold text-center theme-text">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input
            type="text"
            value={formData.usernameOrEmail}
            onChange={handleInputChange}
            name="usernameOrEmail"
            label="Email or Username"
            autoComplete="username"
            required
            placeholder="Username or Email"
            className="theme-input"
          />
          <Input
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            placeholder="Password"
            className="theme-input"
          />

          <div className="flex justify-end -mt-2">
            <Link 
              to="/forgot-password"
              className="text-sm theme-link"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loginLoading}
            loading={loginLoading}
            className="mt-6 w-full py-3 theme-button"
          >
            Login
          </Button>
        </form>

        <div className="w-full mt-4 flex gap-3 items-center justify-center theme-text">
          <p>Don't have an account?
            <span className="hover:underline transition-all theme-link">
              <Link to="/signup"> Sign up</Link>
            </span>
          </p>
        </div>
      </div>
    </Container>
  );
}

export default LoginPage;
