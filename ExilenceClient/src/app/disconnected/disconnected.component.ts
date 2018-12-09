import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../shared/providers/electron.service';
import { LadderService } from '../shared/providers/ladder.service';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private ladderService: LadderService
  ) { }

  ngOnInit() {
    this.ladderService.stopPollingLadder();
    this.electronService.ipcRenderer.send('disconnect');
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  relaunch() {
    this.electronService.ipcRenderer.send('relaunch');
  }
}
