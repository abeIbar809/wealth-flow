import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { AppText } from "@/src/components/common/app-text";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import creditService, { CreditCard, CreditInsights } from "@/src/services/CreditService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CreditScoreSheet() {
  const [insights, setInsights] = useState<CreditInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditInsights = useCallback(async () => {
    try {
      setError(null);
      const data = await creditService.getCreditInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credit data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditInsights();
  }, [fetchCreditInsights]);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    await fetchCreditInsights();
  }, [fetchCreditInsights]);

  const handleClose = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const tips = insights ? creditService.getCreditTips(insights) : [];
  const utilizationRating = insights
    ? creditService.getUtilizationRating(insights.utilization.overall)
    : null;

  // Credit Score Ring Component
  const CreditScoreRing = ({ score, color }: { score: number; color: string }) => {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (score / 100) * circumference;

    return (
      <View className="items-center justify-center">
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute items-center">
          <AppText className="text-gray-800 font-bold text-[36px]">{score}</AppText>
          <AppText className="text-gray-500 text-[12px]">Credit Health</AppText>
        </View>
      </View>
    );
  };

  // Credit Card Item Component
  const CreditCardItem = ({ card, index }: { card: CreditCard; index: number }) => {
    const utilizationColor =
      card.utilization > 75
        ? "#EF4444"
        : card.utilization > 50
        ? "#F59E0B"
        : card.utilization > 30
        ? "#3B82F6"
        : "#03BF62";

    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(index * 100)}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
              <Ionicons name="card" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <AppText className="text-gray-800 font-semibold text-[14px]" numberOfLines={1}>
                {card.name}
              </AppText>
              <AppText className="text-gray-500 text-[12px]">{card.institution}</AppText>
            </View>
          </View>
          <View className="items-end">
            <AppText className="text-gray-800 font-bold text-[16px]">
              {creditService.formatCurrency(card.balance)}
            </AppText>
            <AppText className="text-gray-500 text-[11px]">
              of {creditService.formatCurrency(card.limit)}
            </AppText>
          </View>
        </View>

        {/* Utilization Bar */}
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(card.utilization, 100)}%`,
              backgroundColor: utilizationColor,
            }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <AppText className="text-gray-500 text-[11px]">
            {card.utilization.toFixed(1)}% used
          </AppText>
          <AppText className="text-green-600 text-[11px]">
            {creditService.formatCurrency(card.available)} available
          </AppText>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#1F2937", "#374151"]}
        className="pt-14 pb-6 px-6"
      >
        <View className="p-4 flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleClose}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <AppText className="text-white font-bold text-[18px]">Credit Health</AppText>
          <View className="w-10" />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#03BF62"
          />
        }
      >
        {isLoading ? (
          // Loading State
          <View className="items-center justify-center py-20">
            <View className="w-40 h-40 bg-gray-200 rounded-full mb-4" />
            <View className="w-32 h-4 bg-gray-200 rounded mb-2" />
            <View className="w-24 h-4 bg-gray-200 rounded" />
          </View>
        ) : error ? (
          // Error State
          <View className="items-center justify-center py-20 px-6">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
            </View>
            <AppText className="text-gray-800 font-semibold text-[16px] text-center mb-2">
              Unable to Load Credit Data
            </AppText>
            <AppText className="text-gray-500 text-[14px] text-center mb-4">
              {error}
            </AppText>
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-gray-800 px-6 py-3 rounded-xl"
            >
              <AppText className="text-white font-medium">Try Again</AppText>
            </TouchableOpacity>
          </View>
        ) : insights ? (
          <>
            {/* Credit Score Card */}
            <Animated.View
              entering={FadeIn.duration(500)}
              className="mt-7 mx-6 bg-white rounded-3xl p-6 shadow-lg"
            >
              <CreditScoreRing
                score={insights.creditHealth.score}
                color={insights.creditHealth.color}
              />
              <View className="items-center mt-4">
                <View
                  className="px-4 py-1.5 rounded-full"
                  style={{ backgroundColor: `${insights.creditHealth.color}20` }}
                >
                  <AppText
                    className="font-semibold text-[14px]"
                    style={{ color: insights.creditHealth.color }}
                  >
                    {insights.creditHealth.status}
                  </AppText>
                </View>
              </View>
            </Animated.View>

            {/* Credit Utilization */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="mx-6 mt-6"
            >
              <AppText className="text-gray-800 font-semibold text-[16px] mb-3">
                Credit Utilization
              </AppText>
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <AppText className="text-gray-600 text-[14px]">Overall Usage</AppText>
                  <AppText
                    className="font-bold text-[18px]"
                    style={{ color: utilizationRating?.color }}
                  >
                    {insights.utilization.overall}%
                  </AppText>
                </View>

                {/* Progress Bar */}
                <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(insights.utilization.overall, 100)}%`,
                      backgroundColor: utilizationRating?.color,
                    }}
                  />
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <AppText className="text-gray-500 text-[11px]">Total Used</AppText>
                    <AppText className="text-gray-800 font-semibold text-[14px]">
                      {creditService.formatCurrency(insights.utilization.totalUsed)}
                    </AppText>
                  </View>
                  <View className="items-center">
                    <AppText className="text-gray-500 text-[11px]">Available</AppText>
                    <AppText className="text-green-600 font-semibold text-[14px]">
                      {creditService.formatCurrency(insights.utilization.totalAvailable)}
                    </AppText>
                  </View>
                  <View className="items-end">
                    <AppText className="text-gray-500 text-[11px]">Total Limit</AppText>
                    <AppText className="text-gray-800 font-semibold text-[14px]">
                      {creditService.formatCurrency(insights.utilization.totalLimit)}
                    </AppText>
                  </View>
                </View>

                {utilizationRating && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <AppText className="text-gray-600 text-[12px]">
                      {utilizationRating.description}
                    </AppText>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Debt Summary */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="mx-6 mt-6"
            >
              <AppText className="text-gray-800 font-semibold text-[16px] mb-3">
                Debt Summary
              </AppText>
              <View className="flex-row">
                <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm mr-2">
                  <Ionicons name="card-outline" size={24} color="#EF4444" />
                  <AppText className="text-gray-500 text-[12px] mt-2">Total Debt</AppText>
                  <AppText className="text-gray-800 font-bold text-[18px]">
                    {creditService.formatCurrency(insights.summary.totalDebt)}
                  </AppText>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm ml-2">
                  <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
                  <AppText className="text-gray-500 text-[12px] mt-2">Est. Monthly</AppText>
                  <AppText className="text-gray-800 font-bold text-[18px]">
                    {creditService.formatCurrency(insights.summary.estimatedMonthlyPayment)}
                  </AppText>
                </View>
              </View>
            </Animated.View>

            {/* Credit Cards */}
            {insights.creditCards.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(300)}
                className="mx-6 mt-6"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <AppText className="text-gray-800 font-semibold text-[16px]">
                    Credit Cards
                  </AppText>
                  <View className="bg-gray-100 px-2 py-1 rounded-full">
                    <AppText className="text-gray-600 text-[12px]">
                      {insights.creditCards.length}
                    </AppText>
                  </View>
                </View>
                {insights.creditCards.map((card, index) => (
                  <CreditCardItem key={card.id} card={card} index={index} />
                ))}
              </Animated.View>
            )}

            {/* Loans */}
            {insights.loans.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(400)}
                className="mx-6 mt-6"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <AppText className="text-gray-800 font-semibold text-[16px]">Loans</AppText>
                  <View className="bg-gray-100 px-2 py-1 rounded-full">
                    <AppText className="text-gray-600 text-[12px]">
                      {insights.loans.length}
                    </AppText>
                  </View>
                </View>
                {insights.loans.map((loan, index) => (
                  <Animated.View
                    key={loan.id}
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
                  >
                    <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="document-text" size={20} color="#9B59B6" />
                    </View>
                    <View className="flex-1">
                      <AppText className="text-gray-800 font-semibold text-[14px]">
                        {loan.name}
                      </AppText>
                      <AppText className="text-gray-500 text-[12px]">
                        {loan.institution}
                      </AppText>
                    </View>
                    <AppText className="text-gray-800 font-bold text-[16px]">
                      {creditService.formatCurrency(loan.balance)}
                    </AppText>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(500)}
                className="mx-6 mt-6"
              >
                <AppText className="text-gray-800 font-semibold text-[16px] mb-3">
                  Tips to Improve
                </AppText>
                <View className="bg-blue-50 rounded-2xl p-4">
                  {tips.map((tip, index) => (
                    <View key={index} className="flex-row mb-2 last:mb-0">
                      <Ionicons name="bulb" size={16} color="#3B82F6" />
                      <AppText className="text-blue-800 text-[13px] ml-2 flex-1">
                        {tip}
                      </AppText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* No Credit Accounts State */}
            {insights.creditCards.length === 0 && insights.loans.length === 0 && (
              <View className="mx-6 mt-6 bg-gray-100 rounded-2xl p-6 items-center">
                <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-3">
                  <Ionicons name="card-outline" size={32} color="#9CA3AF" />
                </View>
                <AppText className="text-gray-800 font-semibold text-[16px] text-center">
                  No Credit Accounts Found
                </AppText>
                <AppText className="text-gray-500 text-[13px] text-center mt-1">
                  Link a credit card or loan account to see your credit health insights.
                </AppText>
              </View>
            )}

            {/* Bottom Spacing */}
            <View className="h-10" />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
