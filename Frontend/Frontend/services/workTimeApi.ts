import { UserWorkTime } from '../types/UserWorkTime';
import api from './api';

export const getUserWorkTimes = async (): Promise<UserWorkTime[]> => {
    const response = await api.get('/userworktime');
    return response.data;
}