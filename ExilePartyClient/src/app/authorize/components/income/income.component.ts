import { Component, OnInit } from '@angular/core';

import { IncomeService } from '../../../shared/providers/income.service';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent implements OnInit {



  constructor(
    private incomeService: IncomeService
  ) {
    // this.incomeService.SnapshotPlayerNetWorth()
    //   .subscribe(t => {
    //     console.log(t);
    //   });
  }

  ngOnInit() {
  }



}
