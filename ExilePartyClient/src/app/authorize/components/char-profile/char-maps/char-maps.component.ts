import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapTableComponent } from '../../map-table/map-table.component';
import { Player } from '../../../../shared/interfaces/player.interface';

@Component({
  selector: 'app-char-maps',
  templateUrl: './char-maps.component.html',
  styleUrls: ['./char-maps.component.scss']
})
export class CharMapsComponent implements OnInit {
  form: FormGroup;
  @Input() player: Player;

  @ViewChild('table') table: MapTableComponent;

  constructor(@Inject(FormBuilder) fb: FormBuilder) {
    this.form = fb.group({
      searchText: ['']
    });
   }

  ngOnInit() {
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

}
