import "./HistoricoEEstatistica.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

import { FaPix } from "react-icons/fa6";
import { CiCreditCard2 } from "react-icons/ci";
import { GiMoneyStack } from "react-icons/gi";
import { FaRegIdCard } from "react-icons/fa6";

function HistoricoEEstatistica() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);

  const [inputFormadePagamento, setInputFormadePagamento] = useState("");

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  async function FechandoCaixa() {
    try {
      const response = await axios.get(
        `${url}/RealizarVenda/VendasRealizadas?formaDepagamento=${inputFormadePagamento}`,
      );
      setHistoricoDeVendasDeHoje(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
    }
  }

  useEffect(() => {
    FechandoCaixa();
  }, [inputFormadePagamento]);

  const totalVendidoHoje = HistoricoDeVendasDeHoje.reduce((total, venda) => {
    return total + (parseFloat(venda.precoTotal) || 0);
  }, 0);

  const formaPagamentoLabel = (item) => {
    const fp = item.formaDePagamento;
    if (Array.isArray(fp)) {
      if (fp.length > 1) return "Pagamento dividido";
      return fp[0]?.formaPagamento || "Não informado";
    }
    return fp || "Não informado";
  };

  const filtrarValoresTotaisDeHoje = Object.values(
    HistoricoDeVendasDeHoje.reduce((acc, item) => {
      const chave = formaPagamentoLabel(item);
      if (!acc[chave]) acc[chave] = item;
      return acc;
    }, {}),
  );

  const totaisPorForma = HistoricoDeVendasDeHoje.reduce((acc, item) => {
    if (Array.isArray(item.pagamentos) && item.pagamentos.length > 0) {
      item.pagamentos.forEach((p) => {
        const metodo = p.formaPagamento || "Não informado";
        const valor = Number(p.valor || 0);
        acc[metodo] = (acc[metodo] || 0) + valor;
      });
    } else if (Array.isArray(item.formaDePagamento) && item.formaDePagamento.length > 0) {
      item.formaDePagamento.forEach((p) => {
        const metodo = p.formaPagamento || "Não informado";
        const valor = Number(p.valor || 0);
        acc[metodo] = (acc[metodo] || 0) + valor;
      });
    } else {
      const metodo = formaPagamentoLabel(item);
      const valor = parseFloat(item.precoTotal) || 0;
      acc[metodo] = (acc[metodo] || 0) + valor;
    }
    return acc;
  }, {});



  return (
    <>
      <div className="navBar">
        <Link to={"/"}>
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>📊 Vendas De Hoje</h1>
      </div>

      <div className="TotalVendidoDoDia">
        <div className="containerGrafico">
          <div className="resultado-vendas-geral-container">
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <FaPix  size={50} color="#4DB8AA"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#4DB8AA"}}>
                <p>Pix</p>
                <span>
                  {(totaisPorForma.Pix || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <GiMoneyStack  size={50} color="#24d600"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#25b109"}}>
                <p>Dinheiro</p>
                <span>
                  {(totaisPorForma.Dinheiro || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
            
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <CiCreditCard2  size={50} color="#14165A"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#14165A"}}>
                <p>Cartão Credito</p>
                <span>
                  {(totaisPorForma.Credito || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <CiCreditCard2  size={50} color="#090df5"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#090df5"}}>
                <p>Cartão Debito</p>
                <span>
                  {(totaisPorForma.Debito || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <FaRegIdCard  size={50} color="#08cde7"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#08cde7"}}>
                <p>Crediario</p>
                <span>
                  {(totaisPorForma.Crediario || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

          </div>
          <div className="TabelaDeVendasDeHoje">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Valor Total</th>
                  <select
                    onChange={(e) => setInputFormadePagamento(e.target.value)}
                    className="select-forma-de-pagamento"
                  >
                    <option value="">Todas</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Credito">Credito</option>
                    <option value="Debito">Debito</option>
                    <option value="Crediario">Ficha</option>
                    <option value="Pagamento dividido">Pagamento Dividido</option>
                  </select>
                  <th>Ficha</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {HistoricoDeVendasDeHoje.map((venda, idx) => (
                  <tr key={venda.idVenda ?? venda.IdVenda ?? idx}>
                    <td data-label="Cliente">{venda.comprador}</td>
                    <td data-label="Produto">{venda.nomeDoProduto}</td>
                    <td data-label="Valor Total">
                      {venda.precoTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td data-label="Pagamento">
                      {Array.isArray(venda.formaDePagamento)
                        ? venda.formaDePagamento
                            .map((p) => {
                              const nome = p.formaPagamento || "";
                              const valorNum = Number(p.valor || 0);
                              const valorTxt =
                                valorNum > 0
                                  ? ` (${valorNum.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })})`
                                  : "";
                              return `${nome}${valorTxt}`;
                            })
                            .join(" + ")
                        : venda.formaDePagamento}
                    </td>
                    <td data-label="Ficha">
                      {venda?.valorNaFicha === 0
                        ? "Paga"
                        : venda?.valorNaFicha !== undefined
                          ? parseFloat(venda.valorNaFicha).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )
                          : "R$ 0,00"}
                    </td>
                    <td data-label="Data">
                      {format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="TotalVendido">
            <p>Total Vendido Hoje:</p>
            <p className="valorTotal">
              {totalVendidoHoje.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HistoricoEEstatistica;
