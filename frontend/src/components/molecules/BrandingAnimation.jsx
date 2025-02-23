import { useEffect, useState } from "react";

const BrandingAnimation = () => {
  const brandingTexts = [
    "Ryve: Build connections, not algorithms.",
    "Control your feed – choose what you want to see.",
    "Keep your account private and connect with who you choose.",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % brandingTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-16 w-full flex justify-center items-center overflow-hidden">
      {brandingTexts.map((text, i) => (
        <span
          key={i}
          className={`absolute text-center text-xl sm:text-2xl md:text-3xl font-semibold theme-text transition-all duration-1000 ease-in-out ${
            i === index
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {text}
        </span>
      ))}
    </div>
  );
};

export default BrandingAnimation;