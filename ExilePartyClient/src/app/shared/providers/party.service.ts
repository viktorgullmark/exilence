import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { AppConfig } from './../../app.config';
import { Player } from '../interfaces/player.interface';
import { Router } from '@angular/router';

@Injectable()
export class PartyService {
  private _hubConnection: HubConnection | undefined;
  public async: any;
  public code = '';
  public players: Player[] = [];

  constructor(private router: Router) {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.url + 'hubs/party')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this._hubConnection.start().catch(err => console.error(err.toString()));

    this._hubConnection.on('PlayerJoined', (player: Player) => {
      this.players.push(player);
      console.log('player joined:', player);
    });

    this._hubConnection.on('PlayerLeft', (player: Player) => {
      this.players = this.players.filter(x => x !== player);
      console.log('player left:', player);
    });
  }

  public joinParty(partyName: string, player: Player) {
      if (this._hubConnection) {
          this._hubConnection.invoke('JoinParty', partyName, player);
          this.router.navigate(['/authorized/party']);
      }
  }
}
