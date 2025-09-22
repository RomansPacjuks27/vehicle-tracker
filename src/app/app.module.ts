import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkerPopupComponent } from './components/map/markerpopup.component';
import { AppErrorHandler } from './handlers/app-error-handler';
import { resilienceInterceptor } from './handlers/resilience-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    UserlistComponent,
    MarkerPopupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideHttpClient(
      withInterceptors([resilienceInterceptor])
    ),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }