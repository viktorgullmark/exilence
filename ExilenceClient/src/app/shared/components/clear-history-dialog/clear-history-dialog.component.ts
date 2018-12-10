import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '../../providers/settings.service';

export interface ClearHistoryDialogData {
  icon: string;
  title: string;
  content: string;
}

export interface HistoryData {
  areaHistory: Array<any>;
  networthHistory: any;
}

@Component({
  selector: 'app-clear-history-dialog',
  templateUrl: './clear-history-dialog.component.html',
  styleUrls: ['./clear-history-dialog.component.scss']
})
export class ClearHistoryDialogComponent implements OnInit {
  public historyObj = {} as HistoryData;
  constructor(
    public dialogRef: MatDialogRef<ClearHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClearHistoryDialogData, private settingsService: SettingsService) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  clearHistory() {
    this.historyObj.areaHistory = this.settingsService.deleteAreas();
    this.historyObj.networthHistory = this.settingsService.deleteNetWorth();
    this.dialogRef.close(this.historyObj);
  }
  ngOnInit() {
  }

}
