import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";
import { MockNetWorthGrowthData } from "@/src/mock";
import AccountCarouselComponent from "@/src/modules/home/components/accounts/AccountCarousel";
import NetWorthCardComponent from "@/src/modules/home/components/dashboard/NetWorthCard";
import NetWorthBarChartComponent from "@/src/modules/home/components/dashboard/NetWorthGrowthBarChar";
import { useHomeStore } from "@/src/stores/useHomeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ExpensePieChart from "@/src/components/ExpensePieChart";
import CurrencyConverterCard from "@/src/components/common/currency-converter-card";

export default function HomeIndex() {
  const { accounts, fetchAccounts } = useHomeStore();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          className="bg-white"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: tabBarHeight + insets.bottom + 32,
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {}}
              tintColor="#0000ff"
              colors={["#0000ff"]}
            />
          }
        >
          <GroupedPageSection>
            <HeadingWithElement heading={"Dashboard"}>
              <HapticButton onPressed={() => {}}>
                <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
              </HapticButton>
            </HeadingWithElement>

            <NetWorthCardComponent
              isLoading={false}
              balance={200000}
              currency={"$"}
              dept={100000}
              percentChange={63}
              onLongPress={() => {}}
            />

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

          <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 24 }}>
            <ExpensePieChart />
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <CurrencyConverterCard />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}