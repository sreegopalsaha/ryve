import React from "react";
import Card from "../molecules/Card";
import { Calendar, MapPin } from "lucide-react";

function ProfileCardLoading() {
  return (
    <Card className="animate-pulse flex flex-col gap-4">
      <div className="w-24 h-24 skeleton self-center rounded-full" />

      <div className="flex flex-col items-center gap-2">
        <div className="w-36 h-6 skeleton" />
        <div className="w-28 h-4 skeleton" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-full h-4 skeleton" />
        <div className="w-full h-4 skeleton" />
        <div className="w-3/4 h-4 skeleton" />
      </div>

      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <div className="w-20 h-4 skeleton" />
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <div className="w-20 h-4 skeleton" />
        </div>
      </div>

      <div className="flex justify-between">
        <div className="w-16 h-6 skeleton" />
        <div className="w-16 h-6 skeleton" />
        <div className="w-16 h-6 skeleton" />
      </div>
    </Card>
  );
}

export default ProfileCardLoading;