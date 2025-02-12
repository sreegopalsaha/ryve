import { MessageSquare } from "lucide-react";

function NoDataFound({ message = "No data found", subMessage = "It looks empty here.", icon: Icon = MessageSquare }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center theme-text">
      <Icon size={48} className="text-gray-400 dark:text-gray-500" />
      <p className="mt-2 text-lg font-semibold">{message}</p>
      {subMessage && <p className="text-sm">{subMessage}</p>}
    </div>
  );
}

export default NoDataFound;
