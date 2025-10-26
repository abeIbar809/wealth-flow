import {  View, type ViewProps } from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { PropsWithChildren } from "react";
import { themes } from "@/src/constants/theme";
import { useColorScheme } from 'nativewind'

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}