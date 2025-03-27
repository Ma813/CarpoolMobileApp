import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { removeData } from '@/services/localStorage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { getData } from '@/services/localStorage';

export const NavBar = () => {
    const navigation = useNavigation<any>();


    const handleLogout = async () => {
        await removeData("token");
        await removeData("username");
        navigation.navigate("pages/LoginPage");
    };
    return (
        <View style={styles.navbar}>
            <Link href="/">
                <Ionicons name="home-outline" size={28} color="#333" />
            </Link>
            <Link href="/pages/Map">
                <Ionicons name="map-outline" size={28} color="#333" />
            </Link>
            <Link href="/pages/Profile">
                <Ionicons name="person-outline" size={28} color="#333" />
            </Link>
            <TouchableOpacity onPress={() => handleLogout()}>
                <Ionicons name="log-out-outline" size={28} color="#333" />
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    navbar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#9fbf2a",
        padding: 20,
        paddingBottom: 30,
    },
});