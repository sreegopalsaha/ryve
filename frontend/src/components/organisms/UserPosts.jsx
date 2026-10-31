import NoDataFound from "./NoDataFound";
import PostCard from "./PostCard";

function UserPosts({ author, posts, setPosts }) {
  if (!posts || posts.length === 0) {
    return <NoDataFound message="No post found" />;
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          author={post.authorDetails || post.author || author}
          post={post}
          setPosts={setPosts}
        />
      ))}
    </>
  );
}

export default UserPosts;
