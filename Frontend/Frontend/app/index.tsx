import { Text, View } from "react-native";
import WeatherForecastPage from "../components/WeatherForecast";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <Text>Main Page</Text>
      <WeatherForecastPage />
    </View>
  );
}
