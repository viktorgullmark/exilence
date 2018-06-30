import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../shared/shared.module';
import { MatDividerModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule
  ],
  declarations: [SettingsComponent]
})
export class SettingsModule { }
