import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Button, Alert } from "react-native";
import { Suggestion, fetchAddresses } from "@/services/mapbox";
import { Addresses, postAddresses, getAddresses } from "@/services/addressesApi";
import { styles } from "./ProfileStyles";

const AddressSearch: React.FC = () => {
    const [homeQuery, setHomeQuery] = useState<string>("");
    const [homeSuggestions, setHomeSuggestions] = useState<Suggestion[]>([]);
    const [selectedHomeAddress, setSelectedHomeAddress] = useState<string | null>(null);

    const [workQuery, setWorkQuery] = useState<string>("");
    const [workSuggestions, setWorkSuggestions] = useState<Suggestion[]>([]);
    const [selectedWorkAddress, setSelectedWorkAddress] = useState<string | null>(null);

    const handleSaveAddresses = () => {
        console.log("Save addresses:\n", { selectedHomeAddress, selectedWorkAddress });
        if (selectedHomeAddress && selectedWorkAddress) {
            try{
            postAddresses({ home_address: selectedHomeAddress, work_address: selectedWorkAddress });
            Alert.alert("Success", "Addresses saved successfully");
            }
            catch (error) {
                Alert.alert("Error", "Error saving addresses: " + error);
            }
        } else {
            Alert.alert("Error", "Both addresses must be selected before saving.");
        }
    };

    useEffect(() => {
        getAddresses().then((response) => {
            const addresses = response.data;
            if (addresses) {
                setSelectedHomeAddress(addresses.home_address);
                setSelectedWorkAddress(addresses.work_address);
                setHomeQuery(addresses.home_address);
                setWorkQuery(addresses.work_address);
            }
        });
    }
    , []);


    return (
        <View style={styles.container}>
            <TextInput
            placeholder="Home address"
            placeholderTextColor="#9EABA7"
            value={homeQuery}
            onChangeText={(text) => {
                setHomeQuery(text);
                fetchAddresses(text).then(setHomeSuggestions);
            }}
            onFocus={() => {
                if (selectedHomeAddress) {
                    setHomeSuggestions([{ id: "selected", place_name: selectedHomeAddress }]);
                    setHomeQuery("");
                    setSelectedHomeAddress(null);
                }
            }}
            style={styles.input}
            />
            <FlatList
            data={homeSuggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                    setSelectedHomeAddress(item.place_name);
                    setHomeSuggestions([]);
                    setHomeQuery(item.place_name);
                }}
                >
                <Text>{item.place_name}</Text>
                </TouchableOpacity>
            )}
            />

            <TextInput
            placeholder="Work address"
            placeholderTextColor="#9EABA7"
            value={workQuery}
            onChangeText={(text) => {
                setWorkQuery(text);
                fetchAddresses(text).then(setWorkSuggestions);
            }}
            onFocus={() => {
                if (selectedWorkAddress) {
                    setWorkSuggestions([{ id: "selected", place_name: selectedWorkAddress }]);
                    setWorkQuery("");
                    setSelectedWorkAddress(null);
                }
            }}
            style={styles.input}
            />
            <FlatList
            data={workSuggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                    setSelectedWorkAddress(item.place_name);
                    setWorkSuggestions([]);
                    setWorkQuery(item.place_name);
                }}
                >
                <Text>{item.place_name}</Text>
                </TouchableOpacity>
            )}
            />

            <TouchableOpacity style={styles.button} onPress={handleSaveAddresses}>
            <Text style={styles.buttonText}>Save Addresses</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddressSearch;