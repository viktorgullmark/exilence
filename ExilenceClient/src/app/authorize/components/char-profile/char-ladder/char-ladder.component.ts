import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Player } from '../../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../../shared/providers/analytics.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { LadderTableComponent } from '../../ladder-table/ladder-table.component';
import { LadderService } from '../../../../shared/providers/ladder.service';
import { ElectronService } from '../../../../shared/providers/electron.service';

@Component({
  selector: 'app-char-ladder',
  templateUrl: './char-ladder.component.html',
  styleUrls: ['./char-ladder.component.scss']
})
export class CharLadderComponent implements OnInit {
  form: FormGroup;
  @Input() player: Player;

  averageTimeSpent = '';
  filteredArr = [];

  private oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));

  @ViewChild('table') table: LadderTableComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private ladderService: LadderService,
    private electronService: ElectronService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
    });
    this.ladderService.startPollingLadder();
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/ladder');
  }
  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
