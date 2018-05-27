import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';
import { MatDividerModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
