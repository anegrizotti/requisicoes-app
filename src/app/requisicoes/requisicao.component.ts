import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { Funcionario } from '../funcionarios/models/funcionario.model';
import { FuncionarioService } from '../funcionarios/services/funcionario.service';
import { Requisicao } from './models/requisicao.model';
import { RequisicaoService } from './services/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html'
})
export class RequisicaoComponent implements OnInit {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  funcionarioLogado: Funcionario;
  public equipamentos$: Observable<Equipamento[]>;
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
      funcionario: new FormControl(""),
      funcionarioId: new FormControl(""),
      descricao: new FormControl(""),
      departamentoId: new FormControl(""),
      departamento: new FormControl(""),
      dataAbertura: new FormControl(""),
      equipamento: new FormControl(""),
      equipamentoId: new FormControl(""),

    })

    this.requisicoes$ = this.requisicaoService.selecionarTodos()
      .pipe(
        map(requisicoes => {
          return requisicoes
            .filter(r => r.funcionario?.email === this.funcionarioLogado.email);
        })
      )

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

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


  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();

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
        this.form.get("dataAbertura")?.setValue(new Date(Date.now()).toLocaleString());
        this.form.get("funcionarioId")?.setValue(this.authService.getUid());
        await this.requisicaoService.inserir(this.form.get("requisicao")?.value);
        this.toastr.success('Requisição inserida com sucesso.', 'Inserção de Requisição');
      }
      else{
        await this.requisicaoService.editar(this.form.get("requisicao")?.value);
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

  // public obterFuncionarioLogado() {
  //   this.authService.authUser()
  //     .subscribe(dados => {
  //       this.funcionarioService.selecionarFuncionarioLogado(dados?.email)
  //         .subscribe(funcionario => {
  //           this.funcionarioLogado = funcionario;
  //         })
  //     })
  // }

}
