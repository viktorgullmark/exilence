import { Injectable, OnDestroy } from '@angular/core';
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

  private currentPlayerGainSub: Subscription;
  private currentPlayerValueSub: Subscription;
  private playerGainSub: Subscription;
  private partyValueSub: Subscription;
  private partyGainSub: Subscription;

  constructor(
  ) {
    this.currentPlayerGainSub = this.currentPlayerGainSubject.subscribe(res => {
      this.currentPlayerGain = res;
    });

    this.currentPlayerValueSub = this.currentPlayerValueSubject.subscribe(res => {
      this.currentPlayerValue = res;
    });

    this.playerGainSub = this.playerGainSubject.subscribe(res => {
      this.playerGain = res;
    });

    this.partyValueSub = this.partyValueSubject.subscribe(res => {
      this.partyValue = res;
    });

    this.partyGainSub = this.partyGainSubject.subscribe(res => {
      this.partyGain = res;
    });
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
