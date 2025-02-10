import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/ApiServices";
import Cookies from "js-cookie";

export const CurrentUserContext = createContext(null);
export const useCurrentUser = () => useContext(CurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState("");
    const [token, setToken] = useState(Cookies.get("token"));

    const fetchCurrentUser = async () => {
        if (!token) {
            setCurrentUser(null);
            return;
        }
        setCurrentUserLoading(true);
        setCurrentUserError("");

        try {
            const res = await getCurrentUser();
            setCurrentUser(res.data);
        } catch (error) {
            console.log("Unable to fetch current user", error);
            setCurrentUserError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setCurrentUserLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const newToken = Cookies.get("token");
            if (newToken !== token) {
                setToken(newToken);
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        fetchCurrentUser();
    }, [token]);

    return (
        <CurrentUserContext.Provider value={{ currentUser, currentUserLoading, currentUserError, fetchCurrentUser }}>
            {children}
        </CurrentUserContext.Provider>
    );
};
