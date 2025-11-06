import React, { useState, useContext } from 'react'; // <-- useContext ইমপোর্ট করুন
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { registerUserApi, loginUserApi } from '../services/api';

// --- আমাদের AuthContext ইমপোর্ট করুন ---
import AuthContext from '../context/AuthContext';

const AuthScreen = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  
  // --- AuthContext থেকে login ফাংশনটি নিন ---
  const { login } = useContext(AuthContext);

  // লগইন হ্যান্ডলার (আপডেটেড)
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginUserApi({ username, password });
      
      // --- নতুন: Alert-এর বদলে login ফাংশন কল করুন ---
      await login(response.data); // টোকেন সেভ করা হচ্ছে
      
      Alert.alert('সফল!', 'আপনি সফলভাবে লগইন করেছেন।');
      navigation.goBack(); // হোমপেজে ফেরত যান
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('ব্যর্থ', 'আপনার ইউজারনেম বা পাসওয়ার্ড ভুল।');
    } finally {
      setLoading(false);
    }
  };

  // রেজিস্ট্রেশন হ্যান্ডলার (অপরিবর্তিত)
  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে সব তথ্য পূরণ করুন।');
      return;
    }
    setLoading(true);
    try {
      await registerUserApi({ username, email, password });
      Alert.alert('সফল!', 'আপনার অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।');
      setMode('login'); 
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('ব্যর্থ', 'এই ইউজারনেম বা ইমেইল দিয়ে হয়তো আগেই অ্যাকাউন্ট খোলা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- বাকি JSX কোড অপরিবর্তিত ---
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          স্বাগতম!
        </Text>
        
        <SegmentedButtons
          value={mode}
          onValueChange={setMode}
          style={styles.segmentedButtons}
          buttons={[
            { value: 'login', label: 'লগইন' },
            { value: 'register', label: 'রেজিস্টার' },
          ]}
        />

        <TextInput
          label="ইউজারনেম"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
        />
        
        {mode === 'register' && (
          <TextInput
            label="ইমেইল"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        
        <TextInput
          label="পাসওয়ার্ড"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />
        
        <Button
          mode="contained"
          loading={loading}
          disabled={loading}
          onPress={mode === 'login' ? handleLogin : handleRegister}
          style={styles.button}
        >
          {mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

// স্টাইলগুলো অপরিবর্তিত
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
});

export default AuthScreen;