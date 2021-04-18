export class ServiceModel {
  name: string;
  price: string;
  working_day: string;
  description: string;
  status: boolean;

  constructor() {
      this.status = true;
      this.description = '';
  }
}
