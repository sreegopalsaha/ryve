import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import Screen from "../components/molecules/Screen";
import Button from "../components/atoms/Button";
import NoDataFound from "../components/organisms/NoDataFound";
import GlobalError from "../components/errors/GlobalError";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import { getFollowRequests, handleFollowRequest } from "../services/ApiServices";

function FollowRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchFollowRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFollowRequests();
      setRequests(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching follow requests:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: action }));
      await handleFollowRequest(requestId, action);
      setRequests((prev) =>
        prev ? prev.filter((req) => (req._id || req.requestId || req.follower?._id) !== requestId) : []
      );
    } catch (err) {
      console.error(`Error while handling follow request (${action}):`, err);
    } finally {
      setActionLoading((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    }
  };

  return (
    <Screen middleScreen className="gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight theme-text">Follow Requests</h1>
      </div>

      {/* Content */}
      {loading ? (
        <PostsLoading />
      ) : error ? (
        <GlobalError error={error} />
      ) : !requests || requests.length === 0 ? (
        <NoDataFound
          message="No follow requests"
          subMessage="You don't have any pending follow requests."
          icon={UserPlus}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => {
            const user = request.follower || request;
            const requestId = request._id || request.requestId || user._id;

            return (
              <div
                key={requestId}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/${user.username}`)}
                >
                  <img
                    src={user.profilePicture || "/default-avatar.png"}
                    alt={user.fullname || user.username || "User avatar"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium theme-text">{user.fullname}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    loading={actionLoading[requestId] === "accept"}
                    disabled={!!actionLoading[requestId]}
                    onClick={() => handleAction(requestId, "accept")}
                    className="px-4 py-1.5 text-sm font-medium rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    loading={actionLoading[requestId] === "reject"}
                    disabled={!!actionLoading[requestId]}
                    onClick={() => handleAction(requestId, "reject")}
                    className="px-4 py-1.5 text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

export default FollowRequestsPage;
