import { styles } from "./styles";
import { Link, useNavigation } from "expo-router";
import { removeData, getData } from "@/services/localStorage";
import {
  Text,
  View,
  Button,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { useFonts } from "expo-font";
import api, { getUserSummary } from "@/services/api";

const GoogleNaps = () => {
  const [fontsLoaded] = useFonts({
    Gotham: require("@/assets/fonts/Gotham-Black.otf"),
    "Gotham-Bold": require("@/assets/fonts/Gotham-Bold.otf"),
    "Gotham-Italic": require("@/assets/fonts/Gotham-BlackItalic.otf"),
    "Gotham-Light": require("@/assets/fonts/Gotham-Light.otf"),
  });

  const [username, setUsername] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    const username = await getData("username");
    setUsername(username);
    if (!username) {
      navigation.navigate("pages/LoginPage");
    } else {
      try {
        const summaryData = await getUserSummary();
        setSummary(summaryData);
      } catch (error) {
        setError("Failed to fetch summary.");
      } finally {
        setLoading(false);
      }
    }
  };
  const getPartyReccomendations = async () => {
    try {
      const response = await api.get(`/party/getPartyRecommendations`);
      console.log("Party recommendations:", response.data);
    } catch (error) {
      console.error("Error fetching party recommendations:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);
  
  useEffect(() => {
    getPartyReccomendations();
  }, []);

  if (!username || loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <NavBar />
      <Image source={require("@/assets/images/car.png")} style={styles.image} />
      <Text style={styles.app_name}>COLLAB.RIDE</Text>
      <Text
        style={[
          styles.welcomeText,
          { textAlign: "center", alignSelf: "center" },
        ]}
      >
        Welcome, {username}!
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Your Activity Summary</Text>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>
              Total Rides: {summary?.total_rides ?? "None"}
            </Text>
            <Text style={styles.summarySectionText}>
              Total CO₂ Emissions: {summary?.total_emissions ?? "None"} kg
            </Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>Your Last Ride:</Text>
            <Text style={styles.summarySectionText}>
              {summary?.last_ride?.place_name || "None"}
            </Text>
            <Text style={styles.summarySectionText}>
              Date: {summary?.last_ride?.date || "None"}
            </Text>
            <Text style={styles.summarySectionText}>
              CO₂: {summary?.last_ride?.emissions ?? "None"} kg
            </Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>Your Top Destinations:</Text>
            {summary?.top_destinations?.length > 0 ? (
              summary.top_destinations.map((destination: any, index: number) => (
                <Text key={index} style={styles.summarySectionText}>
                  {destination.place_name || "Unnamed Place"}
                </Text>
              ))
            ) : (
              <Text style={styles.summarySectionText}>None</Text>
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default GoogleNaps;
