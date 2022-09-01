import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipamentoRoutingModule } from './equipamento-routing.module';
import { EquipamentoComponent } from './equipamento.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyModule } from "ngx-currency";


@NgModule({
  declarations: [
    EquipamentoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EquipamentoRoutingModule,
    NgxCurrencyModule
  ]
})
export class EquipamentoModule { }
