import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./RealizarUmaVenda.css";

import CardConfirmaçãoDeVenda from "./ConfirmcaoDeVenda";
import PaymentSplit from "../../../components/PaymentSplit/PaymentSplit";
import NotaFiscalVenda from "./NotaFiscalVenda";

import { FaUser, FaRegTrashAlt } from "react-icons/fa";
import { FcPaid } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineEdit, MdOutlineEditOff } from "react-icons/md";

import MessageError from "../../../components/FeedBack/MessageError";
import MensagemDeSucesso from "./MensagemDeSucesso";
import parseApiError from "../../../utils/parseApiError";
import ButtonVenda from "../../../components/Button/ButtonVenda";
import LoadingSucessoVenda from "../../../components/Loading/LoadingSucessoVenda";

const API_URL = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

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
  const [showSplit, setShowSplit] = useState(false);
  const [pagamentosDivididos, setPagamentosDivididos] = useState([
    { method: "", amount: "" },
    { method: "", amount: "" },
  ]);
  const [dinheiroRecebido, setDinheiroRecebido] = useState("R$ 0,00");
  const [precoUnitarioSelecionado, setPrecoUnitarioSelecionado] = useState(0);
  const [ficha, setFicha] = useState("R$ 0,00");
  const [cliente, setcliente] = useState([]);
  const [pesquisarCliente, setPesquisarCliente] = useState("");
  const [DescontoNaVenda, setDescontoNaVenda] = useState("R$ 0,00");
  const [valorDaFichaEmAberto, setValorDaFichaEmAberto] = useState([]);
  const [abrirNota, setAbrirNota] = useState(null);
  const [incluirQrCodeNaNota, setIncluirQrCodeNaNota] = useState(true);
  const [qrCodeProntoNota, setQrCodeProntoNota] = useState(false);
  const [impressaoPendente, setImpressaoPendente] = useState(false);
  const [alertaQuantidade, setAlertaQuantidade] = useState(null);
  const [showPrecoAdquirido, setShowPrecoAdquirido] = useState(false);
  const [telaDecodigo, setTelaDecodificado] = useState(false);
  const [codigoDeAcesso, setCodigoDeAcesso] = useState("");
  const [verificarCodigo, setVerificarCodigo] = useState(false);
  const [showRealizarVenda, setShowRealizarVenda] = useState(null);
  const [mensagemDeErro, setMensagemDeErro] = useState(null);
  const [mensagemDeSucesso, setMensagemDeSucesso] = useState(null);
  const [ativarFuncaoEditarDinheiro, setAtivarFuncaoEditarDinheiro] =
    useState(false);
  const [loadingSucesso, setLoadingSucesso] = useState(false);

  function formatarMoeda(e, setValor) {
    const valorNumerico = e.target.value.replace(/\D/g, "");

    const valorFormatado = (Number(valorNumerico) / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      },
    );

    setValor(Number(valorNumerico) / 100);
  }
  function VerificarCodigoDeAcesso(e) {
    e.preventDefault();
    if (codigoDeAcesso == "1234") {
      setVerificarCodigo(true);
      VizualizarPrecoAdquirido(e);
      setTelaDecodificado(false);
    } else {
      alert("Código de acesso inválido");
      setCodigoDeAcesso("");
      return;
    }
  }
  useEffect(() => {
    if (codigoDeAcesso.length == 4) {
      VerificarCodigoDeAcesso(event);
    }
  }, [codigoDeAcesso]);
  function VizualizarPrecoAdquirido(e) {
    e.preventDefault();
    setShowPrecoAdquirido(!showPrecoAdquirido);
  }

  function VizualizarTelaDecodigo(e) {
    e.preventDefault();
    setTelaDecodificado(!telaDecodigo);
  }

  function MesagemDeVenda(item) {
    setShowRealizarVenda(item);
  }
  function AbrirNota(comQrCode = true) {
    setIncluirQrCodeNaNota(comQrCode);
    setQrCodeProntoNota(false);
    setAbrirNota(true);
    setImpressaoPendente(true);
  }

  const handleQrReady = useCallback(() => {
    setQrCodeProntoNota(true);
  }, []);

  useEffect(() => {
    if (!impressaoPendente || !abrirNota) {
      return;
    }

    if (incluirQrCodeNaNota && !qrCodeProntoNota) {
      return;
    }

    const timer = setTimeout(() => {
      window.print();
      setImpressaoPendente(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [abrirNota, impressaoPendente, incluirQrCodeNaNota, qrCodeProntoNota]);

  useEffect(() => {
    if (
      !impressaoPendente ||
      !abrirNota ||
      !incluirQrCodeNaNota ||
      qrCodeProntoNota
    ) {
      return;
    }

    const fallback = setTimeout(() => {
      setQrCodeProntoNota(true);
    }, 2000);

    return () => clearTimeout(fallback);
  }, [abrirNota, impressaoPendente, incluirQrCodeNaNota, qrCodeProntoNota]);

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
        },
      );
      setcliente(
        Array.isArray(response.data) ? response.data : [response.data],
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
    item.nomeDoCliente.toLowerCase().includes(pesquisarCliente.toLowerCase()),
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
        },
      );
      setProduto(response.data);
      setProdutosArmazenados(response.data);
    } catch (error) {
      setProduto(null);
    }
  };

  const produtosFiltrados = (produto || []).filter((item) =>
    item.nomeDoProduto.toLowerCase().includes(pesquisaProduto.toLowerCase()),
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
      setPrecoUnitarioSelecionado(produtosArmazenados[0].precoAvista);
    } else {
      setPrecoUnitarioSelecionado(0);
    }
  }, [produtosArmazenados]);

  const adicionarProduto = (e) => {
    e.preventDefault();
    if (!produtosArmazenados || produtosArmazenados.length === 0) return;

    const precoLimpo =
      typeof precoUnitarioSelecionado === "string"
        ? Number(precoUnitarioSelecionado.replace(/\D/g, "")) / 100
        : precoUnitarioSelecionado;

    const produtoComQuantidadeEDesconto = {
      ...produtosArmazenados[0],
      quantidade: Number(quantidade),
      desconto,
      precoVenda: precoLimpo,
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
    setShowPrecoAdquirido(false);
    setAtivarFuncaoEditarDinheiro(false);
  };
  useEffect(() => {
    console.log(produtosVendidos);
  }, [produtosVendidos]);

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
      const descontoItem = parseFloat(item.desconto.replace(/\D/g, ""));

      return acc + (preco * qtd - descontoItem);
    }, 0);

    const descontoVenda = parseFloat(DescontoNaVenda) || 0;

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
      (prevTotal) => prevTotal - Number(produtosVendidos[index].quantidade),
    );
  };

  const FinalizarVenda = async (funcionarioResponsavel) => {
    if (produtosVendidos.length === 0) {
      alert("Não há produtos na venda!");
      window.location.reload();
      return;
    }
    if (!funcionarioResponsavel) {
      alert("Selecione a funcionaria que realizou a venda.");
      return;
    }
    try {
      setLoadingSucesso(true);
      const precoLimpoStr = precoTotal.replace(/\D/g, "").replace(",", ".");
      const totalNumerico = Number(precoLimpoStr) / 100;
      if (formaDePagamento === "Pagamento dividido") {
        const soma = pagamentosDivididos.reduce(
          (acc, p) => acc + (Number(p.amount) || 0),
          0
        );
        if (Math.abs(soma - totalNumerico) > 0.005) {
          alert("A soma dos pagamentos não bate com o total da venda.");
          setLoadingSucesso(false);
          return;
        }
        const vazios = pagamentosDivididos.some((p) => !p.method || !p.amount);
        if (vazios) {
          alert("Preencha todas as formas e valores do pagamento dividido.");
          setLoadingSucesso(false);
          return;
        }
      }
      const precoLimpo = precoLimpoStr;
      const Data = new Date();

      const dadosParaEnvio = produtosVendidos.map((produto) => {
        const pagamentosPayload =
          formaDePagamento === "Pagamento dividido"
            ? pagamentosDivididos.map((p) => ({
                formaPagamento: p.method,
                valor: Number(p.amount) || 0,
              }))
            : [
                {
                  formaPagamento: formaDePagamento || "Não informado",
                  valor: totalNumerico,
                },
              ];
        const dados = {
          nomeDoProduto: produto.nomeDoProduto,
          precoTotal: Number(parseFloat(precoLimpo) / 100),
          precoUnitario: Number(
            parseFloat(produto.precoVenda * produto.quantidade).toFixed(2),
          ),
          quantidade: produto.quantidade,
          dataDaVenda: Data.toISOString(),
          formaDePagamento: pagamentosPayload,
          id_produto: produto.id_produto,
          quantidadeTotal: quantidadeTotal,
          comprador: pesquisarCliente,
          funcionario: funcionarioResponsavel,
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
        },
      );
      console.log("venda realizada:",dadosParaEnvio);
      setMensagemDeSucesso(response.data);
      setShowRealizarVenda(null);
      setProdutosVendidos([]);
      setQuantidadeTotal(0);
      setPrecoTotal("R$ 0,00");
      setDinheiroRecebido("R$ 0,00");
      setFormaDePagamento("");
      setFicha("R$ 0,00");
      setcliente("");
      setPesquisarCliente("");
      setDescontoNaVenda("R$ 0,00");
    } catch (error) {
      const msg = parseApiError(error);
      setMensagemDeErro(msg);
      console.log(msg);
    } finally {
      setLoadingSucesso(false);
    }
  };

  useEffect(() => {
    if (mensagemDeSucesso) {
      setTimeout(() => {
        setMensagemDeSucesso(null);
      }, 5000);
    }
  }, [mensagemDeSucesso]);

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
        },
      );
      setValorDaFichaEmAberto(response.data);
    } catch (error) {}
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

  function HandleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  useEffect(() => {
    if (mensagemDeErro || mensagemDeSucesso) {
      const timer = setTimeout(() => {
        setMensagemDeErro(null);
        setMensagemDeSucesso(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagemDeErro, mensagemDeSucesso]);

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
                onKeyDown={HandleKeyPress}
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
                  produtosFiltrados.slice(0, 5).map((produtos, index) => (
                    <button
                      onClick={() =>
                        SelecionandoProdutos(produtos.codigoDeBarra)
                      }
                      key={index}
                    >
                      <div className="FiltroDeProdutos">
                        <img
                          className="produto-thumb"
                          src={produtos.urlImagem}
                          alt={produtos.nomeDoProduto}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/48?text=?"; }}
                        />
                        <span className="produto-nome">{limitarNome(produtos.nomeDoProduto, 6)}</span>
                        <span className="produto-marca">{produtos.marca}</span>
                        <span className={produtos.quantidade > 1 ? "produto-qtd" : "produto-qtd-falta"}>Qtd: {produtos.quantidade}</span>
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
            {clienteFiltrados.length > 1 &&
            <div className="ClientesEncontrados">
              {clienteFiltrados.length > 0 &&
                clienteFiltrados.slice(0, 4).map((clientes) => (
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
            }

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
                                Number(e.target.value),
                              )
                            }
                          >
                            <option value={produtos?.precoAvista}>
                              Preço Para Cliente (R$
                              {produtos?.precoAvista?.toFixed(2)})
                            </option>
                            <option value={produtos?.preco}>
                              Preço Em Revista (R$
                              {produtos?.preco?.toFixed(2)})
                            </option>
                            <option value={produtos?.precoEmFicha}>
                              Preço Na Ficha (R$
                              {produtos?.precoEmFicha?.toFixed(2)})
                            </option>
                          </select>

                          <p>
                            {ativarFuncaoEditarDinheiro === false ? (
                              <div className="selecionar-dinheiro">
                                {precoUnitarioSelecionado > 0
                                  ? parseFloat(
                                      precoUnitarioSelecionado,
                                    ).toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })
                                  : "R$ 0,00"}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setAtivarFuncaoEditarDinheiro(true);
                                  }}
                                >
                                  <MdOutlineEdit fontSize={20} />
                                </button>
                              </div>
                            ) : (
                              <div className="editar-dinheiro-box">
                                <input
                                  type="text"
                                  value={precoUnitarioSelecionado.toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    },
                                  )}
                                  onChange={(e) =>
                                    formatarMoeda(
                                      e,
                                      setPrecoUnitarioSelecionado,
                                    )
                                  }
                                />
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setAtivarFuncaoEditarDinheiro(false);
                                  }}
                                >
                                  <MdOutlineEditOff fontSize={20} />
                                </button>
                              </div>
                            )}
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
                          <div className="buttons-name">
                            <h3>Preço Adquirido:</h3>
                            <button
                              onClick={VizualizarTelaDecodigo}
                              className={
                                showPrecoAdquirido
                                  ? "hidden-button"
                                  : "verifica-codigo"
                              }
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setShowPrecoAdquirido(false);
                              }}
                              className={
                                showPrecoAdquirido
                                  ? "verifica-codigo"
                                  : "hidden-button"
                              }
                            >
                              <FaEyeSlash />
                            </button>
                          </div>
                          <p
                            style={{
                              display: showPrecoAdquirido ? "block" : "none",
                            }}
                          >
                            {produtos?.precoAdquirido !== undefined
                              ? parseFloat(
                                  produtos.precoAdquirido,
                                ).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : "R$ 0,00"}
                          </p>
                        </div>
                      </div>

                      {telaDecodigo && (
                        <div className="TelaDeCodigoContainer">
                          <div className="TelaDeCodigobox">
                            <button
                              onClick={VizualizarTelaDecodigo}
                              className="BtnFechar"
                            >
                              X
                            </button>
                            <p>Insira o Codigo De Segurança</p>
                            <input
                              type="text"
                              className="input-codigo"
                              onChange={(e) =>
                                setCodigoDeAcesso(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}

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
                      <th className="col-imagem">Imagem</th>
                      <th className="col-produto">Produto</th>
                      <th className="col-quantidade">Qtd</th>
                      <th className="col-preco">Preço Unit.</th>
                      
                      <th className="col-total">Preço Total</th>
                      <th className="col-acao">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosVendidos.map((item, index) => (
                      <tr key={index}>
                        <td className="col-imagem">
                          <div className="produto-imagem">
                            <img 
                              src={item.urlImagem} 
                              alt={item.nomeDoProduto}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50?text=Sem+Imagem";
                              }}
                            />
                          </div>
                        </td>
                        <td className="col-produto">
                          <span className="nome-produto">{item.nomeDoProduto}</span>
                        </td>
                        <td className="col-quantidade">
                          <span className="badge-quantidade">{item.quantidade}</span>
                        </td>
                        <td className="col-preco">
                          {parseFloat(item.precoVenda).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        
                        <td className="col-total">
                          <strong className="preco-total">
                            {(
                              item.precoVenda * item.quantidade -
                              parseFloat(item.desconto.replace(/\D/g, "")) / 100
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </strong>
                        </td>
                        <td className="col-acao">
                          <button
                            onClick={() => removerProduto(index)}
                            className="BtnRemoverDaTabela"
                            title="Remover produto"
                          >
                            <FaRegTrashAlt />
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
            <p className="PrecoTotal">{precoTotal}</p>
          </div>

          <div className="FinalizandoVenda">
            <div className="DescontoNaVenda">
              <h3>Desconto na Venda:</h3>
              <input
                type="text"
                name="DescontoNaVenda"
                value={
                  typeof DescontoNaVenda === "number"
                    ? DescontoNaVenda.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : DescontoNaVenda
                }
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, "");
                  const valorNumerico = Number(apenasNumeros) / 100;
                  setDescontoNaVenda(valorNumerico);
                }}
              />
            </div>

            <div className="FormaDePagamento">
              <h3>Forma de Pagamento:</h3>
              <select
                required
                value={formaDePagamento}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormaDePagamento(v);
                  if (v === "Pagamento dividido") setShowSplit(true);
                  else setShowSplit(false);
                }}
              >
                <option value="">Selecione</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Credito">Cartão de Credito</option>
                <option value="Debito">Cartão de Debito</option>
                <option value="Pix">Pix</option>
                <option value="Crediario">Ficha</option>
                <option value="Pagamento dividido">Pagamento dividido</option>
              </select>
            </div>
            {showSplit && (
              <PaymentSplit
                total={precoTotal}
                methods={["Dinheiro", "Credito", "Debito", "Pix", "Crediario"]}
                value={pagamentosDivididos}
                onChange={setPagamentosDivididos}
                onAddRow={() =>
                  setPagamentosDivididos((prev) => [
                    ...prev,
                    { method: "", amount: "" },
                  ])
                }
                onRemoveRow={(idx) =>
                  setPagamentosDivididos((prev) =>
                    prev.filter((_, i) => i !== idx),
                  )
                }
                onCancel={() => {
                  setShowSplit(false);
                  setFormaDePagamento("");
                }}
                onSave={() => {
                  setShowSplit(false);
                }}
              />
            )}

            <div className="Botoes">
              <ButtonVenda MesagemDeVenda={MesagemDeVenda} />
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
        <NotaFiscalVenda
          produtos={produtosVendidos}
          quantidadeTotal={quantidadeTotal}
          descontoTotal={DescontoNaVenda}
          valorTotal={precoTotal}
          formaDePagamento={formaDePagamento}
          pagamentosDivididos={pagamentosDivididos}
          cliente={pesquisarCliente}
          incluirQrCode={incluirQrCodeNaNota}
          onQrReady={handleQrReady}
        />
      )}
      {alertaQuantidade && (
        <div className="alertaQuantidade">
          <p>⚠️Lembrete⚠️</p>
          <p>Esse Produto Tem Apenas 1 Unidade</p>
          <div className="line"></div>
        </div>
      )}

      {showRealizarVenda && (
        <div className="MensagemDeSucesso">
          <CardConfirmaçãoDeVenda
            FinalizarVenda={FinalizarVenda}
            AbrirNota={AbrirNota}
            setShowRealizarVenda={setShowRealizarVenda}
          />
        </div>
      )}
      {mensagemDeSucesso && (
        <div className="Mensagem">
          <MensagemDeSucesso mensagemDeSucesso={mensagemDeSucesso} />
      </div>
      )}
      
      {mensagemDeErro && (
        <div className="Mensagem">
          <MessageError title={mensagemDeErro} onClose={() => setMensagemDeErro(null)} />
        </div>
      )}
      
      {loadingSucesso && (
        <div className="loading">
          <LoadingSucessoVenda />
        </div>
      )}
    </>
  );
}

export default RealizarVendaTest;
