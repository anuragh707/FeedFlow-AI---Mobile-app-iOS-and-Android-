import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Plus, Trash2, ShieldAlert, Sparkles, Sliders } from "lucide-react-native";

import { useStore } from "../store/useStore";

export const PreferencesScreen = () => {
  const { preferences, updatePreferences, getPreferences, isLoading } = useStore();
  
  // Local screen copy of preferences
  const [localPrefs, setLocalPrefs] = useState<Array<{ topic: string; preference_type: "MORE" | "LESS"; weight: number }>>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newType, setNewType] = useState<"MORE" | "LESS">("MORE");

  useEffect(() => {
    loadPreferences();
  }, []);

  // Sync screen copy with store preferences
  useEffect(() => {
    setLocalPrefs(preferences.map(p => ({ topic: p.topic, preference_type: p.preference_type, weight: p.weight })));
  }, [preferences]);

  const loadPreferences = async () => {
    await getPreferences();
  };

  const handleUpdateWeight = (topic: string, amount: number) => {
    const updated = localPrefs.map((p) => {
      if (p.topic === topic) {
        const nextWeight = Math.max(1, Math.min(10, p.weight + amount));
        return { ...p, weight: nextWeight };
      }
      return p;
    });
    setLocalPrefs(updated);
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) {
      Alert.alert("Input Required", "Please enter a topic name.");
      return;
    }
    
    // Check duplication
    const exists = localPrefs.some((p) => p.topic.toLowerCase() === newTopic.trim().toLowerCase());
    if (exists) {
      Alert.alert("Duplicate Topic", "This interest already exists in your preferences.");
      return;
    }

    const item = {
      topic: newTopic.trim(),
      preference_type: newType,
      weight: 10
    };

    setLocalPrefs([...localPrefs, item]);
    setNewTopic("");
  };

  const handleRemoveTopic = (topic: string) => {
    setLocalPrefs(localPrefs.filter((p) => p.topic !== topic));
  };

  const handleSave = async () => {
    if (localPrefs.length === 0) {
      Alert.alert("Save Error", "Please configure at least one preference before saving.");
      return;
    }
    try {
      await updatePreferences(localPrefs);
      Alert.alert("Success", "Preferences synced. Automation weights updated successfully!");
    } catch (e) {
      Alert.alert("Error", "Could not save preferences. Ensure the server is online.");
    }
  };

  const moreList = localPrefs.filter((p) => p.preference_type === "MORE");
  const lessList = localPrefs.filter((p) => p.preference_type === "LESS");

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4">
        
        {/* Custom Quick Add Card */}
        <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-6 space-y-3">
          <Text className="text-white text-sm font-bold">Add Custom Interest</Text>
          
          <View className="flex-row space-x-2">
            <TextInput
              placeholder="E.g. Web Development"
              placeholderTextColor="#4B5563"
              className="flex-1 bg-[#141416] text-white border border-[#232329] rounded-xl py-2.5 px-3.5 text-xs focus:border-primary"
              value={newTopic}
              onChangeText={setNewTopic}
            />
            
            <TouchableOpacity
              onPress={handleAddTopic}
              className="bg-primary rounded-xl px-4 py-2.5 items-center justify-center"
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Type Selector */}
          <View className="flex-row space-x-2 mt-1">
            <TouchableOpacity
              onPress={() => setNewType("MORE")}
              className={`flex-1 py-2 rounded-lg items-center ${
                newType === "MORE" ? "bg-primary/20 border border-primary/40" : "bg-[#141416] border border-transparent"
              }`}
            >
              <Text className={`text-xs ${newType === "MORE" ? "text-primary font-bold" : "text-textMuted"}`}>
                MORE of this
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setNewType("LESS")}
              className={`flex-1 py-2 rounded-lg items-center ${
                newType === "LESS" ? "bg-secondary/20 border border-secondary/40" : "bg-[#141416] border border-transparent"
              }`}
            >
              <Text className={`text-xs ${newType === "LESS" ? "text-secondary font-bold" : "text-textMuted"}`}>
                LESS of this
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MORE Topics Section */}
        <View className="mb-6">
          <View className="flex-row items-center space-x-1.5 mb-3 px-1">
            <Sparkles size={16} color="#8B5CF6" />
            <Text className="text-white font-extrabold text-sm uppercase tracking-wide">More Feed Category Boosts</Text>
          </View>
          
          {moreList.length === 0 ? (
            <Text className="text-textMuted text-xs px-1 italic">No boosted topics configured.</Text>
          ) : (
            moreList.map((item) => (
              <View 
                key={item.topic} 
                className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-3 flex-row justify-between items-center"
              >
                <View className="flex-1 pr-4">
                  <Text className="text-white text-sm font-bold">{item.topic}</Text>
                  <View className="flex-row items-center mt-1.5 space-x-2">
                    <Sliders size={12} color="#6B7280" />
                    <Text className="text-textMuted text-[10px]">Multiplier: +{item.weight}</Text>
                  </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center space-x-3.5">
                  <View className="flex-row items-center bg-[#141416] rounded-xl border border-cardBorder">
                    <TouchableOpacity 
                      onPress={() => handleUpdateWeight(item.topic, -1)}
                      className="px-3.5 py-2"
                    >
                      <Text className="text-textMuted font-bold text-sm">-</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-xs font-black">{item.weight}</Text>
                    <TouchableOpacity 
                      onPress={() => handleUpdateWeight(item.topic, 1)}
                      className="px-3.5 py-2"
                    >
                      <Text className="text-white font-bold text-sm">+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => handleRemoveTopic(item.topic)} className="p-1">
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* LESS Topics Section */}
        <View className="mb-10">
          <View className="flex-row items-center space-x-1.5 mb-3 px-1">
            <ShieldAlert size={16} color="#3B82F6" />
            <Text className="text-white font-extrabold text-sm uppercase tracking-wide">Less Feed Category Suppressions</Text>
          </View>
          
          {lessList.length === 0 ? (
            <Text className="text-textMuted text-xs px-1 italic">No suppressed topics configured.</Text>
          ) : (
            lessList.map((item) => (
              <View 
                key={item.topic} 
                className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-3 flex-row justify-between items-center"
              >
                <View className="flex-1 pr-4">
                  <Text className="text-white text-sm font-bold">{item.topic}</Text>
                  <View className="flex-row items-center mt-1.5 space-x-2">
                    <Sliders size={12} color="#6B7280" />
                    <Text className="text-textMuted text-[10px]">Multiplier: -{item.weight}</Text>
                  </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center space-x-3.5">
                  <View className="flex-row items-center bg-[#141416] rounded-xl border border-cardBorder">
                    <TouchableOpacity 
                      onPress={() => handleUpdateWeight(item.topic, -1)}
                      className="px-3.5 py-2"
                    >
                      <Text className="text-textMuted font-bold text-sm">-</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-xs font-black">{item.weight}</Text>
                    <TouchableOpacity 
                      onPress={() => handleUpdateWeight(item.topic, 1)}
                      className="px-3.5 py-2"
                    >
                      <Text className="text-white font-bold text-sm">+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => handleRemoveTopic(item.topic)} className="p-1">
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Floating Save Button */}
      <View className="px-5 py-4 border-t border-cardBorder bg-[#050506]">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className="bg-primary rounded-xl py-4 items-center justify-center shadow-lg"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-sm">Save Config Weights</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreferencesScreen;
