// or 'expo-linear-gradient'
import { LinearGradient } from 'expo-linear-gradient';
import { createGradientShimmer } from 'react-native-gradient-shimmer';

export function easeInOutCirc(value: number): number {
  return value < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * value, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * value + 2, 2)) + 1) / 2;
}

export const CreatedGradientShimmer = createGradientShimmer({
  LinearGradientComponent: LinearGradient,
  easing: easeInOutCirc,
});