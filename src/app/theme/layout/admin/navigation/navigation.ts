import {Injectable} from '@angular/core';
import { UserService } from 'src/app/services/admin/user/user.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

const NavigationItems = [
  {
    id: 'navigation',
    title: 'Navegación',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'assets/img/menu/dashboard.png',
        classes: 'nav-item',
      },
      {
        id: 'reserve',
        title: 'Reservar',
        type: 'item',
        url: '/scheduling/reserve',
        icon: 'assets/img/menu/reserve.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'schedule',
        title: 'Agendar',
        type: 'item',
        url: '/scheduling/schedule',
        icon: 'assets/img/menu/schedule.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'availability',
        title: 'Disponibilidad',
        type: 'item',
        url: '/admin/availability',
        icon: 'assets/img/menu/availability.png',
        classes: 'nav-item',
        hidden: false
      },
      {
        id: 'customer',
        title: 'Clientes',
        type: 'item',
        url: '/scheduling/customer',
        icon: 'assets/img/menu/customer.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'service',
        title: 'Servicios',
        type: 'item',
        url: '/admin/service',
        icon: 'assets/img/menu/services.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'customertype',
        title: 'Tipo de Cliente',
        type: 'item',
        url: '/scheduling/customertype',
        icon: 'assets/img/menu/customer-type.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'workingday',
        title: 'Jornadas',
        type: 'item',
        url: '/admin/workingday',
        icon: 'assets/img/menu/working-day.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'scheduling',
        title: 'Agendamiento',
        type: 'item',
        url: '/scheduling',
        icon: 'assets/img/menu/scheduling.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'servicetype',
        title: 'Tipo de Servicio',
        type: 'item',
        url: '/admin/servicetype',
        icon: 'assets/img/menu/service-type.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'professional',
        title: 'Profesionales',
        type: 'item',
        url: '/admin/professional',
        icon: 'assets/img/menu/professionals.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'position',
        title: 'Cargos',
        type: 'item',
        url: '/admin/position',
        icon: 'assets/img/menu/position.png',
        classes: 'nav-item',
        hidden: true
      },
      /*{
        id: 'holiday',
        title: 'Festivos',
        type: 'item',
        url: '/admin/holiday',
        icon: 'assets/img/menu/holiday.png',
        classes: 'nav-item',
        hidden: true
      },*/
      {
        id: 'users',
        title: 'Usuarios',
        type: 'item',
        url: '/admin/users',
        icon: 'assets/img/menu/users.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'roles',
        title: 'Roles',
        type: 'item',
        url: '/admin/roles',
        icon: 'assets/img/menu/roles.png',
        classes: 'nav-item',
        hidden: true
      }
    ]
  }
];

@Injectable()
export class NavigationItem {

  constructor(
    private userService: UserService,
    private loaderService: LoaderService
  ) {
  }
  public permissions () {
    return this.userService.permissions().toPromise();
  }

  public async perms() {
    this.loaderService.loading(true);
    await this.permissions().then(resp => {
      NavigationItems.map(item => {
        item.children.map( children => {
          const users           = resp.filter( (perm: any) => perm.name === "ACCEDER_USUARIOS");
          const roles           = resp.filter( (perm: any) => perm.name === "ACCEDER_ROLES");
          const professional    = resp.filter( (perm: any) => perm.name === "ACCEDER_PROFESIONALES");
          const position        = resp.filter( (perm: any) => perm.name === "ACCEDER_CARGOS");
          const servicetype     = resp.filter( (perm: any) => perm.name === "ACCEDER_TIPO_SERVICIO");
          const workingday      = resp.filter( (perm: any) => perm.name === "ACCEDER_JORNADAS");
          const service         = resp.filter( (perm: any) => perm.name === "ACCEDER_SERVICIOS");
          const customertype    = resp.filter( (perm: any) => perm.name === "ACCEDER_TIPO_CLIENTE");
          const customer        = resp.filter( (perm: any) => perm.name === "ACCEDER_CLIENTES");
          // const holiday         = resp.filter( (perm: any) => perm.name === "ACCEDER_FESTIVOS");
          const reserve         = resp.filter( (perm: any) => perm.name === "ACCEDER_RESERVAS");
          const schedule        = resp.filter( (perm: any) => perm.name === "ACCEDER_AGENDAMIENTOS");


          if(users.length > 0 && children.id === 'users') {
            children.hidden = false;
          } else if(users.length === 0 && children.id === 'users') {
            children.hidden = true
          }

          if(roles.length > 0 && children.id === 'roles') {
            children.hidden = false;
          } else if (roles.length === 0 && children.id === 'roles') {
            children.hidden = true;
          }

          if(professional.length > 0 && children.id === 'professional') {
            children.hidden = false;
          } else if (professional.length === 0 && children.id === 'professional') {
            children.hidden = true;
          }

          if(position.length > 0 && children.id === 'position') {
            children.hidden = false;
          } else if (position.length === 0 && children.id === 'position') {
            children.hidden = true;
          }

          if(servicetype.length > 0 && children.id === 'servicetype') {
            children.hidden = false;
          } else if (servicetype.length === 0 && children.id === 'servicetype') {
            children.hidden = true;
          }

          if(workingday.length > 0 && children.id === 'workingday') {
            children.hidden = false;
          } else if (workingday.length === 0 && children.id === 'workingday') {
            children.hidden = true;
          }

          if(service.length > 0 && children.id === 'service') {
            children.hidden = false;
          } else if (service.length === 0 && children.id === 'service') {
            children.hidden = true;
          }

          if(customertype.length > 0 && children.id === 'customertype') {
            children.hidden = false;
          } else if (customertype.length === 0 && children.id === 'customertype') {
            children.hidden = true;
          }

          if(customer.length > 0 && children.id === 'customer') {
            children.hidden = false;
          } else if (customer.length === 0 && children.id === 'customer') {
            children.hidden = true;
          }

          /*if(holiday.length > 0 && children.id === 'holiday') {
            children.hidden = false;
          } else if (holiday.length === 0 && children.id === 'holiday') {
            children.hidden = true;
          }*/

          if(reserve.length > 0 && children.id === 'reserve') {
            children.hidden = false;
          } else if (reserve.length === 0 && children.id === 'reserve') {
            children.hidden = true;
          }

          if(schedule.length > 0 && children.id === 'schedule') {
            children.hidden = false;
          } else if (schedule.length === 0 && children.id === 'schedule') {
            children.hidden = true;
          }
        });
      });
      this.loaderService.loading(false);
    })
  }

  get() {
    this.perms();
    return NavigationItems;
  }
}
