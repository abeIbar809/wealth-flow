import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import useGoalsStore from "@/src/stores/useGoalsStore";
import useAuthStore from "@/src/stores/useAuthStore";

const CATEGORIES = ["Groceries", "Dining", "Entertainment", "Transport", "Shopping", "Other"];

const FinancialPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { weeklyGoal, isLoading, createWeeklyGoal, updateWeeklyGoal } = useGoalsStore();

  const [limits, setLimits] = useState<{ [key: string]: string }>({});
  const [spentAmounts, setSpentAmounts] = useState<{ [key: string]: string }>({});
  const [isSettingGoals, setIsSettingGoals] = useState(true);

  const handleSaveGoals = async () => {
    const goals = CATEGORIES.map((cat) => ({
      category: cat,
      limit: Number(limits[cat] || 0),
      spent: 0,
    })).filter((g) => g.limit > 0);

    if (goals.length === 0) {
      Alert.alert("No goals set", "Please enter a limit for at least one category.");
      return;
    }

    const success = await createWeeklyGoal(user._id, goals);
    if (success) {
      setIsSettingGoals(false);
      Alert.alert("Success", "Weekly goals saved!");
    }
  };

  const handleUpdateSpending = async () => {
    if (!weeklyGoal?._id) return;

    const updatedGoals = weeklyGoal.goals.map((g) => ({
      ...g,
      spent: g.spent + Number(spentAmounts[g.category] || 0),
    }));

    const success = await updateWeeklyGoal(weeklyGoal._id, updatedGoals);
    if (success) {
      setSpentAmounts({});
      Alert.alert("Success", "Spending updated!");
    }
  };

  const getProgressColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1) return "#FF3B30";
    if (ratio >= 0.75) return "#FF9500";
    return "#03BF62";
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Weekly Goals</Text>

      {isSettingGoals ? (
        // SET GOALS VIEW
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Set Your Weekly Limits</Text>
          {CATEGORIES.map((cat) => (
            <View key={cat} style={styles.row}>
              <Text style={styles.categoryLabel}>{cat}</Text>
              <TextInput
                style={styles.input}
                placeholder="$0"
                keyboardType="numeric"
                value={limits[cat] || ""}
                onChangeText={(val) => setLimits({ ...limits, [cat]: val })}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={handleSaveGoals}>
            <Text style={styles.buttonText}>
              {isLoading ? "Saving..." : "Save Goals"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // TRACK SPENDING VIEW
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Week's Progress</Text>
            {weeklyGoal?.goals.map((goal) => (
              <View key={goal.category} style={styles.goalRow}>
                <View style={styles.goalHeader}>
                  <Text style={styles.categoryLabel}>{goal.category}</Text>
                  <Text style={styles.goalAmount}>
                    ${goal.spent} / ${goal.limit}
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min((goal.spent / goal.limit) * 100, 100)}%`,
                        backgroundColor: getProgressColor(goal.spent, goal.limit),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                ${weeklyGoal?.totalSpent} / ${weeklyGoal?.totalLimit}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log Spending</Text>
            {weeklyGoal?.goals.map((goal) => (
              <View key={goal.category} style={styles.row}>
                <Text style={styles.categoryLabel}>{goal.category}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$0"
                  keyboardType="numeric"
                  value={spentAmounts[goal.category] || ""}
                  onChangeText={(val) =>
                    setSpentAmounts({ ...spentAmounts, [goal.category]: val })
                  }
                />
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={handleUpdateSpending}>
              <Text style={styles.buttonText}>
                {isLoading ? "Updating..." : "Update Spending"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => setIsSettingGoals(true)}
          >
            <Text style={styles.buttonText}>Set New Goals</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default FinancialPlanner;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 20 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#2b67ff", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  categoryLabel: { fontSize: 15, color: "#333", flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2b67ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  resetButton: { backgroundColor: "#666", marginBottom: 20 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  goalRow: { marginVertical: 8 },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  goalAmount: { fontSize: 14, color: "#666" },
  progressBarBackground: { height: 10, backgroundColor: "#eee", borderRadius: 5 },
  progressBarFill: { height: 10, borderRadius: 5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalAmount: { fontSize: 16, fontWeight: "bold", color: "#2b67ff" },
});