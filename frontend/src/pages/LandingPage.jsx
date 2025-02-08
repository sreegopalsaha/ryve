import { Link, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Container from "../components/atoms/Container";
import ToggleThemeButton from "../components/molecules/ToggleThemeButton";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Container className="relative  w-full h-full min-w-screen min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-black">
        <div className="absolute top-4 right-4">
          <ToggleThemeButton />
        </div>
        <h1 className="text-5xl sm:text-5xl md:text-8xl font-bold mb-8 tracking-tighter text-neutral-900 dark:text-neutral-300">
          Welcome to Ryve
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-12 text-neutral-700 dark:text-neutral-300">
          Ryve: Build Bonds, Not Algorithms
        </p>
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg bg-white text-black dark:bg-black dark:text-white border border-black/10 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-md bg-opacity-95 hover:bg-opacity-100 dark:bg-opacity-95 dark:hover:bg-opacity-100"
          >
            Login →
          </Button>

          <Button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg bg-white text-black dark:bg-black dark:text-white border border-black/10 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-md bg-opacity-95 hover:bg-opacity-100 dark:bg-opacity-95 dark:hover:bg-opacity-100"
          >
            Sign Up →
          </Button>
        </div>
        <a
          href="https://github.com/sreegopalsaha/Ryve"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-16 dark:text-white text-black animate-pulse"
        >
          Learn more →
        </a>
      </Container>
    </>
  );
};
export default LandingPage;
