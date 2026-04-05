import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import useGoalsStore from "@/src/stores/useGoalsStore";
import useSummaryStore from "@/src/stores/useSummaryStore";
import useAuthStore from "@/src/stores/useAuthStore";

//format category names for display
const formatCategory = (category: string): string => {
  const formatted = category.replace(/_/g, ' ').toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const CATEGORY_COLORS = ["#2b67ff", "#03BF62", "#FF9500", "#FF3B30", "#8E44AD", "#16A085"];

const CATEGORIES = ["Groceries", "Dining", "Entertainment", "Transport", "Shopping", "Other"];

const FinancialPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { weeklyGoal, isLoading: goalsLoading, createWeeklyGoal, updateWeeklyGoal } = useGoalsStore();
  const { summary, isLoading: summaryLoading, fetchWeeklySummary } = useSummaryStore();

  const [activeTab, setActiveTab] = useState<"goals" | "summary">("goals");
  const [limits, setLimits] = useState<{ [key: string]: string }>({});
  const [spentAmounts, setSpentAmounts] = useState<{ [key: string]: string }>({});
  const [isSettingGoals, setIsSettingGoals] = useState(true);

  useEffect(() => {
    if (activeTab === "summary" && user?._id) {
      fetchWeeklySummary(user._id);
    }
  }, [activeTab]);

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

  //render donut chart
  const renderDonutChart = () => {
    if (!summary) return null;

    const categories = Object.entries(summary.thisWeek.byCategory);
    const total = summary.thisWeek.expenses;
    
    if (total === 0) return null;

    const radius = 70;
    const strokeWidth = 20;
    const center = 90;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = -90;

    return (
      <View style={styles.donutContainer}>
        <Svg width={180} height={180}>
          <G rotation={0} origin={`${center}, ${center}`}>
            {categories.map(([category, amount], index) => {
              const percentage = (amount / total) * 100;
              const angle = (percentage / 100) * 360;
              const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
              const rotation = currentAngle;
              
              currentAngle += angle;

              return (
                <Circle
                  key={category}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={dashArray}
                  strokeDashoffset={0}
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterAmount}>${total.toFixed(2)}</Text>
          <Text style={styles.donutCenterLabel}>Total</Text>
        </View>
        {/* Date Label Below Donut */}
        <Text style={styles.weekDateLabel}>
          As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Weekly Planner</Text>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "goals" && styles.activeTab]}
          onPress={() => setActiveTab("goals")}
        >
          <Text style={[styles.tabText, activeTab === "goals" && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "summary" && styles.activeTab]}
          onPress={() => setActiveTab("summary")}
        >
          <Text style={[styles.tabText, activeTab === "summary" && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* GOALS TAB */}
      {activeTab === "goals" && (
        <>
          {isSettingGoals ? (
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
                  {goalsLoading ? "Saving..." : "Save Goals"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                    {goalsLoading ? "Updating..." : "Update Spending"}
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
        </>
      )}

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <>
          {summaryLoading ? (
            <Text style={styles.loadingText}>Loading summary...</Text>
          ) : summary ? (
            <>
              {/* TOTAL SPENT - TOP CARD */}
              <View style={[styles.card, styles.totalSpentCard]}>
                <Text style={styles.totalSpentLabel}>Total Spent This Week</Text>
                <Text style={styles.totalSpentAmount}>
                  ${summary.thisWeek.expenses.toFixed(2)}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>This Week</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={[styles.summaryValue, styles.income]}>
                    +${summary.thisWeek.income.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={[styles.summaryValue, styles.expense]}>
                    -${summary.thisWeek.expenses.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Net Cash Flow</Text>
                  <Text style={[styles.totalAmount, summary.thisWeek.netCashFlow >= 0 ? styles.income : styles.expense]}>
                    ${summary.thisWeek.netCashFlow.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* SPENDING BY CATEGORY WITH DONUT CHART */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                
                {/* Donut Chart */}
                {renderDonutChart()}

                {/* Category Legend */}
                <View style={styles.legendContainer}>
                  {Object.entries(summary.thisWeek.byCategory).map(([category, amount], index) => (
                    <View key={category} style={styles.legendRow}>
                      <View 
                        style={[
                          styles.legendColor, 
                          { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }
                        ]} 
                      />
                      <Text style={styles.legendLabel}>{formatCategory(category)}</Text>
                      <Text style={styles.legendValue}>${amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Compared to Last Week</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Income Change</Text>
                  <Text style={styles.summaryValue}>{summary.comparison.incomeChange}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Expense Change</Text>
                  <Text style={styles.summaryValue}>{summary.comparison.expenseChange}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>No transaction data available yet.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default FinancialPlanner;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  scrollContent: {
    paddingBottom: 120
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 15 },
  tabContainer: { flexDirection: "row", marginBottom: 20, backgroundColor: "#e0e0e0", borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  activeTab: { backgroundColor: "#2b67ff" },
  tabText: { fontSize: 16, color: "#666", fontWeight: "500" },
  activeTabText: { color: "#fff" },
  card: { padding: 15, borderWidth: 1, borderColor: "#2b67ff", borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#2b67ff", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  categoryLabel: { fontSize: 15, color: "#333", flex: 1 },
  input: { borderWidth: 1, borderColor: "#2b67ff", borderRadius: 5, padding: 8, width: 80, textAlign: "center" },
  button: { backgroundColor: "#2b67ff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
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
  loadingText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  summaryLabel: { fontSize: 15, color: "#333" },
  summaryValue: { fontSize: 15, fontWeight: "500", color: "#333" },
  income: { color: "#03BF62" },
  expense: { color: "#FF3B30" },
  totalSpentCard: { 
    backgroundColor: "#2b67ff", 
    alignItems: "center", 
    paddingVertical: 20 
  },
  totalSpentLabel: { 
    fontSize: 14, 
    color: "#fff", 
    marginBottom: 5, 
    textTransform: "uppercase", 
    letterSpacing: 1 
  },
  totalSpentAmount: { 
    fontSize: 36, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    position: "relative"
  },
  donutCenter: {
    position: "absolute",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    top: 0
  },
  donutCenterAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  donutCenterLabel: {
    fontSize: 12,
    color: "#666"
  },
  weekDateLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 0,
    textAlign: "center"
  },
  legendContainer: {
    marginTop: 20
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333"
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333"
  }
});