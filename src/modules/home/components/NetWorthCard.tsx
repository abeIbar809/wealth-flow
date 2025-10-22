import * as Haptics from 'expo-haptics';
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ShimmerSkeleton } from '@/src/components/shimmer/card-shimmer-skeleton';
import { LayoutShimmerSkeleton } from '@/src/components/shimmer/layout-shimmer-skeleton';
import { useWindowDimensions } from 'react-native';

export interface CardBalanceProps {
  balance: number;
  dept: number;
  currency: string;
  percentChange: number;
  isLoading: boolean;
  onLongPress: () => void
}

export default function NetWorthCardComponent({
  ...props
}: CardBalanceProps): React.JSX.Element {
  const [cardHeight,expandCardHeight] = useState(200)
  const { width } = useWindowDimensions();

  const onCardPressed = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return (
    <ShimmerSkeleton isActive={props.isLoading} width={(4 / 5) * width} height={200}>
      <Animated.View entering={FadeIn.duration(1000)} className="w-full items-center">
        <Pressable className={`inset-shadow-xl w-3/4 pl-6 shadow-xl justify-center`} 
          style = {{ height: cardHeight, backgroundColor: "#03BF62", borderRadius: 18,}}
          onLongPress={onCardPressed}
        >
          <View className="h-1/3 w-full justify-center">
            <Text className="text-3xl text-white font-bold">Balance</Text>
            <Text className="text-xl text-white font-medium transition-all transition-discrete">
              {props.currency} {props.balance.toLocaleString()}
            </Text>
          </View>

          <View className="w-[80] h-1/6 bg-red-500 rounded-[40] justify-center items-center">
            <Text className="text-white font-bold text-xl">
              {props.percentChange}%
            </Text>
          </View>

          <View className="w-full h-1/3 bg-red-5 justify-center">
            <Text className="text-3xl text-white font-bold">Dept</Text>
            <Text className="text-xl text-white font-medium">
              {props.currency} {props.dept.toLocaleString()}
            </Text>
          </View>
        </Pressable>

      </Animated.View>
    </ShimmerSkeleton>
  );
}
