import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="pages/LoginPage" options={{ title: "Login" }} />
      <Stack.Screen
        name="pages/UserWorkTime"
        options={{ title: "User Work Times" }}
      />
    </Stack>
  );
}
