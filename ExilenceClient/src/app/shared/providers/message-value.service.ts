import { Injectable, OnDestroy } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { KeybindService } from './keybind.service';
import { RobotService } from './robot.service';
import { AccountService } from './account.service';
import { Player } from '../interfaces/player.interface';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable()
export class MessageValueService implements OnDestroy {
  public partyGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public partyValueSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  playerGain = 0;
  playerValue = 0;

  public currentPlayerGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public currentPlayerValueSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public playerGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public currentPlayerGain = 0;
  public currentPlayerValue = 0;
  public partyGain = 0;
  public partyValue = 0;

  private defaultMsg = '%No data registered';
  public playerNetworthMsg = this.defaultMsg;
  public partyNetworthMsg = this.defaultMsg;

  private currentPlayerGainSub: Subscription;
  private currentPlayerValueSub: Subscription;
  private playerGainSub: Subscription;
  private partyValueSub: Subscription;
  private partyGainSub: Subscription;

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

    this.currentPlayerGainSub = this.currentPlayerGainSubject.subscribe(res => {
      this.currentPlayerGain = res;
      this.updateCurrentPlayerMsg();
    });

    this.currentPlayerValueSub = this.currentPlayerValueSubject.subscribe(res => {
      this.currentPlayerValue = res;
      this.updateCurrentPlayerMsg();
    });

    this.playerGainSub = this.playerGainSubject.subscribe(res => {
      this.playerGain = res;
      this.updateCurrentPlayerMsg();
    });

    this.partyValueSub = this.partyValueSubject.subscribe(res => {
      this.partyValue = res;
      this.updatePartyMsg();
    });

    this.partyGainSub = this.partyGainSubject.subscribe(res => {
      this.partyGain = res;
      this.updatePartyMsg();
    });
  }

  updateCurrentPlayerMsg() {
    // tslint:disable-next-line:max-line-length
    this.playerNetworthMsg = `[Exilence] My net worth: ${this.currentPlayerValue.toFixed(2)}c. Gain: ${this.currentPlayerGain.toFixed(2)}c / hour`;
  }

  updatePartyMsg() {
    // tslint:disable-next-line:max-line-length
    this.partyNetworthMsg = `[Exilence] Grp net worth: ${this.partyValue.toFixed(2)}c. Gain: ${this.partyGain.toFixed(2)}c / hour`;
  }

  initKeybinds() {
    this.keybindService.registerKeybind('Ctrl+Y', 'party-personal-networth', 'Report personal net worth to party');
    this.keybindService.registerKeybind('Ctrl+H', 'party-summary-networth', 'Report summarized net worth to party');
  }

  ngOnDestroy() {
    if (this.currentPlayerGainSub !== undefined) {
      this.currentPlayerGainSub.unsubscribe();
    }
    if (this.currentPlayerValueSub !== undefined) {
      this.currentPlayerValueSub.unsubscribe();
    }
    if (this.playerGainSub !== undefined) {
      this.playerGainSub.unsubscribe();
    }
    if (this.partyValueSub !== undefined) {
      this.partyValueSub.unsubscribe();
    }
    if (this.partyGainSub !== undefined) {
      this.partyGainSub.unsubscribe();
    }
  }
}
