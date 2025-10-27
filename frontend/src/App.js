import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// --- MUI কম্পোনেন্টগুলো ইমপোর্ট করুন ---
import { AppBar, Toolbar, Typography, Button, Container, Box, Link } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline'; // CSS রিসেট করার জন্য

// Pages and Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <Router>
      <CssBaseline /> {/* MUI-এর বেসলাইন CSS যোগ করে */}
      
      {/* নতুন AppBar (নেভিগেশন বার) */}
      <AppBar position="static">
        <Toolbar>
          {/* Logo/Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
              ই-লার্নিং প্ল্যাটফর্ম
            </Link>
          </Typography>

          {/* নেভিগেশন লিঙ্ক */}
          <Button component={RouterLink} to="/" color="inherit">হোম</Button>
          {user && (
            <Button component={RouterLink} to="/dashboard" color="inherit">ড্যাশবোর্ড</Button>
          )}

          {/* লগইন/লগআউট বাটন */}
          {user ? (
            <>
              <Typography sx={{ ml: 2 }}>হ্যালো, {user.username}</Typography>
              <Button onClick={logoutUser} color="inherit" sx={{ ml: 1 }}>
                লগআউট
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit">
              লগইন / রেজিস্টার
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {/* পেজের কন্টেন্ট */}
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}> {/* উপরে-নিচে মার্জিন যোগ করা হলো */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;