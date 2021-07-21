import { Component, OnInit, ViewChild } from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/common';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-dashboard-customer',
  templateUrl: './dashboard-customer.component.html',
  styleUrls: ['./dashboard-customer.component.scss']
})
export class DashboardCustomerComponent implements OnInit {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  calendarOptions: CalendarOptions = {};

  schedule = [];
  widgets = null;
  name = '';
  id = null;

  constructor(
    private dashboardService: DashboardService,
    private toastyService: ToastyService,
    private router: Router,
    private authService: AuthService
  ) {
    const name = Calendar.name;
    const user = this.authService.authUser();
    this.name = user.name + " " + user.lastname;
    this.id = user.id;
  }

  ngOnInit(): void {
    this.getDashboard();
  }

  getDashboard() {
    if(this.id) {
      this.dashboardService.customer(this.id).subscribe(resp => {
        this.widgets = resp.widgets;
        this.preloadCalendar(resp.schedule);
      }, (err) => {
        if (err.error.errors) {
          let mensage = '';

          Object.keys(err.error.errors).forEach( (data, index) => {
            mensage += err.error.errors[data][0] + '<br>';
          });
          const toastOptions: ToastOptions = {
            title: 'Error',
            msg: mensage,
            showClose: false,
            timeout: 2000,
            theme: 'bootstrap',
          };
          this.toastyService.error(toastOptions);
        } else {
          if (err.status === 401) {
            this.router.navigateByUrl('/login');
          }
        }
      });
    }
  }

  preloadCalendar(reserves: any) {
    this.schedule = new Array();

    const reservesDates = reserves.filter( (reserve: any) => reserve.type === 1);

    if(reservesDates.length > 0) {
      reservesDates.map( (reserve: any) => {
        reserve.reserve_day.map( (day: any) => {
          this.schedule.push({
            title: '#' + reserve.reference + " Jornada: " + reserve.service.working_day.name,
            start: day.date,
            color: '#03a9f4',
            allDay: true
          });
        });
      });
    }

    const reservesDays = reserves.filter( (reserve: any) => reserve.type === 2);

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
              this.schedule.push({
                title: '#' + reserve.reference + " Jornada: " + reserve.service.working_day.name,
                start: new Date(now),
                color: '#03a9f4',
                allDay: true
              });
            }
            now.setDate(now.getDate() + 1);
          }
        }
      })
    }

    this.loadCalendar()

  }

  loadCalendar() {
    setTimeout(()=> {
      this.calendarOptions = {
        plugins: [ listPlugin, timeGridPlugin, dayGridPlugin ],
        locale: esLocale,
        height: 420,
        initialView: 'dayGridMonth',
        timeZone: 'America/Bogota',
        events: this.schedule,
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

}
