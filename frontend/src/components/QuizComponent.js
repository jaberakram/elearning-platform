import React, { useState } from 'react';
// --- নতুন submitQuizScore ফাংশনটি ইমপোর্ট করুন ---
import { submitQuizScore } from '../services/apiService';

// --- MUI কম্পোনেন্ট ইমপোর্ট করুন (UI সুন্দর করার জন্য) ---
import { Box, Typography, Button, Radio, FormControlLabel, CircularProgress } from '@mui/material';

function QuizComponent({ quizData }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false); // সাবমিট করার সময় লোডিং দেখানোর জন্য

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <Typography>এই কুইজটিতে এখনো কোনো প্রশ্ন যোগ করা হয়নি।</Typography>;
  }

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    let correctAnswers = 0;
    
    quizData.questions.forEach(question => {
      const correctAnswer = question.answers.find(ans => ans.is_correct);
      if (correctAnswer && selectedAnswers[question.id] === correctAnswer.id) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = (correctAnswers / quizData.questions.length) * 100;
    setScore(calculatedScore);

    // --- নতুন কাজ: স্কোরটি ব্যাকএন্ডে সেভ করা ---
    try {
      await submitQuizScore(quizData.id, calculatedScore);
      console.log("স্কোর সফলভাবে সেভ হয়েছে!");
    } catch (error) {
      console.error("স্কোর সেভ করতে সমস্যা হয়েছে:", error);
      // এখানে ব্যবহারকারীকে একটি এরর মেসেজ দেখানো যেতে পারে
    } finally {
      setLoading(false); // লোডিং শেষ
    }
  };

  // যদি ফলাফল দেখানো হয়ে গিয়ে থাকে
  if (score !== null) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2">কুইজের ফলাফল</Typography>
        <Typography variant="h5" sx={{ my: 2 }}>
          আপনি পেয়েছেন: {score.toFixed(2)}%
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => { setScore(null); setSelectedAnswers({}); }}
        >
          আবার চেষ্টা করুন
        </Button>
      </Box>
    );
  }

  // কুইজ দেখানোর UI
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>{quizData.title}</Typography>
      {quizData.questions.map(question => (
        <Box key={question.id} sx={{ mb: 2 }}>
          <Typography variant="h6">{question.text}</Typography>
          {question.answers.map(answer => (
            <Box key={answer.id}>
              <FormControlLabel
                control={
                  <Radio
                    name={`question-${question.id}`}
                    onChange={() => handleAnswerSelect(question.id, answer.id)}
                  />
                }
                label={answer.text}
              />
            </Box>
          ))}
        </Box>
      ))}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmit} 
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'সাবমিট করুন'}
      </Button>
    </Box>
  );
}

export default QuizComponent;