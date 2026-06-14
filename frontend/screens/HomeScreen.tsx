import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Play, Pause, RefreshCw, Instagram, TrendingUp, Sliders, ChevronRight, CheckCircle2, History, Terminal, Cpu, AlertTriangle, Sparkles, Check } from "lucide-react-native";

import { useStore } from "../store/useStore";
import { TabParamList } from "../navigation/AppNavigator";

type TabNavigationProp = BottomTabNavigationProp<TabParamList, "Home">;

export const HomeScreen = () => {
  const navigation = useNavigation<TabNavigationProp>();
  const isFocused = useIsFocused();
  
  const {
    user,
    instagramConnection,
    automationJob,
    dashboardData,
    activityLogs,
    isLoading,
    getInstagramStatus,
    getAutomationStatus,
    getDashboardData,
    getActivityLogs,
    startAutomation,
    stopAutomation,
    triggerSync,
  } = useStore();

  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [visibleTrace, setVisibleTrace] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [oldIndex, setOldIndex] = useState(50);
  const [newIndex, setNewIndex] = useState(50);
  const [errorMessage, setErrorMessage] = useState("");
  
  const consoleScrollRef = useRef<ScrollView>(null);

  // Load everything on focus
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    await Promise.all([
      getInstagramStatus(),
      getAutomationStatus(),
      getDashboardData(),
      getActivityLogs(),
    ]);
  };

  const handleToggleAutomation = async () => {
    if (!automationJob) return;
    try {
      if (automationJob.status === "ACTIVE") {
        await stopAutomation();
      } else {
        // Start with default 6 hour interval
        await startAutomation(6);
      }
    } catch (e) {
      Alert.alert("Engine Error", "Could not toggle personalization engine.");
    }
  };

  const handleRunSync = async () => {
    setOldIndex(dashboardData?.personalization_score || 50);
    setSyncStatus("running");
    setIsSyncModalVisible(true);
    setVisibleTrace([]);
    setSyncResults([]);
    setErrorMessage("");

    try {
      const res = await triggerSync();
      const fullTrace = res.trace || [];
      const results = res.results || [];
      setSyncResults(results);

      if (fullTrace.length === 0) {
        fullTrace.push({ step: "INIT", status: "SUCCESS", message: "Initializing feed flow simulation..." });
        fullTrace.push({ step: "COMPLETE", status: "SUCCESS", message: "Sync complete." });
      }

      // Progressively reveal trace steps
      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < fullTrace.length) {
          setVisibleTrace(prev => [...prev, fullTrace[currentStepIndex]]);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          setNewIndex(useStore.getState().dashboardData?.personalization_score || 50);
          setSyncStatus("complete");
        }
      }, 500);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete personalization sync.");
      setSyncStatus("error");
    }
  };

  const renderTraceLine = (item: any, idx: number) => {
    if (!item) return null;
    let colorClass = "text-textMuted";
    let prefix = "[SYS] ";
    if (item.status === "SUCCESS") {
      colorClass = "text-accentGreen";
      prefix = "[ OK] ";
    } else if (item.status === "WARNING") {
      colorClass = "text-yellow-500";
      prefix = "[WRN] ";
    } else if (item.status === "ERROR") {
      colorClass = "text-red-500";
      prefix = "[ERR] ";
    }

    return (
      <View key={idx} className="flex-row items-start mb-1 px-1">
        <Text className={`font-mono text-[9px] mr-1.5 ${colorClass}`}>{prefix}</Text>
        <Text className="font-mono text-[9px] text-gray-200 flex-1 leading-normal">
          {item.message || ""}
        </Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-background px-5 pt-4">
      {/* Welcome Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-textMuted text-xs font-semibold uppercase tracking-wider">Welcome back</Text>
          <Text className="text-2xl font-black text-white">{user?.name || "FeedFlow User"}</Text>
        </View>
        <View className="w-10 h-10 bg-primary/20 rounded-full border border-primary/30 items-center justify-center">
          <Text className="text-primary font-bold text-sm">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "FF"}
          </Text>
        </View>
      </View>

      {/* Main Score & Automation Banner */}
      <View className="bg-cardBg border border-cardBorder rounded-3xl p-5 mb-5 relative overflow-hidden shadow-2xl">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-textMuted text-xs font-bold uppercase tracking-wide">Personalization Index</Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-5xl font-black text-white">{dashboardData?.personalization_score || 50}</Text>
              <Text className="text-textMuted text-lg font-bold">/100</Text>
            </View>
          </View>
          
          {/* Trend Indicator */}
          {dashboardData && dashboardData.improvement_pct !== 0 ? (
            <View className="bg-accentGreen/10 border border-accentGreen/20 px-3 py-1.5 rounded-full flex-row items-center">
              <TrendingUp size={14} color="#10B981" />
              <Text className="text-accentGreen text-xs font-black ml-1">
                {dashboardData.improvement_pct > 0 ? "+" : ""}
                {dashboardData.improvement_pct}%
              </Text>
            </View>
          ) : (
            <View className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
              <Text className="text-primary text-xs font-semibold">Initial Index</Text>
            </View>
          )}
        </View>

        <Text className="text-textMuted text-xs leading-relaxed mb-5">
          Your relevance score tracks how closely your simulated feed aligns with your set interests.
        </Text>

        <View className="w-full h-[1px] bg-cardBorder mb-4" />

        {/* Engine Switcher */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm font-bold">Automation Service</Text>
            <Text className={`text-xs ${automationJob?.status === "ACTIVE" ? "text-accentGreen" : "text-textMuted"} font-semibold mt-0.5`}>
              Status: {automationJob?.status || "DISABLED"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleToggleAutomation}
            className={`px-4 py-2.5 rounded-xl flex-row items-center space-x-1.5 ${
              automationJob?.status === "ACTIVE" ? "bg-red-500/20 border border-red-500/40" : "bg-primary"
            }`}
          >
            {automationJob?.status === "ACTIVE" ? (
              <>
                <Pause size={14} color="#EF4444" />
                <Text className="text-[#EF4444] font-bold text-xs">Pause Engine</Text>
              </>
            ) : (
              <>
                <Play size={14} color="#FFFFFF" />
                <Text className="text-white font-bold text-xs">Activate Engine</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Instagram Status Banner */}
      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          {instagramConnection?.status === "CONNECTED" && instagramConnection.profilePictureUrl ? (
            <Image
              source={{ uri: instagramConnection.profilePictureUrl }}
              className="w-12 h-12 rounded-full border border-primary"
            />
          ) : (
            <View className="w-12 h-12 bg-pink-500/10 rounded-full border border-pink-500/20 items-center justify-center">
              <Instagram size={20} color="#FF007F" />
            </View>
          )}
          
          <View>
            <Text className="text-white text-sm font-bold">
              {instagramConnection?.status === "CONNECTED" ? `@${instagramConnection.username}` : "Instagram Link"}
            </Text>
            <Text className="text-textMuted text-xs mt-0.5">
              {instagramConnection?.status === "CONNECTED" 
                ? `Sync: ${instagramConnection.lastSynchronizedAt ? new Date(instagramConnection.lastSynchronizedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}`
                : "Disconnected"}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate("Profile")}
          className="flex-row items-center space-x-1"
        >
          <Text className="text-primary text-xs font-bold">Manage</Text>
          <ChevronRight size={14} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Quick Action Hub */}
      <Text className="text-white font-bold text-sm mb-3 px-1">Quick Tasks</Text>
      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity
          onPress={handleRunSync}
          disabled={isLoading}
          className="bg-cardBg border border-cardBorder rounded-2xl p-4 w-[48%] mb-3 items-center justify-center space-y-2"
        >
          {isLoading ? (
            <ActivityIndicator color="#8B5CF6" size="small" />
          ) : (
            <RefreshCw size={22} color="#3B82F6" />
          )}
          <Text className="text-white font-bold text-xs text-center">Trigger AI Sync</Text>
          <Text className="text-textMuted text-[10px] text-center">Score feed now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Preferences")}
          className="bg-cardBg border border-cardBorder rounded-2xl p-4 w-[48%] mb-3 items-center justify-center space-y-2"
        >
          <Sliders size={22} color="#8B5CF6" />
          <Text className="text-white font-bold text-xs text-center">Configure Topics</Text>
          <Text className="text-textMuted text-[10px] text-center">Adjust weights</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Logs Feed */}
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-white font-bold text-sm">System Activity</Text>
        <TouchableOpacity onPress={loadData} className="flex-row items-center space-x-1">
          <History size={12} color="#6B7280" />
          <Text className="text-textMuted text-xs font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-10 space-y-3">
        {activityLogs.length === 0 ? (
          <Text className="text-textMuted text-xs text-center py-2">No activity logged yet.</Text>
        ) : (
          activityLogs.slice(0, 4).map((log) => (
            <View key={log.id} className="flex-row items-start space-x-2.5 pb-3 border-b border-[#141416] last:border-0 last:pb-0">
              <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
              <View className="flex-1">
                <Text className="text-white text-xs leading-normal font-semibold">{log.message}</Text>
                <Text className="text-textMuted text-[10px] mt-0.5">
                  {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    <Modal
      visible={isSyncModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (syncStatus !== "running") setIsSyncModalVisible(false);
      }}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-5">
        <View className="w-full max-w-[450px] bg-cardBg border border-cardBorder rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center space-x-3 mb-4">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center border border-primary/20">
              <Cpu size={18} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-black">AI Automation Pipeline</Text>
              <Text className="text-textMuted text-xs font-semibold">
                {instagramConnection?.status === "CONNECTED"
                  ? `Simulating Feed Sync for @${instagramConnection.username}`
                  : "Simulating System Feed Sync"}
              </Text>
            </View>
          </View>

          {/* Terminal View */}
          <View className="bg-black/95 rounded-2xl border border-cardBorder p-4 h-[220px] mb-4 relative">
            {/* Window Controls */}
            <View className="flex-row space-x-1.5 mb-2.5 border-b border-[#1b1b22] pb-2">
              <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <View className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <Text className="text-[9px] text-[#4b4b5c] font-mono ml-2">SYSTEM CONNECTIVITY CONSOLE</Text>
            </View>

            <ScrollView
              ref={consoleScrollRef}
              onContentSizeChange={() => consoleScrollRef.current?.scrollToEnd({ animated: true })}
              className="flex-1"
            >
              {visibleTrace.map((item, idx) => renderTraceLine(item, idx))}
              {syncStatus === "running" && (
                <View className="flex-row items-center mt-1.5 px-1">
                  <ActivityIndicator size="small" color="#8B5CF6" className="mr-2" />
                  <Text className="font-mono text-[9px] text-primary">Running pipeline components...</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Error Message */}
          {syncStatus === "error" && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-4 flex-row items-start space-x-2.5">
              <AlertTriangle size={16} color="#EF4444" />
              <View className="flex-1">
                <Text className="text-red-500 text-xs font-bold">Sync Pipeline Failed</Text>
                <Text className="text-red-300 text-[10px] mt-0.5">{errorMessage}</Text>
              </View>
            </View>
          )}

          {/* Success Summary Content */}
          {syncStatus === "complete" && (
            <View className="space-y-4 mb-4">
              {/* Score Summary */}
              <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-textMuted text-[10px] font-bold uppercase tracking-wider">Index Update</Text>
                  <View className="flex-row items-baseline mt-1 space-x-1.5">
                    <Text className="text-2xl font-black text-white">{oldIndex}</Text>
                    <Text className="text-textMuted text-xs font-bold">→</Text>
                    <Text className="text-2xl font-black text-accentGreen">{newIndex}</Text>
                    <Text className="text-textMuted text-xs">/100</Text>
                  </View>
                </View>
                <View className="bg-accentGreen/10 border border-accentGreen/20 px-2.5 py-1 rounded-full flex-row items-center">
                  <TrendingUp size={12} color="#10B981" />
                  <Text className="text-accentGreen text-[10px] font-black ml-1">
                    {newIndex >= oldIndex ? "+" : ""}
                    {newIndex - oldIndex}%
                  </Text>
                </View>
              </View>

              {/* Posts Ingested list */}
              <View>
                <Text className="text-white text-xs font-bold mb-2">Ingested Posts & Relevance</Text>
                <View className="space-y-2 max-h-[140px] overflow-scroll">
                  {syncResults.map((post, idx) => {
                    if (!post) return null;
                    return (
                      <View key={idx} className="bg-black/40 border border-cardBorder rounded-xl p-2.5 flex-row justify-between items-center">
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center space-x-1.5 mb-1">
                            <View className="bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
                              <Text className="text-primary text-[8px] font-bold">{post.category || "General"}</Text>
                            </View>
                            <Text className="text-[8px] text-textMuted">Conf: {post.confidence ? Math.round(post.confidence * 100) : 0}%</Text>
                          </View>
                          <Text className="text-white text-[10px] font-medium leading-relaxed" numberOfLines={1}>
                            {post.content || ""}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-textMuted text-[8px] font-bold uppercase">Match</Text>
                          <Text className={`text-[11px] font-black ${post.match_score >= 50 ? "text-accentGreen" : "text-red-500"}`}>
                            {post.match_score || 50}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Bottom Actions */}
          <View className="flex-row space-x-3">
            {syncStatus === "running" ? (
              <View className="flex-1 bg-[#1b1b22] border border-[#2e2e38] rounded-xl py-3.5 items-center justify-center flex-row space-x-2">
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text className="text-textMuted font-bold text-xs">Simulating Pipeline Runs...</Text>
              </View>
            ) : syncStatus === "error" ? (
              <TouchableOpacity
                onPress={() => setIsSyncModalVisible(false)}
                className="flex-1 bg-red-500/20 border border-red-500/40 rounded-xl py-3.5 items-center justify-center"
              >
                <Text className="text-red-500 font-bold text-xs">Close Console</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsSyncModalVisible(false)}
                className="flex-1 bg-primary rounded-xl py-3.5 items-center justify-center flex-row space-x-1.5"
              >
                <Check size={14} color="#FFF" />
                <Text className="text-white font-bold text-xs">Synchronize Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  </>
);
};

export default HomeScreen;
