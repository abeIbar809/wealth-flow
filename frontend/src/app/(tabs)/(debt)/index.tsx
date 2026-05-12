import { AppText } from "@/src/components/common/app-text";
import useAuthStore, { AuthState } from "@/src/stores/useAuthStore";
import useTaxStore from "@/src/stores/useTaxStore";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AddDebtModal, { DebtInput } from "./components/AddDebtModel";
import DebtCard, { Debt } from "./components/DebtCard";
import { API } from "@/src/api/api";

const FILING_STATUSES = ["Single", "Married Filing Jointly", "Head of Household"];

const formatCurrency = (num: number): string => {
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export default function DebtScreen() {
  const user                              = useAuthStore((state: AuthState) => state.user);
  const [debts, setDebts]                 = useState<Debt[]>([]);
  const [loading, setLoading]             = useState(true);
  const [modalVisible, setModalVisible]   = useState(false);
  const [editingDebt, setEditingDebt]     = useState<Debt | null>(null);
  const [activeTab, setActiveTab]         = useState<"debt" | "taxes">("debt");
  const [filingStatus, setFilingStatus]   = useState("Single");
  const [incomeInput, setIncomeInput]     = useState("");

  const { taxResult, isLoading: taxLoading, error: taxError, calculateTax } = useTaxStore();

  const loadDebts = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res    = await API.get(`/debts/${user._id}`);
      const sorted = [...res.data].sort((a: Debt, b: Debt) => b.totalAmount - a.totalAmount);
      setDebts(sorted);
    } catch (err) {
      console.error("Failed to load debts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDebts(); }, []);

  const handleAddDebt = async (input: DebtInput) => {
    try {
      await API.post("/debts", {
        ...input,
        userId: user._id,
        remainingAmount: input.totalAmount,
        extraPayments: 0,
      });
      setModalVisible(false);
      loadDebts();
    } catch (err) {
      console.error("Failed to add debt:", err);
    }
  };

  const handleEditDebt = async (input: DebtInput) => {
    if (!editingDebt) return;
    try {
      await API.patch(`/debts/${editingDebt._id}`, input);
      setEditingDebt(null);
      setModalVisible(false);
      loadDebts();
    } catch (err) {
      console.error("Failed to edit debt:", err);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await API.delete(`/debts/${id}`);
      loadDebts();
    } catch (err) {
      console.error("Failed to delete debt:", err);
    }
  };

  const handleExtraPayment = async (id: string, amount: number) => {
    try {
      await API.post(`/debts/${id}/payment`, { amount });
      loadDebts();
    } catch (err) {
      console.error("Failed to make payment:", err);
    }
  };

  const handleCalculateTax = async () => {
    if (!user?._id) return;
    await calculateTax(user._id, filingStatus, Number(incomeInput || 0));
  };

  const openEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setModalVisible(true);
  };

  const openAdd = () => {
    setEditingDebt(null);
    setModalVisible(true);
  };

  const hasDebts = debts.length > 0;

  return (
    <View className="flex-1 bg-[#F4F6FA] px-5 pt-5">

      {/* Tab bar */}
      <View style={styles.tabContainer}>
        {(["debt", "taxes"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === "debt" ? "Debt Payoff" : "Tax Estimator"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DEBT TAB */}
      {activeTab === "debt" && (
        <>
          <View className="flex-row justify-between items-center mb-5">
            <AppText type="subtitle">Debt Payoff</AppText>
            <TouchableOpacity
              onPress={openAdd}
              className="bg-[#03BF62] w-10 h-10 rounded-full items-center justify-center"
            >
              <AppText type="subtitle" className="text-white">+</AppText>
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color="#03BF62" />}

          {!loading && !hasDebts && (
            <View className="flex-1 items-center justify-center pb-20">
              <AppText type="subtitle" className="text-gray-400 text-center mb-2">
                Add My Debts to Payoff
              </AppText>
              <AppText type="normal" className="text-gray-400 text-center mb-6">
                Track and simulate your debt payoff journey
              </AppText>
              <TouchableOpacity
                onPress={openAdd}
                className="bg-[#03BF62] w-16 h-16 rounded-full items-center justify-center"
              >
                <AppText type="title" className="text-white">+</AppText>
              </TouchableOpacity>
            </View>
          )}

          {!loading && hasDebts && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              <TouchableOpacity
                onPress={openAdd}
                className="flex-row items-center mb-5 gap-2"
              >
                <View className="bg-[#03BF62] w-8 h-8 rounded-full items-center justify-center">
                  <AppText type="defaultSemiBold" className="text-white">+</AppText>
                </View>
                <AppText type="normal" className="text-[#03BF62]">Add another Debt to Payoff</AppText>
              </TouchableOpacity>

              {debts.map((debt) => (
                <DebtCard
                  key={debt._id}
                  debt={debt}
                  onEdit={openEdit}
                  onDelete={handleDeleteDebt}
                  onExtraPayment={handleExtraPayment}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* TAXES TAB */}
      {activeTab === "taxes" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="mb-5">
            <AppText type="subtitle">Tax Estimator</AppText>
          </View>

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
        </ScrollView>
      )}

      <AddDebtModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingDebt(null); }}
        onSubmit={editingDebt ? handleEditDebt : handleAddDebt}
        initial={editingDebt ? {
          name:             editingDebt.name,
          totalAmount:      editingDebt.totalAmount,
          interestRate:     editingDebt.interestRate,
          paymentFrequency: editingDebt.paymentFrequency,
          paymentAmount:    editingDebt.paymentAmount,
        } : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer:    { flexDirection: "row", marginBottom: 16, backgroundColor: "#e0e0e0", borderRadius: 8, padding: 4 },
  tab:             { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTab:       { backgroundColor: "#03BF62" },
  tabText:         { fontSize: 13, color: "#666", fontWeight: "500" },
  activeTabText:   { color: "#fff" },
  card:            { padding: 15, borderWidth: 1, borderColor: "#2b67ff", borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  cardTitle:       { fontSize: 18, fontWeight: "600", color: "#2b67ff", marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: "#2b67ff", borderRadius: 8, overflow: "hidden" },
  picker:          { color: "#333" },
  incomeInput:     { borderWidth: 1, borderColor: "#2b67ff", borderRadius: 5, padding: 10, fontSize: 18, textAlign: "center", marginBottom: 10 },
  button:          { backgroundColor: "#2b67ff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText:      { color: "#fff", fontWeight: "600", fontSize: 16 },
  errorCard:       { padding: 15, borderRadius: 8, backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#FF3B30", marginBottom: 15 },
  errorText:       { color: "#FF3B30", fontSize: 14, textAlign: "center" },
  summaryRow:      { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  summaryLabel:    { fontSize: 15, color: "#333" },
  summaryValue:    { fontSize: 15, fontWeight: "500", color: "#333" },
  totalRow:        { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  totalLabel:      { fontSize: 16, fontWeight: "bold" },
  totalAmount:     { fontSize: 16, fontWeight: "bold", color: "#2b67ff" },
  expense:         { color: "#FF3B30" },
});
