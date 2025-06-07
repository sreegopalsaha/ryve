import React from "react";
import UserCard from "../molecules/UserCard";
import NoDataFound from "./NoDataFound";
import { Users } from "lucide-react";

function UserList({ userList, onFollowRequest }) {
  if (!userList || userList.length === 0) {
    return (
      <NoDataFound
        icon={Users}
        message="No users found"
        subMessage="Try searching for different users"
      />
    );
  }

  return (
    <div className="space-y-3">
      {userList.map((user) => (
        <UserCard key={user._id} user={user} onFollowRequest={onFollowRequest} />
      ))}
    </div>
  );
}

export default UserList;
