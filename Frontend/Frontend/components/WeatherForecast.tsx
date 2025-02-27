import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { WeatherForecast, getWeatherForecast } from '../services/api';
import { Switch } from 'react-native';

export default function WeatherForecastPage() {
    const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnabled, setIsEnabled] = useState(false);

    const text = isEnabled ? 'Using Celsius' : ' Using Fahrenheit';
    const unit = isEnabled ? 'C' : 'F';

    useEffect(() => {
        getWeatherForecast().then(forecast => {
            setForecast(forecast);
            setLoading(false);
        });
    }, []);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);



    return (
        <View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text>{text}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#30db5b" }}
                    thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>

            <Text>Weather Forecast</Text>

            {loading ? <Text>'Loading forecast...'</Text> :
                forecast ? forecast.map((item, index) => (
                    <View key={index}>
                        <Text>{item.date}:
                            {isEnabled ? item.temperatureC : item.temperatureF}°{unit}, {item.summary}
                        </Text>
                    </View>
                )) : <Text>'No forecast available'</Text>}

        </View >
    );
}