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
  const [summary, setSummary] = useState<any>(null); // Santrauka duomenims
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  // Funkcija, kad gauti vartotojo duomenis ir santrauką
  const fetchData = async () => {
    const username = await getData("username");
    setUsername(username);
    if (!username) {
      navigation.navigate("pages/LoginPage");
    } else {
      try {
        const summaryData = await getUserSummary(); // Užklausa API
        setSummary(summaryData);
      } catch (error) {
        setError("Nepavyko gauti santraukos.");
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
  }, [username]); // Kviečiame tik tada, kai username pasikeičia
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

      {/* Santrauka rodoma tik jei duomenys įkelti */}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>
            Jūsų aktyvumo santrauka
          </Text>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>
              Bendras važiavimų skaičius: {summary?.total_rides}
            </Text>
            <Text style={styles.summarySectionText}>
              Bendras CO2 emisijos kiekis: {summary?.total_emissions} kg
            </Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>
              Jūsų paskutinė kelionė:
            </Text>
            <Text style={styles.summarySectionText}>
              {summary?.last_ride?.place_name}
            </Text>
            <Text style={styles.summarySectionText}>
              Data: {summary?.last_ride?.date}
            </Text>
            <Text style={styles.summarySectionText}>
              CO₂: {summary?.last_ride?.emissions} kg
            </Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>
              Jūsų daugiausiai lankytinos vietos:
            </Text>
            {summary?.top_destinations?.map(
              (destination: any, index: number) => (
                <Text key={index} style={styles.summarySectionText}>
                  {destination.place_name}
                </Text>
              )
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default GoogleNaps;
