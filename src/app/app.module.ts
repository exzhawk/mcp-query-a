import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent, TypeTransPipe} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {VirtualScrollModule} from 'angular2-virtual-scroll';
import {ClipboardModule} from 'ngx-clipboard';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    TypeTransPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatMenuModule,
    FlexLayoutModule,
    VirtualScrollModule,
    ClipboardModule,
  ],
  providers: [
    HttpClientModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
