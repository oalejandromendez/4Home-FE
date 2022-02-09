import {Injectable} from '@angular/core';
import {ReserveModel} from 'src/app/models/scheduling/reserve.mode';
import {environment} from 'src/environments/environment';
import {HeaderService} from '../../common/header/header.service';
import {ReserveService} from '@src/services/scheduling/reserve/reserve.service';
import {NoveltiesComponent} from '@src/pages/admin/novelties/novelties.component';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  url: string;
  SPORADIC_PERIODICITY = 1;
  MONTHLY_PERIODICITY = 2;
  DAYS: any[] = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  constructor(
    private reserveService: ReserveService,
    private noveltyService: NoveltyService,
    private headers: HeaderService,
    private datepipe: DatePipe
  ) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/schedule`);
  }

  post(reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${this.url}/api/schedule`, {...reserve});
  }

  reschedule(reserve: ReserveModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${this.url}/api/reschedule`, {...reserve});
  }


  checkAvailability(professionals, reservation, daysArray, initialServiceDateValue) {
    professionals.forEach((professional: any) => {
      const reserves = professional.reserve.filter(reserve => reserve.status !== 10);
      let professionalAvailable = true;

      professional.novelties.forEach((novelty: any) => {
        const initialNoveltyDateSplit = novelty.initial_date.split('-');
        const initialNoveltyDate = new Date(initialNoveltyDateSplit[0], initialNoveltyDateSplit[1] - 1, initialNoveltyDateSplit[2]);
        const finalNoveltyDateSplit = novelty.final_date.split('-');
        const finalNoveltyDate = new Date(finalNoveltyDateSplit[0], finalNoveltyDateSplit[1] - 1, finalNoveltyDateSplit[2]);

        if (reservation.type === this.SPORADIC_PERIODICITY) {
          const selectedDays = daysArray.value.filter((day: any) => day.type === this.SPORADIC_PERIODICITY);
          while (initialNoveltyDate <= finalNoveltyDate) {
            selectedDays.forEach((daySel: any) => {
              const splitReserveDate = daySel.date;
              const reserveDate = new Date(splitReserveDate.year, splitReserveDate.month - 1, splitReserveDate.day);

              if (reserveDate.getTime() === initialNoveltyDate.getTime()) {
                professionalAvailable = false;
                return;
              }
            });
            initialNoveltyDate.setDate(initialNoveltyDate.getDate() + 1);
          }
        } else if (reservation.type === this.MONTHLY_PERIODICITY) {
          const iDate = initialServiceDateValue;
          const selectedInitialServiceDate = new Date(iDate.year, iDate.month - 1, iDate.day);
          const selectedFinalServiceDate = new Date(selectedInitialServiceDate.getFullYear(),
            selectedInitialServiceDate.getMonth() + 1, selectedInitialServiceDate.getDate());

          const firstAndLastSelectedServiceDate = this.reserveService.getFirstAndLastServiceDate(selectedInitialServiceDate,
            selectedFinalServiceDate, reservation.reserve_day);
          const firstSelectedDay = firstAndLastSelectedServiceDate.firstAvailableDay;
          const lastSelectedDay = firstAndLastSelectedServiceDate.lastAvailableDay;

          while (firstSelectedDay <= lastSelectedDay) {
            if ((initialNoveltyDate >= firstSelectedDay && initialNoveltyDate <= lastSelectedDay) ||
              (finalNoveltyDate >= firstSelectedDay && finalNoveltyDate <= lastSelectedDay)) {
              professionalAvailable = false;
              break;
            }
            firstSelectedDay.setDate(firstSelectedDay.getDate() + 1);
          }
        }
      });
      reserves.forEach((reserve: any) => {
        const days = reserve.reserve_day;
        const initHourReserve = reserve.service.working_day.init_hour.split(':');
        const initHourNumberReserve = parseFloat(`${initHourReserve[0]}.${initHourReserve[1]}`);
        const endHourReserve = reserve.service.working_day.end_hour.split(':');
        const endHourNumberReserve = parseFloat(`${endHourReserve[0]}.${endHourReserve[1]}`);

        const initHourSelected = reservation.service.working_day.init_hour.split(':');
        const initHourNumberSelected = parseFloat(`${initHourSelected[0]}.${initHourSelected[1]}`);
        const endHourSelected = reservation.service.working_day.end_hour.split(':');
        const endHourNumberSelected = parseFloat(`${endHourSelected[0]}.${endHourSelected[1]}`);

        if (reserve.type === this.SPORADIC_PERIODICITY) {
          if (reservation.type === this.SPORADIC_PERIODICITY) {
            const selectedDays = daysArray.value.filter((day: any) => day.type === this.SPORADIC_PERIODICITY);
            selectedDays.forEach((daySel: any) => {
              days.forEach((day: any) => {
                const splitSelDate = daySel.date;
                const selectedDate = new Date(splitSelDate.year, splitSelDate.month - 1, splitSelDate.day);
                const splitReserveDate = day.date.split('-');
                const reserveDate = new Date(splitReserveDate[0], splitReserveDate[1] - 1, splitReserveDate[2]);
                if (selectedDate.getTime() === reserveDate.getTime()) {
                  if ((initHourNumberSelected >= initHourNumberReserve && initHourNumberSelected <= endHourNumberReserve) ||
                    (endHourNumberSelected >= initHourNumberReserve && endHourNumberSelected <= endHourNumberReserve)) {
                    professionalAvailable = false;
                    return;
                  }
                }
              });
            });
          } else if (reservation.type === this.MONTHLY_PERIODICITY) {
            const iDate = initialServiceDateValue;
            const selectedInitialServiceDate = new Date(iDate.year, iDate.month - 1, iDate.day);
            const selectedFinalServiceDate = new Date(selectedInitialServiceDate.getFullYear(),
              selectedInitialServiceDate.getMonth() + 1, selectedInitialServiceDate.getDate());

            const selectedDays = daysArray.value.filter((day: any) => day.type === this.MONTHLY_PERIODICITY
              && day.selected);

            const firstAndLastServiceDate = this.reserveService.getFirstAndLastServiceDate(selectedInitialServiceDate,
              selectedFinalServiceDate, selectedDays);
            const firstAvailableDay = firstAndLastServiceDate.firstAvailableDay;
            const lastAvailableDay = firstAndLastServiceDate.lastAvailableDay;

            days.forEach((day: any) => {

              const serviceDateSplit = day.date.split('-');
              const serviceDate = new Date(serviceDateSplit[0], serviceDateSplit[1] - 1,
                serviceDateSplit[2]);

              if ((serviceDate >= firstAvailableDay && serviceDate <= lastAvailableDay)) {
                if ((initHourNumberSelected >= initHourNumberReserve && initHourNumberSelected <= endHourNumberReserve) ||
                  (endHourNumberSelected >= initHourNumberReserve && endHourNumberSelected <= endHourNumberReserve)) {
                  professionalAvailable = false;
                  return;
                }
              }
            });
          }
        } else if (reserve.type === this.MONTHLY_PERIODICITY) {
          const initialServiceDateSplit = reserve.initial_service_date.split('-');
          const initialServiceDate = new Date(initialServiceDateSplit[0], initialServiceDateSplit[1] - 1, initialServiceDateSplit[2]);
          const limit = new Date(initialServiceDate.getFullYear(), initialServiceDate.getMonth() + 1, initialServiceDate.getDate());

          const firstAndLastServiceDate = this.reserveService.getFirstAndLastServiceDate(initialServiceDate, limit, days);
          const firstAvailableDay = firstAndLastServiceDate.firstAvailableDay;
          const firstAvailableDayString = this.datepipe.transform(firstAvailableDay, 'yyyy-MM-dd');
          const lastAvailableDay = firstAndLastServiceDate.lastAvailableDay;

          if (reservation.type === this.SPORADIC_PERIODICITY) {

            const selectedDays = daysArray.value.filter((day: any) => day.type === this.SPORADIC_PERIODICITY);
            selectedDays.forEach((daySel: any) => {
              const splitSelDate = daySel.date;
              const selectedDate = new Date(splitSelDate.year, splitSelDate.month - 1, splitSelDate.day);
              if ((selectedDate >= firstAvailableDay && selectedDate <= lastAvailableDay) &&
                this.reserveService.validateDateInRange(firstAvailableDayString, lastAvailableDay, days, selectedDate)) {
                if ((initHourNumberSelected >= initHourNumberReserve && initHourNumberSelected <= endHourNumberReserve) ||
                  (endHourNumberSelected >= initHourNumberReserve && endHourNumberSelected <= endHourNumberReserve)) {
                  professionalAvailable = false;
                  return;
                }
              }
            });
          } else if (reservation.type === this.MONTHLY_PERIODICITY) {

            const iDate = initialServiceDateValue;
            const selectedInitialServiceDate = new Date(iDate.year, iDate.month - 1, iDate.day);
            const selectedFinalServiceDate = new Date(iDate.year, iDate.month - 1, iDate.day);
            selectedFinalServiceDate.setMonth(selectedInitialServiceDate.getMonth() + 1);

            const selectedDays = daysArray.value.filter((day: any) => day.type === this.MONTHLY_PERIODICITY
              && day.selected);

            const firstAndLastSelectedServiceDate = this.reserveService.getFirstAndLastServiceDate(selectedInitialServiceDate,
              selectedFinalServiceDate, selectedDays);
            const firstSelectedDay = firstAndLastSelectedServiceDate.firstAvailableDay;
            const lastSelectedDay = firstAndLastSelectedServiceDate.lastAvailableDay;

            while (firstSelectedDay <= lastSelectedDay) {
              const dayS = firstSelectedDay.getDay();
              const existsS = selectedDays.find((d: any) => d.day === dayS || d.index === dayS);
              if (existsS && this.reserveService.validateDateInRange(firstAvailableDayString, lastAvailableDay, days, firstSelectedDay)) {
                if ((initHourNumberSelected >= initHourNumberReserve && initHourNumberSelected <= endHourNumberReserve) ||
                  (endHourNumberSelected >= initHourNumberReserve && endHourNumberSelected <= endHourNumberReserve)) {
                  professionalAvailable = false;
                  return;
                }
              }
              firstSelectedDay.setDate(firstSelectedDay.getDate() + 1);
            }
          }
        }

      }, professionalAvailable);
      if (professionalAvailable) {
        professional.available = 1;
      } else {
        professional.available = 2;
      }
    });
  }

  loadSchedule(professional, reservation, daysArray, initialServiceDateValue) {
    const schedule = [];
    if (professional) {
      if (professional.novelties) {
        professional.novelties.map((novelty: any) => {
          const initialNoveltyDateSplit = novelty.initial_date.split('-');
          const initialNoveltyDate = new Date(initialNoveltyDateSplit[0], initialNoveltyDateSplit[1] - 1, initialNoveltyDateSplit[2]);
          const finalNoveltyDateSplit = novelty.final_date.split('-');
          const finalNoveltyDate = new Date(finalNoveltyDateSplit[0], finalNoveltyDateSplit[1] - 1, finalNoveltyDateSplit[2]);

          while (initialNoveltyDate <= finalNoveltyDate) {
            const title = this.noveltyService.Type.filter(data => data.value === novelty.type);

            schedule.push({
              title: `${title[0].label}`,
              start: new Date(initialNoveltyDate),
              color: '#13f403',
              allDay: true
            });

            initialNoveltyDate.setDate(initialNoveltyDate.getDate() + 1);
          }
        });
      }
      if (professional.reserve) {
        const reservesDates = professional.reserve.filter((reserve: any) =>
          reserve.type === this.SPORADIC_PERIODICITY);

        if (reservesDates.length > 0) {
          reservesDates.map((reserve: any) => {
            reserve.reserve_day.map((day: any) => {
              schedule.push({
                title: `${reserve.service.working_day.name} (${reserve.service.working_day.init_hour} - ${reserve.service.working_day.end_hour})`,
                start: day.date,
                color: '#f44336',
                allDay: true
              });
            });
          });
        }

        const reservesDays = professional.reserve.filter((reserve: any) => reserve.type === this.MONTHLY_PERIODICITY);

        if (reservesDays.length > 0) {
          reservesDays.map((reserve: any) => {
            const days = reserve.reserve_day;
            if (days.length > 0) {
              const now = new Date(reserve.initial_service_date);
              now.setDate(now.getDate() + 1);
              const limit = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1);
              while (now <= limit) {
                const day = now.getDay();
                const exists = days.find((d: any) => d.day === day);
                if (exists) {
                  schedule.push({
                    title: `${reserve.service.working_day.name} (${reserve.service.working_day.init_hour} - ${reserve.service.working_day.end_hour})`,
                    start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    color: '#f44336',
                    allDay: true
                  });
                }
                now.setDate(now.getDate() + 1);
              }
            }
          });
        }
      }
    }

    const dates = daysArray.value.filter((day: any) => day.type === this.SPORADIC_PERIODICITY && !day.disabled);
    if (dates.length > 0) {
      dates.map((day: any) => {
        const date = day.date;
        schedule.push({
          title: `${reservation.service.working_day.name} (${reservation.service.working_day.init_hour} - ${reservation.service.working_day.end_hour})`,
          start: new Date(date.year + '-' + date.month + '-' + date.day),
          color: '#03a9f4',
          allDay: true
        });
      });
    }
    const days = daysArray.value.filter((day: any) => day.type === this.MONTHLY_PERIODICITY && day.selected);
    if (days.length > 0) {
      const initialServiceDate = initialServiceDateValue;
      const now = new Date(initialServiceDate.year, initialServiceDate.month - 1, initialServiceDate.day);
      const limit = new Date(initialServiceDate.year, initialServiceDate.month - 1, initialServiceDate.day);
      limit.setMonth(now.getMonth() + 1);
      while (now <= limit) {
        const day = now.getDay();
        const exists = days.find((d: any) => d.index === day);
        if (exists) {
          schedule.push({
            title: `${reservation.service.working_day.name} (${reservation.service.working_day.init_hour} - ${reservation.service.working_day.end_hour})`,
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            color: '#03a9f4',
            allDay: true
          });
        }
        now.setDate(now.getDate() + 1);
      }
    }
    return schedule;
  }
}
