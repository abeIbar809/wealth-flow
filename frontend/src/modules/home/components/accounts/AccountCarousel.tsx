import { AppText } from "@/src/components/common/app-text";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export interface AccountCarouselData {
  tag: string;
  balance: number;
  name: string;
  currency: string;
}

interface AccounCarouselComponentProps {
  data: AccountCarouselData[];
}

export default function AccountCarouselComponent({ ...props }: AccounCarouselComponentProps) {
  const bgColors = [
    "bg-[#03bf62]",
    "bg-[#00a97d]",
    "bg-[#00928a]",
    "bg-[#007987]",
    "bg-[#006075]",
    "bg-[#2f4858]",
  ];
  return (
    <Animated.View entering={FadeIn.duration(1000)} className="h-[200] ">
      <ScrollView horizontal={true}>
        {Array.from({ length: props.data.length }).map((col, index) => {
          return (
            <View
              className={`w-[125] h-[180] ${bgColors[index % 6]
                } ml-8 rounded-[18] justify-between shadow-m p-3  `}
              key={index}
            >
              <View className=" h-[35] rounded-[50] bg-white opacity-92 items-center justify-center">
                <AppText className="">{props.data[index].tag}</AppText>
              </View>

              <View className="">
                <AppText.Caption className=" text-white font-medium">
                  ${props.data[index].balance.toLocaleString()}
                </AppText.Caption>
                <AppText.Caption className=" text-white font-medium">
                  {props.data[index].name}
                </AppText.Caption>
                <AppText.Caption className=" text-white font-medium ">
                  {props.data[index].currency}
                </AppText.Caption>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}