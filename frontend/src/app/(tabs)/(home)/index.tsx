import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";
import { MockAccounts, MockNetWorthGrowthData } from "@/src/mock";
import AccountCarouselComponent from "@/src/modules/home/components/accounts/AccountCarousel";
import NetWorthCardComponent from "@/src/modules/home/components/dashboard/NetWorthCard";
import NetWorthBarChartComponent from "@/src/modules/home/components/dashboard/NetWorthGrowthBarChar";
import { useHomeStore } from "@/src/stores/useHomeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import * as Haptics from "expo-haptics";
export default function HomeIndex() {

  const {
    accounts,
    fetchAccounts,
    netWorthData,
    isLoadingAccounts,
    refreshAllData,
    isRefreshing,
    isNetworthLoading,
  } = useHomeStore()

  useEffect(() => {
    // fetch accounts on mount
    fetchAccounts()
  }, [])

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Sync data from Plaid and refresh
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
            <HapticButton onPressed={() => { }}>
              <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
            </HapticButton>
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
          <NetWorthBarChartComponent
            data={MockNetWorthGrowthData.multi_month}
            data2={MockNetWorthGrowthData.multi_year}
            isLoading={false}
          >
          </NetWorthBarChartComponent>
        </GroupedPageSection>
        <GroupedPageSection>
          <HeadingWithElement heading={"Accounts"}>
            <HapticButton onPressed={() => { router.push("/addAccountActionSheet") }}>
              <Ionicons name="add-circle-outline" size={30} color={"#2D2F43"} />
            </HapticButton>
          </HeadingWithElement>
          <AccountCarouselComponent data={accounts} />
        </GroupedPageSection>
        <View className="h-[100] w-full "></View>
      </ScrollView>
    </>
  );
}