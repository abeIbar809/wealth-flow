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

import { Account } from "./types/Account";
import { fetchAccounts } from "./services/plaidService";
import { calculateAssets } from "./utils/assetUtils";
import AssetPieChart from "./components/AssetPieChart";
import useAuthStore from "@/src/stores/useAuthStore";
import { AddPropertyModal, PropertyItem, PropertyTypeChart, RealEstatePortfolioCard } from "@/src/components/RealEstate";
import { useRealEstateStore } from "@/src/stores/useRealEstateStore";
import realEstateService, { AddPropertyData, Property } from "@/src/services/realEstateService";

type TabType = "overview" | "stocks" | "estate";

export default function InvestmentsPage() {

  // Screen measurements used to keep the chart sized nicely inside the card.
  const screenWidth = Dimensions.get("window").width;
  const cardContentWidth = screenWidth - 72;
  const pieChartSize = Math.min(cardContentWidth - 12, 260);

  // Real estate state
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const hasFetchedProperties = useRef(false);


  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetBreakdown, setAssetBreakdown] = useState<any[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<"balance" | "alpha">("balance");

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [selected, setSelected] = useState("stocks");

  // Temporary user id used to request this screen's data.
  const USER_ID = "69aabec9eec4a3c03ea8948f";

  const getID = () => { 
    let id = useAuthStore.getState().user?._id
    if (!id) {
      id = USER_ID
    }
    return id
  }

  // Fetch accounts when page loads
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    // Get the raw account list from the backend.
    const data = await fetchAccounts(getID());

    setAccounts(data);

    // Group the raw accounts into chart-friendly asset totals.
    const assets = calculateAssets(data);
    setAssetBreakdown(assets);
  };

  // Return only the accounts that belong to the selected asset type.
  const getAccountsByType = (type: string) =>
    accounts.filter((acc) => acc.type === type);

  // Add up the selected group so each account can show its share as a percentage.
  const totalSelectedAsset = selectedAssetType
    ? getAccountsByType(selectedAssetType).reduce((sum, acc) => sum + acc.balance_current, 0)
    : 0;

  const sortedAccounts = () => {

    if (!selectedAssetType) return [];

    // Copy the list before sorting so the original filtered data is not changed.
    const list = [...getAccountsByType(selectedAssetType)];

    if (sortOption === "balance") {
      return list.sort((a, b) => b.balance_current - a.balance_current);
    }

    if (sortOption === "alpha") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  };

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

   // Real estate store
  const properties = useRealEstateStore((state) => state.properties);
  const realEstateSummary = useRealEstateStore((state) => state.portfolioSummary);
  const isLoadingProperties = useRealEstateStore((state) => state.isLoading);
  const isRefreshingProperties = useRealEstateStore((state) => state.isRefreshing);
  const fetchProperties = useRealEstateStore((state) => state.fetchProperties);
  const addProperty = useRealEstateStore((state) => state.addProperty);
  const deleteProperty = useRealEstateStore((state) => state.deleteProperty);
  const refreshAllRealEstateData = useRealEstateStore((state) => state.refreshAllData);

   // --- Real Estate Handlers ---
  const handleAddProperty = useCallback(async (data: AddPropertyData) => {
    await addProperty(data);
  }, [addProperty]);

  const handlePropertyPress = useCallback((property: Property) => {
    setSelectedProperty((current) =>
      current?._id === property._id ? null : property
    );
  }, []);

  const handlePropertyLongPress = useCallback((property: Property) => {
    Alert.alert(
      property.name,
      realEstateService.formatAddress(property.address),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteProperty(property._id);
              if (selectedProperty?._id === property._id) {
                setSelectedProperty(null);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  }, [deleteProperty, selectedProperty]);

  const handleClosePropertyModal = useCallback(() => {
    setIsPropertyModalVisible(false);
  }, []);


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

  // Memoize property allocation to prevent infinite loop
  const propertyAllocation = useMemo(() => {
    return realEstateService.calculateAllocationByType(properties);
  }, [properties]);

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
            <Pressable
              onPress={() => handleTabChange("estate")}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: activeTab === "estate" ? "#fff" : "transparent",
              }}
            >
              <AppText
                className={`text-[14px] font-medium ${
                  activeTab === "estate" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Estate
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

      {/* Estate Tracker  Header */}
      {activeTab === "estate" && (
      <View className="flex-row items-center justify-between px-8">
        <View>
          <AppText className="text-gray-800 font-bold text-[28px]">Estate</AppText>
          <AppText className="text-gray-500 text-[14px]">Track your Estate portfolio</AppText>
        </View>
        
          <HapticButton onPressed={() => {setIsPropertyModalVisible(true)}}>
            <View className="w-10 h-10 bg-[#03BF62] rounded-full items-center justify-center shadow-sm">
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
          </HapticButton>
       </View>
      )}

    {/* Overview Tab Content */}
    <View style={{ display: activeTab === "overview" ? "flex" : "none" }}>

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 65 }}>
      <View style={{ padding: 20 }}>

        <Text style={styles.pageTitle}>Your Investments</Text>

        {/* Asset Allocation */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { textAlign: "center" }]}>
            Asset Allocation
          </Text>

          {assetBreakdown.length > 0 && (
            <View style={{ alignItems: "center", marginTop: 8 }}>

              <AssetPieChart
                data={assetBreakdown}
                size={pieChartSize}
                chartConfig={chartConfig}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
                contentContainerStyle={{ alignItems: "center", paddingHorizontal: 10 }}
              >
                {/* Tap a label to show the matching accounts below. */}
                {assetBreakdown.map((slice, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedAssetType(slice.type)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: slice.color,
                          marginRight: 6,
                        }}
                      />

                      <Text style={{ color: "#aaa", fontSize: 12 }}>
                        {slice.name}
                      </Text>

                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Top Assets */}
        <View style={styles.card}>

          <Text style={[styles.cardTitle, { textAlign: "center" }]}>
            Top 3 Assets
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>

            {/* Show the three largest asset groups as quick-select cards. */}
            {assetBreakdown.slice(0, 3).map((acc, i) => (

              <TouchableOpacity
                key={i}
                onPress={() => setSelectedAssetType(acc.type)}
                style={{
                  width: 120,
                  marginRight: 16,
                  backgroundColor: "#222",
                  borderRadius: 12,
                  padding: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >

                <Text style={{ color: "#fff", fontWeight: "600", marginBottom: 8 }}>
                  {acc.name}
                </Text>

                <View
                  style={{
                    height: 10,
                    width: "100%",
                    backgroundColor: "#333",
                    borderRadius: 5,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >

                  <View
                    style={{
                      height: "100%",
                      // Fill each bar based on the largest asset in this top-three list.
                      width: `${(acc.population / assetBreakdown[0].population) * 100}%`,
                      backgroundColor: acc.color,
                      borderRadius: 5,
                    }}
                  />

                </View>

                <Text style={{ color: "#aaa", fontSize: 12 }}>
                  ${acc.population.toFixed(2)} (
                  {(
                    (acc.population /
                      assetBreakdown.reduce((sum, a) => sum + a.population, 0)) *
                    100
                  ).toFixed(1)}
                  %)
                </Text>

              </TouchableOpacity>

            ))}

          </ScrollView>

          {selectedAssetType && (
            <View
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: "#333",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >

              {/* Let the user choose how the account list should be ordered. */}
              <Picker
                selectedValue={sortOption}
                onValueChange={(val) => setSortOption(val)}
                dropdownIconColor="#7ef714"
                style={{ color: "#fff" }}
              >

                <Picker.Item label="Sort by Balance" value="balance" />
                <Picker.Item label="Sort Alphabetically" value="alpha" />

              </Picker>

            </View>
          )}

          {/* Account Details */}

          {selectedAssetType && (
            <View
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#111",
                borderRadius: 12,
              }}
            >

              {/* Show every account inside the selected asset group. */}
              {sortedAccounts().map((acc, idx) => (

                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >

                  <Text style={{ color: "#fff" }}>
                    {acc.name}
                  </Text>

                  <Text style={{ color: "#aaa" }}>
                    ${acc.balance_current.toFixed(2)} (
                    {((acc.balance_current / totalSelectedAsset) * 100).toFixed(1)}%)
                  </Text>

                </View>

              ))}

            </View>
          )}


          </View>
          </View>
          </ScrollView>
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


      {/*Estate tracking Page*/}
      <View style={{ display: activeTab === "estate" ? "flex" : "none" }} 
      >
        <View style={{ padding: 10, width: "100%" }}>
        
          
            {/* Real Estate Portfolio Summary */}
            <RealEstatePortfolioCard summary={realEstateSummary} isLoading={isLoadingProperties} />

            {/* Property Type Chart */}
            <View style={{ marginTop: 24 }}>
              <PropertyTypeChart allocation={propertyAllocation} isLoading={isLoadingProperties} />
            </View>

            {/* Properties List */}
            <View style={{ marginTop: 24, width: "100%" }}>
              <HeadingWithElement heading="Properties" classNameHeader="pl-6 pr-6 mt-4 mb-2">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AppText style={{ color: "#6B7280", fontSize: 14, marginRight: 4 }}>
                    {properties.length} {properties.length === 1 ? "property" : "properties"}
                  </AppText>
                </View>
              </HeadingWithElement>

              <View style={realEstateStyles.listContainer}>
                {isLoadingProperties && properties.length === 0 ? (
                  <View style={realEstateStyles.loadingContainer}>
                    <View style={realEstateStyles.loadingCircle} />
                    <View style={realEstateStyles.loadingLine} />
                  </View>
                ) : properties.length > 0 ? (
                  properties.map((property, index) => (
                    <View key={property._id}>
                      <View
                        style={{
                          backgroundColor:
                            selectedProperty?._id === property._id
                              ? "rgba(3, 191, 98, 0.05)"
                              : "transparent",
                        }}
                      >
                        <PropertyItem
                          property={property}
                          index={index}
                          onPress={handlePropertyPress}
                          onLongPress={handlePropertyLongPress}
                        />
                      </View>
                      {index < properties.length - 1 && (
                        <View style={realEstateStyles.divider} />
                      )}

                    </View>
                    
                  ))
                ) : (
                  <View style={realEstateStyles.emptyContainer}>
                    <View style={realEstateStyles.emptyIconContainer}>
                      <Ionicons name="home-outline" size={28} color="#9CA3AF" />
                    </View>
                    <AppText style={realEstateStyles.emptyTitle}>
                      No properties yet
                    </AppText>
                    <AppText style={realEstateStyles.emptySubtitle}>
                      Tap + to add your first property
                    </AppText>
                  </View>
                )}
                
              </View>

            
            </View>


            {/* Real Estate Tips */}
            {properties.length > 0 && (
              <View style={{ marginTop: 24 }} >
                <View style={realEstateStyles.tipContainer}>
                  <View style={realEstateStyles.tipRow}>
                    <View style={realEstateStyles.tipIconContainer}>
                      <Ionicons name="information-circle" size={22} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={realEstateStyles.tipTitle}>
                        Track your real estate portfolio
                      </AppText>
                      <AppText style={realEstateStyles.tipSubtitle}>
                        Add properties, track equity, and monitor cash flow from rentals.
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
              
            )}
             {/* Real Estate Tips */}
              <View style={{ marginTop: 160 }}>
               
              </View>
              
            </View>
          
      </View>

      {/* Add Property Modal */}
      <AddPropertyModal
        visible={isPropertyModalVisible}
        onClose={handleClosePropertyModal}
        onAdd={handleAddProperty}
      />


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
});

const realEstateStyles = StyleSheet.create({
  listContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  loadingCircle: {
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    marginBottom: 12,
  },
  loadingLine: {
    width: 128,
    height: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    width: "100%",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#4B5563",
    fontWeight: "500",
    fontSize: 15,
  },
  emptySubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  tipContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 24,

    padding: 16,
    width: "100%",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipTitle: {
    color: "#065F46",
    fontWeight: "600",
    fontSize: 14,
  },
  tipSubtitle: {
    color: "#047857",
    fontSize: 13,
    marginTop: 4,
  },
});
