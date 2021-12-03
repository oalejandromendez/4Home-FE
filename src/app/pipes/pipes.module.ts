import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TransformDataPipe} from '@src/pipes/transform-data.pipe';



@NgModule({
  declarations: [TransformDataPipe],
  imports: [
    CommonModule
  ],
  exports: [
    TransformDataPipe
  ]
})
export class PipesModule { }
