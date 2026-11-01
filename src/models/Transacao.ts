import { TipoOcorrencia } from './Enums';

export interface Transacao {
  id: string;
  tipo: TipoOcorrencia;
  quantidade: number;
  data: Date;
}
