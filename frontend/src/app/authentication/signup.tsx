import "@/global.css";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View, Image, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HapticButton from "@/src/components/navigation/haptic-button";
import LottieView from 'lottie-react-native';



export default function SignUp() {
  const router = useRouter();

  function onBackPressed() {
    router.dismiss()
  }

  function onNextPressed() { 

  }

  return (
    // Mark Page
    <>
    <StatusBar style="light" />
    <View className="flex-1 items-center align-middle justify-between bg-[#03BF62]">

      <View className="justify-between flex-row pt-20 w-full pl-5 pr-5">
        <HapticButton onPressed={onBackPressed}>
          <Ionicons name="arrow-back-circle" size={30} color={"#FFF"} />
        </HapticButton>
        <Text className=" font-bold text-3xl text-white">Create  your Account 🚀</Text>
      </View>  
      
      
      <View className=" h-5/6 w-full bg-white rounded-[40] items-center justify-evenly">

      <LottieView source={require('@/assets/lottie/Finance guru.json')} style={{width:100,height:100}}  autoPlay loop />

        <GroupedPageSection className="items-center" > 

          <View className=" items-start w-5/6 pb-3"> 
            <Text className="font-bold"> Email </Text>
          </View>
          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Email"/>

        
          <View className=" items-start w-5/6 pb-3"> 
            <Text className="font-bold "> Password </Text>
          </View>
          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password"/>

          <View className=" items-start w-5/6 pb-3"> 
            <Text className="font-bold "> Retype password </Text>
          </View>
          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password"/>

          <View className=" items-start w-5/6 pb-3"> 
            <Text className="font-bold "> Phone </Text>
          </View>
          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password"/>
        

        </GroupedPageSection>
        
        <GroupedPageSection>
          <TouchableOpacity className=" bg- w-4/5 rounded-[20] h-[35] items-center justify-center" onPress={onNextPressed}>
            <Text className="text-white font-bold text-xl" > Next </Text>
            {/*<Button title="Login" onPress={onLoginAttemp} />*/}
          </TouchableOpacity>
        </GroupedPageSection>

      </View>
    </View>
    </>
  );
}


