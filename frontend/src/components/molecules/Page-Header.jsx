import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  showBack = false,
  backUrl,
  onBack,
  children,
  className = "",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const hasBack = Boolean(showBack || backUrl || onBack);

  return (
    <div
      className={`flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        {hasBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 theme-text" />
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight theme-text">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export default PageHeader;


