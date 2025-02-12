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
      case 403:
        title = "Private Account";
        message =
          "This is a private account. Follow the user to see their posts and activity.";
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
    <Card className="items-center justify-center flex-1">
        <div className="w-24 h-24 flex items-center justify-center">
          <Icon size={48} className="text-gray-500 dark:text-gray-300" />
        </div>

        <h1 className="text-xl font-bold mt-4">{title}</h1>
        <p className="text-center mt-2 max-w-sm">
          {message}
        </p>

        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => window.history.back()}
            className="px-6 py-2 text-sm rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            Go Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Retry
          </Button>
        </div>
    </Card>
  );
};

export default ErrorPage;
