import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // AuthProvider ইমপোর্ট করুন

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* App কম্পোনেন্টকে AuthProvider দিয়ে মুড়ে দিন */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);