import { AppText } from "@/src/components/common/app-text";
import { Account } from "@/src/stores/useHomeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
interface AccounCarouselComponentProps {
  data: Account[]
  isLoading?: boolean;
}

// Format currency
const formatCurrency = (amount: number, showSign: boolean = false): string => {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (showSign && amount < 0) {
    return `${formatted}`;
  }
  return formatted;
};

// Get account type icon
const getAccountIcon = (type: Account["type"]): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "checking":
      return "card";
    case "savings":
      return "wallet";
    case "credit":
      return "card-outline";
    case "investment":
      return "trending-up";
    case "loan":
      return "document-text";
    default:
      return "cash";
  }
};

const capitalizeFirstLetter = (string: string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};



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

      {props.data.length == 0 ?
        (<>
          <View className=" h-[200] items-center justify-center ">
            <Ionicons name="link-outline" style={{ color: "green" }} size={40}></Ionicons>
            <AppText className="font-bold">Link a Bank Account to get started !</AppText>
          </View>
        </>) :
        (<>
          <ScrollView horizontal={true}>
            {Array.from({ length: props.data.length }).map((col, index) => {
              return (
                <View
                  className={`w-[125] h-[180] ${bgColors[index % 6]
                    } ml-8 rounded-[18] justify-between shadow-m p-3  `}
                  key={index}
                >
                  <View className=" h-[40]  rounded-[13] bg-white opacity-92 items-start justify-center pl-3">
                    <Ionicons name={getAccountIcon(props.data[index].type)} size={15}></Ionicons>
                    <AppText className="text-gray-800 font-medium">{capitalizeFirstLetter(props.data[index].type)}</AppText>
                  </View>


                  <View className="">
                    <AppText.Caption className=" text-white font-medium" >
                      {formatCurrency(props.data[index].balance, true)}
                    </AppText.Caption>
                    <AppText.Caption className=" text-white font-medium" numberOfLines={1}>
                      {props.data[index].name}
                    </AppText.Caption>
                    <AppText.Caption className=" text-white font-medium">
                      {props.data[index].institutionName}
                    </AppText.Caption>
                    <AppText.Caption className=" text-white font-medium ">
                      {props.data[index].currency}
                    </AppText.Caption>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>)}
    </Animated.View>
  );
}