import axios from "axios";
import Cookies from 'js-cookie';

// Create and export the api instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = (data) => api.post('/user/login', data);
export const registerUser = (data) => api.post('/user/register', data);
export const getCurrentUser = () => api.get('/user/getCurrentUser');
export const getUserProfile = (userIdentifier) => api.get(`/user/getUserProfile/${userIdentifier}`);
export const searchUsers = (searchQuery)=> api.get(`user/searchUsers/${searchQuery}`);

export const userFollowUnfollow = (userId) => api.post(`/user/followunfollow/${userId}`);
export const getFollowing = (userIdentifier) => api.get(`/user/getfollowing/${userIdentifier}`);
export const getFollowers = (userIdentifier) => api.get(`/user/getfollowers/${userIdentifier}`);

export const getUserPosts = (userIdentifier) => api.get(`/post/getUserPosts/${userIdentifier}`);
export const getFeedPosts = ()=> api.get("/post/getFeedPosts");
export const getPost = (postId) => api.get(`/post/get/${postId}`);
export const postLikeToggle = (postId)=> api.get(`/post/postLikeToggle/${postId}`);
export const starPostToggle = (postId) => api.get(`/post/starPostToggle/${postId}`);
export const getStarredPosts = () => api.get('/post/starred');
export const createPost = (data) => api.post("/post/createPost", data);
export const deletePost = (postId) => api.get(`/post/deletePost/${postId}`);
export const enhanceContent = (data) => api.post("/post/enhanceContent", data);

export const getLocation = (latitude, longitude) => axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);

export const updateUserProfile = (formData) => api.put('/user/updateProfile', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const togglePrivateAccount = () => api.put('/user/togglePrivateAccount');

export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (notificationId) => 
  api.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => 
  api.patch('/notifications/read-all');

// Add follow requests endpoints
export const getFollowRequests = () => api.get('/user/follow-requests');
export const handleFollowRequest = (requestId, action) => {
    console.log('Sending follow request:', { requestId, action });
    return api.post('/user/handle-follow-request', { requestId, action });
};

export const getTrendingUsers = (type = 'rising') => {
    return api.get(`/user/trending?type=${type}`);
};

export const getSuggestedUsers = (limit = 5) => {
    return api.get(`/user/suggested?limit=${limit}`);
};

// New Chat Endpoints
export const createOrGetChatRoom = (userIdentifier) => api.post(`/messages/${userIdentifier}`);
export const sendMessage = (data) => api.post('/messages/send', data);
export const getChatMessages = (chatRoomId) => api.get(`/messages/messages/${chatRoomId}`);
export const getAllChatRooms = () => api.get('/messages/all');