import { PropsWithChildren } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { CardShimmer } from "./card-shimmer";
import { ShimmerLayoutExample } from "./layout-shimmer";



export interface LayoutShimmerSkeletionProps {
  isActive:boolean
  isDark?:boolean
  width:number,
  height:number,
}


export function LayoutShimmerSkeleton({
  children,
  ...props
}: PropsWithChildren<LayoutShimmerSkeletionProps>): React.JSX.Element {
  return (
  <> 
     {!props.isActive && <>{children}</>}
     {props.isActive && <Animated.View entering={FadeIn.duration(1000)}>
        <ShimmerLayoutExample>
        </ShimmerLayoutExample>
      </Animated.View>}
  </>
);
}