import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StashtabListComponent } from './stashtab-list.component';
import { MatTableModule, MatCheckboxModule, MatSortModule } from '@angular/material';
import { MaptabInfoDialogComponent } from './maptab-info-dialog/maptab-info-dialog.component';
import { MaptabInfoDialogModule } from './maptab-info-dialog/maptab-info-dialog.module';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MaptabInfoDialogModule
  ],
  declarations: [StashtabListComponent],
  exports: [StashtabListComponent],
  entryComponents: [MaptabInfoDialogComponent]
})
export class StashtabListModule { }
