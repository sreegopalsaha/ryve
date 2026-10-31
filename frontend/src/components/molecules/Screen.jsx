function Screen({ children, className = "", middleScreen, fullWidthMiddle = false }) {
  const middleClass = middleScreen
    ? fullWidthMiddle
      ? "w-full md:flex-1 md:ml-[25%] md:border-l md:border-gray-200 md:dark:border-gray-800"
      : "w-full md:flex-1 md:ml-[25%] lg:mr-[30%] md:border-x md:border-gray-200 md:dark:border-gray-800"
    : "";

  return (
    <div
      className={`flex flex-col min-h-screen h-full pb-20 md:pb-6 px-3 sm:px-4 pt-4 md:p-6 theme-background theme-text ${middleClass} ${className}`}
    >
      {children}
    </div>
  );
}

export default Screen;
