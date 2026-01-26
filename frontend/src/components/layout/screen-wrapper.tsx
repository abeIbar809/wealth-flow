import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

interface ScreenWrapperProps {
    className?: string
}

export default function ScreenWrapper({ ...props }: React.PropsWithChildren<ScreenWrapperProps>) {
    return (
        <View className={twMerge("items-center pt-10 bg-white flex-1", props.className)}>
            {props.children}
        </View>
    );
}

