import { Component, Input, OnInit } from '@angular/core';

import { NetWorthSnapshot } from '../../../../shared/interfaces/income.interface';
import { Player } from '../../../../shared/interfaces/player.interface';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { PartyService } from '../../../../shared/providers/party.service';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
  @Input() player: Player;

  private oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
  public graphDimensions = [640, 300];
  public gain = 0;

  constructor(
    private electronService: ElectronService,
    private partyService: PartyService
  ) {
    this.partyService.selectedPlayer.subscribe(res => {
      this.updateGain(res);
    });
  }

  ngOnInit() {
  }

  updateGain(player: Player) {

    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > this.oneHourAgo);

    if (pastHoursSnapshots[0] !== undefined) {
      const lastValue = pastHoursSnapshots[0].value;
      const firstValue = pastHoursSnapshots[pastHoursSnapshots.length - 1].value;
      this.gain = lastValue - firstValue;
    }
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
