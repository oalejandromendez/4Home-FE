import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbCalendar, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {ToastOptions, ToastyConfig, ToastyService} from 'ng2-toasty';
import {Subject} from 'rxjs';
import {DataTableLanguage} from 'src/app/models/common/datatable';
import {UserService} from 'src/app/services/admin/user/user.service';
import {LoaderService} from 'src/app/services/common/loader/loader.service';
import Swal from 'sweetalert2';
import {labels} from '@lang/labels/es_es';
import {messages} from '@lang/messages/es_es';
import {texts} from '@lang/texts/es_es';
import {NoveltyModel} from '@src/models/admin/novelty.model';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';
import {ProfessionalService} from '@src/services/admin/professional/professional.service';
import {CustomDatepickerI18n} from '@src/services/common/datepicker/datepicker.service';

@Component({
  selector: 'app-novelties',
  templateUrl: './novelties.component.html',
  styleUrls: ['./novelties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NoveltiesComponent implements OnInit, OnDestroy {

  labels = labels;
  texts = texts;
  messages = messages;
  @ViewChild('openModal') openModal: ElementRef;
  @ViewChild('closeModal') closeModal: ElementRef;

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  dtOptions: any = {};
  novelties: any[];
  novelty: NoveltyModel = new NoveltyModel();
  submitted = false;
  form: FormGroup;
  id: any;
  canCreate = false;
  canSee = false;
  canEdit = false;
  canDelete = false;

  professionals: Array<any> = [];
  types: Array<any> = [];

  today = this.calendar.getToday();

  constructor(
    private router: Router,
    private toastyService: ToastyService,
    private noveltyService: NoveltyService,
    private loaderService: LoaderService,
    private userService: UserService,
    private language: DataTableLanguage,
    private modalService: NgbModal,
    private toastyConfig: ToastyConfig,
    private professionalService: ProfessionalService,
    private calendar: NgbCalendar,
    private dateService: CustomDatepickerI18n
  ) {
    this.loaderService.loading(true);
    this.loadForm();
    this.getPermissions();
    this.toastyConfig.theme = 'material';
    this.types = this.noveltyService.Type;
  }

  ngOnInit(): void {
    this.loadTable();
    this.getProfessionals();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadForm() {
    this.form = new FormGroup({
      professional: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      init: new FormControl('', [Validators.required]),
      end: new FormControl('', [Validators.required]),
    }, {validators: this.dateService.ValidateDates});
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadData();
    });
  }

  loadData() {
    this.noveltyService.get().subscribe(resp => {
      this.novelties = resp.data;
      this.dtTrigger.next();
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
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
          titleAttr: labels.new_novelty,
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
        {targets: 0, searchable: false, visible: false, className: 'notexport'},
        {targets: 2, className: 'text-center'},
        {targets: 3, className: 'wid-15 text-center'}
      ],
      order: [],
      language: that.language.getLanguage('es'),
      responsive: true
    };
  }

  onSubmit() {

    this.submitted = true;

    if (!this.form.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: messages.not_valid_form
      });
      console.log(this.form);
      return;
    }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere...'
    });

    Swal.showLoading();

    const initDate = this.form.value.init;
    const endDate = this.form.value.end;

    this.novelty = {
      professional: this.form.value.professional,
      type: this.form.value.type,
      initial_date: `${initDate.year}-${initDate.month}-${initDate.day}`,
      final_date: `${endDate.year}-${endDate.month}-${endDate.day}`,
    };

    if (this.id) {

      this.noveltyService.put(this.novelty, this.id).subscribe(() => {

        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cargo se ha editado exitosamente',
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

          Object.keys(err.error.errors).forEach((data, index) => {
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

      this.noveltyService.post(this.novelty).subscribe(() => {
        Swal.close();
        const toastOptions: ToastOptions = {
          title: '¡Proceso Exitoso!',
          msg: 'El cargo se ha registrado exitosamente',
          showClose: false,
          timeout: 3000,
          theme: 'bootstrap',
        };
        this.toastyService.success(toastOptions);
        this.form.reset({status: true});
        this.submitted = false;
        this.closeModal.nativeElement.click();
        this.novelty = new NoveltyModel();
        this.rerender();
      }, (err) => {
        Swal.close();
        if (err.error.errors) {
          let mensage = '';

          Object.keys(err.error.errors).forEach((data, index) => {
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
    if (id) {
      this.id = id;
      const data = this.novelties.find((position: any) => position.id === id);
      this.novelty = data;
      if (data) {
        this.form.patchValue(data);
        this.form.controls.professional.setValue(String(data.professional.id));
        if(data.initial_date) {
          const initial_date = data.initial_date.split('-');
          this.form.controls.init.setValue({ year: +initial_date[0], month: +initial_date[1], day: +initial_date[2]});
        }
        if (data.final_date) {
          const final_date = data.final_date.split('-');
          this.form.controls.end.setValue({ year: +final_date[0], month: +final_date[1], day: +final_date[2]});
        }
        this.form.enable();
        this.openModal.nativeElement.click();
      }
    }
  }

  cancel() {
    this.id = null;
    this.form.reset();
    this.submitted = false;
    this.novelty = new NoveltyModel();
    if (!this.canCreate) {
      this.form.disable();
    }
  }

  delete(id: any, index: any) {
    if (id) {
      Swal.fire({
        title: 'Esta seguro?',
        text: 'Usted no podra recuperar los datos eliminados',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: false,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return new Promise<void>((resolve) => {
            this.noveltyService.delete(id).subscribe(data => {
              this.novelties.splice(index, 1);
              this.dtOptions = {};
              this.loadTable();
              this.rerender();
              this.cancel();
              Swal.fire('Proceso Exitoso!', 'Se ha eliminado el cargo exitosamente', 'success');
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
    this.userService.permissions().subscribe(resp => {
      const create = resp.filter((permission: any) => permission.name === 'CREAR_NOVEDADES');
      if (create.length >= 1) {
        that.canCreate = true;
      }
      const see = resp.filter((permission: any) => permission.name === 'VER_NOVEDADES');
      if (see.length >= 1) {
        that.canSee = true;
      }
      const edit = resp.filter((permission: any) => permission.name === 'MODIFICAR_NOVEDADES');
      if (edit.length >= 1) {
        that.canEdit = true;
      }
      const deleteP = resp.filter((permission: any) => permission.name === 'ELIMINAR_NOVEDADES');
      if (deleteP.length >= 1) {
        that.canDelete = true;
      }
      if (!that.canCreate) {
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

  getProfessionals() {
    this.loaderService.loading(true);
    this.professionalService.get().subscribe((resp: any) => {
      resp.data.map((type: any) => {
        this.professionals.push({value: String(type.id), label: `${type.identification} - ${type.name} ${type.lastname}`});
      });
      this.loaderService.loading(false);
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error'
      });
    });
  }

}

