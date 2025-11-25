import { Stack } from "expo-router";
import React, { useState } from "react";



export default function Rootlayout() {

  // NOTE: If working on a page in (tabs) just set boolean to true and reload. 
  // TODO: AuthState. Need a global state to access and set authentication variables. Ex: can use Zuestand Stores,ReactContext...etc.
  const [isAuth, setAuth] = useState(false)

  return (
    <Stack>
      {/* Protected Routes. When isAuth is true tabs page is Open.*/}
      <Stack.Protected guard={!!isAuth}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Protected Routes. When isAuth is false authScreen is open.*/}
      <Stack.Protected guard={!isAuth}>
        <Stack.Screen name="authentication" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

