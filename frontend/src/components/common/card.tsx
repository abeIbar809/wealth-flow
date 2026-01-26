import { PropsWithChildren } from "react";
import { View } from "react-native";
import { ClassNameValue, twMerge } from "tailwind-merge";

export interface CardProps {
  className?: ClassNameValue;
}

export default function Card({ ...props }: PropsWithChildren<CardProps>): React.JSX.Element {
  return (
    <>
      <View
        className={twMerge(
          `w-5/6 h-[200] rounded-[18] shadow-xl items-center`,
          props.className
        )}
      >
        {props.children}
      </View>
    </>
  );
}