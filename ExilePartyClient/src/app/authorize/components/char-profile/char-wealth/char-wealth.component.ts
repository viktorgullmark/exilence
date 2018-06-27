import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../../../shared/interfaces/player.interface';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
  @Input() player: Player;
  graphDimensions = [640, 300];
  constructor() {
  }

  ngOnInit() {
  }

}
