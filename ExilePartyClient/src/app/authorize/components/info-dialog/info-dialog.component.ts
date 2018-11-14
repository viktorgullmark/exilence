import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '../../../shared/providers/settings.service';

export interface InfoDialogData {
  icon: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData, private settingsService: SettingsService) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  disableTooltips() {
    this.settingsService.set('diaShown_wealth', true);
    this.settingsService.set('diaShown_equipment', true);
    this.settingsService.set('diaShown_maps', true);
    this.settingsService.set('diaShown_partySummary', true);
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
