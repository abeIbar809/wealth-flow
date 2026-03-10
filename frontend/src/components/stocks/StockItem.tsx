import { AppText } from "@/src/components/common/app-text";
import { Stock, stocksService } from "@/src/services/stocksService";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { memo, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

interface StockItemProps {
  stock: Stock;
  index: number;
  onPress?: (stock: Stock) => void;
  onLongPress?: (stock: Stock) => void;
}

function StockItem({ stock, index, onPress, onLongPress }: StockItemProps) {
  const isPositiveDay = stock.dayChangePercent >= 0;
  const isPositiveTotal = stock.totalGainLossPercent >= 0;

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(stock);
  }, [onPress, stock]);

  const handleLongPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(stock);
  }, [onLongPress, stock]);

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 60)}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        className="flex-row items-center py-4 px-4"
      >
        {/* Symbol Circle */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: "rgba(3, 191, 98, 0.15)",
          }}
        >
          <AppText className="font-bold text-[14px]" style={{ color: "#03BF62" }}>
            {stock.symbol.slice(0, 3)}
          </AppText>
        </View>

        {/* Stock Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <AppText className="text-gray-800 font-semibold text-[15px]" numberOfLines={1}>
                {stock.symbol}
              </AppText>
              <AppText className="text-gray-500 text-[12px]" numberOfLines={1}>
                {stock.shares} shares
              </AppText>
            </View>

            {/* Current Price & Day Change */}
            <View className="items-end">
              <AppText className="text-gray-800 font-bold text-[15px]">
                {stocksService.formatCurrency(stock.currentPrice)}
              </AppText>
              <View className="flex-row items-center">
                <Ionicons
                  name={isPositiveDay ? "caret-up" : "caret-down"}
                  size={12}
                  color={isPositiveDay ? "#03BF62" : "#EF4444"}
                />
                <AppText
                  className="text-[12px] font-medium"
                  style={{ color: isPositiveDay ? "#03BF62" : "#EF4444" }}
                >
                  {stocksService.formatPercent(stock.dayChangePercent)}
                </AppText>
              </View>
            </View>
          </View>

          {/* Market Value & Total Return */}
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <View>
              <AppText className="text-gray-400 text-[11px]">Market Value</AppText>
              <AppText className="text-gray-700 font-medium text-[13px]">
                {stocksService.formatCurrency(stock.totalValue)}
              </AppText>
            </View>
            <View className="items-end">
              <AppText className="text-gray-400 text-[11px]">Total Return</AppText>
              <View className="flex-row items-center">
                <AppText
                  className="font-medium text-[13px]"
                  style={{ color: isPositiveTotal ? "#03BF62" : "#EF4444" }}
                >
                  {isPositiveTotal ? "+" : ""}
                  {stocksService.formatCurrency(stock.totalGainLoss)}
                </AppText>
                <AppText
                  className="text-[11px] ml-1"
                  style={{ color: isPositiveTotal ? "#03BF62" : "#EF4444" }}
                >
                  ({stocksService.formatPercent(stock.totalGainLossPercent)})
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(StockItem);
