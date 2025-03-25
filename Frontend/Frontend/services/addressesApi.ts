import api from './api';

export type Addresses = {
    home_address: string;
    work_address: string;
};

const CONTROLLER_NAME = 'addresses';

export const postAddresses = async (address: Addresses) => {
    return api.post(`/${CONTROLLER_NAME}/addAddresses`, address);
};

export const getAddresses = async () => {
    return api.get(`/${CONTROLLER_NAME}/getAddresses`);
};