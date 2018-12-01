import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatTabsModule,
} from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { StashtabListModule } from '../components/stashtab-list/stashtab-list.module';
import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    StashtabListModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule
  ],
  declarations: [SettingsComponent]
})
export class SettingsModule { }
