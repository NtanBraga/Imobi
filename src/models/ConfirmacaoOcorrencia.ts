import { TipoOcorrencia } from './Enums';

export interface ConfirmacaoOcorrencia {
  id: string;
  usuarioId: string;
  tipo: TipoOcorrencia;
  data: Date;
}
