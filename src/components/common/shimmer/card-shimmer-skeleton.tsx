import Animated, { FadeIn } from "react-native-reanimated";
// or 'expo-linear-gradient'
import React, { PropsWithChildren } from "react";
import { CardShimmer } from "./card-shimmer";

export interface ShimmerSkeletionProps {
  isActive:boolean
  isDark?:boolean
  width:number,
  height:number,
}

export function ShimmerSkeletion({children, ...props} : PropsWithChildren<ShimmerSkeletionProps>) : React.JSX.Element {
  return (<>
  { !props.isActive ? 
   <> {children} </> : <>
   <Animated.View entering={FadeIn.duration(1000)}>
   <CardShimmer label="SHimmer" width={props.width} height={props.height}>
   </CardShimmer>
   </Animated.View>
  </> 
  }
  </>);
}