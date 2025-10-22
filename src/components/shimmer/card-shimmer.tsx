// or 'expo-linear-gradient'
import { useWindowDimensions, View } from "react-native";
import { GradientShimmerPropsType } from 'react-native-gradient-shimmer';
import { CreatedGradientShimmer } from "./shimmer-util";

export const CardShimmer = ({
  label,
  width,
  height,
  ...others
}: {
  label: string;
  width?: GradientShimmerPropsType['width'];
  height?: GradientShimmerPropsType['height'];
  highlightWidth?: GradientShimmerPropsType['highlightWidth'];
  duration?: GradientShimmerPropsType['duration'];
  backgroundColor?: GradientShimmerPropsType['backgroundColor'];
  highlightColor?: GradientShimmerPropsType['highlightColor'];
}) => {
  const {width: windowWidth} = useWindowDimensions();
  const horizontalMargin = 16;
  const shimmerWidth = width ?? windowWidth - horizontalMargin * 2;
  return (
    <View
      style={{
        marginHorizontal: horizontalMargin,
      }}>
      <CreatedGradientShimmer
        height={height as number}
        width={shimmerWidth}
        style={{
          borderRadius: 8,
        }}
        {...others}
      />
    </View>
  );
};
