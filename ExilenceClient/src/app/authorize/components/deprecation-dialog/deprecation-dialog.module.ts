import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeprecationDialogComponent } from './deprecation-dialog.component';
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
  declarations: [DeprecationDialogComponent]
})
export class DeprecationDialogModule { }
