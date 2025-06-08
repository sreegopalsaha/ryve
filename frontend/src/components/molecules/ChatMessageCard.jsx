import React from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

function ChatMessageCard({ room }) {
  const { otherParticipant, lastMessage } = room;

  const formattedTime = lastMessage ? formatDistanceToNowStrict(new Date(lastMessage.createdAt), { addSuffix: true }) : '';

  return (
    <Link to={`/messages/${otherParticipant.username}`} className="block">
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
        <div className="flex items-center gap-3">
          <img
            src={otherParticipant.profilePicture || "/default-avatar.png"}
            alt={otherParticipant.fullname}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium theme-text">{otherParticipant.fullname}</p>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-500 line-clamp-1">{lastMessage?.content || "No messages yet"}</p>
              {lastMessage && <span className="text-sm text-gray-400">· {formattedTime}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Camera className="text-gray-400 w-6 h-6" />
        </div>
      </div>
    </Link>
  );
}

export default ChatMessageCard; 