import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/apiService'; 
import { Link as RouterLink } from 'react-router-dom';

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  LinearProgress,
  CircularProgress
} from '@mui/material';

function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats(); 
        setStats(response.data);
      } catch (error) {
        console.error("ড্যাশবোর্ডের তথ্য আনতে সমস্যা হয়েছে:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        আমার ড্যাশবোর্ড
      </Typography>
      
      {stats.length > 0 ? (
        <Grid container spacing={3}>
          {stats.map(courseStat => (
            <Grid item key={courseStat.course_id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {courseStat.course_title}
                  </Typography>
                  
                  {/* টপিক প্রগ্রেস */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    টপিক সম্পন্ন করেছেন: {courseStat.completed_topics} / {courseStat.total_topics}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={courseStat.completion_percentage} 
                        color="success"
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(courseStat.completion_percentage)}%`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ----- নতুন সেকশন: কুইজের গড় স্কোর ----- */}
                  {courseStat.average_quiz_score !== null ? (
                    <Typography variant="body2" color="text.secondary">
                      কুইজে গড় স্কোর: <strong>{courseStat.average_quiz_score}%</strong>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      এখনো কোনো কুইজ দেননি।
                    </Typography>
                  )}
                  
                </CardContent>
                <CardActions>
                  <Button component={RouterLink} to={`/course/${courseStat.course_id}`} size="small">
                    কোর্সটি আবার দেখুন
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>
          আপনি এখনো কোনো কোর্স শুরু করেননি। 
          <Button component={RouterLink} to="/">হোমপেজ থেকে একটি কোর্স শুরু করুন।</Button>
        </Typography>
      )}
    </Box>
  );
}

export default DashboardPage;