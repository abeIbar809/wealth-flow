import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import { ColorSchemeName, RefreshControl, ScrollView, useColorScheme, View } from "react-native";

import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import HapticButton from "@/src/components/navigation/haptic-button";
import AccountCarouselComponent, { AccountCarouselData } from "@/src/modules/home/components/AccountCarousel";
import IncomeBarChartComponent from "@/src/modules/home/components/IncomeBarChar";
import { barDataItem } from "react-native-gifted-charts";

import NetWorthCardComponent from "@/src/modules/home/components/NetWorthCard";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {create, StoreApi, UseBoundStore} from "zustand"
import { store } from "expo-router/build/global-state/router-store";
import { StatusBar } from "expo-status-bar";


const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

interface NetWorthState {
  balance: number;
  dept: number;
  isLoading: boolean;
  error: boolean;
}

interface NetWorthAction { 
  fetch: () => Promise<void>;
}

const useNetWorthStore = create<NetWorthState & NetWorthAction>((set,get) => ({
  balance: 0,
  dept: 0,
  isLoading: false,
  error: false,

  fetch: async () => {
    set({isLoading: true})
    setTimeout(() => {
      set({balance: 200000,dept:100,isLoading:false})
    }, 5000);
  },
}));


enum TimeFrame { Day, Week, Month,Year }

interface IUseIncomeDataStore {
  barData: Map<TimeFrame,barDataItem[]>;
  isLoading: boolean;
  timeFrame: TimeFrame,
  inloadCount?: number
  changeTimeFrame: (timeFrameIn: TimeFrame) => void;
  refetch: () => Promise<void>;
  fetch: () => Promise<void>;
}


const incomeStoreMockData = {
  day: [
    { value: 100, label: "4" },
    { value: 200, label: "8" },
    { value: 100, label: "12" },
    { value: 200, label: "16" },
    { value: 100, label: "20" },
    { value: 200, label: "24" },
  ],
  week: [
    { value: 90, label: "M" },
    { value: 60, label: "T" },
    { value: 90, label: "W" },
    { value: 60, label: "T" },
    { value: 90, label: "F" },
    { value: 60, label: "S" },
    { value: 60, label: "S" },
  ],
  month: [
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
  ],
  year: [
    { value: 90, label: "2020" },
    { value: 60, label: "2021" },
    { value: 90, label: "2022" },
    { value: 60, label: "2023" },
    { value: 90, label: "2025" },
  ],
};

const useIncomeDataStore = create<IUseIncomeDataStore>((set, get) => ({
    barData: new Map(),
    isLoading: false,
    timeFrame: TimeFrame.Day,
    refetch: async () => {
      get().fetch();
    },

    changeTimeFrame: (timeFrameIn: TimeFrame) => {
      set({timeFrame:timeFrameIn})
    },

    fetch: async () => {
      set({isLoading: true})
      const timeFrames = [TimeFrame.Day,TimeFrame.Week,TimeFrame.Month,TimeFrame.Year]
      const mockData = [incomeStoreMockData.day, incomeStoreMockData.week,incomeStoreMockData.month,incomeStoreMockData.year]
      set ((state) => {
        const map = new Map(state.barData)
        for (let i = 0; i < timeFrames.length ; i++){ 
          setTimeout(()=> {
            map.set(timeFrames[i], mockData[i])
          },1000)
        }
        setTimeout(()=> {
            set({isLoading:false})
          },1200)
        return {barData: map}
      })
      
    },
}));

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

interface IUseFinancialAccountStore {
  userFinancialAccounts?:UserFinacialAccount[] 
  fetch: () => Promise<void>
  refetch: () => Promise<void>
  isLoading: boolean
}

const demoAccounts: UserFinacialAccount[] = [
  {
    isManualAccount: true,
    accountID: "101111",
    accountType: "Loan",
    accountName: "Loan One",
    insitutionName: "Chase",
    value: 10000,
    tag: "LOAN",
  },
  {
    isManualAccount: false,
    accountType: "Savings",
    accountID: "10101",
    insitutionName: "Bank of America",
    accountName: "Ab savings",
    value: 200000,
    tag: "SAVINGS",
  },
  {
    isManualAccount: false,
    accountType: "Crypto",
    accountID: "101010",
    insitutionName: undefined,
    accountName: "BTC wallet One",
    value: 200000,
    tag: "CRYPTO",
  },
  {
    isManualAccount: false,
    accountType: "Chequing",
    accountID: "101010",
    insitutionName: "Bank of America",
    accountName: "Main Chequing",
    value: 200000,
    tag: "CHEQUING",
  },
];

const useFetchFinancialAccountsStore = create<IUseFinancialAccountStore>((set, get) => ({
  userFinancialAccounts:[],
  isLoading: false,

  fetch: async () =>  {
    set({isLoading:true})
    setTimeout(() => {
      set({userFinancialAccounts:demoAccounts,isLoading:false})
    }, 2000);
  },

  refetch: async () => {
    get().fetch()
  }
}));


interface IUseHomeModel {
  refreshHome: () => Promise<void>;
  isHomeLoading: boolean;
  onSettingsPressed: () => void;
  onAddAccountPressed: () => void;
  useIIncomeDataStore: IUseIncomeDataStore;
  useINetWorthStore: NetWorthState & NetWorthAction;
  useIFetchFinancialAccountsStore: IUseFinancialAccountStore
}



function useHomeModel(): IUseHomeModel {
  const useINetWorthStore = useNetWorthStore();
  const useIIncomeDataStore = useIncomeDataStore();
  const useIFetchFinancialAccountsStore = useFetchFinancialAccountsStore();
  
  const [isHomeLoading, setHomeLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {
    useINetWorthStore.fetch()
    useIIncomeDataStore.fetch()
    useIFetchFinancialAccountsStore.fetch()
  }, [])

  const refreshHome = async () => {
    setHomeLoading(true)
    await useIIncomeDataStore.refetch()
    await useINetWorthStore.fetch()
    await useIFetchFinancialAccountsStore.refetch()
    setTimeout(() => {
      setHomeLoading(false)
    }, 2000);
  };

  const onSettingsPressed = () => {
    router.navigate("/(tabs)/(home)/settings")
    
  };

  const onAddAccountPressed = () => {

  };

  return { 
    refreshHome,
    isHomeLoading,
    useINetWorthStore,
    useIIncomeDataStore,
    useIFetchFinancialAccountsStore,
    onSettingsPressed,
    onAddAccountPressed, 
  };
}

export default function Home() {
  const useIHomeModel:IUseHomeModel = useHomeModel();
  const colorScheme:ColorSchemeName = useColorScheme();
  
  return (
    <>
        <StatusBar style="dark" />
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
            />
          }
        >
          <GroupedPageSection>
            <HeadingWithElement heading={"Dashboard"}>
              <HapticButton onPressed={useIHomeModel.onSettingsPressed}>
                <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
              </HapticButton>
            </HeadingWithElement>
            <NetWorthCardComponent
              isLoading={useIHomeModel.useINetWorthStore.isLoading}
              balance={useIHomeModel.useINetWorthStore.balance}
              currency={"USD"}
              dept={useIHomeModel.useINetWorthStore.dept}
              percentChange={63}
              onLongPress={() => {}}
            />
          </GroupedPageSection>

          <GroupedPageSection>
            <HeadingWithElement heading="Income" />
            <IncomeBarChartComponent
              isLoading = {useIHomeModel.useIIncomeDataStore.isLoading}
              data={useIHomeModel.useIIncomeDataStore.barData.get(useIHomeModel.useIIncomeDataStore.timeFrame) ?? []}
              onOneDayPressed={() => useIHomeModel.useIIncomeDataStore.changeTimeFrame(TimeFrame.Day)}
              onOneWeekPressed={() => useIHomeModel.useIIncomeDataStore.changeTimeFrame(TimeFrame.Week)}
              onOneMonthPressed={() => useIHomeModel.useIIncomeDataStore.changeTimeFrame(TimeFrame.Month)}
              onOneYearPressed={() => useIHomeModel.useIIncomeDataStore.changeTimeFrame( TimeFrame.Year)}
            />
          </GroupedPageSection>

          <GroupedPageSection>
            <HeadingWithElement heading={"Accounts"}>
              <HapticButton onPressed={useIHomeModel.onAddAccountPressed}>
                <Ionicons
                  name="add-circle-outline"
                  size={30}
                  color={"#2D2F43"}
                />
              </HapticButton>
            </HeadingWithElement>
            <AccountCarouselComponent
              data={
                useIHomeModel.useIFetchFinancialAccountsStore
                  .userFinancialAccounts === undefined
                  ? []
                  : useIHomeModel.useIFetchFinancialAccountsStore.userFinancialAccounts.map(
                      (account: UserFinacialAccount) => {
                        return {
                          tag: account.tag,
                          balance: account.value,
                          name: account.accountName,
                          currency: "USD",
                        } as AccountCarouselData;
                      }
                    )
              }
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
