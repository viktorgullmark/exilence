import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';
import { Tab } from '../../../../shared/interfaces/stash.interface';
import { SessionService } from '../../../../shared/providers/session.service';
import { PartyService } from '../../../../shared/providers/party.service';

@Component({
  selector: 'app-char-inventory',
  templateUrl: './char-inventory.component.html',
  styleUrls: ['./char-inventory.component.scss']
})
export class CharInventoryComponent implements OnInit {
  @Input() items: Item[];
  // default to main-inventory
  @Input() inventoryId = 'MainInventory';
  @Input() inventoryWidth: string;
  @Input() inventoryHeight: string;
  @Input() topMargin = 0;
  private width: number;
  private height: number;
  grid = [];
  sessionIdProvided: boolean;
  constructor(private partyService: PartyService) {
    this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.sessionIdProvided = res.sessionIdProvided;
      }
    });
  }

  ngOnInit() {
    this.height = Number(this.inventoryHeight);
    this.width = Number(this.inventoryWidth);
    this.grid = Array(this.height * this.width).fill(0);
  }
}
