import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Edit2, Check, Save } from 'lucide-react';
import { Parcela, ImovelData, EditingCell, TabType } from '@/types';
// IMPORTANTE: Importar os dados completos dos arquivos de dados
import { database, imoveisInfo } from '@/data';

const JNFinancasSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ively');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<ImovelData>({
    ively: [],
    renato: []
  });
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');

  // ============================================
  // 🔄 CARREGAMENTO DOS DADOS COMPLETOS
  // ============================================
  useEffect(() => {
    console.log('🚀 Carregando dados completos da Ively e Renato...');
    
    // Simulando carregamento (pode ser removido em produção)
    const timer = setTimeout(() => {
      // Carregar dados completos dos arquivos
      setData({
        ively: database.ively,  // 144 parcelas completas
        renato: database.renato // 144 parcelas completas
      });
      setLoading(false);
      console.log('✅ Dados carregados com sucesso!');
      console.log(`📊 Ively: ${database.ively.length} parcelas`);
      console.log(`📊 Renato: ${database.renato.length} parcelas`);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ============================================
  // 🧮 FUNÇÕES DE CÁLCULO
  // ============================================
  const recalculateFromParcela = (newData: ImovelData, imovel: TabType, startIndex: number) => {
    console.log(`🔄 Recalculando parcelas a partir da ${startIndex + 1} para ${imovel}`);
    
    const parcelas = newData[imovel];
    
    for (let i = startIndex; i < parcelas.length - 1; i++) {
      const currentParcela = parcelas[i];
      const nextParcela = parcelas[i + 1];
      
      // Recalcular parcela atual
      currentParcela.jurosTotal = 0.005 + currentParcela.jurosPoupanca;
      currentParcela.jurosValor = currentParcela.parcelaSemJuros * currentParcela.jurosTotal;
      currentParcela.parcelaComJuros = currentParcela.parcelaSemJuros + currentParcela.jurosValor;
      
      // Próxima parcela sem juros = parcela com juros atual
      nextParcela.parcelaSemJuros = currentParcela.parcelaComJuros;
    }
    
    // Recalcular última parcela
    const lastIndex = parcelas.length - 1;
    const lastParcela = parcelas[lastIndex];
    lastParcela.jurosTotal = 0.005 + lastParcela.jurosPoupanca;
    lastParcela.jurosValor = lastParcela.parcelaSemJuros * lastParcela.jurosTotal;
    lastParcela.parcelaComJuros = lastParcela.parcelaSemJuros + lastParcela.jurosValor;
  };

  // ============================================
  // 📊 ESTATÍSTICAS
  // ============================================
  const currentData = data[activeTab];
  const stats = {
    total: currentData.length,
    pagas: currentData.filter(p => p.situacao === 'Pago').length,
    aVencer: currentData.filter(p => p.situacao === 'À Vencer').length,
    vencidas: currentData.filter(p => p.situacao === 'Vencida').length,
    valorTotal: currentData.reduce((sum, p) => sum + p.parcelaComJuros, 0),
    valorPago: currentData.filter(p => p.valorPago !== null).reduce((sum, p) => sum + (p.valorPago || 0), 0),
    totalJuros: currentData.reduce((sum, p) => sum + p.jurosValor, 0)
  };
  
  stats.valorRestante = stats.valorTotal - stats.valorPago;
  stats.percentualPago = stats.total > 0 ? Math.round((stats.pagas / stats.total) * 100) : 0;

  // ============================================
  // 🔍 FILTROS
  // ============================================
  const filteredData = currentData.filter(parcela => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      parcela.parcela.toString().includes(term) ||
      parcela.situacao.toLowerCase().includes(term) ||
      parcela.parcelaComJuros.toFixed(2).includes(term) ||
      parcela.dataVencimento.includes(term)
    );
  });

  // ============================================
  // ✏️ FUNÇÕES DE EDIÇÃO
  // ============================================
  const startEditing = (rowIndex: number, field: keyof Parcela) => {
    const allowedFields: (keyof Parcela)[] = ['jurosPoupanca', 'dataEnvioBoleto', 'dataVencimento', 'situacao'];
    
    if (!allowedFields.includes(field)) {
      console.log(`❌ Campo ${field} não é editável`);
      return;
    }
    
    console.log(`✏️ Editando: Parcela ${rowIndex + 1}, Campo: ${field}`);
    setEditingCell({ rowIndex, field });
    
    const currentValue = currentData[rowIndex][field];
    if (field === 'jurosPoupanca') {
      setEditValue(currentValue ? (currentValue * 100).toFixed(4) : '0.0000');
    } else if (field === 'dataEnvioBoleto' || field === 'dataVencimento') {
      setEditValue(currentValue || '');
    } else {
      setEditValue(currentValue?.toString() || '');
    }
  };

  const cancelEditing = () => {
    console.log('❌ Edição cancelada');
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const { rowIndex, field } = editingCell;
    console.log(`💾 Salvando: Parcela ${rowIndex + 1}, ${field} = "${editValue}"`);
    
    const newData = JSON.parse(JSON.stringify(data)) as ImovelData;
    let processedValue: any = editValue;
    
    if (field === 'jurosPoupanca') {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        alert('Por favor, digite um valor numérico válido para Juros Poupança');
        return;
      }
      processedValue = numValue / 100;
      newData[activeTab][rowIndex][field] = processedValue;
      recalculateFromParcela(newData, activeTab, rowIndex);
    } else if (field === 'dataEnvioBoleto' || field === 'dataVencimento') {
      newData[activeTab][rowIndex][field] = processedValue;
    } else {
      newData[activeTab][rowIndex][field] = processedValue;
    }
    
    setData(newData);
    setEditingCell(null);
    setEditValue('');
    console.log('✅ Dados salvos com sucesso!');
  };

  // ============================================
  // 🎨 FORMATAÇÃO
  // ============================================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(4)}%`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'À Vencer': return 'bg-blue-100 text-blue-800';
      case 'Vencida': return 'bg-red-100 text-red-800';
      case 'Cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ============================================
  // 🎯 RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700">Carregando dados da Ively e Renato...</p>
          <p className="text-sm text-gray-500">Aguarde enquanto carregamos todas as 144 parcelas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className={`${sidebarOpen ? 'block' : 'hidden'} text-2xl font-bold text-gray-900`}>
              JN Finanças
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <p className={`${sidebarOpen ? 'block' : 'hidden'} text-sm text-gray-600 mt-2`}>
            Sistema de Controle Financeiro
          </p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {(['ively', 'renato'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={20} className="flex-shrink-0" />
                {sidebarOpen && (
                  <div className="ml-3 text-left">
                    <div className="font-medium capitalize">
                      {tab === 'ively' ? 'Ively 14(A)' : 'Renato 14(B)'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data[tab].length} parcelas
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <p className={`${sidebarOpen ? 'block' : 'hidden'} text-xs text-gray-500 text-center`}>
            Dados carregados: {data.ively.length + data.renato.length} parcelas totais
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                Imóvel {activeTab === 'ively' ? '14(A) Ively' : '14(B) Renato'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ✅ Dados completos carregados - {stats.total} parcelas de 144 disponíveis
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar parcela, valor ou situação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
                />
              </div>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={() => alert('🔄 Integração Firebase em desenvolvimento')}
              >
                <Save size={16} className="mr-2" />
                Salvar
              </button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                onClick={() => alert('📊 Exportação Excel/PDF em desenvolvimento')}
              >
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total de Parcelas</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Parcelas Pagas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.pagas}</p>
                  <p className="text-xs text-green-600">{stats.percentualPago}% concluído</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">À Vencer</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.aVencer}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-900">{stats.vencidas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Valores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Valor Total</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(stats.valorTotal)}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-emerald-600">Valor Pago</p>
                  <p className="text-xl font-bold text-emerald-900">{formatCurrency(stats.valorPago)}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Valor Restante</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(stats.valorRestante)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcela
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sem Juros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Com Juros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Juros %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((parcela, index) => (
                      <tr key={parcela.parcela} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parcela.parcela}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(parcela.parcelaSemJuros)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(parcela.parcelaComJuros)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parcela.valorPago ? formatCurrency(parcela.valorPago) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {editingCell?.rowIndex === index && editingCell?.field === 'jurosPoupanca' ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="0.0000"
                                />
                                <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                                  <Check size={16} />
                                </button>
                                <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>{formatPercentage(parcela.jurosPoupanca)}</span>
                                <button
                                  onClick={() => startEditing(index, 'jurosPoupanca')}
                                  className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {editingCell?.rowIndex === index && editingCell?.field === 'dataVencimento' ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="date"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                                  <Check size={16} />
                                </button>
                                <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>{formatDate(parcela.dataVencimento)}</span>
                                <button
                                  onClick={() => startEditing(index, 'dataVencimento')}
                                  className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {editingCell?.rowIndex === index && editingCell?.field === 'situacao' ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="Pago">Pago</option>
                                  <option value="À Vencer">À Vencer</option>
                                  <option value="Vencida">Vencida</option>
                                  <option value="Cancelada">Cancelada</option>
                                </select>
                                <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                                  <Check size={16} />
                                </button>
                                <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSituacaoColor(parcela.situacao)}`}>
                                  {parcela.situacao}
                                </span>
                                <button
                                  onClick={() => startEditing(index, 'situacao')}
                                  className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {filteredData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma parcela encontrada com os critérios de busca.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JNFinancasSystem;
