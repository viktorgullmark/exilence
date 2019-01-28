import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '../../../shared/providers/settings.service';

export interface ServerMessageDialogData {
  icon: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-server-message-dialog',
  templateUrl: './server-message-dialog.component.html',
  styleUrls: ['./server-message-dialog.component.scss']
})
export class ServerMessageDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ServerMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServerMessageDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  close() {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
