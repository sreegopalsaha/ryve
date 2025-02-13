function Screen({ children, className = "", middleScreen }) {
  return (
    <div
      className={`flex flex-col min-h-screen h-full pb-16 md:pb-5 px-1 pt-5 md:p-5 theme-background theme-text 
      ${middleScreen ? "w-full md:flex-1 md:ml-[25%] md:mr-[30%] md:border-x md:border-x-black md:dark:border-x-white" : ""}
      ${className}`}
    >
      {children}
    </div>
  );
}
export default Screen;