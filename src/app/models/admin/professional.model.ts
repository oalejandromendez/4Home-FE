export class ProfessionalModel {
  type_document: string;
  identification: string;
  name: string;
  lastname: string;
  email: string;
  age: string;
  address: string;
  phone: string;
  phone_contact: string;
  salary: string;
  photo: string;
  photo_name: string;
  admission_date: string;
  retirement_date: string;
  status: boolean;

  constructor() {
      this.status = true;
      this.age = '';
      this.address = '';
  }
}
