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
          className="px-6 py-3 text-lg font-medium theme-card theme-text transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          Login &rarr;
        </Button>

        <Button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 text-lg font-medium theme-card theme-text transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          Sign Up &rarr;
        </Button>
      </div>

      {/* Learn More Link */}

      <a
        href="https://github.com/sreegopalsaha/Ryve"
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg theme-link animate-pulse group mt-12"
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
