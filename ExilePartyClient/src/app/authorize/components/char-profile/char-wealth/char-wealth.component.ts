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

  public graphDimensions = [640, 300];
  public gain = 0;

  constructor(
    private electronService: ElectronService
  ) {



  }

  ngOnInit() {
    const lastValue = this.player.netWorthSnapshots[0].value;
    const firstValue = this.player.netWorthSnapshots[this.player.netWorthSnapshots.length - 1].value;
    this.gain = lastValue - firstValue;
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

}
