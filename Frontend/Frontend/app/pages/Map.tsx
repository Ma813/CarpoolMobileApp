import React, { ReactNode, use, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Button,
  Linking,
  Image,
} from "react-native";
import { getUserParties } from "@/services/partyApi";
import MapView, { MapMarker, Marker, Polyline } from "react-native-maps";
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
import PopUpSelect from "../components/PopUpSelect";
import GoogleMapsButton from "../components/GoogleMapsButton";

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
  const [CO2Saved, setCO2Saved] = useState<number>(0); // State to store CO2 saved
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
    {
      latitude: number;
      longitude: number;
      order: number;
      usernames: string;
      address: string;
    }[]
  >([]);

  const [selectedPickup, setSelectedPickup] = useState<number>(0);
  const [toWork, setToWork] = useState<boolean>(true); // State to track if the user is going to work or home

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

  const markerRef = React.useRef<MapMarker>(null);

  useEffect(() => {
    // Automatically show callout for selected marker
    if (markerRef.current) {
      markerRef.current?.showCallout();
    }
  }, [selectedPickup]);
  useEffect(() => {
    // Automatically show callout for selected marker
    if (markerRef.current) {
      setTimeout(() => {
        markerRef.current?.showCallout();
      }, 500); // Delay to ensure the map is fully loadeds
    }
  }, [pickupPoints]);

  interface PartyOption {
    id: string;
    name: string;
  }

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PartyOption | null>(
    null
  );
  const [options, setOptions] = useState<PartyOption[]>([]);

  const handleSelect = (option: PartyOption) => {
    setSelectedOption(option);
    setPopupVisible(false);
    console.log("Selected option:", option.id);
  };

  const handlePartyPress = async () => {
    const parties = await getUserParties();
    console.log("Parties:", parties);

    const partyOptions: PartyOption[] = parties.map((party: any) => ({
      id: `${party.party_id}`,
      name: party.name ?? `Party #${party.party_id}`,
    }));

    if (partyOptions.length === 0) {
      Alert.alert("No parties found", "Please create a party first.");
      return;
    }

    setOptions(partyOptions);
    setPopupVisible(true);
  };

  useEffect(() => {
    if (selectedOption) {
      handleShowPickups(selectedOption.id);
    }
  }, [selectedOption]);

  const handleShowPickups = async (id: string) => {
    if (!currentLocation) return;

    // Clear previous pickup points
    setPickupPoints([]);
    setToWork(true); // Reset toWork state

    setSelectedPickup(0);
    setMarker(null);
    setDestination(null);
    setCO2(null);
    setCO2Saved(0);
    setBusLineIndexes([]);
    setBusPolyline([]);
    setTransitDetails([]);
    setInfoIndex(0);

    try {
      const data = await fetchOptimalPickup(id);
      if (Array.isArray(data)) {
        console.log("Optimal pickup points:", data);
        setPickupPoints(data);
        // await fetchPickupRoute();
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

    // get only the selected pickup point and the next one

    var skip = selectedPickup === 0 ? 0 : 1;

    const origin = `${allPoints[selectedPickup + skip].longitude},${allPoints[selectedPickup + skip].latitude
      }`;
    const dest = `${allPoints[selectedPickup + 2].longitude},${allPoints[selectedPickup + 2].latitude
      }`;
    const coordinatesStr = `${origin};${dest}`;

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

  function buildGoogleMapsLinkFromStops(
    stops: {
      latitude: number;
      longitude: number;
      order: number;
    }[]
  ): string {
    if (stops.length < 2) return "";

    // Sort by order
    const sorted = [...stops].sort((a, b) => a.order - b.order);

    const origin = sorted[0];
    const destination = sorted[sorted.length - 1];
    const waypoints = sorted.slice(1, sorted.length - 1); // exclude origin and destination

    const base = "https://www.google.com/maps/dir/?api=1";
    const originStr = `origin=${origin.latitude},${origin.longitude}`;
    const destinationStr = `destination=${destination.latitude},${destination.longitude}`;
    const waypointsStr =
      waypoints.length > 0
        ? `&waypoints=${waypoints
          .map((wp) => `${wp.latitude},${wp.longitude}`)
          .join("|")}`
        : "";

    return `${base}&${originStr}&${destinationStr}${waypointsStr}`;
  }

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
    setPickupPoints(() => {
      setSelectedPickup(0); // Reset selected pickup index when the selected mode changes
      setBusPolyline([]); // Clear bus polyline when the selected mode changes
      setRouteCoordinates([]); // Clear route coordinates when the selected mode changes
      fetchCurrentLocation();
      fetchRoute(); // Fetch the route when the selected mode changes
      if (destination) {
        handleGoPress();
      }

      return [];
    });
  }, [selectedMode]);

  useEffect(() => {
    if (pickupPoints.length > 0) {
      fetchPickupRoute();
    }
  }, [pickupPoints, selectedPickup]);

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
    setSelectedPickup(0); // Reset selected pickup index when fetching a new route
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
                  busLineIndexes.push(
                    busLineIndexes[busLineIndexes.length - 1] +
                    decodedPolyline.length
                  );
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
                    const {
                      departure_stop,
                      arrival_stop,
                      line,
                      departure_time,
                    } = step.transit_details;
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
                    edgePadding: {
                      top: 100,
                      right: 100,
                      bottom: 100,
                      left: 100,
                    },
                    animated: true,
                  });
                }
                if (selectedMode === "bus" && busPolyline.length > 0) {
                  mapRef.current &&
                    mapRef.current.fitToCoordinates(
                      busPolyline.slice(
                        busLineIndexes[infoIndex],
                        busLineIndexes[infoIndex + 1] + 1
                      ),
                      {
                        edgePadding: {
                          top: 100,
                          right: 100,
                          bottom: 100,
                          left: 100,
                        },
                        animated: true,
                      }
                    );
                }
              }
            }

            return busLineIndexes;
          });
        } else {
          console.warn("No routes found in Google response");
        }
      } catch (error) {
        console.log("Google API error:", error);
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
    setCO2Saved(0); // Reset CO2 saved when a new marker is placed
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
    setPickupPoints([]); // Clear pickup points when "GO" is pressed
    setSelectedPickup(0); // Reset selected pickup index when "GO" is pressed
    setInfoIndex(0); // Reset info index when "GO" is pressed
    setMarker(null); // Clear the marker when "GO" is pressed
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
        setCO2Saved(response.co2_saved); // Set CO2 saved from the response
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
      <PopUpSelect
        title="Select a party"
        visible={popupVisible}
        options={options}
        onSelect={(option) => handleSelect(option)}
        onClose={() => setPopupVisible(false)}
      />

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
          <Ionicons
            name="navigate-outline"
            size={15}
            color="white"
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePartyPress}>
          <Ionicons
            name="people-outline"
            size={15}
            color="white"
            style={{ marginRight: 5 }}
          />
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

      {CO2 !== null && (
        <View
          style={{
            padding: 10,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              CO2 Saved: {CO2Saved.toFixed(2)} kg
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              CO2 Emissions for trip: {CO2.toFixed(2)} kg
            </Text>
          </View>
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
      {currentLocation && destination && (
        <GoogleMapsButton
          origin={currentLocation}
          destination={destination}
          label="Open in"
          travelMode={
            selectedMode === "walk"
              ? "walking"
              : selectedMode === "bicycle"
                ? "bicycling"
                : selectedMode === "bus"
                  ? "transit"
                  : "driving"
          }
        />
      )}
      {selectedMode === "bus" && transitDetails.length > 0 && (
        <View style={{ padding: 10, backgroundColor: "white" }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
            Transit Instructions:
          </Text>
          <View style={{ marginBottom: 8 }}>
            {transitDetails[infoIndex].type === "bus" ? (
              <>
                <Text>
                  🕐 Departure: {transitDetails[infoIndex].departureTime}
                </Text>
                <Text>🚏 From: {transitDetails[infoIndex].from}</Text>
                <Text>🚌 Bus: {transitDetails[infoIndex].bus}</Text>
                <Text>➡️ To: {transitDetails[infoIndex].to}</Text>
              </>
            ) : (
              <>
                <Text>🚶 Walk: {transitDetails[infoIndex].instructions}</Text>
                <Text>
                  🗺 Distance: {transitDetails[infoIndex].distance} (
                  {transitDetails[infoIndex].duration})
                </Text>
              </>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              {
                <TouchableOpacity
                  style={[
                    styles.infoButton,
                    infoIndex === 0 && styles.greyedOut,
                  ]}
                  onPress={() => {
                    setInfoIndex((prevIndex) => {
                      const newIndex =
                        prevIndex === 0 ? prevIndex : prevIndex - 1;
                      if (mapRef.current && busPolyline.length > 0) {
                        mapRef.current.fitToCoordinates(
                          busPolyline.slice(
                            busLineIndexes[newIndex],
                            busLineIndexes[newIndex + 1] + 1
                          ),
                          {
                            edgePadding: {
                              top: 100,
                              right: 100,
                              bottom: 100,
                              left: 100,
                            },
                            animated: true,
                          }
                        );
                      }
                      return newIndex;
                    });
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {"<"}
                  </Text>
                </TouchableOpacity>
              }

              <Text style={styles.infoText}>
                {infoIndex + 1} / {transitDetails.length}
              </Text>
              {
                <TouchableOpacity
                  style={[
                    styles.infoButton,
                    infoIndex === transitDetails.length - 1 && styles.greyedOut,
                  ]}
                  onPress={() => {
                    setInfoIndex((prevIndex) => {
                      const newIndex =
                        prevIndex === transitDetails.length - 1
                          ? prevIndex
                          : prevIndex + 1;

                      if (mapRef.current && busPolyline.length > 0) {
                        mapRef.current.fitToCoordinates(
                          busPolyline.slice(
                            busLineIndexes[newIndex],
                            busLineIndexes[newIndex + 1] + 1
                          ),
                          {
                            edgePadding: {
                              top: 100,
                              right: 100,
                              bottom: 100,
                              left: 100,
                            },
                            animated: true,
                          }
                        );
                      }

                      return newIndex;
                    });
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {">"}
                  </Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </View>
      )}

      {pickupPoints.length > 1 && (
        <>
          <View
            style={{
              backgroundColor: "white",
              padding: 10,
            }}
          >
            <Text>
              {toWork
                ? "Pickup party members to work"
                : "Drop off party members at home"}
            </Text>

            {pickupPoints[selectedPickup + 1] && (
              <View key={pickupPoints[selectedPickup].order}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={
                      pickupPoints[selectedPickup + 1].usernames == "Work"
                        ? "briefcase"
                        : pickupPoints[selectedPickup + 1].usernames == "Home"
                          ? "home"
                          : pickupPoints[selectedPickup + 1].usernames.includes(
                            ","
                          )
                            ? "people"
                            : "person"
                    }
                    size={16}
                    color="black"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.label}>
                    {pickupPoints[selectedPickup + 1].usernames}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="business"
                    size={16}
                    color="black"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.label}>
                    {pickupPoints[selectedPickup + 1].address}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.infoButton,
                      selectedPickup === 0 && styles.greyedOut,
                    ]}
                    onPress={() => {
                      setSelectedPickup((prevIndex) => {
                        const newIndex =
                          prevIndex === 0 ? prevIndex : prevIndex - 1;
                        return newIndex;
                      });
                    }}
                  >
                    <Text>{"<"}</Text>
                  </TouchableOpacity>

                  <Text style={styles.infoText}>
                    {/* we are skipping the first one, because we're starting at current location */}
                    {selectedPickup + 1} / {pickupPoints.length - 1}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.infoButton,
                      selectedPickup === pickupPoints.length - 2 &&
                      styles.greyedOut,
                    ]}
                    onPress={() => {
                      setSelectedPickup((prevIndex) => {
                        const newIndex =
                          prevIndex === pickupPoints.length - 2
                            ? prevIndex
                            : prevIndex + 1;
                        return newIndex;
                      });
                    }}
                  >
                    <Text>{">"}</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setToWork(!toWork);
                      setSelectedPickup(0);
                      setPickupPoints((prevPoints) =>
                        prevPoints.map((point) => ({
                          ...point,
                          order: prevPoints.length - 1 - point.order, // Swap the order of the points
                        }))
                      );

                      fetchPickupRoute();
                    }}
                  >
                    <Ionicons
                      name={toWork ? "home" : "briefcase"}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <GoogleMapsButton
            origin={pickupPoints[0]}
            destination={pickupPoints[pickupPoints.length - 1]}
            waypoints={pickupPoints.slice(1, pickupPoints.length - 1)}
            travelMode="driving"
            label="Open Full Route in"
          />
        </>
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
        {routeCoordinates.length > 0 &&
          (selectedMode !== "bus" || pickupPoints.length > 0) && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="red"
              strokeWidth={4}
            />
          )}

        {selectedMode === "bus" && busPolyline.length > 0 && (
          <>
            <Polyline
              coordinates={busPolyline.slice(
                busLineIndexes[infoIndex],
                busLineIndexes[infoIndex + 1] + 1
              )}
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

        {selectedPickup > 0 && (
          <Marker
            coordinate={{
              latitude: pickupPoints[selectedPickup].latitude,
              longitude: pickupPoints[selectedPickup].longitude,
            }}
            title={pickupPoints[selectedPickup].usernames}
            description={pickupPoints[selectedPickup].address}
            pinColor="green"
          />
        )}

        {pickupPoints.length > 1 &&
          selectedPickup < pickupPoints.length &&
          pickupPoints[selectedPickup + 1] && (
            <Marker
              ref={markerRef}
              coordinate={{
                latitude: pickupPoints[selectedPickup + 1].latitude,
                longitude: pickupPoints[selectedPickup + 1].longitude,
              }}
              title={pickupPoints[selectedPickup + 1].usernames}
              description={pickupPoints[selectedPickup + 1].address}
              pinColor="red"
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
    marginLeft: 5,
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
  },
});
