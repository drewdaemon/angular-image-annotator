import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AiaLibModule } from 'aia-lib';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AiaLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
