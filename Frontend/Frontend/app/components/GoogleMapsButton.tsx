let googleMapsIcon;
try {
  googleMapsIcon = require("../../assets/images/google_maps.png");
} catch (e) {
  googleMapsIcon = null;
}

import React from "react";
import {
  TouchableOpacity,
  Text,
  Alert,
  Linking,
  StyleSheet,
  Image,
  View,
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
      <View style={styles.content}>
        <Text style={styles.text}>{label}</Text>
        {googleMapsIcon ? (
          <Image
            source={googleMapsIcon}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.text}>Google Maps</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#9fbf2a",
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
    alignSelf: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  image: {
    width: 24,
    height: 24,
  },
});

export default GoogleMapsButton;
