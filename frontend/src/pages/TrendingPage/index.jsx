import { useState, useEffect } from 'react';
import Screen from '../../components/molecules/Screen';
import { getTrendingUsers } from '../../services/ApiServices';
import UserCard from '../../components/molecules/UserCard';
import { PostsLoading } from '../../components/loadings/PostLoadingCard';
import Button from '../../components/atoms/Button';
import GlobalError from '../../components/errors/GlobalError';
import NoDataFound from '../../components/organisms/NoDataFound';
import { TrendingUp } from 'lucide-react';

const TrendingPage = () => {
  const [activeTab, setActiveTab] = useState('rising');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingUsers = async (type) => {
    try {
      setLoading(true);
      const response = await getTrendingUsers(type);
      setUsers(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trending users');
      console.error('Error fetching trending users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingUsers(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'rising', label: 'Rising Stars' },
    { id: 'trending', label: 'Trending' },
    { id: 'popular', label: 'Most Popular' }
  ];

  return (
    <Screen middleScreen className="p-4">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Trending Users</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <PostsLoading />
        ) : error ? (
          <GlobalError error={error} />
        ) : users.length === 0 ? (
          <NoDataFound
            icon={TrendingUp}
            message="No trending users found"
            subMessage="Check back later for trending users"
          />
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
};

export default TrendingPage; 