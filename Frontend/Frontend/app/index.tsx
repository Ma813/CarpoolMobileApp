import { styles } from "./styles";
import { Link, useNavigation } from "expo-router";
import { removeData, getData } from "@/services/localStorage";
import { Text, View, TextInput, Button, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { UserWorkTime } from "@/types/UserWorkTime";
import { getUserWorkTimes } from "@/services/workTimeApi";
import LoginPage from "./pages/LoginPage";

const GoogleNaps = () => {
  const [username, setUsername] = useState(null);
  const [day, setDay] = useState("");
  const [workTime, setworkTime] = useState<UserWorkTime[] | null>(null);
  const navigation = useNavigation<any>();

  const handleLogout = async () => {

    await removeData('token');
    await removeData('username');
    fetchData();
  };

  const fetchData = async () => {
    const username = await getData("username");
    setUsername(username);
    if (!username) {
      navigation.navigate('pages/LoginPage');
    }
  }

  useEffect(() => {
    fetchData();
    getUserWorkTimes().then((workTime) => {
      setworkTime(workTime);
    });
  }, []);

  if (!username) {
    return <View><Text>Loading...</Text></View>
  }

  return (
    
        <View style={styles.container}>
          <Text>Logged in as: {username}</Text>

          <View style={styles.container}>
            {/* Uncomment and use if needed */}
            {/* <Link href="/pages/WeatherForecast" style={styles.button}>
              Weather Forecast
            </Link> */}

            <Link href="/pages/UserWorkTime" style={styles.button}>
              Work Times
            </Link>
            <Link href="/pages/CarSelect" style={styles.button}>
              Add Car
            </Link>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </View>
      )};

export default GoogleNaps;
