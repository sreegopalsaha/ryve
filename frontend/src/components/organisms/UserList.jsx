import UserCard from "../molecules/UserCard";
import NoDataFound from "./NoDataFound";

function UserList({ userList, title }) {
  return (
    <>
      {userList.length === 0 ? (
        <NoDataFound message="No User Found" />
      ) : (
        <div className="w-full max-w-full p-4">
          {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}{" "}
          <div className="flex flex-col gap-3">
            {userList.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}{" "}
          </div>
        </div>
      )}
    </>
  );
}

export default UserList;
