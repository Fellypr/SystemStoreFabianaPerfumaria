import { Link, useLocation, useSearchParams } from "react-router-dom";
import "./HistoricoDeFicha.css";
import { MdOutlineDone } from "react-icons/md";
import { IoClose, IoArrowUndoOutline } from "react-icons/io5";
import { MdDone } from "react-icons/md";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";

function HistoricoDeFicha() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateFromNavigate = location.state;

  const clienteNomeParam = searchParams.get("clienteNome");
  const clienteIdParam = searchParams.get("clienteId");
  const abrirModalParam = searchParams.get("abrirModal");

  const clienteNomeInicial =
    stateFromNavigate?.clienteNome ??
    (clienteNomeParam ? decodeURIComponent(clienteNomeParam) : "");
  const clienteIdInicial =
    stateFromNavigate?.clienteId ??
    (clienteIdParam && clienteIdParam !== "" ? Number(clienteIdParam) : null);
  const abrirModalInicial = Boolean(
    stateFromNavigate?.abrirModal ?? abrirModalParam === "1",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [fichas, setFichas] = useState([]);
  const [abaterFicha, setAbaterFicha] = useState(false);
  const [fichaSelacionada, setFichaSelecionada] = useState([]);
  const [searchCliente, setSearchCliente] = useState(clienteNomeInicial);
  const [searchDate, setSearchDate] = useState("");
  const [valorNaFicha, setValorNaFicha] = useState("R$ 0,00");
  const [historicoVendasAbertas, setHistoricoVendasAbertas] = useState({});
  const [desfazendoVendaId, setDesfazendoVendaId] = useState(null);
  const idClienteViaLinkRef = useRef(clienteIdInicial);
  const abrirModalViaLinkRef = useRef(abrirModalInicial);
  const tentativasAbrirModalRef = useRef(0);
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

  function toggleHistoricoVenda(idVenda) {
    setHistoricoVendasAbertas((prev) => ({
      ...prev,
      [idVenda]: !prev[idVenda],
    }));
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
    setHistoricoVendasAbertas({});
  }

  async function BuscarClienteComFichaEmAberto() {
    try {
      const response = await axios.get(
        `${url}/RealizarVenda/HistoricoCrediario?cliente=${searchCliente}&data=${searchDate}`,
      );
      setFichas(response.data);
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
      console.error(
        `error ao abater valor de ids de vendas ${idVenda} e ${id}: ${error}`,
      );
    }
  }

  async function desfazerUltimoAbatimento(idVenda, abatimento) {
    if (!idVenda) return;

    const valorFormatado = abatimento?.valorAbatido
      ? parseFloat(abatimento.valorAbatido).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "este valor";

    const dataFormatada = abatimento?.dataAbatimento
      ? format(new Date(abatimento.dataAbatimento), "dd/MM/yyyy HH:mm")
      : "";

    const confirmacao = window.confirm(
      `Deseja realmente desfazer o último abatimento de ${valorFormatado}${
        dataFormatada ? ` realizado em ${dataFormatada}` : ""
      }?\n\nO valor retornará para o saldo da venda.`,
    );

    if (!confirmacao) return;

    try {
      setDesfazendoVendaId(idVenda);
      const response = await axios.delete(
        `${url}/RealizarVenda/DesfazerUltimoAbatimento/${idVenda}`,
      );
      alert(response.data?.mensagem || "Abatimento desfeito com sucesso!");
      await BuscarClienteComFichaEmAberto();
    } catch (error) {
      const msgErro =
        error.response?.data?.mensagem ||
        error.response?.data ||
        "Erro ao desfazer o abatimento.";
      alert(typeof msgErro === "string" ? msgErro : "Erro ao desfazer o abatimento.");
      console.error("Erro ao desfazer abatimento:", error);
    } finally {
      setDesfazendoVendaId(null);
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
          abatimentos: [],
          total: item.valorNaFicha,
          idCliente: item.idCliente,
          comprador: item.comprador,
          numeroDeTelefone: item.numeroDeTelefone,
        };
      } else {
        const produtoJaExiste = acc[idVenda].nomeDosProdutos.some(
          (p) => p.produto === item.nomeDoProduto,
        );
        if (!produtoJaExiste) {
          acc[idVenda].nomeDosProdutos.push({
            produto: item.nomeDoProduto,
            quantidade_unitaria: item.quantidade,
            preco_unitario: item.precoUnitario,
          });
        }
      }

      if (item.dataAbatimento && item.valorAbatido != null) {
        const jaAdicionado = acc[idVenda].abatimentos.some(
          (a) =>
            a.dataAbatimento === item.dataAbatimento &&
            a.valorAbatido === item.valorAbatido,
        );

        if (!jaAdicionado) {
          acc[idVenda].abatimentos.push({
            valorAbatido: item.valorAbatido,
            dataAbatimento: item.dataAbatimento,
          });

          acc[idVenda].abatimentos.sort(
            (a, b) => new Date(a.dataAbatimento) - new Date(b.dataAbatimento),
          );
        }
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
              abatimentos: item.abatimentos,
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
          abatimentos: item.abatimentos,
        });
      }
      return acc;
    }, {}),
  );

  useEffect(() => {
    if (!abrirModalViaLinkRef.current) return;
    if (!dono_da_ficha?.length) return;

    const idAlvo = idClienteViaLinkRef.current;
    const nomeAlvo =
      stateFromNavigate?.clienteNome ??
      (clienteNomeParam ? decodeURIComponent(clienteNomeParam) : null);
    let itemEncontrado = null;

    if (idAlvo != null) {
      itemEncontrado = dono_da_ficha.find((item) => item.id === idAlvo);
    }
    if (!itemEncontrado && nomeAlvo) {
      const nome = String(nomeAlvo).toLowerCase().trim();
      itemEncontrado = dono_da_ficha.find(
        (item) =>
          String(item.comprador ?? "")
            .toLowerCase()
            .trim() === nome,
      );
    }

    if (itemEncontrado) {
      tentativasAbrirModalRef.current = 0;
      abrirModalViaLinkRef.current = false;
      toggleModal(itemEncontrado.id);
      return;
    }

    tentativasAbrirModalRef.current =
      (tentativasAbrirModalRef.current || 0) + 1;
    if (tentativasAbrirModalRef.current > 10) {
      abrirModalViaLinkRef.current = false;
    }
  }, [fichas]);

  useEffect(() => {
    if (!isOpen || !fichaSelacionada?.[0]?.id) return;
    const clienteId = fichaSelacionada[0].id;
    const clienteAtualizado = dono_da_ficha.find((item) => item.id === clienteId);
    if (clienteAtualizado) {
      setFichaSelecionada([clienteAtualizado]);
    }
  }, [fichas]);
  console.log("dono_da_ficha", dono_da_ficha);
  console.log("todas as fichas", fichas);
  console.log("fichaSelacionada", fichaSelacionada);

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
                    <div className="telefone-container">
                      <p className="telefone">
                        <span>📞</span> {fichaSelacionada?.[0]?.telefone}
                      </p>
                    </div>
                  </div>
                  <button onClick={fecharModal} className="close-modal-btn">
                    <IoClose size={24} />
                  </button>
                </div>

                <div className="vendas-list">
                  {fichaSelacionada?.[0]?.vendas?.map((item2) => (
                    <div key={item2.id} className="venda-item">
                      <div className="venda-date">
                        <div className="telefone-container">
                          📅{" "}
                          {item2.dataDaVenda
                            ? format(new Date(item2.dataDaVenda), "dd/MM/yyyy")
                            : "-"}
                          <div className="abatimentos-container">
                            {item2.abatimentos?.length > 0 && (
                              <div className="abatimento-item">
                                <div className="abatimento-data">
                                  <p>Data do ultimo abatimento:</p>
                                  {item2.abatimentos.at(-1).dataAbatimento
                                    ? format(
                                        new Date(
                                          item2.abatimentos.at(-1)
                                            .dataAbatimento,
                                        ),
                                        "dd/MM/yyyy HH:mm:ss",
                                      )
                                    : "-"}
                                </div>
                                <div className="abatimento-valor">
                                  <p>Valor abatido:</p>
                                  <span className="valor-abatido">
                                    {item2.abatimentos.at(-1).valorAbatido
                                      ? parseFloat(
                                          item2.abatimentos.at(-1).valorAbatido,
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })
                                      : "R$ 0,00"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-ver-historico"
                                  onClick={() => toggleHistoricoVenda(item2.id_venda)}
                                >
                                  {historicoVendasAbertas[item2.id_venda]
                                    ? "Ocultar Histórico"
                                    : "Ver Histórico"}
                                </button>
                                <button
                                  type="button"
                                  className="btn-desfazer-abatimento"
                                  title="Desfazer o último abatimento desta venda"
                                  disabled={desfazendoVendaId === item2.id_venda}
                                  onClick={() =>
                                    desfazerUltimoAbatimento(
                                      item2.id_venda,
                                      item2.abatimentos.at(-1),
                                    )
                                  }
                                >
                                  <IoArrowUndoOutline size={18} />
                                  <span>
                                    {desfazendoVendaId === item2.id_venda
                                      ? "Desfazendo..."
                                      : "Desfazer"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {historicoVendasAbertas[item2.id_venda] && item2.abatimentos?.length > 0 && (
                          <div className="painel-historico-abatimentos">
                            <div className="painel-historico-header">
                              <span>📜 Histórico de Abatimentos da Venda</span>
                              <span className="painel-total-abatido">
                                Total abatido:{" "}
                                {item2.abatimentos
                                  .reduce(
                                    (acc, ab) =>
                                      acc + (parseFloat(ab.valorAbatido) || 0),
                                    0,
                                  )
                                  .toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                              </span>
                            </div>
                            <div className="painel-historico-lista">
                              {item2.abatimentos.map((ab, idx) => {
                                const isUltimo =
                                  idx === item2.abatimentos.length - 1;
                                return (
                                  <div
                                    key={idx}
                                    className={`painel-historico-item ${
                                      isUltimo ? "item-ultimo-abatimento" : ""
                                    }`}
                                  >
                                    <span className="historico-indice">
                                      {idx + 1}º Abatimento
                                    </span>
                                    <span className="historico-data">
                                      📅{" "}
                                      {ab.dataAbatimento
                                        ? format(
                                            new Date(ab.dataAbatimento),
                                            "dd/MM/yyyy HH:mm:ss",
                                          )
                                        : "-"}
                                    </span>
                                    <span className="historico-valor">
                                      {ab.valorAbatido
                                        ? parseFloat(
                                            ab.valorAbatido,
                                          ).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          })
                                        : "R$ 0,00"}
                                    </span>
                                    {isUltimo && (
                                      <button
                                        type="button"
                                        className="btn-desfazer-historico"
                                        title="Desfazer este último abatimento"
                                        disabled={
                                          desfazendoVendaId === item2.id_venda
                                        }
                                        onClick={() =>
                                          desfazerUltimoAbatimento(
                                            item2.id_venda,
                                            ab,
                                          )
                                        }
                                      >
                                        <IoArrowUndoOutline size={16} />
                                        <span>
                                          {desfazendoVendaId === item2.id_venda
                                            ? "..."
                                            : "Desfazer"}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
                      {item2.valorDoProduto ? (
                        <span className="Total-abater-valor-venda">
                          Falta abater : R${" "}
                          {item2.valorDoProduto
                            ? parseFloat(item2.valorDoProduto).toLocaleString(
                                "pt-BR",
                                { style: "currency", currency: "BRL" },
                              )
                            : "R$ 0,00"}
                        </span>
                      ) : (
                        <span className="Total-abater-valor-venda">
                          Venda abatida <MdOutlineDone size={20} />
                        </span>
                      )}
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
                disabled={
                  (fichaSelacionada?.[0]?.valor_total ?? 0) < valorNaFicha
                }
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
