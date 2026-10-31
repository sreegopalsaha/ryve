import React, { useEffect, useState } from "react";
import UserList from "../components/organisms/UserList";
import { getFollowing, getFollowers } from "../services/ApiServices";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import GlobalError from "../components/errors/GlobalError";
import Screen from "../components/molecules/Screen";
import { PageHeader } from "../components/molecules/Page-Header";
import { useParams, useLocation } from "react-router-dom";

function FollowingFollowersPage() {
  const { userIdentifier } = useParams();
  const location = useLocation();

  const pageType = location.pathname.includes("followers") ? "followers" : "following";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userList, setUserList] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res =
          pageType === "following"
            ? await getFollowing(userIdentifier)
            : await getFollowers(userIdentifier);
        if (!isCancelled) {
          setUserList(res?.data?.data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [pageType, userIdentifier]);

  return (
    <Screen middleScreen className="gap-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <PageHeader
          title={pageType === "following" ? "Following" : "Followers"}
          showBack
        />
        {loading ? (
          <PostsLoading />
        ) : error ? (
          <GlobalError error={error} />
        ) : (
          <UserList userList={userList || []} />
        )}
      </div>
    </Screen>
  );
}

export default FollowingFollowersPage;
