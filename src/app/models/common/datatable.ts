import {Injectable} from '@angular/core';

const espaniol = {
  sProcessing:     'Procesando...',
  sLengthMenu:     'Mostrar MENU registros',
  sZeroRecords:    'No se encontraron resultados',
  sEmptyTable:     'Ningún dato disponible en esta tabla',
  sInfo:           'Mostrando registros del _START_ al _END_  de un total de _TOTAL_  registros',
  sInfoEmpty:      'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered:   '(filtrado de un total de _MAX_  registros)',
  sInfoPostFix:    '',
  sSearch:         'Buscar:',
  sUrl:            '',
  sInfoThousands:  ',',
  sLoadingRecords: 'Cargando...',
  oPaginate: {
      sFirst:    'Primero',
      sLast:     'Último',
      sNext:     'Siguiente',
      sPrevious: 'Anterior'
  },
  oAria: {
      sSortAscending:  ': Activar para ordenar la columna de manera ascendente',
      sSortDescending: ': Activar para ordenar la columna de manera descendente'
  }
};

const ingles = {
    processing: '<div class="card-loader panel"><i class="fa fa-spinner fa-3xs rotate-refresh"></div>',
    search: 'Search:',
    lengthMenu: 'Show MENU &eacute;l&eacute;ments',
    info: 'Showing records from START to END of a total of TOTAL records',
    infoEmpty: 'No results found.',
    infoFiltered: '(Filtering from a total of MAX records)',
    infoPostFix: '',
    loadingRecords: 'Loading record...',
    zeroRecords: 'No results found',
    emptyTable: 'No data available in this table',
    paginate: {
      first: 'First',
      previous: 'Previous',
      next: 'Next',
      last: 'Last'
    },
    aria: {
      sortAscending: ': Activate to order the column ascending order.',
      sortDescending: ': Activate to order the column in descending order.'
    }
};



@Injectable()
export class DataTableLanguage {
    public getLanguage(language: string) {
        if ( language === 'es') {
            return espaniol;
        }
        if ( language === 'us') {
            return ingles;
        }
    }

}
