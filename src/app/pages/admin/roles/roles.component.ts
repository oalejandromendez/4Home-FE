import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { map } from 'rxjs/operators';
import { ToastOptions, ToastyConfig, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { RolModel } from 'src/app/models/admin/rol.model';
import { PermissionService } from 'src/app/services/admin/permission/permission.service';
import { RolService } from 'src/app/services/admin/rol/rol.service';
import { UserService } from 'src/app/services/admin/user/user.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RolesComponent implements OnInit, OnDestroy {

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  private subscription: Subscription;

  dtOptions: any = {};
  roles: any[];
  rol: RolModel = new RolModel();
  submitted = false;
  form: FormGroup;
  id: any;
  permissions: Array<any> = [];
  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    private rolService: RolService,
    private loaderService: LoaderService,
    private permissionService: PermissionService,
    private userService: UserService,
    private language: DataTableLanguage,
    private modalService: NgbModal,
    private toastyConfig: ToastyConfig
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.getAllPermissions();
    this.getPermissions();
    this.toastyConfig.theme = 'material';
  }

  ngOnInit(): void {
    this.loadTable();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadForm() {
    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.max(50)],this.validateName.bind(this)),
      permissions: new FormControl(null, [Validators.required]),
    });
  }

  validateName(control: AbstractControl) {
    return this.rolService.validateName(control.value).pipe(map( (resp: any) => {
      if (this.id) {
        if (resp.name === this.rol.name) {
          return null;
        }
      }
      return Object.keys(resp).length > 0 ? { code: true } : null ;
    }));
  }

  getAllPermissions() {
    this.loaderService.loading(true);
    const that = this;
    this.permissionService.get().subscribe( (resp: any) => {
      resp.map( (permission: any) => {
        const label = that.loadNamePermission(permission.name);
        this.permissions.push({ value: String(permission.id), label: label } );
        this.permissions = this.permissions.slice();
      });
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  loadNamePermission(name: string) {
    switch (name) {
      case 'ACCEDER_USUARIOS':
        return 'Acceder al modulo de usuarios';
      case 'VER_USUARIOS':
        return 'Acceder a lista de usuarios';
      case 'CREAR_USUARIOS':
        return 'Crear usuarios';
      case 'MODIFICAR_USUARIOS':
        return 'Modificar usuarios';
      case 'ELIMINAR_USUARIOS':
        return 'Eliminar usuarios';
      case 'ACCEDER_ROLES':
        return 'Acceder al modulo de roles';
      case 'VER_ROLES':
        return 'Acceder a lista de roles';
      case 'CREAR_ROLES':
        return 'Crear roles';
      case 'MODIFICAR_ROLES':
        return 'Modificar roles';
      case 'ELIMINAR_ROLES':
        return 'Eliminar roles';
      case 'ACCEDER_PROFESIONALES':
        return 'Acceder al modulo de profesionales';
      case 'VER_PROFESIONALES':
        return 'Acceder a lista de profesionales';
      case 'CREAR_PROFESIONALES':
        return 'Crear profesionales';
      case 'MODIFICAR_PROFESIONALES':
        return 'Modificar profesionales';
      case 'ELIMINAR_PROFESIONALES':
        return 'Eliminar profesionales';
      case 'ACCEDER_CARGOS':
        return 'Acceder al modulo de cargos';
      case 'VER_CARGOS':
        return 'Acceder a lista de cargos';
      case 'CREAR_CARGOS':
        return 'Crear cargos';
      case 'MODIFICAR_CARGOS':
        return 'Modificar cargos';
      case 'ELIMINAR_CARGOS':
        return 'Eliminar cargos';
      case 'ACCEDER_JORNADAS':
        return 'Acceder al modulo de jornadas';
      case 'VER_JORNADAS':
        return 'Acceder a lista de jornadas';
      case 'CREAR_JORNADAS':
        return 'Crear jornadas';
      case 'MODIFICAR_JORNADAS':
        return 'Modificar jornadas';
      case 'ELIMINAR_JORNADAS':
        return 'Eliminar jornadas';
      case 'ACCEDER_SERVICIOS':
        return 'Acceder al modulo de servicios';
      case 'VER_SERVICIOS':
        return 'Acceder a lista de servicios';
      case 'CREAR_SERVICIOS':
        return 'Crear servicios';
      case 'MODIFICAR_SERVICIOS':
        return 'Modificar servicios';
      case 'ELIMINAR_SERVICIOS':
        return 'Eliminar servicios';
      case 'ACCEDER_TIPO_CLIENTE':
        return 'Acceder al modulo de tipo de cliente';
      case 'VER_TIPO_CLIENTE':
        return 'Acceder a lista de tipo de cliente';
      case 'CREAR_TIPO_CLIENTE':
        return 'Crear tipo de cliente';
      case 'MODIFICAR_TIPO_CLIENTE':
        return 'Modificar tipo de cliente';
      case 'ELIMINAR_TIPO_CLIENTE':
        return 'Eliminar tipo de cliente';
      case 'ACCEDER_CLIENTES':
        return 'Acceder al modulo de clientes';
      case 'VER_CLIENTES':
        return 'Acceder a lista de clientes';
      case 'CREAR_CLIENTES':
        return 'Crear clientes';
      case 'MODIFICAR_CLIENTES':
        return 'Modificar clientes';
      case 'ELIMINAR_CLIENTES':
        return 'Eliminar clientes';
      case 'ACCEDER_FESTIVOS':
        return 'Acceder al modulo de festivos';
      case 'VER_FESTIVOS':
        return 'Acceder a lista de festivos';
      case 'CREAR_FESTIVOS':
        return 'Crear festivos';
      case 'MODIFICAR_FESTIVOS':
        return 'Modificar festivos';
      case 'ELIMINAR_FESTIVOS':
        return 'Eliminar festivos';
      case 'ACCEDER_RESERVAS':
        return 'Acceder al modulo de reservas';
      case 'VER_RESERVAS':
        return 'Acceder a lista de reservas';
      case 'CREAR_RESERVAS':
        return 'Crear reservas';
      case 'MODIFICAR_RESERVAS':
        return 'Modificar reservas';
      case 'ELIMINAR_RESERVAS':
        return 'Eliminar reservas';
      case 'ACCEDER_TIPO_SERVICIO':
        return 'Acceder al modulo de tipo de servicios';
      case 'VER_TIPO_SERVICIO':
        return 'Acceder a lista de tipo de servicios';
      case 'CREAR_TIPO_SERVICIO':
        return 'Crear tipo de servicios';
      case 'MODIFICAR_TIPO_SERVICIO':
        return 'Modificar tipo de servicios';
      case 'ELIMINAR_TIPO_SERVICIO':
        return 'Eliminar tipo de servicios';
    }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    this.rolService.get().subscribe(resp => {
      this.roles = resp;
      this.dtTrigger.next();
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:  'Ha ocurrido un error'
      });
    });
  }

  loadTable() {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 8,
      processing: true,
      destroy: true,
      dom: 'Bfrtip',
      scrollY: '300px',
      scrollX: 'auto',
      scrollCollapse: true,
      buttons: [
        {
          className: 'btn-sm boton-excel wid-5',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/añadir.png">',
          titleAttr: 'Nuevo Rol',
          action(e: any) {
            that.cancel();
            that.openModal.nativeElement.click();
          }
        },
        {
            className: 'btn-sm boton-excel wid-5',
            text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/excel.png">',
            titleAttr: 'Exportar como Excel',
            extend: 'excel',
            extension: '.xls',
            exportOptions: {
              columns: ':not(.notexport)'
          }
        },
        {
          className: 'btn-sm boton-copiar wid-5',
          text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/copiar.png">',
          titleAttr: 'Copiar',
          extend: 'copy',
          extension: '.copy',
          exportOptions: {
            columns: ':not(.notexport)'
          }
        },
        {
            className: 'btn-sm boton-imprimir wid-5',
            text: '<img alt="Theme-Logo" class="img-fluid" src="assets/img/datatable/print.png">',
            titleAttr: 'Imprimir',
            extend: 'print',
            extension: '.print',
            exportOptions: {
              columns: ':not(.notexport)'
          }
        },
      ],
      columnDefs: [
        { targets: 0, searchable: false, visible: false, className: 'notexport' },
        { targets: 1,  className: 'text-center' },
        { targets: 2,  className: 'wid-15 text-center' }
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  onSubmit() {

    this.submitted = true;

    if (!this.form.valid) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text:  'Espere...'
    });

    Swal.showLoading();

    if (this.id) {

      this.rolService.put( this.form.value, this.id).subscribe( (data: any)  => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El rol se ha editado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.cancel();
        this.closeModal.nativeElement.click();
        this.rerender();

        Swal.close();

      }, (err) => {
        Swal.close();

        if (err.error.errors) {
          let mensage = '';

          Object.keys(err.error.errors).forEach( (data, index) => {
            mensage += err.error.errors[data][0] + '<br>';
          });

          const toastOptions: ToastOptions = {
            title: 'Error',
            msg: mensage,
            showClose: false,
            timeout: 2000,
            theme: 'bootstrap',
          };
          this.toastyService.error(toastOptions);
        } else {
          if (err.status === 401) {
            this.router.navigateByUrl('/auth/login');
          }
        }
      });

    } else {

      this.rolService.post( this.form.value ).subscribe( (data: any) => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El rol se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset({status: true});
        this.submitted = false;
        this.closeModal.nativeElement.click();
        this.rerender();
      }, (err) => {
        Swal.close();
        if (err.error.errors) {
          let mensage = '';

          Object.keys(err.error.errors).forEach( (data, index) => {
            mensage += err.error.errors[data][0] + '<br>';
          });
          const toastOptions: ToastOptions = {
            title: 'Error',
            msg: mensage,
            showClose: false,
            timeout: 2000,
            theme: 'bootstrap',
          };
          this.toastyService.error(toastOptions);
        } else {
          if (err.status === 401) {
            this.router.navigateByUrl('/login');
          }
        }
      });
    }
  }

  edit(id: any) {
    if(id) {
      this.id = id;
      const data = this.roles.find( (rol: any) => rol.id === id);
      const permissions = data.permissions.map( (permission: any) => String(permission.id));

      this.rol = data;
      this.rol.permission = permissions;

      if (data) {
        this.form.patchValue(data);
        this.form.controls.permissions.setValue(permissions);
        this.openModal.nativeElement.click();
      }
    }
  }

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.rol = new RolModel();
    if(!this.canCreate) {
      this.form.disable();
    }
  }

  delete(id: any, index: any) {
    if (id) {
      Swal.fire({
        title: 'Esta seguro?',
        text:  'Usted no podra recuperar los datos eliminados',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: false,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return new Promise<void>((resolve) => {
            this.rolService.delete(id).subscribe( data => {
              this.roles.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el rol exitosamente', 'success' );
            }, (err: any) => {
              Swal.fire('Error', err.error.message, 'error');
            });
            setTimeout(() => {
              resolve();
            }, 5000);
          });
        }
      });
    }
  }

  open(modal: any) {
    this.modalService.open(modal);
  }

  close(modal: any) {
    this.modalService.dismissAll(modal);
  }

  getPermissions() {
    const that = this;
    this.userService.permissions().subscribe( resp => {
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_ROLES');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_ROLES');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_ROLES');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      const eliminar = resp.filter( (permission: any) => permission.name === 'ELIMINAR_ROLES');
      if(eliminar.length >= 1) {
        that.canDelete = true;
      }
      if(!that.canCreate) {
        this.form.disable();
      }
      this.loadData();
    }, error => {
      const toastOptions: ToastOptions = {
        title: 'Error',
        msg: 'El ususario no tiene roles',
        showClose: false,
        timeout: 2000,
        theme: 'bootstrap',
      };
      this.toastyService.error(toastOptions);
      this.loaderService.loading(true);
    });
  }
}
