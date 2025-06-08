import React, { useEffect, useState } from 'react';
import Screen from '../components/molecules/Screen';
import { getNotifications, markNotificationAsRead } from '../services/ApiServices';
import { formatDistanceToNow } from 'date-fns';
import { Heart, UserPlus, MessageCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NoDataFound from '../components/organisms/NoDataFound';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" />;
      case 'follow':
        return <UserPlus className="text-blue-500" />;
      case 'comment':
        return <MessageCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    const { sender, type } = notification;
    switch (type) {
      case 'like':
        return `${sender.fullname} liked your post`;
      case 'follow':
        return `${sender.fullname} started following you`;
      case 'comment':
        return `${sender.fullname} commented on your post`;
      default:
        return '';
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }

      // Navigate based on notification type
      if (notification.post) {
        navigate(`/post/${notification.post._id}`);
      } else if (notification.type === 'follow') {
        navigate(`/${notification.sender.username}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <Screen middleScreen>Loading...</Screen>;
  }

  if (notifications.length === 0) {
    return (
      <Screen middleScreen>
        <NoDataFound
          message="No notifications yet"
          subMessage="When you get notifications, they'll show up here"
          icon={Bell}
        />
      </Screen>
    );
  }

  return (
    <Screen middleScreen>
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm">{getNotificationText(notification)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {notification.sender.profilePicture && (
                  <img
                    src={notification.sender.profilePicture}
                    alt={notification.sender.fullname}
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

export default NotificationsPage;