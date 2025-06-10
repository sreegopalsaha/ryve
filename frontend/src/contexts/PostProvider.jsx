import { createContext, useContext, useEffect, useState } from "react";
import { getFeedPosts, getStarredPosts, getUserPosts, starPostToggle } from "../services/ApiServices";
import { useCurrentUser } from "./CurrentUserProvider";

export const PostContext = createContext(null);
export const usePost = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
    const [posts, setPostsState] = useState(null);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(null);

    const [currentUserPosts, setCurrentUserPostsState] = useState(null);
    const [currentUserPostsLoading, setCurrentUserPostsLoading] = useState(false);
    const [currentUserPostsError, setCurrentUserPostsError] = useState(null);

    const [starredPosts, setStarredPostsState] = useState(null);
    const [starredPostsLoading, setStarredPostsLoading] = useState(false);
    const [starredPostsError, setStarredPostsError] = useState(null);

    const { currentUser } = useCurrentUser();

    const fetchFeedPosts = async () => {
        // Only set full loading state on the first load when we have no cached posts
        if (posts === null) {
            setPostsLoading(true);
        }
        setPostsError(null);

        try {
            const res = await getFeedPosts();
            setPostsState(res.data?.data || []);
        } catch (error) {
            console.error("Unable to fetch feed posts", error);
            setPostsError(error);
        } finally {
            setPostsLoading(false);
        }
    };

    const fetchCurrentUserPosts = async (userIdentifier) => {
        const identifier = userIdentifier || currentUser?.username || currentUser?._id;
        if (!identifier) return;

        // Only set full loading state on the first load when we have no cached posts
        if (currentUserPosts === null) {
            setCurrentUserPostsLoading(true);
        }
        setCurrentUserPostsError(null);

        try {
            const res = await getUserPosts(identifier);
            setCurrentUserPostsState(res.data?.data || []);
        } catch (error) {
            console.error("Unable to fetch current user posts", error);
            setCurrentUserPostsError(error);
        } finally {
            setCurrentUserPostsLoading(false);
        }
    };

    const fetchStarredPosts = async () => {
        // Only set full loading state on the first load when we have no cached posts
        if (starredPosts === null) {
            setStarredPostsLoading(true);
        }
        setStarredPostsError(null);

        try {
            const res = await getStarredPosts();
            setStarredPostsState(res.data?.data || []);
        } catch (error) {
            console.error("Unable to fetch starred posts", error);
            setStarredPostsError(error);
        } finally {
            setStarredPostsLoading(false);
        }
    };

    const toggleStarPost = async (post) => {
        if (!currentUser || !post?._id) return;
        const postId = post._id;
        const userId = currentUser._id;

        // Snapshot previous states for rollback
        let prevFeed;
        let prevUser;
        let prevStarred;
        setPostsState((current) => {
            prevFeed = current;
            return current;
        });
        setCurrentUserPostsState((current) => {
            prevUser = current;
            return current;
        });
        setStarredPostsState((current) => {
            prevStarred = current;
            return current;
        });

        // Determine next starred state
        const currentStarredBy = post.starredBy || [];
        const isStarred = currentStarredBy.includes(userId);
        const nextStarredBy = isStarred
            ? currentStarredBy.filter((id) => id !== userId)
            : [...currentStarredBy, userId];

        const updatedPost = {
            ...post,
            starredBy: nextStarredBy,
        };

        // 1. Optimistically update feed posts
        setPostsState((prev) => {
            if (!prev) return prev;
            return prev.map((p) => (p._id === postId ? { ...p, starredBy: nextStarredBy } : p));
        });

        // 2. Optimistically update current user posts
        setCurrentUserPostsState((prev) => {
            if (!prev) return prev;
            return prev.map((p) => (p._id === postId ? { ...p, starredBy: nextStarredBy } : p));
        });

        // 3. Optimistically update starred posts
        setStarredPostsState((prev) => {
            if (!prev) return prev;
            if (isStarred) {
                // Removing star: filter it out
                return prev.filter((p) => p._id !== postId);
            } else {
                // Adding star: prepend to starred list (avoid duplicates)
                const filtered = prev.filter((p) => p._id !== postId);
                return [updatedPost, ...filtered];
            }
        });

        // 4. Send backend request
        try {
            await starPostToggle(postId);
        } catch (error) {
            console.error("Backend error while toggling star, rolling back state:", error);
            // Rollback on failure
            setPostsState(prevFeed);
            setCurrentUserPostsState(prevUser);
            setStarredPostsState(prevStarred);
            throw error;
        }
    };

    const setPosts = (value) => {
        setPostsState((prevFeed) => {
            const nextFeed = typeof value === "function" ? value(prevFeed) : value;

            // Sync deletion/addition/updates to other lists if loaded
            if (prevFeed && nextFeed && nextFeed.length < prevFeed.length) {
                const deletedIds = prevFeed
                    .filter((p) => !nextFeed.some((np) => np._id === p._id))
                    .map((p) => p._id);
                if (deletedIds.length > 0) {
                    setCurrentUserPostsState((prevUser) =>
                        prevUser ? prevUser.filter((p) => !deletedIds.includes(p._id)) : prevUser
                    );
                    setStarredPostsState((prevStarred) =>
                        prevStarred ? prevStarred.filter((p) => !deletedIds.includes(p._id)) : prevStarred
                    );
                }
            } else if (prevFeed && nextFeed && nextFeed.length > prevFeed.length) {
                const addedPosts = nextFeed.filter((p) => !prevFeed.some((op) => op._id === p._id));
                const currentUserAddedPosts = addedPosts.filter(
                    (p) =>
                        p.author?._id === currentUser?._id ||
                        p.author === currentUser?._id ||
                        p.author?.username?.toLowerCase() === currentUser?.username?.toLowerCase()
                );
                if (currentUserAddedPosts.length > 0) {
                    setCurrentUserPostsState((prevUser) =>
                        prevUser ? [...currentUserAddedPosts, ...prevUser] : prevUser
                    );
                }
            } else if (prevFeed && nextFeed && prevFeed !== nextFeed) {
                setCurrentUserPostsState((prevUser) => {
                    if (!prevUser) return prevUser;
                    return prevUser.map((uPost) => {
                        const updatedInFeed = nextFeed.find((nPost) => nPost._id === uPost._id);
                        return updatedInFeed ? updatedInFeed : uPost;
                    });
                });
                setStarredPostsState((prevStarred) => {
                    if (!prevStarred) return prevStarred;
                    return prevStarred.map((sPost) => {
                        const updatedInFeed = nextFeed.find((nPost) => nPost._id === sPost._id);
                        return updatedInFeed ? updatedInFeed : sPost;
                    });
                });
            }

            return nextFeed;
        });
    };

    const setCurrentUserPosts = (value) => {
        setCurrentUserPostsState((prevUser) => {
            const nextUser = typeof value === "function" ? value(prevUser) : value;

            // Sync deletion/addition/updates to other lists if loaded
            if (prevUser && nextUser && nextUser.length < prevUser.length) {
                const deletedIds = prevUser
                    .filter((p) => !nextUser.some((np) => np._id === p._id))
                    .map((p) => p._id);
                if (deletedIds.length > 0) {
                    setPostsState((prevFeed) =>
                        prevFeed ? prevFeed.filter((p) => !deletedIds.includes(p._id)) : prevFeed
                    );
                    setStarredPostsState((prevStarred) =>
                        prevStarred ? prevStarred.filter((p) => !deletedIds.includes(p._id)) : prevStarred
                    );
                }
            } else if (prevUser && nextUser && nextUser.length > prevUser.length) {
                const addedPosts = nextUser.filter((p) => !prevUser.some((op) => op._id === p._id));
                if (addedPosts.length > 0) {
                    setPostsState((prevFeed) => (prevFeed ? [...addedPosts, ...prevFeed] : prevFeed));
                }
            } else if (prevUser && nextUser && prevUser !== nextUser) {
                setPostsState((prevFeed) => {
                    if (!prevFeed) return prevFeed;
                    return prevFeed.map((fPost) => {
                        const updatedInUser = nextUser.find((uPost) => uPost._id === fPost._id);
                        return updatedInUser ? updatedInUser : fPost;
                    });
                });
                setStarredPostsState((prevStarred) => {
                    if (!prevStarred) return prevStarred;
                    return prevStarred.map((sPost) => {
                        const updatedInUser = nextUser.find((uPost) => uPost._id === sPost._id);
                        return updatedInUser ? updatedInUser : sPost;
                    });
                });
            }

            return nextUser;
        });
    };

    const setStarredPosts = (value) => {
        setStarredPostsState((prevStarred) => {
            const nextStarred = typeof value === "function" ? value(prevStarred) : value;

            // Sync deletion to feed and current user posts if loaded
            if (prevStarred && nextStarred && nextStarred.length < prevStarred.length) {
                const deletedIds = prevStarred
                    .filter((p) => !nextStarred.some((np) => np._id === p._id))
                    .map((p) => p._id);
                if (deletedIds.length > 0) {
                    setPostsState((prevFeed) =>
                        prevFeed ? prevFeed.filter((p) => !deletedIds.includes(p._id)) : prevFeed
                    );
                    setCurrentUserPostsState((prevUser) =>
                        prevUser ? prevUser.filter((p) => !deletedIds.includes(p._id)) : prevUser
                    );
                }
            }

            return nextStarred;
        });
    };

    // Reset post cache when currentUser logs out or changes
    useEffect(() => {
        if (!currentUser) {
            setPostsState(null);
            setPostsLoading(false);
            setPostsError(null);
            setCurrentUserPostsState(null);
            setCurrentUserPostsLoading(false);
            setCurrentUserPostsError(null);
            setStarredPostsState(null);
            setStarredPostsLoading(false);
            setStarredPostsError(null);
        }
    }, [currentUser]);

    return (
        <PostContext.Provider
            value={{
                posts,
                setPosts,
                postsLoading,
                postsError,
                fetchFeedPosts,
                currentUserPosts,
                currentUserPostsLoading,
                currentUserPostsError,
                fetchCurrentUserPosts,
                setCurrentUserPosts,
                starredPosts,
                starredPostsLoading,
                starredPostsError,
                fetchStarredPosts,
                setStarredPosts,
                toggleStarPost,
            }}
        >
            {children}
        </PostContext.Provider>
    );
};