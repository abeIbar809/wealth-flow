import { AppText } from "@/src/components/common/app-text";
import { AddPropertyData, Property } from "@/src/services/realEstateService";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { memo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddPropertyData) => Promise<void>;
}

const PROPERTY_TYPES: Array<{
  value: Property["propertyType"];
  label: string;
  icon: string;
}> = [
  { value: "single_family", label: "Single Family", icon: "home" },
  { value: "multi_family", label: "Multi Family", icon: "business" },
  { value: "condo", label: "Condo", icon: "albums" },
  { value: "townhouse", label: "Townhouse", icon: "grid" },
  { value: "apartment", label: "Apartment", icon: "cube" },
  { value: "commercial", label: "Commercial", icon: "storefront" },
  { value: "land", label: "Land", icon: "map" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal" },
];

function AddPropertyModalComponent({ visible, onClose, onAdd }: AddPropertyModalProps) {
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<Property["propertyType"]>("single_family");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [hasMortgage, setHasMortgage] = useState(false);
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [mortgagePayment, setMortgagePayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [isRental, setIsRental] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setPropertyType("single_family");
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setPurchasePrice("");
    setCurrentValue("");
    setHasMortgage(false);
    setMortgageBalance("");
    setMortgagePayment("");
    setInterestRate("");
    setIsRental(false);
    setMonthlyRent("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a property name");
      return;
    }

    const price = parseFloat(purchasePrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid purchase price");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const data: AddPropertyData = {
        name: name.trim(),
        propertyType,
        purchasePrice: price,
        currentValue: currentValue ? parseFloat(currentValue) : price,
        address: {
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          zipCode: zipCode.trim() || undefined,
        },
        hasMortgage,
        mortgageBalance: mortgageBalance ? parseFloat(mortgageBalance) : 0,
        mortgagePayment: mortgagePayment ? parseFloat(mortgagePayment) : 0,
        interestRate: interestRate ? parseFloat(interestRate) : 0,
        isRental,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : 0,
      };

      await onAdd(data);
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={handleClose} className="p-2">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <AppText className="text-gray-800 font-semibold text-[17px]">Add Property</AppText>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg ${isLoading ? "bg-gray-200" : "bg-[#03BF62]"}`}
          >
            <AppText className={`font-semibold text-[15px] ${isLoading ? "text-gray-400" : "text-white"}`}>
              {isLoading ? "Adding..." : "Add"}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Property Type Selection */}
          <View className="px-4 pt-4">
            <AppText className="text-gray-600 font-medium text-[13px] mb-2">Property Type</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setPropertyType(type.value)}
                  className={`mr-2 px-4 py-3 rounded-xl flex-row items-center ${
                    propertyType === type.value
                      ? "bg-[#03BF62]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={18}
                    color={propertyType === type.value ? "#FFF" : "#6B7280"}
                  />
                  <AppText
                    className={`ml-2 text-[13px] font-medium ${
                      propertyType === type.value ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {type.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Property Name */}
          <View className="px-4 pt-4">
            <AppText className="text-gray-600 font-medium text-[13px] mb-2">Property Name *</AppText>
            <View className="bg-white rounded-xl border border-gray-200">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Beach House, Investment Property 1"
                placeholderTextColor="#9CA3AF"
                className="px-4 py-3 text-[15px] text-gray-800"
              />
            </View>
          </View>

          {/* Address Section */}
          <View className="px-4 pt-4">
            <AppText className="text-gray-600 font-medium text-[13px] mb-2">Address (Optional)</AppText>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="Street Address"
                placeholderTextColor="#9CA3AF"
                className="px-4 py-3 text-[15px] text-gray-800 border-b border-gray-100"
              />
              <View className="flex-row">
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 px-4 py-3 text-[15px] text-gray-800 border-r border-gray-100"
                />
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  className="w-20 px-4 py-3 text-[15px] text-gray-800 border-r border-gray-100"
                  autoCapitalize="characters"
                  maxLength={2}
                />
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="ZIP"
                  placeholderTextColor="#9CA3AF"
                  className="w-24 px-4 py-3 text-[15px] text-gray-800"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
          </View>

          {/* Financial Details */}
          <View className="px-4 pt-4">
            <AppText className="text-gray-600 font-medium text-[13px] mb-2">Financial Details</AppText>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <AppText className="text-gray-500 text-[14px] w-32">Purchase Price *</AppText>
                <View className="flex-1 flex-row items-center">
                  <AppText className="text-gray-400 text-[15px] mr-1">$</AppText>
                  <TextInput
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] text-gray-800 text-right"
                  />
                </View>
              </View>
              <View className="flex-row items-center px-4 py-3">
                <AppText className="text-gray-500 text-[14px] w-32">Current Value</AppText>
                <View className="flex-1 flex-row items-center">
                  <AppText className="text-gray-400 text-[15px] mr-1">$</AppText>
                  <TextInput
                    value={currentValue}
                    onChangeText={setCurrentValue}
                    placeholder="Same as purchase"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] text-gray-800 text-right"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Mortgage Toggle */}
          <View className="px-4 pt-4">
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={20} color="#6B7280" />
                  <AppText className="text-gray-700 text-[15px] ml-2">Has Mortgage</AppText>
                </View>
                <Switch
                  value={hasMortgage}
                  onValueChange={setHasMortgage}
                  trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
                  thumbColor={hasMortgage ? "#03BF62" : "#F3F4F6"}
                />
              </View>

              {hasMortgage && (
                <>
                  <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                    <AppText className="text-gray-500 text-[14px] w-32">Balance</AppText>
                    <View className="flex-1 flex-row items-center">
                      <AppText className="text-gray-400 text-[15px] mr-1">$</AppText>
                      <TextInput
                        value={mortgageBalance}
                        onChangeText={setMortgageBalance}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="flex-1 text-[15px] text-gray-800 text-right"
                      />
                    </View>
                  </View>
                  <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                    <AppText className="text-gray-500 text-[14px] w-32">Payment/mo</AppText>
                    <View className="flex-1 flex-row items-center">
                      <AppText className="text-gray-400 text-[15px] mr-1">$</AppText>
                      <TextInput
                        value={mortgagePayment}
                        onChangeText={setMortgagePayment}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="flex-1 text-[15px] text-gray-800 text-right"
                      />
                    </View>
                  </View>
                  <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                    <AppText className="text-gray-500 text-[14px] w-32">Interest Rate</AppText>
                    <View className="flex-1 flex-row items-center">
                      <TextInput
                        value={interestRate}
                        onChangeText={setInterestRate}
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                        className="flex-1 text-[15px] text-gray-800 text-right"
                      />
                      <AppText className="text-gray-400 text-[15px] ml-1">%</AppText>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Rental Toggle */}
          <View className="px-4 pt-4 pb-8">
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center">
                  <Ionicons name="key" size={20} color="#6B7280" />
                  <AppText className="text-gray-700 text-[15px] ml-2">Rental Property</AppText>
                </View>
                <Switch
                  value={isRental}
                  onValueChange={setIsRental}
                  trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
                  thumbColor={isRental ? "#03BF62" : "#F3F4F6"}
                />
              </View>

              {isRental && (
                <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                  <AppText className="text-gray-500 text-[14px] w-32">Monthly Rent</AppText>
                  <View className="flex-1 flex-row items-center">
                    <AppText className="text-gray-400 text-[15px] mr-1">$</AppText>
                    <TextInput
                      value={monthlyRent}
                      onChangeText={setMonthlyRent}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="flex-1 text-[15px] text-gray-800 text-right"
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const AddPropertyModal = memo(AddPropertyModalComponent);
export default AddPropertyModal;
