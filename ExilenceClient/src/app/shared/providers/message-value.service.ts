import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ElectronService } from './electron.service';

@Injectable()
export class MessageValueService implements OnDestroy {
  public partyGainSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public partyValueSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  playerGain = 0;
  playerValue = 0;

  public currentPlayerGain = 0;
  public currentPlayerValue = 0;
  public partyGain = 0;
  public partyValue = 0;

  private partyValueSub: Subscription;
  private partyGainSub: Subscription;

  constructor(private electronService: ElectronService
  ) {
    this.partyValueSub = this.partyValueSubject.subscribe(res => {
      this.partyValue = res;
      if (this.electronService.isElectron()) {
        this.electronService.ipcRenderer.send('popout-window-update', {
          event: 'networth',
          data: {
            networth: this.partyValue,
            gain: this.partyGain
          }
        });
      }
    });

    this.partyGainSub = this.partyGainSubject.subscribe(res => {
      this.partyGain = res;
      if (this.electronService.isElectron()) {
        this.electronService.ipcRenderer.send('popout-window-update', {
          event: 'networth',
          data: {
            networth: this.partyValue,
            gain: this.partyGain
          }
        });
      }
    });
  }


  ngOnDestroy() {
    if (this.partyValueSub !== undefined) {
      this.partyValueSub.unsubscribe();
    }
    if (this.partyGainSub !== undefined) {
      this.partyGainSub.unsubscribe();
    }
  }
}
