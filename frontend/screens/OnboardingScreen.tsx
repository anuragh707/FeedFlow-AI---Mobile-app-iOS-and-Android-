import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ArrowRight, ArrowLeft, CheckCircle2, Instagram, Sparkles } from "lucide-react-native";

import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList, "Onboarding">;

const MORE_OPTIONS = [
  "Artificial Intelligence", "Technology", "Startups", "Business", "Finance",
  "Productivity", "Education", "Travel", "Gaming", "Fitness", "Health", "Entrepreneurship"
];

const LESS_OPTIONS = [
  "Celebrity Content", "Politics", "Sports", "Entertainment", "Gossip"
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { updatePreferences, connectInstagram, instagramConnection, isLoading } = useStore();
  
  const [step, setStep] = useState(1);
  const [moreSelected, setMoreSelected] = useState<string[]>(["Artificial Intelligence", "Productivity", "Technology"]);
  const [lessSelected, setLessSelected] = useState<string[]>(["Gossip", "Politics"]);
  const [igUsername, setIgUsername] = useState("");

  const handleToggleMore = (topic: string) => {
    if (moreSelected.includes(topic)) {
      setMoreSelected(moreSelected.filter((t) => t !== topic));
    } else {
      setMoreSelected([...moreSelected, topic]);
    }
  };

  const handleToggleLess = (topic: string) => {
    if (lessSelected.includes(topic)) {
      setLessSelected(lessSelected.filter((t) => t !== topic));
    } else {
      setLessSelected([...lessSelected, topic]);
    }
  };

  const handleConnectInstagram = async () => {
    if (!igUsername.trim()) {
      Alert.alert("Username Required", "Enter an Instagram username to link.");
      return;
    }
    await connectInstagram(igUsername.trim().replace("@", ""));
  };

  const handleCompleteOnboarding = async () => {
    const preferencesList: Array<{ topic: string; preference_type: "MORE" | "LESS"; weight: number }> = [];
    
    moreSelected.forEach((topic) => {
      preferencesList.push({ topic, preference_type: "MORE", weight: 10 });
    });
    
    lessSelected.forEach((topic) => {
      preferencesList.push({ topic, preference_type: "LESS", weight: 10 });
    });

    if (preferencesList.length === 0) {
      Alert.alert("Select Preferences", "Please choose at least one item to proceed.");
      return;
    }

    try {
      await updatePreferences(preferencesList);
      // Navigate to Main Stack
      navigation.replace("Main");
    } catch (e) {
      Alert.alert("Error", "Could not save settings. Please verify backend connectivity.");
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16 pb-8 justify-between">
      {/* Header Info */}
      <View>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xs font-semibold text-primary uppercase tracking-widest">Step {step} of 3</Text>
          <Text className="text-xs text-textMuted">{Math.round((step / 3) * 100)}% Complete</Text>
        </View>
        
        {/* Step Indicator Progress Bar */}
        <View className="w-full h-1 bg-[#141416] rounded-full mb-8">
          <View 
            className="h-full bg-primary rounded-full" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 justify-center mb-8">
        {step === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            <Text className="text-2xl font-extrabold text-white leading-tight">What would you like to see MORE of?</Text>
            <Text className="text-textMuted text-sm mb-6">FeedFlow will prioritize and boost social media posts containing these topics.</Text>
            
            <View className="flex-row flex-wrap gap-2.5">
              {MORE_OPTIONS.map((topic) => {
                const isSelected = moreSelected.includes(topic);
                return (
                  <TouchableOpacity
                    key={topic}
                    onPress={() => handleToggleMore(topic)}
                    className={`px-4 py-3 rounded-full border ${
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "bg-cardBg border-cardBorder"
                    }`}
                  >
                    <Text className={`text-sm ${isSelected ? "text-white font-bold" : "text-textMuted"}`}>
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            <Text className="text-2xl font-extrabold text-white leading-tight">What would you like to see LESS of?</Text>
            <Text className="text-textMuted text-sm mb-6">FeedFlow will suppress, downrate, and filter posts matching these unwanted topics.</Text>
            
            <View className="flex-row flex-wrap gap-2.5">
              {LESS_OPTIONS.map((topic) => {
                const isSelected = lessSelected.includes(topic);
                return (
                  <TouchableOpacity
                    key={topic}
                    onPress={() => handleToggleLess(topic)}
                    className={`px-4 py-3 rounded-full border ${
                      isSelected 
                        ? "bg-secondary border-secondary" 
                        : "bg-cardBg border-cardBorder"
                    }`}
                  >
                    <Text className={`text-sm ${isSelected ? "text-white font-bold" : "text-textMuted"}`}>
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 3 && (
          <ScrollView contentContainerStyle={{ justifyContent: "center" }} className="space-y-6">
            <Text className="text-2xl font-extrabold text-white leading-tight">Simulate Instagram Connection</Text>
            <Text className="text-textMuted text-sm mb-4">FeedFlow links to your profile to capture posts and compute real-time feed relevance.</Text>

            {instagramConnection?.status === "CONNECTED" ? (
              <View className="bg-cardBg border border-cardBorder rounded-2xl p-6 items-center space-y-4">
                <CheckCircle2 size={48} color="#10B981" />
                <View className="items-center">
                  {instagramConnection.profilePictureUrl ? (
                    <Image
                      source={{ uri: instagramConnection.profilePictureUrl }}
                      className="w-16 h-16 rounded-full border-2 border-primary mb-2"
                    />
                  ) : null}
                  <Text className="text-white font-bold text-lg">@{instagramConnection.username}</Text>
                  <Text className="text-accentGreen text-xs font-semibold">Simulated Connection Live</Text>
                </View>
              </View>
            ) : (
              <View className="bg-cardBg border border-cardBorder rounded-2xl p-5 space-y-4">
                <View className="flex-row items-center space-x-2.5 mb-2">
                  <View className="w-10 h-10 bg-[#FF007F]/10 rounded-xl items-center justify-center">
                    <Instagram size={22} color="#FF007F" />
                  </View>
                  <Text className="text-white font-bold text-base">Connect Account</Text>
                </View>

                <TextInput
                  placeholder="Instagram Username (e.g. @zuck)"
                  placeholderTextColor="#4B5563"
                  className="bg-[#141416] text-white border border-[#232329] rounded-xl py-3 px-4 text-sm focus:border-primary"
                  value={igUsername}
                  onChangeText={setIgUsername}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={handleConnectInstagram}
                  disabled={isLoading}
                  className="bg-primary/20 border border-primary/50 rounded-xl py-3.5 items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#8B5CF6" />
                  ) : (
                    <Text className="text-primary font-bold text-sm">Verify Simulation Auth</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Footer Nav Controls */}
      <View className="flex-row justify-between space-x-4">
        {step > 1 ? (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            className="flex-row items-center justify-center bg-cardBg border border-cardBorder rounded-xl px-5 py-4"
          >
            <ArrowLeft size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-sm ml-2">Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {step < 3 ? (
          <TouchableOpacity
            onPress={() => setStep(step + 1)}
            className="flex-1 flex-row items-center justify-center bg-primary rounded-xl py-4"
          >
            <Text className="text-white font-bold text-sm mr-2">Continue</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleCompleteOnboarding}
            className="flex-1 flex-row items-center justify-center bg-accentGreen rounded-xl py-4"
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-sm ml-2">Launch FeedFlow</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;
