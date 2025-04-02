import axios from 'axios';


export type Suggestion = {
    id: string;
    place_name: string;
    latitude?: number;
    longitude?: number;
}

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'None';

const api = axios.create({
    baseURL: 'https://api.mapbox.com/geocoding/v5',
    withCredentials: true,
});

export const fetchAddresses = async (text: string) => {
    if (text.length > 2) {
        try {
            const url = `/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
            const response = await api.get(url);
            return response.data.features.map((feature: any) => ({
                id: feature.id,
                place_name: feature.place_name,
                latitude: feature.center[1],
                longitude: feature.center[0]
            }));
        } catch (error) {
            console.error("Error fetching addresses:", error, "token is:", MAPBOX_ACCESS_TOKEN);
        }
    }
    return [];
};

export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string | null> => {
    if (!latitude || !longitude) {
        return null;
    }
    try {
        const url = `/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
        const response = await api.get(url);
        return response.data.features[0]?.place_name || null;
    } catch (error) {
        console.error("Error fetching address from coordinates:", error);
        return null;
    }
};
