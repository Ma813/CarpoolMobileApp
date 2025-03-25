import api from './api';

type Address = {
    address: string;
};

const CONTROLLER_NAME = 'Addresses';

export const postAddress = async (address: Address) => {
    return api.post(`/${CONTROLLER_NAME}`, address);
};

export const getAddresses = async () => {
    return api.get(`/${CONTROLLER_NAME}`);
};