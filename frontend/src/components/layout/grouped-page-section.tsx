import { PropsWithChildren } from "react";
import { View } from "react-native";
import { ClassNameValue, twMerge } from "tailwind-merge";


export interface GroupedPageSectionProps {
    className?: ClassNameValue;
  }
  
export default function GroupedPageSection({...props}: PropsWithChildren<GroupedPageSectionProps>): React.JSX.Element {
    return (
      <View className={twMerge(`items-center w-full`, props.className)}>
        {props.children}
      </View>
    );
}