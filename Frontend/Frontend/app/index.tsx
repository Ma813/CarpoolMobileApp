import { Text, View, TextInput, Button, TouchableOpacity } from "react-native";
import UserWorkTimesPage from "../components/UserWorkTime";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Link } from "expo-router";

export default function Index() {
  const [text, setText] = useState("");
  const [day, setDay] = useState("");
  const [workTime, setworkTime] = useState<UserWorkTime[] | null>(null);

  useEffect(() => {
      getUserWorkTime().then((workTime) => {
        setworkTime(workTime);
      });
  }, []);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("user_name", JSON.stringify({ text }));
      alert("Data saved!");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("user_name");
      if (value !== null) {
        const parsedValue = JSON.parse(value);
        alert("Retrieved data: " + parsedValue.text);
      } else {
        alert("No data found");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const removeData = async () => {
    try {
      await AsyncStorage.removeItem("user_name");
      alert("Data removed!");
    } catch (error) {
      console.error("Error removing data:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
      <Link href="/user-work-time">User Work Time</Link>
      {workTime && workTime.map((item, index) => (
        <View key={index} style={{ marginVertical: 5 }}>
          <Text>{item.day}</Text>
        </View>
      ))}
      <Text>{day}</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          width: "80%",
          paddingHorizontal: 10,
        }}
        placeholder="Type here"
        onChangeText={setText}
        value={text}
      />
      <Button
        title="Submit"
        onPress={() => {
          saveData().catch((error) => {
            console.error("Error saving data:", error);
          });
        }}
      />

      <Button
        title="Retrieve"
        onPress={() => {
          getData().catch((error) => {
            console.error("Error retrieving data:", error);
          });
        }}
      />

      <Button
        title="Remove"
        onPress={() => {
          removeData().catch((error) => {
            console.error("Error removing data:", error);
          });
        }}
      />

      <Text>Main Page</Text>
    </View>
  );
};


export default GoogleNaps;
