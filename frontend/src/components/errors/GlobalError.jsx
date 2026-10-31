import Card from "../molecules/Card";
import Button from "../atoms/Button";
import { AlertTriangle, WifiOff, ShieldX, ServerCrash } from "lucide-react";

const ErrorPage = ({ error }) => {
  if (!error) return null;

  let title = "Something Went Wrong";
  let message = "An unexpected error occurred. Please try again later.";
  let Icon = AlertTriangle;

  if (error.response) {
    const { status } = error.response;

    switch (status) {
      case 404:
        title = "Page Not Found";
        message =
          "The page you are looking for doesn't exist or has been removed.";
        Icon = AlertTriangle;
        break;
      case 401:
        title = "Session Expired";
        message = "Your session has expired. Please log in again.";
        Icon = ShieldX;
        break;
      case 403:
        title = "Access Restricted";
        message =
          "This account is private or you do not have permission to view this content.";
        Icon = ShieldX;
        break;
      case 500:
        title = "Server Error";
        message = "There was an error on the server. Please try again later.";
        Icon = ServerCrash;
        break;
      default:
        title = `Error ${status || "Unknown"}`;
        message = error.response.data?.message || message;
        Icon = AlertTriangle;
        break;
    }
  } else if (error.request) {
    title = "Network Error";
    message =
      "Unable to connect to the server. Please check your internet connection.";
    Icon = WifiOff;
  }

  return (
    <Card className="items-center justify-center flex-1 max-w-lg mx-auto my-8 p-6 sm:p-8 text-center">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
        <Icon size={40} className="text-gray-500 dark:text-gray-300" />
      </div>

      <h1 className="text-xl font-bold mt-3 theme-text">{title}</h1>
      <p className="text-center mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => window.history.back()}
          className="px-5 py-2 text-sm rounded-full btn-primary"
        >
          Go Back
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="px-5 py-2 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Retry
        </Button>
      </div>
    </Card>
  );
};

export default ErrorPage;
