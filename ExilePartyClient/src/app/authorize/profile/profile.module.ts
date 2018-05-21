import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { CharInventoryModule } from '../components/char-inventory/char-inventory.module';

@NgModule({
  imports: [
    SharedModule,
    CharInventoryModule
  ],
  declarations: [ProfileComponent]
})
export class ProfileModule { }
