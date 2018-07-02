import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { IncomeComponent } from './income.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    BrowserModule,
    NgxChartsModule,
    MatButtonModule
  ],
  declarations: [
    IncomeComponent
  ],
  exports: [
    IncomeComponent
  ]
})
export class IncomeModule { }
