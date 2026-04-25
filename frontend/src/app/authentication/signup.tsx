import "@/global.css";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HapticButton from "@/src/components/navigation/haptic-button";
import useAuthStore from "@/src/stores/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();
  const { attemptSignup, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Back to login page
  function onBackPressed() {
    router.dismiss();
  }

  // Handle signup attempt
  async function onNextPressed() {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    clearError();
    const success = await attemptSignup(name, email, password, phone);

    if (success) {
      router.replace("/walkthrough" as any);
    } else {
      Alert.alert("Signup Failed", error || "Could not create account");
    }
  }

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 items-center align-middle justify-between bg-[#03BF62]">

        <View className="justify-between flex-row pt-20 w-full pl-5 pr-5">
          <HapticButton onPressed={onBackPressed}>
            <Ionicons name="arrow-back-circle" size={30} color={"#FFF"} />
          </HapticButton>
          <Text className="font-bold text-3xl text-white">Create your Account 🚀</Text>
        </View>

        <View className="h-5/6 w-full bg-white rounded-[40] items-center justify-evenly">

          <GroupedPageSection className="items-center">
            <View className="items-start w-5/6 pb-3">
              <Text className="font-bold">Name</Text>
            </View>
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2 px-3"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />

            <View className="items-start w-5/6 pb-3">
              <Text className="font-bold">Email</Text>
            </View>
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2 px-3"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <View className="items-start w-5/6 pb-3">
              <Text className="font-bold">Password</Text>
            </View>
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2 px-3"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />

            <View className="items-start w-5/6 pb-3">
              <Text className="font-bold">Retype password</Text>
            </View>
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2 px-3"
              placeholder="Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />

            <View className="items-start w-5/6 pb-3">
              <Text className="font-bold">Phone</Text>
            </View>
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2 px-3"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </GroupedPageSection>

          <GroupedPageSection>
            <TouchableOpacity
              className="bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center"
              onPress={onNextPressed}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xl">Next</Text>
              )}
            </TouchableOpacity>
          </GroupedPageSection>

        </View>
      </View>
    </>
  );
}