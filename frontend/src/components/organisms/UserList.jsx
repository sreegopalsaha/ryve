import UserCard from "../molecules/UserCard";
import NoDataFound from "./NoDataFound";

function UserList({ userList, title }) {
  if (!userList || userList.length === 0) {
    return <NoDataFound message="No User Found" />;
  }

  return (
    <div className="w-full max-w-full p-2 sm:p-4">
      {title && <h2 className="text-xl font-semibold mb-4 theme-text">{title}</h2>}
      <div className="flex flex-col gap-2">
        {userList.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default UserList;
