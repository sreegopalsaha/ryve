import NoDataFound from "../../components/organisms/NoDataFound";
import PostCard from "../../components/organisms/PostCard";
import { UserSearch } from "lucide-react";

function FeedPosts({ posts }) {
  if (posts.length === 0) {
    return (
        <NoDataFound icon={UserSearch}
          message="Follow your friends and family to get their posts" 
          subMessage="We believe in building connections, not algorithms. Your feed is shaped by the people you choose to follow" 
        />
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post._id} author={post.author} post={post} />
      ))}
    </>
  );
}

export default FeedPosts;
