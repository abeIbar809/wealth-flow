import "@/global.css";
import { AppText } from "@/src/components/common/app-text";
import Card from "@/src/components/common/card";
import { Section } from "@/src/components/layout/grouped-page-section";
import HapticButton from "@/src/components/navigation/haptic-button";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();

  // Back to login page.
  function onBackPressed() {
    router.dismiss()
  }

  {/* TODO: Functions here will interact with GLOBAL auth state. Need an Auth context or Zuestand Store */ }
  {/* TODO: Handle signup attemp  */ }
  function onFinishSignupPressed() {

  }

  return (
    // Mark Page
    <>
      <StatusBar style="light" />
      <View className="flex-1 items-center align-middle justify-between bg-[#03BF62]">
        <Section>
          <View className="justify-between flex-row pt-20 w-full pl-5 pr-5">
            <HapticButton onPressed={onBackPressed}>
              <Ionicons name="arrow-back-circle" size={30} color={"#FFF"} />
            </HapticButton>
            <AppText.SubTitle className=" font-bold text-3xl text-white">Create  your Account 🚀</AppText.SubTitle>
          </View>
        </Section>

        <Card className="h-5/6 w-full bg-white rounded-[40] items-center justify-start">

          <Section>
          </Section>

          <Section className="pt-10">
            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold"> Email </AppText>
            </View>
            {/* TODO: Capture email input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Email" />

            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold "> Password </AppText>
            </View>
            {/* TODO: Capture password input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password" secureTextEntry />

            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold "> Retype password </AppText>
            </View>
            {/* TODO: Capture password input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password" secureTextEntry />

            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold "> Phone </AppText>
            </View>
            {/* TODO: Capture phone input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Phone" />

            <TouchableOpacity className=" bg-[#03BF62] w-5/6 rounded-[20] h-[45] mt-8 items-center justify-center" onPress={onFinishSignupPressed}>
              <AppText.Normal className="text-white font-medium  " > Continue </AppText.Normal>
            </TouchableOpacity>
          </Section>
        </Card>
      </View>
    </>
  );
}


