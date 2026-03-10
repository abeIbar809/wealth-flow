import { AppText } from "@/src/components/common/app-text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { PlaidAccount, plaidService } from "@/src/services/PlaidLinkService";
import { Mask } from "react-native-svg";
import { Account, useHomeStore } from "@/src/stores/useHomeStore";

export default function AddAccountActionSheet() {

  const [isLinking, setIsLinking] = useState(false)

  const { addAccounts, fetchAccounts } = useHomeStore()

  const openLink = async () => {
    setIsLinking(true)

    try {
      await plaidService.openPlaidLink({
        onSuccess: async (accounts: PlaidAccount[]) => {
          console.log("Accounts linked: ", accounts.length)

          const mappedAccounts: Account[] = accounts.map((account) => ({
            _id: account._id,
            plaid_account_id: account.plaid_account_id,
            name: account.name,
            type: account.type as Account["type"],
            balance: account.balance_current,
            balance_current: account.balance_current,
            balance_available: account.balance_available,
            balance_limit: account.balance_limit,
            currency: account.currency,
            institution_name: account.institution_name,
            mask: account.mask,
            isLinked: true,
            lastUpdated: account.lastUpdated,
          }))


          addAccounts(mappedAccounts);

          await fetchAccounts()

          setIsLinking(false)

          Alert.alert(
            "Success",
            `${accounts.length} account${accounts.length > 1 ? "s" : ""} linked successfully!`,
            [{ text: "OK" }]
          );

        },
        onExit: (error) => {
          setIsLinking(false);
          if (error) {
            console.error("Plaid Link error:", error);

            Alert.alert(
              "Link Failed",
              error.errorMessage || "Failed to link account. Please try again.",
              [{ text: "OK" }]
            );

          }

        },
      })
    } catch (error) {
      setIsLinking(false);
      console.error("Error opening Plaid Link:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to open bank link. Please try again.",
        [{ text: "OK" }]
      );
      router.dismiss()
    }
  }

  return (
    <View className="flex flex-1 items-center justify-end">
      <View className="w-5/6 bg-white shadow-black shadow-xl rounded-3xl h-[170] mb-40 items-center justify-center">
        <View className="bg-gray-100 h-[150]  w-11/12 rounded-3xl justify-evenly ">
          <View className="w-full h-[40] flex flex-row justify-between pt-2 px-3">
            <AppText className="text-gray-500">Add an account  </AppText>
            <TouchableOpacity onPress={() => { router.dismiss() }}>
              <Ionicons name="close-circle" color="#C3C2C2" size={30} ></Ionicons>
            </TouchableOpacity>
          </View>

          <View className="w-full pt-1 items-center pb-4">
            <TouchableOpacity
              className={`w-5/6 h-[40] rounded-2xl items-center justify-center flex-row ${isLinking ? "bg-gray-300" : "bg-[#03BF62]"
                }`}
              onPress={openLink}
              disabled={isLinking}
            >
              {isLinking ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <AppText className="text-white ml-2">Linking...</AppText>
                </>
              ) : (
                <>
                  <Ionicons name="link" size={18} color="#FFFFFF" />
                  <AppText className="text-white ml-2 font-medium">Link Bank Account</AppText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-5/6 h-[40] rounded-2xl mt-3 items-center justify-center flex-row border border-[#03BF62] ${isLinking ? "opacity-50" : ""
                }`}
              onPress={() => { 
                router.dismiss();
                router.push("/addManualAccountPopup");
              }}
              disabled={isLinking}
            >
              <Ionicons name="add-circle-outline" size={18} color="#03BF62" />
              <AppText className="text-[#03BF62] ml-2 font-medium">Add Manually</AppText>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );
}