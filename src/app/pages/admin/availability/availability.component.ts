import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import { ProfessionalService } from 'src/app/services/admin/professional/professional.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  search =  '';
  professionals: Array<any> = [];
  schedules: Array<any> = [];
  professional = null;

  schedule = false;

  calendarOptions: CalendarOptions = {};

  constructor(
    private professionalService: ProfessionalService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.getProfessionals();
  }

  loadSchedule() {
    this.schedules = new Array();
    if(this.professional) {
      if(this.professional.reserve) {
        const reservesDates = this.professional.reserve.filter( (reserve: any) => reserve.type === 1);
        if(reservesDates.length > 0) {
          reservesDates.map( (reserve: any) => {
            reserve.reserve_day.map( (day: any) => {
              this.schedules.push({
                title: reserve.service.working_day.name,
                start: day.date,
                color: '#f44336',
                allDay: true
              });
            });
          });
        }
        const reservesDays = this.professional.reserve.filter( (reserve: any) => reserve.type === 2);
        if(reservesDays.length > 0) {
          reservesDays.map((reserve: any) => {
            const days =  reserve.reserve_day;
            if(days.length > 0) {
              const now = new Date(reserve.created_at);
              var limit = new Date();
              limit.setMonth(now.getMonth()+1);
              while( now <= limit) {
                var day = now.getDay();
                if(day === 0) {
                  day = 6;
                } else {
                  day--;
                }
                const exists = days.find( (d: any) => d.day === day);
                if(exists) {
                  this.schedules.push({
                    title: reserve.service.working_day.name,
                    start: new Date(now),
                    color: '#f44336',
                    allDay: true
                  });
                }
                now.setDate(now.getDate() + 1);
              }
            }
          })
        }
      }
    }

    setTimeout(()=> {
      this.calendarOptions = {
        plugins: [ listPlugin, timeGridPlugin, dayGridPlugin ],
        locale: esLocale,
        height: 520,
        initialView: 'dayGridMonth',
        timeZone: 'America/Bogota',
        events: this.schedules,
        eventColor: '#378006',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },
        slotEventOverlap: false,
        slotLabelFormat: [
          {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false
          }
        ],
        expandRows: true,
        nowIndicator: true,
        dayHeaders: true
        }
    }, 100);

  }

  getProfessionals() {
    this.loaderService.loading(true);
    this.professionalService.get().subscribe( resp => {
      this.professionals = resp.data;
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

  selectProfessionals(professional: any) {
    this.schedule = false;
    if(professional) {
      this.loaderService.loading(true);
      this.professionalService.getId(professional.id).subscribe( resp => {
        this.professional = professional;
        this.loadSchedule();
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
  }

}
