import { IUserVehicle } from "./user";

export interface IVehicleLocation extends IUserVehicle{
    lat: number;
    lon: number;
}
