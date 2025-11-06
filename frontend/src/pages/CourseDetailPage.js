import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import QuizComponent from '../components/QuizComponent';
import MatchingGameComponent from '../components/MatchingGameComponent';
import { getCourseProgress, markTopicComplete } from '../services/apiService';

// MUI Imports
import {
  Box, Typography, Grid, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, List, ListItemButton, ListItemIcon, // 'ListItem' সরানো হয়েছে
  ListItemText, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

// একটি সাহায্যকারী ফাংশন যা একটি টপিকের ধাপগুলোর তালিকা তৈরি করে
const getTopicSteps = (topic) => {
  const steps = [];
  if (topic.video_url) steps.push('video');
  if (topic.article_content) steps.push('article');
  if (topic.matching_game) steps.push('game');
  if (topic.topic_quiz) steps.push('quiz');
  return steps;
};

function CourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  
  const [currentActivity, setCurrentActivity] = useState({ type: null, data: null });
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0 = video, 1 = article...
  const [isCompleting, setIsCompleting] = useState(false); // Loading state

  const { courseId } = useParams();
  const { user } = useContext(AuthContext);

  // কোর্সের তথ্য এবং প্রগ্রেস ফেচ করার ফাংশন
  useEffect(() => {
    const fetchAllData = async () => {
      setCourse(null);
      setCurrentActivity({ type: null, data: null });
      setCompletedTopics(new Set());

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

  // "সম্পন্ন" করার ফাংশন
  const handleMarkComplete = async (topic) => {
    if (!user || completedTopics.has(topic.id) || isCompleting) {
      // যদি আগেই সম্পন্ন হয়ে থাকে, তবে সরাসরি পরবর্তী ধাপে যান
      findAndSetNextActivity(topic.id);
      return;
    };
    
    setIsCompleting(true);
    try {
      await markTopicComplete(topic.id);
      setCompletedTopics(prev => new Set(prev).add(topic.id));
      findAndSetNextActivity(topic.id); // সম্পন্ন করার পর পরবর্তী ধাপে যান
    } catch (error) {
      console.error("Error marking topic complete:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  // --- পরবর্তী কার্যক্রম খুঁজে বের করে সেট করার চূড়ান্ত ফাংশন ---
  const findAndSetNextActivity = (currentTopicId) => {
    if (!course || !currentTopicId) return;

    let currentChapterIndex = -1;
    let currentTopicIndex = -1;
    course.chapters.forEach((chapter, chIndex) => {
      const topicIndex = chapter.topics.findIndex(t => t.id === currentTopicId);
      if (topicIndex !== -1) {
        currentChapterIndex = chIndex;
        currentTopicIndex = topicIndex;
      }
    });

    if (currentChapterIndex === -1) return;
    const currentChapter = course.chapters[currentChapterIndex];

    // ১. একই অধ্যায়ের পরবর্তী টপিক
    if (currentTopicIndex < currentChapter.topics.length - 1) {
      const nextTopic = currentChapter.topics[currentTopicIndex + 1];
      handleTopicClick(nextTopic);
      return;
    }

    // ২. অধ্যায়ের শেষে অধ্যায় কুইজ
    if (currentChapter.chapter_quiz) {
      handleActivityClick('chapter_quiz', currentChapter.chapter_quiz);
      return;
    }
    // ৩. অধ্যায়ের শেষে অধ্যায় গেম
    if (currentChapter.matching_game) {
      handleActivityClick('chapter_game', currentChapter.matching_game);
      return;
    }
    // ৪. পরবর্তী অধ্যায়
    if (currentChapterIndex < course.chapters.length - 1) {
      const nextChapter = course.chapters[currentChapterIndex + 1];
      if (nextChapter.topics && nextChapter.topics.length > 0) {
        handleTopicClick(nextChapter.topics[0]);
        return;
      }
    }
    // ৫. কোর্সের শেষে কোর্স কুইজ
    if (course.course_quiz) {
      handleActivityClick('course_quiz', course.course_quiz);
      return;
    }
    // ৬. কোর্সের শেষে কোর্স গেম
    if (course.matching_game) {
      handleActivityClick('course_game', course.matching_game);
      return;
    }
    // ৭. সবকিছু শেষ
    alert("🎉 অভিনন্দন! আপনি কোর্সটি সফলভাবে সম্পন্ন করেছেন!");
    setCurrentActivity({ type: 'course_complete', data: null });
  };
  
  // --- টপিক ক্লিক করার সংশোধিত ফাংশন ---
  const handleTopicClick = (topic) => {
    setCurrentActivity({ type: 'topic', data: topic });
    
    const steps = getTopicSteps(topic);
    if (steps.length === 0) {
      // এটি একটি খালি টপিক
      setCurrentStepIndex(0); // কোনো ধাপ নেই
      // স্বয়ংক্রিয়ভাবে সম্পন্ন করুন
      if (user && !completedTopics.has(topic.id)) {
        handleMarkComplete(topic); 
      }
    } else {
      // কন্টেন্ট আছে, প্রথম ধাপ থেকে শুরু করুন
      setCurrentStepIndex(0); 
    }
  };

  // অধ্যায়/কোর্স কুইজ/গেম ক্লিক করার ফাংশন
  const handleActivityClick = (type, data) => {
    setCurrentActivity({ type, data });
  };
  
  // ইউটিউব লিঙ্ক ঠিক করার ফাংশন
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // --- ডান পাশের কন্টেন্ট দেখানোর জন্য সাহায্যকারী কম্পোনেন্ট ---
  const TopicViewer = () => {
    const topic = currentActivity.data;
    const steps = getTopicSteps(topic);
    
    // খালি টপিকের জন্য লোডিং/মেসেজ (হ্যান্ডলিং)
    if (steps.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">{topic.title}</Typography>
          <Typography>এই টপিকটিতে কোনো কন্টেন্ট নেই। পরবর্তী ধাপে যাওয়া হচ্ছে...</Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Box>
      );
    }
    
    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // পরবর্তী ধাপে যাওয়ার ফাংশন
    const goToNextStep = () => {
      if (isLastStep) {
        handleMarkComplete(topic); // শেষ ধাপ হলে টপিক সম্পন্ন করুন
      } else {
        setCurrentStepIndex(prev => prev + 1); // পরবর্তী ধাপে যান
      }
    };
    
    return (
      <Box sx={{ pb: 8 }}> {/* বাটন ওভারল্যাপ এড়ানোর জন্য প্যাডিং */}
        <Typography variant="h5" component="h2" gutterBottom>{topic.title}</Typography>
        
        {currentStep === 'video' && (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6">ভিডিও লেকচার</Typography>
            <iframe width="100%" height="400" src={getYouTubeEmbedUrl(topic.video_url)} title={topic.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '8px', border: '1px solid #eee' }}></iframe>
            <Button variant="contained" onClick={goToNextStep} sx={{ mt: 2 }} fullWidth>
              {isLastStep ? "টপিক সম্পন্ন করুন" : "পরবর্তী ধাপ"}
            </Button>
          </Box>
        )}

        {currentStep === 'article' && (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6">আর্টিকেল</Typography>
            <Box sx={{ background: '#f9f9f9', p: 2, borderRadius: '5px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: topic.article_content }} />
            <Button variant="contained" onClick={goToNextStep} sx={{ mt: 2 }} fullWidth>
              {isLastStep ? "টপিক সম্পন্ন করুন" : "পরবর্তী ধাপ"}
            </Button>
          </Box>
        )}

        {currentStep === 'game' && (
          <Box sx={{ my: 2 }}>
            <MatchingGameComponent gameData={topic.matching_game} onGameComplete={goToNextStep} />
            {/* "পরবর্তী ধাপ" বাটনটি গেমের ভেতর থেকে onGameComplete কল করে ট্রিগার হবে */}
          </Box>
        )}

        {currentStep === 'quiz' && (
          <Box sx={{ my: 2 }}>
            <QuizComponent quizData={topic.topic_quiz} onQuizComplete={goToNextStep} />
            {/* "পরবর্তী ধাপ" বাটনটি কুইজের ভেতর থেকে onQuizComplete কল করে ট্রিগার হবে */}
          </Box>
        )}
      </Box>
    );
  };


  // --- মূল UI ---
  if (!course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {/* বাম কলাম: কোর্স নেভিগেশন (সাইডবার) */}
      <Grid item xs={12} md={4}>
        <Typography variant="h4" component="h1" gutterBottom>{course.title}</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>{course.description}</Typography>
        <hr />
        <Typography variant="h6" component="h2" gutterBottom>কোর্সের অধ্যায়সমূহ</Typography>
        {user ? (
          course.chapters.map(chapter => (
            <Accordion key={chapter.id} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'medium' }}>{chapter.title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {chapter.topics.map(topic => (
                    <ListItemButton key={topic.id} onClick={() => handleTopicClick(topic)} selected={currentActivity.data?.id === topic.id}>
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                        {completedTopics.has(topic.id) ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={topic.title} />
                    </ListItemButton>
                  ))}
                  {(chapter.chapter_quiz || chapter.matching_game) && <Box sx={{ mt: 1, px: 1, pb: 1, display: 'flex', gap: 1 }}>
                      {chapter.chapter_quiz && (
                        <Button startIcon={<AssignmentIcon/>} fullWidth variant="outlined" size="small" onClick={() => handleActivityClick('chapter_quiz', chapter.chapter_quiz)}>অধ্যায় কুইজ</Button>
                      )}
                      {chapter.matching_game && (
                        <Button startIcon={<SportsEsportsIcon/>} fullWidth variant="outlined" size="small" color="secondary" onClick={() => handleActivityClick('chapter_game', chapter.matching_game)}>অধ্যায় গেম</Button>
                      )}
                  </Box>}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography>কোর্সের অধ্যায়গুলো দেখতে অনুগ্রহ করে <Button component={RouterLink} to="/login">লগইন</Button> করুন।</Typography>
        )}
        {(course.course_quiz || course.matching_game) && user && <Box sx={{ mt: 3, p: 1, borderTop: '1px solid #eee' }}>
             <Typography variant="h6" gutterBottom>কোর্স ফাইনাল</Typography>
             {course.course_quiz && (
                <Button startIcon={<AssignmentIcon/>} fullWidth variant="contained" size="medium" onClick={() => handleActivityClick('course_quiz', course.course_quiz)} sx={{ mb: 1 }}>কোর্স ফাইনাল কুইজ</Button>
              )}
             {course.matching_game && (
                <Button startIcon={<SportsEsportsIcon/>} fullWidth variant="contained" size="medium" color="secondary" onClick={() => handleActivityClick('course_game', course.matching_game)}>কোর্স ফাইনাল গেম</Button>
              )}
        </Box>}
      </Grid>

      {/* ডান কলাম: মূল কনটেন্ট */}
      <Grid item xs={12} md={8}>
        <Box sx={{ borderLeft: { md: '1px solid #ccc' }, pl: { md: 3 }, minHeight: '70vh' }}>
          {currentActivity.type === 'topic' ? (
            <TopicViewer />
          ) : currentActivity.type === 'chapter_quiz' || currentActivity.type === 'course_quiz' ? (
            <QuizComponent quizData={currentActivity.data} onQuizComplete={() => findAndSetNextActivity(currentActivity.data?.id)} />
          ) : currentActivity.type === 'chapter_game' || currentActivity.type === 'course_game' ? (
            <MatchingGameComponent gameData={currentActivity.data} onGameComplete={() => findAndSetNextActivity(currentActivity.data?.id)} />
          ) : currentActivity.type === 'course_complete' ? (
            <Typography variant="h5" color="success.main" align="center" sx={{ mt: 10 }}>🎉 অভিনন্দন! আপনি কোর্সটি সফলভাবে সম্পন্ন করেছেন! 🎉</Typography>
          ) : (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 10 }}>
              শুরু করার জন্য বাম পাশ থেকে একটি টপিক সিলেক্ট করুন।
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default CourseDetailPage;