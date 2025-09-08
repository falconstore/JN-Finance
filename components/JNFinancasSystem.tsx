import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Edit2, Check, Save } from 'lucide-react';
import { Parcela, ImovelData, EditingCell, TabType } from '../types';
// IMPORTANTE: Importar os dados usando path relativo
import { database, imoveisInfo, getEstatisticas } from '../data';

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
    
    try {
      // Carregar dados completos dos arquivos
      console.log('📊 Dados Ively:', database.ively.length, 'parcelas');
      console.log('📊 Dados Renato:', database.renato.length, 'parcelas');
      
      setData({
        ively: database.ively,  // 144 parcelas completas
        renato: database.renato // 144 parcelas completas
      });
      
      setLoading(false);
      console.log('✅ Dados carregados com sucesso!');
      console.log('📈 Estatísticas Ively:', getEstatisticas('ively'));
      console.log('📈 Estatísticas Renato:', getEstatisticas('renato'));
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoading(false);
    }
  }, []);

  // ============================================
  // 📝 FUNÇÕES DE EDIÇÃO
  // ============================================
  const startEditing = (rowIndex: number, field: keyof Parcela, currentValue?: any) => {
    setEditingCell({ rowIndex, field });
    setEditValue(currentValue?.toString() || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const { rowIndex, field } = editingCell;
    const updatedData = { ...data };
    const parcelas = [...updatedData[activeTab]];
    
    // Converter valor conforme o tipo do campo
    let newValue: any = editValue;
    
    if (field === 'jurosPoupanca' || field === 'jurosTotal' || field === 'jurosValor' || 
        field === 'parcelaSemJuros' || field === 'parcelaComJuros' || field === 'valorPago') {
      newValue = parseFloat(editValue) || 0;
    }
    
    parcelas[rowIndex] = {
      ...parcelas[rowIndex],
      [field]: newValue
    };
    
    // Se alterou juros poupança, recalcular juros total e valor dos juros
    if (field === 'jurosPoupanca') {
      const parcela = parcelas[rowIndex];
      parcela.jurosTotal = newValue + 0.005; // 0.5% fixo + juros poupança
      parcela.jurosValor = parcela.parcelaSemJuros * parcela.jurosTotal;
      parcela.parcelaComJuros = parcela.parcelaSemJuros + parcela.jurosValor;
    }
    
    updatedData[activeTab] = parcelas;
    setData(updatedData);
    setEditingCell(null);
    setEditValue('');
    
    console.log(`✅ Parcela ${parcelas[rowIndex].parcela} atualizada:`, field, '→', newValue);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // ============================================
  // 🔍 FILTRO E BUSCA
  // ============================================
  const filteredData = data[activeTab]?.filter(parcela => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      parcela.parcela.toString().includes(searchLower) ||
      parcela.situacao.toLowerCase().includes(searchLower) ||
      parcela.dataVencimento.includes(searchTerm) ||
      parcela.dataEnvioBoleto.includes(searchTerm)
    );
  }) || [];

  // ============================================
  // 🎨 FUNÇÕES DE FORMATAÇÃO
  // ============================================
  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getSituacaoColor = (situacao: string): string => {
    switch (situacao) {
      case 'Pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'À Vencer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vencida': return 'bg-red-100 text-red-800 border-red-200';
      case 'Cancelada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ============================================
  // 📊 CALCULAR ESTATÍSTICAS
  // ============================================
  const stats = React.useMemo(() => {
    const currentData = data[activeTab] || [];
    return {
      total: currentData.length,
      pagas: currentData.filter(p => p.situacao === 'Pago').length,
      aVencer: currentData.filter(p => p.situacao === 'À Vencer').length,
      vencidas: currentData.filter(p => p.situacao === 'Vencida').length,
      valorTotal: currentData.reduce((sum, p) => sum + p.parcelaComJuros, 0),
      valorPago: currentData.filter(p => p.valorPago !== null).reduce((sum, p) => sum + (p.valorPago || 0), 0),
      totalJuros: currentData.reduce((sum, p) => sum + p.jurosValor, 0),
      percentualPago: currentData.length > 0 ? Math.round((currentData.filter(p => p.situacao === 'Pago').length / currentData.length) * 100) : 0
    };
  }, [data, activeTab]);

  // ============================================
  // 🖊️ RENDERIZAR CAMPO EDITÁVEL
  // ============================================
  const renderEditableCell = (value: any, rowIndex: number, field: keyof Parcela) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const isEditableField = ['jurosPoupanca', 'dataEnvioBoleto', 'dataVencimento', 'situacao'].includes(field);
    
    if (!isEditableField) {
      return <span>{value}</span>;
    }

    if (isEditing) {
      if (field === 'situacao') {
        return (
          <div className="flex items-center space-x-2">
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              autoFocus
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
        );
      }

      return (
        <div className="flex items-center space-x-2">
          <input
            type={field.includes('data') ? 'date' : field === 'jurosPoupanca' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            style={{ width: field.includes('data') ? '140px' : '100px' }}
            step={field === 'jurosPoupanca' ? '0.000001' : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
          />
          <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
            <Check size={16} />
          </button>
          <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      );
    }

    // Renderização normal com botão de edição
    return (
      <div className="group flex items-center justify-between">
        <span className={
          field === 'jurosPoupanca' ? 'text-orange-600 font-medium' :
          field === 'situacao' ? `px-2 py-1 rounded-full text-xs font-medium ${getSituacaoColor(value)}` :
          'text-gray-900'
        }>
          {field === 'jurosPoupanca' ? formatPercentage(value) :
           field.includes('data') ? formatDate(value) :
           value}
        </span>
        <button
          onClick={() => startEditing(rowIndex, field, value)}
          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 ml-2"
        >
          <Edit2 size={14} />
        </button>
      </div>
    );
  };

  // ============================================
  // 🖨️ GERAR RECIBO
  // ============================================
  const generateReceipt = (parcela: Parcela) => {
    console.log('📄 Gerando recibo para parcela:', parcela.parcela);
    // Implementar geração de PDF aqui
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex-shrink-0`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl text-gray-800 ${!sidebarOpen && 'hidden'}`}>
              JN Finanças
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <button
              onClick={() => setActiveTab('ively')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'ively' 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="mr-3" size={20} />
              {sidebarOpen && (
                <div>
                  <div className="font-medium">Ively</div>
                  <div className="text-xs text-gray-500">Apto 14(A)</div>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('renato')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'renato' 
                  ? 'bg-green-100 text-green-700 border-l-4 border-green-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="mr-3" size={20} />
              {sidebarOpen && (
                <div>
                  <div className="font-medium">Renato</div>
                  <div className="text-xs text-gray-500">Apto 14(B)</div>
                </div>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'ively' ? 'Ively - Apartamento 14(A)' : 'Renato - Apartamento 14(B)'}
              </h2>
              <p className="text-gray-600 mt-1">
                RESIDENCIAL OLYMPO - {stats.total} parcelas ({stats.percentualPago}% concluído)
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar parcela..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <FileText className="text-blue-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <FileText className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Pagas</p>
                  <p className="text-xl font-bold text-green-600">{stats.pagas}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <FileText className="text-yellow-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">À Vencer</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.aVencer}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <FileText className="text-red-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-xl font-bold text-red-600">{stats.vencidas}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <DollarSign className="text-purple-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.valorTotal)}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center">
                <DollarSign className="text-emerald-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Pago</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.valorPago)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sem Juros
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Com Juros
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juros Poupança
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juros Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Juros
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Envio Boleto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Situação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((parcela, index) => (
                    <tr key={parcela.parcela} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parcela.parcela}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(parcela.parcelaSemJuros)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(parcela.parcelaComJuros)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={parcela.valorPago ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {formatCurrency(parcela.valorPago)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderEditableCell(parcela.jurosPoupanca, index, 'jurosPoupanca')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-700 font-medium">
                        {formatPercentage(parcela.jurosTotal)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(parcela.jurosValor)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderEditableCell(parcela.dataEnvioBoleto, index, 'dataEnvioBoleto')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderEditableCell(parcela.dataVencimento, index, 'dataVencimento')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderEditableCell(parcela.situacao, index, 'situacao')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => generateReceipt(parcela)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium transition-all hover:shadow-md"
                        >
                          <FileText size={16} className="mr-1" />
                          Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer da Tabela */}
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredData.length} de {data[activeTab]?.length || 0} parcelas
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    Total a Receber: <span className="font-semibold text-blue-600">{formatCurrency(stats.valorTotal - stats.valorPago)}</span>
                  </span>
                </div>
              </div>
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
  );
};

export default JNFinancasSystem;
