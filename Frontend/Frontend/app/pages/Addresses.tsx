import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import { Suggestion, fetchAddresses } from "@/services/mapbox";
import { Addresses, postAddresses, getAddresses } from "@/services/addressesApi";

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
            }
            catch (error) {
                console.error("Error saving addresses:", error);
            }
        } else {
            console.error("Both addresses must be selected before saving.");
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
            <Text>Input home address</Text>
            <TextInput
            placeholder="Search address..."
            value={homeQuery}
            onChangeText={(text) => {
                setHomeQuery(text);
                fetchAddresses(text).then(setHomeSuggestions);
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

            <Text>Input work address</Text>
            <TextInput
            placeholder="Search address..."
            value={workQuery}
            onChangeText={(text) => {
                setWorkQuery(text);
                fetchAddresses(text).then(setWorkSuggestions);
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

            <Button title="Save addresses" onPress={handleSaveAddresses} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
});

export default AddressSearch;