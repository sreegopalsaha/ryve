import React, { useState, useEffect } from 'react';
import Screen from '../components/molecules/Screen';
import FollowedUsersCircles from '../components/organisms/FollowedUsersCircles';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import { getAllChatRooms } from '../services/ApiServices';
import { PostsLoading } from '../components/loadings/PostLoadingCard';
import GlobalError from '../components/errors/GlobalError';
import { Link } from 'react-router-dom';
import UserCard from '../components/molecules/UserCard';
import NoDataFound from '../components/organisms/NoDataFound';
import { MessageCircle } from 'lucide-react';
import ChatMessageCard from '../components/molecules/ChatMessageCard';

function MessagesPage() {
  const { currentUser } = useCurrentUser();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const response = await getAllChatRooms();
        setChatRooms(response.data?.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load conversations');
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [currentUser]);

  if (loading) {
    return (
      <Screen middleScreen className="p-4">
        <PostsLoading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen middleScreen className="p-4">
        <GlobalError error={error} />
      </Screen>
    );
  }

  return (
    <Screen middleScreen>
      <FollowedUsersCircles />
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Messages</h1>
        {chatRooms.length === 0 ? (
          <NoDataFound
            icon={MessageCircle}
            message="No conversations yet"
            subMessage="Start a chat with a user to see it here."
          />
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <ChatMessageCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

export default MessagesPage;