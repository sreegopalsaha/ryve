import { useState, useEffect } from 'react';
import { getSuggestedUsers, getTrendingUsers } from '../../services/ApiServices';
import UserCard from '../molecules/UserCard';
import { PostsLoading } from '../loadings/PostLoadingCard';
import GlobalError from '../errors/GlobalError';
import { Users } from 'lucide-react';

const UserSuggestions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // First try to get suggested users
      const suggestedResponse = await getSuggestedUsers(5);
      const suggestedUsers = suggestedResponse.data?.data || [];

      // If no suggested users, get random users from trending
      if (suggestedUsers.length === 0) {
        const trendingResponse = await getTrendingUsers('popular');
        const trendingUsers = trendingResponse.data?.data || [];
        // Shuffle and take first 5 users
        const shuffledUsers = [...trendingUsers].sort(() => Math.random() - 0.5);
        setUsers(shuffledUsers.slice(0, 5));
      } else {
        setUsers(suggestedUsers);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <PostsLoading />;
  }

  if (error) {
    return <GlobalError error={error} />;
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-gray-500" />
        <h2 className="text-lg font-semibold">Suggested for you</h2>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UserSuggestions; 