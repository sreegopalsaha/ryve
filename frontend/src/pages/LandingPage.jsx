import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Container from "../components/atoms/Container";
import Cookies from "js-cookie";
import BrandingAnimation from "../components/molecules/BrandingAnimation";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) navigate("/");
  }, []);

  return (
    <Container className="w-full h-full min-w-screen min-h-screen flex flex-col items-center justify-center theme-background px-6">
      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight theme-text text-center">
        Welcome to Ryve
      </h1>

      {/* Branding Animation */}
      <BrandingAnimation />

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-lg text-lg font-medium theme-card theme-text transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          Login →
        </Button>

        <Button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 rounded-lg text-lg font-medium theme-card theme-text transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          Sign Up →
        </Button>
      </div>

      {/* Learn More Link */}
      <a
        href="https://github.com/sreegopalsaha/Ryve"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 text-lg theme-link animate-pulse"
      >
        Learn more →
      </a>
    </Container>
  );
};

export default LandingPage;