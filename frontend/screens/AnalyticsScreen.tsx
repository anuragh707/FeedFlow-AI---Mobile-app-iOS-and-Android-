import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Sparkles, TrendingUp, RefreshCw, BarChart4, Compass, Award } from "lucide-react-native";

import { useStore } from "../store/useStore";

export const AnalyticsScreen = () => {
  const isFocused = useIsFocused();
  const { dashboardData, getDashboardData, isLoading } = useStore();

  useEffect(() => {
    if (isFocused) {
      getDashboardData();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    await getDashboardData();
  };

  const distribution = dashboardData?.content_distribution || {};
  const maxDistributionCount = Math.max(...Object.values(distribution), 1);
  
  const history = dashboardData?.history || [];
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-background px-5 pt-4">
      {/* Sync Status Refresher */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-textMuted text-xs font-semibold uppercase tracking-wider">Historical Analytics</Text>
          <Text className="text-2xl font-black text-white">AI Personalization</Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          className="w-10 h-10 bg-cardBg border border-cardBorder rounded-xl items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#8B5CF6" size="small" />
          ) : (
            <RefreshCw size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Scoring Snapshot Card */}
      <View className="bg-cardBg border border-cardBorder rounded-3xl p-5 mb-5 shadow-xl">
        <Text className="text-textMuted text-xs font-bold uppercase tracking-wide mb-3">Relevance Performance</Text>
        
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-4xl font-black text-white">{dashboardData?.personalization_score || 50}</Text>
              <Text className="text-textMuted text-base font-bold">/100</Text>
            </View>
            <Text className="text-textMuted text-[10px] mt-0.5">Average Match Index</Text>
          </View>
          
          <View className="w-[1px] h-10 bg-cardBorder" />
          
          <View>
            <Text className="text-white text-base font-black">
              {dashboardData?.previous_score || 50}
            </Text>
            <Text className="text-textMuted text-[10px] mt-0.5">Baseline Index</Text>
          </View>

          <View className="w-[1px] h-10 bg-cardBorder" />

          <View className="bg-accentGreen/10 px-3 py-1.5 rounded-full flex-row items-center">
            <TrendingUp size={14} color="#10B981" />
            <Text className="text-accentGreen text-xs font-black ml-1">
              {dashboardData && dashboardData.improvement_pct > 0 ? "+" : ""}
              {dashboardData?.improvement_pct || 0}%
            </Text>
          </View>
        </View>

        <Text className="text-textMuted text-[11px] leading-normal">
          An analysis of content scores comparing initial runs against current optimized results. A positive score shows FeedFlow is successfully sorting your feed.
        </Text>
      </View>

      {/* Progress Charts (Relevance % & Accuracy %) */}
      <View className="flex-row justify-between mb-6">
        {/* Feed Relevance */}
        <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 w-[48%] items-center justify-between space-y-3">
          <Compass size={20} color="#8B5CF6" />
          <View className="items-center">
            <Text className="text-2xl font-black text-white">{dashboardData?.feed_relevance_pct || 50}%</Text>
            <Text className="text-textMuted text-[10px] text-center font-semibold uppercase mt-0.5 tracking-wider">Feed Relevance</Text>
          </View>
          {/* Custom Horizontal Progress Bar */}
          <View className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
            <View 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${dashboardData?.feed_relevance_pct || 50}%` }}
            />
          </View>
        </View>

        {/* Preference Accuracy */}
        <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 w-[48%] items-center justify-between space-y-3">
          <Award size={20} color="#3B82F6" />
          <View className="items-center">
            <Text className="text-2xl font-black text-white">{dashboardData?.preference_accuracy_pct || 75}%</Text>
            <Text className="text-textMuted text-[10px] text-center font-semibold uppercase mt-0.5 tracking-wider">Model Accuracy</Text>
          </View>
          <View className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
            <View 
              className="h-full bg-secondary rounded-full" 
              style={{ width: `${dashboardData?.preference_accuracy_pct || 75}%` }}
            />
          </View>
        </View>
      </View>

      {/* Historical Score Progression Chart */}
      <Text className="text-white font-extrabold text-sm mb-3 px-1">Chronological Scoring History</Text>
      <View className="bg-cardBg border border-cardBorder rounded-2xl p-4 mb-6">
        {history.length === 0 ? (
          <Text className="text-textMuted text-xs text-center py-8">Trigger a sync to see scoring history.</Text>
        ) : (
          <View className="h-40 flex-row items-end justify-between px-2 pt-4">
            {history.map((h, idx) => (
              <View key={h.id || idx} className="items-center flex-1 mx-0.5">
                {/* Score label popup */}
                <Text className="text-white text-[8px] font-black mb-1">{h.match_score}</Text>
                
                {/* Visual Bar Column */}
                <View 
                  className={`w-3.5 rounded-t-md ${
                    h.match_score >= 80 ? "bg-accentGreen" : h.match_score >= 50 ? "bg-primary" : "bg-secondary"
                  }`}
                  style={{ height: `${Math.max(10, (h.match_score / 100) * 100)}px` }}
                />
                
                {/* X-Axis Label */}
                <Text className="text-textMuted text-[7px] mt-1.5 font-bold uppercase">{h.label}</Text>
              </View>
            ))}
          </View>
        )}
        <Text className="text-textMuted text-[9px] text-center mt-3">Individual post scores (P1, P2...) plotted chronologically.</Text>
      </View>

      {/* AI Insights & Coach Recommendations */}
      <View className="flex-row items-center space-x-1.5 mb-3 px-1">
        <Sparkles size={16} color="#8B5CF6" />
        <Text className="text-white font-extrabold text-sm uppercase tracking-wide">AI Recommendation Insights</Text>
      </View>

      <View className="space-y-3 mb-10">
        {dashboardData?.insights?.map((insight, idx) => (
          <View
            key={idx}
            className={`border rounded-2xl p-4 bg-cardBg ${
              insight.trend_type === "POSITIVE" 
                ? "border-accentGreen/30" 
                : insight.trend_type === "WARNING" 
                  ? "border-yellow-500/20" 
                  : "border-primary/20"
            }`}
          >
            <View className="flex-row justify-between items-start">
              <Text className="text-white text-xs leading-normal font-bold flex-1 pr-2">
                {insight.message}
              </Text>
              {insight.improvement_pct && insight.improvement_pct > 0 ? (
                <View className="bg-accentGreen/10 px-2 py-0.5 rounded-full">
                  <Text className="text-accentGreen text-[9px] font-black">+{insight.improvement_pct}%</Text>
                </View>
              ) : null}
            </View>
          </View>
        )) || <Text className="text-textMuted text-xs px-1 italic">No insights available.</Text>}
      </View>

      {/* Content Category Distribution */}
      <View className="flex-row items-center space-x-1.5 mb-3 px-1">
        <BarChart4 size={16} color="#3B82F6" />
        <Text className="text-white font-extrabold text-sm uppercase tracking-wide">Content Ingestion Breakdown</Text>
      </View>

      <View className="bg-cardBg border border-cardBorder rounded-2xl p-5 mb-12 space-y-4">
        {Object.keys(distribution).length === 0 ? (
          <Text className="text-textMuted text-xs text-center py-4">No content category metrics compiled.</Text>
        ) : (
          Object.entries(distribution).map(([category, count]) => (
            <View key={category} className="space-y-1.5">
              <View className="flex-row justify-between text-xs">
                <Text className="text-white font-bold text-xs">{category}</Text>
                <Text className="text-textMuted text-[10px]">{count} post(s)</Text>
              </View>
              {/* Dynamic width progress indicator bar */}
              <View className="w-full h-2 bg-[#141416] rounded-full overflow-hidden">
                <View
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${(count / maxDistributionCount) * 100}%` }}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
