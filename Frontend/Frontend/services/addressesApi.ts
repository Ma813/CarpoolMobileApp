import api from './api';
import { Suggestion } from './mapbox';

export type Addresses = {
    home_address: string;
    work_address: string;
};

const CONTROLLER_NAME = 'addresses';

export const postAddresses = async (address: Addresses) => {
    return api.post(`/${CONTROLLER_NAME}/addAddresses`, address);
};

export const getAddresses = async () => {
    return api.get(`/${CONTROLLER_NAME}/getAddresses`);
};

export const getLastAddresses = async () => {
    try {
        const response = await api.get(`/destinations/last`);
        return response.data;
    } catch (error) {
        console.error("Error fetching last addresses:", error);
        return [];
    }
};
export const postDestination = async (destination: Suggestion) => {
    try {
        const response = await api.post(`/destinations/addDestination`, destination);
        return response.data;
    } catch (error) {
        console.error("Error posting destination:", error);
        throw error;
    }
}