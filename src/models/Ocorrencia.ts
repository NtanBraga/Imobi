import { StatusOcorrencia, TipoOcorrencia } from './Enums';
import { Localizacao } from './Localizacao';

export interface Ocorrencia extends Localizacao {
  id: string;
  tipo: TipoOcorrencia;
  descricao: string;
  status: StatusOcorrencia;
  dataCriacao: Date;
}
