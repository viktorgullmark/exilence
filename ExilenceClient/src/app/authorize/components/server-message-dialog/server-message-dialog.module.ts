import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';

import { ServerMessageDialogComponent } from './server-message-dialog.component';

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
  declarations: [ServerMessageDialogComponent]
})
export class ServerMessageDialogModule { }
