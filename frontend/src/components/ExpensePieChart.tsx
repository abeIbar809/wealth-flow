import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, Dimensions, Text } from "react-native";
import { PieChart } from "react-native-chart-kit";
import expenseService, { CategoryTotal } from "@/src/services/ExpenseService";
import { useFocusEffect } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const palette = ["#4dc9f6","#f67019","#f53794","#537bc4","#acc236","#166a8f","#00a950","#58595b","#8549ba"];
const pickColor = (i: number) => palette[i % palette.length];

export default function ExpensePieChart() {
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<CategoryTotal[]>([]);

  // ✅ Define load at component scope so both hooks can call it
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const categories = await expenseService.getCategoryTotals();
      setCats(categories);
    } catch (e) {
      console.warn("Failed to fetch categories", e);
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // optional: initial fetch (you can keep this or remove it; focus effect also runs on first focus)
  useEffect(() => {
    load();
  }, [load]);

  // ✅ Refetch every time this screen/tab is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <ActivityIndicator />;
  if (!cats.length) return <Text style={{ padding: 12 }}>No expenses found</Text>;

  const data = cats
    .map((c, i) => ({
      name: c?.name ?? "Other",
      population: Number.isFinite(c?.amount) ? Math.round(c.amount * 100) / 100 : 0,
      color: pickColor(i),
      legendFontColor: "#333",
      legendFontSize: 12,
    }))
    .filter((d) => d.population > 0);

  return (
    <View style={{ alignItems: "center" }}>
      <PieChart
        data={data}
        width={Math.min(screenWidth - 32, 420)}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
      />
    </View>
  );
}