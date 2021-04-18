import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/common/loader/loader.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private loaderService: LoaderService
    ) { }

  ngOnInit(): void {
    this.loaderService.loading(false);
  }

}
