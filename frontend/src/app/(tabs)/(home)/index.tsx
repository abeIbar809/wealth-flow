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
import { RefreshControl, ScrollView, View } from "react-native";
import ExpensePieChart from "@/src/components/ExpensePieChart";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Shows the morning briefing once per day using AsyncStorage to track the last shown date
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

  // Fires a light haptic tap then pulls fresh data from the server
  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshAllData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshAllData]);

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        className="bg-white"
        // Pull-to-refresh wired up to the haptic handler above
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0000ff"
            colors={["#0000ff"]}
          />
        }
      >
        <GroupedPageSection>
          <HeadingWithElement heading={"Dashboard"}>
            <View className="flex-row gap-3 items-center">

              {/* Sun button opens the morning briefing anytime, not just on first load */}
              <HapticButton onPressed={() => router.push("/(tabs)/(home)/MorningBriefing" as any)}>
                <Ionicons name="sunny-outline" size={30} color={"#2D2F43"} />
              </HapticButton>

              {/* Settings button placeholder, handler to be wired up later */}
              <HapticButton onPressed={() => { }}>
                <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
              </HapticButton>

            </View>
          </HeadingWithElement>

          {/* Main net worth display with assets, liabilities and percent change */}
          <NetWorthCardComponent
            isLoading={isNetworthLoading}
            balance={netWorthData?.networth}
            assets={netWorthData?.assets}
            currency={"$"}
            dept={netWorthData?.liabilities}
            percentChange={63}
            onLongPress={() => { }}
          />

          {/* Bar chart toggling between monthly and yearly net worth history */}
          <NetWorthBarChartComponent
            data={MockNetWorthGrowthData.multi_month}
            data2={MockNetWorthGrowthData.multi_year}
            isLoading={false}
          />
        </GroupedPageSection>

        <GroupedPageSection>
          <HeadingWithElement heading={"Accounts"}>
            {/* Plus button navigates to the add account flow */}
            <HapticButton onPressed={() => { router.push("/addAccountActionSheet"); }}>
              <Ionicons name="add-circle-outline" size={30} color={"#2D2F43"} />
            </HapticButton>
          </HeadingWithElement>

          {/* Horizontally scrollable account cards, tapping one opens manual transaction entry */}
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

        {/* Spacer keeps the pie chart from sitting flush against the accounts section */}
        <View className="h-[100] w-full" />
        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 24 }}>
          <ExpensePieChart />
        </View>
      </ScrollView>
    </>
  );
}