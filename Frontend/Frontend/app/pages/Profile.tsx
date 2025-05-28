import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import CarSelect from './CarSelect';
import UserWorkTimesPage from './UserWorkTime';
import Addresses from './Addresses';
import { NavBar } from '../components/NavBar';
import { Ionicons } from '@expo/vector-icons';
import ModeOfTransport from './ModeOfTransport';
import UserWorkTimeAndroid from './UserWorkTimesAndroid';

const sections = [
    { id: '1', title: 'Car', icon: "car", component: <CarSelect /> },
    { id: '2', title: 'Addresses', icon: "location", component: <Addresses /> },
    { id: '3', title: 'Mode of Transport', icon: "walk-outline", component: <ModeOfTransport /> },
    { id: '4', title: 'Work Times', icon: "time", component: Platform.OS === 'ios' ? <UserWorkTimesPage /> : <UserWorkTimeAndroid /> },
];

const Profile: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile Page</Text>
            <FlatList
                data={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.section}>
                        <Ionicons name={item.icon as "car-sport" | "location" | "time"} size={28} color="#333" />
                        {item.title === "Addresses" ? (
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <Text style={styles.subHeader}>{item.title}</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        Alert.alert(
                                            "Privacy Tip",
                                            "Use a nearby public place if you prefer not to share your actual addresses."
                                        )
                                    }
                                    style={{
                                        marginBottom: 10,
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
                        ) : (
                            <Text style={styles.subHeader}>{item.title}</Text>
                        )}

                        {item.component}
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
            <NavBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        paddingTop: 50,
    },
    listContent: {
        paddingBottom: 100,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subHeader: {
        
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    navBarContainer: {
        marginTop: 20,
    },
});

export default Profile;