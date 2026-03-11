import React from "react";
import { View, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Asset } from "../types/Asset";

// Props needed to draw the asset allocation pie chart.
type AssetPieChartProps = {
  data: Asset[];
  size: number;
  chartConfig: any;
};

export default function AssetPieChart({
  data,
  size,
  chartConfig,
}: AssetPieChartProps) {
  return (
    <View>
      <PieChart
        // Each item in data becomes one slice of the pie chart.
        data={data}
        width={size}
        height={size}
        chartConfig={chartConfig}
        // Use the population field to decide how large each slice should be.
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="65"
        // The legend is rendered separately in the parent component.
        hasLegend={false}
      />
    </View>
  );
}