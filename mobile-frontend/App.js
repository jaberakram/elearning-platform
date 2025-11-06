import React, { useContext } from 'react';
import { StatusBar, View } from 'react-native';
import { Provider as PaperProvider, ActivityIndicator, Appbar, Button } from 'react-native-paper';
import theme from './src/theme';

// --- নেভিগেশন টুলস ---
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // <-- ট্যাব আইকনের জন্য

// --- আমাদের কনটেক্সট ---
import { AuthProvider } from './src/context/AuthContext';
import AuthContext from './src/context/AuthContext';

// --- আমাদের পৃষ্ঠাগুলো ---
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import TopicScreen from './src/screens/TopicScreen';
import DashboardScreen from './src/screens/DashboardScreen'; // <-- নতুন ড্যাশবোর্ড

// --- দুটি নতুন নেভিগেটর তৈরি করা হচ্ছে ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- কাস্টম অ্যাপবার (যা লগআউট বাটন দেখাবে) ---
const CustomAppBar = ({ navigation, route, options, back }) => {
  const { logout } = useContext(AuthContext);
  const title = options.title || route.name;

  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      <Button color="#FFFFFF" onPress={logout}>লগআউট</Button>
    </Appbar.Header>
  );
};

// --- ১. হোম ট্যাব স্ট্যাক ---
// এটি "হোম" ট্যাবের ভেতরের পৃষ্ঠাগুলো পরিচালনা করবে
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ header: CustomAppBar }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'কোর্সসমূহ' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'কোর্সের বিবরণ' }} />
      <Stack.Screen name="Topic" component={TopicScreen} options={({ route }) => ({ title: route.params.activityData?.title || 'লার্নিং' })} />
    </Stack.Navigator>
  );
}

// --- ২. ড্যাশবোর্ড ট্যাব স্ট্যাক ---
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ header: CustomAppBar }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'আমার ড্যাশবোর্ড' }} />
    </Stack.Navigator>
  );
}

// --- ৩. লগইন করা থাকলে এই ট্যাবগুলো দেখানো হবে ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // আমরা কাস্টম অ্যাপবার ব্যবহার করব
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary, // অ্যাক্টিভ ট্যাবের রঙ
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'হোম' }} />
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'ড্যাশবোর্ড' }} />
    </Tab.Navigator>
  );
}

// --- ৪. লগইন না করা থাকলে এই স্ট্যাক দেখানো হবে ---
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => (
          <Appbar.Header>
            <Appbar.Content title={props.options.title || 'লগইন'} />
          </Appbar.Header>
        ),
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'লগইন / রেজিস্টার' }} />
    </Stack.Navigator>
  );
}


// --- ৫. মূল নেভিগেশন লজিক ---
function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {/* যদি ইউজার না থাকে, তবে AuthStack, থাকলে MainTabs দেখাও */}
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

// --- মূল App ফাংশন ---
export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}