import React, { ReactNode, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Button,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import {
  fetchAddresses,
  getAddressFromCoordinates,
  Suggestion,
} from "@/services/mapbox";
import { NavBar } from "../components/NavBar";
import {
  getLastAddresses,
  postDestination,
  Trip,
} from "@/services/addressesApi";
import { fetchOptimalPickup } from "@/services/addressesApi";
import { getModeOfTransport } from "@/services/modeOfTransportApi";
import { Ionicons } from "@expo/vector-icons";
const Map = () => {
  const mapRef = React.useRef<MapView>(null);

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
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<Suggestion[]>([]); // State to store recent addresses
  const [CO2, setCO2] = useState<number | null>(null); // State to store CO2 emissions
  const [carDefault, setCarDefault] = useState<Boolean>(true); // State to store car default
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Dynamic marker

  const [selectedMode, setSelectedMode] = React.useState<string>("car");
  const transportOptions: {
    key: string;
    icon: "car-outline" | "walk-outline" | "bicycle-outline" | "bus-outline";
  }[] = [
      { key: "car", icon: "car-outline" },
      { key: "walk", icon: "walk-outline" },
      { key: "bicycle", icon: "bicycle-outline" },
      { key: "bus", icon: "bus-outline" },
    ];

  const [pickupPoints, setPickupPoints] = useState<
    { latitude: number; longitude: number; order: number }[]
  >([]);
  const [transitDetails, setTransitDetails] = useState<
    {
      type: string;
      instructions: ReactNode;
      distance: ReactNode;
      duration: ReactNode;
      from: string;
      to: string;
      bus: string;
      departureTime: string;
    }[]
  >([]);

  const [infoIndex, setInfoIndex] = useState<number>(0); // State to track the index of the info to be displayed
  const [busPolyline, setBusPolyline] = useState<
    { latitude: number; longitude: number }[]
  >([]); // State to store bus route polyline

  const [busLineIndexes, setBusLineIndexes] = useState<number[]>([]); // State to store bus line indexes

  const [busStops, setBusStops] = useState<string[]>([]); // State to store bus stops

  const handleShowPickups = async () => {
    if (!currentLocation) return;

    // Clear previous pickup points
    setPickupPoints([]);
    setMarker(null); // Clear the marker when "Show Pickups" is pressed
    setDestination(null); // Clear the destination when "Show Pickups" is pressed
    setCO2(null); // Reset CO2 emissions when "Show Pickups" is pressed
    setBusLineIndexes([]); // Clear bus line indexes when "Show Pickups" is pressed
    setBusPolyline([]); // Clear bus polyline when "Show Pickups" is pressed
    setTransitDetails([]); // Clear transit details when "Show Pickups" is pressed
    setInfoIndex(0); // Reset info index when "Show Pickups" is pressed

    try {
      const data = await fetchOptimalPickup();
      if (Array.isArray(data)) {
        setPickupPoints(data);
        await fetchPickupRoute();
      }
    } catch (error) {
      console.log("Error fetching optimal pickup points:", error);
    }
  };

  const fetchPickupRoute = async () => {
    if (!currentLocation || pickupPoints.length === 0) return;

    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    const allPoints = [
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      ...pickupPoints.sort((a, b) => a.order - b.order),
    ];
    const coordinatesStr = allPoints
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(";");
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesStr}?geometries=geojson&access_token=${accessToken}&overview=full`;

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
        if (coordinates.length && mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching pickup route:", error);
    }
  };

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
    getModeOfTransport()
      .then((mode) => {
        setSelectedMode(mode);
      })
      .catch((error) => {
        console.log("Error fetching mode of transport:", error);
        setSelectedMode("car"); // Default to 'car' if there's an error
      });
  }, []);

  useEffect(() => {
    fetchCurrentLocation(); // Fetch the current location when the component mounts
    fetchRoute();
  }, [destination]); // Fetch the route when the destinatio changes

  useEffect(() => {
    setPickupPoints([]); // Clear pickup points when the selected mode changes
    setBusPolyline([]); // Clear bus polyline when the selected mode changes
    setRouteCoordinates([]); // Clear route coordinates when the selected mode changes
    fetchCurrentLocation();
    fetchRoute(); // Fetch the route when the selected mode changes
    if (destination) {
      handleGoPress();
    }
  }, [selectedMode]);

  useEffect(() => {
    if (pickupPoints.length > 0) {
      fetchPickupRoute();
    }
  }, [pickupPoints]);

  useEffect(() => {
    getLastAddresses()
      .then((data) => {
        if (!data || !Array.isArray(data)) {
          console.error("Blogas duomenų formatas iš API", data);
          return;
        }

        const suggestions = data.map((d: any) => ({
          id: d.id?.toString() ?? Math.random().toString(),
          place_name: d.place_name ?? "Unknown place",
          latitude: d.latitude ?? 0,
          longitude: d.longitude ?? 0, // čia konvertuoju į teisingą lauką
        }));

        setRecentAddresses(suggestions);
        console.log("Gauti recentAddresses:", suggestions);
      })
      .catch((err) => {
        console.error("Klaida gaunant paskutinius adresus:", err);
      });
  }, []);
  function decodePolyline(
    encoded: string
  ): { latitude: number; longitude: number }[] {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  }

  const fetchRoute = async () => {
    setPickupPoints([]); // Clear pickup points when fetching a new route
    if (!destination) return; // Skip if no destination is set
    console.log("Fetching route to destination:", destination);
    if (!currentLocation) return; // Skip if no current location is set

    if (selectedMode === "bus") {
      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      const dest = `${destination.latitude},${destination.longitude}`;
      const departureTime = Math.floor(Date.now() / 1000) + 86400; // Now + 1 day = tomorrow
      const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=transit&transit_mode=bus&departure_time=${departureTime}&key=${googleApiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();


        if (data.routes.length) {
          //This turns the code into a clusterfuck
          // We could just setBusLineIndexes([]) but it is synchronous and ususally
          // causes the map to not update properly
          //Sorry if this makes the code hard to read
          setBusLineIndexes(() => {
            busLineIndexes.length = 0; // Clear bus line indexes
            console.log(busLineIndexes);
            const steps = data.routes[0].legs[0].steps;
            const coordinates = steps.flatMap(
              (step: { polyline: { points: string } }) => {
                if (step.polyline && step.polyline.points) {
                  const decodedPolyline = decodePolyline(step.polyline.points);
                  if (busLineIndexes.length === 0) {
                    busLineIndexes.push(0);
                  }
                  busLineIndexes.push(busLineIndexes[busLineIndexes.length - 1] + decodedPolyline.length);
                  setBusLineIndexes(busLineIndexes);
                  console.log("Bus line indexes:", busLineIndexes);
                  return decodedPolyline;
                }
                return [];
              }
            );
            setBusPolyline(coordinates);
            setBusStops([]); // Clear bus stops when fetching a new route
            var skip = true;
            const transitInfo = steps
              .map(
                (step: {
                  travel_mode: string;
                  html_instructions: any;
                  distance: { text: any };
                  duration: { text: any };
                  transit_details: {
                    departure_stop: any;
                    arrival_stop: any;
                    line: any;
                    departure_time: any;
                  };
                }) => {
                  if (step.travel_mode === "WALKING") {
                    skip = false;
                    return {
                      type: "walk",
                      instructions: step.html_instructions,
                      distance: step.distance.text,
                      duration: step.duration.text,
                    };
                  }

                  if (step.travel_mode === "TRANSIT" && step.transit_details) {
                    const { departure_stop, arrival_stop, line, departure_time } =
                      step.transit_details;
                    const busStop1 = departure_stop.name;
                    const busStop2 = arrival_stop.name;
                    if (!skip)
                      setBusStops((prevStops) => [...prevStops, busStop1]);
                    setBusStops((prevStops) => [...prevStops, busStop2]);
                    console.log("Bus stops:", busStops);
                    skip = true;
                    return {
                      type: "bus",
                      from: departure_stop.name,
                      to: arrival_stop.name,
                      bus: line.short_name || line.name,
                      departureTime: departure_time.text,
                    };
                  }

                  return null;
                }
              )
              .filter(Boolean);
            setTransitDetails(transitInfo);

            console.log("🚌 Transit info:", transitInfo);

            setRouteCoordinates(coordinates);

            if (coordinates.length && mapRef.current) {
              if (coordinates.length && mapRef.current) {
                if (selectedMode !== "bus") {
                  mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                    animated: true,
                  });
                }
                if (selectedMode === "bus" && busPolyline.length > 0) {
                  mapRef.current && mapRef.current.fitToCoordinates(busPolyline.slice(busLineIndexes[infoIndex], busLineIndexes[infoIndex + 1] + 1), {
                    edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                    animated: true,
                  });
                }
              }
            }

            return busLineIndexes;
          });



        } else {
          console.warn("No routes found in Google response");
        }
      } catch (error) {
        console.error("Google API error:", error);
      }

      return; // Skip Mapbox route fetch below
    }

    var profile = "driving";
    if (selectedMode === "bicycle") {
      profile = "cycling";
    } else if (selectedMode === "walk") {
      profile = "walking";
    } else if (selectedMode === "bus") {
      profile = "driving"; // Use driving for bus for now
    }

    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN; // Replace with your Mapbox token
    const origin = currentLocation || {
      latitude: 54.8923288,
      longitude: 23.9225799,
    }; // Use current location as origin
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${accessToken}`;

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
        if (coordinates.length && mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
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
    const selected = {
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
    setInfoIndex(0); // Reset info index when "GO" is pressed
    setMarker(null); // Clear the marker when "GO" is pressed
    setPickupPoints([]); // Clear pickup points when "GO" is pressed
    console.log("Go to address:", selectedSuggestion?.place_name);
    if (selectedSuggestion) {
      try {
        setDestination({
          latitude: selectedSuggestion.latitude ?? 56,
          longitude: selectedSuggestion.longitude ?? 24,
        });

        const trip = {
          start_latitude: currentLocation?.latitude,
          start_longitude: currentLocation?.longitude,
          destination: selectedSuggestion.place_name,
          destination_latitude: selectedSuggestion.latitude,
          destination_longitude: selectedSuggestion.longitude,
          mode_of_transport: selectedMode,
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

  // Insert logic for defaultRegion before return
  const defaultRegion = currentLocation
    ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
    : undefined;

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
        <TouchableOpacity style={styles.button} onPress={handleShowPickups}>
          <Text style={styles.buttonText}>Show Pickups</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerSelect}>
        {transportOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.buttonSelect,
              selectedMode === option.key && styles.selectedButton,
            ]}
            onPress={() => setSelectedMode(option.key)}
          >
            <Ionicons name={option.icon} size={20} />
          </TouchableOpacity>
        ))}
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
        <View
          style={{
            padding: 10,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
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
      {selectedMode === "bus" && transitDetails.length > 0 && (
        <View style={{ padding: 10, backgroundColor: "white" }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
            Transit Instructions:
          </Text>
          <View style={{ marginBottom: 8 }}>
            {transitDetails[infoIndex].type === "bus" ? (
              <>
                <Text>🕐 Departure: {transitDetails[infoIndex].departureTime}</Text>
                <Text>🚏 From: {transitDetails[infoIndex].from}</Text>
                <Text>🚌 Bus: {transitDetails[infoIndex].bus}</Text>
                <Text>➡️ To: {transitDetails[infoIndex].to}</Text>
              </>
            ) : (
              <>
                <Text>🚶 Walk: {transitDetails[infoIndex].instructions}</Text>
                <Text>
                  🗺 Distance: {transitDetails[infoIndex].distance} ({transitDetails[0].duration})
                </Text>
              </>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
              }}>
              {<TouchableOpacity
                style={[styles.infoButton, infoIndex === 0 && styles.greyedOut]}
                onPress={() => {
                  setInfoIndex((prevIndex) => {
                    const newIndex = prevIndex === 0 ? prevIndex : prevIndex - 1;
                    if (mapRef.current && busPolyline.length > 0) {
                      mapRef.current.fitToCoordinates(
                        busPolyline.slice(busLineIndexes[newIndex], busLineIndexes[newIndex + 1] + 1),
                        {
                          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                          animated: true,
                        }
                      );
                    }
                    return newIndex;
                  }
                  );
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>{"<"}</Text>
              </TouchableOpacity>}

              <Text
                style={styles.infoText}>
                {infoIndex + 1} / {transitDetails.length}
              </Text>
              {<TouchableOpacity
                style={[styles.infoButton, infoIndex === transitDetails.length - 1 && styles.greyedOut]}
                onPress={() => {
                  setInfoIndex((prevIndex) => {
                    const newIndex = prevIndex === transitDetails.length - 1 ? prevIndex : prevIndex + 1;

                    if (mapRef.current && busPolyline.length > 0) {
                      mapRef.current.fitToCoordinates(
                        busPolyline.slice(busLineIndexes[newIndex], busLineIndexes[newIndex + 1] + 1),
                        {
                          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                          animated: true,
                        }
                      );
                    }

                    return newIndex;
                  });
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>{">"}</Text>
              </TouchableOpacity>}
            </View>

          </View>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        onLongPress={handleMapPress}
        showsUserLocation={true}
        region={routeCoordinates.length === 0 ? defaultRegion : undefined}
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
        {routeCoordinates.length > 0 && (selectedMode !== "bus" || pickupPoints.length > 0) && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={4}
          />
        )}

        {selectedMode === "bus" && busPolyline.length > 0 && (
          <>
            <Polyline
              coordinates={busPolyline.slice(busLineIndexes[infoIndex], busLineIndexes[infoIndex + 1] + 1)}
              strokeColor="green"
              strokeWidth={4}
            />
            {infoIndex < busLineIndexes.length - 1 && (
              <Marker
                coordinate={busPolyline[busLineIndexes[infoIndex + 1]]}
                title={busStops[infoIndex]}
                pinColor="green"
              />
            )}

            {infoIndex > 0 && (
              <Marker
                coordinate={busPolyline[busLineIndexes[infoIndex]]}
                title={busStops[infoIndex - 1]}
                pinColor="green"
              />
            )}
          </>
        )}

        {pickupPoints.map((point) => (
          <Marker
            key={point.order}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={`Pickup #${point.order + 1}`}
            description={`Latitude: ${point.latitude}, Longitude: ${point.longitude}`}
            pinColor="green"
          />
        ))}
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
  buttonSelect: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d3d3d3",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: "#9fbf2a",
  },
  label: {
    marginTop: 5,
    fontSize: 14,
  },
  containerSelect: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
  },
  infoButton: {
    backgroundColor: "#9fbf2a",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  infoText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    marginHorizontal: 10,
  },
  greyedOut: {
    backgroundColor: "#d3d3d3",
  }
});
