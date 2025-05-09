import api from './api';

export const getUserParties = async () => {
    try {
        const response = await api.get('/party/getUserParties');
        return response.data;

    } catch (error: any) {
        return [];
    }
};