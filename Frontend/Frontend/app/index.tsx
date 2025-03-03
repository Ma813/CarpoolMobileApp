import { Text, View, TextInput, Button } from "react-native";
import WeatherForecastPage from "../components/WeatherForecast";
import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [text, setText] = useState("");

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('user_name', JSON.stringify({ text }));
      alert('Data saved!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('user_name');
      if (value !== null) {
        const parsedValue = JSON.parse(value);
        alert('Retrieved data: ' + parsedValue.text);
      }
      else {
        alert('No data found');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  const removeData = async () => {
    try {
      await AsyncStorage.removeItem('user_name');
      alert('Data removed!');
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 20,
          width: '80%',
          paddingHorizontal: 10,
        }}
        placeholder="Type here"
        onChangeText={setText}
        value={text}
      />
      <Button
        title="Submit"
        onPress={() => {
          saveData().catch((error) => {
            console.error('Error saving data:', error);
          });
        }}
      />
      
      <Button
        title="Retrieve"
        onPress={() => {
          getData().catch((error) => {
            console.error('Error retrieving data:', error);
          });
        }}
      />

      <Button
        title="Remove"
        onPress={() => {
          removeData().catch((error) => {
            console.error('Error removing data:', error);
          });
        }}
      />


      <Text>Main Page</Text>
      <WeatherForecastPage />
    </View>
  );
}
