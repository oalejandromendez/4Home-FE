import { Component, OnInit } from '@angular/core';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { UserService } from 'src/app/services/admin/user/user.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  reserveFilter = true;
  scheduleFilter = false;

  search = '';

  reserves: Array<any> = [];

  canSee = false;
  canEdit = false;

  constructor(
    private reserveService: ReserveService,
    private loaderService: LoaderService,
    private userService: UserService,
    private toastyService: ToastyService
  ) {
    this.getPermissions();
  }

  ngOnInit(): void {
  }

  changeReserve() {
    this.reserveFilter = true;
    this.scheduleFilter = false;
    this.search = '';
    this.reserves = new Array();
    this.getReserves();
  }

  changeSchedule() {
    this.reserveFilter = false;
    this.scheduleFilter = true;
  }

  getReserves() {
    this.loaderService.loading(true);
    this.reserveService.get().subscribe( resp => {
      this.reserves = resp;
      this.loaderService.loading(false);
    }, error => {
      this.loaderService.loading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  getPermissions() {
    const that = this;
    this.loaderService.loading(true);
    this.userService.permissions().subscribe( resp => {
      const see = resp.filter( (permission: any) => permission.name === 'VER_AGENDAMIENTOS');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_AGENDAMIENTOS');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      this.loaderService.loading(false);

      if(that.canSee) {
        this.getReserves();
      }

    }, error => {
      const toastOptions: ToastOptions = {
        title: 'Error',
        msg: 'El ususario no tiene roles',
        showClose: false,
        timeout: 2000,
        theme: 'bootstrap',
      };
      this.toastyService.error(toastOptions);
      this.loaderService.loading(false);
    });
  }
}
