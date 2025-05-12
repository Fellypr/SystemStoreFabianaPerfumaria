import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HistoricoDeVenda.css";
import axios from "axios";

import { FaUser } from "react-icons/fa";
import { BiSolidUserDetail } from "react-icons/bi";
import { MdCancel } from "react-icons/md";

import { format } from "date-fns";
function HistoricoDeVenda() {
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [detalhes, setDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const [valorDaFicha, setValorDaFicha] = useState("R$ 0,00");
  const [valorLimpo, setValorLimpo] = useState(0);
  const [fichaAbatida, setFichaAbatida] = useState(false);

  function AbaterFicha() {
    fichaAbatida(true);
  }

  function mostrarDetalhes(venda) {
    setVendaSelecionada(venda);
    setDetalhes(true);
  }
  function fecharDetalhes() {
    setDetalhes(false);
    setVendaSelecionada(null);
  }

  async function BuscandoVendas() {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/RealizarVenda/FiltrarVendas",
        {
          nomeDoComprado: busca,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setVendas(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    if (busca.trim().length > 0) {
      BuscandoVendas();
    } else {
      setVendas([]);
    }
  }, [busca]);

  // eslint-disable-next-line no-redeclare
  async function AbaterFicha() {
    window.confirm("Tem certeza que deseja abater a ficha?");
    try {
      const response = await axios.post(
        `http://localhost:5080/api/RealizarVenda/AbaterValor/${vendaSelecionada.id_Venda}`,
        {
          IdVenda: vendaSelecionada.id_venda,
          ValorNaFicha: valorLimpo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Ficha Abatida com sucesso");
      window.location.reload();
      BuscandoVendas();
    } catch (error) {
      alert("Erro ao Abater Ficha", error);
    }
  }
  function formatarMoeda(e, setValor) {
    const valor = e.target.value.replace(/\D/g, "");
    const valorNumero = Number(valor) / 100;

    const valorFormatado = valorNumero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setValor(valorFormatado);
    setValorLimpo(valorNumero);
  }
  return (
    <>
      <div className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>Historico De Vendas</h1>
      </div>
      <section className="HistoricoDeVendaContainer">
        <div className="BuscarHistorico">
          <div className="InputsPesquisaDeVenda">
            <form>
              <input type="date" />
              <input
                type="text"
                placeholder="Nome do Cliente"
                onChange={(e) => setBusca(e.target.value)}
              />
              <select className="select">
                <option value="">Pesquisar Pela Forma De Pagamento</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="CartaoDeCredito">Cartão de Credito</option>
                <option value="CartaoDeDebito">Cartão de Debito</option>
                <option value="Pix">Pix</option>
                <option value="Ficha">Ficha</option>
              </select>
            </form>
          </div>
          <table border={1} className="TabelaHistoricoDeVenda">
            <thead>
              <tr>
                <th>Nome do Cliente</th>
                <th>produtos vendidos</th>
                <th>Valor Total</th>
                <th>Forma De Pagamento</th>
                <th colSpan={2}>Data Da Venda</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.IdVenda}>
                  <td>{venda.comprador}</td>
                  <td>{venda.nomeDoProduto}</td>
                  <td>
                    {venda?.precoTotal !== undefined
                      ? parseFloat(venda.precoTotal).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"}
                  </td>
                  <td>{venda.formaDePagamento}</td>
                  <td>{format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}</td>
                  <td width={40}>
                    <button onClick={() => mostrarDetalhes(venda)}>
                      <BiSolidUserDetail size={25} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detalhes && (
        <div
          className={
            detalhes ? "ConteudoDoHistorico" : "ConteudoDoHistoricoNone"
          }
        >
          <div className="InformacoesSobreOCliente">
            <FaUser fontSize={150} />
            <p>{vendaSelecionada.comprador}</p>
          </div>

          <div className="HistoricoDaVenda">
            <button onClick={fecharDetalhes} className="BotaoFechar">
              <MdCancel size={35} />
            </button>
            <h2 style={{ textAlign: "center" }}>Detalhe da Compra</h2>
            <p>
              <strong>Produtos Vendidos:</strong>
              <br />
              {vendaSelecionada.nomeDoProduto}
            </p>
            <p>
              <strong>Quantidade De Produtos:</strong>
              <br />
              {vendaSelecionada.quantidadeTotal}
            </p>
            <p>
              <strong>Valor Total:</strong>
              <br />
              {vendaSelecionada?.precoTotal !== undefined
                ? parseFloat(vendaSelecionada.precoTotal).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )
                : "R$ 0,00"}
            </p>
            <p>
              <strong>Forma De Pagamento:</strong>
              <br />
              {vendaSelecionada?.formaDePagamento === "Ficha" ? (
                <>
                  Ficha <br />
                  Valor a Abater:{" "}
                  {vendaSelecionada?.valorNaFicha !== undefined
                    ? parseFloat(vendaSelecionada.valorNaFicha).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )
                    : "R$ 0,00"}
                  <button
                    className="VerFicha"
                    onClick={() => setFichaAbatida(true)}
                    disabled={vendaSelecionada?.valorNaFicha === 0}
                    style={{cursor: vendaSelecionada?.valorNaFicha === 0 ? "not-allowed" : "pointer"}}
                  >
                    Ver Ficha
                  </button>
                </>
              ) : (
                vendaSelecionada?.formaDePagamento
              )}
            </p>

            <p>
              <strong>Data e horas Da Venda:</strong>
              <br />
              Data:{" "}
              {format(
                new Date(vendaSelecionada.dataDaVenda),
                "dd/MM/yyyy  -  HH:mm:ss"
              )}
            </p>
          </div>

          <div
            className={fichaAbatida === true ? "abaterFicha" : "HiddenAbater"}
          >
            <button
              className="ButtonClosedFicha"
              onClick={() => setFichaAbatida(false)}
            >
              <MdCancel size={35} />
            </button>
            <h3>
              valor a abater: R${" "}
              {vendaSelecionada?.valorNaFicha !== undefined
                ? parseFloat(vendaSelecionada.valorNaFicha).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )
                : "R$ 0,00"}
            </h3>
            <input
              type="text"
              placeholder="Digite o valor a abater"
              value={valorDaFicha}
              onChange={(e) => formatarMoeda(e, setValorDaFicha)}
            />
            <button className="abaterButton" onClick={AbaterFicha} disabled={valorLimpo > vendaSelecionada?.valorNaFicha} style={{cursor: valorLimpo > vendaSelecionada?.valorNaFicha ? "not-allowed" : "pointer"}}>
              Abater
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default HistoricoDeVenda;
