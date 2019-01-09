import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaptabInfoDialogComponent } from './maptab-info-dialog.component';
import { MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [MaptabInfoDialogComponent]
})
export class MaptabInfoDialogModule { }
