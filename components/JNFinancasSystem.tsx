import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, DollarSign, Home, Plus, Menu, X, Percent, Edit2, Check, Save, Printer } from 'lucide-react';
import { Parcela, ImovelData, EditingCell, TabType } from '../types';
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
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);

  // ============================================
  // 🔄 CARREGAMENTO DOS DADOS COMPLETOS
  // ============================================
  useEffect(() => {
    console.log('🚀 Carregando dados completos da Ively e Renato...');
    
    try {
      console.log('📊 Dados Ively:', database.ively.length, 'parcelas');
      console.log('📊 Dados Renato:', database.renato.length, 'parcelas');
      
      setData({
        ively: database.ively,
        renato: database.renato
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
    setSelectedParcela(parcela);
    setShowReceiptModal(true);
  };

  // ============================================
  // 🖨️ IMPRESSÃO SIMPLIFICADA
  // ============================================
  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow || !selectedParcela) return;

    const imovelInfo = imoveisInfo[activeTab];
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    const valorPorExtenso = (valor: number): string => {
      const milhares = Math.floor(valor / 1000);
      const centavos = Math.round((valor - Math.floor(valor)) * 100);
      
      if (valor >= 1000) {
        return `${milhares} mil ${Math.floor(valor % 1000) > 0 ? 'e ' + Math.floor(valor % 1000) + ' ' : ''}reais${centavos > 0 ? ' e ' + centavos + ' centavos' : ''}`;
      }
      return `${Math.floor(valor)} reais${centavos > 0 ? ' e ' + centavos + ' centavos' : ''}`;
    };

    const valorRecebido = selectedParcela.valorPago || selectedParcela.parcelaComJuros;
    const valorExtenso = valorPorExtenso(valorRecebido);
    const parcelasRestantes = imovelInfo.totalParcelas - selectedParcela.parcela;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - Parcela ${selectedParcela.parcela}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 700px; 
            margin: 0 auto; 
            padding: 20px 30px;
            line-height: 1.4;
            font-size: 13px;
            color: #000;
          }
          .title { 
            text-align: center;
            font-size: 22px; 
            font-weight: bold;
            margin-bottom: 25px;
            letter-spacing: 1px;
          }
          .content {
            text-align: justify;
            margin-bottom: 12px;
          }
          .valor-pago-section {
            background: #e8f5e8;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
          }
          .valor-pago-title {
            font-size: 16px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 8px;
          }
          .valor-pago-value {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
          }
          .signature-section {
            margin-top: 35px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 180px;
            margin: 0 auto 8px auto;
          }
          .date-location {
            text-align: center;
            margin: 25px 0 35px 0;
          }
          @media print {
            body { 
              padding: 15px 25px;
              font-size: 12px;
            }
            .title {
              font-size: 20px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 10px;
              line-height: 1.3;
            }
            .date-location {
              margin: 20px 0 30px 0;
            }
            .signature-section {
              margin-top: 25px;
            }
            .valor-pago-section {
              margin: 15px 0;
              padding: 12px;
            }
            .valor-pago-title {
              font-size: 14px;
            }
            .valor-pago-value {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="title">RECIBO</div>
        
        <div class="content">
          Pelo presente, eu <strong>${imovelInfo.recebedor.nome}</strong>, inscrito no CPF sob nº <strong>${imovelInfo.recebedor.cpf}</strong>, declaro que <strong>RECEBI</strong> na data de hoje, o valor de <strong>${formatCurrency(valorRecebido)}</strong>, ${valorExtenso}, por meio de PIX, de <strong>${imovelInfo.pagador.nome}</strong>, inscrito no CPF sob nº <strong>${imovelInfo.pagador.cpf}</strong>, referente à parcela <strong>${selectedParcela.parcela} de ${imovelInfo.totalParcelas}</strong> referente ao imóvel denominado <strong>${imovelInfo.imovel}</strong> do <strong>${imovelInfo.bloco}</strong>, localizado no <strong>${imovelInfo.andar}</strong> do <strong>${imovelInfo.condominio}</strong>.
        </div>

        ${selectedParcela.valorPago ? `
        <div class="valor-pago-section">
          <div class="valor-pago-title">VALOR PAGO</div>
          <div class="valor-pago-value">${formatCurrency(selectedParcela.valorPago)}</div>
        </div>
        ` : ''}
        
        <div class="content">
          Declaro que ainda restam pendentes <strong>${parcelasRestantes} parcelas</strong>.
        </div>
        
        <div class="content">
          Sendo expressão de verdade e sem qualquer coação, firmo o presente recibo.
        </div>
        
        <div class="date-location">
          Guarujá, ${hoje}.
        </div>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>${imovelInfo.recebedor.nome}</div>
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

  // ============================================
  // 📄 DOWNLOAD PDF
  // ============================================
  const downloadReceiptPDF = async () => {
    if (!selectedParcela) return;

    try {
      const jsPDF = require('jspdf').jsPDF;
      const doc = new jsPDF();
      
      const imovelInfo = imoveisInfo[activeTab];
      const hoje = new Date().toLocaleDateString('pt-BR');
      
      const valorPorExtenso = (valor: number): string => {
        const milhares = Math.floor(valor / 1000);
        const centavos = Math.round((valor - Math.floor(valor)) * 100);
        
        if (valor >= 1000) {
          return `${milhares} mil ${Math.floor(valor % 1000) > 0 ? 'e ' + Math.floor(valor % 1000) + ' ' : ''}reais${centavos > 0 ? ' e ' + centavos + ' centavos' : ''}`;
        }
        return `${Math.floor(valor)} reais${centavos > 0 ? ' e ' + centavos + ' centavos' : ''}`;
      };
      
      const pageWidth = doc.internal.pageSize.width;
      const marginLeft = 25;
      const marginRight = 25;
      const contentWidth = pageWidth - marginLeft - marginRight;
      let currentY = 40;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = 'RECIBO';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, currentY);
      currentY += 25;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const valorRecebido = selectedParcela.valorPago || selectedParcela.parcelaComJuros;
      const valorExtenso = valorPorExtenso(valorRecebido);
      const parcelasRestantes = imovelInfo.totalParcelas - selectedParcela.parcela;
      
      const texto = `Pelo presente, eu ${imovelInfo.recebedor.nome}, inscrito no CPF sob nº ${imovelInfo.recebedor.cpf}, declaro que RECEBI na data de hoje, o valor de ${formatCurrency(valorRecebido)}, ${valorExtenso}, por meio de PIX, de ${imovelInfo.pagador.nome}, inscrito no CPF sob nº ${imovelInfo.pagador.cpf}, referente à parcela ${selectedParcela.parcela} de ${imovelInfo.totalParcelas} referente ao imóvel denominado ${imovelInfo.imovel} do ${imovelInfo.bloco}, localizado no ${imovelInfo.andar} do ${imovelInfo.condominio}.`;
      
      const linhas = doc.splitTextToSize(texto, contentWidth);
      
      linhas.forEach((linha: string) => {
        doc.text(linha, marginLeft, currentY);
        currentY += 6;
      });
      
      currentY += 15;
      
      if (selectedParcela.valorPago) {
        doc.setFillColor(232, 245, 232);
        doc.rect(marginLeft, currentY - 5, contentWidth, 20, 'F');
        doc.setDrawColor(40, 167, 69);
        doc.setLineWidth(1);
        doc.rect(marginLeft, currentY - 5, contentWidth, 20);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 167, 69);
        const valorPagoText = 'VALOR PAGO';
        const valorPagoTextWidth = doc.getTextWidth(valorPagoText);
        doc.text(valorPagoText, (pageWidth - valorPagoTextWidth) / 2, currentY + 5);
        
        doc.setFontSize(16);
        const valorPagoValue = formatCurrency(selectedParcela.valorPago);
        const valorPagoValueWidth = doc.getTextWidth(valorPagoValue);
        doc.text(valorPagoValue, (pageWidth - valorPagoValueWidth) / 2, currentY + 12);
        currentY += 30;
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      }
      
      const textoRestantes = `Declaro que ainda restam pendentes ${parcelasRestantes} parcelas.`;
      doc.text(textoRestantes, marginLeft, currentY);
      currentY += 15;
      
      const textoVerdade = `Sendo expressão de verdade e sem qualquer coação, firmo o presente recibo.`;
      doc.text(textoVerdade, marginLeft, currentY);
      currentY += 25;
      
      const dataLocal = `Guarujá, ${hoje}.`;
      const dataLocalWidth = doc.getTextWidth(dataLocal);
      doc.text(dataLocal, (pageWidth - dataLocalWidth) / 2, currentY);
      currentY += 35;
      
      doc.setFont('helvetica', 'normal');
      const nomeRecebedor = imovelInfo.recebedor.nome;
      const nomeWidth = doc.getTextWidth(nomeRecebedor);
      
      const linhaAssinatura = 80;
      const startX = (pageWidth - linhaAssinatura) / 2;
      doc.line(startX, currentY, startX + linhaAssinatura, currentY);
      
      doc.text(nomeRecebedor, (pageWidth - nomeWidth) / 2, currentY + 8);
      
      const fileName = `recibo_parcela_${selectedParcela.parcela}_${activeTab}_${hoje.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Instale jsPDF: npm install jspdf');
    }
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

      {/* Modal do Recibo SIMPLIFICADO */}
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

              {/* Preview do Recibo SIMPLIFICADO */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold">RECIBO DE PAGAMENTO</h4>
                  <p className="text-gray-600">{imoveisInfo[activeTab].condominio}</p>
                  <p className="text-gray-600">{imoveisInfo[activeTab].imovel} - {imoveisInfo[activeTab].bloco}</p>
                </div>

                {/* Seção: Informações do Imóvel */}
                <div className="mb-4">
                  <h5 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Home size={16} className="mr-2" />
                    Informações do Imóvel
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Condomínio:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].condominio}</span>
                    </div>
                    <div>
                      <span className="font-medium">Apartamento:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].imovel}</span>
                    </div>
                    <div>
                      <span className="font-medium">Bloco:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].bloco}</span>
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Pagamento */}
                <div className="mb-4">
                  <h5 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FileText size={16} className="mr-2" />
                    Dados do Pagamento
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Recebedor:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].recebedor.nome}</span>
                    </div>
                    <div>
                      <span className="font-medium">CPF:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].recebedor.cpf}</span>
                    </div>
                    <div>
                      <span className="font-medium">Pagador:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].pagador.nome}</span>
                    </div>
                    <div>
                      <span className="font-medium">CPF:</span>
                      <span className="ml-2">{imoveisInfo[activeTab].pagador.cpf}</span>
                    </div>
                  </div>
                </div>

                {/* Seção: Detalhes da Parcela */}
                <div className="mb-4">
                  <h5 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="mr-2" />
                    Detalhes da Parcela
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Parcela:</span>
                      <span className="ml-2">{selectedParcela.parcela} de {imoveisInfo[activeTab].totalParcelas}</span>
                    </div>
                    <div>
                      <span className="font-medium">Data Vencimento:</span>
                      <span className="ml-2">{formatDate(selectedParcela.dataVencimento)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Data Envio Boleto:</span>
                      <span className="ml-2">{formatDate(selectedParcela.dataEnvioBoleto)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Situação:</span>
                      <span className="ml-2">{selectedParcela.situacao}</span>
                    </div>
                  </div>
                </div>

                {/* APENAS VALOR PAGO - SE HOUVER */}
                {selectedParcela.valorPago && (
                  <div className="mt-6 p-4 bg-green-100 rounded-lg text-center border border-green-300">
                    <p className="text-green-800 font-semibold text-lg">
                      VALOR PAGO
                    </p>
                    <p className="text-green-800 font-bold text-2xl">
                      {formatCurrency(selectedParcela.valorPago)}
                    </p>
                  </div>
                )}

                {/* Se não tiver valor pago, mostrar valor da parcela */}
                {!selectedParcela.valorPago && (
                  <div className="mt-6 p-4 bg-blue-100 rounded-lg text-center border border-blue-300">
                    <p className="text-blue-800 font-semibold text-lg">
                      VALOR DA PARCELA
                    </p>
                    <p className="text-blue-800 font-bold text-2xl">
                      {formatCurrency(selectedParcela.parcelaComJuros)}
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
