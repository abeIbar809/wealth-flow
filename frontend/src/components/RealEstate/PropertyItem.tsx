import { AppText } from "@/src/components/common/app-text";
import realEstateService, { Property } from "@/src/services/realEstateService";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { memo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

interface PropertyItemProps {
  property: Property;
  index: number;
  onPress: (property: Property) => void;
  onLongPress?: (property: Property) => void;
}

const PROPERTY_TYPE_ICONS: Record<string, string> = {
  single_family: "home",
  multi_family: "business",
  condo: "albums",
  townhouse: "grid",
  apartment: "cube",
  commercial: "storefront",
  land: "map",
  other: "ellipsis-horizontal",
};

const PROPERTY_TYPE_COLORS: Record<string, string> = {
  single_family: "#03BF62",
  multi_family: "#3B82F6",
  condo: "#F59E0B",
  townhouse: "#8B5CF6",
  apartment: "#EF4444",
  commercial: "#10B981",
  land: "#6366F1",
  other: "#9CA3AF",
};

function PropertyItemComponent({
  property,
  index,
  onPress,
  onLongPress,
}: PropertyItemProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(property);
  };

  const handleLongPress = async () => {
    if (onLongPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onLongPress(property);
    }
  };

  const currentValue = property.currentValue || property.purchasePrice;
  const equity = currentValue - (property.mortgageBalance || 0);
  const appreciation = currentValue - property.purchasePrice;

  const iconName = PROPERTY_TYPE_ICONS[property.propertyType] || "home";
  const iconColor = PROPERTY_TYPE_COLORS[property.propertyType] || "#03BF62";
  const isPositive = appreciation >= 0;

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        style={styles.container}
      >
        {/* Property Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>

        {/* Property Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText style={styles.name} numberOfLines={1}>
              {property.name}
            </AppText>
            {property.isRental && (
              <View style={styles.rentalBadge}>
                <AppText style={styles.rentalText}>RENTAL</AppText>
              </View>
            )}
          </View>
          <AppText style={styles.type} numberOfLines={1}>
            {realEstateService.getPropertyTypeLabel(property.propertyType)}
            {property.address?.city ? ` - ${property.address.city}` : ""}
          </AppText>
          {property.isRental && property.monthlyRent > 0 && (
            <AppText style={styles.rent}>
              Rent: {realEstateService.formatCurrency(property.monthlyRent)}/mo
            </AppText>
          )}
        </View>

        {/* Value and Change */}
        <View style={styles.valueContainer}>
          <AppText style={styles.value}>
            {realEstateService.formatCurrency(currentValue)}
          </AppText>
          <View style={styles.changeRow}>
            <Ionicons
              name={isPositive ? "trending-up" : "trending-down"}
              size={12}
              color={isPositive ? "#03BF62" : "#EF4444"}
            />
            <AppText
              style={[
                styles.change,
                { color: isPositive ? "#03BF62" : "#EF4444" }
              ]}
            >
              {isPositive ? "+" : ""}
              {realEstateService.formatCurrency(appreciation)}
            </AppText>
          </View>
          <AppText style={styles.equity}>
            Equity: {realEstateService.formatCurrency(equity)}
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 15,
  },
  rentalBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
  },
  rentalText: {
    color: "#1D4ED8",
    fontSize: 10,
    fontWeight: "500",
  },
  type: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  rent: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 2,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  value: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 15,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  equity: {
    color: "#9CA3AF",
    fontSize: 11,
  },
});

export const PropertyItem = memo(PropertyItemComponent);
export default PropertyItem;
