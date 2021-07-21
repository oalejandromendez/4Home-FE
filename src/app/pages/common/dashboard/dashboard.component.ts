import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/admin/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isCustomer = false;
  isAdmin = false;

  constructor(
    private loaderService: LoaderService,
    private authService: AuthService,
    private userService: UserService
    ) {
      this.initialValidation();
    }

  ngOnInit(): void {
    this.loaderService.loading(true);
  }

  initialValidation() {
    const auth = this.authService.authUser();
    if(auth) {
      this.userService.getById(auth.id).subscribe( resp => {
        this.loaderService.loading(false);
        const roles = resp.roles.filter( (rol: any) => rol.name === 'CLIENTE');
        if( roles.length > 0) {
          this.isCustomer = true;
        } else {
          this.isAdmin = true;
        }
      })
    }
  }

}
