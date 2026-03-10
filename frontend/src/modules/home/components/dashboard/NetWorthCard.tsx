import { AppText } from '@/src/components/common/app-text';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export interface CardBalanceProps {
  balance: number | undefined;
  dept: number | undefined;
  assets: number | undefined;
  currency: string;
  percentChange: number;
  isLoading: boolean;
  onLongPress: () => void
}

export default function NetWorthCardComponent({
  ...props
}: CardBalanceProps): React.JSX.Element {
  const [cardHeight] = useState(200)

  const onCardPressed = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return (
    <Animated.View entering={FadeIn.duration(1000)} className="w-full items-center">
      <Pressable className={`inset-shadow-xl w-5/6 pl-6 shadow-xl justify-evenly`}
        style={{ height: cardHeight, backgroundColor: "#03BF62", borderRadius: 18, }}
        onLongPress={onCardPressed}
      >
        <View className=" w-full justify-center pt-2">
          <AppText.SubTitleNormal className="text-white">Networth</AppText.SubTitleNormal>
          <AppText className=" text-white">
            {props.currency} {props.balance != undefined ? (props.balance.toLocaleString()) : "_"}
          </AppText>
        </View>

        <View className="w-[80] h-[25] bg-white opacity-90 rounded-[40] flex flex-row items-center justify-between px-2">
          <AppText className="text-black">
            {props.percentChange}%
          </AppText>
          <Ionicons name='trending-up' color="#03BF62" size={20}></Ionicons>
        </View>

        <View className="w-full bg-red-5 ">
           <AppText className=" text-white font-bold ">Assets</AppText>
           <AppText.Caption className=" text-white ">
             {props.currency}{props.assets != undefined ? props.assets.toLocaleString() : "_"}
           </AppText.Caption>
        </View>


          <View className="w-full bg-red-5 ">
          <AppText className=" text-white font-bold ">Dept</AppText>
          <AppText.Caption className=" text-white ">
            {props.currency}{props.dept != undefined ? props.dept.toLocaleString() : "_"}
          </AppText.Caption>
          </View>
        

      </Pressable>
    </Animated.View>
  );
}