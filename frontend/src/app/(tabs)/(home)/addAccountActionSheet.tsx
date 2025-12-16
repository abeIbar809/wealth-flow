import { AppText } from "@/src/components/common/app-text";
import { plaidService } from "@/src/services/PlaidLinkService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function AddAccountActionSheet() {
  return (
    <View className="flex flex-1 items-center justify-end">
      <View className="w-5/6 bg-white shadow-black shadow-xl rounded-3xl h-[150] mb-40 items-center justify-center">
        <View className="bg-gray-100 h-[130]  w-11/12 rounded-3xl justify-evenly ">
          <View className="w-full h-[40] flex flex-row justify-between pt-2 px-3">
            <AppText className="text-gray-500">Add an account  </AppText>
            <TouchableOpacity onPress={() => { router.dismiss() }}>
              <Ionicons name="close-circle" color="#C3C2C2" size={30} ></Ionicons>
            </TouchableOpacity>
          </View>
          <View className=" w-full pt-1 items-center">
            <TouchableOpacity
              className="w-5/6 bg-[#03BF62] opacity-80 h-[30] rounded-2xl items-center justify-center"
              onPress={() => {
                router.dismiss()
                plaidService.onPlaidLinkPressed;
              }}
            >
              <AppText.Normal className="text-white">Link bank</AppText.Normal>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-5/6 bg-[#03BF62] opacity-80  h-[30] rounded-2xl mt-3 items-center justify-center"
              onPress={() => {
                router.dismiss()
              }}
            >
              <AppText.Normal className="text-white">Add manually</AppText.Normal>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}