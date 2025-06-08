import React, { useEffect, useState } from "react";
import Screen from "../components/molecules/Screen";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { getStarredPosts } from "../services/ApiServices";
import FeedPosts from "./FeedPage/FeedPosts";
import GlobalError from "../components/errors/GlobalError";
import NoDataFound from "../components/organisms/NoDataFound";
import { Star } from "lucide-react";

function StarredPostsPage() {
  const { currentUser } = useCurrentUser();
  const [posts, setPosts] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const fetchStarredPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getStarredPosts();
      setPosts(res.data?.data || []);
    } catch (error) {
      setPostsError(error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchStarredPosts();
  }, [currentUser]);

  return (
    <Screen middleScreen className="gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight theme-text">
          Starred Posts
        </h1>
      </div>

      {postsLoading ? (
        <PostsLoading />
      ) : postsError ? (
        <GlobalError error={postsError} />
      ) : posts && posts.length > 0 ? (
        <FeedPosts posts={posts} setPosts={setPosts} />
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
