import axios from 'axios';


export type Suggestion = {
    id: string;
    place_name: string;
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
            }));
        } catch (error) {
            console.error("Error fetching addresses:", error, "token is:", MAPBOX_ACCESS_TOKEN);
        }
    }
    return [];
};
