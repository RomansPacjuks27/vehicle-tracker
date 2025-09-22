export interface IUser {
    userid: number;
    owner: {
        name: string;
        surname: string;
        foto: string;
    }
    vehicles: IUserVehicle[];
}

export interface IUserVehicle {
    vehicleid: number;
    make: string;
    model: string;
    year: string;
    color: string;
    vin: string;
    foto: string;
}