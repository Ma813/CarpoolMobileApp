import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const Map = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [customMarker, setCustomMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // State to store custom markers
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // State to store the current location
  const origin = {
    latitude: 54.520384776951465,
    longitude: 23.267580675220363,
  }; // Example origin
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Dynamic destination

  // Fetch the current location of the device
  const fetchCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        return;
      }

      // Get the current location
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log("Current location:", currentLocation);
    } catch (error) {
      console.error("Error fetching current location:", error);
    }
  };

  useEffect(() => {
    fetchCurrentLocation(); // Fetch the current location when the component mounts
  }, []);

  const fetchRoute = async () => {
    if (!destination) return; // Skip if no destination is set

    const accessToken = process.env.MAPBOX_ACCESS_TOKEN; // Replace with your Mapbox token
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })
        );
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleMapPress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Add the marker instantly
    setCustomMarker({ latitude, longitude });

    // Set the last marker as the destination
    setDestination({ latitude, longitude });
  };

  useEffect(() => {
    fetchRoute();
  }, [destination]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || origin.latitude,
          longitude: currentLocation?.longitude || origin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleMapPress}
        showsUserLocation={true}
      >
        {/* Origin Marker */}
        <Marker coordinate={origin} title="Origin" />

        {/* Destination Marker */}
        {destination && <Marker coordinate={destination} title="Destination" />}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={4}
          />
        )}

        {/* Custom Marker */}
        {customMarker && (
          <Marker coordinate={customMarker} title="Custom Marker" />
        )}
      </MapView>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
