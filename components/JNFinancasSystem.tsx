import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Edit2, Check, Save, Printer } from 'lucide-react';

// Tipos (simulando as importações)
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

type TabType = 'ively' | 'renato';

interface EditingCell {
  rowIndex: number;
  field: keyof Parcela;
}

// Dados de exemplo (simulando as importações)
const sampleDatabase: ImovelData = {
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
      dataVencimento: '2019-08-21',
      situacao: 'Pago'
    }
  ]
};

const imoveisInfo = {
  ively: {
    nome: 'Ively',
    imovel: 'Apartamento nº 14(A)',
    bloco: 'Bloco A',
    andar: '1º andar',
    condominio: 'RESIDENCIAL OLYMPO',
    recebedor: {
      nome: 'Jhonatan da Silva',
      cpf: '438.358.908-16'
    },
    pagador: {
      nome: 'Vanderlei Roberto Conceição',
      cpf: '028.821.198-79'
    },
    totalParcelas: 144
  },
  renato: {
    nome: 'Renato',
    imovel: 'Apartamento nº 14(B)',
    bloco: 'Bloco A',
    andar: '1º andar',
    condominio: 'RESIDENCIAL OLYMPO',
    recebedor: {
      nome: 'Jhonatan da Silva',
      cpf: '438.358.908-16'
    },
    pagador: {
      nome: 'Vanderlei Roberto Conceição',
      cpf: '028.821.198-79'
    },
    totalParcelas: 144
  }
};

const JNFinancasSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ively');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<ImovelData>(sampleDatabase);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);

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
    
    let newValue: any = editValue;
    
    if (field === 'jurosPoupanca' || field === 'jurosTotal' || field === 'jurosValor' || 
        field === 'parcelaSemJuros' || field === 'parcelaComJuros' || field === 'valorPago') {
      newValue = parseFloat(editValue) || 0;
    }
    
    parcelas[rowIndex] = {
      ...parcelas[rowIndex],
      [field]: newValue
    };
    
    if (field === 'jurosPoupanca') {
      const parcela = parcelas[rowIndex];
      parcela.jurosTotal = newValue + 0.005;
      parcela.jurosValor = parcela.parcelaSemJuros * parcela.jurosTotal;
      parcela.parcelaComJuros = parcela.parcelaSemJuros + parcela.jurosValor;
    }
    
    updatedData[activeTab] = parcelas;
    setData(updatedData);
    setEditingCell(null);
    setEditValue('');
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
  // 🖨️ GERAR RECIBO - IMPLEMENTAÇÃO REAL
  // ============================================
  const generateReceipt = (parcela: Parcela) => {
    setSelectedParcela(parcela);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow || !selectedParcela) return;

    const imovelInfo = imoveisInfo[activeTab];
    const hoje = new Date().toLocaleDateString('pt-BR');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - Parcela ${selectedParcela.parcela}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #333;
            margin-bottom: 10px;
          }
          .subtitle { 
            font-size: 16px; 
            color: #666;
          }
          .info-section { 
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .info-title { 
            font-weight: bold; 
            font-size: 18px; 
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
          }
          .label { 
            font-weight: bold; 
            color: #555;
          }
          .value { 
            color: #333;
          }
          .amount-section {
            background: #e8f5e8;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .amount-title {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #28a745;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { 
              padding: 0;
              max-width: none;
            }
            .no-print { 
              display: none; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RECIBO DE PAGAMENTO</div>
          <div class="subtitle">${imovelInfo.condominio}</div>
          <div class="subtitle">${imovelInfo.imovel} - ${imovelInfo.bloco}</div>
        </div>

        <div class="info-section">
          <div class="info-title">🏠 Informações do Imóvel</div>
          <div class="info-row">
            <span class="label">Condomínio:</span>
            <span class="value">${imovelInfo.condominio}</span>
          </div>
          <div class="info-row">
            <span class="label">Apartamento:</span>
            <span class="value">${imovelInfo.imovel}</span>
          </div>
          <div class="info-row">
            <span class="label">Bloco:</span>
            <span class="value">${imovelInfo.bloco}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">👤 Dados do Pagamento</div>
          <div class="info-row">
            <span class="label">Recebedor:</span>
            <span class="value">${imovelInfo.recebedor.nome}</span>
          </div>
          <div class="info-row">
            <span class="label">CPF:</span>
            <span class="value">${imovelInfo.recebedor.cpf}</span>
          </div>
          <div class="info-row">
            <span class="label">Pagador:</span>
            <span class="value">${imovelInfo.pagador.nome}</span>
          </div>
          <div class="info-row">
            <span class="label">CPF:</span>
            <span class="value">${imovelInfo.pagador.cpf}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">📋 Detalhes da Parcela</div>
          <div class="info-row">
            <span class="label">Parcela:</span>
            <span class="value">${selectedParcela.parcela} de ${imovelInfo.totalParcelas}</span>
          </div>
          <div class="info-row">
            <span class="label">Data de Vencimento:</span>
            <span class="value">${formatDate(selectedParcela.dataVencimento)}</span>
          </div>
          <div class="info-row">
            <span class="label">Data de Envio do Boleto:</span>
            <span class="value">${formatDate(selectedParcela.dataEnvioBoleto)}</span>
          </div>
          <div class="info-row">
            <span class="label">Situação:</span>
            <span class="value">${selectedParcela.situacao}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">💰 Valores</div>
          <div class="info-row">
            <span class="label">Parcela sem Juros:</span>
            <span class="value">${formatCurrency(selectedParcela.parcelaSemJuros)}</span>
          </div>
          <div class="info-row">
            <span class="label">Juros Poupança:</span>
            <span class="value">${formatPercentage(selectedParcela.jurosPoupanca)}</span>
          </div>
          <div class="info-row">
            <span class="label">Juros Total:</span>
            <span class="value">${formatPercentage(selectedParcela.jurosTotal)}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor dos Juros:</span>
            <span class="value">${formatCurrency(selectedParcela.jurosValor)}</span>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-title">VALOR TOTAL DA PARCELA</div>
          <div class="amount-value">${formatCurrency(selectedParcela.parcelaComJuros)}</div>
        </div>

        ${selectedParcela.valorPago ? `
        <div class="amount-section" style="background: #e8f5e8; border-color: #28a745;">
          <div class="amount-title" style="color: #28a745;">VALOR PAGO</div>
          <div class="amount-value" style="color: #28a745;">${formatCurrency(selectedParcela.valorPago)}</div>
        </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Recebedor</div>
            <div style="margin-top: 5px; font-size: 12px;">${imovelInfo.recebedor.nome}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Pagador</div>
            <div style="margin-top: 5px; font-size: 12px;">${imovelInfo.pagador.nome}</div>
          </div>
        </div>

        <div class="footer">
          <p>Recibo gerado automaticamente pelo Sistema JN Finanças</p>
          <p>Data de emissão: ${hoje}</p>
          <p>Este documento possui validade legal para comprovação de pagamento</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  const downloadReceiptPDF = async () => {
    if (!selectedParcela) return;

    // Simulação de download - em produção você usaria uma biblioteca como jsPDF
    const element = document.createElement('a');
    const imovelInfo = imoveisInfo[activeTab];
    const hoje = new Date().toISOString().split('T')[0];
    
    const textContent = `
RECIBO DE PAGAMENTO
${imovelInfo.condominio}
${imovelInfo.imovel} - ${imovelInfo.bloco}

DADOS DO PAGAMENTO
Recebedor: ${imovelInfo.recebedor.nome}
CPF: ${imovelInfo.recebedor.cpf}
Pagador: ${imovelInfo.pagador.nome}

DETALHES DA PARCELA
Parcela: ${selectedParcela.parcela} de ${imovelInfo.totalParcelas}
Data de Vencimento: ${formatDate(selectedParcela.dataVencimento)}
Situação: ${selectedParcela.situacao}

VALORES
Parcela sem Juros: ${formatCurrency(selectedParcela.parcelaSemJuros)}
Valor dos Juros: ${formatCurrency(selectedParcela.jurosValor)}
VALOR TOTAL: ${formatCurrency(selectedParcela.parcelaComJuros)}
${selectedParcela.valorPago ? `VALOR PAGO: ${formatCurrency(selectedParcela.valorPago)}` : ''}

Emitido em: ${hoje}
    `;

    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `recibo_parcela_${selectedParcela.parcela}_${activeTab}_${hoje}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

      {/* Modal do Recibo */}
      {showReceiptModal && selectedParcela && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Recibo - Parcela {selectedParcela.parcela}
                </h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Preview do Recibo */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold">RECIBO DE PAGAMENTO</h4>
                  <p className="text-gray-600">{imoveisInfo[activeTab].condominio}</p>
                  <p className="text-gray-600">{imoveisInfo[activeTab].imovel}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Parcela:</strong> {selectedParcela.parcela}</p>
                    <p><strong>Vencimento:</strong> {formatDate(selectedParcela.dataVencimento)}</p>
                    <p><strong>Situação:</strong> {selectedParcela.situacao}</p>
                  </div>
                  <div>
                    <p><strong>Valor sem Juros:</strong> {formatCurrency(selectedParcela.parcelaSemJuros)}</p>
                    <p><strong>Valor dos Juros:</strong> {formatCurrency(selectedParcela.jurosValor)}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedParcela.parcelaComJuros)}</p>
                  </div>
                </div>

                {selectedParcela.valorPago && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                    <p className="text-green-800 font-semibold">
                      Valor Pago: {formatCurrency(selectedParcela.valorPago)}
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-4">
                <button
                  onClick={printReceipt}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer size={16} className="mr-2" />
                  Imprimir Recibo
                </button>
                <button
                  onClick={downloadReceiptPDF}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Baixar PDF
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JNFinancasSystem;
