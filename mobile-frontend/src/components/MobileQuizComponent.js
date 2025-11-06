import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, RadioButton, ActivityIndicator, Card } from 'react-native-paper';
import { submitQuizScoreApi } from '../services/api';

const MobileQuizComponent = ({ quizData, onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScore(null);
    setSelectedAnswers({});
    setLoading(false);
  }, [quizData]);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <Text style={styles.infoText}>এই কুইজটিতে এখনো কোনো প্রশ্ন যোগ করা হয়নি।</Text>;
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

    try {
      await submitQuizScoreApi(quizData.id, calculatedScore);
      console.log("কুইজের স্কোর সফলভাবে সেভ হয়েছে!");
      setScore(calculatedScore);
    } catch (error) {
      console.error("কুইজের স্কোর সেভ করতে সমস্যা হয়েছে:", error);
      setScore(calculatedScore);
    } finally {
      setLoading(false);
      if (onQuizComplete) {
        onQuizComplete();
      }
    }
  };

  if (score !== null) {
    return (
      <Card style={styles.resultCard}>
        {/* --- Card.Title এবং Card.Content-এর বদলে সাধারণ View ও Text ব্যবহার --- */}
        <View style={{ padding: 15, alignItems: 'center' }}>
          <Text variant="headlineSmall" style={{ marginBottom: 15 }}>কুইজের ফলাফল</Text>
          <Text variant="displayMedium" style={[styles.scoreText, { color: score >= 50 ? '#27ae60' : '#c0392b' }]}>
            {score.toFixed(0)}%
          </Text>
          <Button
            mode="outlined"
            onPress={() => { setScore(null); setSelectedAnswers({}); }}
            style={{ marginTop: 20 }}
          >
            আবার চেষ্টা করুন
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <View>
      {quizData.questions.map(question => (
        <View key={question.id} style={styles.questionBox}>
          <Text variant="titleLarge" style={styles.questionText}>{question.text}</Text>
          <RadioButton.Group
            onValueChange={newValue => handleAnswerSelect(question.id, parseInt(newValue))}
            value={selectedAnswers[question.id]?.toString()}
          >
            {question.answers.map(answer => (
              <RadioButton.Item key={answer.id} label={answer.text} value={answer.id.toString()} />
            ))}
          </RadioButton.Group>
        </View>
      ))}
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
        contentStyle={{ paddingVertical: 8 }}
      >
        {loading ? <ActivityIndicator animating={true} color="#fff" /> : 'সাবমিট করুন'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: { padding: 20, textAlign: 'center', fontSize: 16, color: '#888' },
  questionBox: { marginBottom: 20 },
  questionText: { marginBottom: 10 },
  submitButton: { marginTop: 20 },
  resultCard: { padding: 10, alignItems: 'center' },
  scoreText: { textAlign: 'center', fontWeight: 'bold', marginVertical: 15 }
});

export default MobileQuizComponent;