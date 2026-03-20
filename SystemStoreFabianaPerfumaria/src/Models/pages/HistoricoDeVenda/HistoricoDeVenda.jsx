import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ButtonTrashVenda from "../../../components/Button/ButtonTrashVendas";
import ButtonVoltar from "../../../components/Button/ButtonVoltar";

import "./HistoricoDeVenda.css";
import axios from "axios";

import {
  FaUser,
  FaWallet,
  FaChartLine,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";
import { FcViewDetails } from "react-icons/fc";
import { format } from "date-fns";
import Details from "../../../components/Details/details";
import CupomFiscal from "./DetalheDaVenda";

function HistoricoDeVenda() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);
  const [busca, setBusca] = useState("");
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [detalhes, setDetalhes] = useState(false);
  const [isClosingDetails, setIsClosingDetails] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [imprimir, setImprimir] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  useEffect(() => {
    if (imprimir) {
      setTimeout(() => {
        window.print();
        setImprimir(false);
      }, 300);
    }
  }, [imprimir]);

  async function cancelarVenda(idVenda) {
    if (
      !window.confirm(
        "Tem certeza que deseja cancelar esta venda? O estoque será reposto automaticamente.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${url}/RealizarVenda/cancelar-automatico/${idVenda}`);

      alert("Venda cancelada com sucesso!");

      setDetalhes(false);

      BuscandoVendas();
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      alert("Erro ao cancelar a venda. Verifique o console.");
    }
  }

  function mostrarDetalhes(idVenda) {
    const itensVenda = HistoricoDeVendasDeHoje.filter(
      (item) => item.idVenda === idVenda,
    );
    window.scrollTo(0, 0);
    setIsClosingDetails(false);
    setVendaSelecionada(itensVenda);
    setDetalhes(true);
    console.log(itensVenda);
  }

  function fecharDetalhes() {
    setIsClosingDetails(true);
    setTimeout(() => {
      setDetalhes(false);
      setImprimir(false);
      setVendaSelecionada(null);
      setIsClosingDetails(false);
    }, 300);
  }

  async function BuscandoVendas() {
    try {
      const response = await axios.get(`${url}/RealizarVenda/FiltrarVendas`, {
        params: {
          comprado: busca || null,
          formaDePagamento: formaDePagamento || null,
          dataInicial: dataInicio || null,
          dataFinal: dataFim || null,
        },
      });
      setHistoricoDeVendasDeHoje(response.data);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  }

  useEffect(() => {
    BuscandoVendas();
  }, [dataInicio, dataFim, busca, formaDePagamento]);

  function limitarNome(nome, limite = 7) {
    if (!nome) return "";
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + "...";
  }
  function textoFormaPagamento(item) {
    if (Array.isArray(item?.pagamentos) && item.pagamentos.length > 0) {
      return item.pagamentos
        .map((p) => {
          const n = p.formaPagamento || "";
          const v = Number(p.valor || 0);
          const vt =
            v > 0
              ? ` (${v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })})`
              : "";
          return `${n}${vt}`;
        })
        .join(" + ");
    }
    if (
      Array.isArray(item?.formaDePagamento) &&
      item.formaDePagamento.length > 0
    ) {
      return item.formaDePagamento
        .map((p) => {
          const n = p.formaPagamento || "";
          const v = Number(p.valor || 0);
          const vt =
            v > 0
              ? ` (${v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })})`
              : "";
          return `${n}${vt}`;
        })
        .join(" + ");
    }
    if (item?.formaDePagamento && typeof item.formaDePagamento === "object") {
      const n = item.formaDePagamento.formaPagamento || "";
      const v = Number(item.formaDePagamento.valor || 0);
      const vt =
        v > 0
          ? ` (${v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
          : "";
      return `${n}${vt}`;
    }
    return item?.formaDePagamento || "Não informado";
  }
  function classeFormaPagamento(item) {
    if (Array.isArray(item?.pagamentos) && item.pagamentos.length > 1)
      return "PagamentoDividido";
    if (
      Array.isArray(item?.formaDePagamento) &&
      item.formaDePagamento.length > 1
    )
      return "PagamentoDividido";
    if (
      Array.isArray(item?.formaDePagamento) &&
      item.formaDePagamento.length === 1
    )
      return item.formaDePagamento[0]?.formaPagamento || "NaoInformado";
    if (Array.isArray(item?.pagamentos) && item.pagamentos.length === 1)
      return item.pagamentos[0]?.formaPagamento || "NaoInformado";
    if (item?.formaDePagamento && typeof item.formaDePagamento === "object")
      return item.formaDePagamento.formaPagamento || "NaoInformado";
    return item?.formaDePagamento || "NaoInformado";
  }

  const vendasUnicas = Object.values(
    HistoricoDeVendasDeHoje.reduce((acc, item) => {
      if (!acc[item.idVenda]) acc[item.idVenda] = item;
      return acc;
    }, {}),
  );

  const totalVendido = vendasUnicas.reduce(
    (acc, v) => acc + (v.precoTotal || 0),
    0,
  );
  const totalFicha = vendasUnicas.reduce(
    (acc, v) => acc + (v.valorNaFicha || 0),
    0,
  );

  return (
    <>
      <nav>
        <div className="navBar">
          <Link to={"/"}>
            <img src="img/SUBLOGO- BRONZE.png" width={100} height={100} />
          </Link>
          <h1>Fabiana Perfumaria</h1>
        </div>
      </nav>
      <div className="dashboard-main">
        <div className="dashboard-container">
          <section className="dashboard-content">
            <div className="metrics-container">
              <div className="metric-card">
                <div className="metric-icon green">
                  <FaWallet />
                </div>
                <div className="metric-info">
                  <p>Total Vendido</p>
                  <h3>
                    {totalVendido.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </h3>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon orange">
                  <FaUser />
                </div>
                <div className="metric-info">
                  <p>Em Aberto (Ficha)</p>
                  <h3>
                    {totalFicha.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </h3>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon blue">
                  <FaChartLine />
                </div>
                <div className="metric-info">
                  <p>Qtd. Transações</p>
                  <h3>{vendasUnicas.length}</h3>
                </div>
              </div>
            </div>

            <div className="filter-card">
              <div className="filter-row">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Pesquisar cliente..."
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  onChange={(e) => setFormaDePagamento(e.target.value)}
                >
                  <option value="">Todas Formas de Pagamento</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Credito">Cartão de Crédito</option>
                  <option value="Debito">Cartão de Débito</option>
                  <option value="Pix">Pix</option>
                  <option value="Crediario">Ficha</option>
                  <option value="Pagamento dividido">Pagamento Dividido</option>
                </select>
                <div className="date-group">
                  <div className="date-input">
                    <FaCalendarAlt />
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <span>Até</span>
                  <div className="date-input">
                    <FaCalendarAlt />
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="table-container-pro">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Produtos</th>
                    <th>Pagamento</th>
                    <th>Total</th>
                    <th>Saldo Ficha</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasUnicas.map((item) => (
                    <tr
                      key={item.idVenda}
                      onClick={() => mostrarDetalhes(item.idVenda)}
                      className="modern-table-row"
                    >
                      <td className="font-bold">{item.comprador}</td>
                      <td className="text-muted">
                        {limitarNome(item.nomeDoProduto)}
                      </td>
                      <td>
                        <span className={`badge ${classeFormaPagamento(item)}`}>
                          {textoFormaPagamento(item)}
                        </span>
                      </td>
                      <td className="font-bold">
                        {(item.precoTotal || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td
                        className={
                          item.valorNaFicha > 0 ? "text-danger" : "text-success"
                        }
                      >
                        {item.valorNaFicha === 0
                          ? "Sem ficha"
                          : item.valorNaFicha.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                      </td>
                      <td>
                        {item.dataDaVenda
                          ? format(new Date(item.dataDaVenda), "dd/MM/yyyy")
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          
        </div>
        {detalhes && (
          <Details 
            vendaSelecionada={vendaSelecionada} 
            onCancel={cancelarVenda}
            onPrint={() => setImprimir(true)}
            onBack={fecharDetalhes}
            isClosing={isClosingDetails}
          />
        )}
        
        {imprimir && (
          <div className="print-only-container">
            <CupomFiscal vendaSelecionada={vendaSelecionada} />
          </div>
        )}
      </div>
    </>
  );
}

export default HistoricoDeVenda;
