import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
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
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';

@Component({
  selector: 'app-requisicoes-funcionario',
  templateUrl: './requisicoes-funcionario.component.html'
})
export class RequisicoesFuncionarioComponent implements OnInit, OnDestroy {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;

  private processoAutenticado$: Subscription;

  funcionarioLogado: Funcionario;
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
      id: new FormControl(""),
      descricao: new FormControl("", [Validators.required, Validators.minLength(5)]),
      dataAbertura: new FormControl(""),

      funcionario: new FormControl(""),
      funcionarioId: new FormControl(""),

      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),

      equipamento: new FormControl(""),
      equipamentoId: new FormControl(""),

      status: new FormControl(""),
      ultimaAtualizacao: new FormControl(""),
      movimentacoes: new FormControl(""),
    })

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.requisicoes$ = this.requisicaoService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario =>
          this.funcionarioLogado = funcionario);
    });

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

  private configurarValoresPadrao(): void {
    this.form.get("status")?.setValue("Aberta");
    this.form.get("dataAbertura")?.setValue(new Date());
    this.form.get("ultimaAtualizacao")?.setValue(new Date());
    this.form.get("equipamentoId")?.setValue(null);
    this.form.get("funcionarioId")?.setValue(this.funcionarioLogado.id);
  }


  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();
    this.configurarValoresPadrao();

    if(requisicao) {
      const departamento = requisicao.departamento ? requisicao.departamento : null;
      const funcionario = requisicao.funcionario ? requisicao.funcionario : null;
      const equipamento = requisicao.equipamento ? requisicao.equipamento : null;

      const requisicaoCompleta = {
        ...requisicao,
        departamento,
        funcionario,
        equipamento
      }

      this.form.get("requisicao")?.setValue(requisicaoCompleta);
    }

    try {
      await this.modalService.open(modal).result;

      if(!requisicao) {
        await this.requisicaoService.inserir(this.form.value);
        this.toastr.success('Requisição inserida com sucesso.', 'Inserção de Requisição');
      }
      else{
        await this.requisicaoService.editar(this.form.value);
        this.toastr.success('Requisição editada com sucesso.', 'Edição de Requisição');
      }

    } catch (error: any) {

      if(error === "Ítem inválido" && error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao inserir a requisição', 'Inserção de Requisição')

      else if(error != "fechar" && error != "0" && error != "1") {
        this.toastr.error('Falha ao editar a requisição', 'Edição de Requisição')
      }

    }

  }

  public async excluir(requisicao: Requisicao) {
    try {
      await this.requisicaoService.excluir(requisicao);
      this.toastr.success('Requisição excluída com sucesso.', 'Exclusão de Requisição');

    } catch (error) {
      if(error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao excluír a requisição.', 'Exclusão de Requisição');
    }
  }

}
