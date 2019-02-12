import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoveSnapshotDialogComponent } from './remove-snapshot.component';
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
  declarations: [RemoveSnapshotDialogComponent]
})
export class RemoveSnapshotDialogModule { }
