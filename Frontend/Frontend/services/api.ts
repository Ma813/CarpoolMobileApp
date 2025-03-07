import axios from 'axios';
import { baseurl } from '../constants/baseurl';
import { getData } from './localStorage';
import { navigationRef } from '../app/navigation';


const api = axios.create({
    baseURL: baseurl,
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

export type WorkTime = {
    id_user_work_times: number;
    start_time: string;
    end_time: string;
    day: string;
};

export const getWeatherForecast = async (): Promise<WeatherForecast[]> => {
    const response = await api.get('/WeatherForecast');
    return response.data;
}

export const getUserWorkTimes = async (): Promise<any> => {
    const response = await api.get('/api/userworktime');
    return response.data;
}

export default api;