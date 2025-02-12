import React, { useEffect, useState } from "react";
import UserList from "../components/organisms/UserList";
import { getFollowing, getFollowers } from "../services/ApiServices";
import { PostsLoading } from "../components/loadings/PostLoadingCard";
import GlobalError from "../components/errors/GlobalError";
import Screen from "../components/molecules/Screen";
import { useParams, useLocation } from "react-router-dom";

function FollowingFollowersPage() {
    const { userIdentifier } = useParams();
    const location = useLocation();

    const pageType = location.pathname.includes("followers") ? "followers" : "following";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userList, setUserList] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = pageType === "following" ? await getFollowing(userIdentifier) : await getFollowers(userIdentifier);
            setUserList(res?.data?.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pageType, userIdentifier]); 

    return (
        <Screen middleScreen>
            <h1 className="text-xl font-bold">{pageType === "following" ? "Following" : "Followers"}</h1>
            {loading ? <PostsLoading /> : error ? <GlobalError error={error} /> : <UserList userList={userList} />}
        </Screen>
    );
}

export default FollowingFollowersPage;
