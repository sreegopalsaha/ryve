import React, { useEffect, useState } from "react";
import Container from "../components/atoms/Container";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/atoms/Card";
import { loginUser } from "../services/ApiServices";
import Cookies from "js-cookie";

function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) navigate("/");
  }, []);

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    <Container className="w-full h-full min-w-screen min-h-screen flex items-center justify-center theme-background">
      <Card className="max-w-md">
        <h2 className="text-xl font-semibold text-center theme-text">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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

          <div className="flex justify-end -mt-2">
            <Link to="/forgot-password" className="text-sm theme-link">
              Forgot password?
            </Link>
          </div>
          <div className="h-5 w-full flex items-center">
            {loginError && <p className="text-red-500">{loginError}</p>}
          </div>
          <Button
            type="submit"
            disabled={loginLoading}
            loading={loginLoading}
            className="w-full py-3 theme-button"
          >
            Login
          </Button>
        </form>

        <div className="w-full mt-4 flex gap-3 items-center justify-center theme-text">
          <p>
            Don't have an account?
            <span className="hover:underline transition-all theme-link">
              <Link to="/signup"> Sign up</Link>
            </span>
          </p>
        </div>
      </Card>
    </Container>
  );
}

export default LoginPage;
