import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import * as moment from 'moment';


export function dataFuturaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dataSelecionada = moment(control.value);
    const dataAtual = moment();

    const dataSelecionadaEhMaiorQueDataAtual: boolean = dataSelecionada.isAfter(dataAtual);

    return dataSelecionadaEhMaiorQueDataAtual ? { dataFutura: true } : null;
  }
}
