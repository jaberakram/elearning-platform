import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser as apiLoginUser } from '../services/apiService';
import AuthContext from '../context/AuthContext';

// --- MUI কম্পোনেন্টগুলো ইমপোর্ট করুন ---
import { Button, TextField, Container, Box, Typography } from '@mui/material';

function LoginPage() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ... handleRegister এবং handleLogin ফাংশন দুটি আগের মতোই থাকবে ...
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username: regUsername, email: regEmail, password: regPassword });
      alert('রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : 'Server error');
      alert('রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLoginUser({ username: loginUsername, password: loginPassword });
      loginUser(response.data);
      alert('লগইন সফল হয়েছে!');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : 'Server error');
      alert('লগইন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: '40px', mt: 5 }}>

        {/* Registration Form */}
        <Box component="form" onSubmit={handleRegister} sx={{ width: '45%', p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Typography>
          <TextField
            label="ইউজারনেম"
            variant="outlined"
            fullWidth
            margin="normal"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            required
          />
          <TextField
            label="ইমেইল"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            required
          />
          <TextField
            label="পাসওয়ার্ড"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            রেজিস্টার
          </Button>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ width: '45%', p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            লগইন করুন
          </Typography>
          <TextField
            label="ইউজারনেম"
            variant="outlined"
            fullWidth
            margin="normal"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />
          <TextField
            label="পাসওয়ার্ড"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 2 }}>
            লগইন
          </Button>
        </Box>

      </Box>
    </Container>
  );
}

export default LoginPage;