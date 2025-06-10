import React, { useEffect, useState } from "react";
import Screen from "../../components/molecules/Screen";
import ProfileCard from "./ProfileCard";
import UserPosts from "../../components/organisms/UserPosts";
import { useParams } from "react-router-dom";
import { getUserPosts, getUserProfile } from "../../services/ApiServices";
import ProfileCardLoading from "../../components/loadings/ProfileCardLoading";
import { PostsLoading } from "../../components/loadings/PostLoadingCard";
import GlobalError from "../../components/errors/GlobalError";
import { useCurrentUser } from "../../contexts/CurrentUserProvider";
import { usePost } from "../../contexts/PostProvider";

function UserProfilePage() {
  const { userIdentifier } = useParams();
  const { currentUser } = useCurrentUser();
  const {
    currentUserPosts,
    currentUserPostsLoading,
    currentUserPostsError,
    fetchCurrentUserPosts,
    setCurrentUserPosts,
  } = usePost();

  const isCurrentUser = Boolean(
    currentUser &&
      (userIdentifier?.toLowerCase() === currentUser.username?.toLowerCase() ||
        userIdentifier === currentUser._id)
  );

  // Profile data state
  const [user, setUser] = useState(isCurrentUser ? currentUser : null);
  const [userLoading, setUserLoading] = useState(!isCurrentUser);
  const [userError, setUserError] = useState(null);

  // Local post state for other users only
  const [otherUserPosts, setOtherUserPosts] = useState(null);
  const [otherUserPostsLoading, setOtherUserPostsLoading] = useState(false);
  const [otherUserPostsError, setOtherUserPostsError] = useState(null);

  useEffect(() => {
    if (isCurrentUser) {
      setUser(currentUser);
      setUserLoading(false);
      setUserError(null);
    } else {
      setUser(null);
      setUserLoading(true);
      setUserError(null);

      const fetchUserProfile = async () => {
        try {
          const res = await getUserProfile(userIdentifier);
          setUser(res.data?.data);
        } catch (error) {
          setUserError(error);
        } finally {
          setUserLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [userIdentifier, isCurrentUser, currentUser]);

  useEffect(() => {
    if (isCurrentUser) {
      // Only fetch if current user posts are not yet cached
      if (currentUserPosts === null) {
        fetchCurrentUserPosts(userIdentifier || currentUser?.username || currentUser?._id);
      }
    } else {
      if (userLoading) return;
      if (userError) {
        setOtherUserPostsLoading(false);
        return;
      }

      setOtherUserPosts(null);
      setOtherUserPostsLoading(true);
      setOtherUserPostsError(null);

      const key = userIdentifier;
      const fetchOtherPosts = async () => {
        try {
          const res = await getUserPosts(userIdentifier);
          if (userIdentifier === key) {
            setOtherUserPosts(res.data?.data || []);
          }
        } catch (error) {
          if (userIdentifier === key) {
            setOtherUserPostsError(error);
          }
        } finally {
          if (userIdentifier === key) {
            setOtherUserPostsLoading(false);
          }
        }
      };

      fetchOtherPosts();
    }
  }, [userIdentifier, isCurrentUser, currentUser, currentUserPosts, userLoading, userError]);

  const displayedPosts = isCurrentUser ? currentUserPosts : otherUserPosts;
  const isPostsLoading = isCurrentUser
    ? currentUserPostsLoading || (currentUserPosts === null && !currentUserPostsError)
    : otherUserPostsLoading;
  const postsError = isCurrentUser ? currentUserPostsError : otherUserPostsError;
  const setDisplayedPosts = isCurrentUser ? setCurrentUserPosts : setOtherUserPosts;

  return (
    <Screen middleScreen className="flex flex-col gap-4">
      {userLoading ? (
        <ProfileCardLoading />
      ) : userError ? (
        <GlobalError error={userError} />
      ) : (
        <ProfileCard user={user} />
      )}

      {isPostsLoading ? (
        <PostsLoading />
      ) : postsError ? (
        <GlobalError error={postsError} />
      ) : userError ? null : (
        <UserPosts posts={displayedPosts || []} setPosts={setDisplayedPosts} author={user} />
      )}
    </Screen>
  );
}

export default UserProfilePage;
