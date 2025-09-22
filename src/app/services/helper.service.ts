import { Injectable } from '@angular/core';
import { IUserVehicle } from '../data/user';
import * as color2name from 'color-2-name';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  getVehicleDescription(vehicle: IUserVehicle) : string {
    var description = vehicle.make + ` ` + vehicle.model;
    if (vehicle.color === undefined)
      return description;
    else
      return description.concat(` (` + color2name.closest(vehicle.color).name + `)`);
  }
}
