import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { IncomeComponent } from './income.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    SharedModule,
    BrowserModule,
    NgxChartsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [
    IncomeComponent
  ],
  exports: [
    IncomeComponent
  ]
})
export class IncomeModule { }
