import ScreenWrapper from "@/src/components/layout/screen-wrapper";
import { AppText } from "@/src/components/common/app-text";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { transactionService } from "@/src/services/TransactionService";

const PLAID_PRIMARY_CATEGORIES = [
  { label: "Food & Drink", value: "FOOD_AND_DRINK" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "General Merchandise", value: "GENERAL_MERCHANDISE" },
  { label: "Rent & Utilities", value: "RENT_AND_UTILITIES" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Travel", value: "TRAVEL" },
  { label: "Transfer In", value: "TRANSFER_IN" },
  { label: "Transfer Out", value: "TRANSFER_OUT" },
];

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) => (
  <View style={{ marginBottom: 12 }}>
    <AppText style={{ marginBottom: 6, opacity: 0.8 }}>{label}</AppText>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType ?? "default"}
      autoCapitalize="none"
      style={{
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    />
  </View>
);

export default function AddManualTransactionPopup() {
  const { accountId, accountName } = useLocalSearchParams<{
    accountId: string;
    accountName?: string;
  }>();
  const [selectedCategory, setSelectedCategory] = useState<string>("FOOD_AND_DRINK");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // keep simple: YYYY-MM-DD
  const [type, setType] = useState<"expense" | "income" | "transfer" | "other">("expense");
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return !!accountId && name.trim().length > 0 && amount.trim().length > 0 && date.trim().length > 0;
  }, [accountId, name, amount, date]);

  const onSubmit = async () => {
    if (!isValid) {
      Alert.alert("Missing info", "Please fill out name, amount, and date.");
      return;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      Alert.alert("Invalid amount", "Amount must be a number.");
      return;
    }

    // Convert YYYY-MM-DD -> ISO; backend can accept either, but ISO is safest
    const isoDate = new Date(date).toISOString();

    const selectedLabel = PLAID_PRIMARY_CATEGORIES.find(c => c.value === selectedCategory)?.label ?? "Other";
    try {
      setSubmitting(true);

      await transactionService.createManualTransaction({
        accountId,
        name: name.trim(),
        amount: parsedAmount,
        date: isoDate,
        transaction_type: type,
        personal_finance_category: {
            primary: selectedCategory,
            detailed: selectedCategory,
            confidence_level: "HIGH",
        },
        category: [selectedLabel],
      });

      // Go back; your transactions/pie chart should refetch or update accordingly
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? e?.message ?? "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
            <AppText style={{ fontSize: 20, marginBottom: 6 }}>Add transaction</AppText>
            {!!accountName && (
              <AppText style={{ marginBottom: 12, opacity: 0.7 }}>
                For: {accountName}
              </AppText>
            )}

            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Starbucks" />
            <Field label="Amount" value={amount} onChangeText={setAmount} placeholder="12.34" keyboardType="numeric" />
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-03-07" />

            <AppText style={{ marginBottom: 6, opacity: 0.8 }}>Type</AppText>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {(["expense", "income", "transfer", "other"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: type === t ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.15)",
                  }}
                >
                  <AppText>{t}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            <AppText style={{ marginBottom: 6, opacity: 0.8 }}>
                Category
            </AppText>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {PLAID_PRIMARY_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.value}
                        onPress={() => setSelectedCategory(cat.value)}
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor:
                            selectedCategory === cat.value
                                ? "rgba(0,0,0,0.7)"
                                : "rgba(0,0,0,0.15)",
                        }}
                    >
                    <AppText>{cat.label}</AppText>
                </TouchableOpacity>
                ))}
            </View>
          </ScrollView>

          {/* sticky footer */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 25, // 👈 adjust if tab bar overlaps (you already did this pattern)
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "rgba(0,0,0,0.08)",
              backgroundColor: "white",
            }}
          >
            <TouchableOpacity
              onPress={onSubmit}
              disabled={!isValid || submitting}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                opacity: !isValid || submitting ? 0.5 : 1,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.2)",
              }}
            >
              <AppText>{submitting ? "Saving..." : "Save"}</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={submitting}
              style={{ marginTop: 10, paddingVertical: 10, alignItems: "center" }}
            >
              <AppText style={{ opacity: 0.7 }}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}