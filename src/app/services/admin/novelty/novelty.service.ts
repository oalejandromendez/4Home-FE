import {Injectable} from '@angular/core';
import {HeaderService} from '@src/services/common/header/header.service';
import {environment} from '@env/environment';
import {NoveltyModel} from '@src/models/admin/novelty.model';

@Injectable({
  providedIn: 'root'
})
export class NoveltyService {

  url: string;

  public Type: any = [{value: 1, label: 'Incapacidad médica'},
    {value: 2, label: 'Compensatorio'},
    {value: 3, label: 'Permiso'},
    {value: 4, label: 'Licencia no remunerada'},
  ];

  constructor(private headers: HeaderService) {
    this.url = environment.host;
  }

  get() {
    return this.headers.get(sessionStorage.getItem('token'), `${this.url}/api/novelty`);
  }

  post(novelty: NoveltyModel) {
    return this.headers.post(sessionStorage.getItem('token'), `${this.url}/api/novelty`, {...novelty});
  }

  put(novelty: NoveltyModel, id: string) {
    return this.headers.put(sessionStorage.getItem('token'), `${this.url}/api/novelty/${id}`, {...novelty});
  }

  delete(id: string) {
    return this.headers.delete(sessionStorage.getItem('token'), `${this.url}/api/novelty/${id}`);
  }

  schedule( filter: any) {
    return this.headers.post(sessionStorage.getItem('token'), `${ this.url}/api/novelty/schedule`, { ...filter });
  }
}
