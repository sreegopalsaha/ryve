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
  }, [navigate]);

  return (
    <Container className="w-full min-h-screen flex flex-col items-center justify-center theme-background px-4 sm:px-6">
      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight theme-text text-center">
        Welcome to Ryve
      </h1>

      {/* Branding Animation */}
      <BrandingAnimation />

      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto max-w-xs sm:max-w-none">
        <Button
          onClick={() => navigate("/login")}
          className="w-full sm:w-auto px-8 py-3 text-base sm:text-lg font-medium btn-primary transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Login &rarr;
        </Button>

        <Button
          onClick={() => navigate("/signup")}
          className="w-full sm:w-auto px-8 py-3 text-base sm:text-lg font-medium btn-primary transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Sign Up &rarr;
        </Button>
      </div>

      {/* Learn More Link */}
      <a
        href="https://github.com/sreegopalsaha/Ryve"
        target="_blank"
        rel="noopener noreferrer"
        className="text-base sm:text-lg theme-link animate-pulse group mt-12 flex items-center"
      >
        <span>Learn more</span>
        <span className="transition-transform transform group-hover:translate-x-1 inline-block ml-1">
          →
        </span>
      </a>
    </Container>
  );
};

export default LandingPage;
