function Screen({ children, className = "", middleScreen }) {
  return (
    <div
      className={`min-h-screen h-full flex flex-col p-5 theme-background theme-text 
      ${middleScreen ? "w-full md:flex-1 md:ml-[25%] md:mr-[30%] md:border-x md:border-x-black md:dark:border-x-white md:border-y-0" : ""}
      ${className}`}
    >
      {children}
    </div>
  );
}
export default Screen;