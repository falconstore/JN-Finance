import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Edit2, Check, Save } from 'lucide-react';

interface Parcela {
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

interface ImovelData {
  ively: Parcela[];
  renato: Parcela[];
}

interface EditingCell {
  rowIndex: number;
  field: keyof Parcela;
}

type TabType = 'ively' | 'renato';

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

  // Dados corrigidos baseados na estrutura do Excel
  const sampleData: ImovelData = {
    ively: [
      {
        parcela: 1,
        parcelaSemJuros: 1493.06,
        parcelaComJuros: 1506.07,
        valorPago: 1506.07,
        jurosPoupanca: 0.003715, // 0.3715%
        jurosTotal: 0.008715, // 0.5% + 0.3715%
        jurosValor: 13.01,
        dataEnvioBoleto: '2019-09-10',
        dataVencimento: '2019-09-17',
        situacao: 'Pago'
      },
      {
        parcela: 2,
        parcelaSemJuros: 1506.07,
        parcelaComJuros: 1518.77,
        valorPago: 1518.77,
        jurosPoupanca: 0.003434, // 0.3434%
        jurosTotal: 0.008434, // 0.5% + 0.3434%
        jurosValor: 12.70,
        dataEnvioBoleto: '2019-10-20',
        dataVencimento: '2019-10-26',
        situacao: 'Pago'
      },
      {
        parcela: 3,
        parcelaSemJuros: 1518.77,
        parcelaComJuros: 1531.58,
        valorPago: 1531.58,
        jurosPoupanca: 0.003434,
        jurosTotal: 0.008434,
        jurosValor: 12.81,
        dataEnvioBoleto: '2019-11-17',
        dataVencimento: '2019-11-26',
        situacao: 'Pago'
      },
      {
        parcela: 4,
        parcelaSemJuros: 1531.58,
        parcelaComJuros: 1543.21,
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588,
        jurosValor: 11.62,
        dataEnvioBoleto: '2019-12-15',
        dataVencimento: '2019-12-26',
        situacao: 'À Vencer'
      },
      {
        parcela: 5,
        parcelaSemJuros: 1543.21,
        parcelaComJuros: 1555.89,
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588,
        jurosValor: 12.68,
        dataEnvioBoleto: '2020-01-15',
        dataVencimento: '2020-01-26',
        situacao: 'À Vencer'
      },
      {
        parcela: 6,
        parcelaSemJuros: 1555.89,
        parcelaComJuros: 1568.45,
        valorPago: null,
        jurosPoupanca: 0.002588,
        jurosTotal: 0.007588,
        jurosValor: 12.56,
        dataEnvioBoleto: '2020-02-15',
        dataVencimento: '2020-02-26',
        situacao: 'Vencida'
      }
    ],
    renato: [
      {
        parcela: 1,
        parcelaSemJuros: 1618.05,
        parcelaComJuros: 1632.15,
        valorPago: 1632.15,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715,
        jurosValor: 14.10,
        dataEnvioBoleto: '2019-08-15',
        dataVencimento: '2019-08-22',
        situacao: 'Pago'
      },
      {
        parcela: 2,
        parcelaSemJuros: 1632.15,
        parcelaComJuros: 1646.38,
        valorPago: 1646.38,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715,
        jurosValor: 14.22,
        dataEnvioBoleto: '2019-09-17',
        dataVencimento: '2019-09-24',
        situacao: 'Pago'
      },
      {
        parcela: 3,
        parcelaSemJuros: 1646.38,
        parcelaComJuros: 1660.73,
        valorPago: null,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715,
        jurosValor: 14.35,
        dataEnvioBoleto: '2019-10-17',
        dataVencimento: '2019-10-24',
        situacao: 'À Vencer'
      },
      {
        parcela: 4,
        parcelaSemJuros: 1660.73,
        parcelaComJuros: 1675.21,
        valorPago: null,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715,
        jurosValor: 14.48,
        dataEnvioBoleto: '2019-11-17',
        dataVencimento: '2019-11-24',
        situacao: 'Vencida'
      }
    ]
  };

  useEffect(() => {
    console.log('🚀 Inicializando sistema JN Finanças...');
    const timer = setTimeout(() => {
      setData(sampleData);
      setLoading(false);
      console.log('✅ Dados carregados com sucesso!');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Função para recalcular parcelas em cascata
  const recalculateFromParcela = (newData: ImovelData, tabName: TabType, startIndex: number) => {
    console.log(`🔄 Recalculando parcelas a partir da ${startIndex + 1}...`);
    const parcelas = newData[tabName];
    
    for (let i = startIndex; i < parcelas.length; i++) {
      const currentParcela = parcelas[i];
      
      // Valor sem juros = valor com juros da parcela anterior
      if (i > 0) {
        currentParcela.parcelaSemJuros = parcelas[i - 1].parcelaComJuros;
      }
      
      // Juros total = 0.5% fixo + juros da poupança
      const juroFixo = 0.005;
      currentParcela.jurosTotal = juroFixo + (currentParcela.jurosPoupanca || 0);
      
      // Valor dos juros em reais
      currentParcela.jurosValor = currentParcela.parcelaSemJuros * currentParcela.jurosTotal;
      
      // Parcela com juros = valor sem juros + valor dos juros
      currentParcela.parcelaComJuros = currentParcela.parcelaSemJuros + currentParcela.jurosValor;
      
      console.log(`  Parcela ${currentParcela.parcela}: ${formatCurrency(currentParcela.parcelaComJuros)}`);
    }
  };

  // Iniciar edição de célula
  const startEditing = (rowIndex: number, field: keyof Parcela, currentValue: any) => {
    console.log(`✏️ Editando: Parcela ${rowIndex + 1}, Campo: ${field}`);
    setEditingCell({ rowIndex, field });
    
    // Formatar valor baseado no tipo
    if (field === 'jurosPoupanca') {
      setEditValue(currentValue ? (currentValue * 100).toFixed(4) : '0.0000');
    } else if (field === 'dataEnvioBoleto' || field === 'dataVencimento') {
      setEditValue(currentValue || '');
    } else {
      setEditValue(currentValue?.toString() || '');
    }
  };

  // Cancelar edição
  const cancelEditing = () => {
    console.log('❌ Edição cancelada');
    setEditingCell(null);
    setEditValue('');
  };

  // Salvar edição
  const saveEdit = () => {
    if (!editingCell) return;
    
    const { rowIndex, field } = editingCell;
    console.log(`💾 Salvando: Parcela ${rowIndex + 1}, ${field} = "${editValue}"`);
    
    // Criar cópia profunda dos dados
    const newData = JSON.parse(JSON.stringify(data)) as ImovelData;
    
    let processedValue: any = editValue;
    
    // Processar valor baseado no tipo de campo
    if (field === 'jurosPoupanca') {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        alert('Por favor, digite um valor numérico válido para Juros Poupança');
        return;
      }
      processedValue = numValue / 100; // Converter % para decimal
      newData[activeTab][rowIndex][field] = processedValue;
      
      // Recalcular todas as parcelas seguintes
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

  // Gerar recibo
  const generateReceipt = (parcela: Parcela) => {
    alert(`📄 Gerando recibo para parcela ${parcela.parcela}\nValor: ${formatCurrency(parcela.parcelaComJuros)}`);
  };

  // Filtrar dados baseado na busca
  const filteredData = data[activeTab]?.filter(item => 
    item.parcela.toString().includes(searchTerm) ||
    item.situacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatCurrency(item.parcelaComJuros).includes(searchTerm)
  ) || [];

  // Cores para status
  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'Pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'À Vencer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Vencida': return 'bg-red-100 text-red-800 border-red-200';
      case 'Cancelada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Formatação de moeda
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de percentual
  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${(value * 100).toFixed(4)}%`;
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Renderizar célula editável
  const renderEditableCell = (value: any, rowIndex: number, field: keyof Parcela) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {field === 'situacao' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 min-w-[100px]"
              autoFocus
            >
              <option value="Pago">Pago</option>
              <option value="À Vencer">À Vencer</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          ) : (
            <input
              type={field.includes('data') ? 'date' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
              style={{ 
                minWidth: field === 'jurosPoupanca' ? '100px' : 
                          field.includes('data') ? '130px' : '80px' 
              }}
              placeholder={field === 'jurosPoupanca' ? 'Ex: 0.3715' : ''}
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
            title="Salvar (Enter)"
          >
            <Check size={14} />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancelar (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    // Renderização normal
    const displayValue = (() => {
      switch (field) {
        case 'jurosPoupanca':
          return <span className="text-orange-600 font-medium">{formatPercentage(value)}</span>;
        case 'dataEnvioBoleto':
        case 'dataVencimento':
          return <span className="flex items-center"><Calendar size={12} className="mr-1 text-gray-400" />{formatDate(value)}</span>;
        case 'situacao':
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(value)}`}>
              {value}
            </span>
          );
        default:
          return value;
      }
    })();

    return (
      <div className="flex items-center justify-between group">
        <div className="flex-1">{displayValue}</div>
        <button
          onClick={() => startEditing(rowIndex, field, value)}
          className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-100 rounded transition-opacity"
          title={`Editar ${field}`}
        >
          <Edit2 size={12} />
        </button>
      </div>
    );
  };

  // Calcular estatísticas
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">JN Finanças</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-800 rounded transition-colors"
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
            {sidebarOpen ? 'Sistema de Controle Financeiro' : 'JN'}
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                Imóvel {activeTab === 'ively' ? '14(A) Ively' : '14(B) Renato'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sistema funcionando em memória - Clique nos ícones de edição para modificar dados
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar parcela, valor ou situação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
              </div>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => alert('🔄 Sincronização com Firebase em desenvolvimento')}
              >
                <Save size={16} className="mr-2" />
                Salvar
              </button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                onClick={() => alert('📊 Exportação em desenvolvimento')}
              >
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Cards de Estatísticas */}
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

        {/* Tabela */}
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
                        Juros Total %
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Juros Total R$
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Data Envio
                          <Edit2 size={12} className="ml-1 text-blue-200" />
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          Vencimento
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
                      <tr key={`${activeTab}-${item.parcela}`} className="hover:bg-gray-50 transition-colors">
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
                          {renderEditableCell(item.jurosPoupanca, index, 'jurosPoupanca')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-700 font-medium">
                          {formatPercentage(item.jurosTotal)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {formatCurrency(item.jurosValor)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.dataEnvioBoleto, index, 'dataEnvioBoleto')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.dataVencimento, index, 'dataVencimento')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderEditableCell(item.situacao, index, 'situacao')}
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
              
              {/* Footer da Tabela */}
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {filteredData.length} de {data[activeTab]?.length || 0} parcelas
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      A Receber: <span className="font-semibold text-blue-600">{formatCurrency(stats.totalValor - stats.totalPago)}</span>
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
