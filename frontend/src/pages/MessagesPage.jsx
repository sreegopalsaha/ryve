import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Screen from "../components/molecules/Screen";
import Button from "../components/atoms/Button";
import { useCurrentUser } from "../contexts/CurrentUserProvider";
import { useWebSocket } from "../contexts/WebSocketContext";
import { 
    getConversations, 
    getOrCreateConversation, 
    getMessages, 
    sendMessage, 
    markMessagesAsSeen,
    getFollowing
} from "../services/ApiServices";

function MessagesPage() {
    const { currentUser } = useCurrentUser();
    const { socket, onlineUserIds, on, off, decrementUnread } = useWebSocket();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const activeUserId = searchParams.get("user");
    
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    
    const [following, setFollowing] = useState([]);
    
    const messagesEndRef = useRef(null);
    
    // Fetch conversations and following
    useEffect(() => {
        if (!currentUser) return;
        
        const fetchInitialData = async () => {
            try {
                const [convRes, followRes] = await Promise.all([
                    getConversations(),
                    getFollowing(currentUser.username)
                ]);
                setConversations(convRes.data?.data || []);
                setFollowing(followRes.data?.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchInitialData();
    }, [currentUser]);

    // Handle Active Conversation change
    useEffect(() => {
        if (!activeUserId) {
            setActiveConversation(null);
            setMessages([]);
            return;
        }

        const fetchConversation = async () => {
            setLoadingMessages(true);
            try {
                const convRes = await getOrCreateConversation(activeUserId);
                const conv = convRes.data?.data;
                setActiveConversation(conv);
                
                const msgsRes = await getMessages(conv._id);
                setMessages(msgsRes.data?.data || []);
                
                // Mark as seen
                await markMessagesAsSeen(conv._id);
                
                // Update local conversation list to reset unread count
                setConversations(prev => prev.map(c => {
                    if (c._id === conv._id && c.unreadCount > 0) {
                        decrementUnread(c.unreadCount);
                        return { ...c, unreadCount: 0 };
                    }
                    return c;
                }));
                
            } catch (error) {
                console.error("Error fetching active conversation:", error);
            } finally {
                setLoadingMessages(false);
                scrollToBottom();
            }
        };

        fetchConversation();
    }, [activeUserId, decrementUnread]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // WebSocket Listeners
    useEffect(() => {
        const handleNewMessage = (data) => {
            const { message } = data;
            
            // If message belongs to active conversation
            if (activeConversation && message.conversation === activeConversation._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
                
                // If we are recipient, mark as seen immediately
                if (message.recipient === currentUser._id) {
                    markMessagesAsSeen(activeConversation._id).catch(console.error);
                }
            } else {
                // Update conversation list
                setConversations(prev => {
                    const existing = prev.find(c => c._id === message.conversation);
                    if (existing) {
                        return [
                            { 
                                ...existing, 
                                lastMessage: message, 
                                updatedAt: new Date().toISOString(),
                                unreadCount: message.recipient === currentUser._id ? (existing.unreadCount || 0) + 1 : existing.unreadCount
                            },
                            ...prev.filter(c => c._id !== message.conversation)
                        ];
                    }
                    // Fetch full conversation list if new conversation created
                    getConversations().then(res => setConversations(res.data?.data || [])).catch(console.error);
                    return prev;
                });
            }
        };

        const handleMessagesSeen = (data) => {
            if (activeConversation && activeConversation._id === data.conversationId) {
                setMessages(prev => prev.map(m => 
                    m.sender === currentUser._id && !m.seen ? { ...m, seen: true, seenAt: new Date().toISOString() } : m
                ));
            }
        };

        on("new_message", handleNewMessage);
        on("messages_seen", handleMessagesSeen);

        return () => {
            off("new_message", handleNewMessage);
            off("messages_seen", handleMessagesSeen);
        };
    }, [activeConversation, currentUser, on, off]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeConversation) return;
        
        const tempContent = messageInput;
        setMessageInput("");
        
        try {
            const res = await sendMessage({
                conversationId: activeConversation._id,
                content: tempContent
            });
            // We get new message via websocket as well, but to be safe and responsive:
            // setMessages(prev => [...prev, res.data.data]);
            // scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
            setMessageInput(tempContent);
        }
    };

    const onlineFollowing = following.filter(u => onlineUserIds.includes(u._id));

    // Responsive split layout logic
    const isChatActive = !!activeUserId;

    return (
        <Screen middleScreen className="!p-0 !pb-14 md:!pb-0 flex flex-col md:flex-row h-[100dvh] md:h-screen overflow-hidden">
            
            {/* LEFT COLUMN: List */}
            <div className={`w-full md:w-[40%] h-full flex flex-col border-r border-gray-200 dark:border-gray-800 ${isChatActive ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight theme-text">Messages</h1>
                </div>

                {/* Online Following Carousel */}
                {onlineFollowing.length > 0 && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-4 overflow-x-auto scrollbar-hidden">
                        {onlineFollowing.map(u => (
                            <div key={u._id} 
                                className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]"
                                onClick={() => navigate(`/messages?user=${u._id}`)}
                            >
                                <div className="relative">
                                    <img src={u.profilePicture} alt={u.username} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></span>
                                </div>
                                <span className="text-xs truncate w-full text-center">{u.username}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500 w-6 h-6" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No conversations yet.</div>
                    ) : (
                        conversations.map(conv => {
                            const otherUser = conv.participants.find(p => p._id !== currentUser._id);
                            const isActive = activeUserId === otherUser._id;
                            const isOnline = onlineUserIds.includes(otherUser._id);
                            
                            return (
                                <div 
                                    key={conv._id}
                                    onClick={() => navigate(`/messages?user=${otherUser._id}`)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img src={otherUser.profilePicture} alt={otherUser.username} className="w-12 h-12 rounded-full object-cover" />
                                        {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-sm truncate">{otherUser.fullname}</h3>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <p className={`truncate ${conv.unreadCount > 0 ? 'font-bold theme-text' : 'text-gray-500'}`}>
                                                {conv.lastMessage ? conv.lastMessage.content : 'Start a conversation'}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Active Chat */}
            <div className={`w-full md:w-[60%] h-full flex flex-col ${!isChatActive ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                            <button onClick={() => navigate('/messages')} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ArrowLeft size={20} />
                            </button>
                            
                            {(() => {
                                const otherUser = activeConversation.participants.find(p => p._id !== currentUser._id);
                                return (
                                    <>
                                        <img src={otherUser.profilePicture} alt={otherUser.username} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/${otherUser.username}`)}>{otherUser.fullname}</span>
                                            {onlineUserIds.includes(otherUser._id) ? (
                                                <span className="text-xs text-green-500 font-medium">Active now</span>
                                            ) : (
                                                <span className="text-xs text-gray-500">Offline</span>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {loadingMessages ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500 w-6 h-6" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <MessageCircle size={48} className="opacity-20" />
                                    <p>No messages here yet.</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => {
                                        const isMine = msg.sender === currentUser._id;
                                        const isLast = index === messages.length - 1;
                                        
                                        return (
                                            <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine ? 'bg-primary-light-accent dark:bg-primary-dark-accent text-white rounded-br-sm' : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-bl-sm'}`}>
                                                    <p className="break-words whitespace-pre-wrap text-sm">{msg.content}</p>
                                                </div>
                                                {isMine && isLast && msg.seen && (
                                                    <span className="text-[10px] text-gray-500 mt-1 mr-1">Seen</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                        
                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 theme-input border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light-accent dark:focus:ring-primary-dark-accent transition-all theme-text"
                                />
                                <Button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className={`p-2.5 rounded-full ${messageInput.trim() ? 'bg-primary-light-accent dark:bg-primary-dark-accent text-white hover:opacity-90' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <Send size={18} />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageCircle size={64} className="opacity-20 mb-4" />
                        <h2 className="text-xl font-bold theme-text mb-2">Your Messages</h2>
                        <p className="text-sm">Send private photos and messages to a friend or group.</p>
                    </div>
                )}
            </div>
            
        </Screen>
    );
}

export default MessagesPage;