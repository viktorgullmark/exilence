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
  constructor() { }

  ngOnInit() {
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

  isWeapon(itemProps: any[]) {
    const eleDmgProp = itemProps.find(x => x.name === 'Elemental Damage');
    const apsProp = itemProps.find(x => x.name === 'Attacks per Second');
    const physDmgProp = itemProps.find(x => x.name === 'Physical Damage');
    if ((physDmgProp !== undefined || eleDmgProp !== undefined) && apsProp !== undefined) {
      return true;
    }
    return false;
  }

  getTotalDps(itemProps: any[]) {
    return this.getEleDps(itemProps) + this.getPhysDps(itemProps);
  }

  getEleDps(itemProps: any[]) {
    const eleDmgProp = itemProps.find(x => x.name === 'Elemental Damage');
    const apsProp = itemProps.find(x => x.name === 'Attacks per Second');
    let eleMinMax;
    if (eleDmgProp !== undefined) {
      eleMinMax = eleDmgProp.values[0][0].split('-');
    }
    if (eleMinMax !== undefined) {
      return (+eleMinMax[0] + +eleMinMax[1]) / 2 * + apsProp.values[0][0];
    } return 0;
  }

  getPhysDps(itemProps: any[]) {
    const physDmgProp = itemProps.find(x => x.name === 'Physical Damage');
    const apsProp = itemProps.find(x => x.name === 'Attacks per Second');
    let physMinMax;
    if (physDmgProp !== undefined) {
      physMinMax = physDmgProp.values[0][0].split('-');
    }
    if (physMinMax !== undefined) {
      return (+physMinMax[0] + +physMinMax[1]) / 2 * + apsProp.values[0][0];
    } return 0;
  }
}
