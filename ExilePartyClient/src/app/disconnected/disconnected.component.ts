import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../shared/providers/electron.service';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit {

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
