import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";
import { MockNetWorthGrowthData } from "@/src/mock";
import AccountCarouselComponent from "@/src/modules/home/components/accounts/AccountCarousel";
import NetWorthCardComponent from "@/src/modules/home/components/dashboard/NetWorthCard";
import NetWorthBarChartComponent from "@/src/modules/home/components/dashboard/NetWorthGrowthBarChar";
import { useHomeStore } from "@/src/stores/useHomeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useCallback } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import ExpensePieChart from "@/src/components/ExpensePieChart";
<<<<<<< HEAD
import { AppText } from "@/src/components/common/app-text";
=======
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

>>>>>>> origin/main
export default function HomeIndex() {

  const {
    accounts,
    fetchAccounts,
    netWorthData,
    isLoadingAccounts,
    refreshAllData,
    isRefreshing,
    isNetworthLoading,
  } = useHomeStore();

  // Fetch accounts when the screen first loads
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Shows the morning briefing once per day
  useEffect(() => {
    const checkBriefing = async () => {
      const today     = new Date().toDateString();
      const lastShown = await AsyncStorage.getItem("lastBriefingDate");
      if (lastShown !== today) {
        await AsyncStorage.setItem("lastBriefingDate", today);
        router.push("/(tabs)/(home)/MorningBriefing" as any);
      }
    };
    checkBriefing();
  }, []);

  const handleRefresh = useCallback(async () => {
<<<<<<< HEAD
=======
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
>>>>>>> origin/main
    try {
      await refreshAllData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshAllData]);

  const handleCreditScorePress = async () => {
    router.push("/creditScoreSheet");
  };

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        className="bg-white"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() =>  {}}
            tintColor="#0000ff"
            colors={["#0000ff"]}
          />
        }
      >
        <GroupedPageSection>
          <HeadingWithElement heading={"Dashboard"}>
            <View className="flex-row gap-3 items-center">

              {/* Sun button opens the morning briefing anytime */}
              <HapticButton onPressed={() => router.push("/(tabs)/(home)/MorningBriefing" as any)}>
                <Ionicons name="sunny-outline" size={30} color={"#2D2F43"} />
              </HapticButton>

              <HapticButton onPressed={() => { }}>
                <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
              </HapticButton>

            </View>
          </HeadingWithElement>
          <NetWorthCardComponent
            isLoading={isNetworthLoading}
            balance={netWorthData?.networth}
            assets={netWorthData?.assets}
            currency={"$"}
            dept={netWorthData?.liabilities}
            percentChange={63}
            onLongPress={() => { }}
          />

          {/* Credit Score Card */}

          <TouchableOpacity className="w-5/6 h-30 my-3 bg-[#1F2937] rounded-lg p-3" onPress={handleCreditScorePress} >
              <View className=" w-12 h-12 bg-white/20 rounded-xl items-center justify-center ">
                <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              </View>
              <View className="w-full h-16">
                <AppText className="text-white font-semibold text-[16px]">Credit Health</AppText>
                <AppText className="text-white/70 text-[13px]">
                  Check your credit score & insights
                </AppText>
              </View>
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </View>
          </TouchableOpacity>

          <NetWorthBarChartComponent
            data={MockNetWorthGrowthData.multi_month}
            data2={MockNetWorthGrowthData.multi_year}
            isLoading={false}
          />
        </GroupedPageSection>

        <GroupedPageSection>
          <HeadingWithElement heading={"Accounts"}>
            <HapticButton onPressed={() => { router.push("/addAccountActionSheet"); }}>
              <Ionicons name="add-circle-outline" size={30} color={"#2D2F43"} />
            </HapticButton>
          </HeadingWithElement>
          <AccountCarouselComponent
            data={accounts}
            isLoading={false}
            onAccountPress={(acct) => {
              router.push({
                pathname: "/addManualTransactionPopup",
                params: { accountId: acct._id, accountName: acct.name },
              });
            }}
          />
        </GroupedPageSection>

        <View className="h-[100] w-full" />
        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 24 }}>
          <ExpensePieChart />
        </View>
      </ScrollView>
    </>
  );
}