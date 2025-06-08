import React, { useState, useEffect, useRef } from 'react';
import Screen from '../../components/molecules/Screen';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../../contexts/CurrentUserProvider';
import { createOrGetChatRoom, getChatMessages, sendMessage } from '../../services/ApiServices';
import { PostsLoading } from '../../components/loadings/PostLoadingCard';
import GlobalError from '../../components/errors/GlobalError';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { Send } from 'lucide-react';
import io from 'socket.io-client';

const ChatPage = () => {
  const { userIdentifier } = useParams();
  const { currentUser } = useCurrentUser();
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  // Join chat room when it's available
  useEffect(() => {
    if (socketRef.current && chatRoom?._id) {
      socketRef.current.emit('joinChat', chatRoom._id);
    }
  }, [chatRoom?._id]);

  // Handle incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessage = (message) => {
      console.log('Received message:', message);
      if (!message?._id || messageIdsRef.current.has(message._id)) {
        return;
      }
      messageIdsRef.current.add(message._id);
      setMessages(prevMessages => [...prevMessages, message]);
    };

    socketRef.current.on('message', handleMessage);

    return () => {
      socketRef.current.off('message', handleMessage);
    };
  }, []);

  // Fetch chat data
  useEffect(() => {
    if (!currentUser) return;

    const fetchChatData = async () => {
      try {
        setLoading(true);
        const roomResponse = await createOrGetChatRoom(userIdentifier);
        const chatRoomData = roomResponse.data.data;
        setChatRoom(chatRoomData);
        
        // Set the other user (not the current user)
        const otherUserData = chatRoomData.participants.find(p => p._id !== currentUser._id);
        setOtherUser(otherUserData);

        console.log("Other User Data: ", otherUserData);

        const messagesResponse = await getChatMessages(chatRoomData._id);
        const fetchedMessages = messagesResponse.data.data;
        
        // Reset message IDs set and add all fetched message IDs
        messageIdsRef.current.clear();
        fetchedMessages.forEach(msg => {
          messageIdsRef.current.add(msg._id);
          console.log("Message Sender Data: ", msg.sender);
        });
        
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        setError('Failed to load chat');
        console.error('Error loading chat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [currentUser, userIdentifier]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom?._id || sending) return;

    try {
      setSending(true);
      const response = await sendMessage({
        content: newMessage,
        chatRoomId: chatRoom._id,
      });
      
      const sentMessage = response.data.data;
      if (sentMessage?._id && !messageIdsRef.current.has(sentMessage._id)) {
        messageIdsRef.current.add(sentMessage._id);
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      }
      setNewMessage('');
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

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
    <Screen middleScreen className="flex flex-col h-full">
      <div className="p-4 border-b theme-border flex-shrink-0 flex items-center gap-3">
        {otherUser?.profilePicture ? (
          <img 
            src={otherUser.profilePicture} 
            alt={otherUser.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
              {otherUser?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">{otherUser?.username}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 theme-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'} items-end gap-2`}
          >
            {msg.sender._id !== currentUser._id && (
              <div className="flex-shrink-0">
                {msg.sender.profilePicture ? (
                  <img 
                    src={msg.sender.profilePicture} 
                    alt={msg.sender.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {msg.sender.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-2xl ${
                msg.sender._id === currentUser._id
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs mt-1 block text-right opacity-75">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t theme-border flex-shrink-0 flex gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 pr-10 theme-input"
          disabled={sending}
        />
        <Button type="submit" loading={sending} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          <Send size={20} />
        </Button>
      </form>
    </Screen>
  );
};

export default ChatPage; 