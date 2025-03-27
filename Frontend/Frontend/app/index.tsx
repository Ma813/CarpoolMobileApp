import { styles } from "./styles";
import { Link, useNavigation } from "expo-router";
import { removeData, getData } from "@/services/localStorage";
import { Text, View, Button, Image, KeyboardAvoidingView } from "react-native";
import React, { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { useFonts } from 'expo-font';

const GoogleNaps = () => {
  const [fontsLoaded] = useFonts({
    'Gotham': require('@/assets/fonts/Gotham-Black.otf'),
    'Gotham-Bold': require('@/assets/fonts/Gotham-Bold.otf'),
    'Gotham-Italic': require('@/assets/fonts/Gotham-BlackItalic.otf'),
    'Gotham-Light': require('@/assets/fonts/Gotham-Light.otf'),
  });


  const [username, setUsername] = useState(null);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    const username = await getData("username");
    setUsername(username);
    if (!username) {
      navigation.navigate("pages/LoginPage");
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]); // Empty array ensures this runs once on mount

  if (!username) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }


  return (
    <KeyboardAvoidingView style={styles.container}>
      <NavBar />
      <Image source={require('@/assets/images/car.png')} style={styles.image} />
      <Text style={styles.app_name}>COLLAB.RIDE</Text>
      <Text style={[styles.welcomeText, { textAlign: "center", alignSelf: "center" }]}>Welcome, {username}!</Text>


    </KeyboardAvoidingView>
  );
};

export default GoogleNaps;
