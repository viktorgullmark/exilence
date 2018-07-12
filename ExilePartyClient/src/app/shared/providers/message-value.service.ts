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
    this.playerNetworthMsg = `%Personal net worth is ${this.playerValue.toFixed(1)} chaos and gain is ${this.playerGain} chaos over the last hour.`;
    // tslint:disable-next-line:max-line-length
    this.partyNetworthMsg = `%Party net worth is ${this.partyValue.toFixed(1)} chaos and gain is ${this.partyGain} chaos over the last hour.`;
  }

  initKeybinds() {
    this.keybindService.registerKeybind(Keys.Ctrl, Keys.B, 'party-personal-networth', 'Report personal net worth to party');
    this.keybindService.registerKeybind(Keys.Ctrl, Keys.G, 'party-summary-networth', 'Report summarized net worth to party');
  }
}
