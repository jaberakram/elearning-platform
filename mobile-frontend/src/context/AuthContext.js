import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // 'jwt-decode' v4+

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // অ্যাপ চালু হওয়ার সময় লোডিং

  // অ্যাপ চালু হওয়ার সময় AsyncStorage থেকে পুরনো টোকেন খোঁজার চেষ্টা
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedTokens = await AsyncStorage.getItem('tokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          setUser(jwtDecode(parsedTokens.access));
        }
      } catch (e) {
        console.error("Failed to load tokens from storage", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadStorageData();
  }, []);

  // লগইন করার ফাংশন
  const login = async (newTokens) => {
    try {
      setTokens(newTokens);
      setUser(jwtDecode(newTokens.access));
      // AsyncStorage-তে টোকেন সেভ করা
      await AsyncStorage.setItem('tokens', JSON.stringify(newTokens));
    } catch (e) {
      console.error("Failed to save tokens", e);
    }
  };

  // লগআউট করার ফাংশন
  const logout = async () => {
    try {
      setTokens(null);
      setUser(null);
      // AsyncStorage থেকে টোকেন মুছে ফেলা
      await AsyncStorage.removeItem('tokens');
    } catch (e) {
      console.error("Failed to remove tokens", e);
    }
  };

  const contextData = {
    user,
    tokens,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;