import axios from 'axios';
import { baseurl } from '../constants/baseurl';

const api = axios.create({
    baseURL: baseurl,
    withCredentials: true,
});

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

export default api;