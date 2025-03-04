import React from "react";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="UserWorkTime"
        options={{ title: "User Work Times" }}
      />
    </Stack>
  );
}
