import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  constructor() { }

  ngOnInit() {
    // give the profile time to render
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

}
