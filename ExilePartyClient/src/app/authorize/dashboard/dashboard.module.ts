import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { CharInventoryModule } from '../components/char-inventory/char-inventory.module';
import { CharEquipmentModule } from '../components/char-equipment/char-equipment.module';

@NgModule({
  imports: [
    SharedModule,
    CharInventoryModule,
    CharEquipmentModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
