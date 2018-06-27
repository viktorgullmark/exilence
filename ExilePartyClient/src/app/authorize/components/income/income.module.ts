import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { IncomeComponent } from './income.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    NgxChartsModule
  ],
  declarations: [
    IncomeComponent
  ],
  exports: [
    IncomeComponent
  ]
})
export class IncomeModule { }
