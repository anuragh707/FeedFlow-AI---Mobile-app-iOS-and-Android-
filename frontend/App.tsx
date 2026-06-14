import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import "./style.css";

import { useStore } from "./store/useStore";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  const { loadStoredAuth } = useStore();

  // Load auth state from storage on app boot
  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
