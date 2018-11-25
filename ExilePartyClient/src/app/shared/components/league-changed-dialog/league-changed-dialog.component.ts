import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '../../providers/settings.service';

export interface LeagueChangedDialogData {
  icon: string;
  title: string;
  content: string;
}

export interface HistoryData {
  areaHistory: Array<any>;
  networthHistory: any;
}

@Component({
  selector: 'app-league-changed-dialog',
  templateUrl: './league-changed-dialog.component.html',
  styleUrls: ['./league-changed-dialog.component.scss']
})
export class LeagueChangedDialogComponent implements OnInit {
  public historyObj = {} as HistoryData;
  constructor(
    public dialogRef: MatDialogRef<LeagueChangedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LeagueChangedDialogData, private settingsService: SettingsService) {}

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
