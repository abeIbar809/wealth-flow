import "@/global.css";
import { AppText } from "@/src/components/common/app-text";
import Card from "@/src/components/common/card";
import { Section } from "@/src/components/layout/grouped-page-section";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function AuthIndex() {
  const router = useRouter();

  // Navigate to signup page 
  function onSignUpPressed() {
    router.push("/authentication/signup")
  }

  {/* TODO: Functions here will interact with GLOBAL auth state. Need an Auth context or Zuestand Store */ }
  {/* TODO: Handle login */ }
  function onLoginAttemp() {
    router.push("/(tabs)/(home)");
  }

  {/* TODO: Implement forgot password. Maybe navigate to new page, open bottomsheet, or pagenation...etc ? */ }
  function onForgotPassWordPressed() {

  }

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 items-center align-middle justify-evenly bg-[#03BF62]">

        <AppText type="title" className="text-white">WealthFlow</AppText>

        <Card className=" h-[500] w-4/5 bg-white rounded-[20] items-center justify-evenly">
          <AppText.SubTitle >Sign in to your account </AppText.SubTitle>
          <Section className="items-center" >

            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold "> Email </AppText>
            </View>

            {/* TODO: Capture email input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Email" />
            <View className=" items-start w-5/6 pb-3">
              <AppText className="font-bold "> Password </AppText>
            </View>

            {/* TODO: Capture password input. Can use useRef for example */}
            <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password" secureTextEntry />

            <View className="items-start w-5/6">
              <TouchableOpacity onPress={onForgotPassWordPressed}>
                <AppText.Caption className=" text-blue-400 font-bold pl-2">
                  Forgot password ?
                </AppText.Caption>
              </TouchableOpacity>
            </View>
          </Section>
          <Section>
            <TouchableOpacity className=" bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center mb-2" onPress={onLoginAttemp}>
              <AppText.Normal className="text-white font-medium" > Login</AppText.Normal>
            </TouchableOpacity>

            <TouchableOpacity className=" bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center" onPress={onSignUpPressed}>
              <AppText.Normal className="text-white font-medium  " > Signup </AppText.Normal>
            </TouchableOpacity>
          </Section>
        </Card>
      </View>
    </>
  );
}
