import { Localizacao } from './Localizacao';

export interface Loja extends Localizacao {
  id: string;
  nome: string;
  categoria: string;
  latitude: number;
  longitude: number;
}
