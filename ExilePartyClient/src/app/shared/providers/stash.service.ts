import { Injectable } from '@angular/core';
import { ExternalService } from './external.service';
import { SettingsService } from './settings.service';
import { PartyService } from './party.service';
import { Stash } from '../interfaces/stash.interface';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class StashService {
  public stash: BehaviorSubject<Stash> = new BehaviorSubject<Stash>(undefined);
  constructor(private externalService: ExternalService, private settingsService: SettingsService, private partyService: PartyService) {
  }

  getStashTabList() {
    const sessionId = this.settingsService.get('account.sessionId');
    const accountName = this.settingsService.get('account.accountName');
    const league = this.partyService.currentPlayer.character.league;
    this.externalService.getStashTabs(sessionId, accountName, league)
      .subscribe((res: Stash) => {
        this.stash.next(res);
      });
  }
}
