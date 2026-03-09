import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet, TouchableOpacity, Alert, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart, PieChart } from "react-native-chart-kit";
const screenWidth = Dimensions.get("window").width;
import * as Haptics from "expo-haptics";
import { AppText } from "@/src/components/common/app-text";
import { useStocksStore } from "@/src/stores/useStocksStore";
import stocksService, { AddStockData, Stock } from "@/src/services/stocksService";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import Ionicons from "@expo/vector-icons/Ionicons";
import StockPortfolioSummaryCard from "@/src/components/stocks/StockPortfolioSummaryCard";
import StockItem from "@/src/components/stocks/StockItem";
import AddStockModal from "@/src/components/stocks/AddStockModal";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";

type TabType = "overview" | "stocks";

export default function InvestmentsPage() {

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [selected, setSelected] = useState("stocks");

  const chartData: Record<string, number[]> = {
    stocks: [12000, 13500, 12800, 14200],
    crypto: [5000, 4200, 6100, 5800],
    realestate: [250000, 265000, 290000, 310000],
  };

  const labelsMap: Record<string, string[]> = {
    stocks: ["Jan", "Feb", "Mar", "Apr"],
    crypto: ["Jan", "Feb", "Mar", "Apr"],
    realestate: ["2022", "2023", "2024", "2025"],
  };

  const titleMap: Record<string, string> = {
    stocks: "Stocks",
    crypto: "Crypto",
    realestate: "Real Estate",
  };

  const assetBreakdown = [
    { name: "Stocks", population: 55, color: "#7ef714", legendFontColor: "#aaa", legendFontSize: 14 },
    { name: "Crypto", population: 15, color: "#f7c914", legendFontColor: "#aaa", legendFontSize: 14 },
    { name: "Real Estate", population: 25, color: "#14b8f7", legendFontColor: "#aaa", legendFontSize: 14 },
    { name: "Cash", population: 5, color: "#9ca3af", legendFontColor: "#aaa", legendFontSize: 14 },
  ];

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const hasFetched = useRef(false);

  const stocks = useStocksStore((state) => state.stocks);
  const portfolioSummary = useStocksStore((state) => state.portfolioSummary);
  const searchResults = useStocksStore((state) => state.searchResults);
  const priceHistory = useStocksStore((state) => state.priceHistory);
  const isLoading = useStocksStore((state) => state.isLoading);
  const isRefreshing = useStocksStore((state) => state.isRefreshing);
  const isSearching = useStocksStore((state) => state.isSearching);
  const isLoadingHistory = useStocksStore((state) => state.isLoadingHistory);
  const fetchStocks = useStocksStore((state) => state.fetchStocks);
  const addStock = useStocksStore((state) => state.addStock);
  const deleteStock = useStocksStore((state) => state.deleteStock);
  const refreshPrices = useStocksStore((state) => state.refreshPrices);
  const searchStocks = useStocksStore((state) => state.searchStocks);
  const clearSearchResults = useStocksStore((state) => state.clearSearchResults);
  const fetchPriceHistory = useStocksStore((state) => state.fetchPriceHistory);


  // Memoize to prevent re-renders
  const allocation = useMemo(() => {
    return stocksService.calculateAllocation(stocks);
  }, [stocks]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchStocks();
    }
  }, [fetchStocks]);

  // Fetch price history when a stock is selected
  useEffect(() => {
    if (selectedStock?.symbol) {
      fetchPriceHistory(selectedStock.symbol, "1M");
    }
  }, [selectedStock?.symbol, fetchPriceHistory]);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshPrices();
  }, [refreshPrices]);

  const handleAddStock = useCallback(
    async (data: AddStockData) => {
      await addStock(data);
    },
    [addStock]
  );

  const handleStockPress = useCallback((stock: Stock) => {
    setSelectedStock((current) => (current?._id === stock._id ? null : stock));
  }, []);

  const handleStockLongPress = useCallback(
    (stock: Stock) => {
      Alert.alert(stock.symbol, `${stock.shares} shares at ${stocksService.formatCurrency(stock.currentPrice)}`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteStock(stock._id);
              if (selectedStock?._id === stock._id) {
                setSelectedStock(null);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete stock");
            }
          },
        },
      ]);
    },
    [deleteStock, selectedStock]
  );

  const handleRangeChange = useCallback(
    (range: "1W" | "1M" | "3M" | "6M" | "1Y") => {
      if (selectedStock?.symbol) {
        fetchPriceHistory(selectedStock.symbol, range);
      }
    },
    [selectedStock?.symbol, fetchPriceHistory]
  );

  const handleAddPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Memoize price history to avoid new array references
  const selectedPriceHistory = useMemo(() => {
    if (!selectedStock?.symbol) return [];
    return priceHistory[`${selectedStock.symbol}_1M`] || [];
  }, [selectedStock?.symbol, priceHistory]);

  return (
    <ScrollView style={styles.container}>

        {/* Tab Selector */}
        <View className="mx-6 mb-4 pt-4">
          <View className="flex-row bg-gray-200 rounded-xl p-1">
            <Pressable
              onPress={() => handleTabChange("overview")}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: activeTab === "overview" ? "#fff" : "transparent",
              }}
            >
              <AppText
                className={`text-[14px] font-medium ${
                  activeTab === "overview" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Overview
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => handleTabChange("stocks")}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: activeTab === "stocks" ? "#fff" : "transparent",
              }}
            >
              <AppText
                className={`text-[14px] font-medium ${
                  activeTab === "stocks" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Stocks
              </AppText>
            </Pressable>
          </View>
        </View>

      {/* Stocks Header */}
      {activeTab === "stocks" && (
      <View className="flex-row items-center justify-between px-8">
        <View>
          <AppText className="text-gray-800 font-bold text-[28px]">Stocks</AppText>
          <AppText className="text-gray-500 text-[14px]">Track your stock portfolio</AppText>
        </View>
        
          <HapticButton onPressed={handleAddPress}>
            <View className="w-10 h-10 bg-[#03BF62] rounded-full items-center justify-center shadow-sm">
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
          </HapticButton>
       </View>
      )}

      {/* Overview Tab Content */}
      <View style={{ display: activeTab === "overview" ? "flex" : "none" }}>
        <View style={{ padding: 20 }}>
          <Text style={styles.pageTitle}>Your Investments</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Asset Allocation</Text>
            <PieChart
              data={assetBreakdown}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[5, 0]}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Investments</Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selected}
                onValueChange={(value) => setSelected(value)}
                dropdownIconColor="#7ef714"
                style={{ color: "#fff" }}
              >
                <Picker.Item label="Stocks" value="stocks" />
                <Picker.Item label="Crypto" value="crypto" />
                <Picker.Item label="Real Estate" value="realestate" />
              </Picker>
            </View>

            <Text style={{ color: "#aaa", marginBottom: 8 }}>{titleMap[selected]}</Text>

            <LineChart
              data={{
                labels: labelsMap[selected],
                datasets: [{ data: chartData[selected] }],
              }}
              width={screenWidth - 80}
              height={170}
              chartConfig={chartConfig}
              style={{ borderRadius: 12 }}
            />
          </View>
        </View>
      </View>

      {/* stocks page */}
      <View style={{ display: activeTab === "stocks" ? "flex" : "none" }}>
        <View className="flex-1 items-center justify-center py-10">
          <AppText className="text-gray-500 text-[18px]">

            {/* Portfolio Summary */}
            <View className="w-full px-2 pb-3"> 
                <StockPortfolioSummaryCard summary={portfolioSummary} isLoading={isLoading} />
            </View>

            {/* Holdings List */}
            <GroupedPageSection className="mt-6 w-full">
              <HeadingWithElement heading="Holdings" classNameHeader="pl-6 pr-6 mt-4 mb-2">
                <View className="flex-row items-center">
                  <AppText className="text-gray-500 text-[14px] mr-1">
                    {stocks.length} {stocks.length === 1 ? "stock" : "stocks"}
                  </AppText>
                </View>
              </HeadingWithElement>

              <View className="bg-white rounded-3xl mx-4 shadow-sm overflow-hidden w-full">
                {isLoading && stocks.length === 0 ? (
                  // Loading skeleton
                  <View className="py-8 items-center">
                    <View className="w-12 h-12 bg-gray-100 rounded-full mb-3" />
                    <View className="w-32 h-4 bg-gray-100 rounded" />
                  </View>
                ) : stocks.length > 0 ? (
                  stocks.map((stock, index) => (
                    <View key={stock._id}>
                      <View
                        style={{
                          backgroundColor:
                            selectedStock?._id === stock._id ? "rgba(3, 191, 98, 0.05)" : "transparent",
                        }}
                      >
                        <StockItem
                          stock={stock}
                          index={index}
                          onPress={handleStockPress}
                          onLongPress={handleStockLongPress}
                        />
                      </View>
                      {index < stocks.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
                    </View>
                  ))
                ) : (
                  // Empty state
                  <View className="py-8 items-center w-full">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                      <Ionicons name="stats-chart-outline" size={28} color="#9CA3AF" />
                    </View>
                    <AppText className="text-gray-600 font-medium text-[15px]">No stocks yet</AppText>
                    <AppText className="text-gray-400 text-[13px] mt-1">
                      Tap + to add your first stock
                    </AppText>
                  </View>
                )}
              </View>
            </GroupedPageSection>

            {/* Tips Section */}
            {stocks.length > 0 && (
              <GroupedPageSection className="mt-6">
                <View className="bg-blue-50 rounded-3xl mx-4 p-4 shadow-sm w-full">
                  <View className="flex-row items-start">
                    <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="bulb" size={22} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <AppText className="text-blue-800 font-semibold text-[14px]">
                        Tip: View price charts
                      </AppText>
                      <AppText className="text-blue-600 text-[13px] mt-1">
                        Tap on any stock to view its price chart. Long press to delete.
                      </AppText>
                    </View>
                  </View>
                </View>
              </GroupedPageSection>
            )}



          </AppText>
        </View>
      </View>
      {/* Bottom Spacing */}
      <View className="h-32" />


      {/* Add Stock Modal */}
      <AddStockModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onAdd={handleAddStock}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={searchStocks}
        onClearSearch={clearSearchResults}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#151517",
  backgroundGradientFrom: "#151517",
  backgroundGradientTo: "#151517",
  decimalPlaces: 0,
  color: () => "#7ef714",
  labelColor: () => "#aaa",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#151517",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
});
