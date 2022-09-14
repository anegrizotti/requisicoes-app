import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Equipamento } from './models/equipamento.model';
import { EquipamentoService } from './services/equipamento.service';
import { ToastrService } from 'ngx-toastr';
import { dataFuturaValidator } from '../shared/validators/data-futura.validator';

@Component({
  selector: 'app-equipamento',
  templateUrl: './equipamento.component.html'
})

export class EquipamentoComponent implements OnInit {
  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;

  constructor(
    private equipamentoService: EquipamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      numeroSerie: new FormControl("", [Validators.required, Validators.minLength(3)]),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      preco: new FormControl("", [Validators.required]),
      dataFabricacao: new FormControl("", [Validators.required, dataFuturaValidator()])
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Inserção";
  }

  get id() {
    return this.form.get("id");
  }

  get numeroSerie() {
    return this.form.get("numeroSerie");
  }

  get nome() {
    return this.form.get("nome");
  }

  get preco() {
    return this.form.get("preco");
  }

  get dataFabricacao() {
    return this.form.get("dataFabricacao");
  }

  public async gravar(modal: TemplateRef<any>, equipamento?: Equipamento) {
    this.form.reset();

    if(equipamento) {
      this.form.setValue(equipamento);
    }

    try {
      await this.modalService.open(modal).result;

      if(!equipamento) {
        await this.equipamentoService.inserir(this.form.value);
        this.toastr.success('Equipamento inserido com sucesso.', 'Inserção de Equipamento');
      }
      else{
        await this.equipamentoService.editar(this.form.value);
        this.toastr.success('Equipamento editado com sucesso.', 'Edição de Equipamento');
      }

    } catch (error: any) {

      if(error === "Ítem inválido" && error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao inserir o equipamento', 'Inserção de Equipamento')
      else if(error != "fechar" && error != "0" && error != "1") {
        this.toastr.error('Falha ao editar o equipamento', 'Edição de Equipamento')
      }

    }

  }

  public async excluir(equipamento: Equipamento) {
    try {
      await this.equipamentoService.excluir(equipamento);
      this.toastr.success('Equipamento excluído com sucesso.', 'Exclusão de Equipamento');

    } catch (error) {
      if(error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao excluír o equipamento.', 'Exclusão de Equipamento');
    }
  }

}
