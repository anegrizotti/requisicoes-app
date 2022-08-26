import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.model';
import { DepartamentoService } from './services/departamento.service';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html'
})
export class DepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;

  constructor(private departamentoService: DepartamentoService) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();
  }

}
