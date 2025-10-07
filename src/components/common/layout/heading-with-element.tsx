import React, { PropsWithChildren } from "react";
import { View,Text } from "react-native";
import { ClassNameValue, twMerge } from "tailwind-merge";

export interface HeadingWithElementProps {
    heading: String;
    className?: ClassNameValue;
    classNameHeader?: ClassNameValue;
}
  
export default function HeadingWithElement({...props}: PropsWithChildren<HeadingWithElementProps>): React.JSX.Element {
    return (
      <>
        <View className={twMerge(`flex flex-row w-full justify-between pl-10 pr-10 mt-7 mb-7`,props.classNameHeader)}>
          <Text className={twMerge(`text-3xl font-bold color-[#2D2F43]"`,props.className)}>
            {props.heading}
          </Text>
          {props.children}
        </View>
      </>
    );
  }