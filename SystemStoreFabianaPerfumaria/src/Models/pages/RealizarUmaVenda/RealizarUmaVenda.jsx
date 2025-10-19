import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./RealizarUmaVenda.css";
import "./RealizarVendaMobile.css";
import QRCodeInsta from "../../../components/qrCode/Qrcode";

import { FaUser, FaRegTrashAlt } from "react-icons/fa";
import { FcPaid } from "react-icons/fc";

const API_URL = "http://192.168.1.190:5080/api";

function RealizarVendaTest() {
  const [pesquisaProduto, setPesquisaProduto] = useState("");
  const [produto, setProduto] = useState([]);
  const [produtosArmazenados, setProdutosArmazenados] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState([]);
  const [quantidade, setQuantidade] = useState(1);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [desconto, setDesconto] = useState("R$ 0,00");
  const [precoTotal, setPrecoTotal] = useState("R$ 0,00");
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [dinheiroRecebido, setDinheiroRecebido] = useState("R$ 0,00");
  const [precoUnitarioSelecionado, setPrecoUnitarioSelecionado] = useState(0);
  const [ficha, setFicha] = useState("R$ 0,00");
  const [cliente, setcliente] = useState([]);
  const [pesquisarCliente, setPesquisarCliente] = useState("");
  const [DescontoNaVenda, setDescontoNaVenda] = useState("R$ 0,00");
  const [valorDaFichaEmAberto, setValorDaFichaEmAberto] = useState([]);
  const [abrirNota, setAbrirNota] = useState(null);
  const [alertaQuantidade, setAlertaQuantidade] = useState(null);

  function formatarMoeda(e, setValor) {
    const valorNumerico = e.target.value.replace(/\D/g, "");
    const valorFormatado = (Number(valorNumerico) / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
    setValor(valorFormatado);
  }

  function AbrirNota() {
    setAbrirNota(true);
    setTimeout(() => {
      window.print();
    }, 500);
  }

  const buscarCliente = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/CadastroDeCliente/BuscarCliente`,
        {
          NomeDoCliente: pesquisarCliente,
          Cpf: pesquisarCliente,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setcliente(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      setcliente([]);
    }
  };

  useEffect(() => {
    if ((pesquisarCliente || "").trim().length > 0) {
      buscarCliente();
    } else {
      setcliente(null);
    }
  }, [pesquisarCliente]);

  const clienteFiltrados = (cliente || []).filter((item) =>
    item.nomeDoCliente.toLowerCase().includes(pesquisarCliente.toLowerCase())
  );

  function AdicionandoCliente(nome) {
    setPesquisarCliente(nome);
    setcliente([]);
  }

  const buscarProduto = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/AdicionarProduto/BuscarProdutoParaRealizarVenda`,
        {
          CodigoDeBarra: pesquisaProduto,
          NomeDoProduto: pesquisaProduto,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProduto(response.data);
      setProdutosArmazenados(response.data);
    } catch (error) {
      setProduto(null);
    }
  };

  const produtosFiltrados = (produto || []).filter(
    (item) =>
      item.codigoDeBarra ||
      item.nomeDoProduto.toLowerCase().includes(pesquisaProduto.toLowerCase())
  );

  useEffect(() => {
    if ((pesquisaProduto || "").trim().length > 0) {
      buscarProduto();
    } else {
      setProduto([]);
      setProdutosArmazenados([]);
    }
  }, [pesquisaProduto]);

  function SelecionandoProdutos(produto) {
    setPesquisaProduto(produto);
    setProduto([]);
  }

  useEffect(() => {
    if (produtosArmazenados && produtosArmazenados.length > 0) {
      setPrecoUnitarioSelecionado(produtosArmazenados[0].preco);
    } else {
      setPrecoUnitarioSelecionado(0);
    }
  }, [produtosArmazenados]);

  const adicionarProduto = () => {
    if (!produtosArmazenados || produtosArmazenados.length === 0) return;

    const precoVendaNumerico = precoUnitarioSelecionado;

    const produtoComQuantidadeEDesconto = {
      ...produtosArmazenados[0],
      quantidade: Number(quantidade),
      desconto,
      precoVenda: precoVendaNumerico,
    };

    if (produtosArmazenados[0].quantidade === 1) {
      setAlertaQuantidade(!alertaQuantidade);
    }

    setProdutosVendidos([...produtosVendidos, produtoComQuantidadeEDesconto]);
    setProdutosArmazenados([]);
    setPesquisaProduto("");
    setQuantidade(1);
    setDesconto("R$ 0,00");
    setPrecoUnitarioSelecionado(0);
    setQuantidadeTotal((prevTotal) => prevTotal + Number(quantidade));
  };

  useEffect(() => {
    if (alertaQuantidade !== null) {
      setTimeout(() => {
        setAlertaQuantidade(null);
      }, 5000);
    }
  }, [alertaQuantidade]);

  const calcularTotalGeral = () => {
    const totalSemDescontoGeral = produtosVendidos.reduce((acc, item) => {
      const preco = parseFloat(item.precoVenda);
      const qtd = parseInt(item.quantidade);
      const descontoItem = parseFloat(item.desconto.replace(/\D/g, "")) / 100;

      return acc + (preco * qtd - descontoItem);
    }, 0);

    const descontoVenda =
      parseFloat(DescontoNaVenda.replace(/\D/g, "")) / 100 || 0;

    const totalComDescontoGeral = totalSemDescontoGeral - descontoVenda;

    const totalFormatado = totalComDescontoGeral.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setPrecoTotal(totalFormatado);
    setFicha(totalFormatado);
  };

  useEffect(() => {
    calcularTotalGeral();
  }, [produtosVendidos, DescontoNaVenda]);

  const removerProduto = (index) => {
    const novaLista = produtosVendidos.filter((_, i) => i !== index);
    setProdutosVendidos(novaLista);
    setQuantidadeTotal(
      (prevTotal) => prevTotal - Number(produtosVendidos[index].quantidade)
    );
  };

  const FinalizarVenda = async () => {
    window.scrollTo(0, 0);
    const confirmar = window.confirm("Deseja finalizar a venda?");
    if (!confirmar) return;
    if (produtosVendidos.length === 0) {
      alert("Não há produtos na venda!");
      return;
    }
    try {
      const precoLimpo = precoTotal.replace(/\D/g, "").replace(",", ".");
      const Data = new Date();

      const dadosParaEnvio = produtosVendidos.map((produto) => {
        const dados = {
          nomeDoProduto: produto.nomeDoProduto,
          precoTotal: Number(parseFloat(precoLimpo) / 100),
          quantidade: produto.quantidade,
          dataDaVenda: Data.toISOString(),
          formaDePagamento: formaDePagamento,
          id_produto: produto.id_produto,
          quantidadeTotal: quantidadeTotal,
          comprador: pesquisarCliente,
        };

        if (formaDePagamento === "Crediario") {
          dados.valorNaFicha = Number(parseFloat(precoLimpo) / 100);
        }

        return dados;
      });

      const response = await axios.post(
        `${API_URL}/RealizarVenda/RealizarVenda`,
        dadosParaEnvio,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Venda realizada com sucesso!");
      window.location.reload();

      setProdutosVendidos([]);
      setQuantidadeTotal(0);
      setPrecoTotal("R$ 0,00");
      setDinheiroRecebido("R$ 0,00");
      setFormaDePagamento("");
      setFicha("R$ 0,00");
      setcliente("");
      setDescontoNaVenda("R$ 0,00");
    } catch (error) {
      if (error.response) {
        alert(`Erro ao realizar venda: ${error.response.data}`);
      } else {
        alert(`Erro inesperado ao realizar venda: ${error.message}`);
      }
    }
  };

  const CancelarVenda = () => {
    if (window.confirm("Tem certeza que deseja cancelar a venda?")) {
      setProdutosVendidos([]);
      setQuantidadeTotal(0);
      setPrecoTotal("R$ 0,00");
      setDinheiroRecebido("R$ 0,00");
      setFormaDePagamento("");
      setFicha("R$ 0,00");
    }
  };

  function ScreenDefaull() {
    if (window.screen.width < 1348) {
      return;
    }
  }

  useEffect(() => {
    ScreenDefaull();
  }, []);

  async function ClienteComFichaEmAberto() {
    try {
      const response = await axios.post(
        `${API_URL}/RealizarVenda/ClientesComFichaEmAberto`,
        {
          fichaEmAberto: pesquisarCliente,
        }
      );
      setValorDaFichaEmAberto(response.data);
    } catch (error) { }
  }

  useEffect(() => {
    if (pesquisarCliente.length > 2) {
      ClienteComFichaEmAberto();
      setTimeout(() => {
        setValorDaFichaEmAberto([]);
      }, 5505);
    }
  }, [pesquisarCliente]);

  function limitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }

  return (
    <>
      <div className="body">
        <nav className="navBar">
          <Link to="/">
            <img
              src="img/SUBLOGO- BRONZE.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </Link>
          <h2>Realizar Venda</h2>
        </nav>

        <section>
          <form onSubmit={(e) => e.preventDefault()} key={produto?.id_produto}>
            <div className="BuscarProduto">
              <input
                type="text"
                placeholder="Digite o Codigo de Barras ou Nome do Produto"
                value={pesquisaProduto}
                onChange={(e) => setPesquisaProduto(e.target.value)}
              />
              <div
                className={
                  produtosFiltrados.length > 0
                    ? "ContainerButtonBuscarDeProdutos"
                    : "ContainerButtonBuscarDeProdutosOcultar"
                }
              >
                {produtosFiltrados.length > 0 &&
                  produtosFiltrados.map((produtos, index) => (
                    <button
                      onClick={() =>
                        SelecionandoProdutos(produtos.codigoDeBarra)
                      }
                      key={index}
                    >
                      <div className="FiltroDeProdutos">
                        <img
                          src={produtos.urlImagem}
                          alt=""
                          width={60}
                          height={60}
                        />
                        <p>{limitarNome(produtos.nomeDoProduto, 3)}</p>
                        <p>{produtos.marca}</p>
                        <p>{produtos.quantidade}</p>
                        <p>{produtos.codigoDeBarra}</p>
                      </div>
                    </button>
                  ))}
              </div>
              <input
                type="text"
                placeholder="Digite o Nome Do Cliente "
                value={pesquisarCliente}
                onChange={(e) => setPesquisarCliente(e.target.value)}
                required
              />
            </div>
            <div className="ClientesEncontrados">
              {clienteFiltrados.length > 0 &&
                clienteFiltrados.map((clientes) => (
                  <button
                    className="ContainerButton"
                    key={clientes.Id_Cliente}
                    onClick={() => AdicionandoCliente(clientes.nomeDoCliente)}
                  >
                    <FaUser fontSize={50} />
                    <div className="InformacoesDeClienteFiltrados">
                      <div>
                        <div className="InformacoesDeCliente">
                          <p className="NomeDoCliente">
                            {clientes.nomeDoCliente}
                          </p>
                          <p>{clientes.cpf}</p>
                          <p>{clientes.telefone}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="TabelaDeProdutos">
              <div className="ProdutosEncontrados">
                {(produtosArmazenados || []).length > 0 ? (
                  produtosArmazenados.slice(0, 1).map((produtos) => (
                    <React.Fragment key={produtos.id_produto}>
                      <div className="ImageProduct">
                        <img
                          src={produtos?.urlImagem || " "}
                          width={200}
                          height={200}
                          alt="Produto Nao Encontrado"
                        />
                      </div>

                      <div className="InformationProtuctAll">
                        <div className="InformationProtuct">
                          <h3>Nome do Produto:</h3>
                          <p>
                            {limitarNome(produtos?.nomeDoProduto, 4) ||
                              "Produto não encontrado"}
                          </p>
                        </div>
                        <div className="InformationProtuct">
                          <select
                            className="selectPreco"
                            value={precoUnitarioSelecionado}
                            onChange={(e) =>
                              setPrecoUnitarioSelecionado(
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value={produtos?.preco}>
                              Preço Em Revista (R$
                              {produtos?.preco?.toFixed(2)})
                            </option>
                            <option value={produtos?.precoAvista}>
                              Preço Para Cliente (R$
                              {produtos?.precoAvista?.toFixed(2)})
                            </option>
                            <option value={produtos?.precoEmFicha}>
                              Preço Na Ficha (R$
                              {produtos?.precoEmFicha?.toFixed(2)})
                            </option>
                          </select>

                          <p>
                            {precoUnitarioSelecionado > 0
                              ? parseFloat(
                                precoUnitarioSelecionado
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                              : "R$ 0,00"}
                          </p>
                        </div>

                        <div className="InformationProtuct">
                          <h3>Quantidade:</h3>
                          <input
                            type="number"
                            min={1}
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value)}
                          />
                        </div>
                        <div className="InformationProtuct">
                          <h3>Preço Adquirido:</h3>
                          <p>
                            {produtos?.precoAdquirido !== undefined
                              ? parseFloat(
                                produtos.precoAdquirido
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                              : "R$ 0,00"}
                          </p>
                        </div>
                      </div>

                      <button
                        className="BtnAdicionar"
                        type="submit"
                        title="Adicionar"
                        aria-label="Adicionar"
                        onClick={adicionarProduto}
                      >
                        Adicionar
                      </button>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="SemProdutos">
                    <FcPaid fontSize={150} />
                    <p>Sistema Online</p>
                  </div>
                )}
              </div>

              <div className="TabelaDeProdutosAdicionados">
                <table>
                  <thead>
                    <tr>
                      <th>Nome do Produto</th>
                      <th>Quantidade</th>
                      <th>Preço</th>
                      <th>Desconto</th>
                      <th>Preço Total</th>
                      <th>Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosVendidos.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nomeDoProduto}</td>
                        <td>{item.quantidade}</td>
                        <td>
                          {parseFloat(item.precoVenda).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td>{item.desconto}</td>
                        <td>
                          {(
                            item.precoVenda * item.quantidade -
                            parseFloat(item.desconto.replace(/\D/g, "")) / 100
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td>
                          <button
                            onClick={() => removerProduto(index)}
                            className="BtnRemoverDaTabela"
                          >
                            <FaRegTrashAlt fontSize={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>

          <div className="SubTotal">
            <p>Total:</p>
            <p>{precoTotal}</p>
          </div>

          <div className="FinalizandoVenda">
            <div className="DescontoNaVenda">
              <h3>Desconto na Venda:</h3>
              <input
                type="text"
                name="DescontoNaVenda"
                value={DescontoNaVenda}
                onChange={(e) => formatarMoeda(e, setDescontoNaVenda)}
              />
            </div>

            <div className="FormaDePagamento">
              <h3>Forma de Pagamento:</h3>
              <select
                required
                value={formaDePagamento}
                onChange={(e) => setFormaDePagamento(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Espécie">Dinheiro</option>
                <option value="CartaoDeCredito">Cartão de Credito</option>
                <option value="CartaoDeDebito">Cartão de Debito</option>
                <option value="PagoNoPix">Pix</option>
                <option value="Crediario">Ficha</option>
              </select>
            </div>

            <div className="Botoes">
              <button
                id="btn"
                onClick={AbrirNota}
                style={{ backgroundColor: "rgb(0, 68, 255)" }}
              >
                Imprimir Nota
              </button>
              <button
                id="btn"
                style={{ backgroundColor: "rgb(0, 255, 76)" }}
                onClick={FinalizarVenda}
              >
                Finalizar Venda
              </button>
              <button
                id="btn"
                style={{ backgroundColor: "rgb(255, 0, 0)" }}
                onClick={CancelarVenda}
              >
                Cancelar Venda
              </button>
            </div>
          </div>
          {valorDaFichaEmAberto.length > 0 ? (
            <div className="AlertaDeFichaNaoPaga">
              <h2>⚠️ Alerta De Ficha Não Paga</h2>
              <p>O Cliente Estar Na Lista De Ficha Pendentes</p>
              <div className="Tempo"></div>
            </div>
          ) : (
            ""
          )}
        </section>
      </div>

      {abrirNota && (
        <div id="nota-fiscal" className="NotaFiscal">
          {produtosVendidos.length > 0 && (
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
              className="notaCard"
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
              <p
                style={{ textAlign: "center", fontSize: "0.7rem", margin: "0" }}
              >
                Rua DR.Romulo De Almeida,65 <br /> São Miguel Dos Campos/AL
              </p>
              <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
              <p style={{ textAlign: "center", margin: "5px 0" }}>
                DOCUMENTO AUXILIAR DA NFCE
              </p>
              <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
              <p style={{ margin: "5px 0" }}>
                Emissão: {new Date().toLocaleDateString("pt-BR")}{" "}
                {new Date().toLocaleTimeString("pt-BR")}
              </p>
              {pesquisarCliente && (
                <p style={{ margin: "5px 0" }}>Cliente: {pesquisarCliente}</p>
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
                  {produtosVendidos.map((item, index) => {
                    const preco = parseFloat(item.precoVenda);
                    const quantidade = item.quantidade;
                    const desconto =
                      parseFloat(item.desconto?.replace(/\D/g, "") || 0) / 100;
                    const precoTotalItem = (
                      preco * quantidade -
                      desconto
                    ).toFixed(2);


                    return (
                      <>

                        <tr key={index}>
                          <td style={{ textAlign: "left", paddingLeft: "5px" }}>
                            {item.nomeDoProduto}
                          </td>
                          <td style={{ textAlign: "center" }}>{quantidade}</td>
                          <td style={{ textAlign: "center" }}>
                            {preco.toFixed(2)}
                          </td>
                          <td style={{ textAlign: "right" }}>{precoTotalItem}</td>
                        </tr>
                        <tr>
                          <td colSpan={4}>
                            <hr style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
                          </td>
                        </tr>
                      </>

                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>

                <span>QTD. TOTAL DE ITENS:{" "}{quantidadeTotal}</span>
              </p>
              <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
                <span >DESCONTO NA VENDA:{" "}{DescontoNaVenda}</span>
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  margin: "5px 0",
                }}
              >
                <span>VALOR TOTAL R$:{" "}{precoTotal}</span>
              </p>
              <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
                <span >PAGAMENTO: {formaDePagamento}</span>
              </p>
              <div
                className="qrCode"
                style={{ textAlign: "center", margin: "10px 0" }}
              >
                <QRCodeInsta />
                <p style={{ fontSize: "0.7rem", margin:"0 0 0 0",padding:"5px" }}>
                  Obrigado e volte sempre!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {alertaQuantidade && (
        <div className="alertaQuantidade">
          <p>⚠️Lembrete⚠️</p>
          <p>Esse Produto Tem Apenas 1 Unidade</p>
          <div className="line"></div>
        </div>
      )}
    </>
  );
}

export default RealizarVendaTest;
