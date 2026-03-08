import ScreenWrapper from "@/src/components/layout/screen-wrapper";
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
import { router } from "expo-router";
import accountsService from "@/src/services/AccountService";
import { useHomeStore } from "@/src/stores/useHomeStore";
import { AppText } from "@/src/components/common/app-text";

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

export default function AddManualAccountPopup() {
  const fetchAccounts = useHomeStore((s) => s.fetchAccounts);

  // Only what the user knows
  const [institutionName, setInstitutionName] = useState("");

  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("checking"); // keep simple; you can swap to dropdown later
  const [balanceCurrent, setBalanceCurrent] = useState("0");
  const [currency, setCurrency] = useState("USD");

  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return (
      institutionName.trim().length > 0 &&
      accountName.trim().length > 0 &&
      accountType.trim().length > 0 &&
      balanceCurrent.trim().length > 0
    );
  }, [institutionName, accountName, accountType, balanceCurrent]);

  const onSubmit = async () => {
    if (!isValid) {
      Alert.alert("Missing info", "Please fill all required fields.");
      return;
    }

    const parsedBalance = Number(balanceCurrent);
    if (Number.isNaN(parsedBalance)) {
      Alert.alert("Invalid balance", "Balance must be a number.");
      return;
    }

    try {
      setSubmitting(true);

      await accountsService.createManualBank({
        institution_name: institutionName.trim(),
        accounts: [
          {
            name: accountName.trim(),
            type: accountType.trim() as any,
            balance_current: parsedBalance,
            currency: currency.trim() || "USD",
          },
        ],
      } as any);

      await fetchAccounts(); // reload same data Home uses
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? e?.message ?? "Failed to add bank");
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
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <AppText style={{ fontSize: 20, marginBottom: 12 }}>
              Add bank manually
            </AppText>

            <AppText style={{ marginBottom: 8, opacity: 0.7 }}>Bank</AppText>
            <Field
              label="Bank name"
              value={institutionName}
              onChangeText={setInstitutionName}
              placeholder="e.g. Chase"
            />

            <AppText style={{ marginBottom: 8, opacity: 0.7 }}>Account</AppText>
            <Field
              label="Account name"
              value={accountName}
              onChangeText={setAccountName}
              placeholder="e.g. Checking"
            />
            <Field
              label="Account type"
              value={accountType}
              onChangeText={setAccountType}
              placeholder="checking"
            />
            <Field
              label="Current balance"
              value={balanceCurrent}
              onChangeText={setBalanceCurrent}
              placeholder="0"
              keyboardType="numeric"
            />
            <Field
              label="Currency"
              value={currency}
              onChangeText={setCurrency}
              placeholder="USD"
            />
          </ScrollView>

          {/* Sticky footer so the submit is always visible */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 40,
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