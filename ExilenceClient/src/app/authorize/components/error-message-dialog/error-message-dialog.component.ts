import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface ErrorMessageDialogData {
  icon: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-error-message-dialog',
  templateUrl: './error-message-dialog.component.html',
  styleUrls: ['./error-message-dialog.component.scss']
})
export class ErrorMessageDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ErrorMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorMessageDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  disableTooltips() {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
