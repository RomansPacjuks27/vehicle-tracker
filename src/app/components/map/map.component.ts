import { AfterViewInit, ApplicationRef, Component, ComponentRef, OnDestroy, ViewContainerRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MapService  } from '../../services/map.service';
import { HelperService  } from '../../services/helper.service';
import { IVehicleLocation } from '../../data/uservehicle';
import { MarkerPopupComponent } from './markerpopup.component';
import * as color2name from 'color-2-name';
import * as L from 'leaflet';
import { MapMarker } from '../../data/mapmarker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnDestroy {
  public map!: L.Map;
  private markers: MapMarker[] = [];
  private vehicleSubscription: Subscription;
  private selectedVehicleSubscription: Subscription;

  constructor(
    private mapService: MapService,
    private helperService: HelperService,
    private viewContainerRef: ViewContainerRef,
    private appRef: ApplicationRef) 
    {
      this.selectedVehicleSubscription = this.mapService.getSelectedVehicle()
        .pipe(debounceTime(200))
          .subscribe({
            next: (selected) => {
              if (selected) 
                this.processSelectedVehicle(selected);
            }
          });

      this.vehicleSubscription = this.mapService.getVehicleGeoData()
        .pipe(distinctUntilChanged())
          .subscribe({
            next: (vehicleLocations) => {
              if (vehicleLocations.length > 0)
                this.createVehicleMarkers(vehicleLocations);
            }
          });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map', 
      { center: [ 57, 24 ],
      zoom: 10
    });
    L.tileLayer(baseMapURl, { maxZoom: 18 }).addTo(this.map);
  }
  
  async processSelectedVehicle(vehicle: IVehicleLocation) {
    let currentMarker = this.markers.find((marker) => marker.vehicleId == vehicle.vehicleid)?.marker;
    if (currentMarker != undefined) {
      let otherMarkers = this.markers.filter((marker) => marker.marker != currentMarker);

      this.map.eachLayer((layer) => {
        if (otherMarkers.map(x => x.marker).includes((layer as L.CircleMarker)))
          (layer as L.CircleMarker).setStyle({ fillOpacity: 0.65, opacity: 0.9, color: 'dimgray' });
      });

      let selectedMarker: L.CircleMarker | undefined;// = undefined;
      this.map.eachLayer((layer) => {
       if (layer instanceof L.CircleMarker && layer == currentMarker) {
          selectedMarker = (layer as L.CircleMarker);
        }
      });

      await this.bindPopupForSelectedVehicle((selectedMarker as L.CircleMarker), vehicle);
      (selectedMarker as L.CircleMarker).setStyle({ fillOpacity: 1, opacity: 1, color: 'black' });
      (selectedMarker as L.CircleMarker).getPopup();
      (selectedMarker as L.CircleMarker).openPopup();

      let zoom = Math.max(this.map.getZoom(), 14);
      this.map.setView(currentMarker.getLatLng(), zoom, {
        animate: true
      });
    }
  }

  async bindPopupForSelectedVehicle(marker: L.CircleMarker, vehicle: IVehicleLocation) {
    let latLon = marker.getLatLng();
    let vehicleAddress = '';
    await this.mapService.getVehicleAddress(latLon.lat, latLon.lng).then(address => {
        vehicleAddress = address.display_name;
        let markerPopup: any = this.compilePopup(MarkerPopupComponent,
          (component: ComponentRef<MarkerPopupComponent>) => {
            component.instance.vehicleDescription = this.helperService.getVehicleDescription(vehicle),
              component.instance.vehicleAddress = vehicleAddress,
              component.instance.imageSrc = vehicle.foto;
          });
        marker.bindPopup(markerPopup);
      });
  }

  createVehicleMarkers(vehicleLocs: IVehicleLocation[]) {
    this.markers.forEach((marker) => {
      marker.marker.removeFrom(this.map);
    })

    this.markers = [];
    vehicleLocs.forEach((vehicleLoc) => {
      let colorname = color2name.closest(vehicleLoc.color).name;
        let newmarker = new L.CircleMarker([vehicleLoc.lat, vehicleLoc.lon], {
          radius: 6,
          color: 'dimgray',
          fillColor: colorname,
          fillOpacity: 0.65,
          opacity: 0.9,
        });
        newmarker.on("click", () => this.processSelectedVehicle(vehicleLoc));
        this.markers.push({ vehicleId: vehicleLoc.vehicleid, marker: newmarker });
      });

    this.markers.forEach((marker: MapMarker) => {
      marker.marker.addTo(this.map);
    });
  }

  compilePopup(component: any, onAttachFunc: any) {
    let compRef = this.viewContainerRef.createComponent(component);
    if (onAttachFunc)
      onAttachFunc(compRef);

    compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));
    let div = document.createElement('div');
    div.appendChild(compRef.location.nativeElement);
    return div;
  }
 
  ngOnDestroy(): void {
    this.vehicleSubscription.unsubscribe();
    this.selectedVehicleSubscription.unsubscribe();
  }
}
