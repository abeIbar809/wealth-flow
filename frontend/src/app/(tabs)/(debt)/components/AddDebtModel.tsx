import { AppText } from "@/src/components/common/app-text";
import { useState, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

export type PaymentFrequency = "weekly" | "bi-weekly" | "monthly";

export type DebtInput = {
  name: string;
  totalAmount: number;
  interestRate: number;
  paymentFrequency: PaymentFrequency;
  paymentAmount: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (debt: DebtInput) => void;
  initial?: DebtInput | null;
};

const FREQUENCIES: { label: string; value: PaymentFrequency }[] = [
  { label: "Weekly",    value: "weekly"    },
  { label: "Bi-Weekly", value: "bi-weekly" },
  { label: "Monthly",   value: "monthly"   },
];

export default function AddDebtModal({ visible, onClose, onSubmit, initial }: Props) {
  const [name, setName]                   = useState(initial?.name ?? "");
  const [totalAmount, setTotalAmount]     = useState(initial?.totalAmount?.toString() ?? "");
  const [interestRate, setInterestRate]   = useState(initial?.interestRate?.toString() ?? "");
  const [frequency, setFrequency]         = useState<PaymentFrequency>(initial?.paymentFrequency ?? "monthly");
  const [paymentAmount, setPaymentAmount] = useState(initial?.paymentAmount?.toString() ?? "");

  // Pre-fills the form when editing an existing debt
  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setTotalAmount(initial.totalAmount.toString());
      setInterestRate(initial.interestRate?.toString() ?? "");
      setFrequency(initial.paymentFrequency);
      setPaymentAmount(initial.paymentAmount.toString());
    }
  }, [initial]);

  // Validates inputs before sending them up to the parent
  const handleSubmit = () => {
    if (!name.trim() || !totalAmount || !paymentAmount) {
      Alert.alert("Please fill in all required fields.");
      return;
    }
    const total    = parseFloat(totalAmount);
    const payment  = parseFloat(paymentAmount);
    const interest = parseFloat(interestRate) || 0;

    if (isNaN(total)   || total <= 0)   { Alert.alert("Enter a valid total amount.");   return; }
    if (isNaN(payment) || payment <= 0) { Alert.alert("Enter a valid payment amount."); return; }

    onSubmit({ name: name.trim(), totalAmount: total, interestRate: interest, paymentFrequency: frequency, paymentAmount: payment });
    resetForm();
  };

  const resetForm = () => {
    setName(""); setTotalAmount(""); setInterestRate(""); setFrequency("monthly"); setPaymentAmount("");
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppText type="subtitle" className="text-[#03BF62] mb-5">
              {initial ? "Edit Debt" : "Add New Debt"}
            </AppText>

            <AppText type="defaultSemiBold" className="text-gray-700 mb-1">Debt Name *</AppText>
            <TextInput
              placeholder="e.g. Car Loan, Credit Card..."
              value={name}
              onChangeText={setName}
              className="bg-[#F4F6FA] rounded-xl px-3 h-11 mb-4"
            />

            <AppText type="defaultSemiBold" className="text-gray-700 mb-1">Total Amount Owed *</AppText>
            <TextInput
              placeholder="e.g. 5000"
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="numeric"
              className="bg-[#F4F6FA] rounded-xl px-3 h-11 mb-4"
            />

            <AppText type="defaultSemiBold" className="text-gray-700 mb-1">Interest Rate (% per year)</AppText>
            <TextInput
              placeholder="e.g. 5.5 (leave blank if none)"
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
              className="bg-[#F4F6FA] rounded-xl px-3 h-11 mb-4"
            />

            {/* Chip buttons to pick how often payments are made */}
            <AppText type="defaultSemiBold" className="text-gray-700 mb-2">Payment Frequency *</AppText>
            <View className="flex-row gap-2 mb-4">
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFrequency(f.value)}
                  className={`flex-1 py-2 rounded-full border items-center ${
                    frequency === f.value
                      ? "bg-[#03BF62] border-[#03BF62]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <AppText type="normal" className={frequency === f.value ? "text-white" : "text-gray-600"}>
                    {f.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            <AppText type="defaultSemiBold" className="text-gray-700 mb-1">Payment Amount *</AppText>
            <TextInput
              placeholder="e.g. 200"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              className="bg-[#F4F6FA] rounded-xl px-3 h-11 mb-6"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 bg-gray-200 py-3 rounded-2xl items-center"
              >
                <AppText type="defaultSemiBold" className="text-gray-600">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 bg-[#03BF62] py-3 rounded-2xl items-center"
              >
                <AppText type="defaultSemiBold" className="text-white">
                  {initial ? "Save Changes" : "Add Debt"}
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}