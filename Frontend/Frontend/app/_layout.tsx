import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="pages/RegisterPage" options={{ title: 'Register' }} />
      <Stack.Screen name="pages/LoginPage" options={{ title: 'Login' }} />
      <Stack.Screen name="pages/WeatherForecast" options={{ title: 'Weather Forecast' }} />
    </Stack>
  );

}
