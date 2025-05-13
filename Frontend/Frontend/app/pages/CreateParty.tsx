import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { NavBar } from "../components/NavBar";
import { getClosestColleagues } from "@/services/addressesApi"; // Import the API call function
import api from "@/services/api";
import { baseurl } from "@/constants/baseurl";

const CreateParty: React.FC = () => {
  const [colleagues, setColleagues] = useState<any[]>([]); // State to store API results
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [range, setRange] = useState<number>(15000); // State to manage search range
  const invitedColleaguesRef = useRef<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("No colleagues found.");

  const handleGetClosestColleagues = async () => {
    setLoading(true);
    try {
      const response = await getClosestColleagues(range); // Call the API
      console.log("Closest colleagues:", response); // Log the response for debugging
      setColleagues(response); // Update the state with the results
    } catch (error: any) {
      //Alert.alert("Error", "Failed to fetch closest colleagues.");
      if (error.response) {
        console.log(
          "404 response:",
          error.response.status,
          error.response.data
        );
        if (error.response.status === 404) {
          setErrorMessage("No colleagues found within the range of " + range);
        }
      } else {
        console.log("Error fetching closest colleagues:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (cardIndex: number) => {
    const swipedColleague = colleagues[cardIndex];

    invitedColleaguesRef.current.push(swipedColleague); // update ref

    const postData = {
      other_user_id: swipedColleague.user_id,
      liked: true,
    };

    try {
      const response = await api.post("/addresses/setUserPreference", postData);
      console.log("Preference sent successfully:", response.data);
    } catch (error) {
      console.log("Error sending preference:", error);
    }
  };

  const handleSwipeLeft = async (cardIndex: number) => {
    const swipedColleague = colleagues[cardIndex];
    const postData = {
      other_user_id: swipedColleague.user_id,
      liked: false,
    };
    try {
      const response = await api.post("/addresses/setUserPreference", postData);
      console.log("Preference sent successfully:", response.data);
    } catch (error) {
      console.log("Error sending preference:", error);
    }
  };
  const router = useRouter();
  const handleSwipedAll = async () => {
    console.log("All cards swiped");
    Alert.alert("All cards swiped", "You have swiped all colleagues.", [
      {
        text: "OK",
        onPress: () => router.push("/pages/Party"),
      },
    ]);
    try {
      const response = await api.post("/party/createParty");
      console.log("Party sent successfully:", response.data);
      for (const colleague of invitedColleaguesRef.current) {
        const postData = {
          party_id: response.data.id,
          accepted: false,
          user_id: colleague.user_id,
          role: "passenger",
        };
        try {
          const response = await api.post("/party/addPartyMember", postData);
          console.log("Colleague invited successfully:", response.data);
        } catch (error) {
          console.log("Error inviting colleague:", error);
        }
      }
    } catch (error) {
      console.log("Error creating party:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Party</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Keyboard.dismiss();
            handleGetClosestColleagues();
          }}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Get Closest Colleagues"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.inputLabel}>Search Range (meters):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter maximum range to find colleagues"
          onChangeText={(text) => setRange(Number(text))}
        />

        {/* Swiper for colleagues */}
        {colleagues.length > 0 ? (
          <Swiper
            cards={colleagues}
            renderCard={(colleague) => (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  {colleague.user_name || "Unknown User"}
                </Text>
                <Text style={styles.cardText}>
                  Distance: {colleague.distance} m
                </Text>
                {colleague.image_path && (
                  <View style={{ marginTop: 10, flex: 1, width: "100%" }}>
                    <Image
                      source={{ uri: baseurl + colleague.image_path }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            )}
            verticalSwipe={false}
            onSwipedAll={handleSwipedAll}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            cardIndex={0}
            backgroundColor={"#f0f0f0"}
            stackSize={3}
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: {
                    backgroundColor: "red",
                    color: "white",
                    fontSize: 24,
                  },
                  wrapper: {
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "flex-start",
                    marginTop: 20,
                    marginLeft: -20,
                  },
                },
              },
              right: {
                title: "LIKE",
                style: {
                  label: {
                    backgroundColor: "green",
                    color: "white",
                    fontSize: 24,
                  },
                  wrapper: {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    marginTop: 20,
                    marginLeft: 20,
                  },
                },
              },
            }}
          />
        ) : (
          !loading && <Text style={styles.emptyText}>{errorMessage}</Text>
        )}
        <NavBar />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreateParty;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#9fbf2a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
});
