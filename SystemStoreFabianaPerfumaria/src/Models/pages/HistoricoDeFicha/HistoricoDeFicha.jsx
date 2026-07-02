import { Link } from "react-router-dom";
import "./HistoricoDeFicha.css";
import { FcViewDetails } from "react-icons/fc";
import { LuPrinter } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { MdDone } from "react-icons/md";

import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

function HistoricoDeFicha() {
  const [isOpen, setIsOpen] = useState(false);
  const [fichas, setFichas] = useState([]);
  const [abaterFicha, setAbaterFicha] = useState(false);
  const [fichaSelacionada, setFichaSelecionada] = useState([]);
  const [searchCliente, setSearchCliente] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [valorNaFicha, setValorNaFicha] = useState("R$ 0,00");
  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;
  function formatarMoeda(e, setValor) {
    const valorNumerico = e.target.value.replace(/\D/g, "");
    const valorFormatado = (Number(valorNumerico) / 100).toLocaleString(
      "pt-BR",
      { style: "currency", currency: "BRL" }
    );
    setValor(valorFormatado);
  }

  function moedaParaNumero(valor) {
    return Number(
      valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
  }

  function toggleModal(idVenda) {
    const item = fichas.filter((item) => item.idVenda === idVenda);
    setFichaSelecionada(item);
    setIsOpen(true);
  }

  function fecharModal() {
    setIsOpen(false);
    setAbaterFicha(false);
    setValorNaFicha("R$ 0,00");
    setFichaSelecionada([]);
  }

  async function BuscarClienteComFichaEmAberto() {
    try {
      const response = await axios.get(
        `${url}/RealizarVenda/HistoricoCrediario?cliente=${searchCliente}&data=${searchDate}`
      );
      setFichas(response.data);
    } catch (error) {
      console.error("Erro ao buscar fichas:",error);
    }
  }

  useEffect(() => {
    BuscarClienteComFichaEmAberto();

  }, [searchCliente, searchDate]);

  async function AbaterValor() {
    if (!fichaSelacionada.length) return;

    const idVenda = fichaSelacionada[0].idVenda;
    const valor = moedaParaNumero(valorNaFicha);

    if (valor <= 0) return;

    try {
      await axios.post(
        `${url}/RealizarVenda/AbaterValor/${idVenda}`,
        { valorNaFicha: valor },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Ficha Abatida com sucesso");
      BuscarClienteComFichaEmAberto();
      setAbaterFicha(false);
      fecharModal();
    } catch(error) {
      alert("Erro ao abater valor.");
      console.error(error);
    }
  }

  const vendasUnicas = Object.values(
    fichas.reduce((acc, item) => {
      if (!acc[item.idVenda]) acc[item.idVenda] = item;
      return acc;
    }, {})
  );

  function LimitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }

  return (
    <main>
      <nav>
        <div className="navBar">
          <Link to={"/"}>
            <img src="img/SUBLOGO- BRONZE.png" width={100} height={100} />
          </Link>
          <h1>Fabiana Perfumaria</h1>
        </div>
      </nav>

      <section className="section-ficha">
        <div className="box-ficha">
          <h1 className="title-ficha">Historico de Ficha</h1>

          <div className="container-searchs">
            <input
              type="text"
              className="search-ficha"
              placeholder="Digite o Nome do Cliente"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />

            <input
              type="date"
              className="search-date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>

          <div className="container-table">
            <table className="table-ficha">
              <thead className="thead-ficha">
                <tr>
                  <th>Cliente</th>
                  <th>Produtos Vendidos</th>
                  <th>Valor Total</th>
                  <th colSpan={2}>Data da Venda</th>
                </tr>
              </thead>

              {vendasUnicas.length > 0 ? (
                <>
                  {vendasUnicas.map((item, index) => (
                    <tbody key={index} className="tbody-ficha">
                      <tr className="tr-ficha">
                        <td className="td-ficha">{item.comprador}</td>
                        <td className="td-ficha">
                          {LimitarNome(item.produtosVendidos, 15)}
                        </td>
                        <td className="td-ficha">
                          {item.valorNaFicha
                            ? parseFloat(item.valorNaFicha).toLocaleString(
                                "pt-BR",
                                { style: "currency", currency: "BRL" }
                              )
                            : "R$ 0,00"}
                        </td>
                        <td className="td-ficha">
                          {item.dataDaVenda
                            ? format(
                                new Date(item.dataDaVenda),
                                "dd/MM/yyyy"
                              )
                            : "-"}
                        </td>
                        <td className="td-ficha">
                          <button onClick={() => toggleModal(item.idVenda)} className="abrir-ficha">
                            <FcViewDetails size={30} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </>
              ) : (
                <tbody className="tbody-ficha">
                  <tr>
                    <td className="td-ficha" colSpan={5}>
                      Nenhum Cliente Encontrado
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>

        {isOpen && (
          <div className="abater-ficha-container">
            {fichaSelacionada.length > 0 && (
              <div className="abater-ficha-box">
                <div className="header-ficha">
                  <h1 className="nome-comprador">
                    {fichaSelacionada[0].comprador}
                  </h1>
                  <p>{fichaSelacionada[0].numeroDeTelefone}</p>
                  <p>
                    Data da Venda:{" "}
                    {format(
                      new Date(fichaSelacionada[0].dataDaVenda),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>

                {fichaSelacionada.map((item, index) => (
                  <p key={index} className="information-ficha">
                    {item.quantidade}x {item.nomeDoProduto} -{" "}
                    {item.precoUnitario
                      ? Number(item.precoUnitario).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"}
                  </p>
                ))}

                <div className="total-ficha">
                  <p>
                    Preço Total:{" "}
                    {fichaSelacionada[0].valorNaFicha
                      ? parseFloat(
                          fichaSelacionada[0].valorNaFicha
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"}
                  </p>
                </div>

                <div className="buttons-ficha">
                  
                  <button onClick={fecharModal} className="button-ficha">
                    <IoClose size={20} /> Sair da Ficha
                  </button>
                  <button onClick={() => setAbaterFicha(true)}>
                    <MdDone size={20} className="button-ficha" />
                    Abater Valor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {abaterFicha && (
          <div className="selecionar-valor-container">
            <div className="selecionar-valor-box">
              <div className="selecionar-valor-header">
                <p>Informe o valor recebido</p>
                <button
                  onClick={() => setAbaterFicha(false)}
                  className="button-fecha-valor"
                >
                  X
                </button>
              </div>
              <input
                type="text"
                value={valorNaFicha}
                onChange={(e) => formatarMoeda(e, setValorNaFicha)}
              />
              <button
                className="button-concluir-abatimento"
                onClick={AbaterValor}
              >
                Abater
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default HistoricoDeFicha;
