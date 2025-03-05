import { View, StyleSheet } from "react-native";
import WeatherForecastPage from "./pages/WeatherForecast";
import LoginPage from "./pages/LoginPage";
import React from "react";
import { styles } from "./styles";
import { Link } from 'expo-router';

const GoogleNaps = () => {
  return (
    <View>
      <View style={styles.container}>
        <Link href="/pages/WeatherForecast" style={styles.button}>
          Weather Forecast
        </Link>
        <Link href="/pages/LoginPage" style={styles.button}>
          Login
        </Link>
      </View>
    </View>
  );
};


export default GoogleNaps;
