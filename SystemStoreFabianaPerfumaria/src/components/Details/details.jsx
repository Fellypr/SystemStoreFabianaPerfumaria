import React from "react";
import "./details.css";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaBoxOpen, 
  FaTrashAlt, 
  FaPrint, 
  FaArrowLeft,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { format } from "date-fns";

function Details({ vendaSelecionada, onCancel, onPrint, onBack, isClosing }) {
  if (!vendaSelecionada || vendaSelecionada.length === 0) {
    return null;
  }

  const venda = vendaSelecionada[0];
  const precoTotal = venda.precoTotal || 0;
  const valorNaFicha = venda.valorNaFicha || 0;

  const textoFormaPagamento = () => {
    if (Array.isArray(venda.pagamentos) && venda.pagamentos.length > 0) {
      return venda.pagamentos
        .map((p) => `${p.formaPagamento} (${Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`)
        .join(" + ");
    }
    if (Array.isArray(venda.formaDePagamento) && venda.formaDePagamento.length > 0) {
      return venda.formaDePagamento
        .map((p) => `${p.formaPagamento} (${Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`)
        .join(" + ");
    }
    if (venda.formaDePagamento && typeof venda.formaDePagamento === "object") {
      const nome = venda.formaDePagamento.formaPagamento || "";
      const v = Number(venda.formaDePagamento.valor || 0);
      const vt = v > 0 ? ` (${v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})` : "";
      return `${nome}${vt}`;
    }
    return venda.formaDePagamento || "Não informado";
  };

  return (
    <div className={`details-wrapper ${isClosing ? 'closing' : ''}`}>
      <div className="details-header">
        <div className="header-title">
          <FaFileInvoiceDollar />
          <h2>Detalhes da Venda</h2>
        </div>
        <div className="header-actions">
          <button className="btn-action btn-back" onClick={onBack} title="Voltar">
            <FaArrowLeft /> Voltar
          </button>
          <button className="btn-action btn-print" onClick={onPrint} title="Imprimir Cupom">
            <FaPrint /> Imprimir
          </button>
          <button className="btn-action btn-cancel" onClick={() => onCancel(venda.idVenda)} title="Cancelar Venda">
            <FaTrashAlt /> Remover
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="info-card customer-card">
          <div className="card-icon"><FaUser /></div>
          <div className="card-content">
            <label>Cliente</label>
            <h3>{venda.comprador}</h3>
          </div>
        </div>

        <div className="info-card date-card">
          <div className="card-icon"><FaCalendarAlt /></div>
          <div className="card-content">
            <label>Data da Venda</label>
            <h3>{venda.dataDaVenda ? format(new Date(venda.dataDaVenda), "dd/MM/yyyy HH:mm") : "--"}</h3>
          </div>
        </div>

        <div className="info-card payment-card">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <label>Forma de Pagamento</label>
            <h3>{textoFormaPagamento()}</h3>
          </div>
        </div>
      </div>

      <div className="details-table-container">
        <table className="details-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {vendaSelecionada.map((item, idx) => (
              <tr key={idx}>
                <td>{item.nomeDoProduto}</td>
                <td>{item.quantidade}</td>
                <td>{Number(item.precoUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{(item.quantidade * item.precoUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="details-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>{precoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
        <div className="summary-row">
          <span>Desconto:</span>
          <span>R$ 0,00</span>
        </div>
        {valorNaFicha > 0 && (
          <div className="summary-row highlight-ficha">
            <span>Valor na Ficha:</span>
            <span>{valorNaFicha.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        )}
        <div className="summary-row total-row">
          <span>Total Geral:</span>
          <span className="total-amount">{precoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>
    </div>
  );
}

export default Details;
