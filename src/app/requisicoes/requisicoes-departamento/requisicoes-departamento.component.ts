import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';

@Component({
  selector: 'app-requisicoes-departamento',
  templateUrl: './requisicoes-departamento.component.html'
})
export class RequisicoesDepartamentoComponent implements OnInit {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;

  private processoAutenticado$: Subscription;

  funcionarioLogadoId: string;
  departamentoFuncionarioLogadoId: string;
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private requisicaoService: RequisicaoService,
    private funcionarioService: FuncionarioService,
    private authService: AuthenticationService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      descricao: new FormControl("", [Validators.required, Validators.minLength(5)]),
      dataAbertura: new FormControl(""),

      funcionario: new FormControl(""),
      funcionarioId: new FormControl(""),

      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),

      equipamento: new FormControl(""),
      equipamentoId: new FormControl(""),
    })

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {
          this.departamentoFuncionarioLogadoId = funcionario.departamentoId
          this.requisicoes$ = this.requisicaoService.selecionarRequisicoesDepartamentoAtual(this.departamentoFuncionarioLogadoId);
        })
    })

  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();
  }

  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Inserção";
  }

  get id() {
    return this.form.get("id");
  }

  get funcionarioId() {
    return this.form.get("funcionarioId");
  }

  get funcionario() {
    return this.form.get("funcionario");
  }

  get descricao() {
    return this.form.get("descricao");
  }

  get departamentoId() {
    return this.form.get("departamentoId");
  }

  get departamento() {
    return this.form.get("departamento");
  }

  get dataAbertura() {
    return this.form.get("dataAbertura");
  }

  get equipamento() {
    return this.form.get("equipamento");
  }

  get equipamentoId() {
    return this.form.get("equipamentoId");
  }

  public visualizar() {

  }

  public movimentar() {

  }

}
