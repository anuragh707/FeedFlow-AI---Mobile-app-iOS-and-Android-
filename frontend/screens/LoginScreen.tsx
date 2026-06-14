import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ShieldCheck, Mail, Lock } from "lucide-react-native";

import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading, error, clearError } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Fields Required", "Please enter both email and password.");
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert("Login Failed", err.response?.data?.detail || "Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address to reset your password.");
      return;
    }
    Alert.alert(
      "Reset Link Sent",
      `A recovery link has been simulated and dispatched to ${email.trim()}.`
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} className="px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center border border-primary/40 mb-4">
            <ShieldCheck size={36} color="#8B5CF6" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-tight">FeedFlow</Text>
          <Text className="text-textMuted text-sm mt-1">"Personalize what matters."</Text>
        </View>

        <View className="bg-cardBg border border-cardBorder rounded-2xl p-5 space-y-4 shadow-xl">
          <Text className="text-lg font-bold text-white mb-2">Welcome Back</Text>
          
          {/* Email Field */}
          <View className="relative">
            <View className="absolute left-3 top-3.5 z-10">
              <Mail size={18} color="#6B7280" />
            </View>
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#4B5563"
              className="bg-[#141416] text-white border border-[#232329] rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError();
              }}
            />
          </View>

          {/* Password Field */}
          <View className="relative">
            <View className="absolute left-3 top-3.5 z-10">
              <Lock size={18} color="#6B7280" />
            </View>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#4B5563"
              secureTextEntry
              className="bg-[#141416] text-white border border-[#232329] rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError();
              }}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} className="align-self-end">
            <Text className="text-primary text-xs font-semibold text-right">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary rounded-xl py-3.5 items-center justify-center mt-2"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-sm">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Toggle */}
        <View className="flex-row justify-center mt-6 space-x-1">
          <Text className="text-textMuted text-sm">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-primary font-bold text-sm">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
