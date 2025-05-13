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

const Party: React.FC = () => {
  const [colleagues, setColleagues] = useState<any[]>([]); // State to store API results
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [range, setRange] = useState<number>(15000); // State to manage search range
  const invitedColleaguesRef = useRef<any[]>([]);
  const [userParties, setUserParties] = useState<any[]>([]);
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
const respondToInvite = async (party_id: number, accepted: boolean) => {
  try {
    await api.post("/party/respondToInvite", {
      party_id,
      accepted,
    });
    Alert.alert("Success", accepted ? "Invite accepted!" : "Invite declined.");
    fetchInvites(); // atnaujinti pakvietimų sąrašą
    GetUserParties(); // atnaujinti savo Party
  } catch (error) {
    console.log("Error responding to invite:", error);
  }
};

  const fetchInvites = async () => {
    try {
      const response = await api.get("/party/getInvites");
      setInvites(response.data);
    } catch (error) {
      console.log("Failed to fetch invites", error);
    }
  };

  useEffect(() => {
    GetUserParties();
    fetchInvites();
  }, []);

  const GetUserParties = async () => {
    try {
      const response = await api.get("/party/getUserParties");
      console.log("User parties:", response.data);
      setUserParties(response.data); // Store response in state
    } catch (error) {
      console.log("Error fetching user parties:", error);
    }
  };

  useEffect(() => {
    GetUserParties();
  }, []);

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
          source={{ uri: colleague.image_path }}
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
            {invites.length > 0 && (
        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>Your Invitations</Text>
          {invites.map((invite, index) => (
            <View key={index} style={styles.inviteCard}>
              <Text style={styles.inviteText}>
                You have been invited to a party by <Text style={{ fontWeight: "bold" }}>{invite.driver_name}</Text>
              </Text>
              <View style={styles.inviteButtons}>
                <TouchableOpacity
                  style={[styles.inviteButton, { backgroundColor: "#4caf50" }]}
                  onPress={() => respondToInvite(invite.party_id, true)}
                >
                  <Text style={styles.inviteButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteButton, { backgroundColor: "#f44336" }]}
                  onPress={() => respondToInvite(invite.party_id, false)}
                >
                  <Text style={styles.inviteButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#9fbf2a"
          style={styles.loadingIndicator}
        />
      ) : userParties.length > 0 ? (
        <FlatList
          data={userParties}
          keyExtractor={(party, index) => index.toString()}
          renderItem={renderParty}
          contentContainerStyle={styles.scrollContent}
        />
      ) : (
        <Text style={styles.emptyText}>No parties found.</Text>
      )}
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
  inviteSection: {
  marginBottom: 20,
},
inviteTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
},
inviteCard: {
  backgroundColor: "#fff3cd",
  borderColor: "#ffeeba",
  borderWidth: 1,
  borderRadius: 10,
  padding: 15,
  marginBottom: 10,
},
inviteText: {
  fontSize: 16,
  marginBottom: 10,
},
inviteButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
},
inviteButton: {
  padding: 10,
  borderRadius: 5,
  width: "48%",
  alignItems: "center",
},
inviteButtonText: {
  color: "#fff",
  fontWeight: "bold",
},
});
