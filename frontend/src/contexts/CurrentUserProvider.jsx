import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe } from "../services/ApiServices";
import Cookies from "js-cookie";

export const CurrentUserContext = createContext(null);
export const useCurrentUser = () => useContext(CurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserLoading, setCurrentUserLoading] = useState(true);
    const [currentUserError, setCurrentUserError] = useState("");

    const fetchCurrentUser = useCallback(async () => {
        const token = Cookies.get("token");
        if (!token) {
            setCurrentUser(null);
            setCurrentUserLoading(false);
            return;
        }
        setCurrentUserLoading(true);
        setCurrentUserError("");

        try {
            const res = await getMe();
            setCurrentUser(res.data?.data || null);
        } catch (error) {
            console.log("Unable to fetch current user", error);
            setCurrentUserError(error?.response?.data?.message || "Something went wrong");
            setCurrentUser(null);
        } finally {
            setCurrentUserLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const updateCurrentUser = useCallback((partialData) => {
        setCurrentUser((prev) => (prev ? { ...prev, ...partialData } : prev));
    }, []);

    return (
        <CurrentUserContext.Provider 
            value={{ 
                currentUser, 
                currentUserLoading, 
                currentUserError, 
                fetchCurrentUser,
                updateCurrentUser,
                setCurrentUser 
            }}
        >
            {children}
        </CurrentUserContext.Provider>
    );
};
