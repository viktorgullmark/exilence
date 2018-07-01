import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';

import { NetWorthSnapshot } from '../../../../shared/interfaces/income.interface';
import { Player } from '../../../../shared/interfaces/player.interface';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NetworthTableComponent } from '../../networth-table/networth-table.component';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
  form: FormGroup;

  @Input() player: Player;
  @ViewChild('table') table: NetworthTableComponent;

  private oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
  public graphDimensions = [640, 300];
  public gain = 0;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private electronService: ElectronService,
    private partyService: PartyService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
      this.updateGain(res);
    });
  }

  ngOnInit() {
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

  updateGain(player: Player) {

    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > this.oneHourAgo);

    if (pastHoursSnapshots[0] !== undefined) {
      const lastValue = pastHoursSnapshots[0].value;
      const firstValue = pastHoursSnapshots[pastHoursSnapshots.length - 1].value;
      this.gain = lastValue - firstValue;
    } else {
      this.gain = 0;
    }
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
