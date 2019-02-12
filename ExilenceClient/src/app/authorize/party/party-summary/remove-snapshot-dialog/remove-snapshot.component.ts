import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-remove-snapshot',
  templateUrl: './remove-snapshot.component.html',
  styleUrls: ['./remove-snapshot.component.scss']
})
export class RemoveSnapshotDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RemoveSnapshotDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
