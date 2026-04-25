import "@/global.css";
import { AppText } from "@/src/components/common/app-text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    emoji: "👋",
    title: "Welcome to WealthFlow!",
    description: "Let's take a quick tour of the key features to help you get started.",
    bg: "#03BF62",
    textColor: "text-white",
  },
  {
    emoji: "📊",
    title: "Dashboard",
    description: "Your home base. See your net worth, assets, debt, and growth all in one place at a glance.",
    bg: "#03BF62",
    textColor: "text-white",
  },
  {
    emoji: "💳",
    title: "Bills",
    description: "Track all your upcoming bills. Add due dates, mark them as paid, and never miss a payment again.",
    bg: "#03BF62",
    textColor: "text-white",
  },
  {
    emoji: "💬",
    title: "Community Forums",
    description: "Connect with others. Post questions, share tips, and browse by category — Financial, App, Social, or Other.",
    bg: "#03BF62",
    textColor: "text-white",
  },
  {
    emoji: "🚀",
    title: "You're all set!",
    description: "Start exploring WealthFlow and take control of your financial future.",
    bg: "#03BF62",
    textColor: "text-white",
  },
];

export default function Walkthrough() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;
  const slide  = SLIDES[currentIndex];

  const handleNext = () => {
    if (isLast) {
      router.replace("/(tabs)/(home)");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)/(home)");
  };

  return (
    <View className="flex-1 items-center justify-between py-16 px-8" style={{ backgroundColor: slide.bg }}>

      {/* Skip button */}
      <TouchableOpacity onPress={handleSkip} className="self-end">
        <AppText type="normal" className="text-white opacity-70">Skip</AppText>
      </TouchableOpacity>

      {/* Slide content */}
      <View className="flex-1 items-center justify-center w-full">
        <AppText type="title" className="text-white text-center mb-6" style={{ fontSize: 80 }}>
          {slide.emoji}
        </AppText>
        <AppText type="subtitle" className="text-white text-center mb-4">
          {slide.title}
        </AppText>
        <AppText type="default" className="text-white text-center opacity-90 leading-6">
          {slide.description}
        </AppText>
      </View>

      {/* Dot indicators */}
      <View className="flex-row gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${i === currentIndex ? "w-6 bg-white" : "w-2 bg-white opacity-40"}`}
          />
        ))}
      </View>

      {/* Next / Get Started button */}
      <TouchableOpacity
        onPress={handleNext}
        className="bg-white w-full py-4 rounded-2xl items-center"
      >
        <AppText type="defaultSemiBold" className="text-[#03BF62]">
          {isLast ? "Get Started" : "Next"}
        </AppText>
      </TouchableOpacity>

    </View>
  );
}