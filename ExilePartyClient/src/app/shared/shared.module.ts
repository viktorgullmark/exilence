import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule
  ],
  exports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule
  ]
})

export class SharedModule { }
