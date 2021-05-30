export class ReserveModel {
  id: string;
  user: string;
  customer_address: string;
  service: string;
  type: string;
  status: boolean;
  days: any;
  professional: string;
  supervisor: string;

  constructor() {
      this.id = '';
      this.status = true;
      this.professional = '';
      this.supervisor = ''
  }
}
