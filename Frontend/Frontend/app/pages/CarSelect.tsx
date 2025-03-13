import api from "@/services/api";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const CarSelectPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const [licensePlate, setLicensePlate] = useState("");
  const [brand, setbrand] = useState<string | null>(null);
  const [allbrands, setAllBrands] = useState<
    { label: string; value: string }[]
  >([]);
  const [allModels, setAllModels] = useState<
    { label: string; value: string }[]
  >([]);
  const [model, setModel] = useState<string | null>(null);

  const [openbrandDropdown, setOpenbrandDropdown] = useState(false);
  const [openModelDropdown, setOpenModelDropdown] = useState(false);

  useEffect(() => {
    fetchCarBrands();
  }, []);

  const fetchCarBrands = async () => {
    try {
      const response = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json"
      );
      const carMakes = await response.json();
      const formattedMakes = carMakes.Results.map((make: any) => ({
        label: make.Make_Name,
        value: make.Make_Name,
      })).filter((make: any) => make.value);
      setAllBrands(formattedMakes);
    } catch (error) {
      console.error("Error fetching car makes:", error);
      alert("Failed to fetch car makes.");
    }
  };

  const fetchCarModels = async (selectedMake: string) => {
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${selectedMake}?format=json`
      );
      const carModels = await response.json();
      const formattedModels = carModels.Results.map((models: any) => ({
        label: models.Model_Name,
        value: models.Model_Name,
      })).filter((models: any) => models.value);
      setAllModels(formattedModels);
    } catch (error) {
      console.error("Error fetching car models:", error);
      alert("Failed to fetch car models.");
    }
  };

  const submitCar = async () => {
    if (!brand || !model || !licensePlate) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const carData = {
        brand,
        model,
        licensePlate,
      };
      const response = await api.post("/cars/addCar", carData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Car data saved successfully!");
      navigation.navigate("index");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save car data.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Brand:</Text>
      <DropDownPicker
        open={openbrandDropdown}
        value={brand}
        items={allbrands}
        setOpen={setOpenbrandDropdown}
        setValue={(callback) => {
          const newbrand =
            typeof callback === "function" ? callback(brand) : callback;
          setbrand(newbrand);
          setModel(null); // Reset model when brand changes
          fetchCarModels(newbrand);
        }}
        searchable={true}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        placeholder="Select a car brand"
      />

      {/* Show Model Dropdown only when brand is selected */}
      {brand ? (
        <>
          <Text>Model:</Text>
          <DropDownPicker
            open={openModelDropdown}
            value={model}
            items={allModels}
            setOpen={setOpenModelDropdown}
            setValue={setModel}
            searchable={true}
            placeholder="Select a car model"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
          />
        </>
      ) : null}

      <Text>License plate:</Text>
      <TextInput
        style={styles.input}
        value={licensePlate}
        onChangeText={(input) => setLicensePlate(input.toUpperCase())}
        placeholder="Enter license plate"
        placeholderTextColor={"#000"}
        autoCapitalize="characters"
      />
      <Button title="Save" onPress={submitCar} />
    </View>
  );
};

export default CarSelectPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownList: {
    zIndex: 1000,
    elevation: 5,
  },
});
