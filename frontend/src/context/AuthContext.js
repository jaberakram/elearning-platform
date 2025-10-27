import React, { createContext, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Helper function to get data from localStorage safely
    const getInitialData = () => {
        const storedTokens = localStorage.getItem('tokens');
        if (storedTokens) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                // Ensure the token has the access property before decoding
                if (parsedTokens && parsedTokens.access) {
                    return { tokens: parsedTokens, user: jwtDecode(parsedTokens.access) };
                }
            } catch (e) {
                console.error("Failed to parse tokens from localStorage, removing invalid data.", e);
                localStorage.removeItem('tokens'); // Remove corrupted data
            }
        }
        return { tokens: null, user: null };
    };

    const [tokens, setTokens] = useState(() => getInitialData().tokens);
    const [user, setUser] = useState(() => getInitialData().user);

    const loginUser = (newTokens) => {
        setTokens(newTokens);
        setUser(jwtDecode(newTokens.access));
        localStorage.setItem('tokens', JSON.stringify(newTokens));
    };

    const logoutUser = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('tokens');
    };

    const contextData = {
        user,
        tokens,
        loginUser,
        logoutUser,
    };

    // এখানে provider-এর 'P' অবশ্যই বড় হাতের হবে
    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;