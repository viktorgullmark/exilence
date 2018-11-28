export interface LogMessage {
  chat: LogMessageChat;
  player: LogMessagePlayer;
  messsage: string;
}

export interface LogMessagePlayer {
  guild: string;
  name: string;
}

export enum LogMessageChat {
  GLOBAL_CHAT = 'global',
  TRADE_CHAT = 'trade',
  GUILD_CHAT = 'guild',
  PARTY_CHAT = 'party',
  LOCAL_CHAT = 'local'
}
