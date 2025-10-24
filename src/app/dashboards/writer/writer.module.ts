import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WriterRoutingModule } from './writer-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    WriterRoutingModule,
  ]
})
export class WriterModule { }
