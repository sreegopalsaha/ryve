import React, { useEffect, useState } from "react";
import Screen from "../components/molecules/Screen";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { getStarredPosts } from "../services/ApiServices";
import FeedPosts from "./FeedPage/FeedPosts";
import GlobalError from "../components/errors/GlobalError";
import { Star } from "lucide-react";
import NoDataFound from "../components/organisms/NoDataFound";

function StarredPostsPage() {
  const { currentUser } = useCurrentUser();
  const [posts, setPosts] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const fetchStarredPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getStarredPosts();
      setPosts(res.data?.data);
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

  if (postsLoading) {
    return <Screen middleScreen><PostsLoading /></Screen>;
  }

  if (postsError) {
    return <Screen middleScreen><GlobalError error={postsError} /></Screen>;
  }

  if (!posts || posts.length === 0) {
    return (
      <Screen middleScreen>
        <NoDataFound
          icon={Star}
          message="No starred posts yet"
          subMessage="Star posts you want to save for later"
        />
      </Screen>
    );
  }

  return (
    <Screen middleScreen className="gap-4">
      <FeedPosts posts={posts} setPosts={setPosts} />
    </Screen>
  );
}

export default StarredPostsPage; 