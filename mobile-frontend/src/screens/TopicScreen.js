import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import YoutubeIframe from 'react-native-youtube-iframe';
import RenderHTML from 'react-native-render-html';

import MobileQuizComponent from '../components/MobileQuizComponent';
import MobileMatchingGameComponent from '../components/MobileMatchingGameComponent';
import { markTopicCompleteApi } from '../services/api';
import AuthContext from '../context/AuthContext';

// একটি সাহায্যকারী ফাংশন যা একটি টপিকের ধাপগুলোর তালিকা তৈরি করে
const getTopicSteps = (topic) => {
  const steps = [];
  if (topic.video_url) steps.push('video');
  if (topic.article_content) steps.push('article');
  if (topic.matching_game) steps.push('game');
  if (topic.topic_quiz) steps.push('quiz');
  return steps;
};

// ইউটিউব লিঙ্ক থেকে শুধু ID বের করার ফাংশন
const getYouTubeVideoId = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const TopicScreen = ({ route, navigation }) => {
  // --- নতুন পরিকল্পনা অনুযায়ী ডেটা রিসিভ করা ---
  const { activityType, activityData, course } = route.params; 
  
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setVideoPlaying(false);
    setIsCompleting(false);

    // খালি টপিক স্বয়ংক্রিয়ভাবে সম্পন্ন করুন
    if (activityType === 'topic') {
      const steps = getTopicSteps(activityData);
      if (steps.length === 0 && user) {
        handleMarkComplete();
      }
    }
  }, [activityData, user]);

  // --- পরবর্তী কার্যক্রম খুঁজে বের করে সেট করার চূড়ান্ত ফাংশন ---
  const findAndSetNextActivity = () => {
    if (!course) { // course-এর বদলে courseChapters ব্যবহার করা হচ্ছিল, এটি ভুল ছিল
      Alert.alert("অভিনন্দন!", "আপনি এই কার্যক্রমটি সম্পন্ন করেছেন।");
      navigation.goBack();
      return;
    }

    let currentChapterIndex = -1;
    let currentTopicIndex = -1;
    let currentActivityId = activityData.id;

    // ১. বর্তমান কার্যক্রমের অবস্থান খুঁজে বের করা
    if (activityType === 'topic') {
        course.chapters.forEach((chapter, chIndex) => {
            const topicIndex = chapter.topics.findIndex(t => t.id === currentActivityId);
            if (topicIndex !== -1) {
                currentChapterIndex = chIndex;
                currentTopicIndex = topicIndex;
            }
        });
    } else {
        course.chapters.forEach((chapter, chIndex) => {
            if (chapter.chapter_quiz?.id === currentActivityId || chapter.matching_game?.id === currentActivityId) {
                currentChapterIndex = chIndex;
                currentTopicIndex = chapter.topics.length; // অধ্যায়ের শেষ হিসেবে ধরা হচ্ছে
            }
        });
    }

    if (currentChapterIndex === -1 && activityType !== 'course_quiz' && activityType !== 'course_game') {
        // যদি এটি কোর্স কুইজ বা গেম হয়, তবে অধ্যায় খোঁজার দরকার নেই
        if (activityType === 'course_quiz' || activityType === 'course_game') {
             // কোর্স কুইজ/গেম শেষ, এখন আসলেই সব শেষ
        } else {
            console.error("Error: Could not find current activity in course structure.");
            navigation.goBack();
            return;
        }
    }

    const currentChapter = course.chapters[currentChapterIndex];

    // --- ২. পরবর্তী ধাপের লজিক ---

    // যদি একটি টপিক শেষ হয়
    if (activityType === 'topic') {
      // ২.ক. একই অধ্যায়ের পরবর্তী টপিক আছে কি?
      if (currentChapter && currentTopicIndex < currentChapter.topics.length - 1) {
        const nextTopic = currentChapter.topics[currentTopicIndex + 1];
        navigation.replace('Topic', { activityType: 'topic', activityData: nextTopic, course });
        return;
      }
    }

    // ২.খ. পরবর্তী টপিক নেই বা এটি অধ্যায় কুইজ/গেম ছিল। অধ্যায় কুইজ বা গেম আছে কি?
    
    // অধ্যায় কুইজ (যদি থাকে এবং এইমাত্র শেষ না হয়ে থাকে)
    if (currentChapter && currentChapter.chapter_quiz && activityType !== 'chapter_quiz') {
      navigation.replace('Topic', { activityType: 'chapter_quiz', activityData: currentChapter.chapter_quiz, course });
      return;
    }

    // অধ্যায় গেম (যদি থাকে এবং এইমাত্র শেষ না হয়ে থাকে)
    if (currentChapter && currentChapter.matching_game && activityType !== 'chapter_game') {
      navigation.replace('Topic', { activityType: 'chapter_game', activityData: currentChapter.matching_game, course });
      return;
    }

    // ৩. পরবর্তী অধ্যায় আছে কি?
    if (currentChapterIndex < course.chapters.length - 1) {
      const nextChapter = course.chapters[currentChapterIndex + 1];
      if (nextChapter.topics && nextChapter.topics.length > 0) {
        const firstTopicOfNextChapter = nextChapter.topics[0];
        navigation.replace('Topic', { activityType: 'topic', activityData: firstTopicOfNextChapter, course });
        return;
      }
    }
    
    // --- এটিই সেই নতুন লজিক যা আগে ছিল না ---
    // ৪. কোর্স কুইজ আছে কি?
    if (course.course_quiz && activityType !== 'course_quiz') {
      navigation.replace('Topic', { activityType: 'course_quiz', activityData: course.course_quiz, course });
      return;
    }
    // ৫. কোর্স গেম আছে কি?
    if (course.matching_game && activityType !== 'course_game') {
      navigation.replace('Topic', { activityType: 'course_game', activityData: course.matching_game, course });
      return;
    }
    
    // ৬. সবকিছু শেষ
    Alert.alert("🎉 অভিনন্দন!", "আপনি কোর্সটি সফলভাবে সম্পন্ন করেছেন!");
    navigation.popToTop(); // একদম হোমপেজে ফেরত যান
  };

  // "সম্পন্ন" করার ফাংশন
  const handleMarkComplete = async () => {
    if (!user || isCompleting) {
      findAndSetNextActivity();
      return;
    }
    
    if (activityType === 'topic') {
      setIsCompleting(true);
      try {
        await markTopicCompleteApi(activityData.id);
      } catch (error) {
        console.error("Error marking topic complete:", error);
      } finally {
        setIsCompleting(false);
      }
    }
    
    findAndSetNextActivity();
  };

  // ভিডিওর অবস্থা পরিবর্তন হলে
  const onVideoStateChange = useCallback((state) => {
    if (state === "ended") setVideoPlaying(false);
  }, []);

  const renderContent = () => {
    switch (activityType) {
      // --- কেস ১: যদি এটি একটি টপিক হয় ---
      case 'topic':
        const topic = activityData;
        const steps = getTopicSteps(topic);
        if (steps.length === 0) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
        const currentStep = steps[currentStepIndex];
        const isLastStep = currentStepIndex === steps.length - 1;
        const videoId = getYouTubeVideoId(topic.video_url || '');

        const goToNextStep = () => {
          if (isLastStep) handleMarkComplete();
          else {
            setVideoPlaying(false);
            setCurrentStepIndex(prev => prev + 1);
          }
        };

        return (
          <>
            {currentStep === 'video' && videoId && (
              <View style={styles.stepBox}>
                <Text variant="titleLarge" style={styles.stepTitle}>ভিডিও লেকচার</Text>
                <YoutubeIframe height={(width - 40) * (9 / 16)} videoId={videoId} play={videoPlaying} onChangeState={onVideoStateChange} />
                <Button mode="contained" onPress={goToNextStep} style={styles.button} disabled={isCompleting}>
                  {isCompleting ? <ActivityIndicator color="#fff" /> : (isLastStep ? "টপিক সম্পন্ন করুন" : "পরবর্তী ধাপ")}
                </Button>
              </View>
            )}
            {currentStep === 'article' && (
              <View style={styles.stepBox}>
                <Text variant="titleLarge" style={styles.stepTitle}>আর্টিকেল</Text>
                <RenderHTML contentWidth={width - 40} source={{ html: topic.article_content }} />
                <Button mode="contained" onPress={goToNextStep} style={styles.button} disabled={isCompleting}>
                  {isCompleting ? <ActivityIndicator color="#fff" /> : (isLastStep ? "টপিক সম্পন্ন করুন" : "পরবর্তী ধাপ")}
                </Button>
              </View>
            )}
            {currentStep === 'game' && (
              <View style={styles.stepBox}>
                <Text variant="titleLarge" style={styles.stepTitle}>ম্যাচিং গেম</Text>
                <MobileMatchingGameComponent gameData={topic.matching_game} onGameComplete={goToNextStep} />
              </View>
            )}
            {currentStep === 'quiz' && (
              <View style={styles.stepBox}>
                <Text variant="titleLarge" style={styles.stepTitle}>কুইজ</Text>
                <MobileQuizComponent quizData={topic.topic_quiz} onQuizComplete={goToNextStep} />
              </View>
            )}
          </>
        );
      
      // --- কেস ২ ও ৩: যদি এটি অধ্যায় বা কোর্স কুইজ/গেম হয় ---
      case 'chapter_quiz':
      case 'course_quiz':
        return <MobileQuizComponent quizData={activityData} onQuizComplete={handleMarkComplete} />;
        
      case 'chapter_game':
      case 'course_game':
        return <MobileMatchingGameComponent gameData={activityData} onGameComplete={handleMarkComplete} />;
        
      default:
        return <Text style={{ textAlign: 'center' }}>কিছু একটা সমস্যা হয়েছে।</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>{activityData.title}</Text>
        {renderContent()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { marginBottom: 20 },
  stepBox: { marginBottom: 30 },
  stepTitle: { marginBottom: 15 },
  button: { marginTop: 20, paddingVertical: 4 }
});

export default TopicScreen;