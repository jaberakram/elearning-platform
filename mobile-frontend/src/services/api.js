import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- আপনার IP অ্যাড্রেস সহ ---
const API_URL = 'http://192.168.0.200:8001/api/';

// apiClient (টোকেন সহ)
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- ইন্টারসেপ্টর: মোবাইল অ্যাপের জন্য আপডেটেড ---
apiClient.interceptors.request.use(async (config) => {
  const tokensString = await AsyncStorage.getItem('tokens');
  if (!tokensString) return config;

  const tokens = JSON.parse(tokensString);
  const user = jwtDecode(tokens.access);
  const isExpired = Date.now() >= user.exp * 1000;

  if (!isExpired) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
    return config;
  }

  // টোকেন রিনিউ করার লজিক
  try {
    const response = await axios.post(`${API_URL}token/refresh/`, {
      refresh: tokens.refresh,
    });
    const newTokens = {
      access: response.data.access,
      refresh: tokens.refresh,
    };
    await AsyncStorage.setItem('tokens', JSON.stringify(newTokens));
    config.headers.Authorization = `Bearer ${newTokens.access}`;
    return config;
  } catch (error) {
    console.error("Session expired. Please log in again.", error);
    await AsyncStorage.removeItem('tokens');
    return Promise.reject(error);
  }
});


// --- API ফাংশনগুলো ---
export const registerUserApi = (userData) => {
  return apiClient.post('register/', userData);
};

export const loginUserApi = (userData) => {
  return axios.post(`${API_URL}token/`, userData);
};

export const getCoursesApi = () => {
  return apiClient.get('courses/');
};

export const getCourseDetailApi = (courseId) => {
  return apiClient.get(`courses/${courseId}/`);
};

export const getCourseProgressApi = (courseId) => {
  return apiClient.get(`courses/${courseId}/my-progress/`);
};

export const markTopicCompleteApi = (topicId) => {
  return apiClient.post(`topics/${topicId}/mark-complete/`);
};

export const submitQuizScoreApi = (quizId, score) => {
  return apiClient.post('submit-quiz/', {
    quiz_id: quizId,
    score: score,
  });
};

export const submitGameScoreApi = (gameId, score) => {
  return apiClient.post('submit-game/', {
    game_id: gameId,
    score: score,
  });
};

// ----- নিচের ফাংশনটি নতুন যোগ করুন -----
export const getDashboardStatsApi = () => {
  return apiClient.get('dashboard-stats/');
};