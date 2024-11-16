import { createContext, useContext, useState } from "react";


export const CurrentUserContext = createContext(null);

    const [currentUser , setCurrentUser] = useState(null);

export const CurrentUserProvider = ({children})=>{
    return <CurrentUserContext.Provider value={currentUser}>
        {children}
    </CurrentUserContext.Provider>
}