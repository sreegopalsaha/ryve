import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Screen from "../components/molecules/Screen";
import Button from "../components/atoms/Button";
import NoDataFound from "../components/organisms/NoDataFound";
import GlobalError from "../components/errors/GlobalError";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/ApiServices";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotifications();
      setNotifications(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev ? prev.map((n) => ({ ...n, read: true })) : []
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev
            ? prev.map((n) =>
                n._id === notification._id ? { ...n, read: true } : n
              )
            : []
        );
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    if (notification.type === "follow") {
      if (notification.sender?.username) {
        navigate(`/${notification.sender.username}`);
      }
    } else if (notification.type === "like" || notification.type === "comment") {
      const postId = notification.post?._id || notification.post;
      if (postId) {
        navigate(`/post/${postId}`);
      } else if (notification.sender?.username) {
        navigate(`/${notification.sender.username}`);
      }
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-green-500 fill-green-500/20" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderNotificationMessage = (notification) => {
    const senderName = notification.sender?.fullname || notification.sender?.username || "Someone";

    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-semibold text-primary-light-text dark:text-primary-dark-text">
              {senderName}
            </span>{" "}
            liked your post.
          </>
        );
      case "follow":
        return (
          <>
            <span className="font-semibold text-primary-light-text dark:text-primary-dark-text">
              {senderName}
            </span>{" "}
            started following you.
          </>
        );
      case "comment":
        return (
          <>
            <span className="font-semibold text-primary-light-text dark:text-primary-dark-text">
              {senderName}
            </span>{" "}
            commented on your post.
          </>
        );
      default:
        return (
          <>
            <span className="font-semibold text-primary-light-text dark:text-primary-dark-text">
              {senderName}
            </span>{" "}
            interacted with you.
          </>
        );
    }
  };

  const unreadExists = notifications?.some((n) => !n.read);

  return (
    <Screen middleScreen className="gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight theme-text">Notifications</h1>
        {unreadExists && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : error ? (
        <GlobalError error={error} />
      ) : !notifications || notifications.length === 0 ? (
        <NoDataFound
          message="No notifications yet"
          subMessage="When someone likes your post, follows you, or comments, you'll see it here."
          icon={Bell}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const isUnread = !notification.read;
            const sender = notification.sender;
            const post = notification.post;

            return (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isUnread
                    ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm"
                    : "bg-primary-light-card dark:bg-primary-dark-card border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                {/* Sender Avatar with type icon badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={sender?.profilePicture || "https://res.cloudinary.com/dmwlciwjk/image/upload/v1739380034/anonymous-user_tb3tgs.jpg"}
                    alt={sender?.fullname || "User avatar"}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-900 shadow-sm">
                    {renderIcon(notification.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text leading-snug">
                    {renderNotificationMessage(notification)}
                  </p>

                  {/* Post preview if available */}
                  {post?.content && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                      "{post.content}"
                    </p>
                  )}

                  {/* Relative timestamp */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {notification.createdAt
                      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                      : "Just now"}
                  </p>
                </div>

                {/* Post thumbnail preview if available */}
                {post?.image && (
                  <img
                    src={post.image}
                    alt="Post thumbnail"
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Unread indicator dot */}
                {isUnread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2 self-center" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

export default NotificationsPage;