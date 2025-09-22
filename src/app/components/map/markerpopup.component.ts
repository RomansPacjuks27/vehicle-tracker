import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-markerpopup',
  templateUrl: './markerpopup.component.html',
  styleUrl: './markerpopup.component.scss'
})
export class MarkerPopupComponent {
  @Input() vehicleDescription: string
  @Input() vehicleAddress: string
  @Input() imageSrc: string
  @Input() imageLoaded: boolean;

  constructor() {
    this.vehicleDescription = '';
    this.vehicleAddress = '';
    this.imageSrc = '';
    this.imageLoaded = true;
  }
  onImageLoadFail() {
    this.imageLoaded = !this.imageLoaded;
  }
}
