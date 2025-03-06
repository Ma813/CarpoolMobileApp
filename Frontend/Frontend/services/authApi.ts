import api from './api';
import { saveData, getData, removeData } from './localStorage';

type LoginInfo = {
    username: string;
    password: string;
};

type SignupInfo = {
    username: string;
    password: string;
};

const CONTROLLER_NAME = 'Auth';

export const login = async (login: LoginInfo) => {
    const result = await api.post(`/${CONTROLLER_NAME}/login`, login);
    saveData('token', result.data.token);
    saveData('username', login.username);
};

export const signup = async (signup: SignupInfo) => {
    return api.post(`/${CONTROLLER_NAME}/signup`, signup);
};