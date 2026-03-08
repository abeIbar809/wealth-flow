import "@/global.css";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import useAuthStore from "@/src/stores/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AuthIndex() {
  const router = useRouter();
  const { attemptLogin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Navigate to signup page 
  function onSignUpPressed() {
    router.push("/authentication/signup");
  }

  // Handle login attempt
  async function onLoginAttempt() {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    clearError();
    const success = await attemptLogin(email, password);
    
    if (!success){
      Alert.alert("Login Failed", error || "Invalid credentials");
    }
  }

  // TODO: Implement forgot password
  function onForgotPasswordPressed() {
    Alert.alert("Forgot Password", "This feature will be implemented soon");
  }

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 items-center align-middle justify-evenly bg-[#03BF62]">
        
        <Text className="font-bold text-4xl text-white">WealthFlow</Text>

        <View className="h-[500] w-4/5 bg-white rounded-[20] items-center justify-evenly">
          <Text className="font-bold text-3xl">Sign in to your account</Text>

          <GroupedPageSection className="items-center">
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

            <View className="items-start w-5/6">
              <TouchableOpacity onPress={onForgotPasswordPressed} disabled={isLoading}>
                <Text className="text-blue-400 font-bold pl-2">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
          </GroupedPageSection>

          <GroupedPageSection>
            <TouchableOpacity 
              className="bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center mb-2" 
              onPress={onLoginAttempt}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xl">Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center" 
              onPress={onSignUpPressed}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-xl">Signup</Text>
            </TouchableOpacity>
          </GroupedPageSection>
        </View>
      </View>
    </>
  );
}