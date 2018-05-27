import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
