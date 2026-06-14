import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { User2, Mail, Instagram, Sliders, LogOut, Code, Sparkles, HelpCircle } from "lucide-react-native";

import { useStore } from "../store/useStore";
import { api } from "../services/api";

export const ProfileScreen = () => {
  const {
    user,
    instagramConnection,
    automationJob,
    isLoading,
    connectInstagram,
    disconnectInstagram,
    startAutomation,
    stopAutomation,
    logout
  } = useStore();

  // Instagram local input state
  const [usernameInput, setUsernameInput] = useState("");
  
  // Automation interval setting local state
  const [intervalHours, setIntervalHours] = useState(6);

  // Playground State
  const [testText, setTestText] = useState("OpenAI launches a new AI model with agentic reasoning");
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  const handleInstagramAction = async () => {
    if (instagramConnection?.status === "CONNECTED") {
      Alert.alert(
        "Disconnect Account",
        "Are you sure you want to disconnect this simulated profile?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Disconnect", style: "destructive", onPress: async () => await disconnectInstagram() }
        ]
      );
    } else {
      if (!usernameInput.trim()) {
        Alert.alert("Input Error", "Please provide a simulated username.");
        return;
      }
      await connectInstagram(usernameInput.trim().replace("@", ""));
      setUsernameInput("");
    }
  };

  const handleUpdateInterval = async (hours: number) => {
    setIntervalHours(hours);
    if (automationJob?.status === "ACTIVE") {
      try {
        await startAutomation(hours);
        Alert.alert("Interval Updated", `Automation schedule modified to run every ${hours} hour(s).`);
      } catch (e) {
        Alert.alert("Error", "Could not adjust interval.");
      }
    } else {
      Alert.alert("Scheduled", `Next activation will run every ${hours} hour(s).`);
    }
  };

  const handleTestAI = async () => {
    if (!testText.trim()) {
      Alert.alert("Input Required", "Enter text to evaluate.");
      return;
    }
    setPlaygroundLoading(true);
    setPlaygroundResult(null);
    try {
      const data = await api.ai.analyze(testText.trim());
      setPlaygroundResult(data);
    } catch (err: any) {
      Alert.alert("AI Error", err.response?.data?.detail || "Failed to parse content.");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-background px-5 pt-4">
      {/* Profile summary */}
      <View className="bg-cardBg border border-cardBorder rounded-2xl p-5 mb-5 flex-row items-center space-x-4">
        <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center border border-primary/20">
          <User2 size={24} color="#8B5CF6" />
        </View>
        <View>
          <Text className="text-white font-bold text-base">{user?.name || "FeedFlow User"}</Text>
          <View className="flex-row items-center space-x-1.5 mt-0.5">
            <Mail size={12} color="#6B7280" />
            <Text className="text-textMuted text-xs">{user?.email || "user@feedflow.ai"}</Text>
          </View>
        </View>
      </View>

      {/* Instagram simulation connection */}
      <Text className="text-white font-extrabold text-sm mb-3 px-1">Simulated Social Profile</Text>
      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-5 space-y-3">
        {instagramConnection?.status === "CONNECTED" ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              {instagramConnection.profilePictureUrl ? (
                <Image
                  source={{ uri: instagramConnection.profilePictureUrl }}
                  className="w-12 h-12 rounded-full border border-primary"
                />
              ) : (
                <View className="w-12 h-12 bg-pink-500/10 rounded-full items-center justify-center">
                  <Instagram size={20} color="#FF007F" />
                </View>
              )}
              <View>
                <Text className="text-white font-bold text-sm">@{instagramConnection.username}</Text>
                <Text className="text-accentGreen text-xs font-semibold">Simulated Connection Active</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleInstagramAction}
              className="bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl"
            >
              <Text className="text-red-500 font-bold text-xs">Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            <View className="flex-row items-center space-x-2">
              <Instagram size={18} color="#FF007F" />
              <Text className="text-white text-xs font-bold">Connect Simulated Profile</Text>
            </View>
            <View className="flex-row space-x-2">
              <TextInput
                placeholder="Instagram Username (e.g. zuck)"
                placeholderTextColor="#4B5563"
                className="flex-1 bg-[#141416] text-white border border-[#232329] rounded-xl py-2 px-3.5 text-xs focus:border-primary"
                value={usernameInput}
                onChangeText={setUsernameInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={handleInstagramAction}
                className="bg-primary rounded-xl px-4 py-2 items-center justify-center"
              >
                <Text className="text-white font-bold text-xs">Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Automation engine settings */}
      <Text className="text-white font-extrabold text-sm mb-3 px-1">Automation Configuration</Text>
      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-5 space-y-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
            <Sliders size={18} color="#3B82F6" />
            <Text className="text-white text-xs font-bold">Synchronization Period</Text>
          </View>
          <Text className="text-textMuted text-xs">Interval: every {intervalHours} hr(s)</Text>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleUpdateInterval(1)}
            className={`flex-1 py-3 rounded-xl items-center border ${
              intervalHours === 1 ? "bg-secondary/20 border-secondary" : "bg-[#141416] border-transparent"
            }`}
          >
            <Text className={`text-xs ${intervalHours === 1 ? "text-secondary font-black" : "text-textMuted"}`}>
              1 Hour
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleUpdateInterval(6)}
            className={`flex-1 py-3 rounded-xl items-center border ${
              intervalHours === 6 ? "bg-secondary/20 border-secondary" : "bg-[#141416] border-transparent"
            }`}
          >
            <Text className={`text-xs ${intervalHours === 6 ? "text-secondary font-black" : "text-textMuted"}`}>
              6 Hours
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Playground Card */}
      <View className="flex-row items-center space-x-1.5 mb-3 px-1">
        <Sparkles size={16} color="#8B5CF6" />
        <Text className="text-white font-extrabold text-sm uppercase tracking-wide">Gemini Classification Playground</Text>
      </View>

      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-6 space-y-3.5">
        <Text className="text-textMuted text-[10px] leading-relaxed">
          Type any custom social media post caption below to test how our backend processes categorization, confidence rates, and outputs relevance rankings based on your configured interest weights.
        </Text>

        <TextInput
          multiline
          numberOfLines={3}
          placeholder="Type a mock post caption..."
          placeholderTextColor="#4B5563"
          className="bg-[#141416] text-white border border-[#232329] rounded-xl p-3.5 text-xs text-left"
          style={{ height: 70, textAlignVertical: "top" }}
          value={testText}
          onChangeText={setTestText}
        />

        <TouchableOpacity
          onPress={handleTestAI}
          disabled={playgroundLoading}
          className="bg-primary/20 border border-primary/50 rounded-xl py-3.5 items-center justify-center flex-row space-x-1.5"
        >
          {playgroundLoading ? (
            <ActivityIndicator color="#8B5CF6" size="small" />
          ) : (
            <>
              <Code size={14} color="#8B5CF6" />
              <Text className="text-primary font-bold text-xs">Run Live AI Classification</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Playground Results Display */}
        {playgroundResult ? (
          <View className="bg-[#141416] border border-[#232329] rounded-xl p-3.5 space-y-2.5">
            <View className="flex-row justify-between border-b border-[#232329] pb-2">
              <Text className="text-textMuted text-[10px] uppercase font-black">AI Metric</Text>
              <Text className="text-textMuted text-[10px] uppercase font-black">Value</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-white text-xs font-semibold">Matched Category</Text>
              <Text className="text-primary text-xs font-bold">{playgroundResult.category}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-white text-xs font-semibold">Gemini Confidence Rate</Text>
              <Text className="text-secondary text-xs font-bold">{(playgroundResult.confidence * 100).toFixed(0)}%</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-white text-xs font-semibold">Weight Score (-10 to +10)</Text>
              <Text className={`text-xs font-bold ${playgroundResult.relevance_score >= 0 ? "text-accentGreen" : "text-red-500"}`}>
                {playgroundResult.relevance_score > 0 ? "+" : ""}
                {playgroundResult.relevance_score}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-white text-xs font-semibold">Personalization Match</Text>
              <Text className="text-white text-xs font-black">{playgroundResult.preference_match_score}%</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Logout Action Card */}
      <TouchableOpacity
        onPress={logout}
        className="bg-red-500/10 border border-red-500/20 rounded-2xl py-4 mb-14 flex-row items-center justify-center space-x-2 shadow-sm"
      >
        <LogOut size={16} color="#EF4444" />
        <Text className="text-red-500 font-bold text-sm">Sign Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
