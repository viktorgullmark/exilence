import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { NetWorthSnapshot } from '../../../../shared/interfaces/income.interface';
import { Player } from '../../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../../shared/providers/analytics.service';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { SettingsService } from '../../../../shared/providers/settings.service';
import { NetworthTableComponent } from '../../networth-table/networth-table.component';
import { AccountService } from '../../../../shared/providers/account.service';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
  form: FormGroup;

  @Input() player: Player;
  @ViewChild('table') table: NetworthTableComponent;

  isGraphHidden = false;

  public graphDimensions = [640, 200];
  public gain = 0;
  public showReset = false;
  public previousSnapshot = false;
  public networthValue = 0;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private electronService: ElectronService,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private settingService: SettingsService,
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      if (res.account === this.partyService.currentPlayer.account) {
        this.showReset = true;
      } else {
        this.showReset = false;
      }
      this.player = res;
      this.networthValue = this.player.netWorthSnapshots[0].value;
      this.updateGain(res);
      this.previousSnapshot = false;
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/wealth');
  }

  goToSettings() {
    this.router.navigate(['/authorized/settings']);
  }

  toggleGraph(event: boolean) {
    this.isGraphHidden = true;
  }

  resetNetWorth() {
    if (this.player.account === this.partyService.currentPlayer.account) {
      const emptyHistory = this.settingService.deleteNetWorth();
      this.player.netWorthSnapshots = emptyHistory.history;
      this.partyService.updatePlayer(this.player);
    }
  }

  hideGraph() {
    this.isGraphHidden = true;
  }

  showGraph() {
    this.isGraphHidden = false;
  }

  loadPreviousSnapshot(event) {
    this.table.loadPreviousSnapshot(event);

    this.networthValue = event.value;

    const lastSnapshotTimestamp = this.player.netWorthSnapshots[0].timestamp;
    const loadedSnapshotTimestamp = event.name.getTime();

    this.previousSnapshot = loadedSnapshotTimestamp !== lastSnapshotTimestamp;
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

  updateGain(player: Player) {
    const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > oneHourAgo);

    if (pastHoursSnapshots.length > 1) {
      const lastSnapshot = pastHoursSnapshots[0];
      const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];

      const gainHour = ((1000 * 60 * 60)) / (lastSnapshot.timestamp - firstSnapshot.timestamp) * (lastSnapshot.value - firstSnapshot.value);

      this.gain = gainHour;

    } else {
      this.gain = 0;
    }
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
