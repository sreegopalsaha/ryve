import React, { useEffect, useState } from "react";
import Container from "../components/atoms/Container";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/molecules/Card";
import { loginUser } from "../services/ApiServices";
import Cookies from "js-cookie";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) navigate("/");
  }, [navigate]);

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (loginError) setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await loginUser(formData);
      const token = res.data.data.accessToken;
      Cookies.set("token", token);
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || "Login failed");
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Container className="w-full min-h-screen flex items-center justify-center theme-background px-4 py-8">
      <Card className="max-w-md w-full p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center theme-text">
          Welcome Back!
        </h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
          Log in to continue to Ryve
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            type="text"
            value={formData.emailOrUsername}
            onChange={handleInputChange}
            name="emailOrUsername"
            label="Email or Username"
            autoComplete="username"
            required
            placeholder="Email or Username"
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

          {loginError && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/20 py-2 px-3 rounded-lg">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loginLoading}
            loading={loginLoading}
            className="w-full py-3 theme-button font-medium text-sm mt-2"
          >
            Log In
          </Button>
        </form>

        <div className="w-full mt-6 flex items-center justify-center theme-text text-sm">
          <p>
            Don&apos;t have an account?
            <Link to="/signup" className="hover:underline font-medium transition-all theme-link pl-1.5">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </Container>
  );
}

export default LoginPage;
