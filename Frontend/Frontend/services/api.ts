import axios from 'axios';
import { baseurl } from '../constants/baseurl';
import { UserWorkTime } from '@/types/UserWorkTime';

const api = axios.create({
    baseURL: baseurl+'/api',
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
export const getUserWorkTime = async (): Promise<UserWorkTime[]> => {
    const response = await api.get('/userworktime/getUserWorkTimes');
    return response.data;
}

export default api;