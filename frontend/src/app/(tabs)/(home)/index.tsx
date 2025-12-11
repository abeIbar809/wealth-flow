import Ionicons from "@expo/vector-icons/Ionicons";
import React, {} from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";
import AccountCarouselComponent, { AccountCarouselData } from "@/src/modules/home/components/AccountCarousel";
import IncomeBarChartComponent from "@/src/modules/home/components/IncomeBarChar";
import NetWorthCardComponent from "@/src/modules/home/components/NetWorthCard";
import { StatusBar } from "expo-status-bar";


export default function HomeIndex() {
  const colorScheme = useColorScheme()
  return (
    <>
      <StatusBar style="auto" />
      <ScrollView
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        className={`${colorScheme === "light" ? "bg-white" : "bg-[#151517]"}`}
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
            currency={"USD"}
            dept={100000}
            percentChange={63}
            onLongPress={() => {}}
          />
        </GroupedPageSection>

        <GroupedPageSection>
          <HeadingWithElement heading="Income" />
          <IncomeBarChartComponent
            isLoading={false}
            data={[
              { value: 90, label: "M" },
              { value: 60, label: "T" },
              { value: 90, label: "W" },
              { value: 60, label: "T" },
              { value: 90, label: "F" },
              { value: 60, label: "S" },
              { value: 60, label: "S" },
            ]}
            onOneDayPressed={() => {}}
            onOneWeekPressed={() => {}}
            onOneMonthPressed={() => {}}
            onOneYearPressed={() => {}}
          />
        </GroupedPageSection>

        <GroupedPageSection>
          <HeadingWithElement heading={"Accounts"}>
            <HapticButton onPressed={() => {}}>
              <Ionicons name="add-circle-outline" size={30} color={"#2D2F43"} />
            </HapticButton>
          </HeadingWithElement>

          <AccountCarouselComponent
            data={[
              {
                name: "Chase",
                balance: 10000,
                tag: "LOAN",
                currency: "USD",
              },
              {
                name: "Ab savings",
                balance: 200000,
                tag: "SAVINGS",
                currency: "USD",
              },
              {
                name: "BTC wallet One",
                balance: 200000,
                tag: "CRYPTO",
                currency: "USD",
              },
              {
                name: "Main Chequing",
                balance: 200000,
                tag: "CHEQUING",
                currency: "USD",
              },
            ]}
          />
        </GroupedPageSection>
        <SizedBox />
      </ScrollView>
    </>
  );
}


function SizedBox(): React.JSX.Element {
  return (
    <>
      <View className="h-[100] w-full "></View>
    </>
  );
}
