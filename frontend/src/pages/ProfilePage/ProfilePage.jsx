import React, { useEffect, useState } from "react";
import Screen from "../../components/molecules/Screen";
import ProfileCard from "./ProfileCard";
import UserPosts from "../../components/organisms/UserPosts";
import { useParams } from "react-router-dom";
import { getUserPosts, getUserProfile } from "../../services/ApiServices";
import ProfileCardLoading from "../../components/loadings/ProfileCardLoading"
import { PostsLoading } from "../../components/loadings/PostLoadingCard";
import GlobalError from "../../components/errors/GlobalError";

function UserProfilePage() {
  const { userIdentifier } = useParams();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    setUser(null);
    setUserLoading(true);
    setUserError(null);
    setPosts([]);
    setPostsLoading(true);
    setPostsError(null);

    const fetchUserProfile = async () => {
      try {
        const res = await getUserProfile(userIdentifier);
        setUser(res.data?.data);
        console.log(res);
      } catch (error) {
        setUserError(error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserProfile();
  }, [userIdentifier]);

  useEffect(() => {
    if(userLoading) return;

    const fetchPosts = async () => {
      try {
        if (userError) {
          setPostsLoading(false);
          return;
        };
        setPostsLoading(true);
        const res = await getUserPosts(userIdentifier);
        setPosts(res.data?.data);
      } catch (error) {
        setPostsError(error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [userError, userLoading]);

  return (
    <Screen middleScreen className="flex flex-col gap-4">
      {userLoading ? (
        <ProfileCardLoading />
      ) : userError ? (
        <GlobalError error={userError} />
      ) : (
        <ProfileCard user={user} />
      )}

{postsLoading ? (
  <PostsLoading />
) : postsError ? (
  <GlobalError error={postsError} />
) : userError ? "" : (
  <UserPosts posts={posts} author={user} />
)}
    </Screen>
  );
}

export default UserProfilePage;
