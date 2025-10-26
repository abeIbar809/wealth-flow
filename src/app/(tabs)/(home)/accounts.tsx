import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HeadingWithElement from "@/src/components/layout/heading-with-element";
import React from "react";
import { Text, View } from "react-native";

export default function Accounts() {
  return (
  <View className="mt-10 items-center">
    <GroupedPageSection>
      <HeadingWithElement heading={"Linked Banks"}/>
      
      
    </GroupedPageSection>
  </View>
  );
}