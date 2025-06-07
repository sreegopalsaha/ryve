import React, { useEffect, useState } from 'react';
import Screen from '../components/molecules/Screen';
import UserList from '../components/organisms/UserList';
import { getFollowRequests, handleFollowRequest } from '../services/ApiServices';
import { PostsLoading } from '../components/loadings/PostLoadingCard';
import GlobalError from '../components/errors/GlobalError';
import NoDataFound from '../components/organisms/NoDataFound';
import { UserPlus } from 'lucide-react';

function FollowRequestsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState([]);
    const [processingRequest, setProcessingRequest] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getFollowRequests();
            setRequests(res?.data?.data || []);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (requestId, action) => {
        if (processingRequest) return;
        try {
            setProcessingRequest(true);
            const response = await handleFollowRequest(requestId, action);
            if (response?.data?.data) {
                setRequests(prev => prev.filter(req => req._id !== requestId));
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error handling follow request:', error);
        } finally {
            setProcessingRequest(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (loading) {
        return (
            <Screen middleScreen>
                <PostsLoading />
            </Screen>
        );
    }

    if (error) {
        return (
            <Screen middleScreen>
                <GlobalError error={error} />
            </Screen>
        );
    }

    if (requests.length === 0) {
        return (
            <Screen middleScreen>
                <NoDataFound 
                    icon={UserPlus}
                    message="No follow requests"
                    subMessage="When someone requests to follow you, it will appear here"
                />
            </Screen>
        );
    }

    const transformedRequests = requests.map(req => ({
        ...req.follower,
        followStatus: 'pending',
        requestId: req._id
    }));

    return (
        <Screen middleScreen>
            <h1 className="text-xl font-bold mb-4">Follow Requests</h1>
            <UserList userList={transformedRequests} onFollowRequest={handleRequest} />
        </Screen>
    );
}

export default FollowRequestsPage; 