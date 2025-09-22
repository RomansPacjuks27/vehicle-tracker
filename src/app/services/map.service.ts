import { Injectable } from '@angular/core';
import { IVehicleLocation } from '../data/uservehicle';
import { BehaviorSubject, lastValueFrom, map, Observable, of, Subject } from 'rxjs';
import { IUser } from '../data/user';
import { HttpClient, HttpContext, HttpContextToken, HttpParams } from '@angular/common/http';
import { Address } from '../data/address';
import { environment } from '../../environments/environment.development';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public userDataLoaded: boolean = false;
  private vehicleMapData: BehaviorSubject<IVehicleLocation[]>;
  private selectedVehicle: Subject<IVehicleLocation | null>;

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService) 
  { 
    this.selectedVehicle = new Subject<IVehicleLocation | null>;
    this.vehicleMapData = new BehaviorSubject<IVehicleLocation[]>([]);
  }

  getSelectedVehicle() : Observable<IVehicleLocation | null> {
    return this.selectedVehicle.asObservable();
  }
  
  getVehicleGeoData() : Observable<IVehicleLocation[]> {
    return this.vehicleMapData.asObservable();
  }

  findVehicle(vehicleId: number) : void {
    const foundVehicle = this.vehicleMapData.value.find((vehicle) => vehicle.vehicleid == vehicleId);
    if (foundVehicle)
      this.selectedVehicle.next(foundVehicle);
  }
  
  plotUserVehicles(user: IUser) : void {
    this.getVehicleLocations(user.userid)
    .subscribe({
      next: (vehicles) => {
        vehicles.forEach(vehicle => {
          Object.assign(vehicle, ...[user.vehicles.find(x => x.vehicleid == vehicle.vehicleid)]);
        }); 
        this.vehicleMapData.next(vehicles);
        this.selectedVehicle.next(null);
      }
    });
  }

  getVehicleLocations(userId: number): Observable<IVehicleLocation[]> {
    const params = new HttpParams().set('op', 'getLocations').set('userid', userId);
    const context = new HttpContext().set(RETRY_COUNT, 3).set(REQUEST_TIMEOUT, 5000);
    const cachingTime = 30;
    return this.httpRequest<IVehicleLocation[]>(HttpVerb.GET, environment.vehicleApiBaseUrl, { params: params, context: context, cachingOptions: cachingTime }, this.mapVehicles);
  }

  getUsers(): Observable<IUser[]>{
    this.userDataLoaded = false;
    const params = new HttpParams().set('op', 'list');
    const context = new HttpContext().set(RETRY_COUNT, 2).set(REQUEST_TIMEOUT, 2000);
    const cachingTime = 300;
    return this.httpRequest<IUser[]>(HttpVerb.GET, environment.vehicleApiBaseUrl, { params: params, context: context, cachingOptions: cachingTime }, this.mapUsers);
  }

  getVehicleAddress(lat: number, lon: number) {
    const params = new HttpParams().set('lat', lat).set('lon', lon).set('format', 'json');
    return lastValueFrom(this.httpClient.get<Address>(environment.nominatimApiBaseUrl + `reverse`, { params: params }));
  }

  private mapUsers(data: any) {
    return data.filter((entry: any) => {
      return (Object.keys(entry).length > 0)
    });
  }

  private mapVehicles(data: any) {
    return data.filter((entry: any) => {
      return (Object.keys(entry).length > 0) && 
              (typeof entry.lat == 'number') && 
              (typeof entry.lon == 'number') &&
              (typeof entry.vehicleid == 'number')
    });
  }

  private httpRequest<T>(verb: HttpVerb, url: string, options: any, mappingCallback?: Function): Observable<T> {
    if (options.cachingOptions > 0) {
      const data = this.cacheService.load(url + options.params);
      if (data != null) {
        return of(data);
      }
    }

    return this.httpClient.request<T>(verb, url, options)
      .pipe(
        map((response: any) => {
          let result: any;
          if (mappingCallback == undefined) 
            result = response.data;
          else
            result = (mappingCallback(response.data));

          if (options.cachingOptions > 0) {
            this.cacheService.save({
              key: url + options.params,
              data: result,
              expiresInSeconds: options.cachingOptions
            });
          }
          return result;
      }));
    }
}

export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export const RETRY_COUNT = new HttpContextToken(() => environment.defaultRequestRetryAttempts);
export const REQUEST_TIMEOUT = new HttpContextToken(() => environment.defaultRequestTimeout);
