import { AppText } from "@/src/components/common/app-text";
import { StockPortfolioSummary, stocksService } from "@/src/services/stocksService";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { memo } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface StockPortfolioSummaryCardProps {
  summary: StockPortfolioSummary | null;
  isLoading: boolean;
}

function StockPortfolioSummaryCard({ summary, isLoading }: StockPortfolioSummaryCardProps) {
  if (isLoading && !summary) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="mx-6 bg-[#03BF62] rounded-3xl p-5 shadow-lg"
      >
        <View className="items-center py-4">
          <View className="w-24 h-8 bg-white/20 rounded-lg mb-2" />
          <View className="w-32 h-4 bg-white/20 rounded" />
        </View>
      </Animated.View>
    );
  }

  const totalValue = summary?.totalValue || 0;
  const dayChange = summary?.dayChange || 0;
  const dayChangePercent = summary?.dayChangePercent || 0;
  const totalGainLoss = summary?.totalGainLoss || 0;
  const totalGainLossPercent = summary?.totalGainLossPercent || 0;

  const isDayPositive = dayChange >= 0;
  const isTotalPositive = totalGainLoss >= 0;

  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(100)}
      className="mx-6 bg-[#03BF62] rounded-3xl p-5 shadow-lg"
    >
      {/* Total Value */}
      <View className="items-center mb-4">
        <AppText className="text-white/70 text-[13px] mb-1">Stock Portfolio Value</AppText>
        <AppText className="text-white font-bold text-[32px]">
          {stocksService.formatCurrency(totalValue)}
        </AppText>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between">
        {/* Day Change */}
        <View className="flex-1 items-center py-3 border-r border-white/20">
          <AppText className="text-white/70 text-[11px] mb-1">Today</AppText>
          <View className="flex-row items-center">
            <Ionicons
              name={isDayPositive ? "caret-up" : "caret-down"}
              size={14}
              color={isDayPositive ? "#BBF7D0" : "#FCA5A5"}
            />
            <AppText
              className="font-semibold text-[14px] ml-1"
              style={{ color: isDayPositive ? "#BBF7D0" : "#FCA5A5" }}
            >
              {stocksService.formatCurrency(Math.abs(dayChange))}
            </AppText>
          </View>
          <AppText
            className="text-[12px]"
            style={{ color: isDayPositive ? "#BBF7D0" : "#FCA5A5" }}
          >
            {stocksService.formatPercent(dayChangePercent)}
          </AppText>
        </View>

        {/* Total Gain/Loss */}
        <View className="flex-1 items-center py-3">
          <AppText className="text-white/70 text-[11px] mb-1">Total Return</AppText>
          <View className="flex-row items-center">
            <Ionicons
              name={isTotalPositive ? "trending-up" : "trending-down"}
              size={14}
              color={isTotalPositive ? "#BBF7D0" : "#FCA5A5"}
            />
            <AppText
              className="font-semibold text-[14px] ml-1"
              style={{ color: isTotalPositive ? "#BBF7D0" : "#FCA5A5" }}
            >
              {stocksService.formatCurrency(Math.abs(totalGainLoss))}
            </AppText>
          </View>
          <AppText
            className="text-[12px]"
            style={{ color: isTotalPositive ? "#BBF7D0" : "#FCA5A5" }}
          >
            {stocksService.formatPercent(totalGainLossPercent)}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

export default memo(StockPortfolioSummaryCard);