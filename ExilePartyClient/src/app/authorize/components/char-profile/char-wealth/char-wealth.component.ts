import { Component, Input, OnInit } from '@angular/core';

import { Player } from '../../../../shared/interfaces/player.interface';
import { ElectronService } from '../../../../shared/providers/electron.service';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
  @Input() player: Player;
  graphDimensions = [640, 300];
  constructor(
    private electronService: ElectronService
  ) {
  }

  ngOnInit() {
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

}
