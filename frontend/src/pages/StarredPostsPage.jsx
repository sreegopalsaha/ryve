import React, { useEffect } from "react";
import Screen from "../components/molecules/Screen";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { usePost } from "../contexts/PostProvider";
import FeedPosts from "./FeedPage/FeedPosts";
import GlobalError from "../components/errors/GlobalError";
import NoDataFound from "../components/organisms/NoDataFound";
import { Star } from "lucide-react";

function StarredPostsPage() {
  const { currentUser } = useCurrentUser();
  const {
    starredPosts,
    starredPostsLoading,
    starredPostsError,
    fetchStarredPosts,
    setStarredPosts,
  } = usePost();

  useEffect(() => {
    if (!currentUser) return;
    if (starredPosts === null) {
      fetchStarredPosts();
    }
  }, [currentUser, starredPosts, fetchStarredPosts]);

  const isLoading = starredPostsLoading || (starredPosts === null && !starredPostsError);

  return (
    <Screen middleScreen className="gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight theme-text">
          Starred Posts
        </h1>
      </div>

      {isLoading ? (
        <PostsLoading />
      ) : starredPostsError ? (
        <GlobalError error={starredPostsError} />
      ) : starredPosts && starredPosts.length > 0 ? (
        <FeedPosts posts={starredPosts} setPosts={setStarredPosts} />
      ) : (
        <NoDataFound
          icon={Star}
          message="No starred posts yet"
          subMessage="Posts you star will appear here for later retrieval."
        />
      )}
    </Screen>
  );
}

export default StarredPostsPage;
