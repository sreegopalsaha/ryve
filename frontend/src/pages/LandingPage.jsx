import { Link, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Container from "../components/atoms/Container";
import ToggleThemeButton from "../components/molecules/ToggleThemeButton";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Container className="relative w-full h-full min-w-screen min-h-screen flex flex-col items-center justify-center theme-background">
        <div className="absolute top-4 right-4">
          <ToggleThemeButton />
        </div>
        
        <h1 className="text-5xl sm:text-5xl md:text-8xl font-bold mb-8 tracking-tighter theme-text">
          Welcome to Ryve
        </h1>
        
        <p className="text-xl sm:text-2xl md:text-3xl mb-12 theme-text opacity-90">
          Ryve: Build Bonds, Not Algorithms
        </p>
        
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => navigate("/login")}
            className="theme-card theme-text px-6 py-3 rounded-lg hover:-translate-y-0.5 backdrop-blur-md
                     border border-primary-light-border dark:border-primary-dark-border
                     bg-opacity-95 hover:bg-opacity-100"
          >
            Login →
          </Button>

          <Button
            onClick={() => navigate("/signup")}
            className="theme-card theme-text px-6 py-3 rounded-lg hover:-translate-y-0.5 backdrop-blur-md
                     border border-primary-light-border dark:border-primary-dark-border
                     bg-opacity-95 hover:bg-opacity-100"
          >
            Sign Up →
          </Button>
        </div>
        <a
          href="https://github.com/sreegopalsaha/Ryve"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-16 theme-link animate-pulse"
        >
          Learn more →
        </a>
      </Container>
    </>
  );
};

export default LandingPage;