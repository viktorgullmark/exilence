import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ElectronService } from '../shared/providers/electron.service';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit {
  private sub: any;
  public external: boolean;
  constructor(
    public electronService: ElectronService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      this.external = JSON.parse(params['external']);
    });

    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.send('disconnect');
    }

  }

  openLink(link: string) {
    if (this.electronService.isElectron()) {
      this.electronService.shell.openExternal(link);
    } else {
      window.open(link, '_blank');
    }
  }

  relaunch() {
    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.send('relaunch');
    }
  }
}
