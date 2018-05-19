import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { AppConfig } from './../../app.config';

@Injectable()
export class PartyService {
  private _hubConnection: HubConnection | undefined;
  public async: any;
  public code = '';
  message = '';
  messages: any[] = [];

  constructor() {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.apiUrl + 'hubs/party')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this._hubConnection.start().catch(err => console.error(err.toString()));

    this._hubConnection.on('BroadcastMessage', (type: string, payload: string) => {
      this.messages.push({ severity: type, summary: payload });
    });
  }
}
