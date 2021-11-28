import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {FormGroup, ValidatorFn} from '@angular/forms';

const I18N_VALUES = {
  us: {
    weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  es: {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18n {
  language =  sessionStorage.getItem('lang') ? sessionStorage.getItem('lang') : 'es';
}

@Injectable({
  providedIn: 'root'
})
export class CustomDatepickerI18n extends NgbDatepickerI18n {

  constructor(private _i18n: I18n) {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }

  ValidateDates: ValidatorFn = (formG: FormGroup) => {
    let startDate = formG.get('init').value;
    let endDate = formG.get('end').value;
    const now = new Date();
    let dateLimit: string;
    if (startDate && endDate) {
      startDate = startDate.year + '-' + (startDate.month < 10 ? '0' + startDate.month : startDate.month) + '-' +
        (startDate.day < 10 ? '0' + startDate.day : startDate.day);
      endDate = endDate.year + '-' + (endDate.month < 10 ? '0' + endDate.month : endDate.month) + '-' +
        (endDate.day < 10 ? '0' + endDate.day : endDate.day);
      dateLimit = now.getFullYear() + '-' + ((now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' +
        (now.getDate() < 10 ? '0' + now.getDate() : now.getDate());
    }
    return startDate !== null && endDate !== null && startDate <= endDate ?
      startDate < dateLimit ? {errorStartDate: true} : endDate < dateLimit ? {errorEndDate: true} : null : {dates: true};
  }

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }
}
