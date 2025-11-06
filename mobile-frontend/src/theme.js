import { DefaultTheme } from 'react-native-paper';

// আমাদের রঙের পরিকল্পনা
const colors = {
  primary: '#3498DB',     // হালকা নীল
  accent: '#2ECC71',      // সবুজ
  background: '#F4F6F7', // অফ-হোয়াইট
  surface: '#FFFFFF',      // সাদা
  text: '#2C3E50',        // গাঢ় ধূসর
  placeholder: '#808B96', // হালকা ধূসর
};

// React Native Paper-এর ডিফল্ট থিমকে আমাদের রঙ দিয়ে আপডেট করা
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.placeholder,
    onSurface: colors.text, // সারফেসের উপর লেখার রঙ
  },
};

export default theme;