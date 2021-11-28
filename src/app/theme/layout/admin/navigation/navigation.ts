import {Injectable} from '@angular/core';
import {UserService} from 'src/app/services/admin/user/user.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';

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
        title: 'Pre-Agendar y Pagar',
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
        id: 'reschedule',
        title: 'Reprogramar',
        type: 'item',
        url: '/scheduling/reschedule',
        icon: 'assets/img/menu/reschedule.png',
        classes: 'nav-item',
        hidden: true
      },
      {
        id: 'paymentHistory',
        title: 'Historial de Pagos',
        type: 'item',
        url: '/scheduling/history',
        icon: 'assets/img/menu/payment-history.png',
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
        hidden: true
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
        id: 'status',
        title: 'Estados',
        type: 'item',
        url: '/admin/status',
        icon: 'assets/img/menu/status.png',
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
      {
        id: 'promocode',
        title: 'Códigos Promocionales',
        type: 'item',
        url: '/finance/promocode',
        icon: 'assets/img/menu/promo-code.png',
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
      },
      {
        id: 'scheduler',
        title: 'Agenda',
        type: 'collapse',
        icon: 'assets/img/menu/scheduler.png',
        hidden: true,
        children: [
          {
            id: 'schedulerCustomer',
            title: 'por Clientes',
            type: 'item',
            url: '/report/shedule',
            icon: 'assets/img/menu/schedule.png',
            hidden: true
          },
          {
            id: 'schedulerProfessional',
            title: 'por Profesionales',
            type: 'item',
            url: '/report/shedule-professionals',
            icon: 'assets/img/menu/scheduling.png',
            hidden: true
          },
        ]
      },
      {
        id: 'report',
        title: 'Reportes',
        type: 'collapse',
        icon: 'assets/img/menu/report.png',
        hidden: true,
        children: [
          {
            id: 'overdue',
            title: 'Pagos vencidos',
            type: 'item',
            url: '/report/expiration',
            icon: 'assets/img/menu/overdue.png',
            hidden: true
          },
          {
            id: 'servicesr',
            title: 'Historial de Servicios',
            type: 'item',
            url: '/report/history',
            icon: 'assets/img/menu/servicesr.png',
            hidden: true
          },
          {
            id: 'pendingPayments',
            title: 'Pagos Pendientes',
            type: 'item',
            url: '/report/pending',
            icon: 'assets/img/menu/pendingPayments.png',
            hidden: true
          },
          {
            id: 'servicesProfessional',
            title: 'Servicios por profesional',
            type: 'item',
            url: '/report/professional',
            icon: 'assets/img/menu/report-professional.png',
            hidden: true
          },
          {
            id: 'historyPayments',
            title: 'Historial de pagos',
            type: 'item',
            url: '/report/payment',
            icon: 'assets/img/menu/history.png',
            hidden: true
          },
          {
            id: 'servicer',
            title: 'Servicio',
            type: 'item',
            url: '/report/service',
            icon: 'assets/img/menu/service-report.png',
            hidden: true
          },
          {
            id: 'log',
            title: 'Registro de Actividades',
            type: 'item',
            url: '/report/activity',
            icon: 'assets/img/menu/log.png',
            hidden: true
          }
        ]
      },
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

  public permissions() {
    return this.userService.permissions().toPromise();
  }

  public async perms() {
    this.loaderService.loading(true);
    await this.permissions().then(resp => {
      NavigationItems.map(item => {
        item.children.map(children => {
          const users = resp.filter((perm: any) => perm.name === 'ACCEDER_USUARIOS');
          const roles = resp.filter((perm: any) => perm.name === 'ACCEDER_ROLES');
          const professional = resp.filter((perm: any) => perm.name === 'ACCEDER_PROFESIONALES');
          const position = resp.filter((perm: any) => perm.name === 'ACCEDER_CARGOS');
          const servicetype = resp.filter((perm: any) => perm.name === 'ACCEDER_TIPO_SERVICIO');
          const workingday = resp.filter((perm: any) => perm.name === 'ACCEDER_JORNADAS');
          const service = resp.filter((perm: any) => perm.name === 'ACCEDER_SERVICIOS');
          const customertype = resp.filter((perm: any) => perm.name === 'ACCEDER_TIPO_CLIENTE');
          const customer = resp.filter((perm: any) => perm.name === 'ACCEDER_CLIENTES');
          // const holiday         = resp.filter( (perm: any) => perm.name === "ACCEDER_FESTIVOS");
          const reserve = resp.filter((perm: any) => perm.name === 'ACCEDER_RESERVAS');
          const schedule = resp.filter((perm: any) => perm.name === 'ACCEDER_AGENDAMIENTOS');
          const availability = resp.filter((perm: any) => perm.name === 'ACCEDER_DISPONIBILIDAD');
          const status = resp.filter((perm: any) => perm.name === 'ACCEDER_ESTADOS');
          const promocode = resp.filter((perm: any) => perm.name === 'ACCEDER_CODIGOS_PROMOCIONALES');
          const reschedule = resp.filter((perm: any) => perm.name === 'ACCEDER_REPROGRAMACIONES');
          const report = resp.filter((perm: any) => perm.name === 'ACCEDER_REPORTES');
          const scheduler = resp.filter((perm: any) => perm.name === 'REPORTE_AGENDA');
          const schedulerCustomer = resp.filter((perm: any) => perm.name === 'REPORTE_AGENDA_CLIENTES');
          const schedulerProfessional = resp.filter((perm: any) => perm.name === 'REPORTE_AGENDA_PROFESIONALES');
          const overdue = resp.filter((perm: any) => perm.name === 'REPORTE_PAGOS_VENCIDOS');
          const servicesr = resp.filter((perm: any) => perm.name === 'REPORTE_HISTORIAL');
          const pendingPayments = resp.filter((perm: any) => perm.name === 'REPORTE_PAGOS_PENDIENTES');
          const servicesProfessional = resp.filter((perm: any) => perm.name === 'REPORTE_SERVICIOS_PROFESIONALES');
          const historyPayments = resp.filter((perm: any) => perm.name === 'REPORTE_HISTORIAL_PAGOS');
          const servicer = resp.filter((perm: any) => perm.name === 'REPORTE_SERVICIO');
          const log = resp.filter((perm: any) => perm.name === 'REPORTE_REGISTRO_ACTIVIDADES');
          const paymentHistory = resp.filter((perm: any) => perm.name === 'ACCEDER_HISTORIAL_CLIENTE');


          if (users.length > 0 && children.id === 'users') {
            children.hidden = false;
          } else if (users.length === 0 && children.id === 'users') {
            children.hidden = true;
          }

          if (roles.length > 0 && children.id === 'roles') {
            children.hidden = false;
          } else if (roles.length === 0 && children.id === 'roles') {
            children.hidden = true;
          }

          if (professional.length > 0 && children.id === 'professional') {
            children.hidden = false;
          } else if (professional.length === 0 && children.id === 'professional') {
            children.hidden = true;
          }

          if (position.length > 0 && children.id === 'position') {
            children.hidden = false;
          } else if (position.length === 0 && children.id === 'position') {
            children.hidden = true;
          }

          if (servicetype.length > 0 && children.id === 'servicetype') {
            children.hidden = false;
          } else if (servicetype.length === 0 && children.id === 'servicetype') {
            children.hidden = true;
          }

          if (workingday.length > 0 && children.id === 'workingday') {
            children.hidden = false;
          } else if (workingday.length === 0 && children.id === 'workingday') {
            children.hidden = true;
          }

          if (service.length > 0 && children.id === 'service') {
            children.hidden = false;
          } else if (service.length === 0 && children.id === 'service') {
            children.hidden = true;
          }

          if (customertype.length > 0 && children.id === 'customertype') {
            children.hidden = false;
          } else if (customertype.length === 0 && children.id === 'customertype') {
            children.hidden = true;
          }

          if (customer.length > 0 && children.id === 'customer') {
            children.hidden = false;
          } else if (customer.length === 0 && children.id === 'customer') {
            children.hidden = true;
          }

          /*if(holiday.length > 0 && children.id === 'holiday') {
            children.hidden = false;
          } else if (holiday.length === 0 && children.id === 'holiday') {
            children.hidden = true;
          }*/

          if (reserve.length > 0 && children.id === 'reserve') {
            children.hidden = false;
          } else if (reserve.length === 0 && children.id === 'reserve') {
            children.hidden = true;
          }

          if (schedule.length > 0 && children.id === 'schedule') {
            children.hidden = false;
          } else if (schedule.length === 0 && children.id === 'schedule') {
            children.hidden = true;
          }

          if (availability.length > 0 && children.id === 'availability') {
            children.hidden = false;
          } else if (availability.length === 0 && children.id === 'availability') {
            children.hidden = true;
          }

          if (status.length > 0 && children.id === 'status') {
            children.hidden = false;
          } else if (status.length === 0 && children.id === 'status') {
            children.hidden = true;
          }

          if (promocode.length > 0 && children.id === 'promocode') {
            children.hidden = false;
          } else if (promocode.length === 0 && children.id === 'promocode') {
            children.hidden = true;
          }

          if (reschedule.length > 0 && children.id === 'reschedule') {
            children.hidden = false;
          } else if (reschedule.length === 0 && children.id === 'reschedule') {
            children.hidden = true;
          }

          if (report.length > 0 && children.id === 'report') {
            children.hidden = false;
          } else if (report.length === 0 && children.id === 'report') {
            children.hidden = true;
          }

          if (paymentHistory.length > 0 && children.id === 'paymentHistory') {
            children.hidden = false;
          } else if (paymentHistory.length === 0 && children.id === 'paymentHistory') {
            children.hidden = true;
          }
          if (scheduler.length > 0 && children.id === 'scheduler') {
            children.hidden = false;
          } else if (scheduler.length === 0 && children.id === 'scheduler') {
            children.hidden = true;
          }

          if (children.id === 'scheduler') {
            children.children.map(child => {
              if (schedulerCustomer.length > 0 && child.id === 'schedulerCustomer') {
                child.hidden = false;
              } else if (schedulerCustomer.length === 0 && child.id === 'schedulerCustomer') {
                child.hidden = true;
              }

              if (schedulerProfessional.length > 0 && child.id === 'schedulerProfessional') {
                child.hidden = false;
              } else if (schedulerProfessional.length === 0 && child.id === 'schedulerProfessional') {
                child.hidden = true;
              }
            });
          }
          if (children.id === 'report') {
            children.children.map(child => {

              if (overdue.length > 0 && child.id === 'overdue') {
                child.hidden = false;
              } else if (overdue.length === 0 && child.id === 'overdue') {
                child.hidden = true;
              }

              if (servicesr.length > 0 && child.id === 'servicesr') {
                child.hidden = false;
              } else if (servicesr.length === 0 && child.id === 'servicesr') {
                child.hidden = true;
              }

              if (pendingPayments.length > 0 && child.id === 'pendingPayments') {
                child.hidden = false;
              } else if (pendingPayments.length === 0 && child.id === 'pendingPayments') {
                child.hidden = true;
              }

              if (servicesProfessional.length > 0 && child.id === 'servicesProfessional') {
                child.hidden = false;
              } else if (servicesProfessional.length === 0 && child.id === 'servicesProfessional') {
                child.hidden = true;
              }

              if (historyPayments.length > 0 && child.id === 'historyPayments') {
                child.hidden = false;
              } else if (historyPayments.length === 0 && child.id === 'historyPayments') {
                child.hidden = true;
              }

              if (servicer.length > 0 && child.id === 'servicer') {
                child.hidden = false;
              } else if (servicer.length === 0 && child.id === 'servicer') {
                child.hidden = true;
              }

              if (log.length > 0 && child.id === 'log') {
                child.hidden = false;
              } else if (log.length === 0 && child.id === 'log') {
                child.hidden = true;
              }
            });
          }
        });
      });
      this.loaderService.loading(false);
    });
  }

  get() {
    this.perms();
    return NavigationItems;
  }
}
