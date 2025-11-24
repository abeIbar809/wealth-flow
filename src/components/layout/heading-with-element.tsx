import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { ClassNameValue, twMerge } from "tailwind-merge";
import { AppText } from "../common/app-text";

export interface HeadingWithElementProps {
  heading: String;
  className?: ClassNameValue;
  classNameHeader?: ClassNameValue;
}

export default function HeadingWithElement({ ...props }: PropsWithChildren<HeadingWithElementProps>): React.JSX.Element {
  return (
    <>
      <View className={twMerge(`flex flex-row w-full justify-between pl-10 pr-10 mt-7 mb-7`, props.classNameHeader)}>
        <AppText type="title">
          {props.heading}
        </AppText>
        {props.children}
      </View>
    </>
  );
}