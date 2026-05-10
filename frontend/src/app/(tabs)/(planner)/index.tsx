import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

import useGoalsStore from "@/src/stores/useGoalsStore";
import useSummaryStore from "@/src/stores/useSummaryStore";
import useAuthStore from "@/src/stores/useAuthStore";
import { getInsights } from "@/src/api/insights";

const screenWidth = Dimensions.get("window").width;

const CATEGORIES = [
  "Groceries",
  "Dining",
  "Entertainment",
  "Transport",
  "Shopping",
  "Other",
];

const FinancialPlanner: React.FC = () => {
  const { user } = useAuthStore();

  const {
    weeklyGoal,
    isLoading: goalsLoading,
    createWeeklyGoal,
    fetchCurrentGoals,
  } = useGoalsStore();

  const {
    summary,
    isLoading: summaryLoading,
    fetchWeeklySummary,
  } = useSummaryStore();

  const [activeTab, setActiveTab] = useState<
    "goals" | "summary" | "insights" | "graph"
  >("goals");

  const [limits, setLimits] = useState<{ [key: string]: string }>({});
  const [isSettingGoals, setIsSettingGoals] = useState(true);

  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    fetchCurrentGoals(user._id);

    if (
      activeTab === "goals" ||
      activeTab === "summary" ||
      activeTab === "graph"
    ) {
      fetchWeeklySummary(user._id);
    }

    if (activeTab === "insights") {
      loadInsights();
    }
  }, [activeTab, user?._id]);

  useEffect(() => {
    if (weeklyGoal?._id) {
      setIsSettingGoals(false);
    }
  }, [weeklyGoal?._id]);

  const loadInsights = async () => {
    try {
      if (!user?._id) return;

      setInsightsLoading(true);

      const res = await getInsights(user._id);

      setInsights(res.data.insights);
    } catch (err) {
      console.error("Insights error:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const getGraphData = () => {
    if (!summary) return null;

    return {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [
            summary.thisWeek?.income || 0,
            summary.thisWeek?.expenses || 0,
          ],
        },
      ],
      legend: ["Income", "Expenses"],
    };
  };

  const handleSaveGoals = async () => {
    if (!user?._id) return;

    const goals = CATEGORIES.map((cat) => ({
      category: cat,
      limit: Number(limits[cat] || 0),
      spent: 0,
    })).filter((g) => g.limit > 0);

    if (goals.length === 0) {
      Alert.alert(
        "No goals set",
        "Please enter a limit for at least one category."
      );
      return;
    }

    const success = await createWeeklyGoal(user._id, goals);

    if (success) {
      setIsSettingGoals(false);
      Alert.alert("Success", "Weekly goals saved!");
    }
  };

  const categorySpending = summary?.thisWeek?.byCategory ?? {};

  const goalsWithTransactionSpending =
    weeklyGoal?.goals.map((goal) => ({
      ...goal,
      spent: Number(categorySpending[goal.category] ?? goal.spent ?? 0),
    })) ?? [];

  const totalTransactionSpending =
    summary?.thisWeek?.expenses ??
    goalsWithTransactionSpending.reduce(
      (sum, goal) => sum + goal.spent,
      0
    );

  const getProgressColor = (spent: number, limit: number) => {
    const ratio = spent / limit;

    if (ratio >= 1) return "#FF3B30";
    if (ratio >= 0.75) return "#FF9500";

    return "#03BF62";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.header}>Weekly Planner</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["goals", "summary", "insights", "graph"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GOALS TAB */}
      {activeTab === "goals" && (
        <>
          {isSettingGoals ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Set Your Weekly Limits
              </Text>

              {CATEGORIES.map((cat) => (
                <View key={cat} style={styles.row}>
                  <Text style={styles.categoryLabel}>{cat}</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="$0"
                    keyboardType="numeric"
                    value={limits[cat] || ""}
                    onChangeText={(val) =>
                      setLimits({ ...limits, [cat]: val })
                    }
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSaveGoals}
              >
                <Text style={styles.buttonText}>
                  {goalsLoading ? "Saving..." : "Save Goals"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  This Week's Progress
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    { marginBottom: 12 },
                  ]}
                >
                  Spending is calculated from this week's
                  transactions.
                </Text>

                {goalsWithTransactionSpending.map((goal) => (
                  <View
                    key={goal.category}
                    style={styles.goalRow}
                  >
                    <View style={styles.goalHeader}>
                      <Text style={styles.categoryLabel}>
                        {goal.category}
                      </Text>

                      <Text style={styles.goalAmount}>
                        ${goal.spent} / ${goal.limit}
                      </Text>
                    </View>

                    <View
                      style={styles.progressBarBackground}
                    >
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(
                              (goal.spent / goal.limit) * 100,
                              100
                            )}%`,
                            backgroundColor: getProgressColor(
                              goal.spent,
                              goal.limit
                            ),
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>

                  <Text style={styles.totalAmount}>
                    ${totalTransactionSpending} / $
                    {weeklyGoal?.totalLimit ?? 0}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={() => setIsSettingGoals(true)}
              >
                <Text style={styles.buttonText}>
                  Set New Goals
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <>
          {summaryLoading ? (
            <Text style={styles.loadingText}>
              Loading summary...
            </Text>
          ) : summary ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>This Week</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Income</Text>

                  <Text
                    style={[
                      styles.summaryValue,
                      styles.income,
                    ]}
                  >
                    +$
                    {summary.thisWeek.income.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Expenses
                  </Text>

                  <Text
                    style={[
                      styles.summaryValue,
                      styles.expense,
                    ]}
                  >
                    -$
                    {summary.thisWeek.expenses.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryRow,
                    styles.totalRow,
                  ]}
                >
                  <Text style={styles.totalLabel}>
                    Net Cash Flow
                  </Text>

                  <Text
                    style={[
                      styles.totalAmount,
                      summary.thisWeek.netCashFlow >= 0
                        ? styles.income
                        : styles.expense,
                    ]}
                  >
                    $
                    {summary.thisWeek.netCashFlow.toFixed(
                      2
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Spending by Category
                </Text>

                {Object.keys(
                  summary.thisWeek.byCategory || {}
                ).length === 0 ? (
                  <Text style={styles.loadingText}>
                    No categorized spending available.
                  </Text>
                ) : (
                  Object.entries(
                    summary.thisWeek.byCategory || {}
                  ).map(([category, amount]) => (
                    <View
                      key={category}
                      style={styles.summaryRow}
                    >
                      <Text
                        style={styles.categoryLabel}
                      >
                        {category}
                      </Text>

                      <Text
                        style={styles.summaryValue}
                      >
                        $
                        {Number(amount).toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Compared to Last Week
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Income Change
                  </Text>

                  <Text style={styles.summaryValue}>
                    {summary.comparison.incomeChange}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Expense Change
                  </Text>

                  <Text style={styles.summaryValue}>
                    {summary.comparison.expenseChange}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>
              No transaction data available yet.
            </Text>
          )}
        </>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === "insights" && (
        <>
          {insightsLoading ? (
            <Text style={styles.loadingText}>
              Analyzing your finances...
            </Text>
          ) : insights ? (
            <>
              <View
                style={[
                  styles.card,
                  { alignItems: "center" },
                ]}
              >
                <Text style={styles.cardTitle}>
                  📊 Financial Health
                </Text>

                {(() => {
                  const score = insights.score || 70;

                  const color =
                    score >= 75
                      ? "#03BF62"
                      : score >= 50
                      ? "#FF9500"
                      : "#FF3B30";

                  return (
                    <>
                      <Text
                        style={{
                          fontSize: 42,
                          fontWeight: "bold",
                          color,
                        }}
                      >
                        {score}
                      </Text>

                      <Text style={{ color: "#666" }}>
                        {score >= 75
                          ? "Strong"
                          : score >= 50
                          ? "Needs Improvement"
                          : "At Risk"}
                      </Text>
                    </>
                  );
                })()}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  📈 Trends
                </Text>

                <Text style={styles.summaryValue}>
                  {insights.trends}
                </Text>
              </View>

              <View
                style={[
                  styles.card,
                  { borderColor: "#FF3B30" },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: "#FF3B30" },
                  ]}
                >
                  ⚠️ Risks Detected
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    styles.expense,
                  ]}
                >
                  {insights.risks}
                </Text>
              </View>

              <View
                style={[
                  styles.card,
                  { borderColor: "#03BF62" },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: "#03BF62" },
                  ]}
                >
                  💰 Savings Opportunities
                </Text>

                <Text style={styles.summaryValue}>
                  {insights.savings_opportunities}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  ✅ Action Plan
                </Text>

                {insights.recommendations?.map(
                  (rec: string, i: number) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{ marginRight: 8 }}
                      >
                        👉
                      </Text>

                      <Text
                        style={{
                          flex: 1,
                          color: "#333",
                        }}
                      >
                        {rec}
                      </Text>
                    </View>
                  )
                )}
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={loadInsights}
              >
                <Text style={styles.buttonText}>
                  Refresh Insights
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loadingText}>
              No insights available.
            </Text>
          )}
        </>
      )}

      {/* GRAPH TAB */}
      {activeTab === "graph" && (
        <>
          {summaryLoading ? (
            <Text style={styles.loadingText}>
              Loading graph...
            </Text>
          ) : summary ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  💡 Spending Insight
                </Text>

                <Text style={styles.summaryValue}>
                  You spent{" "}
                  {(
                    ((summary.thisWeek?.expenses || 0) /
                      (summary.thisWeek?.income || 1)) *
                    100
                  ).toFixed(0)}
                  % of your income
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  📊 This Week: Income vs Expenses
                </Text>

                <BarChart
                  data={getGraphData()!}
                  width={screenWidth - 40}
                  height={220}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  fromZero
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: () => "#2b67ff",
                    labelColor: () => "#333",
                  }}
                  style={{ borderRadius: 8 }}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  🧾 Expense Breakdown
                </Text>

                {(() => {
                  const categories = Object.entries(
                    summary.thisWeek.byCategory || {}
                  );

                  const total = categories.reduce(
                    (sum, [, amount]) =>
                      sum + Number(amount),
                    0
                  );

                  return categories
                    .sort(
                      (a, b) =>
                        Number(b[1]) - Number(a[1])
                    )
                    .map(
                      ([category, amount], index) => {
                        const value = Number(amount);

                        const percentage =
                          total > 0
                            ? (value / total) * 100
                            : 0;

                        return (
                          <View
                            key={category}
                            style={styles.summaryRow}
                          >
                            <Text
                              style={
                                styles.categoryLabel
                              }
                            >
                              {index === 0 ? "1. " : ""}
                              {category}
                            </Text>

                            <Text
                              style={
                                styles.summaryValue
                              }
                            >
                              $
                              {value.toFixed(2)} (
                              {percentage.toFixed(0)}
                              %)
                            </Text>
                          </View>
                        );
                      }
                    );
                })()}
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>
              No data available.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default FinancialPlanner;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
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
});