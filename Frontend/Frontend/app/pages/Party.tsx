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
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { NavBar } from "../components/NavBar";
import { getClosestColleagues } from "@/services/addressesApi"; // Import the API call function
import api from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseurl } from "@/constants/baseurl";

const Party: React.FC = () => {
  const [colleagues, setColleagues] = useState<any[]>([]); // State to store API results
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [range, setRange] = useState<number>(15000); // State to manage search range
  const invitedColleaguesRef = useRef<any[]>([]);
  const [userParties, setUserParties] = useState<any[]>([]);
  const [passengerParties, setPassengerParties] = useState<any[]>([]);
  const router = useRouter();

  const GetUserParties = async () => {
    try {
      const response = await api.get("/party/getUserParties");
      console.log("User parties:", response.data);
      setUserParties(response.data); // Store response in state
    } catch (error) {
      console.log("Error fetching user parties:", error);
    }
  };

  const GetPassengerParties = async () => {
    try {
      const response = await api.get("/party/getPassengerParties");
      console.log("Passenger parties:", response.data);
      setPassengerParties(response.data); // Store response in state
    } catch (error) {
      console.log("Error fetching passenger parties:", error);
    }
  };

  useEffect(() => {
    GetUserParties();
    GetPassengerParties();
  }, []);

  const leaveParty = async (partyId: number) =>
    await api.delete("/party/leaveParty/" + partyId);

  const deleteParty = async (partyId: number) =>
    await api.delete("/party/deleteParty/" + partyId);


  const openCreatePartyPage = () => {
    router.push("/pages/CreateParty");
  };
  const renderColleague = ({ item: colleague }: { item: any }) => (
    <View style={styles.colleagueCard}>
      <Text style={styles.colleagueText}>
        {colleague.user_name} ({colleague.distance} m away)
      </Text>
      <Text style={styles.colleagueSubText}>🏠 {colleague.home_address}</Text>
      {colleague.image_path ? (
        <Image
          source={{ uri: baseurl + colleague.image_path }}
          style={styles.colleagueImage}
        />
      ) : null}
    </View>
  );

  const renderParty = ({ item: party }: { item: any }) => (
    <View style={styles.partyCard}>
      <Text style={styles.partyTitle}>Party #{party.party_id}</Text>
      <Text style={styles.driverText}>Driver: {party.driver_name}</Text>
      {party.colleague_list.length > 0 ? (
        <FlatList
          data={party.colleague_list}
          keyExtractor={(colleague, idx) => idx.toString()}
          renderItem={renderColleague}
        />
      ) : (
        <Text style={styles.noMembersText}>No members in this party.</Text>
      )}

      {party.role === "passenger" && (
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert(
              "Leave Party",
              "Are you sure you want to leave this party?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: () => {
                    leaveParty(party.party_id)
                      .then(() => {
                        console.log("Left party successfully");
                        GetPassengerParties();
                      })
                      .catch((error) => {
                        console.log("Error leaving party:", error);
                      });
                  },
                },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>Leave Party</Text>
        </TouchableOpacity>
      )}

      {party.role === "driver" && (
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert(
              "Delete Party",
              "Are you sure you want to delete this party?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    api
                      deleteParty(party.party_id)
                      .then(() => {
                        console.log("Deleted party successfully");
                        GetUserParties();
                      })
                      .catch((error) => {
                        console.log("Error deleting party:", error);
                      });
                  },
                },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>Delete Party</Text>
        </TouchableOpacity>
      )}


    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Party</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={openCreatePartyPage}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Create Party</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#9fbf2a"
          style={styles.loadingIndicator}
        />
      ) : (
        userParties.length === 0 && passengerParties.length === 0 ? (
          <Text style={styles.noMembersText}>No parties found.</Text>
        ) : (
          <FlatList
            data={[...userParties.map(p => ({ ...p, role: 'driver' })), ...passengerParties.map(p => ({ ...p, role: 'passenger' }))]}
            keyExtractor={(party, index) => index.toString()}
            renderItem={({ item, index }) => {
              // Check if this is the first driver or first passenger in the list
              const allParties = [
                ...userParties.map(p => ({ ...p, role: 'driver' })),
                ...passengerParties.map(p => ({ ...p, role: 'passenger' }))
              ];
              const isFirstDriver =
                item.role === 'driver' &&
                !allParties.slice(0, index).some(p => p.role === 'driver');
              const isFirstPassenger =
                item.role === 'passenger' &&
                !allParties.slice(0, index).some(p => p.role === 'passenger');
              return (
                <View>
                  {(isFirstDriver || isFirstPassenger) && (
                    <Text style={styles.subtitle}>
                      {item.role === 'driver' ? 'As driver' : 'As passenger'}
                    </Text>
                  )}
                  {renderParty({ item })}
                </View>
              );
            }}
            contentContainerStyle={styles.scrollContent}
          />
        )
      )}



      {/* // userParties.length > 0 ? (
      //   <FlatList
        //     ListHeaderComponent={
        //       <Text style={styles.subtitle}>You're driving these</Text>
        //     }
        //     data={userParties}
        //     keyExtractor={(party, index) => index.toString()}
        //     renderItem={renderParty}
        //     contentContainerStyle={styles.scrollContent}
        //   />
        // ) : (
        //   <Text style={styles.emptyText}>No parties found.</Text>
        // )} */}
      <NavBar />
    </View>
  );
};

export default Party;

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
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  partyCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#e7f3e7",
    borderColor: "#c5e1c5",
    borderWidth: 1,
  },
  partyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  driverText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  colleagueCard: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  colleagueText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  colleagueSubText: {
    fontSize: 14,
    color: "#666",
  },
  colleagueImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  noMembersText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 100, // leave room for NavBar
  },
  loadingIndicator: {
    marginTop: 20,
  },
  dangerButton: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
