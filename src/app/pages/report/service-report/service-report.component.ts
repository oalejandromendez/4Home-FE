import { Component, OnInit } from '@angular/core';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { ReserveService } from 'src/app/services/scheduling/reserve/reserve.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-report',
  templateUrl: './service-report.component.html',
  styleUrls: ['./service-report.component.scss']
})
export class ServiceReportComponent implements OnInit {

  reserve = null;
  reservation = null;
  days: Array<any> = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private reserveService: ReserveService,
    private toastyService: ToastyService
  ) { }

  ngOnInit(): void {
  }


  search() {

    if(this.reserve) {

      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text:  'Espere...'
      });

      Swal.showLoading();

      this.reserveService.getByReference(this.reserve).subscribe( resp => {

        Swal.close();

        if (resp) {
          this.reservation = resp;

          if(this.reservation.type === 1 ) {
            this.reservation.days = this.reservation.reserve_day;
          }
          if(this.reservation.type === 2 ) {
            this.reservation.days = this.reservation.reserve_day.map( (day: any) => this.days[day.day]);
          }

        } else {
          const toastOptions: ToastOptions = {
            title: 'No existen datos',
            msg: 'No existen un servicio relacionado al número de la referencia',
            showClose: false,
            timeout: 2000,
            theme: 'bootstrap',
          };
          this.toastyService.warning(toastOptions);
        }
      });
    }
  }

}
