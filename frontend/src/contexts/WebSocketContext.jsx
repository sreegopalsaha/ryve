import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useCurrentUser } from './CurrentUserProvider';
import { getConversations } from '../services/ApiServices';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const { currentUser } = useCurrentUser();
    const [socket, setSocket] = useState(null);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const eventListeners = useRef(new Map());

    // Fetch initial unread count
    useEffect(() => {
        if (!currentUser) {
            setUnreadMessagesCount(0);
            return;
        }
        const fetchInitialUnreadCount = async () => {
            try {
                const res = await getConversations();
                const conversations = res.data?.data || [];
                const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setUnreadMessagesCount(totalUnread);
            } catch (error) {
                console.error("Error fetching unread messages count", error);
            }
        };
        fetchInitialUnreadCount();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        let ws;
        let reconnectTimer;

        const connect = () => {
            const token = Cookies.get('token');
            if (!token) return;

            const wsUrl = import.meta.env.VITE_API_BASE_URL.replace('http', 'ws').replace('/api/v1', '') + `/?token=${token}`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'online_users') {
                        setOnlineUserIds(data.userIds);
                    } else if (data.type === 'user_online') {
                        setOnlineUserIds(prev => {
                            if (!prev.includes(data.userId)) return [...prev, data.userId];
                            return prev;
                        });
                    } else if (data.type === 'user_offline') {
                        setOnlineUserIds(prev => prev.filter(id => id !== data.userId));
                    } else if (data.type === 'new_message') {
                        if (data.message.recipient === currentUser._id) {
                            setUnreadMessagesCount(prev => prev + 1);
                        }
                    } else if (data.type === 'messages_seen_ack') {
                        // We will recalculate or handle seen state in components, but this is a stub for global logic if needed
                    }

                    // Dispatch to registered listeners
                    const listeners = eventListeners.current.get(data.type) || [];
                    listeners.forEach(callback => callback(data));
                } catch (err) {
                    console.error("WebSocket message parse error", err);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected. Reconnecting in 3s...');
                setSocket(null);
                reconnectTimer = setTimeout(connect, 3000);
            };

            setSocket(ws);
        };

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (ws) {
                ws.onclose = null; // prevent auto-reconnect on unmount
                ws.close();
            }
        };
    }, [currentUser]);

    const on = (eventType, callback) => {
        if (!eventListeners.current.has(eventType)) {
            eventListeners.current.set(eventType, new Set());
        }
        eventListeners.current.get(eventType).add(callback);
    };

    const off = (eventType, callback) => {
        const listeners = eventListeners.current.get(eventType);
        if (listeners) {
            listeners.delete(callback);
        }
    };

    const decrementUnread = (count = 1) => {
        setUnreadMessagesCount(prev => Math.max(0, prev - count));
    };

    return (
        <WebSocketContext.Provider value={{ socket, onlineUserIds, unreadMessagesCount, on, off, decrementUnread }}>
            {children}
        </WebSocketContext.Provider>
    );
};
