import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserPlus, User, Mail, Lock } from "lucide-react-native";

import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList, "Register">;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading, clearError } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Required Fields", "Please populate name, email, and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters.");
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      Alert.alert(
        "Welcome to FeedFlow!",
        "Account created. Let's customize your social interests now."
      );
    } catch (err: any) {
      Alert.alert("Registration Failed", err.response?.data?.detail || "Please check details and try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} className="px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center border border-primary/40 mb-4">
            <UserPlus size={32} color="#8B5CF6" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-tight">Create Account</Text>
          <Text className="text-textMuted text-sm mt-1">Get started with FeedFlow AI</Text>
        </View>

        <View className="bg-cardBg border border-cardBorder rounded-2xl p-5 space-y-4 shadow-xl">
          <Text className="text-lg font-bold text-white mb-2">Register</Text>
          
          {/* Name Field */}
          <View className="relative">
            <View className="absolute left-3 top-3.5 z-10">
              <User size={18} color="#6B7280" />
            </View>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#4B5563"
              className="bg-[#141416] text-white border border-[#232329] rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary"
              value={name}
              onChangeText={(t) => {
                setName(t);
                clearError();
              }}
            />
          </View>

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
              placeholder="Password (Min 6 chars)"
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

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className="bg-primary rounded-xl py-3.5 items-center justify-center mt-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-sm">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Toggle */}
        <View className="flex-row justify-center mt-6 space-x-1">
          <Text className="text-textMuted text-sm">Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-primary font-bold text-sm">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
