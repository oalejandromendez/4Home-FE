export class ReserveModel {
  user: string;
  customer_address: string;
  service: string;
  type: string;
  status: boolean;
  days: any;

  constructor() {
      this.status = true;
  }
}
