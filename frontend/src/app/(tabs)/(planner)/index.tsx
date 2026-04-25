import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Picker } from "@react-native-picker/picker";
import useGoalsStore from "@/src/stores/useGoalsStore";
import useSummaryStore from "@/src/stores/useSummaryStore";
import useAuthStore from "@/src/stores/useAuthStore";
import useTaxStore from "@/src/stores/useTaxStore";
import useTransactionStore from "@/src/stores/useTransactionStore";
import { useHomeStore } from "@/src/stores/useHomeStore";

//format numbers with commas and 2 decimal places
const formatCurrency = (num: number): string => {
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

//format category names for display
const formatCategory = (category: string): string => {
  const formatted = category.replace(/_/g, ' ').toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

//returns ISO date strings for a named date range
const getDateRange = (range: string): { startDate?: string; endDate?: string } => {
  const now = new Date();
  if (range === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  if (range === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (range === "last_3_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  return {};
};

const CATEGORY_COLORS = ["#2b67ff", "#03BF62", "#FF9500", "#FF3B30", "#8E44AD", "#16A085"];

const CATEGORIES = ["Groceries", "Dining", "Entertainment", "Transport", "Shopping", "Other"];

const FILING_STATUSES = ["Single", "Married Filing Jointly", "Head of Household"];

const TRANSACTION_CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Food & Drink", value: "FOOD_AND_DRINK" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "General Merchandise", value: "GENERAL_MERCHANDISE" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Income", value: "INCOME" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "Travel", value: "TRAVEL" },
  { label: "Medical", value: "MEDICAL" },
  { label: "Personal Care", value: "PERSONAL_CARE" },
  { label: "Home Improvement", value: "HOME_IMPROVEMENT" },
  { label: "Utilities", value: "UTILITIES" },
];

const DATE_RANGES = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "All Time", value: "all_time" },
];

const FinancialPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { weeklyGoal, isLoading: goalsLoading, createWeeklyGoal, updateWeeklyGoal, syncFromPlaid } = useGoalsStore();
  const { summary, isLoading: summaryLoading, fetchWeeklySummary } = useSummaryStore();
  const { taxResult, isLoading: taxLoading, error: taxError, calculateTax } = useTaxStore();
  const { transactions, isLoading: txnLoading, searchTransactions } = useTransactionStore();
  const { accounts, fetchAccounts } = useHomeStore();

  const [activeTab, setActiveTab] = useState<"transactions" | "goals" | "summary" | "taxes">("transactions");
  const [filingStatus, setFilingStatus] = useState("Single");
  const [incomeInput, setIncomeInput] = useState("");
  const [limits, setLimits] = useState<{ [key: string]: string }>({});
  const [spentAmounts, setSpentAmounts] = useState<{ [key: string]: string }>({});
  const [isSettingGoals, setIsSettingGoals] = useState(true);

  //transaction filter state
  const [merchantSearch, setMerchantSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateRange, setDateRange] = useState("this_month");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!user?._id) return;
    setIsRefreshing(true);
    const dateFilters = getDateRange(dateRange);
    await searchTransactions(user._id, {
      accountId: selectedAccount || undefined,
      category: selectedCategory || undefined,
      merchantName: merchantSearch || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
      ...dateFilters,
    });
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (activeTab === "summary" && user?._id) {
      fetchWeeklySummary(user._id);
    }
    if (activeTab === "transactions" && user?._id) {
      if (accounts.length === 0) fetchAccounts();
      setVisibleCount(10);
      searchTransactions(user._id, getDateRange("this_month"));
    }
  }, [activeTab]);

  const handleApplyFilters = () => {
    if (!user?._id) return;
    setVisibleCount(10);
    const dateFilters = getDateRange(dateRange);
    searchTransactions(user._id, {
      accountId: selectedAccount || undefined,
      category: selectedCategory || undefined,
      merchantName: merchantSearch || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
      ...dateFilters,
    });
  };

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

  const handleSyncFromPlaid = async () => {
    if (!user?._id) return;
    const success = await syncFromPlaid(user._id);
    if (success) {
      Alert.alert("Synced", "Spending updated from your bank transactions.");
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

  const handleCalculateTax = async () => {
    if (!user?._id) return;
    await calculateTax(user._id, filingStatus, Number(incomeInput || 0));
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        activeTab === "transactions" ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#2b67ff" />
        ) : undefined
      }
    >
      <Text style={styles.header}>Financial Planner</Text>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text style={[styles.tabText, activeTab === "transactions" && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.tab, activeTab === "taxes" && styles.activeTab]}
          onPress={() => setActiveTab("taxes")}
        >
          <Text style={[styles.tabText, activeTab === "taxes" && styles.activeTabText]}>
            Taxes
          </Text>
        </TouchableOpacity>
      </View>

      {/* TRANSACTIONS TAB */}
      {activeTab === "transactions" && (
        <>
          {/* Search + filter toggle row */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search merchant or name..."
              value={merchantSearch}
              onChangeText={setMerchantSearch}
              returnKeyType="search"
              onSubmitEditing={handleApplyFilters}
            />
            <TouchableOpacity
              style={styles.filterToggleBtn}
              onPress={() => setShowFilters((v) => !v)}
            >
              <Text style={styles.filterToggleText}>
                {showFilters ? "Filters ▲" : "Filters ▼"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible filters */}
          {showFilters && (
            <View style={styles.card}>
              <Text style={styles.filterLabel}>Account</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedAccount}
                  onValueChange={(val) => setSelectedAccount(val)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Accounts" value="" />
                  {[...new Map(accounts.map((a) => [a._id, a])).values()].map((acc) => (
                    <Picker.Item key={acc._id} label={acc.name} value={acc._id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val)}
                  style={styles.picker}
                >
                  {TRANSACTION_CATEGORIES.map((cat) => (
                    <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dateRange}
                  onValueChange={(val) => setDateRange(val)}
                  style={styles.picker}
                >
                  {DATE_RANGES.map((dr) => (
                    <Picker.Item key={dr.value} label={dr.label} value={dr.value} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterLabel}>Amount Range</Text>
              <View style={styles.amountRangeRow}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="Min $"
                  keyboardType="numeric"
                  value={minAmount}
                  onChangeText={setMinAmount}
                />
                <Text style={styles.amountRangeSep}>–</Text>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="Max $"
                  keyboardType="numeric"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                />
              </View>

              <TouchableOpacity style={[styles.button, { marginTop: 14 }]} onPress={handleApplyFilters}>
                <Text style={styles.buttonText}>
                  {txnLoading ? "Loading..." : "Apply Filters"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Transaction list */}
          {txnLoading ? (
            <Text style={styles.loadingText}>Loading transactions...</Text>
          ) : transactions.length === 0 ? (
            <Text style={styles.loadingText}>No transactions found</Text>
          ) : (
            <>
              {transactions.slice(0, visibleCount).map((txn) => (
                <View key={txn._id} style={styles.txnCard}>
                  <View style={styles.txnTopRow}>
                    <Text style={styles.txnMerchant} numberOfLines={1}>
                      {txn.merchant_name || txn.name}
                    </Text>
                    <Text
                      style={[
                        styles.txnAmount,
                        txn.transaction_type === "income" ? styles.income : styles.expense,
                      ]}
                    >
                      {txn.transaction_type === "income" ? "+" : "-"}$
                      {formatCurrency(Math.abs(txn.amount))}
                    </Text>
                  </View>
                  <View style={styles.txnBottomRow}>
                    <Text style={styles.txnMeta}>
                      {txn.personal_finance_category?.primary
                        ? formatCategory(txn.personal_finance_category.primary)
                        : "Uncategorized"}
                    </Text>
                    <Text style={styles.txnMeta}>
                      {new Date(txn.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  {txn.account && (
                    <Text style={styles.txnAccount}>{txn.account.name}</Text>
                  )}
                </View>
              ))}
              {visibleCount < transactions.length && (
                <View style={styles.loadMoreRow}>
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={() => setVisibleCount((c) => c + 10)}
                  >
                    <Text style={styles.loadMoreText}>
                      Load 10 More ({transactions.length - visibleCount} remaining)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.showAllBtn}
                    onPress={() => setVisibleCount(transactions.length)}
                  >
                    <Text style={styles.showAllText}>Show All</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.txnCountLabel}>
                Showing {Math.min(visibleCount, transactions.length)} of {transactions.length} transactions
              </Text>
            </>
          )}
        </>
      )}

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
                style={[styles.button, styles.syncButton]}
                onPress={handleSyncFromPlaid}
              >
                <Text style={styles.buttonText}>
                  {goalsLoading ? "Syncing..." : "Sync from Bank"}
                </Text>
              </TouchableOpacity>

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
      {/* TAXES TAB */}
      {activeTab === "taxes" && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Filing Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filingStatus}
                onValueChange={(value) => setFilingStatus(value)}
                style={styles.picker}
              >
                {FILING_STATUSES.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Yearly Income</Text>
            <TextInput
              style={styles.incomeInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={incomeInput}
              onChangeText={setIncomeInput}
            />
<TouchableOpacity style={styles.button} onPress={handleCalculateTax}>
              <Text style={styles.buttonText}>
                {taxLoading ? "Calculating..." : "Calculate Tax Estimate"}
              </Text>
            </TouchableOpacity>
          </View>

          {taxError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{taxError}</Text>
            </View>
          ) : null}

          {taxResult ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tax Estimate Results</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Yearly Income</Text>
                <Text style={styles.summaryValue}>${formatCurrency(taxResult.yearlyIncome)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Standard Deduction</Text>
                <Text style={styles.summaryValue}>-${formatCurrency(taxResult.deductions)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxable Income</Text>
                <Text style={styles.summaryValue}>${formatCurrency(taxResult.taxableIncome)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Estimated Tax</Text>
                <Text style={[styles.totalAmount, styles.expense]}>${formatCurrency(taxResult.estimatedTax)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Effective Rate</Text>
                <Text style={styles.summaryValue}>{taxResult.effectiveRate.toFixed(1)}%</Text>
              </View>
            </View>
          ) : null}
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
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTab: { backgroundColor: "#2b67ff" },
  tabText: { fontSize: 12, color: "#666", fontWeight: "500" },
  activeTabText: { color: "#fff" },
  card: { padding: 15, borderWidth: 1, borderColor: "#2b67ff", borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#2b67ff", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  categoryLabel: { fontSize: 15, color: "#333", flex: 1 },
  input: { borderWidth: 1, borderColor: "#2b67ff", borderRadius: 5, padding: 8, width: 80, textAlign: "center" },
  button: { backgroundColor: "#2b67ff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  resetButton: { backgroundColor: "#666", marginBottom: 20 },
  syncButton: { backgroundColor: "#03BF62", marginBottom: 10 },
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
  },
  filingStatusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  filingStatusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2b67ff",
  },
  filingStatusBtnActive: {
    backgroundColor: "#2b67ff",
  },
  filingStatusText: {
    fontSize: 14,
    color: "#2b67ff",
  },
  filingStatusTextActive: {
    color: "#fff",
  },
  errorCard: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#FF3B30",
    marginBottom: 15,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
  incomeHint: {
    fontSize: 13,
    color: "#888",
    marginBottom: 10,
  },
  incomeInput: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  importButton: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  importButtonText: {
    color: "#2b67ff",
    fontWeight: "600",
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    color: "#333",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  filterToggleBtn: {
    borderWidth: 1,
    borderColor: "#2b67ff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  filterToggleText: {
    color: "#2b67ff",
    fontWeight: "600",
    fontSize: 13,
  },
  filterLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  amountRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountInput: {
    flex: 1,
    width: undefined,
  },
  amountRangeSep: {
    fontSize: 16,
    color: "#666",
  },
  txnCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e8ff",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  txnTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  txnBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txnMerchant: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  txnMeta: {
    fontSize: 13,
    color: "#888",
  },
  txnAccount: {
    fontSize: 12,
    color: "#2b67ff",
    marginTop: 4,
  },
  loadMoreRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  loadMoreBtn: {
    flex: 2,
    backgroundColor: "#2b67ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  showAllBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2b67ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  showAllText: {
    color: "#2b67ff",
    fontWeight: "600",
    fontSize: 13,
  },
  txnCountLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
});