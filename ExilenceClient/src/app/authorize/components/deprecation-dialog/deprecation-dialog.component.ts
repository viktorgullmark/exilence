import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ElectronService } from '../../../shared/providers/electron.service';

export interface DeprecationDialogData {
  icon: string;
  title: string;
}

@Component({
  selector: "app-deprecation-dialog",
  templateUrl: "./deprecation-dialog.component.html",
  styleUrls: ["./deprecation-dialog.component.scss"]
})
export class DeprecationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeprecationDialogComponent>,
    private electronService: ElectronService,
    @Inject(MAT_DIALOG_DATA) public data: DeprecationDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {}
  
  openLink(link: string) {
    if (this.electronService.isElectron()) {
      this.electronService.shell.openExternal(link);
    } else {
      window.open(link, '_blank');
    }
  }
}
