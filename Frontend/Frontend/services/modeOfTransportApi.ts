import api from './api';
import axios from 'axios';

const CONTROLLER_NAME = 'modeOfTransport';

export const getModeOfTransport = async (): Promise<string> => {
    const response = await api.get(`/${CONTROLLER_NAME}`);
    return response.data;
};

export const setModeOfTransport = async (mode: string): Promise<void> => {
    await api.post(`/${CONTROLLER_NAME}`, mode, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};