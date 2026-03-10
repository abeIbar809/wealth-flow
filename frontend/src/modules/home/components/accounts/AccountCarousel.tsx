// frontend/src/modules/home/components/accounts/AccountCarousel.tsx
import { AppText } from "@/src/components/common/app-text";
import { Account } from "@/src/stores/useHomeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface AccounCarouselComponentProps {
  data: Account[];
  isLoading?: boolean;
  onAccountPress?: (account: Account) => void; // ✅ add this
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

  if (showSign && amount < 0) return `${formatted}`;
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

export default function AccountCarouselComponent(props: AccounCarouselComponentProps) {
  const bgColors = [
    "bg-[#03bf62]",
    "bg-[#00a97d]",
    "bg-[#00928a]",
    "bg-[#007987]",
    "bg-[#006075]",
    "bg-[#2f4858]",
  ];

  if (props.data.length === 0) {
    return (
      <View className="px-4 py-6">
        <AppText>Link a Bank Account to get started !</AppText>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {props.data.map((acct, index) => {
        const bg = bgColors[index % bgColors.length];

        return (
          <TouchableOpacity
            key={acct._id}
            activeOpacity={0.85}
            onPress={() => props.onAccountPress?.(acct)} // ✅ click handler
          >
            <Animated.View
              entering={FadeIn.duration(250)}
              className={`w-72 rounded-2xl p-4 ${bg}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name={getAccountIcon(acct.type)} size={18} color="white" />
                  <AppText className="text-white opacity-90">
                    {capitalizeFirstLetter(acct.type)}
                  </AppText>
                </View>

                <AppText className="text-white text-lg font-semibold">
                  {formatCurrency(acct.balance, true)}
                </AppText>
              </View>

              <View className="mt-4">
                <AppText className="text-white text-base font-semibold">{acct.name}</AppText>
                <AppText className="text-white opacity-80">{acct.institutionName}</AppText>
                <AppText className="text-white opacity-80">{acct.currency}</AppText>
              </View>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}