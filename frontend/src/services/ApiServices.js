import axios from "axios";
import Cookies from 'js-cookie';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
export const getUserPosts = (userIdentifier) => api.get(`/post/getUserPosts/${userIdentifier}`);
export const postLikeToggle = (postId)=> api.get(`/post/postLikeToggle/${postId}`);

export const userFollowUnfollow = (userId) => api.post(`/user/followunfollow/${userId}`);
export const getFollowing = (userIdentifier) => api.get(`/user/getfollowing/${userIdentifier}`);
export const getFollowers = (userIdentifier) => api.get(`/user/getfollowers/${userIdentifier}`);