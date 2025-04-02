import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert, TextInput, FlatList, TouchableOpacity, Text, Button } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { fetchAddresses, getAddressFromCoordinates, Suggestion } from "@/services/mapbox";
import { NavBar } from "../components/NavBar";
import { getLastAddresses, postDestination, Trip } from "@/services/addressesApi";

const Map = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // State to store the current location
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Dynamic destination

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<Suggestion[]>([]); // State to store recent addresses
  const [CO2, setCO2] = useState<number | null>(null); // State to store CO2 emissions
  const [carDefault, setCarDefault] = useState<Boolean>(true); // State to store car default
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Dynamic marker

  // Fetch the current location of the device
  const fetchCurrentLocation = () => {
    // Request location permissions
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to use this feature."
          );
          throw new Error("Location permission not granted");
        }
        // Get the current location
        return Location.getCurrentPositionAsync({});
      })
      .then((location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log("Current location:", {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      })
      .catch((error) => {
        console.error("Error fetching current location:", error);
      });
  };

  useEffect(() => {
    fetchCurrentLocation(); // Fetch the current location when the component mounts
  }, []);

  useEffect(() => {
    fetchCurrentLocation(); // Fetch the current location when the component mounts
    fetchRoute();
  }, [destination]); // Fetch the route when the destination changes

  useEffect(() => {
    getLastAddresses().then((data) => {
      if (!data || !Array.isArray(data)) {
        console.error("Blogas duomenų formatas iš API", data);
        return;
      }

      const suggestions = data.map((d: any) => ({
        id: d.id?.toString() ?? Math.random().toString(),
        place_name: d.place_name ?? "Unknown place",
        latitude: d.latitude ?? 0,
        longitude: d.longitude ?? 0 // čia konvertuoju į teisingą lauką
      }));

      setRecentAddresses(suggestions);
      console.log("Gauti recentAddresses:", suggestions);
    }).catch(err => {
      console.error("Klaida gaunant paskutinius adresus:", err);
    });
  }, []);

  const fetchRoute = async () => {
    if (!destination) return; // Skip if no destination is set
    console.log("Fetching route to destination:", destination);

    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN; // Replace with your Mapbox token
    const origin = currentLocation || { latitude: 54.8923288, longitude: 23.9225799 }; // Use current location as origin
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
        console.log("Route coordinates:", coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleMapPress = async (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Set the last marker as the destination
    setMarker({ latitude, longitude });
    setDestination(null);
    setCO2(null); // Reset CO2 emissions when a new marker is placed
    setCarDefault(true); // Reset car default when a new marker is placed

    const address = await getAddressFromCoordinates(latitude, longitude);
    const selected =
    {
      id: "",
      place_name: address ?? "Custom marker",
      longitude: longitude,
      latitude: latitude,
    };

    setSelectedSuggestion(selected);
    setQuery(address ?? "Custom marker");
    setSuggestions([]);
  };

  const handleGoPress = async () => {
    setMarker(null); // Clear the marker when "GO" is pressed
    console.log("Go to address:", selectedSuggestion?.place_name);
    if (selectedSuggestion) {
      try {
        setDestination({ latitude: selectedSuggestion.latitude ?? 56, longitude: selectedSuggestion.longitude ?? 24 });
        
        const trip = {
          start_latitude: currentLocation?.latitude,
          start_longitude: currentLocation?.longitude,
          destination: selectedSuggestion.place_name,
          destination_latitude: selectedSuggestion.latitude,
          destination_longitude: selectedSuggestion.longitude,
        };


        const response = await postDestination(trip); // Save the custom marker as a destination
        setCO2(response.co2_emission); // Set CO2 emissions from the response
        setCarDefault(response.default_car);

      } catch (error) {
        console.error("Error saving address:", error);
      }
    } else {
      alert("No address selected.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBarContainer}>
        <NavBar />
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.length > 0) {
              fetchAddresses(text).then(setSuggestions);
            } else {
              setSuggestions(recentAddresses);
            }
          }}
          onFocus={() => {
            if (!query) setSuggestions(recentAddresses);

          }}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleGoPress}>
          <Text style={styles.buttonText}>GO</Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: "white", maxHeight: 200 }}>
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                setSelectedSuggestion(item);
                setSuggestions([]);
                setQuery(item.place_name);
              }}
            >
              <Text>{item.place_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>


      {CO2 && (
        <View style={{ padding: 10, backgroundColor: "white", flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            CO2 Emissions for trip: {CO2.toFixed(2)} kg
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "CO2 Emissions Info",
                `This value represents the estimated CO2 emissions for the trip based on the selected route.\n\n` +
                (carDefault
                  ? "The calculation is based on an average petrol car (burning 8 liters / 100 km)."
                  : "The calculation is based on your car.")
              )
            }
            style={{
              marginLeft: 10,
              backgroundColor: "#9fbf2a",
              borderRadius: 50,
              width: 24,
              height: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>?</Text>
          </TouchableOpacity>
        </View>
      )}

      <MapView
        style={styles.map}
        region={
          currentLocation
            ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
            :
            {
              latitude: 54.903927186338045,
              longitude: 23.957824010517566,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
        }
        onLongPress={handleMapPress}
        showsUserLocation={true}
      >
        {/* Destination Marker */}
        {destination && <Marker coordinate={destination} title="Destination" />}

        {marker && (
          <Marker
            coordinate={marker}
            title="Custom marker"
            pinColor="blue" // Change the color of the marker
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates && destination && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={4}
          />
        )}

      </MapView>
    </View>
  );
};
export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full screen container
    paddingTop: 50, // Add some space at the top
    backgroundColor: "#fff",
  },
  navBarContainer: {
    position: "absolute", // Positioning the NavBar at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure NavBar stays on top of other elements
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginBottom: 78, // Adjust this margin so map does not overlap with navbar
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10, // Add some space after NavBar
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1, // Makes input take available space
    height: 40,
    borderColor: "#9fbf2a",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginRight: 10, // Adds space between input and button
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  button: {
    backgroundColor: "#9fbf2a",
    padding: 13,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },
});