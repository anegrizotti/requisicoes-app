import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Equipamento } from '../models/equipamento.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  private registros: AngularFirestoreCollection<Equipamento>;

  constructor(private firestore: AngularFirestore, private toastr: ToastrService) {
    this.registros = this.firestore.collection<Equipamento>("equipamentos");
   }

   public async inserir(registro: Equipamento): Promise<any> {
    if(!registro)
      return Promise.reject("Ítem inválido");

    this.toastr.success('Equipamento inserido com sucesso.', 'Inserção de Equipamento');

    const res = await this.registros.add(registro);

    registro.id = res.id;
    this.registros.doc(res.id).set(registro);
  }

  public async editar(registro: Equipamento): Promise<void> {
    this.toastr.success('Equipamento editado com sucesso.', 'Edição de Equipamento');
    return this.registros.doc(registro.id).set(registro);
  }

  public excluir(registro: Equipamento): Promise<void>  {
    this.toastr.success('Equipamento excluído com sucesso.', 'Exclusão de Equipamento');
    return this.registros.doc(registro.id).delete();
  }

   public selecionarTodos(): Observable<Equipamento[]> {
    return this.registros.valueChanges();
  }

}
