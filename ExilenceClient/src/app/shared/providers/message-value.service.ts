import { Injectable } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { KeybindService } from './keybind.service';
import { RobotService } from './robot.service';
import { AccountService } from './account.service';
import { Player } from '../interfaces/player.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MessageValueService {
  public partyGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public partyValueSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  playerGain = 0;
  playerValue = 0;

  public currentPlayerGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public currentPlayerValueSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public currentPlayerGain = 0;
  public currentPlayerValue = 0;
  public partyGain = 0;
  public partyValue = 0;

  private defaultMsg = '%No data registered';
  public playerNetworthMsg = this.defaultMsg;
  public partyNetworthMsg = this.defaultMsg;

  constructor(
    private keybindService: KeybindService,
    private robotService: RobotService
  ) {
    this.initKeybinds();
    this.keybindService.keybindEvent.subscribe(event => {
      this.updateCurrentPlayerMsg();
      this.updatePartyMsg();
      if (event === 'party-personal-networth') {
        this.robotService.sendTextToPathWindow(this.playerNetworthMsg, false);
      }
      if (event === 'party-summary-networth') {
        this.robotService.sendTextToPathWindow(this.partyNetworthMsg, false);
      }
    });

    this.currentPlayerGainSubject.subscribe(res => {
      this.currentPlayerGain = res;
      this.updateCurrentPlayerMsg();
    });

    this.currentPlayerValueSubject.subscribe(res => {
      this.currentPlayerValue = res;
      this.updateCurrentPlayerMsg();
    });

    this.partyValueSubject.subscribe(res => {
      this.partyValue = res;
      this.updatePartyMsg();
    });

    this.partyGainSubject.subscribe(res => {
      this.partyGain = res;
      this.updatePartyMsg();
    });
  }

  updateCurrentPlayerMsg() {
    // tslint:disable-next-line:max-line-length
    this.playerNetworthMsg = `@CojL [Exilence] My net worth: ${this.currentPlayerValue.toFixed(1)}c. Gain: ${this.currentPlayerGain.toFixed(1)}c / hour`;
  }

  updatePartyMsg() {
    // tslint:disable-next-line:max-line-length
    this.partyNetworthMsg = `@CojL [Exilence] Grp net worth: ${this.partyValue.toFixed(1)}c. Gain: ${this.partyGain.toFixed(1)}c / hour`;
  }

  initKeybinds() {
    this.keybindService.registerKeybind('Ctrl+Y', 'party-personal-networth', 'Report personal net worth to party');
    this.keybindService.registerKeybind('Ctrl+H', 'party-summary-networth', 'Report summarized net worth to party');
  }
}
