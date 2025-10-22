import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState, useCallback,useRef,useMemo } from "react";
import { ColorSchemeName, RefreshControl, ScrollView, useColorScheme,View,StyleSheet,Text } from "react-native";

import GroupedPageSection from "@/src/components/common/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/common/layout/heading-with-element";
import ElementButton from "@/src/components/common/navigation/element-button";
import AccountCarouselComponent, { AccountCarouselData } from "@/src/components/home/AccountCarousel";
import CardBalanceComponent from "@/src/components/home/CardBalance";
import IncomeBarChartComponent from "@/src/components/home/IncomeBarChar";
import { barDataItem } from "react-native-gifted-charts";
import Animated, { FadeIn } from "react-native-reanimated";

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";


const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

interface IUseFetchNetWorth {
  balance: number;
  dept: number;
  refetch: () => Promise<void>;
  isLoading: boolean;
  error: boolean;
}

function useFetchNetWorth(): IUseFetchNetWorth {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState(0);
  const [dept, setDept] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    setBalance(10000);
    setDept(-1000);
  };

  const refetch = async () => {
    await fetchData();
  };
  return { balance, dept, refetch, isLoading, error };
}

enum TimeFrame { Day, Week, Month,Year }

interface IUseFetchBarChartData {
  barData: barDataItem[];
  changeTimeFrame: (timeFrameIn: TimeFrame) => void;
  isLoading: Boolean;
  refetch: () => Promise<void>;
}

function useFetchBarChartData(timeFrameIn: TimeFrame): IUseFetchBarChartData {
  const [timeFrame, setTimeFrame] = useState(timeFrameIn);
  const [barData, setBarData] = useState<barDataItem[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    fetchBarData(timeFrame);
  }, [timeFrame]);

  const fetchBarData = async (timeFrameIn: TimeFrame) => {
    switch (timeFrameIn) {
      case TimeFrame.Day: await fetchDayData(); 
      break;
      case TimeFrame.Week: await fetchWeekData(); 
      break;
      case TimeFrame.Month: await fetchMonthData();
      break;
      case TimeFrame.Year: await fetchYearData();
     break;
    }
  };

  const fetchDayData = async () => { 
    setBarData([
      { value: 100, label: "4" },
      { value: 200, label: "8" },
      { value: 100, label: "12" },
      { value: 200, label: "16" },
      { value: 100, label: "20" },
      { value: 200, label: "24" },
    ]);
  }

  const fetchWeekData = async () => { 
    setBarData([
      { value: 90, label: "M" },
      { value: 60, label: "T" },
      { value: 90, label: "W" },
      { value: 60, label: "T" },
      { value: 90, label: "F" },
      { value: 60, label: "S" },
      { value: 60, label: "S" },
    ]);
  }

  const fetchMonthData = async () => { 
    setBarData([
      { value: 90, label: "J" },
      { value: 60, label: "F" },
      { value: 90, label: "M" },
      { value: 60, label: "A" },
      { value: 90, label: "M" },
      { value: 60, label: "J" },
      { value: 90, label: "J" },
      { value: 60, label: "A" },
      { value: 90, label: "S" },
      { value: 60, label: "O" },
      { value: 90, label: "N" },
      { value: 60, label: "D" },
    ]);
  }

  const fetchYearData = async () => { 
    setBarData([
      { value: 90, label: "2020" },
      { value: 60, label: "2021" },
      { value: 90, label: "2022" },
      { value: 60, label: "2023" },
      { value: 90, label: "2025" },
    ]);
  }

  const refetch = async () => {
    await fetchBarData(timeFrame);
  };

  const changeTimeFrame = (timeFrameIn: TimeFrame) => {
    setTimeFrame(timeFrameIn);
    refetch();
  };

  return { barData, changeTimeFrame, isLoading, refetch };
}

interface IUseHomeModel {
  refreshHome: () => Promise<void>;
  isHomeLoading: boolean;
  onSettingsPressed: () => void;
  onAddAccountPressed: () => void;
  useIFetchBarChartData: IUseFetchBarChartData;
  useIFetchNetWorth: IUseFetchNetWorth;
  useIFetchFinancialAccounts: IUseFetchFinancialAccounts
}



enum FinacialAccountType { Bank,Investment,Crypto,RealEstate }



interface UserFinacialAccount {
  isManualAccount:Boolean
  accountID: string
  accountType:String
  accountName:String
  value:Number
  tag:String
  insitutionName?:String
  limit?: number
  balance?: number
}

interface IUseFetchFinancialAccounts {
  userFinancialAccounts?:UserFinacialAccount[] 
  refetch: () => Promise<void>
  isLoading: boolean
}

const demoAccounts:UserFinacialAccount[] = [
  {
        isManualAccount: true,
        accountID: "101111",
        accountType: "Loan",
        accountName: "Loan One",
        insitutionName: "Chase",
        value: 10000,
        tag: "LOAN"
      },
      {
        isManualAccount: false,
        accountType: "Savings",
        accountID: "10101",
        insitutionName: "Bank of America",
        accountName: "Ab savings",
        value: 200000,
        tag: "SAVINGS"
      },
      {
        isManualAccount: false,
        accountType: "Crypto",
        accountID: "101010",
        insitutionName: undefined,
        accountName: "BTC wallet One",
        value: 200000,
        tag: "CRYPTO"
      },
      {
        isManualAccount: false,
        accountType: "Chequing",
        accountID: "101010",
        insitutionName: "Bank of America",
        accountName: "Main Chequing",
        value: 200000,
        tag: "CHEQUING"
      },
]

function useFetchFinancialAccounts() : IUseFetchFinancialAccounts { 
  const [userFinancialAccounts, setUserFinancialAccounts] = useState<UserFinacialAccount[]>()
  const [isLoading,setLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => { 
    setLoading(true)
    setUserFinancialAccounts(demoAccounts)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }

  const refetch = async () => { 
    await fetchAccounts()
  }

  return {userFinancialAccounts, refetch, isLoading }
}



function useHomeModel(): IUseHomeModel {
  const useIFetchNetWorth = useFetchNetWorth();
  const useIFetchBarChartData = useFetchBarChartData(TimeFrame.Day);
  const useIFetchFinancialAccounts = useFetchFinancialAccounts();
  const [isHomeLoading, setHomeLoading] = useState(false);
  const router = useRouter()

  const refreshHome = async () => {
    setHomeLoading(true)
    await useIFetchBarChartData.refetch()
    await useIFetchNetWorth.refetch()
    setTimeout(() => {
      setHomeLoading(false)
    }, 2000);
  };

  const onSettingsPressed = () => {
    router.push("/home/addAccount")
  };

  const onAddAccountPressed = () => {

  };

  return { 
    refreshHome,
    isHomeLoading,
    useIFetchNetWorth,
    useIFetchBarChartData,
    useIFetchFinancialAccounts, 
    onSettingsPressed,
    onAddAccountPressed, 
  };
}



export default function Home() {
  const useIHomeModel:IUseHomeModel = useHomeModel();
  const colorScheme:ColorSchemeName = useColorScheme();
  return (
    <>
      <ScrollView
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        className={`${colorScheme === "light" ? "bg-white" : "bg-black"}`}
        refreshControl={
          <RefreshControl
            refreshing={useIHomeModel.isHomeLoading}
            onRefresh={useIHomeModel.refreshHome}
            tintColor="#0000ff"
            colors={["#0000ff"]}
          />}
        >
        <GroupedPageSection>
          <HeadingWithElement heading={"Dashboard"}>
            <ElementButton onPressed={useIHomeModel.onSettingsPressed}>
              <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
            </ElementButton>
          </HeadingWithElement>
          <CardBalanceComponent
            isLoading={useIHomeModel.useIFetchNetWorth.isLoading}
            balance={useIHomeModel.useIFetchNetWorth.balance}
            currency={"USD"}
            dept={useIHomeModel.useIFetchNetWorth.dept}
            percentChange={63}/>
        </GroupedPageSection>

        <GroupedPageSection>
          <HeadingWithElement heading="Income" />
          <IncomeBarChartComponent
            data={useIHomeModel.useIFetchBarChartData.barData}
            onOneDayPressed={() => useIHomeModel.useIFetchBarChartData.changeTimeFrame(TimeFrame.Day)}
            onOneWeekPressed={() => useIHomeModel.useIFetchBarChartData.changeTimeFrame(TimeFrame.Week)}
            onOneMonthPressed={() => useIHomeModel.useIFetchBarChartData.changeTimeFrame(TimeFrame.Month)}
            onOneYearPressed={() => useIHomeModel.useIFetchBarChartData.changeTimeFrame(TimeFrame.Year)}
          />
        </GroupedPageSection>

         
        
          <GroupedPageSection>
            <HeadingWithElement heading={"Accounts"}>
              <ElementButton onPressed={useIHomeModel.onAddAccountPressed}>
                <Ionicons
                  name="add-circle-outline"
                  size={30}
                  color={"#2D2F43"}
                />
              </ElementButton>
            </HeadingWithElement>
            <AccountCarouselComponent data={
              useIHomeModel.useIFetchFinancialAccounts.userFinancialAccounts === undefined ? [] :
              useIHomeModel.useIFetchFinancialAccounts.userFinancialAccounts.map((account:UserFinacialAccount) => {
                 return {
                   tag: account.tag,
                   balance: account.value,
                   name: account.accountName,
                   currency: "USD"
                 } as AccountCarouselData
              })
            } />
          </GroupedPageSection>
         <SizedBox/>
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
