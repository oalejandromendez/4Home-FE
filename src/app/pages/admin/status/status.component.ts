import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastOptions, ToastyConfig, ToastyService } from 'ng2-toasty';
import { Subject, Subscription } from 'rxjs';
import { StatusModel } from 'src/app/models/admin/status.model';
import { DataTableLanguage } from 'src/app/models/common/datatable';
import { StatusService } from 'src/app/services/admin/status/status.service';
import { UserService } from 'src/app/services/admin/user/user.service';
import { LoaderService } from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  private subscription: Subscription;

  dtOptions: any = {};
  statuses: any[];
  status: StatusModel = new StatusModel();
  submitted = false;
  form: FormGroup;
  id: any;
  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    private statusService: StatusService,
    private loaderService: LoaderService,
    private userService: UserService,
    private language: DataTableLanguage,
    private modalService: NgbModal,
    private toastyConfig: ToastyConfig
  ) {
    this.loaderService.loading(true);
    this.loadForm();
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
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      colour: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      openSchedule: new FormControl(false, [Validators.required]),
      status: new FormControl({value: true, disabled: true}, [Validators.required]),
    });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    this.statusService.get().subscribe(resp => {
      this.statuses = resp;
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
          titleAttr: 'Nuevo Estado',
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
        { targets: 2,  className: 'text-center' },
        { targets: 3,  className: 'wid-15 text-center' }
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

    this.status = this.form.value;

    if (this.id) {

      this.statusService.put( this.status, this.id).subscribe( (data: any)  => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El estado se ha editado exitosamente',
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

      this.statusService.post( this.status ).subscribe( (data: any) => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El estado se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset({status: true});
        this.submitted = false;
        this.closeModal.nativeElement.click();
        this.status = new StatusModel();
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
      const data = this.statuses.find( (status: any) => status.id === id);
      this.status = data;
      if (data) {
        this.form.patchValue(data);
        this.form.controls.status.enable();
        this.form.enable();
        this.openModal.nativeElement.click();
      }
    }
  }

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.status = new StatusModel();
    this.form.reset({status: true, openSchedule: false});
    this.form.controls.status.disable();
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
            this.statusService.delete(id).subscribe( data => {
              this.statuses.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el estado exitosamente', 'success' );
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
      const create = resp.filter( (permission: any) => permission.name === 'CREAR_ESTADOS');
      if(create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter( (permission: any) => permission.name === 'VER_ESTADOS');
      if(see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter( (permission: any) => permission.name === 'MODIFICAR_ESTADOS');
      if(edit.length >= 1) {
        that.canEdit = true;
      }
      const deleteP = resp.filter( (permission: any) => permission.name === 'ELIMINAR_ESTADOS');
      if(deleteP.length >= 1) {
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
