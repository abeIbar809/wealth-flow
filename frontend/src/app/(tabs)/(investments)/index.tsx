import React, { useState } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function InvestmentsPage() {
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

  return (
    <ScrollView style={styles.container}>
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
