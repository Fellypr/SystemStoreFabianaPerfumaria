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
import CupomFiscal from "./DetalheDaVenda";

function HistoricoDeVenda() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);
  const [busca, setBusca] = useState("");
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [detalhes, setDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

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
    setVendaSelecionada(itensVenda);
    setDetalhes(true);
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
    <div className="dashboard-container">
      <header>
        <nav>
          <div className="navBar">
            <Link to={"/"}>
              <img
                src="img/SUBLOGO- BRONZE.png"
                width={100}
                height={100}
                alt="Logo"
              />
            </Link>
            <h1>Fabiana Perfumaria</h1>
          </div>
        </nav>
      </header>

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
              <option value="Espécie">Dinheiro</option>
              <option value="CartaoDeCredito">Cartão de Crédito</option>
              <option value="CartaoDeDebito">Cartão de Débito</option>
              <option value="PagoNoPix">Pix</option>
              <option value="Crediario">Ficha</option>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasUnicas.map((item) => (
                <tr key={item.idVenda}>
                  <td className="font-bold">{item.comprador}</td>
                  <td className="text-muted">
                    {limitarNome(item.nomeDoProduto)}
                  </td>
                  <td>
                    <span className={`badge ${item.formaDePagamento}`}>
                      {item.formaDePagamento}
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
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => mostrarDetalhes(item.idVenda)}
                    >
                      <FcViewDetails size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detalhes && vendaSelecionada && (
        <div className="ticket-main">
          <div className="botoes-historico-container">
            <button
              className="excluir-venda"
              onClick={() => cancelarVenda(vendaSelecionada[0].idVenda)}
            >
              <ButtonTrashVenda />
            </button>

            <button className="imprimir-nota" onClick={() => window.print()}>
              Baixar PDF
            </button>
            <button
              onClick={() => setDetalhes(false)}
              className="volta-historico"
            >
              <ButtonVoltar />
            </button>
          </div>

          <CupomFiscal vendaSelecionada={vendaSelecionada} />
        </div>
      )}
    </div>
  );
}

export default HistoricoDeVenda;
