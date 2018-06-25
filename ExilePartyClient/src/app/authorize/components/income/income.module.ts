import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { IncomeComponent } from './income.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule
  ],
  declarations: [
    IncomeComponent
  ],
  exports: [
    IncomeComponent
  ]
})
export class IncomeModule { }
