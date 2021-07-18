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

  constructor() {
      this.id = '';
      this.status = true;
      this.professional = '';
      this.supervisor = ''
  }
}
