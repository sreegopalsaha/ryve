import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import Screen from "../components/molecules/Screen";
import Button from "../components/atoms/Button";
import { PageHeader } from "../components/molecules/Page-Header";
import NoDataFound from "../components/organisms/NoDataFound";
import GlobalError from "../components/errors/GlobalError";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import { getFollowRequests, handleFollowRequest } from "../services/ApiServices";
import { DEFAULT_AVATAR } from "../utils/constants";

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
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <PageHeader title="Follow Requests" />

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
          <div className="flex flex-col gap-2.5">
            {requests.map((request) => {
              const user = request.follower || request;
              const requestId = request._id || request.requestId || user._id;

              return (
                <div
                  key={requestId}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors gap-3 border border-gray-100 dark:border-gray-800/60"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    onClick={() => user.username && navigate(`/${user.username}`)}
                  >
                    <img
                      src={user.profilePicture || DEFAULT_AVATAR}
                      alt={user.fullname || user.username || "User avatar"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium theme-text truncate">{user.fullname || "User"}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{user.username || "unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      loading={actionLoading[requestId] === "accept"}
                      disabled={Boolean(actionLoading[requestId])}
                      onClick={() => handleAction(requestId, "accept")}
                      className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium btn-primary"
                    >
                      Accept
                    </Button>
                    <Button
                      loading={actionLoading[requestId] === "reject"}
                      disabled={Boolean(actionLoading[requestId])}
                      onClick={() => handleAction(requestId, "reject")}
                      className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}

export default FollowRequestsPage;
