import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private load = new BehaviorSubject<boolean>(true);
  load$ = this.load.asObservable();

  /*Mensaje de token*/
  private tokenvValid = new BehaviorSubject<boolean>(false);
  tokenvValid$ = this.tokenvValid.asObservable();

  constructor() { }

  loading(data: boolean) {
    this.load.next(data);
  }

  checkToken(data: boolean) {
    this.tokenvValid.next(data);
  }
}
