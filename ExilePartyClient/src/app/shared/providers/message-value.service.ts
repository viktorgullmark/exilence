import { Injectable } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { KeybindService } from './keybind.service';
import { RobotService } from './robot.service';

@Injectable()
export class MessageValueService {
  public playerGain = 0;
  public partyGain = 0;
  public playerValue = 0;
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
      this.updateMessages();
      if (event === 'party-personal-networth') {
        this.robotService.sendTextToPathWindow(this.playerNetworthMsg);
      }
      if (event === 'party-summary-networth') {
        this.robotService.sendTextToPathWindow(this.partyNetworthMsg);
      }
    });

  }

  updateMessages() {
    // tslint:disable-next-line:max-line-length
    this.playerNetworthMsg = `Personal net worth: ${this.playerValue.toFixed(1)}c. Gain is ${this.playerGain.toFixed(1)}c / hour`;
    // tslint:disable-next-line:max-line-length
    this.partyNetworthMsg = `Group net worth: ${this.partyValue.toFixed(1)}c. Gain is ${this.partyGain.toFixed(1)}c / hour`;
  }

  initKeybinds() {
    this.keybindService.registerKeybind('Ctrl+C', 'party-personal-networth', 'Report personal net worth to party');
    this.keybindService.registerKeybind('Ctrl+D', 'party-summary-networth', 'Report summarized net worth to party');
  }
}
