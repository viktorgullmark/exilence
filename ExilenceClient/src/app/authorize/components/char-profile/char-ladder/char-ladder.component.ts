import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { Player } from '../../../../shared/interfaces/player.interface';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { LadderTableComponent } from '../../ladder-table/ladder-table.component';

@Component({
  selector: 'app-char-ladder',
  templateUrl: './char-ladder.component.html',
  styleUrls: ['./char-ladder.component.scss']
})
export class CharLadderComponent implements OnInit, OnDestroy {
  form: FormGroup;
  @Input() player: Player;

  averageTimeSpent = '';
  filteredArr = [];
  private selectedPlayerSub: Subscription;
  @ViewChild('table') table: LadderTableComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private partyService: PartyService,
    private electronService: ElectronService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
    });
  }

  ngOnInit() {
  }
  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
  }
}
