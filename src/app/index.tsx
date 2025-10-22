
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function Start() {
  const [isAuth, setAuth] = useState(true);

  useEffect(() => {});
  
  return (
      <View>
        {isAuth && <Redirect href="/authentication" />}
        {!isAuth && <Redirect href="/(tabs)/(home)" />}
      </View>
  );
}
