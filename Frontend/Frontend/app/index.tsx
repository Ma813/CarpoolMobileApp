import { View, Button, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "./styles";
import { Link, useNavigation } from 'expo-router';
import { removeData, getData } from "@/services/localStorage";

const GoogleNaps = () => {

  const [username, setUsername] = useState('');

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

  useEffect(() => {
    fetchData();
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
  
            <Link href="/pages/WorkTimesPage" style={styles.button}>
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
