export class ReserveModel {
  id: string;
  reference: string;
  user: string;
  customer_address: string;
  service: string;
  type: string;
  status: boolean;
  days: any;
  professional: string;
  supervisor: string;
  payment: any;
  initial_service_date: string;

  constructor() {
      this.id = '';
      this.status = true;
      this.professional = '';
      this.supervisor = '';
  }
}
