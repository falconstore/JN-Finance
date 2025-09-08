
export interface Parcela {
  parcela: number;
  parcelaSemJuros: number;
  parcelaComJuros: number;
  valorPago: number | null;
  jurosPoupanca: number;
  jurosTotal: number;
  jurosValor: number;
  dataEnvioBoleto: string;
  dataVencimento: string;
  situacao: 'Pago' | 'À Vencer' | 'Vencida' | 'Cancelada';
}

export interface ImovelData {
  ively: Parcela[];
  renato: Parcela[];
}

export interface EditingCell {
  rowIndex: number;
  field: keyof Parcela;
}

export type TabType = 'ively' | 'renato';
