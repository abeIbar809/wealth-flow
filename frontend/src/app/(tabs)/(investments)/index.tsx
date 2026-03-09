import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Account } from "./types/Account";
import { fetchAccounts } from "./services/plaidService";
import { calculateAssets } from "./utils/assetUtils";
import AssetPieChart from "./components/AssetPieChart";

// Screen measurements used to keep the chart sized nicely inside the card.
const screenWidth = Dimensions.get("window").width;
const cardContentWidth = screenWidth - 72;
const pieChartSize = Math.min(cardContentWidth - 12, 260);

export default function InvestmentsPage() {

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetBreakdown, setAssetBreakdown] = useState<any[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<"balance" | "alpha">("balance");

  // Temporary user id used to request this screen's data.
  const USER_ID = "69aabec9eec4a3c03ea8948f";

  // Fetch accounts when page loads
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    // Get the raw account list from the backend.
    const data = await fetchAccounts(USER_ID);

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

  return (
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