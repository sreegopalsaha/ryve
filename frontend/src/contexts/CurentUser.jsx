import { createContext } from "react";

const currentUser = {

}

export const CurrentUserContext = createContext(null);

export const CurrentUserProvider = ({children})=>{
    return <CurrentUserContext.Provider value={currentUser}>
        {children}
    </CurrentUserContext.Provider>
}