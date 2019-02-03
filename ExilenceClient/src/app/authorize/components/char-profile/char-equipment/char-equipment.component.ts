import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

import { Item } from '../../../../shared/interfaces/item.interface';
import * as data from './equipment-slots';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { Player } from '../../../../shared/interfaces/player.interface';
import { PartyService } from '../../../../shared/providers/party.service';
import { MatDialog } from '@angular/material';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';
import { SettingsService } from '../../../../shared/providers/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-char-equipment',
  templateUrl: './char-equipment.component.html',
  styleUrls: ['./char-equipment.component.scss']
})
export class CharEquipmentComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() items: Item[];
  equipment = data.equipmentSlots;
  flasks = data.flaskSlots;
  selectedPlayer: Player;
  private selectedPlayerSub: Subscription;
  constructor(private electronService: ElectronService,
    private partyService: PartyService,
    private settingsService: SettingsService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
      this.selectedPlayer = res;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openEquipmentDialog();
    });
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
  }

  openEquipmentDialog(): void {
    if (!this.settingsService.get('diaShown_equipment') && !this.settingsService.get('hideTooltips') && this.electronService.isElectron()) {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '650px',
        data: {
          icon: 'accessibility',
          title: 'Equipment tab',
          content: 'Everything you see in the equipment tab will be updated every time a player enters a new area in-game.<br/><br/>' +
            'This includes both the equipment and inventory of the selected player.<br/><br/>' +
            'For the inventory to be shown a valid sessionId is required.'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.settingsService.set('diaShown_equipment', true);
      });
    }
  }

  getItemByType(type: string) {
    return this.items.find(x => x.inventoryId === type);
  }
  getFlaskByIndex(index: number) {
    return this.items.find(x => x.inventoryId === 'Flask' && x.x === index);
  }
}
