export class UserModel {
  type_document: string;
  identification: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  age: string;
  address: string;
  phone: string;
  roles: any;
  mobile: string;
  status: boolean;
  contact_name: string;
  billing_address: string;
  customer_type: string;
  addresses: any;

  constructor() {
      this.type_document = '';
      this.identification = '';
      this.status = true;
      this.age = '';
      this.phone = '';
      this.address = '';
      this.mobile = '';
      this.contact_name = '';
      this.billing_address = '';
      this.customer_type = '';
      this.addresses = '';
  }
}
