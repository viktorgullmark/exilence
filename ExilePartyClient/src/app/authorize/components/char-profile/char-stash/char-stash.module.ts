import { NgModule } from '@angular/core';
import { CharStashComponent } from './char-stash.component';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatSelectModule } from '../../../../../../node_modules/@angular/material';
import { CharInventoryModule } from '../char-inventory/char-inventory.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CharInventoryModule
  ],
  declarations: [CharStashComponent],
  exports: [CharStashComponent]
})
export class CharStashModule { }
