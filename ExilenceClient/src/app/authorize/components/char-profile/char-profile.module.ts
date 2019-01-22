import { NgModule } from '@angular/core';
import { CharProfileComponent } from './char-profile.component';
import { CharInventoryModule } from './char-inventory/char-inventory.module';
import { CharEquipmentModule } from './char-equipment/char-equipment.module';
import { SharedModule } from '../../../shared/shared.module';
import { CharSummaryModule } from './char-summary/char-summary.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CharMapsModule } from './char-maps/char-maps.module';
import { CharLadderModule } from './char-ladder/char-ladder.module';

@NgModule({
  imports: [
    SharedModule,
    CharInventoryModule,
    CharEquipmentModule,
    CharSummaryModule,
    CharMapsModule,
    CharLadderModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [CharProfileComponent],
  exports: [CharProfileComponent]
})
export class CharProfileModule { }
