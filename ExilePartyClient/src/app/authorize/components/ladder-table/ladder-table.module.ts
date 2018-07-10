import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LadderTableComponent } from './ladder-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule, MatSortModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [LadderTableComponent],
  exports: [LadderTableComponent],
  providers: [DatePipe]
})
export class LadderTableModule { }
