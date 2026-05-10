import { AppText } from "@/src/components/common/app-text";
import realEstateService, { PortfolioSummary } from "@/src/services/realEstateService";

import Ionicons from "@expo/vector-icons/Ionicons";
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";

interface RealEstatePortfolioCardProps {
  summary: PortfolioSummary | null;
  isLoading: boolean;
}

function RealEstatePortfolioCardComponent({
  summary,
  isLoading,
}: RealEstatePortfolioCardProps) {
  if (isLoading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <View>
          <View style={styles.loadingLine1} />
          <View style={styles.loadingLine2} />
          <View style={styles.loadingRow}>
            <View style={styles.loadingLine3} />
            <View style={styles.loadingLine3} />
          </View>
        </View>
      </View>
    );
  }

  const isPositive = (summary?.totalAppreciation || 0) >= 0;
  const cashFlowPositive = (summary?.netMonthlyCashFlow || 0) >= 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={18} color="#FFF" />
          </View>
          <AppText style={styles.headerTitle}>Real Estate Portfolio</AppText>
        </View>
        <View style={styles.propertyBadge}>
          <AppText style={styles.propertyCount}>
            {summary?.totalProperties || 0} Properties
          </AppText>
        </View>
      </View>

      {/* Total Value */}
      <View style={styles.valueSection}>
        <AppText style={styles.valueLabel}>Total Value</AppText>
        <AppText style={styles.valueAmount}>
          {realEstateService.formatCurrency(summary?.totalValue || 0)}
        </AppText>
        <View style={styles.changeRow}>
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={14}
            color={isPositive ? "#10B981" : "#EF4444"}
          />
          <AppText
            style={[
              styles.changeText,
              { color: isPositive ? "#6EE7B7" : "#FCA5A5" }
            ]}
          >
            {isPositive ? "+" : ""}
            {realEstateService.formatCurrency(summary?.totalAppreciation || 0)}
            {" "}
            ({isPositive ? "+" : ""}
            {(summary?.appreciationPercent || 0).toFixed(1)}%)
          </AppText>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Equity */}
        <View style={styles.metricHalf}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <AppText style={styles.metricLabel}>Equity</AppText>
            </View>
            <AppText style={styles.metricValue}>
              {realEstateService.formatCurrency(summary?.totalEquity || 0)}
            </AppText>
          </View>
        </View>

        {/* Debt */}
        <View style={styles.metricHalf}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="card" size={14} color="#F59E0B" />
              <AppText style={styles.metricLabel}>Debt</AppText>
            </View>
            <AppText style={styles.metricValue}>
              {realEstateService.formatCurrency(summary?.totalDebt || 0)}
            </AppText>
          </View>
        </View>

        {/* Monthly Income */}
        <View style={styles.metricHalf}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="arrow-up-circle" size={14} color="#3B82F6" />
              <AppText style={styles.metricLabel}>Monthly Income</AppText>
            </View>
            <AppText style={styles.metricValue}>
              {realEstateService.formatCurrency(summary?.totalMonthlyIncome || 0)}
            </AppText>
          </View>
        </View>

        {/* Net Cash Flow */}
        <View style={styles.metricHalf}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons
                name={cashFlowPositive ? "trending-up" : "trending-down"}
                size={14}
                color={cashFlowPositive ? "#10B981" : "#EF4444"}
              />
              <AppText style={styles.metricLabel}>Net Cash Flow</AppText>
            </View>
            <AppText
              style={[
                styles.metricValue,
                { color: cashFlowPositive ? "#6EE7B7" : "#FCA5A5" }
              ]}
            >
              {cashFlowPositive ? "+" : ""}
              {realEstateService.formatCurrency(summary?.netMonthlyCashFlow || 0)}
              <AppText style={styles.perMonth}>/mo</AppText>
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    marginTop:-90,
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
  },
  loadingLine1: {
    width: 128,
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingLine2: {
    width: 192,
    height: 32,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
  },
  loadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadingLine3: {
    width: 80,
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  propertyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  propertyCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  valueSection: {
    marginBottom: 16,
  },
  valueLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginBottom: 4,
  },
  valueAmount: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 22,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  metricHalf: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  metricCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metricLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    marginLeft: 4,
  },
  metricValue: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  perMonth: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
  },
});

export const RealEstatePortfolioCard = memo(RealEstatePortfolioCardComponent);
export default RealEstatePortfolioCard;
