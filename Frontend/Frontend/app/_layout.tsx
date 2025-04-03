import { Stack } from "expo-router";
import React from "react";
import { navigationRef } from "./navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavBar } from "./components/NavBar";
import { useRoute } from "@react-navigation/native";

const localStack = createNativeStackNavigator();

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home", gestureEnabled: false, headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="pages/LoginPage"
        options={{ title: "Login", gestureEnabled: false, headerShown: false }}
      />
      <Stack.Screen
        name="pages/Map"
        options={{
          title: "View Map",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pages/RegisterPage"
        options={{
          title: "Register",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pages/Profile"
        options={{
          title: "Profile",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pages/Party"
        options={{
          title: "Profile",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
