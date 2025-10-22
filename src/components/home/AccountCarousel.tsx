import { ScrollView, View,Text } from "react-native";
import Animated,{FadeIn} from "react-native-reanimated";

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
              className={`w-[125] h-[180] ${
                bgColors[index % 6]
              } ml-8 rounded-[18] justify-between shadow-m p-3  `}
              key={index}
            >
              <View className=" h-[35] rounded-[50] bg-white items-center justify-center">
                <Text className="font-medium">{props.data[index].tag}</Text>
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
    </Animated.View>
  );
}