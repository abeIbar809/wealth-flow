import { AppText } from "@/src/components/common/app-text";
import realEstateService from "@/src/services/realEstateService";

import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface AllocationItem {
  type: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PropertyTypeChartProps {
  allocation: AllocationItem[];
  isLoading: boolean;
}

function PropertyTypeChartComponent({ allocation, isLoading }: PropertyTypeChartProps) {
  const pieData = useMemo(() => {
    if (allocation.length === 0) {
      return [{ value: 1, color: "#E5E7EB" }];
    }

    return allocation.map((item) => ({
      value: item.value,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
    }));
  }, [allocation]);

  if (isLoading && allocation.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCenter}>
          <View style={styles.loadingCircle} />
        </View>
      </View>
    );
  }

  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>Portfolio by Type</AppText>
        <AppText style={styles.totalValue}>
          {realEstateService.formatCurrency(totalValue)}
        </AppText>
      </View>

      {allocation.length > 0 ? (
        <View style={styles.content}>
          {/* Pie Chart */}
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              donut
              radius={60}
              innerRadius={40}
              innerCircleColor="#FFFFFF"
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <AppText style={styles.centerNumber}>
                    {allocation.length}
                  </AppText>
                  <AppText style={styles.centerText}>Types</AppText>
                </View>
              )}
            />
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {allocation.slice(0, 4).map((item) => (
              <View key={item.type} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <View style={styles.legendContent}>
                  <View style={styles.legendRow}>
                    <AppText style={styles.legendLabel} numberOfLines={1}>
                      {item.label}
                    </AppText>
                    <AppText style={styles.legendPercent}>
                      {item.percentage.toFixed(1)}%
                    </AppText>
                  </View>
                  <AppText style={styles.legendValue}>
                    {realEstateService.formatCurrency(item.value)}
                  </AppText>
                </View>
              </View>
            ))}
            {allocation.length > 4 && (
              <AppText style={styles.moreText}>
                +{allocation.length - 4} more types
              </AppText>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <AppText style={styles.emptyNumber}>0</AppText>
          </View>
          <AppText style={styles.emptyText}>No properties yet</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
  },
  loadingCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingCircle: {
    width: 128,
    height: 128,
    backgroundColor: "#F3F4F6",
    borderRadius: 64,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 16,
  },
  totalValue: {
    color: "#6B7280",
    fontSize: 13,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    alignItems: "center",
  },
  centerNumber: {
    color: "#1F2937",
    fontWeight: "bold",
    fontSize: 18,
  },
  centerText: {
    color: "#6B7280",
    fontSize: 10,
  },
  legend: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendContent: {
    flex: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLabel: {
    color: "#374151",
    fontSize: 13,
  },
  legendPercent: {
    color: "#6B7280",
    fontSize: 12,
  },
  legendValue: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  moreText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    backgroundColor: "#F3F4F6",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyNumber: {
    color: "#9CA3AF",
    fontSize: 32,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
});

export const PropertyTypeChart = memo(PropertyTypeChartComponent);
export default PropertyTypeChart;
