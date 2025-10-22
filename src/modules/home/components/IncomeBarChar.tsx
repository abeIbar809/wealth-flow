import { Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Animated, { FadeIn } from "react-native-reanimated";
import HapticButton from "../../../components/navigation/haptic-button";
import { ShimmerSkeleton } from "@/src/components/shimmer/card-shimmer-skeleton";
import { useEffect, useState } from "react";
import { useWindowDimensions } from 'react-native';

interface BarChartComponentProps {
  data: barDataItem[];
  height?: number;
  width?: number;
  isLoading:boolean
  onOneDayPressed: () => void;
  onOneWeekPressed: () => void;
  onOneMonthPressed: () => void;
  onOneYearPressed: () => void;
}

export default function IncomeBarChartComponent({
  ...props
}: BarChartComponentProps) {

  const { width } = useWindowDimensions();

  
  return (
    <ShimmerSkeleton height={230} width={(4 / 5) * width} isActive={props.isLoading}>
    <Animated.View entering={FadeIn.duration(1000)} className="w-full items-center">
      <View className=" rounded-[14] w-4/5 h-[230] items-center justify-center ">
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
        />
      </View>
      <View className="flex flex-row mt-9 justify-evenly w-full">
        <HapticButton onPressed={props.onOneDayPressed} >
          <View className="bg-[#F4F6FA] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text className=" font-medium"> 1D</Text>
          </View>
        </HapticButton>
        <HapticButton onPressed={props.onOneWeekPressed}>
          <View className="bg-[#F4F6FA]  w-10 h-8 items-center rounded-lg justify-center"> 
            <Text className=" font-medium"> 1W</Text>
          </View>
        </HapticButton>
        <HapticButton onPressed={props.onOneMonthPressed}>
          <View className="bg-[#F4F6FA] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text className=" font-medium"> 1M</Text>
          </View>
        </HapticButton>
        <HapticButton onPressed={props.onOneYearPressed}>
          <View className="bg-[#F4F6FA] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text className=" font-medium"> 1Y</Text>
          </View>
        </HapticButton>
      </View>
    </Animated.View>
    </ShimmerSkeleton>
  );
}
