import {Injectable} from '@angular/core';

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
        id: 'services',
        title: 'Servicios',
        type: 'item',
        url: '/service',
        icon: 'assets/img/menu/services.png',
        classes: 'nav-item',
      },
      {
        id: 'working-day',
        title: 'Jornadas',
        type: 'item',
        url: '/working',
        icon: 'assets/img/menu/working-day.png',
        classes: 'nav-item',
      },
      {
        id: 'scheduling',
        title: 'Agendamiento',
        type: 'item',
        url: '/scheduling',
        icon: 'assets/img/menu/scheduling.png',
        classes: 'nav-item',
      },
      {
        id: 'professionals',
        title: 'Profesionales',
        type: 'item',
        url: '/professional',
        icon: 'assets/img/menu/professionals.png',
        classes: 'nav-item',
      },
      {
        id: 'users',
        title: 'Usuarios',
        type: 'item',
        url: '/users',
        icon: 'assets/img/menu/users.png',
        classes: 'nav-item',
      },
      {
        id: 'roles',
        title: 'Roles',
        type: 'item',
        url: '/roles',
        icon: 'assets/img/menu/roles.png',
        classes: 'nav-item',
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
