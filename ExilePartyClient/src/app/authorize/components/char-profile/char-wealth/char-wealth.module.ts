import { NgModule } from '@angular/core';
import { CharWealthComponent } from './char-wealth.component';
import { SharedModule } from '../../../../shared/shared.module';
import { IncomeModule } from '../../income/income.module';
import { NetworthTableModule } from '../../networth-table/networth-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    IncomeModule,
    NetworthTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [CharWealthComponent],
  exports: [CharWealthComponent]
})
export class CharWealthModule { }
