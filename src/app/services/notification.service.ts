import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'any'
})
export class NotificationService {
    constructor(
        private zone: NgZone,
        private snackBar: MatSnackBar
    ) {}

    openServerErrorDialog(message: string) {
        this.zone.run(() => {
            this.snackBar.open(message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
        });
    }
}
