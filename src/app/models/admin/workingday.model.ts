export class WorkingDayModel {
  name: string;
  init_hour: string;
  end_hour: string;
  service_type: string;
  status: boolean;

  constructor() {
      this.status = true;
  }
}
