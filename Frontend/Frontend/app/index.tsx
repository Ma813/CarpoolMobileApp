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
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [partyRecommendations, setPartyRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
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
      if (response.data.length > 0) {
        setPartyRecommendations(response.data);
        setHasRecommendations(true); // show notice
      }
    } catch (error) {
      console.log("Error fetching party recommendations:", error);
    }
  };
  const createParty = async () => {
    try {
      const response = await api.post("/party/createParty");
      console.log("Party created:", response.data);
      for (const rec of partyRecommendations) {
        await api.post("/party/addPartyMember", {
          party_id: response.data.id,
          accepted: false,
          user_id: rec.user_id,
          role: "passenger",
        });
        console.log(
          `Added ${rec.user_name} to party with ID ${response.data.id}`
        );
      }
      setHasRecommendations(false); // hide notice
      setShowRecommendations(false);
    } catch (error) {
      console.log("Error creating party:", error);
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
      {hasRecommendations && (
        <TouchableOpacity onPress={() => setShowRecommendations(true)}>
          <View
            style={{
              backgroundColor: "#D1E7DD",
              padding: 12,
              borderRadius: 10,
              margin: 10,
            }}
          >
            <Text
              style={{
                color: "#0F5132",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              🎉 We found some party recommendations! Tap to view.
            </Text>
          </View>
        </TouchableOpacity>
      )}
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
              Total CO₂ Saved: {summary?.total_emissions ?? "None"} kg
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
              CO₂ saved: {summary?.last_ride?.emissions ?? "None"} kg
            </Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionText}>
              Your Top Destinations:
            </Text>
            {summary?.top_destinations?.length > 0 ? (
              summary.top_destinations.map(
                (destination: any, index: number) => (
                  <Text key={index} style={styles.summarySectionText}>
                    {destination.place_name || "Unnamed Place"}
                  </Text>
                )
              )
            ) : (
              <Text style={styles.summarySectionText}>None</Text>
            )}
          </View>
        </View>
      )}
      <Modal
        visible={showRecommendations}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRecommendations(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRecommendations(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxHeight: "60%",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Party Recommendations
                </Text>

                <ScrollView style={{ marginBottom: 20 }}>
                  {partyRecommendations.map((rec, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {rec.user_name}
                      </Text>
                      <Text>Home: {rec.home_address}</Text>
                      <Text>Work: {rec.work_address}</Text>
                      <Text>Distance: {rec.distance.toFixed(1)} meters</Text>
                    </View>
                  ))}
                </ScrollView>

                <Button
                  title="Create Party"
                  onPress={() => {
                    createParty();
                    setShowRecommendations(false);
                    console.log("Create Party clicked");
                  }}
                />

                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Close"
                    onPress={() => setShowRecommendations(false)}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default GoogleNaps;
