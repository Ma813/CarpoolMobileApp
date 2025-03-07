import { styles } from "./styles";
import { Link, useNavigation } from 'expo-router';
import { removeData, getData } from "@/services/localStorage";
import { Text, View, TextInput, Button, TouchableOpacity } from "react-native";
import UserWorkTimesPage from "../components/UserWorkTime";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserWorkTime } from "@/types/UserWorkTime";
import { getUserWorkTime } from "@/services/api";

const GoogleNaps = () => {

  const [username, setUsername] = useState('');
  const [day, setDay] = useState("");
  const [workTime, setworkTime] = useState<UserWorkTime[] | null>(null);

  const handleLogout = () => {
    // Logout logic here
    removeData('token');
    removeData('username');
    fetchData();
  }

  const fetchData = async () => {
    const user = await getData('username');
    setUsername(user);
  };
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

  useEffect(() => {
    fetchData();
    getUserWorkTime().then((workTime) => {
      setworkTime(workTime);
    });
  }, []);

  return (
    <View style={styles.container}>
      {!username ? (
        <>
          <Text>Not logged in</Text>
          <Link href="/pages/LoginPage" style={styles.button}>
            Login
          </Link>
        </>
      ) : (
        <>
          <Text>Logged in as: {username}</Text>
          <View style={styles.container}>
            <Link href="/pages/WeatherForecast" style={styles.button}>
              Weather Forecast
            </Link>
  
            <Link href="/pages/UserWorkTime" style={styles.button}>
              Work Times
            </Link>
  
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      )}
    </View>
  );
};

export default GoogleNaps;