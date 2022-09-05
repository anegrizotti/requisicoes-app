import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Funcionario } from './models/funcionario.model';
import { FuncionarioService } from './services/funcionario.service';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html'
})
export class FuncionarioComponent implements OnInit {
  public funcionarios$: Observable<Funcionario[]>;
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.form = this.fb.group({

      funcionario: new FormGroup({
        id: new FormControl(""),
        nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
        email: new FormControl("", [Validators.required, Validators.email]),
        funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl("")
      }),
      senha: new FormControl("")
    })

    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Inserção";
  }

  get id() {
    return this.form.get("funcionario.id");
  }

  get nome() {
    return this.form.get("funcionario.nome");
  }

  get email() {
    return this.form.get("funcionario.email");
  }

  get funcao() {
    return this.form.get("funcionario.funcao");
  }

  get departamentoId() {
    return this.form.get("funcionario.departamentoId");
  }

  get departamento() {
    return this.form.get("funcionario.departamento");
  }

  get senha() {
    return this.form.get("senha");
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if(funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
        ...funcionario,
        departamento
      }

      this.form.get("funcionario")?.setValue(funcionarioCompleto);
    }

    try {
      await this.modalService.open(modal).result;

      if(!funcionario) {
        await this.authService.cadastrar(this.email?.value, this.senha?.value);
        await this.funcionarioService.inserir(this.form.get("funcionario")?.value);
        await this.authService.logout();
        await this.router.navigate(["/login"]);
        this.toastr.success('Funcionário inserido com sucesso.', 'Inserção de Funcionário');
      }
      else{
        await this.funcionarioService.editar(this.form.get("funcionario")?.value);
        this.toastr.success('Funcionário editado com sucesso.', 'Edição de Funcionário');
      }

    } catch (error: any) {

      if(error === "Ítem inválido" && error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao inserir o funcionário', 'Inserção de Funcionário')
      else if(error != "fechar" && error != "0" && error != "1") {
        this.toastr.error('Falha ao editar o Funcionário', 'Edição de Funcionário')
      }

    }

  }

  public async excluir(funcionario: Funcionario) {
    try {
      await this.funcionarioService.excluir(funcionario);
      this.toastr.success('Funcionário excluído com sucesso.', 'Exclusão de Funcionário');

    } catch (error) {
      if(error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Falha ao excluír o funcionário.', 'Exclusão de Funcionário');
    }
  }

}
