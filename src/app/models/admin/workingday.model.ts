export class WorkingDayModel {
  name: string;
  init_hour: string;
  end_hour: string;
  status: boolean;

  constructor() {
      this.status = true;
  }
}
