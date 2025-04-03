import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { NavBar } from "../components/NavBar";
import { getClosestColleagues } from "@/services/addressesApi"; // Import the API call function

const Party: React.FC = () => {
  const [colleagues, setColleagues] = useState<any[]>([]); // State to store API results
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [range, setRange] = useState<number>(15000); // State to manage search range

  const handleGetClosestColleagues = async () => {
    setLoading(true);
    try {
      const response = await getClosestColleagues(range); // Call the API
      console.log("Closest colleagues:", response); // Log the response for debugging
      setColleagues(response); // Update the state with the results
    } catch (error) {
      Alert.alert("Error", "Failed to fetch closest colleagues.");
      console.error("Error fetching closest colleagues:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Party</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetClosestColleagues}
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

      {/* Display the list of colleagues */}
      <FlatList
        data={colleagues}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.colleagueItem}>
            <Text style={styles.colleagueText}>
              {item.user_name || "Unknown User"}
            </Text>
            <Text style={styles.colleagueText}>
              Distance: {item.distance} m
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No colleagues found.</Text>
          ) : null
        }
      />
      <NavBar />
    </View>
  );
};

export default Party;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  colleagueItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  colleagueText: {
    fontSize: 16,
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
  inputContainer: {
    marginBottom: 20,
  },
});
