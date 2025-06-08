import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "../services/ApiServices";
import PostCard from "../components/organisms/PostCard";
import NoDataFound from "../components/organisms/NoDataFound";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import GlobalError from "../components/errors/GlobalError";
import Screen from "../components/molecules/Screen";
import { PostsLoading } from "../components/loadings/PostLoadingCard";

function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPost(postId);
        setPost(response.data.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <Screen middleScreen>
        <PostsLoading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen middleScreen>
        <GlobalError error={error} />
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen middleScreen>
        <NoDataFound message="Post not found" />
      </Screen>
    );
  }

  return (
    <Screen middleScreen className="gap-4">
      <PostCard
        post={post}
        author={post.authorDetails}
        setPosts={() => {}} // Empty function since we're not managing a list of posts
      />
    </Screen>
  );
}

export default PostPage; 