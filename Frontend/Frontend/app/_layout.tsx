import { Stack } from "expo-router";
import React from "react";
import { navigationRef } from "./navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const localStack = createNativeStackNavigator();

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home', gestureEnabled: false, headerShown: false }} />
      <Stack.Screen name="pages/LoginPage" options={{ title: 'Login', gestureEnabled: false, headerShown: false  }} />
      <Stack.Screen name="pages/WeatherForecast" options={{ title: 'Weather Forecast', gestureEnabled: false  }} />
      <Stack.Screen name="pages/UserWorkTime" options={{ title: 'Work Times', gestureEnabled: false  }} />
      <Stack.Screen
        name="pages/CarSelect"
        options={{ title: "Car Select", gestureEnabled: false }}
      />
      <Stack.Screen name="pages/RegisterPage" options={{ title: 'Register', gestureEnabled: false  }} />
    </Stack>
  );
}
