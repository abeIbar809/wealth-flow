import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const FinancialPlanner: React.FC = () => {
  const [budget, setBudget] = useState<string>(""); 
  const [savedBudget, setSavedBudget] = useState<number | null>(null); 

  const handleSaveBudget = () => {
    const numericBudget = Number(budget);
    if (!budget || isNaN(numericBudget)) {
      Alert.alert("Invalid input", "Please enter a valid number.");
      return;
    }
    setSavedBudget(numericBudget);
    setBudget(""); 
  };

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [500, 450, 600, 550, 700, 650],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(43, 103, 255, ${opacity})`,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Financial Planner</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Budget</Text>
        {savedBudget !== null && (
          <Text style={styles.savedBudget}>Your current budget: ${savedBudget}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Enter your budget"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />
        <Button title="Save" onPress={handleSaveBudget} color="#2b67ff" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Financial Insights</Text>
        <Text style={styles.insight}>
          Based on your spending patterns and income, you are likely to overspend on dining out this month. Consider setting a limit of $350.
        </Text>

        <Text style={[styles.cardTitle, { marginTop: 15 }]}>Spending Trends</Text>
        <LineChart
          data={data}
          width={screenWidth - 60}
          height={180}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(43, 103, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 8 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#2b67ff" },
          }}
          style={{ marginVertical: 8, borderRadius: 8 }}
        />
      </View>
    </ScrollView>
  );
};

export default FinancialPlanner;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 20 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#2b67ff" },
  input: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  savedBudget: { fontSize: 16, fontWeight: "500", marginVertical: 5 },
  insight: { fontSize: 14, marginTop: 5, color: "#333" },
});


