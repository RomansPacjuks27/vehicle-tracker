import { Component, OnDestroy } from '@angular/core';
import { IUser, IUserVehicle } from '../../data/user';
import { MapService } from '../../services/map.service';
import { HelperService } from '../../services/helper.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.scss'
})

export class UserlistComponent implements OnDestroy {
  public users: IUser[] = [];
  private userSubscription: Subscription;

  constructor(
    private mapService: MapService,
    private helperService: HelperService) 
  {
      this.userSubscription = this.mapService.getUsers()
        .subscribe({
          next: (users) => {
            this.users = users;
            this.mapService.userDataLoaded = true;
          }
        });
  }

  plotVehiclesOnMap(user: IUser) {
    this.mapService.plotUserVehicles(user);
  }
  
  selectVehicle(vehicleId: number) {
    this.mapService.findVehicle(vehicleId);
  }
  
  getVehicleCount(user: IUser) {
    if (user.vehicles.length > 10)
      return ` (>10)`;
    else
      return ` (` + user.vehicles.length + `)`;
  }

  getVehicleDescription(vehicle: IUserVehicle) : string {
    return this.helperService.getVehicleDescription(vehicle);
  }

  userDataLoaded() {
    return this.mapService.userDataLoaded;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
