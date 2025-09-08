import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Mail, Edit2, Check } from 'lucide-react';

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

  // Dados de exemplo
  const sampleData: ImovelData = {
    ively: [
      {
        parcela: 1,
        parcelaSemJuros: 1493.06,
        parcelaComJuros: 1506.07,
        valorPago: 1506.07,
        jurosPoupanca: 0.003715,
        jurosTotal: 0.008715,
        jurosValor: 13.01,
        dataEnvioBoleto: '2019-09-11',
        dataVencimento: '2019-09-18',
        situacao: 'Pago'
      },
      {
        parcela: 2,
        parcelaSemJuros: 1506.07,
        parcelaComJuros: 1518.77,
        valorPago: 1518.77,
        jurosPoupanca: 0.003434,
        jurosTotal: 0.008434,
        jurosValor: 12.70,
        dataEnvioBoleto: '2019-10-21',
        dataVencimento: '2019-10-27',
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
        dataEnvioBoleto: '2019-11-18',
        dataVencimento: '2019-11-27',
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
        dataEnvioBoleto: '2019-12-16',
        dataVencimento: '2019-12-27',
        situacao: 'À Vencer'
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
      }
    ]
  };

  useEffect(() => {
    console.log('🚀 Carregando dados iniciais...');
    setTimeout(() => {
      setData(sampleData);
      setLoading(false);
      console.log('✅ Dados carregados:', sampleData);
    }, 1000);
  }, []);

  const recalculateFromParcela = (newData: ImovelData, tabName: TabType, startIndex: number) => {
    console.log(`🧮 Recalculando a partir da parcela ${startIndex + 1}`);
    const parcelas = newData[tabName];
    
    for (let i = startIndex; i < parcelas.length; i++) {
      const currentParcela = parcelas[i];
      
      if (i > 0) {
        currentParcela.parcelaSemJuros = parcelas[i - 1].parcelaComJuros;
      }
      
      const juroFixo = 0.005;
      const jurosPoupanca = currentParcela.jurosPoupanca || 0;
      currentParcela.jurosTotal = juroFixo + jurosPoupanca;
      currentParcela.jurosValor = currentParcela.parcelaSemJuros * currentParcela.jurosTotal;
      currentParcela.parcelaComJuros = currentParcela.parcelaSemJuros + currentParcela.jurosValor;
      
      console.log(`  Parcela ${currentParcela.parcela}: R$ ${currentParcela.parcelaComJuros.toFixed(2)}`);
    }
  };

  const startEditing = (rowIndex: number, field: keyof Parcela, currentValue: any) => {
    console.log(`✏️ Iniciando edição: linha ${rowIndex + 1}, campo ${field}`, currentValue);
    
    setEditingCell({ rowIndex, field });
    
    let formattedValue = '';
    if (field === 'jurosPoupanca') {
      formattedValue = currentValue ? (currentValue * 100).toFixed(4) : '0.0000';
    } else {
      formattedValue = currentValue ? currentValue.toString() : '';
    }
    
    setEditValue(formattedValue);
    console.log(`📝 Valor no campo de edição: "${formattedValue}"`);
  };

  const cancelEditing = () => {
    console.log('❌ Cancelando edição');
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editingCell) {
      console.log('❌ ERRO: editingCell é null');
      return;
    }
    
    console.log('💾 SALVANDO:', {
      linha: editingCell.rowIndex + 1,
      campo: editingCell.field,
      valorDigitado: editValue,
      aba: activeTab
    });
    
    const { rowIndex, field } = editingCell;
    
    // Criar nova cópia dos dados
    const newData: ImovelData = {
      ively: [...data.ively.map(item => ({ ...item }))],
      renato: [...data.renato.map(item => ({ ...item }))]
    };
    
    let processedValue: any = editValue;
    
    if (field === 'jurosPoupanca') {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        alert('Número inválido!');
        return;
      }
      processedValue = numValue / 100;
      console.log(`🔢 Convertendo ${editValue}% para ${processedValue}`);
      
      // Atualizar valor
      newData[activeTab][rowIndex][field] = processedValue;
      
      // Recalcular
      recalculateFromParcela(newData, activeTab, rowIndex);
      
    } else {
      newData[activeTab][rowIndex][field] = processedValue;
    }
    
    console.log('📊 ANTES:', data[activeTab][rowIndex]);
    console.log('📊 DEPOIS:', newData[activeTab][rowIndex]);
    
    // Atualizar estado
    setData(newData);
    setEditingCell(null);
    setEditValue('');
    
    console.log('✅ SALVO! Estado atualizado.');
  };

  const filteredData = data[activeTab] || [];

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

  const renderEditableCell = (value: any, rowIndex: number, field: keyof Parcela) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          {field === 'situacao' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
              autoFocus
            >
              <option value="Pago">Pago</option>
              <option value="À Vencer">À Vencer</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          ) : (
            <input
              type={field === 'dataEnvioBoleto' || field === 'dataVencimento' ? 'date' : 'text'}
              value={editValue}
              onChange={(e) => {
                console.log('📝 Digitando:', e.target.value);
                setEditValue(e.target.value);
              }}
              className="px-2 py-1 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{ 
                minWidth: field === 'jurosPoupanca' ? '100px' : 
                          field === 'dataEnvioBoleto' || field === 'dataVencimento' ? '130px' : '100px' 
              }}
              autoFocus
              placeholder={field === 'jurosPoupanca' ? 'Ex: 0.6000' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('⏎ Enter pressionado - salvando...');
                  saveEdit();
                }
                if (e.key === 'Escape') {
                  console.log('⎋ Escape pressionado - cancelando...');
                  cancelEditing();
                }
              }}
            />
          )}
          <button
            onClick={() => {
              console.log('✅ Botão salvar clicado');
              saveEdit();
            }}
            className="p-1 text-green-600 hover:bg-green-100 rounded flex-shrink-0"
            title="Salvar"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              console.log('❌ Botão cancelar clicado');
              cancelEditing();
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded flex-shrink-0"
            title="Cancelar"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    const displayValue = (() => {
      switch (field) {
        case 'jurosPoupanca':
          return <span className="text-orange-600 font-medium">{formatPercentage(value)}</span>;
        case 'dataEnvioBoleto':
        case 'dataVencimento':
          return <span className="flex items-center"><Calendar size={14} className="mr-1 text-gray-400" />{formatDate(value)}</span>;
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
        <div className="min-w-0 flex-1">
          {displayValue}
        </div>
        <button
          onClick={() => {
            console.log('🖊️ Botão editar clicado');
            startEditing(rowIndex, field, value);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-100 rounded transition-opacity flex-shrink-0 ml-2"
          title="Editar"
        >
          <Edit2 size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold">JN Finanças</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-800 rounded">
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
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="bg-white shadow-sm border-b p-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Imóvel {activeTab === 'ively' ? '14(A) Ively' : '14(B) Renato'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sistema funcionando em MEMÓRIA - Firebase não necessário para teste
          </p>
        </div>

        <div className="p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Parcela</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Sem Juros</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Com Juros</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Juros Poupança ✏️</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Juros Total %</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Data Envio ✏️</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Vencimento ✏️</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">Situação ✏️</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium">#{item.parcela}</td>
                      <td className="px-4 py-4 text-sm">{formatCurrency(item.parcelaSemJuros)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600">{formatCurrency(item.parcelaComJuros)}</td>
                      <td className="px-4 py-4 text-sm">{renderEditableCell(item.jurosPoupanca, index, 'jurosPoupanca')}</td>
                      <td className="px-4 py-4 text-sm text-orange-700">{formatPercentage(item.jurosTotal)}</td>
                      <td className="px-4 py-4 text-sm">{renderEditableCell(item.dataEnvioBoleto, index, 'dataEnvioBoleto')}</td>
                      <td className="px-4 py-4 text-sm">{renderEditableCell(item.dataVencimento, index, 'dataVencimento')}</td>
                      <td className="px-4 py-4 text-sm">{renderEditableCell(item.situacao, index, 'situacao')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JNFinancasSystem;
