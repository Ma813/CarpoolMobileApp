import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { getModeOfTransport, setModeOfTransport } from '@/services/modeOfTransportApi';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const ModeOfTransport: React.FC = () => {
    const [selected, setSelected] = React.useState<string>('car');
    const transportOptions: { key: string; icon: 'car-outline' | 'walk-outline' | 'bicycle-outline' | 'bus-outline' }[] = [
        { key: 'car', icon: 'car-outline' },
        { key: 'walk', icon: 'walk-outline' },
        { key: 'bicycle', icon: 'bicycle-outline' },
        { key: 'bus', icon: 'bus-outline' },
    ];

    useEffect(() => {
        const fetchModeOfTransport = async () => {
            try {
                const mode = await getModeOfTransport();
                setSelected(mode);
            }
            catch (error) {
                console.log('Error fetching mode of transport:', error);
                setSelected('car'); // Default to 'car' if there's an error
            }
            
        };
        fetchModeOfTransport();
    });

    const handleTransportChange = async (mode: string) => {
        setSelected(mode);
        try {
            await setModeOfTransport(mode);
        } catch (error) {
            console.log('Error setting mode of transport:', error);
        }
    };


    return (
        <View style={styles.container}>
            {transportOptions.map(option => (
                <TouchableOpacity
                    key={option.key}
                    style={[styles.button, selected === option.key && styles.selectedButton]}
                    onPress={() => handleTransportChange(option.key)}
                >
                    <Ionicons name={option.icon} size={24} />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d3d3d3',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 10,
    },
    selectedButton: {
        backgroundColor: '#9fbf2a',
    },
    label: {
        marginTop: 5,
        fontSize: 14,
    },
});

export default ModeOfTransport;