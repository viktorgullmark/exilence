import { NgModule } from '@angular/core';
import { CharWealthComponent } from './char-wealth.component';
import { SharedModule } from '../../../../shared/shared.module';
import { IncomeModule } from '../../income/income.module';
import { NetworthTableModule } from '../../networth-table/networth-table.module';

@NgModule({
  imports: [
    SharedModule,
    IncomeModule,
    NetworthTableModule
  ],
  declarations: [CharWealthComponent],
  exports: [CharWealthComponent]
})
export class CharWealthModule { }
