import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.model';
import { DepartamentoService } from './services/departamento.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html'
})
export class DepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
    ) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl(""),
      telefone: new FormControl("")
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Inserção";
  }

  get id() {
    return this.form.get("id");
  }

  get nome() {
    return this.form.get("nome");
  }

  get telefone() {
    return this.form.get("telefone");
  }

  public async gravar(modal: TemplateRef<any>, departamento?: Departamento) {
    this.form.reset();

    if(departamento) {
      this.form.setValue(departamento);
    }

    try {
      await this.modalService.open(modal).result;

      if(!departamento) {
        await this.departamentoService.inserir(this.form.value);
        this.toastr.success('Departamento inserido com sucesso.', 'Inserção de Departamento');
      }
      else{
        await this.departamentoService.editar(this.form.value);
        this.toastr.success('Departamento editado com sucesso.', 'Edição de Departamento');
      }

    } catch (error: any) {

      if(error === "Ítem inválido" && error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao inserir o departamento', 'Inserção de Departamento')
      else if(error != "fechar" && error != "0" && error != "1") {
        this.toastr.error('Falha ao editar o departamento', 'Edição de Departamento')
      }

    }
  }

  public async excluir(departamento: Departamento) {
    try {
      await this.departamentoService.excluir(departamento);
      this.toastr.success('Departamento excluído com sucesso.', 'Exclusão de Departamento');

    } catch (error) {
      if(error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao excluír o departamento.', 'Exclusão de Departamento');
    }
  }

}
