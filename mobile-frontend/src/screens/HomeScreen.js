import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import { getCoursesApi } from '../services/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getCoursesApi()
        .then(response => {
          setCourses(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch courses:', error);
          Alert.alert('ত্রুটি', 'কোর্স আনতে সমস্যা হয়েছে।');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  // --- লগইন করা না থাকলে যা দেখাবে ---
  if (!user) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>হোমপেজ</Text>
        <Text style={styles.subtitle}>আমাদের কোর্সে আপনাকে স্বাগতম!</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Auth')}
          style={styles.button}
        >
          লগইন বা রেজিস্টার করুন
        </Button>
      </View>
    );
  }

  // --- লগইন করা থাকলে যা দেখাবে ---
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>কোর্স লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={
        <Text variant="headlineMedium" style={styles.title}>
          স্বাগতম, {user.username}!
        </Text>
      }
      renderItem={({ item }) => (
        // --- এই onPress ফাংশনটি পরিবর্তন করা হয়েছে ---
        <TouchableOpacity 
          onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
        >
          <Card style={styles.card}>
            <Card.Title title={item.title} titleVariant="titleLarge" />
            <Card.Content>
              <Text variant="bodyMedium">{item.description.substring(0, 100)}...</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.container}>
          <Text style={styles.subtitle}>এখনো কোনো কোর্স যোগ করা হয়নি।</Text>
        </View>
      }
    />
  );
};

// ... স্টাইলগুলো অপরিবর্তিত ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 15,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 8,
  },
  card: {
    marginBottom: 15,
  },
});

export default HomeScreen;