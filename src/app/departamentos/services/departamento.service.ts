import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Departamento } from '../models/departamento.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private registros: AngularFirestoreCollection<Departamento>;

  constructor(private firestore: AngularFirestore, private toastr: ToastrService) {
    this.registros = this.firestore.collection<Departamento>("departamentos");
  }

  public async inserir(registro: Departamento): Promise<any> {
    if(!registro)
      return Promise.reject("Ítem inválido");

    this.toastr.success('Departamento inserido com sucesso.', 'Inserção de Departamento');

    const res = await this.registros.add(registro);

    registro.id = res.id;
    this.registros.doc(res.id).set(registro);
  }

  public async editar(registro: Departamento): Promise<void> {
    this.toastr.success('Departamento editado com sucesso.', 'Edição de Departamento');
    return this.registros.doc(registro.id).set(registro);
  }

  public excluir(registro: Departamento): Promise<void>  {
    this.toastr.success('Departamento excluído com sucesso.', 'Exclusão de Departamento');
    return this.registros.doc(registro.id).delete();
  }

  public selecionarTodos(): Observable<Departamento[]> {
    return this.registros.valueChanges();
  }

}
