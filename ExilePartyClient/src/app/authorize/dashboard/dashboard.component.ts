import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../shared/providers/electron.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    // give the profile time to render
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

}
