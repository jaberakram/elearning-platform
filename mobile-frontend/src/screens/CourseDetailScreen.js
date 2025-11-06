import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, ActivityIndicator, List, Divider, Button } from 'react-native-paper';
import { getCourseDetailApi, getCourseProgressApi } from '../services/api';
import AuthContext from '../context/AuthContext';

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params; 
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const courseResponse = await getCourseDetailApi(courseId);
        setCourse(courseResponse.data);

        if (user) {
          const progressResponse = await getCourseProgressApi(courseId);
          const completedIds = progressResponse.data.map(progress => progress.topic);
          setCompletedTopics(new Set(completedIds));
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        Alert.alert('ত্রুটি', 'কোর্সের তথ্য আনতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [courseId, user]);

  // --- নতুন নেভিগেশন ফাংশন ---
  const navigateToActivity = (type, data) => {
    navigation.navigate('Topic', {
      activityType: type,
      activityData: data,
      course: course, // <-- সম্পূর্ণ course অবজেক্ট পাঠানো হচ্ছে
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!course) {
    return (
      <View style={styles.container}>
        <Text>কোর্স খুঁজে পাওয়া যায়নি।</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={course.chapters}
      keyExtractor={(item) => item.id.toString()}
      style={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="headlineLarge">{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>
      }
      renderItem={({ item: chapter }) => (
        <List.Accordion
          title={chapter.title}
          titleStyle={styles.chapterTitle}
          id={chapter.id.toString()}
          style={styles.accordion}
          defaultExpanded
        >
          {chapter.topics.map(topic => {
            const isCompleted = completedTopics.has(topic.id);
            return (
              <List.Item
                key={topic.id}
                title={topic.title}
                titleStyle={styles.topicTitle}
                left={props => (
                  <List.Icon 
                    {...props} 
                    icon={isCompleted ? "check-circle" : "circle-small"} 
                    color={isCompleted ? '#2ECC71' : '#808B96'}
                  />
                )}
                onPress={() => navigateToActivity('topic', topic)}
                style={styles.topicItem}
              />
            );
          })}
          {chapter.chapter_quiz && (
            <Button icon="fountain-pen-tip" mode="outlined" style={styles.activityButton} onPress={() => navigateToActivity('chapter_quiz', chapter.chapter_quiz)}>
              অধ্যায় কুইজ
            </Button>
          )}
          {chapter.matching_game && (
             <Button icon="cards-playing-outline" mode="outlined" style={styles.activityButton} onPress={() => navigateToActivity('chapter_game', chapter.matching_game)}>
              অধ্যায় ম্যাচিং গেম
            </Button>
          )}
        </List.Accordion>
      )}
      ItemSeparatorComponent={() => <Divider />}
      ListFooterComponent={
        <View style={styles.footer}>
          {course.course_quiz && (
             <Button icon="fountain-pen-tip" mode="contained" style={styles.activityButton} onPress={() => navigateToActivity('course_quiz', course.course_quiz)}>
              কোর্স ফাইনাল কুইজ
            </Button>
          )}
          {course.matching_game && (
             <Button icon="cards-playing-outline" mode="contained" style={styles.activityButton} onPress={() => navigateToActivity('course_game', course.matching_game)}>
              কোর্স ফাইনাল গেম
            </Button>
          )}
        </View>
      }
    />
  );
};

// ... স্টাইল অপরিবর্তিত ...
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  description: { fontSize: 16, color: '#555', marginTop: 10 },
  accordion: { backgroundColor: '#ffffff' },
  chapterTitle: { fontSize: 18, fontWeight: 'bold' },
  topicItem: { paddingLeft: 30, backgroundColor: '#f9f9f9' },
  topicTitle: { fontSize: 16 },
  activityButton: { marginHorizontal: 15, marginTop: 10, },
  footer: { paddingVertical: 20, borderTopWidth: 2, borderTopColor: '#e0e0e0', marginTop: 10, }
});

export default CourseDetailScreen;