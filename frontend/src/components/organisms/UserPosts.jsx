import NoDataFound from "./NoDataFound";
import PostCard from "./PostCard";

function UserPosts({ author, posts }) {
  return (
    <>
      {posts.length === 0 ? (
        <NoDataFound message="No post found" />
      ) : (
        posts.map((post) => <PostCard key={post._id} author={author} post={post} />)
      )}
    </>
  );
}

export default UserPosts;
