import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Sliders, BarChart2, User2 } from "lucide-react-native";

import { useStore } from "../store/useStore";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  Preferences: undefined;
  Analytics: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Home size={size} color={color} />;
          } else if (route.name === "Preferences") {
            return <Sliders size={size} color={color} />;
          } else if (route.name === "Analytics") {
            return <BarChart2 size={size} color={color} />;
          } else if (route.name === "Profile") {
            return <User2 size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: "#8B5CF6", // Purple Accent
        tabBarInactiveTintColor: "#6B7280", // Muted Gray
        tabBarStyle: {
          backgroundColor: "#0C0C0E",
          borderTopWidth: 1,
          borderTopColor: "#1B1B1F",
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        headerStyle: {
          backgroundColor: "#030303",
          borderBottomWidth: 1,
          borderBottomColor: "#1B1B1F",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: "#FFFFFF",
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "FeedFlow" }} />
      <Tab.Screen name="Preferences" component={PreferencesScreen} options={{ title: "Interests" }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Insights" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, preferences } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : preferences.length === 0 ? (
          // If logged in but has no preferences set yet, go to Onboarding flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            {/* Onboarding is also accessible if they want to reset completely */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
