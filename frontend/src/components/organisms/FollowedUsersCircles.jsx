import { useState, useEffect } from 'react';
import { getFollowing } from '../../services/ApiServices';
import { useCurrentUser } from '../../contexts/CurrentUserProvider';
import { PostsLoading } from '../loadings/PostLoadingCard';
import GlobalError from '../errors/GlobalError';
import { Link } from 'react-router-dom';

const FollowedUsersCircles = () => {
  const { currentUser } = useCurrentUser();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const response = await getFollowing(currentUser.username);
        setFollowing(response.data?.data?.slice(0, 10) || []); // Limit to 10 users
        setError(null);
      } catch (err) {
        setError('Failed to fetch following users');
        console.error('Error fetching following users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [currentUser]);

  if (loading) {
    return <PostsLoading />;
  }

  if (error) {
    return <GlobalError error={error} />;
  }

  if (following.length === 0) {
    return null; // Don't show if no following users
  }

  return (
    <div className="w-full py-4 border-b theme-border overflow-x-auto scrollbar-hide">
      <div className="flex space-x-4 px-4">
        {following.map((user) => (
          <Link to={`/messages/${user.username}`} key={user._id} className="flex-shrink-0 flex flex-col items-center gap-1 group">
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt={user.fullname}
              className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors duration-200"
            />
            <p className="text-xs text-gray-500 truncate max-w-[64px]">{user.username}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FollowedUsersCircles; 