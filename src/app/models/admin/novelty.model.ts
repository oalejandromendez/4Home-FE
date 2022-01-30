import {ReserveModel} from '@src/models/scheduling/reserve.mode';

export class NoveltyModel {
  id?: number;
  professional: any;
  type: number;
  status: number;
  initial_date?: string;
  final_date?: string;
  ids_reserves?: string;
  constructor() {
    this.id = 0;
    this.professional = 0;
    this.type = 0;
    this.status = 0;
    this.initial_date = '';
    this.final_date = '';
    this.ids_reserves = '';
  }
}

export class ReserveAffected {
  daysReschedule: any = [];
  reserve: ReserveModel;
  status: number;
  index: number;
  scheduled: boolean;
}
