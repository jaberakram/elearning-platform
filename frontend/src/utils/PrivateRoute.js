import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // যদি ব্যবহারকারী লগইন করা না থাকে, তাহলে তাকে লগইন পেজে পাঠিয়ে দাও
  if (!user) {
    return <Navigate to="/login" />;
  }

  // যদি ব্যবহারকারী লগইন করা থাকে, তাহলে তাকে তার কাঙ্ক্ষিত পেজটি দেখাও
  return children;
};

export default PrivateRoute;