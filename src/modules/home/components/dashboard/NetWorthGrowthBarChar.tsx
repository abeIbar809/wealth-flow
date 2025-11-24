import { AppText } from "@/src/components/common/app-text";
import { ShimmerSkeleton } from "@/src/components/layout/shimmer/card-shimmer-skeleton";
import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import Animated, { FadeIn } from "react-native-reanimated";
import HapticButton from "../../../../components/navigation/haptic-button";

interface BarChartComponentProps {
  data: barDataItem[];
  data2: barDataItem[];
  height?: number;
  width?: number;
  isLoading: boolean
}

export default function NetWorthBarChartComponent({
  ...props
}: BarChartComponentProps) {

  const [currentData, setData] = useState(props.data)

  const { width } = useWindowDimensions();


  return (
    <ShimmerSkeleton height={230} width={(4 / 5) * width} isActive={props.isLoading}>
      <Animated.View entering={FadeIn.duration(1000)} className="w-full items-center">
        <View className="w-full px-10 py-7 flex flex-row justify-between">
          <AppText type="subtitle">Growth</AppText>
          <View className="flex flex-row  w-[80] justify-between">
            <HapticButton onPressed={() => {
              setData(props.data)
            }} >
              <View className="bg-[#F4F6FA] items-center w-10 h-8  rounded-lg justify-center ">
                <Text allowFontScaling={false} className="font-medium ">1M</Text>
              </View>
            </HapticButton>
            <HapticButton onPressed={() => {
              setData(props.data2)
            }}>
              <View className="bg-[#F4F6FA]  w-10 h-8 items-center rounded-lg justify-center">
                <AppText.Defualt className="">All</AppText.Defualt>
              </View>
            </HapticButton>
          </View>
        </View>
        <View className=" rounded-[14] w-5/6 h-[230] items-center justify-center ">
          <BarChart
            data={currentData}
            height={props.height && 200}
            width={props.width && 300}
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
      </Animated.View>
    </ShimmerSkeleton>
  );
}
