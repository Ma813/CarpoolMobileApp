import api from "@/services/api";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { styles } from "./ProfileStyles";
import { X } from "lucide-react-native";
import { Car, getCar, postCar } from "@/services/carApi";

const CarSelectPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const [licensePlate, setLicensePlate] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [allbrands, setAllBrands] = useState<
    { label: string; value: string }[]
  >([]);
  const [allModels, setAllModels] = useState<
    { label: string; value: string }[]
  >([]);
  const [model, setModel] = useState<string | null>(null);
  const [showBrands, setShowBrands] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(0);
  const [fuelEfficiencyQuery, setFuelEfficiencyQuery] = useState("");

  const fuelTypes = [
    { label: "Petrol", value: "Petrol" },
    { label: "Diesel", value: "Diesel" },
    { label: "Electric", value: "Electric" },
    { label: "Hybrid", value: "Hybrid" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    fetchCarBrands();
    fetchExistingCar();
  }, []);

  const fetchExistingCar = async () => {
    try {
      const response = await getCar();
      if (response.data) {
        const car = response.data;
        console.log("Existing car data:", car);
        setBrand(car.brand);
        setModel(car.model);
        setLicensePlate(car.license_plate);
        setFuelType(car.fuel_type);
        setBrandSearch(car.brand);
        setModelSearch(car.model);
        setShowBrands(false);
        setShowModels(false);
        setFuelEfficiency(car.fuel_efficiency);
        setFuelEfficiencyQuery(
          car.fuel_efficiency.toString().replace(".", ",")
        );
      }
    } catch (error) {
      console.log("Error fetching existing car:", error); // probably car is not set yet
    }
  };

  const fetchCarBrands = async () => {
    try {
      const response = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json"
      );
      const carMakes = await response.json();
      const formattedMakes = carMakes.Results.map((make: any) => ({
        label: make.MakeName,
        value: make.MakeName,
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
    if (!brand || !model || !licensePlate || !fuelType || (fuelType == "Petrol" || fuelType == "Diesel" && !fuelEfficiency) ) {
      alert("Please fill in all fields.");
      return;
    }

    const car = {
      brand,
      model,
      licensePlate,
      fuelType,
      fuelEfficiency,
    };

    postCar(car)
      .then((response) => {
        console.log("Car saved successfully:", response);
        alert("Car saved successfully.");
      })
      .catch((error) => {
        console.error("Error saving car:", error);
        alert("Failed to save car.");
      });
  };

  return (
    <View style={carStyles.container}>
      <View style={carStyles.inputContainer}>
        <TextInput
          style={carStyles.input}
          value={brandSearch}
          onChangeText={(text) => {
            setBrandSearch(text);
            if (text.length > 0) {
              setShowBrands(true);
            } else {
              setShowBrands(false);
            }
          }}
          placeholder="Search brands..."
          placeholderTextColor={"#000"}
        />
        {brandSearch.length > 0 && (
          <TouchableOpacity
            style={carStyles.xContainer}
            onPress={() => {
              setBrandSearch("");
              setBrand(null); // Reset brand when clearing search
              setShowBrands(false);
            }}
          >
            <X size={18} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {showBrands && (
        <FlatList
          style={{ marginBottom: 10 }}
          data={allbrands.filter((brand) =>
            brand.label.toLowerCase().includes(brandSearch.toLowerCase())
          )}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setBrandSearch(item.label);
                setBrand(item.value);
                setModel(null); // Reset model when brand changes
                setModelSearch(""); // Reset model search input
                fetchCarModels(item.value);
                setShowBrands(false); // Hide after selection if not focused
                setShowModels(false); // Hide models if brand is selected
              }}
              style={[carStyles.listItem]}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Show Model Dropdown only when brand is selected */}
      {brand && (
        <>
          <View style={carStyles.inputContainer}>
            <TextInput
              style={carStyles.input}
              value={modelSearch}
              onChangeText={setModelSearch}
              placeholder="Search models..."
              placeholderTextColor={"#000"}
              onBlur={() => setShowBrands(false)}
              onChange={() => {
                if (modelSearch.length > 0) {
                  setShowModels(true);
                } else {
                  setShowModels(false);
                }
              }}
            />
            {modelSearch.length > 0 && (
              <TouchableOpacity
                style={carStyles.xContainer}
                onPress={() => {
                  setModelSearch("");
                  setModel(null); // Reset brand when clearing search
                  setShowModels(false);
                }}
              >
                <X size={18} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          {showModels && (
            <FlatList
              style={{ marginBottom: 10 }}
              data={allModels.filter((model) =>
                model.label.toLowerCase().includes(modelSearch.toLowerCase())
              )}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setModel(item.value);
                    setModelSearch(item.label); // Set the model search input to the selected model
                    setShowModels(false); // Hide after selection
                  }}
                  style={[
                    carStyles.listItem,
                    model === item.value && carStyles.selectedItem,
                  ]}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      <View style={carStyles.inputContainer}>
        <TextInput
          style={carStyles.input}
          value={licensePlate}
          onChangeText={(input) => setLicensePlate(input.toUpperCase())}
          placeholder="Enter license plate"
          placeholderTextColor={"#000"}
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        onPress={() => setShowFuelDropdown(!showFuelDropdown)}
        style={[
          !fuelType ? carStyles.dropdownToggle : carStyles.dropdownSelected,
          showFuelDropdown && carStyles.dropdownActive,
        ]}
      >
        <Text style={carStyles.dropdownText}>
          {fuelType ? `Fuel Type: ${fuelType}` : "Select Fuel Type"}
        </Text>
      </TouchableOpacity>
      {showFuelDropdown && (
        <FlatList
          style={{ marginBottom: 10 }}
          data={fuelTypes}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setFuelType(item.value);
                setShowFuelDropdown(false); // Hide after selection
              }}
              style={[
                carStyles.dropdownItem,
                fuelType === item.value && carStyles.selectedItem,
              ]}
            >
              <Text style={carStyles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {fuelType === "Petrol" || fuelType === "Diesel" ? (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={carStyles.inputLabel}>
              Fuel efficiency (liters / 100km):
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={fuelEfficiencyQuery}
              style={carStyles.input}
              keyboardType="numeric"
              onChangeText={(text) => {
                const formattedText = text.replace(",", ".");
                setFuelEfficiencyQuery(text);
                setFuelEfficiency(parseFloat(formattedText));
              }}
            />
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={submitCar}>
        <Text style={styles.buttonText}>Save Car</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CarSelectPage;

const carStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 10,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginVertical: 4,
  },
  selectedItem: {
    backgroundColor: "#e0e0e0",
  },
  input: {
    height: 45,
    borderColor: "#ced4da",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownToggle: {
    backgroundColor: "grey",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownSelected: {
    backgroundColor: "darkgrey",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownActive: {
    backgroundColor: "darkgrey",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 5,
    marginVertical: 4,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  xContainer: {
    flex: 1,
    position: "absolute",
    height: "100%",
    right: 10,
    justifyContent: "center",
    zIndex: 1,
  },
});
