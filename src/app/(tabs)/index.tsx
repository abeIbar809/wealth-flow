import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View
} from "react-native";

import ElementButton from "@/src/components/common/navigation/element-button";
import GroupedPageSection from "@/src/components/common/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/common/layout/heading-with-element";
import CardBalanceComponent from "@/src/components/home/CardBalance";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Animated, { FadeIn } from "react-native-reanimated";
 // or 'expo-linear-gradient'
 
interface BarChartComponentProps {
  data: barDataItem[];
  height?: number;
  width?: number;
}

function BarChartComponent({ ...props }: BarChartComponentProps) {
  return (
      <BarChart
        data={props.data}
        height={props.height && 200}
        width={props.height && 300}
        barWidth={20}
        minHeight={3}
        barBorderRadius={10}
        spacing={20}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={{ color: "grey" }}
        yAxisTextStyle={{ color: "grey" }}
        isAnimated={true}
        scrollAnimation={true}
      />
    
  );
}

interface AccountCarouselData {
  tag: string;
  balance: number;
  name: string;
  currency: string;
}
interface AccounCarouselComponentProps {
  data: AccountCarouselData[];
}
function AccountCarouselComponent({
  ...props
}: AccounCarouselComponentProps) {
  const bgColors = [
    "bg-red-600",
    "bg-blue-600",
    "bg-pink-600",
    "bg-black",
    "bg-yellow-600",
  ];
  return (
    <View>
      <ScrollView horizontal={true}>
        {Array.from({ length: props.data.length }).map((col, index) => {
          return (
            <View
              className={`w-[125] h-[180] ${
                bgColors[index % 5]
              } ml-8 rounded-[18] justify-between shadow-m p-3  `}
              key={index}
            >
              <View className="w-[35] h-[35] rounded-[50] bg-white items-center justify-center">
                <Text>{props.data[index].tag}</Text>
              </View>

              <View className="">
                <Text className=" text-white font-bold">
                  ${props.data[index].balance.toLocaleString()}
                </Text>
                <Text className=" text-white font-medium">
                  {props.data[index].name}
                </Text>
                <Text className=" text-white font-medium">
                  {props.data[index].currency}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

type CardBalanceHook = [number,number,()=>void,boolean,boolean]

function useFetchNetWorth() : CardBalanceHook { 

  const [isLoading, setLoading] = useState<boolean>(false);
  const [balance,setBalance] = useState(0);
  const [dept,setDept] =  useState(0);
  const [error,setError] = useState(false);

  useEffect(() => {
    fetchData();

  },[])

  const fetchData = async () => { 
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
    
    setBalance(10000)
    setDept(-1000)
  }

  const refresh = () => {
    console.log("refreshing")
    fetchData()
    setBalance(0)
  }
  return [balance,dept,refresh,isLoading,error] 
}

enum TimeFrame { 
  Day,
  Week,
  Month,
  Year
}

interface IUseFetchBarChartData {
  barData:barDataItem[]
  changeTimeFrame:(timeFrameIn:TimeFrame)=>void
  isLoading:Boolean
  refetch:() => void
}

function useFetchBarChartData(timeFrameIn:TimeFrame) : IUseFetchBarChartData  {

  const [timeFrame,setTimeFrame] = useState(timeFrameIn)
  const [barData,setBarData] = useState<barDataItem[]>([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    fetchBarData(timeFrame)
  }, [timeFrame])

  const fetchBarData = (timeFrameIn:TimeFrame) => {
    switch (timeFrameIn) { 
      case TimeFrame.Day:
        setBarData([{value:100, label:"M"},{value:200,label:"T"}])
        break;
      case TimeFrame.Week:
        setBarData([{value:90, label:"J"},{value:60,label:"F"}])
        break;
      case TimeFrame.Month:
        setBarData([])
        break;
      case TimeFrame.Year:
        setBarData([])
        break;
    }
  }

  const refetch = () => {
    fetchBarData(timeFrame)
  }

  const changeTimeFrame = (timeFrameIn:TimeFrame) => { 
    setTimeFrame(timeFrameIn)
    refetch()
  }

  return {barData,changeTimeFrame,isLoading,refetch}
}

export default function Home() {
  
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [balance,dept,refresh,isLoading] = useFetchNetWorth();
  const {barData,changeTimeFrame} = useFetchBarChartData(TimeFrame.Day);

  const [isHomeLoading,setHomeLoading] = useState(false)

  
  function OnAccountAddPressed() {
    changeTimeFrame(TimeFrame.Week)

  }

  const OnHomeRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    },3000);
  }

  return (
    <><Animated.ScrollView
        
        className={`${colorScheme === "light" ? "bg-white" : "bg-black"}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnHomeRefresh} tintColor="#0000ff" colors={["#0000ff"]} />
        }>


        
         <GroupedPageSection>
          <HeadingWithElement heading={"Dashboard"}>
            <ElementButton onPressed={OnAccountAddPressed}>
              <Ionicons name="cog-outline" size={30} color={"#2D2F43"} />
            </ElementButton>
          </HeadingWithElement>
          <CardBalanceComponent isLoading={refreshing} balance={balance} currency="USD" 
          dept={dept} percentChange={63}/>
          </GroupedPageSection>
       


        

        
        <GroupedPageSection>
          <HeadingWithElement heading="Chart" />
          <View className=" rounded-[14] w-4/5 h-[230] items-center justify-center ">
            <BarChartComponent data={barData}/>
          </View>
          <View className="flex flex-row mt-4 justify-evenly w-full"> 
            <ElementButton onPressed={()=>{changeTimeFrame(TimeFrame.Day)}}>
              <Text>1D</Text>
            </ElementButton>
            <ElementButton onPressed={()=>{changeTimeFrame(TimeFrame.Week)}}>
              <Text>1W</Text>
            </ElementButton>
            <ElementButton onPressed={()=>{changeTimeFrame(TimeFrame.Month)}}>
              <Text>1M</Text>
            </ElementButton>
            <ElementButton onPressed={()=>{changeTimeFrame(TimeFrame.Year)}}>
              <Text>1Y</Text>
            </ElementButton>
          </View>
        </GroupedPageSection>
       
        
        <Animated.View entering={FadeIn.duration(1000)}>
        <GroupedPageSection>
          <HeadingWithElement heading={"Accounts"}>
            <ElementButton onPressed={OnAccountAddPressed}>
              <Ionicons name="add-circle-outline" size={30} color={"#2D2F43"} />
            </ElementButton>
          </HeadingWithElement>
          <AccountCarouselComponent data={[]}/>
        </GroupedPageSection>
        </Animated.View>

      </Animated.ScrollView>
    </>
  );
}
