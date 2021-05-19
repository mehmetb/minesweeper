import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard/gameboard.component';
import { CellComponent } from './cell/cell.component';
import { LedDigitsComponent } from './led-digits/led-digits.component';

@NgModule({
  declarations: [
    AppComponent,
    GameboardComponent,
    CellComponent,
    LedDigitsComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
