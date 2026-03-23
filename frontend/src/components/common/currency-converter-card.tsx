import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import currencyService from "@/src/services/CurrencyService";

const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "MXN"];

export default function CurrencyConverterCard() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runConversion = async () => {
    Keyboard.dismiss();

    const numericAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount");
      setResult(null);
      setRate(null);
      setDate(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await currencyService.convert(numericAmount, from, to);

      setResult(data.convertedAmount);
      setRate(data.rate);
      setDate(data.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setResult(null);
      setRate(null);
      setDate(null);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    Keyboard.dismiss();
    setFrom(to);
    setTo(from);
    setResult(null);
    setRate(null);
    setDate(null);
    setError(null);
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-3">Currency Converter</Text>

      <Text className="text-sm mb-1">Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={runConversion}
        placeholder="Enter amount"
        className="border border-gray-300 rounded-xl px-3 py-3 mb-3"
      />

      <Text className="text-sm mb-2">From</Text>
      <View className="flex-row flex-wrap mb-3">
        {DEFAULT_CURRENCIES.map((code) => (
          <Pressable
            key={`from-${code}`}
            onPress={() => {
              setFrom(code);
              setError(null);
            }}
            className={`px-3 py-2 rounded-full mr-2 mb-2 ${
              from === code ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text className={from === code ? "text-white" : "text-black"}>
              {code}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm mb-2">To</Text>
      <View className="flex-row flex-wrap mb-3">
        {DEFAULT_CURRENCIES.map((code) => (
          <Pressable
            key={`to-${code}`}
            onPress={() => {
              setTo(code);
              setError(null);
            }}
            className={`px-3 py-2 rounded-full mr-2 mb-2 ${
              to === code ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text className={to === code ? "text-white" : "text-black"}>
              {code}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row mb-3">
        <Pressable
          onPress={swapCurrencies}
          className="bg-gray-200 rounded-xl px-4 py-3 mr-2"
        >
          <Text>Swap</Text>
        </Pressable>

        <Pressable
          onPress={runConversion}
          disabled={loading}
          className="bg-black rounded-xl px-4 py-3 flex-1 items-center"
        >
          <Text className="text-white font-semibold">
            {loading ? "Converting..." : "Convert"}
          </Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator />}
      {error && <Text className="text-red-500 mt-1">{error}</Text>}

      {result !== null && !Number.isNaN(result) && (
        <View className="mt-2">
          <Text className="text-base font-medium">
            {Number(amount).toFixed(2)} {from} = {result.toFixed(2)} {to}
          </Text>

          {rate !== null && !Number.isNaN(rate) && (
            <Text className="text-gray-500 mt-1">
              1 {from} = {rate.toFixed(4)} {to}
            </Text>
          )}

          {date && (
            <Text className="text-gray-400 mt-1">
              Rate date: {date}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}