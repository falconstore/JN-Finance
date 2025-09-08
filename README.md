# JN Finanças - Sistema de Controle de Imóveis

Sistema completo para gerenciamento financeiro de imóveis com cálculos automáticos de juros e parcelas.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Banco de dados
- **Lucide React** - Ícones
- **xlsx** - Importação de Excel

## 🎯 Funcionalidades

### ✅ **Implementadas:**
- Dashboard completo com estatísticas
- Tabela responsiva com todos os campos
- **Edição inline** para campos específicos:
  - Juros Poupança
  - Data Envio Boleto  
  - Data Vencimento
  - Situação
- **Cálculo automático** com fórmula: `Parcela + (0.5% + Juros Poupança)`
- **Recálculo em cascata** quando alterar Juros Poupança
- Filtro de busca por parcela/situação
- Sidebar responsiva com abas dos imóveis

### 🔄 **Em desenvolvimento:**
- Integração com Firebase
- Importação de dados do Excel
- Gerador de recibos em PDF
- Sistema de backup automático

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/jn-financas.git
cd jn-financas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Firebase

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## ⚙️ Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Copie as credenciais para `.env.local`
4. Configure as regras de segurança

## 🧮 Lógica de Cálculos

O sistema implementa a fórmula específica:

```
Juros Total = 0.5% (fixo) + Juros Poupança (variável)
Valor Juros = Parcela Sem Juros × Juros Total  
Parcela com Juros = Parcela Sem Juros + Valor Juros
```

**Propagação:**
- Próxima Parcela Sem Juros = Parcela com Juros anterior
- Alteração em Juros Poupança recalcula todas as parcelas seguintes

## 📊 Estrutura dos Dados

```typescript
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
```

## 🎨 Layout

- **Sidebar:** Navegação entre imóveis (Ively/Renato)
- **Dashboard:** Cards com estatísticas resumidas
- **Tabela:** Visualização completa com edição inline
- **Responsivo:** Design adaptável para desktop/mobile

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Manual
```bash
npm run build
npm start
```

## 📝 Como Usar

### **Editar Dados:**
1. Passe o mouse sobre célula editável
2. Clique no ícone de edição (✏️)
3. Altere o valor
4. Pressione Enter ou clique em ✅

### **Buscar:**
- Digite número da parcela ou situação no campo de busca
- Filtro em tempo real

### **Recibos:**
- Clique no botão "Recibo" em qualquer linha
- *Em desenvolvimento*

## 🐛 Debug

Abra o console do navegador (F12) para ver:
- Logs de alterações
- Detalhes dos recálculos  
- Valores antes/depois das edições

## 📄 Licença

Projeto privado - JN Finanças

---

**Desenvolvido com ❤️ para controle financeiro de imóveis**
