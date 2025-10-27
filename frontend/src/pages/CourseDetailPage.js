import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import QuizComponent from '../components/QuizComponent';
import { getCourseProgress, markTopicComplete } from '../services/apiService';

// --- MUI কম্পোনেন্টগুলো ইমপোর্ট করুন ---
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Accordion-এর জন্য আইকন
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // সম্পন্ন টপিকের জন্য আইকন
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'; // অসম্পন্ন টপিকের জন্য আইকন
import AssignmentIcon from '@mui/icons-material/Assignment'; // কুইজ আইকন

function CourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);

  // কোর্সের তথ্য এবং প্রগ্রেস ফেচ করার ফাংশন
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const courseRes = await axios.get(`http://127.0.0.1:8001/api/courses/${courseId}/`);
        setCourse(courseRes.data);

        if (user) {
          const progressRes = await getCourseProgress(courseId);
          const completedIds = progressRes.data.map(progress => progress.topic);
          setCompletedTopics(new Set(completedIds));
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };
    fetchAllData();
  }, [courseId, user]);

  // "সম্পন্ন" বাটনে ক্লিক করার ফাংশন (আগের মতোই)
  const handleMarkComplete = async (topicId) => {
    try {
      await markTopicComplete(topicId);
      setCompletedTopics(prevSet => new Set(prevSet).add(topicId));
      alert("টপিক সম্পন্ন হয়েছে!");
    } catch (error) {
      console.error("Error marking topic complete:", error);
      alert("টপিকটি সম্পন্ন হিসেবে চিহ্নিত করা যায়নি।");
    }
  };

  // টপিক বা কুইজ সিলেক্ট করার ফাংশন
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setSelectedQuiz(null);
  };
  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedTopic(null);
  };

  // ইউটিউব লিঙ্ক ঠিক করার ফাংশন (আগের মতোই)
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // লোডিং স্পিনার
  if (!course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // মূল UI (দুই কলাম লেআউট)
  return (
    <Grid container spacing={4}>
      
      {/* বাম কলাম: কোর্স নেভিগেশন (সাইডবার) */}
      <Grid item xs={12} md={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {course.description}
        </Typography>
        <hr />
        
        <Typography variant="h6" component="h2" gutterBottom>
          কোর্সের অধ্যায়সমূহ
        </Typography>
        {user ? (
          course.chapters.map(chapter => (
            <Accordion key={chapter.id} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>{chapter.title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {chapter.topics.map(topic => (
                    <ListItemButton 
                      key={topic.id} 
                      onClick={() => handleTopicClick(topic)}
                      selected={selectedTopic?.id === topic.id}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                        {completedTopics.has(topic.id) ? 
                          <CheckCircleIcon color="success" fontSize="small" /> : 
                          <RadioButtonUncheckedIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={topic.title} />
                      {topic.topic_quiz && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={(e) => { e.stopPropagation(); handleQuizClick(topic.topic_quiz); }}
                          sx={{ ml: 1, fontSize: '0.7em' }}
                        >
                          কুইজ
                        </Button>
                      )}
                    </ListItemButton>
                  ))}
                  {chapter.chapter_quiz && (
                    <ListItemButton 
                      onClick={() => handleQuizClick(chapter.chapter_quiz)}
                      selected={selectedQuiz?.id === chapter.chapter_quiz.id}
                      sx={{ background: '#f0f0f0' }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                        <AssignmentIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`${chapter.title} - অধ্যায় কুইজ`} sx={{ fontWeight: 'bold' }} />
                    </ListItemButton>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography>
            কোর্সের অধ্যায়গুলো দেখতে অনুগ্রহ করে <Button component={RouterLink} to="/login">লগইন</Button> করুন।
          </Typography>
        )}
      </Grid>

      {/* ডান কলাম: মূল কনটেন্ট (ভিডিও/আর্টিকেল/কুইজ) */}
      <Grid item xs={12} md={8}>
        <Box sx={{ borderLeft: { md: '1px solid #ccc' }, pl: { md: 3 } }}>
          {selectedTopic ? (
            // যদি টপিক সিলেক্ট করা থাকে
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>{selectedTopic.title}</Typography>
              {selectedTopic.video_url && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="h6">ভিডিও লেকচার</Typography>
                  <iframe 
                    width="100%" 
                    height="400" 
                    src={getYouTubeEmbedUrl(selectedTopic.video_url)}
                    title={selectedTopic.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ borderRadius: '8px', border: '1px solid #eee' }}
                  ></iframe>
                </Box>
              )}
              {selectedTopic.article_content && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="h6">আর্টিকেল</Typography>
                  <Box sx={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', p: 2, borderRadius: '5px', lineHeight: '1.6' }}>
                    {selectedTopic.article_content}
                  </Box>
                </Box>
              )}
              <hr />
              {completedTopics.has(selectedTopic.id) ? (
                <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} /> আপনি এই টপিকটি সম্পন্ন করেছেন।
                </Typography>
              ) : (
                <Button 
                  onClick={() => handleMarkComplete(selectedTopic.id)}
                  variant="contained" 
                  color="success" 
                  fullWidth
                >
                  সম্পন্ন হিসেবে চিহ্নিত করুন
                </Button>
              )}
            </Box>
          ) : selectedQuiz ? (
            // যদি কুইজ বাটন ক্লিক করা হয়
            <QuizComponent quizData={selectedQuiz} />
          ) : (
            // যদি কিছুই সিলেক্ট করা না থাকে
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 10 }}>
              শুরু করার জন্য বাম পাশ থেকে একটি টপিক অথবা কুইজ সিলেক্ট করুন।
            </Typography>
          )}
        </Box>
      </Grid>

    </Grid>
  );
}

export default CourseDetailPage;