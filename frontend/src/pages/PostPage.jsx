import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Screen from "../components/molecules/Screen";
import { PostLoading } from "../components/loadings/PostLoadingCard";
import { getPost } from "../services/ApiServices";
import PostCard from "../components/organisms/PostCard";
import GlobalError from "../components/errors/GlobalError";
import NoDataFound from "../components/organisms/NoDataFound";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Button from "../components/atoms/Button";

function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
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
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <Button onClick={() => navigate(-1)} className="hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight theme-text">Post</h1>
      </div>

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
