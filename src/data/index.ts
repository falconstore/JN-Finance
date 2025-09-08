import { ImovelData } from '../types';
import { ivelyDatabase, ivelyInfo } from './ively-database';
import { renatoDatabase, renatoInfo } from './renato-database';

// ============================================
// 🏠 BANCO DE DADOS PRINCIPAL JN FINANÇAS
// Combinando todos os imóveis
// ============================================

export const database: ImovelData = {
  ively: ivelyDatabase,
  renato: renatoDatabase
};

// Informações dos imóveis
export const imoveisInfo = {
  ively: ivelyInfo,
  renato: renatoInfo
};

// ============================================
// 📊 FUNÇÕES UTILITÁRIAS
// ============================================

export const getTotalParcelas = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].length;
};

export const getParcelasPagas = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].filter(p => p.situacao === 'Pago').length;
};

export const getParcelasVencidas = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].filter(p => p.situacao === 'Vencida').length;
};

export const getParcelasAVencer = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].filter(p => p.situacao === 'À Vencer').length;
};

export const getValorTotalPago = (imovel: 'ively' | 'renato'): number => {
  return database[imovel]
    .filter(p => p.valorPago !== null)
    .reduce((sum, p) => sum + (p.valorPago || 0), 0);
};

export const getValorTotalRestante = (imovel: 'ively' | 'renato'): number => {
  return database[imovel]
    .filter(p => p.valorPago === null)
    .reduce((sum, p) => sum + p.parcelaComJuros, 0);
};

export const getValorTotal = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].reduce((sum, p) => sum + p.parcelaComJuros, 0);
};

export const getTotalJuros = (imovel: 'ively' | 'renato'): number => {
  return database[imovel].reduce((sum, p) => sum + (p.jurosValor || 0), 0);
};

// Função para buscar uma parcela específica
export const getParcela = (imovel: 'ively' | 'renato', numeroParcela: number) => {
  return database[imovel].find(p => p.parcela === numeroParcela);
};

// Função para filtrar parcelas por situação
export const getParcelasPorSituacao = (imovel: 'ively' | 'renato', situacao: string) => {
  return database[imovel].filter(p => p.situacao === situacao);
};

// Função para obter estatísticas gerais
export const getEstatisticas = (imovel: 'ively' | 'renato') => {
  const parcelas = database[imovel];
  
  return {
    total: parcelas.length,
    pagas: getParcelasPagas(imovel),
    aVencer: getParcelasAVencer(imovel),
    vencidas: getParcelasVencidas(imovel),
    valorTotal: getValorTotal(imovel),
    valorPago: getValorTotalPago(imovel),
    valorRestante: getValorTotalRestante(imovel),
    totalJuros: getTotalJuros(imovel),
    percentualPago: Math.round((getParcelasPagas(imovel) / parcelas.length) * 100)
  };
};

// ============================================
// 🔄 FUNCÕES DE ATUALIZAÇÃO (FUTURO FIREBASE)
// ============================================

export const atualizarParcela = async (
  imovel: 'ively' | 'renato', 
  numeroParcela: number, 
  dadosAtualizados: Partial<any>
) => {
  // Aqui será implementada a atualização no Firebase
  console.log(`Atualizando parcela ${numeroParcela} do ${imovel}:`, dadosAtualizados);
  
  // Por enquanto, apenas log
  return Promise.resolve();
};

export const salvarTodasAlteracoes = async () => {
  // Salvar todas as alterações no Firebase
  console.log('Salvando todas as alterações no Firebase...');
  return Promise.resolve();
};

// Exportações principais
export * from './ively-database';
export * from './renato-database';

// ================================
// 📁 src/data/ively-database.ts
// ================================
import { Parcela } from '../types';
