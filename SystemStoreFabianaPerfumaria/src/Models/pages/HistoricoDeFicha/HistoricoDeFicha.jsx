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
      { style: "currency", currency: "BRL" },
    );
    setValor(valorFormatado);
  }

  function moedaParaNumero(valor) {
    return Number(
      valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
    );
  }

  function toggleModal(idCliente) {
    const item = dono_da_ficha.filter((item) => item.id === idCliente);
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
        `${url}/RealizarVenda/HistoricoCrediario?cliente=${searchCliente}&data=${searchDate}`,
      );
      setFichas(response.data);
      console.log("aqui estar as vendas encontradas ao todo:", response.data);
    } catch (error) {
      console.error("Erro ao buscar fichas:", error);
    }
  }

  useEffect(() => {
    BuscarClienteComFichaEmAberto();
  }, [searchCliente, searchDate]);

  async function AbaterValor() {
    if (!fichaSelacionada.length) return;

    const idVenda = fichaSelacionada[0]?.vendas?.[0]?.id_venda;
    const id = fichaSelacionada[0].id;
    const valor = moedaParaNumero(valorNaFicha);

    if (valor <= 0) return;

    try {
      await axios.post(
        `${url}/RealizarVenda/AbaterValor/${idVenda}/${id}`,
        { valorNaFicha: valor },
        { headers: { "Content-Type": "application/json" } },
      );
      alert("Ficha Abatida com sucesso");
      BuscarClienteComFichaEmAberto();
      setAbaterFicha(false);
      fecharModal();
    } catch (error) {
      alert("Erro ao abater valor.");
      console.error(`error ao abater valor de ids de vendas ${idVenda} e ${id}: ${error}`);
    }
  }

  const vendasUnicas = Object.values(
    fichas.reduce((acc, item) => {
      const idVenda = item.idVenda;
      if (!acc[idVenda]) {
        acc[idVenda] = {
          id: idVenda,
          id_cliente: item.idCliente,
          valorDoProduto: item.valorNaFicha,
          dataDaVenda: item.dataDaVenda,
          nomeDosProdutos: [
            {
              produto: item.nomeDoProduto,
              quantidade_unitaria: item.quantidade,
              preco_unitario: item.precoUnitario,
            },
          ],
          total: item.valorNaFicha,
          idCliente: item.idCliente,
          comprador: item.comprador,
          numeroDeTelefone: item.numeroDeTelefone,
        };
      } else {
        acc[idVenda].nomeDosProdutos.push({
          produto: item.nomeDoProduto,
          quantidade_unitaria: item.quantidade,
          preco_unitario: item.precoUnitario,
        });
      }
      return acc;
    }, {}),
  );

  const dono_da_ficha = Object.values(
    vendasUnicas.reduce((acc, item) => {
      const id_cliente = item.id_cliente;
      if (!acc[id_cliente]) {
        acc[id_cliente] = {
          id: id_cliente,
          comprador: item.comprador,
          valor_total: item.total,
          telefone: item.numeroDeTelefone,
          vendas: [
            {
              id_venda: item.id,
              valorDoProduto: item.total,
              nomeDosProdutos: item.nomeDosProdutos.map((produto) => ({
                produto: produto.produto,
                quantidade_unitaria: produto.quantidade_unitaria,
                preco_unitario: produto.preco_unitario,
              })),
              dataDaVenda: item.dataDaVenda,
            },
          ],
        };
      } else {
        acc[id_cliente].valor_total += item.total;
        acc[id_cliente].vendas.push({
          id_venda: item.id,
          valorDoProduto: item.total,
          nomeDosProdutos: item.nomeDosProdutos.map((produto) => ({
            produto: produto.produto,
            quantidade_unitaria: produto.quantidade_unitaria,
            preco_unitario: produto.preco_unitario,
          })),
          dataDaVenda: item.dataDaVenda,
        });
      }
      return acc;
    }, {}),
  );
  console.log("aqui estar os donos da ficha", dono_da_ficha);
  console.log("aqui estar as vendas selecionadas", fichaSelacionada);

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
          <h1 className="title-ficha">Histórico de Ficha</h1>

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
                  <th>Data da Venda</th>
                </tr>
              </thead>

              {dono_da_ficha.length > 0 ? (
                <tbody className="tbody-ficha">
                  {dono_da_ficha.map((item) => (
                    <tr
                      key={item.id}
                      className="tr-ficha"
                      onClick={() => toggleModal(item.id)}
                    >
                      <td className="td-ficha">{item.comprador}</td>
                      <td className="td-ficha">
                        {item.vendas[0].nomeDosProdutos
                          .map((produto) => produto.produto)
                          .join(", ")}
                      </td>
                      <td className="td-ficha valor-total">
                        {item.valor_total
                          ? parseFloat(item.valor_total).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )
                          : "R$ 0,00"}
                      </td>
                      <td className="td-ficha">
                        {item.vendas.map((item) => item.dataDaVenda).at(-1)
                          ? format(
                              new Date(
                                item.vendas
                                  .map((item) => item.dataDaVenda)
                                  .at(-1),
                              ),
                              "dd/MM/yyyy",
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="tbody-ficha">
                  <tr>
                    <td className="td-ficha" colSpan={4}>
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
              <div className="abater-ficha-box" key={fichaSelacionada[0].id}>
                <div className="header-ficha">
                  <div className="client-info">
                    <h1 className="nome-comprador">
                      {fichaSelacionada?.[0]?.comprador}
                    </h1>
                    <p className="telefone">
                      <span>📞</span> {fichaSelacionada?.[0]?.telefone}
                    </p>
                  </div>
                  <button onClick={fecharModal} className="close-modal-btn">
                    <IoClose size={24} />
                  </button>
                </div>

                <div className="vendas-list">
                  {fichaSelacionada?.[0]?.vendas?.map((item2) => (
                    <div key={item2.id} className="venda-item">
                      <div className="venda-date">
                        📅{" "}
                        {item2.dataDaVenda
                          ? format(new Date(item2.dataDaVenda), "dd/MM/yyyy")
                          : "-"}
                      </div>
                      <div className="produtos-list">
                        {item2.nomeDosProdutos?.map((produto, index) => (
                          <div key={index} className="produto-item">
                            <span className="produto-quantidade">
                              {produto.quantidade_unitaria}x
                            </span>
                            <span className="produto-nome">
                              {produto.produto}
                            </span>
                            <span className="produto-preco">
                              {produto.preco_unitario
                                ? parseFloat(
                                    produto.preco_unitario,
                                  ).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "R$ 0,00"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="Total-abater-valor-venda">Falta abater : R$ {item2.valorDoProduto ? parseFloat(item2.valorDoProduto).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}</span>
                    </div>
                  ))}
                </div>

                <div className="total-ficha">
                  <span className="total-label">Total da Ficha:</span>
                  <span className="total-valor">
                    {fichaSelacionada?.[0]?.valor_total
                      ? parseFloat(
                          fichaSelacionada[0].valor_total,
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"}
                  </span>
                </div>

                <div className="buttons-ficha">
                  <button
                    onClick={fecharModal}
                    className="button-ficha btn-cancelar"
                  >
                    <IoClose size={20} /> Sair
                  </button>
                  <button
                    onClick={() => setAbaterFicha(true)}
                    className="button-ficha btn-abater"
                  >
                    <MdDone size={20} />
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
                <p>💵 Informe o valor recebido</p>
                <button
                  onClick={() => setAbaterFicha(false)}
                  className="button-fecha-valor"
                >
                  <IoClose size={20} />
                </button>
              </div>
              <div className="input-wrapper">
                <span className="currency-icon">R$</span>
                <input
                  type="text"
                  value={valorNaFicha}
                  onChange={(e) => formatarMoeda(e, setValorNaFicha)}
                  placeholder="0,00"
                />
              </div>
              <button
                className="button-concluir-abatimento"
                onClick={AbaterValor}
                disabled={(fichaSelacionada?.[0]?.valor_total ?? 0) < valorNaFicha}
              >
                Confirmar Abatimento
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default HistoricoDeFicha;
