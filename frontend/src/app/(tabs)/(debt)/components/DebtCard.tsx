import { AppText } from "@/src/components/common/app-text";
import { useState } from "react";
import { View, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { PaymentFrequency } from "./AddDebtModel";

export type Debt = {
  _id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  paymentFrequency: PaymentFrequency;
  paymentAmount: number;
  extraPayments: number;
};

type Props = {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onExtraPayment: (id: string, amount: number) => void;
};

function getPaymentsPerYear(freq: PaymentFrequency): number {
  if (freq === "weekly")    return 52;
  if (freq === "bi-weekly") return 26;
  return 12;
}

function calcPayoffInfo(debt: Debt): { years: number; remainingMonths: number } | null {
  const { remainingAmount, paymentAmount, interestRate, paymentFrequency } = debt;
  if (remainingAmount <= 0) return null;

  const paymentsPerYear = getPaymentsPerYear(paymentFrequency);
  const ratePerPeriod   = interestRate > 0 ? (interestRate / 100) / paymentsPerYear : 0;

  let periods: number;
  if (ratePerPeriod === 0) {
    periods = remainingAmount / paymentAmount;
  } else {
    if (paymentAmount <= remainingAmount * ratePerPeriod) return null;
    periods = Math.log(paymentAmount / (paymentAmount - remainingAmount * ratePerPeriod)) / Math.log(1 + ratePerPeriod);
  }

  const totalMonths     = Math.ceil((periods / paymentsPerYear) * 12);
  const years           = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  return { years, remainingMonths };
}

export default function DebtCard({ debt, onEdit, onDelete, onExtraPayment }: Props) {
  const [expanded, setExpanded]             = useState(false);
  const [extraAmount, setExtraAmount]       = useState("");
  const [showExtraModal, setShowExtraModal] = useState(false);

  const isPaidOff  = debt.remainingAmount <= 0;
  const paidAmount = debt.totalAmount - debt.remainingAmount;
  const payoffInfo = calcPayoffInfo(debt);

  const pieData = [
    { value: Math.max(paidAmount, 0),           color: "#03BF62" },
    { value: Math.max(debt.remainingAmount, 0), color: "#E8F5E9" },
  ];

  const handleExtraPayment = () => {
    const amount = parseFloat(extraAmount);
    if (isNaN(amount) || amount <= 0)     { Alert.alert("Enter a valid amount.");          return; }
    if (amount > debt.remainingAmount)    { Alert.alert("Amount exceeds remaining debt."); return; }
    onExtraPayment(debt._id, amount);
    setExtraAmount("");
    setShowExtraModal(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Debt", `Are you sure you want to delete "${debt.name}"?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(debt._id) },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
      className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
    >
      {/* ── Paid off state ── */}
      {isPaidOff ? (
        <View className="items-center py-3">
          <AppText type="subtitle" className="text-[#03BF62]">🎉 Congratulations!</AppText>
          <AppText type="defaultSemiBold" className="text-gray-700 mt-1">{debt.name}</AppText>
          <AppText type="normal" className="text-gray-400 mt-1">This debt is fully paid off!</AppText>
        </View>
      ) : (
        /* ── Collapsed view ── */
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <AppText type="defaultSemiBold" className="text-gray-800">{debt.name}</AppText>
            <AppText type="normal" className="text-gray-500 mt-0.5">
              Remaining:{" "}
              <AppText type="defaultSemiBold" className="text-red-500">
                ${debt.remainingAmount.toFixed(2)}
              </AppText>
            </AppText>
            {payoffInfo ? (
              <AppText type="caption" className="text-gray-400 mt-0.5">
                Payoff in:{" "}
                {payoffInfo.years > 0 ? `${payoffInfo.years}y ` : ""}
                {payoffInfo.remainingMonths}mo
              </AppText>
            ) : (
              <AppText type="caption" className="text-red-400 mt-0.5">
                ⚠️ Payment too low to cover interest
              </AppText>
            )}
          </View>

          <View className="items-center ml-3">
            <PieChart
              data={pieData}
              radius={30}
              innerRadius={20}
              donut
              strokeWidth={0}
            />
            <AppText type="caption" className="text-gray-400 mt-1">
              {((paidAmount / debt.totalAmount) * 100).toFixed(0)}% paid
            </AppText>
          </View>

          <AppText type="normal" className="text-gray-400 ml-2">
            {expanded ? "▲" : "▼"}
          </AppText>
        </View>
      )}

      {/* ── Expanded view ── */}
      {expanded && !isPaidOff && (
        <View className="mt-4 border-t border-gray-100 pt-4">

          {/* Details */}
          <View className="bg-[#F4F6FA] rounded-xl p-3 mb-3">
            <View className="flex-row justify-between mb-1">
              <AppText type="normal" className="text-gray-500">Original Debt</AppText>
              <AppText type="defaultSemiBold" className="text-gray-800">${debt.totalAmount.toFixed(2)}</AppText>
            </View>
            <View className="flex-row justify-between mb-1">
              <AppText type="normal" className="text-gray-500">Current Amount</AppText>
              <AppText type="defaultSemiBold" className="text-red-500">${debt.remainingAmount.toFixed(2)}</AppText>
            </View>
            <View className="flex-row justify-between mb-1">
              <AppText type="normal" className="text-gray-500">Amount Paid</AppText>
              <AppText type="defaultSemiBold" className="text-[#03BF62]">${paidAmount.toFixed(2)}</AppText>
            </View>
            <View className="flex-row justify-between mb-1">
              <AppText type="normal" className="text-gray-500">Interest Rate</AppText>
              <AppText type="defaultSemiBold" className="text-gray-800">{debt.interestRate}% / yr</AppText>
            </View>
            <View className="flex-row justify-between mb-1">
              <AppText type="normal" className="text-gray-500">Payment</AppText>
              <AppText type="defaultSemiBold" className="text-gray-800">
                ${debt.paymentAmount} / {debt.paymentFrequency}
              </AppText>
            </View>
            {debt.extraPayments > 0 && (
              <View className="flex-row justify-between">
                <AppText type="normal" className="text-gray-500">Extra Paid</AppText>
                <AppText type="defaultSemiBold" className="text-[#03BF62]">${debt.extraPayments.toFixed(2)}</AppText>
              </View>
            )}
          </View>

          {/* Payoff estimate */}
          {payoffInfo && (
            <View className="bg-green-50 rounded-xl p-3 mb-3 border border-green-100">
              <AppText type="normal" className="text-green-700">
                📅 Estimated payoff:{" "}
                {payoffInfo.years > 0 ? `${payoffInfo.years} year${payoffInfo.years > 1 ? "s" : ""} ` : ""}
                {payoffInfo.remainingMonths > 0
                  ? `${payoffInfo.remainingMonths} month${payoffInfo.remainingMonths > 1 ? "s" : ""}`
                  : ""}
              </AppText>
            </View>
          )}

          {/* Action buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowExtraModal(true)}
              className="flex-1 bg-[#03BF62] py-2.5 rounded-xl items-center"
            >
              <AppText type="normal" className="text-white">💸 Extra Payment</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onEdit(debt)}
              className="flex-1 bg-blue-50 border border-blue-200 py-2.5 rounded-xl items-center"
            >
              <AppText type="normal" className="text-blue-600">✏️ Edit</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl items-center"
            >
              <AppText type="normal" className="text-red-500">🗑️</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Extra Payment Modal ── */}
      <Modal
        visible={showExtraModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExtraModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <AppText type="subtitle" className="text-[#03BF62] mb-2">💸 Extra Payment</AppText>
            <AppText type="normal" className="text-gray-500 mb-1">
              Remaining: ${debt.remainingAmount.toFixed(2)}
            </AppText>
            <AppText type="normal" className="text-gray-400 mb-4">
              This won't affect your scheduled payments.
            </AppText>
            <TextInput
              placeholder="Enter amount..."
              value={extraAmount}
              onChangeText={setExtraAmount}
              keyboardType="numeric"
              className="bg-[#F4F6FA] rounded-xl px-3 h-11 mb-4"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowExtraModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-2xl items-center"
              >
                <AppText type="defaultSemiBold" className="text-gray-600">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExtraPayment}
                className="flex-1 bg-[#03BF62] py-3 rounded-2xl items-center"
              >
                <AppText type="defaultSemiBold" className="text-white">Pay Now</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}