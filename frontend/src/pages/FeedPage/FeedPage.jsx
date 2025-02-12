import React, { useEffect, useState } from "react";
import Screen from "../../components/molecules/Screen";
import {PostsLoading} from "../../components/Loadings/PostLoadingCard";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { getFeedPosts } from "../../services/ApiServices";
import FeedPosts from "./FeedPosts";
import GlobalError from "../../components/errors/GlobalError";
import PostFormCard from "../../components/organisms/PostFormCard";

function FeedPage() {
  const { currentUser } = useCurrentUser();
  const [posts, setPosts] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const fetchFeedPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getFeedPosts();
      setPosts(res.data?.data);
    } catch (error) {
      setPostsError(error);
    }finally{
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if(!currentUser) return;
    fetchFeedPosts();
  }, [currentUser]);

  return (
    <Screen middleScreen className="gap-4">
      <PostFormCard setPosts={setPosts}/>

      {

        postsLoading ? <PostsLoading /> : postsError ? <GlobalError error={postsError}/> : <FeedPosts posts={posts}/>

      }
    </Screen>
  );
}
export default FeedPage;
