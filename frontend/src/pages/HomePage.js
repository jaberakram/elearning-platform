import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

// --- MUI কম্পোনেন্টগুলো ইমপোর্ট করুন ---
import { Grid, Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';

function HomePage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8001/api/courses/');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        আমাদের কোর্সসমূহ
      </Typography>
      
      {/* কোর্স দেখানোর জন্য গ্রিড সিস্টেম */}
      <Grid container spacing={4}>
        {courses.length > 0 ? (
          courses.map(course => (
            // প্রতিটি কার্ডের জন্য গ্রিড আইটেম (মাঝারি ডিভাইসে ৩টি, ছোট ডিভাইসে ১টি)
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {course.title}
                  </Typography>
                  <Typography>
                    {course.description.substring(0, 100)}... {/* বর্ণনা ছোট করে দেখানো */}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/course/${course.id}`} 
                    size="small"
                  >
                    কোর্সটি দেখুন
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ ml: 4 }}>
            এখনো কোনো কোর্স যোগ করা হয়নি।
          </Typography>
        )}
      </Grid>
    </Box>
  );
}

export default HomePage;