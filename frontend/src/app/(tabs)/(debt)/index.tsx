import { AppText } from "@/src/components/common/app-text";
import useAuthStore, { AuthState } from "@/src/stores/useAuthStore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import AddDebtModal, { DebtInput } from "./components/AddDebtModel";
import DebtCard, { Debt } from "./components/DebtCard";
import { API } from "@/src/api/api";

export default function DebtScreen() {
  const user                              = useAuthStore((state: AuthState) => state.user);
  const [debts, setDebts]                 = useState<Debt[]>([]);
  const [loading, setLoading]             = useState(true);
  const [modalVisible, setModalVisible]   = useState(false);
  const [editingDebt, setEditingDebt]     = useState<Debt | null>(null);

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

      {/* Header */}
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

      {/* Empty state */}
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

      {/* Debt list */}
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