/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./RealizarUmaVenda.css";

import { FaEquals } from "react-icons/fa";
import { FaUser, FaRegTrashAlt } from "react-icons/fa";
import { FcPaid } from "react-icons/fc";

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
  const [ficha, setFicha] = useState("R$ 0,00");
  const [cliente, setcliente] = useState([]);
  const [pesquisarCliente, setPesquisarCliente] = useState("");
  const [DescontoNaVenda, setDescontoNaVenda] = useState("R$ 0,00");
  const [valorDaFichaEmAberto, setValorDaFichaEmAberto] = useState([]);

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

  const buscarCliente = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/CadastroDeCliente/BuscarCliente",
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
      console.error(error);
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
        "http://localhost:5080/api/AdicionarProduto/BuscarProdutoEstoque",
        {
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
      console.error(error);
      setProduto(null);
    }
  };
  const produtosFiltrados = (produto || []).filter((item) =>
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

  const adicionarProduto = () => {
    if (!produtosArmazenados) return;

    const produtoComQuantidadeEDesconto = {
      ...produtosArmazenados[0],
      quantidade,
      desconto,
    };
    setProdutosVendidos([...produtosVendidos, produtoComQuantidadeEDesconto]);

    setProdutosArmazenados(null);
    setPesquisaProduto("");
    setQuantidade(1);
    setDesconto("R$ 0,00");
    setQuantidadeTotal((prevTotal) => prevTotal + Number(quantidade));
  };

  const calcularTotalGeral = () => {
    const totalSemDescontoGeral = produtosVendidos.reduce((acc, item) => {
      const valor = parseFloat(item.preco);
      const qtd = parseInt(item.quantidade);
      const descontoItem = parseFloat(item.desconto.replace(/\D/g, "")) / 100;
      return acc + (valor * qtd - descontoItem);
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
      alert("Não há produtos na venda!");
      return;
    }
    try {
      const precoLimpo = precoTotal.replace(/\D/g, "");
      const Data = new Date();

      const dadosParaEnvio = produtosVendidos.map((produto) => {
        const dados = {
          nomeDoProduto: produto.nomeDoProduto,
          precoTotal: Number(precoLimpo / 100),
          quantidade: produto.quantidade,
          dataDaVenda: Data.toISOString(),
          formaDePagamento: formaDePagamento,
          id_produto: produto.id_produto,
          quantidadeTotal: quantidadeTotal,
          comprador: pesquisarCliente,
        };

        if (formaDePagamento === "Crediario") {
          dados.valorNaFicha = Number(precoLimpo / 100);
        }

        return dados;
      });

      console.log(
        "Enviando para API:",
        JSON.stringify(dadosParaEnvio, null, 2)
      );

      const response = await axios.post(
        "http://localhost:5080/api/RealizarVenda/RealizarVenda",
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
        console.error("Erro ao realizar venda:", error.response.data);
      } else {
        console.error("Erro inesperado ao realizar venda:", error.message);
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

  async function ClienteComFichaEmAberto() {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/RealizarVenda/ClientesComFichaEmAberto",
        {
          fichaEmAberto: pesquisarCliente,
        }
      );
      console.log("Aqui esta os que estão com ficha em aberto", response.data);
      setValorDaFichaEmAberto(response.data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (pesquisarCliente.length > 2) {
      ClienteComFichaEmAberto();
      setTimeout(() => {
        setValorDaFichaEmAberto([]);
      }, 5505);
    }
  }, [pesquisarCliente]);
  useEffect(() => {
    console.log("Produtos Vendidos:", produtosVendidos);
  });

  function limitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }

  return (
    <>
      <div className="body">
        <nav className="navBar">
          <Link to="/screenMain">
            <img
              src="./src/img/logo-removebg-preview.png"
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
                        SelecionandoProdutos(produtos.nomeDoProduto)
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
                        <p>{limitarNome(produtos.nomeDoProduto,5)}</p>
                        <p>{produtos.marca}</p>
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
                            {limitarNome(produtos?.nomeDoProduto,5) ||
                              "Produto não encontrado"}
                          </p>
                        </div>

                        <div className="InformationProtuct">
                          <h3>Preço:</h3>
                          <p>
                            {produtos?.preco !== undefined
                              ? parseFloat(produtos.preco).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  }
                                )
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
                          <h3>Desconto:</h3>
                          <input
                            type="text"
                            value={desconto}
                            onChange={(e) => formatarMoeda(e, setDesconto)}
                          />
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
                          {parseFloat(item.preco).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td>{item.desconto}</td>
                        <td>
                          {(
                            parseFloat(item.preco) * item.quantidade -
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
              <button id="btn" style={{ backgroundColor: "rgb(0, 68, 255)" }}>
                Olhar Nota
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
    </>
  );
}

export default RealizarVendaTest;
