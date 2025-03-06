import axios from 'axios';
import { baseurl } from '../constants/baseurl';
import { UserWorkTime } from '../types/UserWorkTime';

const api = axios.create({
    baseURL: baseurl+'/api',
    withCredentials: false,
import { UserWorkTime } from '@/types/UserWorkTime';

const api = axios.create({
    baseURL: baseurl+'/api',
    withCredentials: true,
});

export const getUserWorkTimes = async (): Promise<UserWorkTime[]> => {
    const response = await api.get('/userworktime');
    return response.data;
}
export const getUserWorkTime = async (): Promise<UserWorkTime[]> => {
    const response = await api.get('/userworktime/getUserWorkTimes');
    return response.data;
}

export default api;