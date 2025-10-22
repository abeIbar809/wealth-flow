import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Card from "../common/widgets/card";
import { ShimmerSkeleton } from "../common/shimmer/card-shimmer-skeleton";

export interface CardBalanceProps {
  balance: number;
  dept: number;
  currency: string;
  percentChange: number;
  isLoading: boolean;
}

export default function CardBalanceComponent({
  ...props
}: CardBalanceProps): React.JSX.Element {
  return (
    //<ShimmerSkeleton isActive={props.isLoading} width={300} height={200}>
      <Animated.View entering={FadeIn.duration(1000)} className="w-full items-center">
        <Card className="justify-evenly inset-shadow-xl ">
          <View className="h-1/3 w-full justify-center">
            <Text className="text-3xl text-white font-bold">Balance</Text>
            <Text className="text-xl text-white font-medium transition-all transition-discrete">
              {props.currency} {props.balance.toLocaleString()}
            </Text>
          </View>

          <View className="w-[80] h-1/6 bg-red-500 rounded-[40] justify-center items-center">
            <Text className="text-white font-bold ">
              %{props.percentChange}
            </Text>
          </View>

          <View className="w-full h-1/3 bg-red-5 justify-center">
            <Text className="text-3xl text-white font-bold">Dept</Text>
            <Text className="text-xl text-white font-medium">
              {props.currency} {props.dept.toLocaleString()}
            </Text>
          </View>
        </Card>
      </Animated.View>
    //</ShimmerSkeleton>
  );
}
