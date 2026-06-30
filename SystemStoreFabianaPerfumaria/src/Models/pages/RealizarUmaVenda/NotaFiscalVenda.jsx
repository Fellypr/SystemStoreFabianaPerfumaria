import React from "react";
import QRCodeInsta from "../../../components/qrCode/Qrcode";

const formatarValor = (valor) => {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatarPagamento = (formaDePagamento, pagamentosDivididos) => {
  if (formaDePagamento !== "Pagamento dividido") {
    return formaDePagamento || "Nao informado";
  }

  const pagamentosValidos = pagamentosDivididos.filter(
    (pagamento) => pagamento.method && Number(pagamento.amount) > 0,
  );

  if (!pagamentosValidos.length) {
    return "Pagamento dividido";
  }

  return pagamentosValidos
    .map((pagamento) => `${pagamento.method} (${formatarValor(pagamento.amount)})`)
    .join(" + ");
};

const calcularTotalItem = (item) => {
  const preco = Number.parseFloat(item.precoVenda) || 0;
  const quantidade = Number(item.quantidade) || 0;
  const desconto = Number.parseFloat(item.desconto?.replace(/\D/g, "") || 0) / 100;

  return preco * quantidade - desconto;
};

export default function NotaFiscalVenda({
  produtos,
  quantidadeTotal,
  descontoTotal,
  valorTotal,
  formaDePagamento,
  pagamentosDivididos,
  cliente,
  incluirQrCode,
  onQrReady,
}) {
  const dataEmissao = new Date();

  if (!produtos.length) {
    return null;
  }

  return (
    <div id="nota-fiscal" className="NotaFiscal print-only-nota">
      <div className="notaCard">
        <h3 className="nota-loja">Fabiana Perfumaria</h3>
        <p className="nota-endereco">
          Rua DR.Romulo De Almeida,65 <br /> Sao Miguel Dos Campos/AL
        </p>
        <hr className="nota-sep" />
        <p className="nota-titulo">DOCUMENTO AUXILIAR DA NFCE</p>
        <hr className="nota-sep" />
        <p className="nota-info">
          Emissao: {dataEmissao.toLocaleDateString("pt-BR")}{" "}
          {dataEmissao.toLocaleTimeString("pt-BR")}
        </p>
        {cliente && <p className="nota-info-cliente">Cliente: {cliente}</p>}
        <hr className="nota-sep" />

        <table className="nota-produtos">
          <thead className="nota-produtos-head">
            <tr>
              <th className="nota-produto">PRODUTO</th>
              <th className="nota-qtd">QTD</th>
              <th className="nota-valor">UN</th>
              <th className="nota-valor">TOTAL</th>
            </tr>
          </thead>
          <tbody className="nota-produtos-body">
            {produtos.map((item, index) => {
              const preco = Number.parseFloat(item.precoVenda) || 0;
              const totalItem = calcularTotalItem(item);

              return (
                <React.Fragment key={`${item.id_produto || item.nomeDoProduto}-${index}`}>
                  <tr>
                    <td className="nota-produto">{item.nomeDoProduto}</td>
                    <td className="nota-qtd">{item.quantidade}</td>
                    <td className="nota-valor">{preco.toFixed(2)}</td>
                    <td className="nota-valor">{totalItem.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4}>
                      <hr className="nota-sep nota-sep-item" />
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <p className="nota-info">QTD. TOTAL DE ITENS: {quantidadeTotal}</p>
        <p className="nota-info">DESCONTO TOTAL: {descontoTotal}</p>
        <p className="nota-total">VALOR TOTAL R$: {valorTotal}</p>
        <p className="nota-info nota-pagamento">
          PAGAMENTO: {formatarPagamento(formaDePagamento, pagamentosDivididos)}
        </p>

        {incluirQrCode && (
          <div className="qrCode">
            <QRCodeInsta onReady={onQrReady} />
          </div>
        )}

        <p className={incluirQrCode ? "nota-rodape" : "nota-rodape nota-rodape-sem-qr"}>
          Obrigado e volte sempre!
        </p>
      </div>
    </div>
  );
}
