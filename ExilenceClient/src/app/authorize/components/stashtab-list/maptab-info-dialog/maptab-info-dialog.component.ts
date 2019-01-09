import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '../../../../shared/providers/settings.service';

@Component({
  selector: 'app-maptab-info-dialog',
  templateUrl: './maptab-info-dialog.component.html',
  styleUrls: ['./maptab-info-dialog.component.scss']
})
export class MaptabInfoDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MaptabInfoDialogComponent>, private settingsService: SettingsService) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
