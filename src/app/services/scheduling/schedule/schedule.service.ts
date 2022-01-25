import {Injectable} from '@angular/core';
import {ReserveModel} from 'src/app/models/scheduling/reserve.mode';
import {environment} from 'src/environments/environment';
import {HeaderService} from '../../common/header/header.service';
import {ReserveService} from '@src/services/scheduling/reserve/reserve.service';

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
    private headers: HeaderService
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
          const lastAvailableDay = firstAndLastServiceDate.lastAvailableDay;

          if (reservation.type === this.SPORADIC_PERIODICITY) {

            const selectedDays = reservation.reserve_day;
            selectedDays.forEach((day: any) => {
              const splitDate = day.date.split('-');
              const selectedDate = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
              if ((selectedDate >= firstAvailableDay && selectedDate <= lastAvailableDay) &&
                this.reserveService.validateDateInRange(firstAvailableDay, lastAvailableDay, days, selectedDate)) {
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
              if (existsS && this.reserveService.validateDateInRange(firstAvailableDay, lastAvailableDay, days, firstSelectedDay)) {
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
}
