import { AppText } from "@/src/components/common/app-text";
import useAuthStore, { AuthState } from "@/src/stores/useAuthStore";
import { useHomeStore } from "@/src/stores/useHomeStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { API } from "@/src/api/api";

type Debt = {
  _id: string;
  name: string;
  remainingAmount: number;
};

type Bill = {
  name: string;
  amount: string;
  date: string;
  completed: boolean;
};

export default function MorningBriefing() {
  const user       = useAuthStore((state: AuthState) => state.user);
  const { netWorthData, fetchAccounts } = useHomeStore();

  const [debts, setDebts]     = useState<Debt[]>([]);
  const [bills, setBills]     = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Loads debts and accounts on mount
  useEffect(() => {
    const load = async () => {
      try {
        await fetchAccounts();
        if (user?._id) {
          const res = await API.get(`/debts/${user._id}`);
          setDebts(res.data.filter((d: Debt) => d.remainingAmount > 0));
        }
      } catch (err) {
        console.error("Failed to load briefing data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalDebtRemaining = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

  // Bills due in the next 7 days
  const upcomingBills = bills.filter((b) => {
    if (b.completed) return false;
    const due  = new Date(b.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-[#03BF62] items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#03BF62]">
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 60 }}>

        {/* Greeting header */}
        <View className="mt-16 mb-8">
          <AppText type="normal" className="text-white opacity-80">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </AppText>
          <AppText type="title" className="text-white mt-1">
            {greeting()},{"\n"}{user?.name?.split(" ")[0]} 👋
          </AppText>
          <AppText type="normal" className="text-white opacity-80 mt-2">
            Here is your financial snapshot for today.
          </AppText>
        </View>

        {/* Net worth card */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <AppText type="normal" className="text-gray-500 mb-1">Net Worth</AppText>
          <AppText type="subtitle" className="text-[#03BF62]">
            ${netWorthData?.networth?.toLocaleString() ?? "0"}
          </AppText>
          <View className="flex-row gap-4 mt-3">
            <View>
              <AppText type="caption" className="text-gray-400">Assets</AppText>
              <AppText type="defaultSemiBold" className="text-gray-700">
                ${netWorthData?.assets?.toLocaleString() ?? "0"}
              </AppText>
            </View>
            <View>
              <AppText type="caption" className="text-gray-400">Liabilities</AppText>
              <AppText type="defaultSemiBold" className="text-red-500">
                ${netWorthData?.liabilities?.toLocaleString() ?? "0"}
              </AppText>
            </View>
          </View>
        </View>

        {/* Debts remaining card */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <AppText type="normal" className="text-gray-500 mb-3">Debts Remaining</AppText>
          {debts.length === 0 ? (
            <AppText type="normal" className="text-[#03BF62]">🎉 You have no active debts!</AppText>
          ) : (
            <>
              {debts.map((debt) => (
                <View key={debt._id} className="flex-row justify-between mb-2">
                  <AppText type="normal" className="text-gray-700">{debt.name}</AppText>
                  <AppText type="defaultSemiBold" className="text-red-500">
                    ${debt.remainingAmount.toFixed(2)}
                  </AppText>
                </View>
              ))}
              <View className="border-t border-gray-100 mt-2 pt-2 flex-row justify-between">
                <AppText type="defaultSemiBold" className="text-gray-700">Total</AppText>
                <AppText type="defaultSemiBold" className="text-red-500">
                  ${totalDebtRemaining.toFixed(2)}
                </AppText>
              </View>
            </>
          )}
        </View>

        {/* Upcoming bills card */}
        <View className="bg-white rounded-2xl p-5 mb-8">
          <AppText type="normal" className="text-gray-500 mb-3">Bills Due This Week</AppText>
          {upcomingBills.length === 0 ? (
            <AppText type="normal" className="text-[#03BF62]">✅ No bills due this week!</AppText>
          ) : (
            upcomingBills.map((bill, i) => (
              <View key={i} className="flex-row justify-between mb-2">
                <View>
                  <AppText type="normal" className="text-gray-700">{bill.name}</AppText>
                  <AppText type="caption" className="text-gray-400">Due {bill.date}</AppText>
                </View>
                <AppText type="defaultSemiBold" className="text-red-500">${bill.amount}</AppText>
              </View>
            ))
          )}
        </View>

        {/* Lets go button */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/(home)")}
          className="bg-white w-full py-4 rounded-2xl items-center"
        >
          <AppText type="defaultSemiBold" className="text-[#03BF62]">
            Let's Go 🚀
          </AppText>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}