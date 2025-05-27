import React from "react";
import {
  TouchableOpacity,
  Text,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface GoogleMapsButtonProps {
  origin?: Coordinate;
  destination?: Coordinate;
  waypoints?: Coordinate[];
  label?: string;
  travelMode?: "driving" | "walking" | "bicycling" | "transit";
}

const GoogleMapsButton: React.FC<GoogleMapsButtonProps> = ({
  origin,
  destination,
  waypoints = [],
  label = "Open in Google Maps",
  travelMode = "driving",
}) => {
  const handlePress = () => {
    if (!origin || !destination) {
      Alert.alert("Missing coordinates", "Origin or destination is missing.");
      return;
    }

    const base = "https://www.google.com/maps/dir/?api=1";
    const originStr = `origin=${origin.latitude},${origin.longitude}`;
    const destStr = `destination=${destination.latitude},${destination.longitude}`;
    const waypointsStr =
      waypoints.length > 0
        ? `&waypoints=${waypoints
            .map((wp) => `${wp.latitude},${wp.longitude}`)
            .join("|")}`
        : "";

    const travelModeStr = travelMode ? `&travelmode=${travelMode}` : "";
    const link = `${base}&${originStr}&${destStr}${waypointsStr}${travelModeStr}`;
    Linking.openURL(link);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#9fbf2a",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "center",
  },
  text: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default GoogleMapsButton;
