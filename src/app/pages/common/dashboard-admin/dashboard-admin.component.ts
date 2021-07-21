import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChartComponent } from 'angular2-chartjs';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {

  /*Servicios*/
  public serviceChartData: any;
  public serviceChartOptions: any;
  @ViewChild('serviceChart', {static: false}) serviceChart: ElementRef; // doughnut
  @ViewChild('legendService', {static: false}) legendService: ElementRef;
  @ViewChild('labelService', {static: false}) labelService: ElementRef;
  @ViewChild(ChartComponent, {static: false}) baseServiceChart: ChartComponent;
  public serviceChartTag: CanvasRenderingContext2D;

  /*Clientes*/
  public customerChartData: any;
  public customerChartOption: any;
  @ViewChild('customerChart', {static: false}) customerChart: ElementRef;
  public customerChartTag: CanvasRenderingContext2D;

  /*Tipo*/
  public serviceTypeChartData: any;
  public serviceTypeChartOptions: any;
  @ViewChild('serviceTypeChart', {static: false}) serviceTypeChart: ElementRef; // doughnut
  @ViewChild('legendServicetype', {static: false}) legendServicetype: ElementRef;
  @ViewChild('labelServiceType', {static: false}) labelServiceType: ElementRef;
  @ViewChild(ChartComponent, {static: false}) baseServiceTypeChart: ChartComponent;
  public serviceTypeChartTag: CanvasRenderingContext2D;

  /*Jornadas*/
  public workingChartData: any;
  public workingChartOption: any;
  @ViewChild('workingChart', {static: false}) workingChart: ElementRef;
  public workingChartTag: CanvasRenderingContext2D;


  widgets = null;
  labelsService = ['Esporádico', 'Mensualidad'];
  dataService = [];

  labelsServiceType = [];
  dataServiceType = [];

  name = null;

  constructor(
    private dashboardService: DashboardService,
    private toastyService: ToastyService,
    private router: Router,
    private authService: AuthService
  ) {

    const user = this.authService.authUser();
    this.name = user.name + " " + user.lastname;

    this.customerChartOption  = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
        {
          ticks: {
            max: 1,
            min: 0
          }
        }]
      },
    };
  }

  ngOnInit(): void {
    this.getDashboard();
  }

  getDashboard() {
    this.dashboardService.admin().subscribe(resp => {
      this.widgets = resp.widgets;
      this.preloadChatService(resp);
      this.loadChartCustomer(resp)
      this.preloadChatServiceType(resp);
      this.loadChartWorking(resp)
    }, (err) => {
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

  preloadChatService(data: any) {
    this.dataService.push(data.sporadic);
    this.dataService.push(data.monthly);
    this.loadChartService();
  }

  loadChartService() {
    return new Promise<void>(resolve => {
      const pieTag = (((this.serviceChart.nativeElement as HTMLCanvasElement).children));
      this.serviceChartTag = ((pieTag['service_chart']).lastChild).getContext('2d');

      const that = this;

      this.serviceChartData = {
        labels: that.labelsService,
        datasets: [{
          data: that.dataService,
          backgroundColor: ['rgba(75,192,192,1)', 'rgba(255,159,64,1)'],
          borderWidth: 0,
          hoverBackgroundColor: ['rgba(75,192,192,1)', 'rgba(255,159,64,1)']
        }]
      };

      this.serviceChartOptions = {
        responsive: true,
        legend: {
            display: true,
            position: 'bottom',
            labels : {
                padding: 10,
                fontColor: 'rgb(0, 0, 0)',
                fontSize: 13,
                family: 'Verdana',
                usePointStyle: true,
                fontStyle: 'bold'
            },
        },
        title: {
          display: false
        },
        legendCallback(chart: any) {
          const text = [];
          const data = chart.data;
          const datasets = data.datasets;
          const labels = data.labels;

          if (datasets.length) {
            for (let i = 0; i < datasets[0].data.length; ++i) {

                text.push('<div class="col-auto m-t-5 m-b-5">');
                let percentage = 0;

                if (labels[i]) {
                    // Calcular Porcentaje
                    const total = datasets[0].data.reduce( (previousValue, currentValue) => {
                        return +previousValue + +currentValue;
                    });

                    if (i === 0 ) { that.labelService.nativeElement.innerHTML = 'Total' + ': ' + total;  }

                    if (total === 0) {
                        percentage = 0;
                    } else {
                        const currentValue = datasets[0].data[i];
                        percentage = Math.floor(((currentValue / total) * 100) + 0.5);
                    }

                    text.push('<h4 class="text-center">' + percentage + '% </h4>');

                    if (labels[i] === 'Esporádico') {
                      text.push('<p class="m-b-0"><i class="fas fa-concierge-bell m-r-5"></i>' + labels[i] + '</p>');
                    }
                    if (labels[i] === 'Mensualidad') {
                      text.push('<p class="m-b-0"><i class="fas fa-calendar-alt m-r-5"></i>' + labels[i] + '</p>');
                    }
                }
                text.push('</div>');
            }
          }
          return text.join('');
        },
      };
      setTimeout(() => {
        resolve();
      });
    });
  }

  loadChartCustomer(data: any) {
    setTimeout(() => {

      const barBasicTag = (((this.customerChart.nativeElement as HTMLCanvasElement).children));

      this.customerChartTag = ((barBasicTag['customer_chart']).lastChild).getContext('2d');

      const dataset = [];
      data.customers.map( (customer: any) => {
        const aux = {};
        aux['label'] = customer.name;
        aux['data'] = [ customer.user_count ];
        const color = this.dynamicColors();
        aux['borderColor'] = color;
        aux['backgroundColor'] = color;
        aux['hoverborderColor'] = color;
        aux['hoverBackgroundColor'] = color;
        dataset.push(aux);
      });

      this.customerChartData = {
        labels: ['Clientes'],
        datasets: dataset,
      };

      this.customerChartOption = {
        barValueSpacing: 200,
        responsive: true,
        maintainAspectRatio: true,
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontStyle: 'bold',
            }
        },
        tooltips: {
            enabled: true
        },
        animation: {
            animateScale: true,
            animateRotate: true,
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            gridLines: {
              display: true,
            },
          }],
          xAxes: [{
            ticks: {
              beginAtZero: true,
              display: false,
            },
            gridLines: {
                display: false,
            },
          }]
        }
      };
    });
  }

  dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + "," + 0.5 + ")";
  }

  preloadChatServiceType(data: any) {

    data.services.map( (service: any) => {
      var total = 0;
      service.working_day.map( (working: any) => {
        working.service.map( (reserve: any) => {
          total = total + reserve.reserve_count;
        });
      });
      this.labelsServiceType.push(service.name);
      this.dataServiceType.push(total);
    });
    this.loadChartServiceType();
  }

  loadChartServiceType() {
    return new Promise<void>(resolve => {
      /* pie cart */
      const pieTag = (((this.serviceTypeChart.nativeElement as HTMLCanvasElement).children));
      this.serviceTypeChartTag = ((pieTag['serviceType_chart']).lastChild).getContext('2d');

      const that = this;

      this.serviceTypeChartData = {
        labels: that.labelsServiceType,
        datasets: [{
          data: that.dataServiceType,
          backgroundColor: that.dynamicColorsArray(that.labelsServiceType.length),
          borderWidth: 0,
        }]
      };

      this.serviceTypeChartOptions = {
        responsive: true,
        legend: {
          display: true,
          position: 'bottom',
          labels : {
              padding: 10,
              fontColor: 'rgb(0, 0, 0)',
              fontSize: 13,
              family: 'Verdana',
              usePointStyle: true,
              fontStyle: 'bold'
          },
        },
        title: {
          display: false
        }
      };
      setTimeout(() => {
        resolve();
      });
    });
  }

  dynamicColorsArray = function (cantidad: any) {
    let colors =[];
    for (let i = 0; i < cantidad; i++) {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      colors.push("rgb(" + r + "," + g + "," + b + ")");
    }
    return colors
  }

  loadChartWorking(data: any) {
    setTimeout(() => {

      const barBasicTag = (((this.workingChart.nativeElement as HTMLCanvasElement).children));

      this.workingChartTag = ((barBasicTag['working_chart']).lastChild).getContext('2d');

      const dataset = [];
      data.working.map( (working: any) => {
        const aux = {};
        aux['label'] = working.name;
        var total = 0;
        working.service.map( (reserve: any) => {
          total = total + reserve.reserve_count;
        });
        aux['data'] = [ total ];
        const color = this.dynamicColors();
        aux['borderColor'] = color;
        aux['backgroundColor'] = color;
        aux['hoverborderColor'] = color;
        aux['hoverBackgroundColor'] = color;
        dataset.push(aux);
      });

      this.workingChartData = {
        labels: ['Reservas'],
        datasets: dataset,
      };

      this.workingChartOption = {
        barValueSpacing: 200,
        responsive: true,
        maintainAspectRatio: true,
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontStyle: 'bold',
            }
        },
        tooltips: {
            enabled: true
        },
        animation: {
            animateScale: true,
            animateRotate: true,
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            gridLines: {
              display: true,
            },
          }],
          xAxes: [{
            ticks: {
              beginAtZero: true,
              display: false,
            },
            gridLines: {
                display: false,
            },
          }]
        }
      };
    });
  }

}
