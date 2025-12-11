import { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { ClassNameValue, twMerge } from "tailwind-merge";

export interface CardProps {
  className?: ClassNameValue;
}

export default function Card({ ...props }: PropsWithChildren<CardProps>): React.JSX.Element {
  return (
    <>
      <Pressable
        className={twMerge(
          `w-3/4 h-[200] bg-[#03BF62] rounded-[18] pl-6 shadow-xl`,
          props.className
        )}
        onPress={()=>console.log("her")}
      >
        {props.children}
      </Pressable>
    </>
  );
}
