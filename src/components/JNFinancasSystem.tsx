import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Mail, Edit2, Check, XIcon, Save } from 'lucide-react';
import { Parcela, ImovelData, EditingCell, TabType } from '../types';

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

  // Dados de exemplo baseados na estrutura completa do Excel com cálculos corretos
  const sampleData: ImovelData = {
    ively: [
      {
        parcela: 1,
        parcelaSemJuros: 1493.06,
        parcelaComJuros: 1506.07, // 1493.06 + (1493.06 × 0.008715)
        valorPago: 1506.07,
        jurosPoupanca: 0.003715, // Juros da poupança variável
        jurosTotal: 0.008715, // 0.5% + 0.3715% = 0.8715%
        jurosValor: 13.01, // 1493.06 × 0.008715
        dataEnvioBoleto: '2019-09-11',
        dataVencimento: '2019-09-18',
        situacao: 'Pago'
      },
      {
        parcela: 2,
        parcelaSemJuros: 1506.07, // Valor anterior com juros
        parcelaComJuros: 1518.77, // 1506.07 + (1506.07 × 0.008434)
        valorPago: 1518.77,
        jurosPoupanca: 0.003434, // Juros da poupança do mês
        jurosTotal: 0.008434, // 0.5% + 0.3434% = 0.8434%
        jurosValor: 12.70, // 1506.07 × 0.008434
        dataEnvioBoleto: '2019-10-21',
        dataVencimento: '2019-10-27',
        situacao: 'Pago'
      },
      {
        parcela: 3,
        parcelaSemJuros: 1518.77, // Valor anterior com juros
        parcelaComJuros: 1531.58, // 1518.77 + (1518.77 × 0.008434)
        valorPago: 1531.58,
        jurosPoupanca: 0.003434,
        jurosTotal: 0.008434, // 0.5% + 0.3434% = 0.8434%
        jurosValor: 12.81, // 1518.77 × 0.008434
        dataEnvioBoleto: '2019-11-18',
        dataVencimento: '2019-11-27',
        situacao: 'Pago'
      },
      {
        parcela: 4,
        parcelaSemJuros: 1531.58, // Valor anterior com juros
        parcelaComJuros: 1543.21, // 1531.58 + (1531.58 × 0.007588)
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588, // 0.5% + 0.2588% = 0.7588%
        jurosValor: 11.62, // 1531.58 × 0.007588
        dataEnvioBoleto: '2019-12-16',
        dataVencimento: '2019-12-27',
        situacao: 'À Vencer'
      },
      {
        parcela: 5,
        parcelaSemJuros: 1543.21, // Valor anterior com juros
        parcelaComJuros: 1555.89, // 1543.21 + (1543.21 × 0.007588)
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588, // 0.5% + 0.2588% = 0.7588%
        jurosValor: 12.68, // 1543.21 × 0.007588
        dataEnvioBoleto: '2020-01-16',
        dataVencimento: '2020-01-27',
        situacao: 'À Vencer'
      },
      {
        parcela: 6,
        parcelaSemJuros: 1555.89, // Valor anterior com juros
        parcelaComJuros: 1568.45, // 1555.89 + (1555.89 × 0.007588)
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588, // 0.5% + 0.2588% = 0.7588%
        jurosValor: 12.56, // 1555.89 × 0.007588
        dataEnvioBoleto: '2020-02-16',
        dataVencimento: '2020-02-27',
        situacao: 'Vencida'
      }
    ],
    renato: [
      {
        parcela: 1,
        parcelaSemJuros: 1618.05,
        parcelaComJuros: 1632.15, // 1618.05 + (1618.05 × 0.008715)
        valorPago: 1632.15,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715, // 0.5% + 0.3715% = 0.8715%
        jurosValor: 14.10, // 1618.05 × 0.008715
        dataEnvioBoleto: '2019-08-15',
        dataVencimento: '2019-08-22',
        situacao: 'Pago'
      },
      {
        parcela: 2,
        parcelaSemJuros: 1632.15, // Valor anterior com juros
        parcelaComJuros: 1646.38, // 1632.15 + (1632.15 × 0.008715)
        valorPago: 1646.38,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715, // 0.5% + 0.3715% = 0.8715%
        jurosValor: 14.22, // 1632.15 × 0.008715
        dataEnvioBoleto: '2019-09-17',
        dataVencimento: '2019-09-24',
        situacao: 'Pago'
      },
      {
        parcela: 3,
        parcelaSemJuros: 1646.38, // Valor anterior com juros
        parcelaComJuros: 1660.73, // 1646.38 + (1646.38 × 0.008715)
        valorPago: null,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715, // 0.5% + 0.3715% = 0.8715%
        jurosValor: 14.35, // 1646.38 × 0.008715
        dataEnvioBoleto: '2019-10-17',
        dataVencimento: '2019-10-24',
        situacao: 'À Vencer'
      },
      {
        parcela: 4,
        parcelaSemJuros: 1660.73, // Valor anterior com juros
        parcelaComJuros: 1675.21, // 1660.73 + (1660.73 × 0.008715)
        valorPago: null,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715, // 0.5% + 0.3715% = 0.8715%
        jurosValor: 14.48, // 1660.73 × 0.008715
        dataEnvioBoleto: '2019-11-17',
        dataVencimento: '2019-11-24',
        situacao: 'Vencida'
      }
    ]
  };

  useEffect(() => {
    // Simular carregamento dos dados
    setTimeout(() => {
      setData(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  const recalculateFromParcela = (newData: ImovelData, tabName: TabType, startIndex: number) => {
    const parcelas = newData[tabName];
    
    for (let i = startIndex; i < parcelas.length; i++) {
      const currentParcela = parcelas[i];
      
      // Se não é a primeira parcela, pega o valor com juros da parcela anterior
      if (i > 0) {
        currentParcela.parcelaSemJuros = parcelas[i - 1].parcelaComJuros;
      }
      
      // Calcula juros total = 0.5% (fixo) + Juros Poupança
      const juroFixo = 0.005; // 0.5%
      const jurosPoupanca = currentParcela.jurosPoupanca || 0;
      currentParcela.jurosTotal = juroFixo + jurosPoupanca;
      
      // Calcula valor dos juros em reais
      currentParcela.jurosValor = currentParcela.parcelaSemJuros * currentParcela.jurosTotal;
      
      // Calcula parcela com juros
      currentParcela.parcelaComJuros = currentParcela.parcelaSemJuros + currentParcela.jurosValor;
      
      // Debug para verificar
      console.log(`Parcela ${currentParcela.parcela}:`, {
        parcelaSemJuros: currentParcela.parcelaSemJuros,
        jurosPoupanca: jurosPoupanca,
        jurosTotal: currentParcela.jurosTotal,
        jurosValor: currentParcela.jurosValor,
        parcelaComJuros: currentParcela.parcelaComJuros
      });
    }
  };

  const startEditing = (rowIndex: number, field: keyof Parcela, currentValue: any) => {
    setEditingCell({ rowIndex, field });
    
    // Formatar o valor inicial baseado no tipo de campo
    if (field === 'jurosPoupanca') {
      setEditValue((currentValue * 100).toFixed(4)); // Converter para percentual
    } else if (field === 'dataEnvioBoleto' || field === 'dataVencimento') {
      setEditValue(currentValue || '');
    } else {
      setEditValue(currentValue || '');
    }
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    console.log('Salvando edição:', editingCell, 'valor:', editValue);
    
    const { rowIndex, field } = editingCell;
    const newData = JSON.parse(JSON.stringify(data)); // Deep clone para garantir re-render
    
    // Processar o valor baseado no tipo de campo
    let processedValue: any = editValue;
    
    if (field === 'jurosPoupanca') {
      // Converter de percentual para decimal
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        alert('Por favor, digite um número válido para Juros Poupança');
        return;
      }
      processedValue = numValue / 100;
      
      console.log(`Alterando Juros Poupança da parcela ${rowIndex + 1} de ${newData[activeTab][rowIndex][field]} para ${processedValue}`);
      
      // Atualizar o valor
      newData[activeTab][rowIndex][field] = processedValue;
      
      // Recalcular todas as parcelas a partir desta
      console.log('Iniciando recálculo automático...');
      recalculateFromParcela(newData, activeTab, rowIndex);
      
    } else if (field === 'dataEnvioBoleto' || field === 'dataVencimento') {
      // Para datas, manter como string
      processedValue = editValue;
      newData[activeTab][rowIndex][field] = processedValue;
    } else {
      // Para outros campos como situação
      newData[activeTab][rowIndex][field] = processedValue;
    }
    
    console.log('Dados atualizados:', newData[activeTab][rowIndex]);
    
    setData(newData);
    setEditingCell(null);
    setEditValue('');
    
    // Aqui você salvaria no Firebase
    console.log(`✅ Salvando alteração: ${field} = ${processedValue} para parcela ${newData[activeTab][rowIndex].parcela}`);
    
    if (field === 'jurosPoupanca') {
      console.log('🔄 Recálculo automático realizado para todas as parcelas seguintes!');
    }
  };

  const generateReceipt = (parcela: Parcela) => {
    alert(`Gerando recibo para parcela ${parcela.parcela} - Valor: R$ ${parcela.parcelaComJuros.toFixed(2)}`);
    // Aqui você implementará a geração do recibo
  };

  const filteredData = data[activeTab]?.filter(item => 
    item.parcela.toString().includes(searchTerm) ||
    item.situacao.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'Pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'À Vencer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Vencida': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${(value * 100).toFixed(4)}%`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderEditableCell = (value: any, rowIndex: number, field: keyof Parcela, type: string = 'text') => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          {type === 'select' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            >
              <option value="Pago">Pago</option>
              <option value="À Vencer">À Vencer</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded text-xs w-24 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEditing();
              }}
            />
          )}
          <button
            onClick={saveEdit}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Salvar"
          >
            <Check size={14} />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancelar"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group">
        <span className={field === 'jurosPoupanca' ? 'text-orange-600 font-medium' : ''}>
          {field === 'jurosPoupanca' ? formatPercentage(value) :
           field === 'dataEnvioBoleto' || field === 'dataVencimento' ? formatDate(value) :
           field === 'situacao' ? (
             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(value)}`}>
               {value}
             </span>
           ) : value}
        </span>
        <button
          onClick={() => startEditing(rowIndex, field, value)}
          className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-100 rounded transition-opacity"
          title="Editar"
        >
          <Edit2 size={12} />
        </button>
      </div>
    );
  };

  const stats = {
    total: filteredData.length,
    pago: filteredData.filter(item => item.situacao === 'Pago').length,
    aVencer: filteredData.filter(item => item.situacao === 'À Vencer').length,
    vencida: filteredData.filter(item => item.situacao === 'Vencida').length,
    totalValor: filteredData.reduce((sum, item) => sum + (item.parcelaComJuros || 0), 0),
    totalPago: filteredData.filter(item => item.situacao === 'Pago').reduce((sum, item) => sum + (item.valorPago || 0), 0),
    totalJuros: filteredData.reduce((sum, item) => sum + (item.jurosValor || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">JN Finanças</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-800 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('ively')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'ively' ? 'bg-blue-800 border-l-4 border-blue-400' : 'hover:bg-blue-800'
            }`}
          >
            <Home size={20} />
            {sidebarOpen && <span className="ml-3">14(A) Ively</span>}
          </button>

          <button
            onClick={() => setActiveTab('renato')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'renato' ? 'bg-blue-800 border-l-4 border-blue-400' : 'hover:bg-blue-800'
            }`}
          >
            <Home size={20} />
            {sidebarOpen && <span className="ml-3">14(B) Renato</span>}
          </button>

          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-blue-800 transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            <Plus size={20} />
            {sidebarOpen && <span className="ml-3">Novo Imóvel</span>}
          </button>

          <button
            className="w-full flex items-center p-3 rounded-lg hover:bg-blue-800 transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Relatórios</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-xs text-blue-300">
            {sidebarOpen ? 'Sistema de Controle de Imóveis' : 'JN'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                Imóvel {activeTab === 'ively' ? '14(A) Ively' : '14(B) Renato'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Clique no ícone de edição para modificar: Juros Poupança, Data Envio Boleto, Data Vencimento e Situação
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar parcela ou situação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
                <DollarSign className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Pagas</p>
                  <p className="text-xl font-bold text-green-600">{stats.pago}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Calendar className="text-yellow-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">À Vencer</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.aVencer}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <Calendar className="text-red-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-xl font-bold text-red-600">{stats.vencida}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <DollarSign className="text-purple-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalValor)}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center">
                <DollarSign className="text-emerald-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Pago</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalPago)}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <Percent className="text-orange-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Juros Total</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(stats.totalJuros)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Parcela
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Parcela Sem Juros
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Parcela com Juros
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Valor Pago
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Juros Poupança
                          <Edit2 size={12} className="ml-1 text-blue-200" />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Juros Total % 
                          <span className="ml-1 text-blue-200 text-xs">(0.5% + Poupança)</span>
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Juros Total
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Data Envio Boleto
                          <Edit2 size={12} className="ml-1 text-blue-200" />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Data Vencimento
                          <Edit2 size={12} className="ml-1 text-blue-200" />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Situação
                          <Edit2 size={12} className="ml-1 text-blue-200" />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                            #{item.parcela}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(item.parcelaSemJuros)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-blue-600">
                          {formatCurrency(item.parcelaComJuros)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={item.valorPago ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {formatCurrency(item.valorPago)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.jurosPoupanca, index, 'jurosPoupanca', 'number')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-700 font-medium">
                          {formatPercentage(item.jurosTotal)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {formatCurrency(item.jurosValor)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.dataEnvioBoleto, index, 'dataEnvioBoleto', 'date')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.dataVencimento, index, 'dataVencimento', 'date')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.situacao, index, 'situacao', 'select')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => generateReceipt(item)}
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
              
              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {filteredData.length} parcelas de {data[activeTab]?.length || 0}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Total a Receber: <span className="font-semibold text-blue-600">{formatCurrency(stats.totalValor - stats.totalPago)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JNFinancasSystem;
