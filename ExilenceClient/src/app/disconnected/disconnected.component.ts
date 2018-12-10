import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../shared/providers/electron.service';
import { LadderService } from '../shared/providers/ladder.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit {
  private sub: any;
  private external: boolean;
  constructor(
    private electronService: ElectronService,
    private ladderService: LadderService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.ladderService.stopPollingLadder();

    this.sub = this.route.params.subscribe(params => {
      this.external = JSON.parse(params['external']);
    });

    this.electronService.ipcRenderer.send('disconnect');
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  relaunch() {
    this.electronService.ipcRenderer.send('relaunch');
  }
}
