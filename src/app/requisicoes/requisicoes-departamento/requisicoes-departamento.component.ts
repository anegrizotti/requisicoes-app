import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Movimentacao } from '../models/movimentacao.model';
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

  public funcionarioLogado: Funcionario;
  public requisicaoSelecionada: Requisicao;
  public listaStatus: string[] = ["Aberta", "Processando", "Não Autorizada", "Fechada"]
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private requisicaoService: RequisicaoService,
    private funcionarioService: FuncionarioService,
    private authService: AuthenticationService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      status: new FormControl("", [Validators.required]),
      descricao: new FormControl("", [Validators.required, Validators.minLength(5)]),
      funcionario: new FormControl(""),
      data: new FormControl("")
    })

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {
          this.funcionarioLogado = funcionario;
          this.requisicoes$ = this.requisicaoService.selecionarRequisicoesDepartamentoAtual(funcionario.departamentoId);
        })
    })

  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();
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

  get status() {
    return this.form.get("status");
  }

  private configurarValoresPadrao(): void {
    this.form.patchValue({
      funcionario: this.funcionarioLogado,
      status: this.requisicaoSelecionada?.status,
      data: new Date()
    })
  }


  public async gravar(modal: TemplateRef<any>, requisicao: Requisicao) {
    this.requisicaoSelecionada = requisicao;
    this.requisicaoSelecionada.movimentacoes = requisicao.movimentacoes ? requisicao.movimentacoes : [];

    this.form.reset();
    this.configurarValoresPadrao();

    try {
      await this.modalService.open(modal).result;

      if(this.form.dirty && this.form.valid) {
        this.atualizarRequisicao(this.form.value);
        await this.requisicaoService.editar(this.requisicaoSelecionada);
        this.toastr.success('Requisição movimentada com sucesso.', 'Movimentação de Requisição');
      }

    } catch (error: any) {

      if(error === "Ítem inválido" && error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao movimentar a requisição', 'Movimentação de Requisição')

      else if(error != "fechar" && error != "0" && error != "1") {
        this.toastr.error('Falha ao movimentar a requisição', 'Movimentação de Requisição')
      }

    }

  }

  private atualizarRequisicao(movimentacao: Movimentacao) {
    this.requisicaoSelecionada.movimentacoes.push(movimentacao);
    this.requisicaoSelecionada.status = this.status?.value;
    this.requisicaoSelecionada.ultimaAtualizacao = new Date();
  }

}
