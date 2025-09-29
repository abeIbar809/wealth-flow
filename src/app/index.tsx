import { Link, Redirect, useRouter,useRootNavigationState, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View,Text } from "react-native";

function RouteGuard({children} : {children: React.ReactNode}) {

    const router = useRouter()
    const isAuth = false;
  
    useEffect(() => {
      router.replace("/(tabs)/wallet")
    });
  
    return <>{children}</>
  }

export default function Start() {

    const [isAuth,setAuth] = useState(true)

    useEffect(() => { 

    });
    
    return (
     <View> 
        {isAuth && <Redirect href="/authentication"/>}
        {!isAuth && <Redirect href="/(tabs)"/>}
     </View>
  );
}