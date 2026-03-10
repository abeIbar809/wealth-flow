import { AppText } from "@/src/components/common/app-text";
import HapticButton from "@/src/components/navigation/haptic-button";
import { AddStockData, StockSearchResult } from "@/src/services/stocksService";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

interface AddStockModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddStockData) => Promise<void>;
  searchResults: StockSearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

export default function AddStockModal({
  visible,
  onClose,
  onAdd,
  searchResults,
  isSearching,
  onSearch,
  onClearSearch,
}: AddStockModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setSelectedStock(null);
      if (text.length >= 1) {
        onSearch(text);
      } else {
        onClearSearch();
      }
    },
    [onSearch, onClearSearch]
  );

  const handleSelectStock = async (stock: StockSearchResult) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStock(stock);
    setSearchQuery(stock.symbol);
    onClearSearch();
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedStock(null);
    setShares("");
    setAvgCost("");
    setError(null);
    onClearSearch();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError("Please enter a valid number of shares");
      return;
    }

    if (isNaN(avgCostNum) || avgCostNum < 0) {
      setError("Please enter a valid average cost");
      return;
    }

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onAdd({
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        shares: sharesNum,
        avgCostPerShare: avgCostNum,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!selectedStock && !!shares && !!avgCost;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/50"
        >
          <TouchableOpacity className="flex-1" onPress={handleClose} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90%]"
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="flex-row items-center justify-between px-5 pb-4">
              <AppText className="text-gray-800 font-bold text-[20px]">Add Stock</AppText>
              <HapticButton onPressed={handleClose}>
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name="close" size={20} color="#6B7280" />
                </View>
              </HapticButton>
            </View>

            <View className="px-5 pb-8">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AppText className="text-red-600 text-[13px]">{error}</AppText>
                </View>
              )}

              {/* Stock Search */}
              <View className="mb-4" style={{ zIndex: 10 }}>
                <AppText className="text-gray-600 font-medium text-[14px] mb-2">
                  Stock Symbol
                </AppText>
                <View style={{ position: "relative", zIndex: 10 }}>
                  <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-2 text-[16px] text-gray-800"
                      placeholder="Search by symbol or name"
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={handleSearchChange}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                    {isSearching && <ActivityIndicator size="small" color="#03BF62" />}
                    {selectedStock && (
                      <Ionicons name="checkmark-circle" size={20} color="#03BF62" />
                    )}
                  </View>

                  {searchResults.length > 0 && !selectedStock && (
                    <View
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        marginTop: 8,
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 8,
                        maxHeight: 200,
                      }}
                    >
                      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {searchResults.map((stock, index) => (
                          <TouchableOpacity
                            key={stock.symbol}
                            onPress={() => handleSelectStock(stock)}
                            className={`px-4 py-3 flex-row items-center ${
                              index < searchResults.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                          >
                            <View className="flex-1">
                              <AppText className="text-gray-800 font-medium text-[14px]">
                                {stock.symbol}
                              </AppText>
                              <AppText className="text-gray-500 text-[12px]" numberOfLines={1}>
                                {stock.name}
                              </AppText>
                            </View>
                            <AppText className="text-gray-400 text-[11px]">
                              {stock.exchange}
                            </AppText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {selectedStock && (
                  <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-2 flex-row items-center">
                    <View className="flex-1">
                      <AppText className="text-green-800 font-medium text-[14px]">
                        {selectedStock.symbol}
                      </AppText>
                      <AppText className="text-green-600 text-[12px]" numberOfLines={1}>
                        {selectedStock.name}
                      </AppText>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedStock(null)}>
                      <Ionicons name="close-circle" size={20} color="#16A34A" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Number of Shares */}
              <View className="mb-4" style={{ zIndex: 1 }}>
                <AppText className="text-gray-600 font-medium text-[14px] mb-2">
                  Number of Shares
                </AppText>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    className="text-[16px] text-gray-800"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={shares}
                    onChangeText={setShares}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Average Cost */}
              <View className="mb-6" style={{ zIndex: 1 }}>
                <AppText className="text-gray-600 font-medium text-[14px] mb-2">
                  Average Cost per Share
                </AppText>
                <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
                  <AppText className="text-gray-500 text-[16px] mr-1">$</AppText>
                  <TextInput
                    className="flex-1 text-[16px] text-gray-800"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={avgCost}
                    onChangeText={setAvgCost}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className={`rounded-xl py-4 items-center ${
                  isFormValid && !isSubmitting ? "bg-[#03BF62]" : "bg-gray-300"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <AppText className="text-white font-semibold text-[16px]">
                    Add to Portfolio
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
