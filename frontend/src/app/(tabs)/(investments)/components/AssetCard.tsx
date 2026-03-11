import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Asset } from "../types/Asset";

// Props needed to show one asset card and handle selection.
type AssetCardProps = {
  asset: Asset;
  maxValue: number;
  onPress: () => void;
};

export default function AssetCard({ asset, maxValue, onPress }: AssetCardProps) {
  // Turn the asset value into a percentage so the bar can fill correctly.
  const percent = maxValue > 0 ? (asset.population / maxValue) * 100 : 0;

  return (
    <TouchableOpacity
      // Tapping the card lets the parent screen react to this asset.
      onPress={onPress}
      style={{
        width: 120,
        marginRight: 16,
        backgroundColor: "#222",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {asset.name}
      </Text>

      <View
        style={{
          height: 10,
          width: "100%",
          backgroundColor: "#333",
          borderRadius: 5,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        {/* This inner view is the colored fill of the progress bar. */}
        <View
          style={{
            height: "100%",
            width: `${percent}%`,
            backgroundColor: asset.color,
          }}
        />
      </View>

      <Text
        style={{
          color: "#aaa",
          fontSize: 12,
        }}
      >
        {/* Show the asset's total value under the bar. */}
        ${asset.population.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}