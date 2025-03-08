import { styles } from "./styles";
import { Link, useNavigation } from "expo-router";
import { removeData, getData } from "@/services/localStorage";
import { Text, View, TextInput, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { UserWorkTime } from "@/types/UserWorkTime";
import { getUserWorkTimes } from "@/services/workTimeApi";

const GoogleNaps = () => {
  const [username, setUsername] = useState("");
  const [day, setDay] = useState("");
  const [workTime, setworkTime] = useState<UserWorkTime[] | null>(null);

  const handleLogout = () => {
    // Logout logic here
    removeData("token");
    removeData("username");
    fetchData();
  };

  const fetchData = async () => {
    const username = await getData("username");
    setUsername(username);
  };

  useEffect(() => {
    fetchData();
    getUserWorkTimes().then((workTime) => {
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
            <Link href="/pages/CarSelect" style={styles.button}>
              Add Car
            </Link>

            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      )}
    </View>
  );
};

export default GoogleNaps;
