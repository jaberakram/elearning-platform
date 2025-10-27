import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseURL = 'http://127.0.0.1:8001/api/';

const apiClient = axios.create({
  baseURL,
});

// ইন্টারসেপ্টর: প্রতিটি অনুরোধ পাঠানোর আগে টোকেন যুক্ত করার জন্য
apiClient.interceptors.request.use(async (config) => {
  const tokensString = localStorage.getItem('tokens');
  if (!tokensString) return config;

  const tokens = JSON.parse(tokensString);
  const user = jwtDecode(tokens.access);
  
  // Access Token-এর মেয়াদ শেষ হয়ে গেছে কি না, তা পরীক্ষা করা
  const isExpired = Date.now() >= user.exp * 1000;

  if (!isExpired) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
    return config;
  }

  // যদি Access Token মেয়াদোত্তীর্ণ হয়ে যায়, তবে নতুন টোকেন আনার চেষ্টা করা
  try {
    const response = await axios.post(`${baseURL}token/refresh/`, {
      refresh: tokens.refresh,
    });

    localStorage.setItem('tokens', JSON.stringify(response.data));
    config.headers.Authorization = `Bearer ${response.data.access}`;
    return config;

  } catch (error) {
    console.error("Session expired. Please log in again.", error);
    localStorage.removeItem('tokens');
    window.location.href = '/login';
    return Promise.reject(error);
  }
});

// --- API ফাংশনগুলো ---

export const registerUser = (userData) => {
  return apiClient.post('register/', userData);
};

export const loginUser = (userData) => {
  return axios.post(`${baseURL}token/`, userData);
};

export const getCourseProgress = (courseId) => {
  return apiClient.get(`courses/${courseId}/my-progress/`);
};

export const markTopicComplete = (topicId) => {
  return apiClient.post(`topics/${topicId}/mark-complete/`);
};

// --- এটি সেই ফাংশন, সঠিক নামে ---
export const getDashboardStats = () => {
  return apiClient.get('dashboard-stats/');
};

// --- এটিও আপনার পরবর্তী ধাপের জন্য ---
export const submitQuizScore = (quizId, score) => {
  return apiClient.post('submit-quiz/', {
    quiz_id: quizId,
    score: score,
  });
};