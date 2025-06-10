import React, { useEffect } from "react";
import Screen from "../../components/molecules/Screen";
import {PostsLoading} from "../../components/loadings/PostLoadingCard";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { usePost } from "../../contexts/PostProvider";
import FeedPosts from "./FeedPosts";
import GlobalError from "../../components/errors/GlobalError";
import PostFormCard from "../../components/organisms/PostFormCard";

function FeedPage() {
  const { currentUser } = useCurrentUser();
  const { posts, setPosts, postsLoading, postsError, fetchFeedPosts } = usePost();

  useEffect(() => {
    if (!currentUser) return;
    if (posts === null) {
      fetchFeedPosts();
    }
  }, [currentUser, posts, fetchFeedPosts]);

  return (
    <Screen middleScreen className="gap-4">
      <PostFormCard setPosts={setPosts}/>

      {

        postsLoading ? <PostsLoading /> : postsError ? <GlobalError error={postsError}/> : <FeedPosts posts={posts || []} setPosts={setPosts}/>

      }
    </Screen>
  );
}
export default FeedPage;
