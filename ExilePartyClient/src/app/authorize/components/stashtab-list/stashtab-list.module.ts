import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StashtabListComponent } from './stashtab-list.component';
import { MatTableModule, MatCheckboxModule, MatSortModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule
  ],
  declarations: [StashtabListComponent],
  exports: [StashtabListComponent]
})
export class StashtabListModule { }
