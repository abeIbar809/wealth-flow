import { Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import ElementButton from "../common/navigation/element-button";
import Animated, { FadeIn } from "react-native-reanimated";

interface BarChartComponentProps {
  data: barDataItem[];
  height?: number;
  width?: number;
  onOneDayPressed: () => void;
  onOneWeekPressed: () => void;
  onOneMonthPressed: () => void;
  onOneYearPressed: () => void;
}

export default function IncomeBarChartComponent({
  ...props
}: BarChartComponentProps) {
  return (
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
        <ElementButton onPressed={props.onOneDayPressed} >
          <View className="bg-[#D2D2D2] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text> 1D</Text>
          </View>
        </ElementButton>
        <ElementButton onPressed={props.onOneWeekPressed}>
          <View className="bg-[#D2D2D2]  w-10 h-8 items-center rounded-lg justify-center"> 
            <Text className="text-center"> 1W</Text>
          </View>
        </ElementButton>
        <ElementButton onPressed={props.onOneMonthPressed}>
          <View className="bg-[#D2D2D2] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text> 1M</Text>
          </View>
        </ElementButton>
        <ElementButton onPressed={props.onOneYearPressed}>
          <View className="bg-[#D2D2D2] items-center w-10 h-8  rounded-lg justify-center"> 
            <Text> 1Y</Text>
          </View>
        </ElementButton>
      </View>
    </Animated.View>
  );
}
