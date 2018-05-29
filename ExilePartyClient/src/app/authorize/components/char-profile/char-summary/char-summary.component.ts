import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';
import { Player } from '../../../../shared/interfaces/player.interface';

@Component({
  selector: 'app-char-summary',
  templateUrl: './char-summary.component.html',
  styleUrls: ['./char-summary.component.scss']
})
export class CharSummaryComponent implements OnChanges {

  objectKeys = Object.keys;
  @Input() items: Item[];
  resistances = [];

  twoStoneRegex = '\\+(.*)\\%\\sto (Fire|Cold|Lightning) and (Fire|Cold|Lightning) Resistance';
  singleRegex = '\\+(.*)\\%\\sto ((?:Fire|Cold|Lightning|Chaos) Resistance)';

  constructor() {
    this.resistances['Fire Resistance'] = 0;
    this.resistances['Cold Resistance'] = 0;
    this.resistances['Lightning Resistance'] = 0;
    this.resistances['Chaos Resistance'] = 0;
  }

  ngOnChanges(changes) {
    this.resistances = [];
    this.calculateResistances();
  }

  calculateResistances() {

    this.items.forEach(item => {

      let mods = [];
      if (item.craftedMods) {
        mods = mods.concat(item.craftedMods);
      }
      if (item.explicitMods) {
        mods = mods.concat(item.explicitMods);
      }
      if (item.implicitMods) {
        mods = mods.concat(item.implicitMods);
      }
      if (item.enchantMods) {
        mods = mods.concat(item.enchantMods);
      }

      mods.forEach((mod: string) => {

        const singleMatch = mod.match(new RegExp(this.singleRegex));
        if (singleMatch) {
          this.modifyValues(singleMatch[1], singleMatch[2]);
        }

        const twoStoneMatch = mod.match(new RegExp(this.twoStoneRegex));
        if (twoStoneMatch) {
          this.modifyValues(twoStoneMatch[1], twoStoneMatch[2] + ' Resistance');
          this.modifyValues(twoStoneMatch[1], twoStoneMatch[3] + ' Resistance');
        }
      });
    });
  }

  modifyValues(value, res) {
    if (this.resistances[res]) {
      this.resistances[res] += parseInt(value, 10);
    } else {
      this.resistances[res] = parseInt(value, 10);
    }
  }

  toClass(aaaa: String) {
    const toLower = aaaa.toLowerCase();
    const noSpace = toLower.replace(' ', '-');
    return noSpace;
  }

}
