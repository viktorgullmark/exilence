import { Injectable } from '@angular/core';

import { CharacterStore, LeagueStore } from '../interfaces/settings-store.interface';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings = null;
  isChangingStash = false;
  constructor(private electronService: ElectronService, private logService: LogService) {
  }

  set(key: string, object: any) {
    try {
      this.electronService.settings.set(key, object);
      this.electronService.lodash.set(this.settings, key, object);
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  get(key: string) {
    try {
      this.cacheSettings();
      return this.electronService.lodash.get(this.settings, key);
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  getAll() {
    try {
      this.cacheSettings();
      return this.settings;
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  deleteAll() {
    try {
      this.electronService.settings.deleteAll();
      this.settings = null;
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  deleteNetWorth() {
    const netWorthHistory = {
      lastSnapshot: 0,
      history: [{
        timestamp: 0,
        value: 0,
        items: []
      }]
    };
    try {
      const character = this.getCurrentCharacter();
      if (character !== undefined) {
        character.networth = netWorthHistory;
      }
      this.updateCharacter(character);
    } catch (e) {
      this.logService.log(e, null, true);
    }
    return netWorthHistory;
  }
  deleteAreas() {
    const areas = [];
    try {
      const character = this.getCurrentCharacter();
      if (character !== undefined) {
        character.areas = areas;
      }
      this.updateCharacter(character);
    } catch (e) {
      this.logService.log(e, null, true);
    }
    return areas;
  }
  private cacheSettings() {
    if (!this.settings) {
      this.settings = this.electronService.settings.getAll();
    }
  }
  getCurrentCharacter() {
    const characters: CharacterStore[] = this.get('characters');
    const profile = this.get('profile');
    if (characters !== undefined && profile !== undefined) {
      return characters.find(c => c.name === profile.characterName);
    } else { return undefined; }
  }

  getCurrentLeague() {
    const leagues: LeagueStore[] = this.get('leagues');
    const profile = this.get('profile');;
    if (leagues !== undefined && profile !== undefined) {
      return leagues.find(c => c.name === profile.leagueName);
    } else { return undefined; }
  }

  updateLeague(league: LeagueStore) {
    const leagues: LeagueStore[] = this.get('leagues');
    const match = leagues.find(l => l.name === league.name);
    if (match !== undefined) {
      const idx = leagues.indexOf(match);
      if (idx > -1) {
        leagues[idx] = league;
        this.set('leagues', leagues);
      }
    }
  }

  updateCharacter(char: CharacterStore) {
    const characters: CharacterStore[] = this.get('characters');
    const match = characters.find(l => l.name === char.name);
    if (match !== undefined) {
      const idx = characters.indexOf(match);
      if (idx > -1) {
        characters[idx] = char;
        this.set('characters', characters);
      }
    }
  }
}
