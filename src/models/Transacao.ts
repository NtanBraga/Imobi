import { TipoTransacao } from './Enums';

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  quantidade: number;
  data: Date;
}
