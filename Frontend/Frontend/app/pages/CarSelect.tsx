import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Switch,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/services/api";
import DropDownPicker from "react-native-dropdown-picker";

const CarSelectPage: React.FC = () => {
  const [licensePlate, setLicensePlate] = useState("");
  const [make, setMake] = useState("");
  const [allMakes, setAllMakes] = useState<{ label: string; value: string }[]>(
    []
  );
  const [allModels, setAllModels] = useState<
    { label: string; value: string }[]
  >([]);
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");

  const [openMakeDropdown, setOpenMakeDropdown] = useState(false);
  const [openModelDropdown, setOpenModelDropdown] = useState(false);

  const onModelOpen = useCallback(() => {
    setOpenMakeDropdown(false);
  }, []);
  const onMakeOpen = useCallback(() => {
    setOpenModelDropdown(false);
  }, []);

  const fetchCarMakes = async () => {
    try {
      const carMakes = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json",
        {
          method: "GET",
        }
      ).then((response) => response.json());
      const formattedMakes = carMakes.Results.map((make: any) => ({
        label: make.Make_Name,
        value: make.Make_Name,
      })).filter((make: any) => make.value);
      setAllMakes(formattedMakes);
    } catch (error) {
      console.error("Error fetching car makes:", error);
      alert("Failed to fetch car makes.");
    }
  };
  const fetchCarModels = async (make: string) => {
    try {
      const carModels = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${make}?format=json`,
        {
          method: "GET",
        }
      ).then((response) => response.json());
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
  useEffect(() => {
    fetchCarMakes();
  }, []);

  const CapitalizeLicensePlate = (input: string) => {
    const uppercasedInput = input.toUpperCase();
    setLicensePlate(uppercasedInput);
  };
  return (
    <View>
      <Text>Make:</Text>
      <DropDownPicker
        open={openMakeDropdown}
        onOpen={onMakeOpen}
        value={make}
        items={allMakes}
        setOpen={setOpenMakeDropdown}
        setValue={setMake}
        searchable={true}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        placeholder="Select a car make"
      />
      <Text>Model:</Text>
      <DropDownPicker
        open={openModelDropdown}
        onOpen={onModelOpen}
        value={model}
        items={allModels}
        setOpen={setOpenModelDropdown}
        setValue={setModel}
        searchable={true}
        placeholder="Select a car model"
      />
      <Text>License plate:</Text>
      <TextInput
        style={styles.input}
        value={licensePlate}
        onChangeText={CapitalizeLicensePlate}
        placeholder="Enter license plate"
        placeholderTextColor={"#000"}
        autoCapitalize="characters"
      />
    </View>
  );
};

export default CarSelectPage;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dropdown: {
    zIndex: 10, // Ensure the dropdown is in front
  },
  dropdownContainer: {
    zIndex: 10, // Ensure the dropdown container is in front
  },
});
