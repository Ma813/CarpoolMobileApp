import api from './api';

export type Car = {
    brand: string;
    model: string;
    licensePlate: string;
    fuelType: string;
    fuelEfficiency: number;
};

export const getCar = async () => {
    return api.get(`/cars/getCar`);
};
export const postCar = async (car: Car) => {
    return api.post(`/cars/addCar`, car);
}