export class ServiceModel {
  name: string;
  price: string;
  working_day: string;
  description: string;
  type: number;
  quantity: number;
  status: boolean;

  constructor() {
      this.status = true;
      this.description = '';
  }
}
