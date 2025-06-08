import { useEffect, useState } from "react";
import { getSuggestedUsers } from "../../services/ApiServices";
import UserCard from "../molecules/UserCard";
import Card from "../molecules/Card";

function WhoToFollow() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await getSuggestedUsers();
        setUsers(res?.data?.data || []);
      } catch (error) {
        // Silently ignore — section just won't render
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Card className="gap-4">
        <div className="w-32 h-5 skeleton" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 skeleton rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="w-24 h-3 skeleton" />
                <div className="w-16 h-3 skeleton" />
              </div>
            </div>
            <div className="w-16 h-8 skeleton rounded-full" />
          </div>
        ))}
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="gap-2">
        <h2 className="text-base font-bold theme-text mb-1">Who to follow</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">There is no one to follow</p>
      </Card>
    );
  }

  return (
    <Card className="gap-2">
      <h2 className="text-base font-bold theme-text mb-1">Who to follow</h2>
      {users.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </Card>
  );
}

export default WhoToFollow;
