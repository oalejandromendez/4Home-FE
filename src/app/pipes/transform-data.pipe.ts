import { Pipe, PipeTransform } from '@angular/core';
import {NoveltyService} from '@src/services/admin/novelty/novelty.service';

@Pipe({
  name: 'transformData'
})
export class TransformDataPipe implements PipeTransform {

  public constructor(private noveltyService: NoveltyService) {
  }

  transform(value: any, option: any): any {
    if (value) {
      if (option === 'NoveltyType') {
        return this.noveltyService.Type.filter(data => data.value === value)[0].label;
      }
    }
  }

}
