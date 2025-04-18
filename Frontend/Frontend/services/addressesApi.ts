import api from "./api";
import { Suggestion } from "./mapbox";

export type Addresses = {
  home_address: string;
  home_coordinates: { latitude: number; longitude: number };
  work_coordinates: { latitude: number; longitude: number };
  work_address: string;
};

export type Trip = {
  start_latitude?: number;
  start_longitude?: number;

  destination: string;
  destination_latitude?: number;
  destination_longitude?: number;
};

const CONTROLLER_NAME = "addresses";

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
export const postDestination = async (destination: Trip) => {
  try {
    const response = await api.post(
      `/destinations/addDestination`,
      destination
    );
    return response.data;
  } catch (error) {
    console.error("Error posting destination:", error);
    throw error;
  }
};
export const getClosestColleagues = async (range: number) => {
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL; // Use your backend base URL
  try {
    const response = await api.get(
      `/${CONTROLLER_NAME}/getClosestColleagues?range=${range}`
    );
    return response.data; // Return the list of closest colleagues
  } catch (error) {
    console.log("Error fetching closest colleagues:", error);
    throw error;
  }
};
export const fetchOptimalPickup = async () => {
  try {
    const response = await api.get("/destinations/optimalPickup", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching optimal pickup:", error);
    throw error;
  }
};
