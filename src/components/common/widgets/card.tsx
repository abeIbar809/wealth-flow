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
          `w-3/4 h-[200] bg-[#03BF62] rounded-[18] pl-6 shadow-xl`,
          props.className
        )}
      >
        {props.children}
      </View>
    </>
  );
}
