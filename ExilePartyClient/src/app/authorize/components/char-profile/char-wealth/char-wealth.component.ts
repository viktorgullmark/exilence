import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {

  graphDimensions = [640, 300];
  constructor() { }

  ngOnInit() {
  }

}
