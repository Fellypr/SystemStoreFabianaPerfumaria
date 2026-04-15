import React from "react";
import QRCodeInsta from "../../../components/qrCode/Qrcode";
import { format } from "date-fns";
import "./HistoricoDeVenda.css";
const CupomFiscal = ({ vendaSelecionada }) => {
  const pagamentosTexto = (() => {
    const venda = vendaSelecionada?.[0] || {};
    const pagos = Array.isArray(venda.pagamentos) ? venda.pagamentos : null;
    const formas = Array.isArray(venda.formaDePagamento)
      ? venda.formaDePagamento
      : null;
    if (pagos && pagos.length > 0) {
      return pagos
        .map((p) => {
          const nome = p.formaPagamento || "";
          const v = Number(p.valor || 0);
          const vt =
            v > 0
              ? ` (${v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })})`
              : "";
          return `${nome}${vt}`;
        })
        .join(" + ");
    }
    if (formas && formas.length > 0) {
      return formas
        .map((p) => {
          const nome = p.formaPagamento || "";
          const v = Number(p.valor || 0);
          const vt =
            v > 0
              ? ` (${v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })})`
              : "";
          return `${nome}${vt}`;
        })
        .join(" + ");
    }
    if (venda.formaDePagamento && typeof venda.formaDePagamento === "object") {
      const nome = venda.formaDePagamento.formaPagamento || "";
      const v = Number(venda.formaDePagamento.valor || 0);
      const vt =
        v > 0
          ? ` (${v.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })})`
          : "";
      return `${nome}${vt}`;
    }
    return venda.formaDePagamento || "Não informado";
  })();
  return (
    <div
      style={{
        border: "none",
        padding: "0px",
        margin: "0 auto",
        fontSize: "0.8rem",
        width: "200px",
        lineHeight: "1.2",
        height: "auto",
        backgroundColor: "rgb(255, 255, 255)",
        color: "black",
      }}
      className="notaCardHistoricoDeVenda"
    >
      <h3
        style={{
          textAlign: "center",
          fontSize: "1rem",
          margin: "5px 0",
        }}
      >
        Fabiana Perfumaria
      </h3>
      <p style={{ textAlign: "center", fontSize: "0.7rem", margin: "0" }}>
        Rua DR.Rômulo De Almeida,65 <br /> São Miguel Dos Campos/AL
      </p>
      <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
      <p style={{ textAlign: "center", margin: "5px 0" }}>
        DOCUMENTO AUXILIAR DA NFCE
      </p>
      <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
      <p style={{ margin: "5px 0" }}>
        Emissão: {format(new Date(vendaSelecionada[0].dataDaVenda), "dd/MM/yyyy HH:mm:ss")}
      </p>
      {vendaSelecionada[0].comprador && (
        <p style={{ margin: "5px 0", fontSize: "16px" }}>
          Cliente: {vendaSelecionada[0].comprador}
        </p>
      )}
      <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
      <table
        style={{
          width: "100%",
          fontSize: "0.75rem",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th style={{ textAlign: "left", width: "40%" }}>PRODUTO</th>
            <th style={{ textAlign: "center", width: "15%" }}>QTD</th>
            <th style={{ textAlign: "center", width: "20%" }}>UN</th>
            <th style={{ textAlign: "right", width: "25%" }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {vendaSelecionada.map((item, index) => {
            const preco = parseFloat(item.precoUnitario || 0);
            const quantidade = item.quantidade || 0;
            const precoUnitario = preco / quantidade;
            return (
              <React.Fragment key={index}>
                <tr>
                  <td style={{ textAlign: "left", paddingLeft: "5px" }}>
                    {item.nomeDoProduto}
                  </td>
                  <td style={{ textAlign: "center" }}>{quantidade}</td>
                  <td style={{ textAlign: "center" }}>{precoUnitario.toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>{preco.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <hr
                      style={{
                        borderTop: "1px dashed #000",
                        margin: "5px 0",
                      }}
                    />
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
        <span>QTD. TOTAL DE ITENS: {vendaSelecionada.reduce((acc, item) => acc + (item.quantidade || 0), 0)}</span>
      </p>
      <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
        <span>DESCONTO TOTAL: R$ 0,00</span>
      </p>
      <p
        style={{
          fontSize: "0.9rem",
          fontWeight: "bold",
          margin: "5px 0",
        }}
      >
        <span>
          VALOR TOTAL R$:{" "}
          {Number(vendaSelecionada[0].precoTotal || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </p>
      <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
        <span>PAGAMENTO: {pagamentosTexto}</span>
      </p>
      <div
        className="qrCode"
        style={{ textAlign: "center", margin: "10px 0" }}
      >
        <QRCodeInsta />
        <p
          style={{
            fontSize: "0.7rem",
            margin: "0 0 0 0",
            padding: "5px",
          }}
        >
          Obrigado e volte sempre!
        </p>
      </div>
    </div>
  );
};

export default CupomFiscal;
