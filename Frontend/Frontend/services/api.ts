import axios from 'axios';
import { baseurl } from '../constants/baseurl';
import { getData } from './localStorage';
import { navigationRef } from '../app/navigation';
import { UserWorkTime } from '../types/UserWorkTime';

const api = axios.create({
    baseURL: baseurl+'/api',
    withCredentials: true,
});

api.interceptors.request.use(
    async (config) => {
        const token = await getData('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    async (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    async (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('Unauthorized, redirecting to login page');
            if (navigationRef.isReady()) {
                const currentPage = navigationRef.getCurrentRoute()?.name;
                if (currentPage !== 'pages/LoginPage') {
                    navigationRef.navigate('pgaes/LoginPage');
                }
            }
        }

        return Promise.reject(error);
    }
);

export type WeatherForecast = {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
};

export const getWeatherForecast = async (): Promise<WeatherForecast[]> => {
    const response = await api.get('/WeatherForecast');
    return response.data;
}
export type UserSummary = {
  total_rides: number;
  total_emissions: number;
  last_ride: {
    place_name: string;
    date: string;
    transport: string;
    emissions: number;
  } | null;
  top_destinations: {
    place_name: string;
    count: number;
  }[];
};

export const getUserSummary = async (): Promise<UserSummary> => {
  const response = await api.get('/destinations/summary');
  return response.data;
};



export default api;