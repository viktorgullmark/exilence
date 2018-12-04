import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Item } from '../../../../../../shared/interfaces/item.interface';
import { Property } from '../../../../../../shared/interfaces/property.interface';

@Component({
  selector: 'app-item-tooltip-content',
  templateUrl: './item-tooltip-content.component.html',
  styleUrls: ['./item-tooltip-content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemTooltipContentComponent implements OnInit {
  @Input() item: Item;
  physDmgProp: Property;
  eleDmgProp: Property;
  apsProp: Property;
  physMinMax: Array<string>;
  eleMinMax: Array<string>;
  constructor() { }

  ngOnInit() {
    // check if the item is a weapon by identifying properties
    if (this.item !== undefined && this.item.properties !== undefined && this.item.properties !== null) {
      this.physDmgProp = this.item.properties.find(x => x.name === 'Physical Damage');
      this.eleDmgProp = this.item.properties.find(x => x.name === 'Elemental Damage');
      this.apsProp = this.item.properties.find(x => x.name === 'Attacks per Second');
      if (this.physDmgProp !== undefined) {
        this.physMinMax = this.physDmgProp.values[0][0].split('-');
      }
      if (this.eleDmgProp !== undefined) {
        this.eleMinMax = this.eleDmgProp.values[0][0].split('-');
      }
    }
  }

  getExplicitModClass(explicit) {
    let modClass = '';
    if (explicit.indexOf('to maximum Life') >= 0) {
      modClass = 'life';
    }
    if (explicit.indexOf('to Cold Resistance') >= 0) {
      modClass = 'cold-res';
    }
    if (explicit.indexOf('to Fire Resistance') >= 0) {
      modClass = 'fire-res';
    }
    if (explicit.indexOf('to Lightning Resistance') >= 0) {
      modClass = 'lightning-res';
    }
    if (explicit.indexOf('to Chaos Resistance') >= 0) {
      modClass = 'chaos-res';
    }
    if (explicit.indexOf('to maximum Mana') >= 0) {
      modClass = 'mana';
    }

    // todo: append div card classes

    return modClass;
  }

  formatVeiledMod(veiled) {
      const mod = veiled.substring(0, 6);
      return 'Veiled ' + mod;
  }

  formatDivCard(text) {

    let localText = text;
    const matches = [];

    const regex = /<(.*?)>{(.*?)}/gim;
    let result = regex.exec(localText);

    while (result) {

      localText = localText.replace(result[0], '').trim();

      matches.push({
        class: result[1],
        text: result[2]
      });

      regex.lastIndex = 0;
      result = regex.exec(localText);

    }

    let html = '';
    matches.forEach((m) => {
      html += `<span class="${m.class}">${m.text}</span>`;
      html += m.text.endsWith(':') ? ` ` : `<br/>`;
    });

    return html;
  }

  formatFlaskProperties(prop, firstVal, secondVal) {
    const ex = /(%0)/g;
    let result = prop.replace(ex, firstVal);

    if (secondVal !== undefined && secondVal[0] !== undefined) {
      // use second value as well
      const ex2 = /(%1)/g;
      result = result.replace(ex2, secondVal[0]);
    }

    return result;
  }

  isWeapon() {
    if ((this.physDmgProp !== undefined || this.eleDmgProp !== undefined) && this.apsProp !== undefined) {
      return true;
    }
    return false;
  }

  getTotalDps() {
    return this.getEleDps() + this.getPhysDps();
  }

  getEleDps() {
    if (this.eleMinMax !== undefined) {
      return (+this.eleMinMax[0] + +this.eleMinMax[1]) / 2 * + this.apsProp.values[0][0];
    } return 0;
  }

  getPhysDps() {
    if (this.physMinMax !== undefined) {
      return (+this.physMinMax[0] + +this.physMinMax[1]) / 2 * + this.apsProp.values[0][0];
    } return 0;
  }
}
