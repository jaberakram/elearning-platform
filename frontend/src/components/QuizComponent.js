import React, { useState, useEffect } from 'react';
import { submitQuizScore } from '../services/apiService'; // স্কোর জমা দেওয়ার ফাংশন
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress } from '@mui/material'; // MUI কম্পোনেন্ট

// quizData এবং onQuizComplete prop হিসেবে আসছে
function QuizComponent({ quizData, onQuizComplete }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false); // সাবমিট করার সময় লোডিং

  // যখন নতুন কুইজ লোড হবে, তখন পুরনো স্কোর রিসেট করা
  useEffect(() => {
    setScore(null);
    setSelectedAnswers({});
    setLoading(false);
  }, [quizData]); // quizData পরিবর্তন হলে এটি চলবে

  // যদি কুইজের ডেটা না থাকে বা প্রশ্ন খালি থাকে
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <Typography>এই কুইজটিতে এখনো কোনো প্রশ্ন যোগ করা হয়নি।</Typography>;
  }

  // উত্তর সিলেক্ট করার হ্যান্ডলার
  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId, // উত্তরটি int হিসেবে সেভ হচ্ছে
    });
  };

  // কুইজ সাবমিট করার হ্যান্ডলার
  const handleSubmit = async () => {
    // সব প্রশ্নের উত্তর দেওয়া হয়েছে কি না, তা পরীক্ষা করা (ঐচ্ছিক)
    // if (Object.keys(selectedAnswers).length !== quizData.questions.length) {
    //   alert("অনুগ্রহ করে সব প্রশ্নের উত্তর দিন।");
    //   return;
    // }

    setLoading(true);
    let correctAnswers = 0;

    quizData.questions.forEach(question => {
      const correctAnswer = question.answers.find(ans => ans.is_correct);
      // Ensure selected answer is compared correctly (it's stored as int)
      if (correctAnswer && selectedAnswers[question.id] === correctAnswer.id) {
        correctAnswers++;
      }
    });

    const calculatedScore = (correctAnswers / quizData.questions.length) * 100;

    // স্কোরটি ব্যাকএন্ডে সেভ করা
    try {
      await submitQuizScore(quizData.id, calculatedScore);
      console.log("কুইজের স্কোর সফলভাবে সেভ হয়েছে!");
      setScore(calculatedScore); // স্কোর দেখানোর জন্য সেট করা
    } catch (error) {
      console.error("কুইজের স্কোর সেভ করতে সমস্যা হয়েছে:", error);
      alert("স্কোর সেভ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      // Optionally show score even if saving failed
      // setScore(calculatedScore);
    } finally {
      setLoading(false); // লোডিং শেষ
      // কুইজ শেষ এবং স্কোর জমা দেওয়া শেষ হলে CourseDetailPage-কে জানানো
      if(onQuizComplete) {
          onQuizComplete();
      }
    }
  };

  // যদি ফলাফল দেখানো হয়ে গিয়ে থাকে
  if (score !== null) {
    return (
      <Box sx={{ textAlign: 'center', p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" color="primary">কুইজের ফলাফল</Typography>
        <Typography variant="h5" sx={{ my: 3 }}>
          আপনি পেয়েছেন: <strong style={{ color: score >= 50 ? 'green' : 'red' }}>{score.toFixed(2)}%</strong>
        </Typography>
        <Button
          variant="outlined"
          onClick={() => { setScore(null); setSelectedAnswers({}); }} // রিসেট
        >
          আবার চেষ্টা করুন
        </Button>
      </Box>
    );
  }

  // কুইজ দেখানোর UI
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>{quizData.title}</Typography>
      {quizData.questions.map(question => (
        <FormControl component="fieldset" key={question.id} sx={{ mb: 3, width: '100%' }}>
          <Typography variant="h6" component="legend" sx={{ mb: 1 }}>{question.text}</Typography>
          <RadioGroup
            name={`question-${question.id}`}
            value={selectedAnswers[question.id] || ''} // বর্তমান সিলেকশন দেখানো
            onChange={(e) => handleAnswerSelect(question.id, parseInt(e.target.value))} // value string হিসেবে আসে, int করতে হবে
          >
            {question.answers.map(answer => (
              <FormControlLabel
                key={answer.id}
                value={answer.id} // value হিসেবে ID ব্যবহার করা হচ্ছে
                control={<Radio />}
                label={answer.text}
              />
            ))}
          </RadioGroup>
        </FormControl>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading} // লোডিং অবস্থায় বাটন নিষ্ক্রিয় থাকবে
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'সাবমিট করুন'}
      </Button>
    </Box>
  );
}

export default QuizComponent;