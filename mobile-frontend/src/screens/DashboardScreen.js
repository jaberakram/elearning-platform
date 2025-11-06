import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // <-- useIsFocused ইমপোর্ট করুন
import AuthContext from '../context/AuthContext';
import { getDashboardStatsApi } from '../services/api';

// প্রগ্রেস বার দেখানোর জন্য একটি সহজ কম্পোনেন্ট
const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarForeground, { width: `${progress}%` }]} />
    <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
  </View>
);

const DashboardScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // এই পৃষ্ঠাটি কি এখন স্ক্রিনে দেখা যাচ্ছে?

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ড্যাশবোর্ডের তথ্য আনার ফাংশন
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStatsApi();
      setStats(response.data);
    } catch (error) {
      console.error("ড্যাশবোর্ডের তথ্য আনতে সমস্যা হয়েছে:", error);
      Alert.alert('ত্রুটি', 'আপনার অগ্রগতির তথ্য আনা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  // যখনই ব্যবহারকারী এই ড্যাশবোর্ড ট্যাবে আসবে, তখনই তথ্য রিফ্রেশ হবে
  useEffect(() => {
    if (user && isFocused) {
      fetchStats();
    }
  }, [user, isFocused]); // user বা isFocused পরিবর্তন হলে চলবে

  // যদি ব্যবহারকারী লগইন করা না থাকে
  if (!user) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>ড্যাশবোর্ড</Text>
        <Text style={styles.subtitle}>আপনার অগ্রগতি দেখতে অনুগ্রহ করে লগইন করুন।</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Auth')} // <-- AuthScreen-এ পাঠান
          style={{ width: '80%' }}
        >
          লগইন / রেজিস্টার
        </Button>
      </View>
    );
  }

  // যদি লগইন করা থাকে কিন্তু লোডিং হয়
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>আপনার অগ্রগতি লোড হচ্ছে...</Text>
      </View>
    );
  }

  // যদি লগইন করা থাকে এবং লোডিং শেষ হয়
  return (
    <ScrollView style={styles.listContainer}>
      <Text variant="headlineMedium" style={styles.title}>আমার অগ্রগতি</Text>
      
      {stats.length > 0 ? (
        stats.map(courseStat => (
          <View key={courseStat.course_id} style={styles.card}>
            <Text style={styles.cardTitle}>{courseStat.course_title}</Text>
            
            <Text style={styles.statText}>
              টপিক সম্পন্ন: {courseStat.completed_topics} / {courseStat.total_topics}
            </Text>
            <ProgressBar progress={courseStat.completion_percentage} />
            
            {courseStat.average_quiz_score !== null ? (
              <Text style={styles.statText}>
                কুইজে গড় স্কোর: {courseStat.average_quiz_score}%
              </Text>
            ) : (
              <Text style={styles.statText}>এখনো কোনো কুইজ দেননি।</Text>
            )}
            
            <Button 
              mode="outlined" 
              style={{ marginTop: 15 }}
              // এখানে CourseDetail-এ নেভিগেট করার লজিক যোগ করা যেতে পারে
              // onPress={() => navigation.navigate('Home', { screen: 'CourseDetail', params: { courseId: courseStat.course_id } })}
            >
              কোর্সটি দেখুন
            </Button>
          </View>
        ))
      ) : (
        <View style={styles.container}>
          <Text style={styles.subtitle}>আপনি এখনো কোনো কোর্স শুরু করেননি।</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { flex: 1, padding: 15 },
  title: { marginBottom: 20, textAlign: 'center' },
  subtitle: { marginBottom: 30, fontSize: 16, textAlign: 'center' },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  progressBarBackground: {
    height: 30,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    justifyContent: 'center',
  },
  progressBarForeground: {
    height: 30,
    backgroundColor: '#2ECC71', // সবুজ
    borderRadius: 15,
    position: 'absolute',
  },
  progressText: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: 'bold',
  }
});

export default DashboardScreen;