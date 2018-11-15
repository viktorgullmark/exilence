import { NgModule } from '@angular/core';
import { CharWealthComponent } from './char-wealth.component';
import { SharedModule } from '../../../../shared/shared.module';
import { IncomeModule } from '../../income/income.module';
import { NetworthTableModule } from '../../networth-table/networth-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatButtonModule, MatMenuModule, MatIconModule } from '@angular/material';
import { InfoDialogModule } from '../../info-dialog/info-dialog.module';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    IncomeModule,
    NetworthTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    InfoDialogModule
  ],
  declarations: [CharWealthComponent],
  exports: [CharWealthComponent],
  entryComponents: [InfoDialogComponent]
})
export class CharWealthModule { }
