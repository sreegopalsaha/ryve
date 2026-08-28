import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Screen from "../components/molecules/Screen";
import { PageHeader } from "../components/molecules/Page-Header";
import { PostLoading } from "../components/loadings/PostLoadingCard";
import { getPost } from "../services/ApiServices";
import PostCard from "../components/organisms/PostCard";
import GlobalError from "../components/errors/GlobalError";
import NoDataFound from "../components/organisms/NoDataFound";
import { FileQuestion } from "lucide-react";

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPost(postId);
        setPost(res.data?.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const author = post?.authorDetails || post?.author;

  return (
    <Screen middleScreen className="gap-4">
      <PageHeader title="Post" showBack />

      {loading ? (
        <PostLoading />
      ) : error ? (
        <GlobalError error={error} />
      ) : post ? (
        <PostCard post={post} author={author} />
      ) : (
        <NoDataFound
          icon={FileQuestion}
          message="Post not found"
          subMessage="This post may have been deleted or is not accessible."
        />
      )}
    </Screen>
  );
}

export default PostPage;
