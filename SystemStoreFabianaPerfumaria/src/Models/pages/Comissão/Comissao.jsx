import "./Comissao.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FaCalendarAlt,
  FaChartLine,
  FaUserTie,
  FaWallet,
  FaTimes,
  FaUser,
  FaPhone,
  FaStore,
} from "react-icons/fa";
import { IoIosCash } from "react-icons/io";
import { MdOutlineEdit } from "react-icons/md";
import { UseComissao } from "../../../hooks/UseComissao";

function Comissao() {
  const {
    historicoDeVendas,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    formaDePagamento,
    setFormaDePagamento,
    nomeFuncionario,
    setNomeFuncionario,
    formatarMoeda,
    textoFormaPagamento,
    totalVendido,
    vendasUnicas,
    baseSalario,
    setBaseSalario,
    porcentagemComissao,
    setPorcentagemComissao,
    codigoFuncionario,
    setCodigoFuncionario,
    liberado,
    liberaEntrada,
    erroCodigo,
    setErroCodigo,
    porcentagemComissaoCrediario,
  } = UseComissao();

  const funcionarios = ["Graciele", "Angela"];
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editBaseSalario, setEditBaseSalario] = useState("");
  const [editPorcentagem, setEditPorcentagem] = useState("");

  // Função para formatar valor para moeda enquanto digita
  const formatarMoedaInput = (valor) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "");
    // Converte para número e divide por 100 para ter centavos
    const numero = parseFloat(apenasNumeros) / 100;
    // Formata como moeda
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para converter moeda formatada de volta para número
  const desformatarMoeda = (valor) => {
    return parseFloat(
      valor.replace(/[R$.\s]/g, "").replace(",", ".")
    );
  };

  // Inicia o modo de edição com os valores atuais
  const iniciarEdicao = () => {
    // Como o formatador espera centavos, multiplicamos por 100
    const valorEmCentavos = Math.round(baseSalario * 100).toString();
    setEditBaseSalario(formatarMoedaInput(valorEmCentavos));
    setEditPorcentagem(porcentagemComissao.toString());
    setModoEdicao(true);
  };

  // Salva as alterações
  const salvarEdicao = () => {
    const novaBase = desformatarMoeda(editBaseSalario) || 0;
    const novaPorcentagem = parseFloat(editPorcentagem) || 0;
    setBaseSalario(novaBase);
    setPorcentagemComissao(novaPorcentagem);
    setModoEdicao(false);
  };

  const comissaoVendas = vendasUnicas.reduce((total, venda) => {
    const valorVenda = venda.precoTotal;
    const isCrediario = textoFormaPagamento(venda) === "Crediario";
    const porcentagem = isCrediario
      ? porcentagemComissaoCrediario
      : porcentagemComissao;
    const comissaoDaVenda = (valorVenda * porcentagem) / 100;
    return total + comissaoDaVenda;
  }, 0);

  function handleInputChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCodigoFuncionario(value);
    if (erroCodigo) setErroCodigo(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      liberaEntrada();
    }
  }
  useEffect(() => {
    console.log("aqui estar as vendas unicas", vendasUnicas);
    console.log("aqui estar o historico de vendas", historicoDeVendas);
    console.log("aqui estar a comissao", comissaoVendas);
  }, [vendasUnicas, historicoDeVendas]);

  function abrirDetalhesVenda(venda) {
    setVendaSelecionada(venda);
  }

  function fecharDetalhesVenda() {
    setVendaSelecionada(null);
  }

  // Função para pegar todos os produtos da venda (pelo idVenda)
  function getProdutosDaVenda(idVenda) {
    return historicoDeVendas.filter((item) => item.idVenda === idVenda);
  }

  if (!liberado) {
    return (
      <>
        <nav className="navBar">
          <Link to="/">
            <img
              src="img/SUBLOGO- BRONZE.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </Link>
          <h1>Fabiana Perfumaria</h1>
        </nav>

        <main className="comissao-page comissao-lock-page">
          <div className="comissao-lock-container">
            <div className="comissao-lock-card">
              <div className="comissao-lock-icon">
                <FaUserTie />
              </div>
              <h2 className="comissao-lock-title">Acesso Restrito</h2>
              <p className="comissao-lock-subtitle">
                Digite o código de 4 dígitos para acessar a página de comissões
              </p>

              <div
                className={`comissao-lock-input-wrapper ${erroCodigo ? "error" : ""}`}
              >
                <input
                  type="password"
                  maxLength={4}
                  value={codigoFuncionario}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="****"
                  autoFocus
                  className="comissao-lock-input"
                />
                <div className="comissao-lock-dots">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`comissao-lock-dot ${i < codigoFuncionario.length ? "filled" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {erroCodigo && (
                <p className="comissao-lock-error">
                  Código incorreto. Tente novamente.
                </p>
              )}

              <button
                className="comissao-lock-button"
                onClick={liberaEntrada}
                disabled={codigoFuncionario.length < 4}
              >
                Acessar
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <nav className="navBar">
        <Link to="/">
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>Fabiana Perfumaria</h1>
      </nav>

      <main className="comissao-page">
        <section className="comissao-header">
          <div>
            <span>Comissao de vendas</span>
            <h2>Resumo por funcionaria</h2>
          </div>
        </section>

        <section className="comissao-metrics">
          <div className="comissao-metric-card">
            <div className="comissao-metric-icon gold">
              <FaWallet />
            </div>
            <div>
              <p>Total vendido</p>
              <strong>{formatarMoeda(totalVendido)}</strong>
            </div>
          </div>

          <div className="comissao-metric-card">
            <div className="comissao-metric-icon blue">
              <FaChartLine />
            </div>
            <div>
              <p>Vendas filtradas</p>
              <strong>{vendasUnicas.length}</strong>
            </div>
          </div>

          <div className="comissao-metric-card">
            <div className="comissao-metric-icon green">
              <FaUserTie />
            </div>
            <div>
              <p>Ganhos em comissao</p>
              <strong>{formatarMoeda(comissaoVendas)}</strong>
            </div>
          </div>

          <div className="comissao-metric-card comissao-salario-card">
            <div className="comissao-metric-icon green">
              <IoIosCash />
            </div>
            <div className="comissao-salario-content">
              <p>Salário Total</p>
              <strong className="comissao-salario-total">
                {formatarMoeda(baseSalario + comissaoVendas)}
              </strong>
              <div className="comissao-salario-breakdown">
                <div className="comissao-salario-item">
                  <span className="comissao-salario-label">Base</span>
                  <span className="comissao-salario-value">
                    {formatarMoeda(baseSalario)}
                  </span>
                </div>
                <div className="comissao-salario-divider">+</div>
                <div className="comissao-salario-item">
                  <span className="comissao-salario-label">Comissão</span>
                  <span className="comissao-salario-value comissao-value">
                    {formatarMoeda(comissaoVendas)}
                  </span>
                </div>
              </div>
              <div className="comissao-salario-formula">
                {!modoEdicao ? (
                  <span className="comissao-formula-text">
                    {formatarMoeda(baseSalario)} + ({formatarMoeda(totalVendido)}{" "}
                    × {porcentagemComissao}%)
                    {" "}
                    <span>÷100</span>
                    <div className="editar-comissao" onClick={iniciarEdicao}>
                      <MdOutlineEdit size={15}/>
                    </div>
                  </span>
                ) : (
                  <div className="comissao-edicao-formula">
                    <input
                      type="text"
                      value={editBaseSalario}
                      onChange={(e) => setEditBaseSalario(formatarMoedaInput(e.target.value))}
                      className="comissao-input-edicao"
                      placeholder="Salário Base"
                    />
                    <span className="comissao-operador">+</span>
                    <span className="comissao-valor-fixo">({formatarMoeda(totalVendido)}</span>
                    <span className="comissao-operador">×</span>
                    <input
                      type="number"
                      step="0.1"
                      value={editPorcentagem}
                      onChange={(e) => setEditPorcentagem(e.target.value)}
                      className="comissao-input-edicao comissao-input-porcentagem"
                      placeholder="%"
                    />
                    <span className="comissao-valor-fixo">%)</span>
                    <span className="comissao-operador">÷100</span>
                    <button className="comissao-salvar-edicao" onClick={salvarEdicao}>
                      ✓
                    </button>
                    <button className="comissao-cancelar-edicao" onClick={() => setModoEdicao(false)}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <form className="comissao-filter-card">
          <label>
            <span>Funcionario</span>
            <select
              value={nomeFuncionario}
              onChange={(event) => setNomeFuncionario(event.target.value)}
            >
              <option value="">Todas</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario} value={funcionario}>
                  {funcionario}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Forma de pagamento</span>
            <select
              value={formaDePagamento}
              onChange={(event) => setFormaDePagamento(event.target.value)}
            >
              <option value="">Todas</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Pix">Pix</option>
              <option value="Credito">Cartao de Credito</option>
              <option value="Debito">Cartao de Debito</option>
              <option value="Crediario">Ficha</option>
              <option value="Pagamento dividido">Pagamento Dividido</option>
            </select>
          </label>

          <label>
            <span>Data inicial</span>
            <div className="comissao-date-input">
              <FaCalendarAlt />
              <input
                type="date"
                value={dataInicio}
                onChange={(event) => setDataInicio(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Data final</span>
            <div className="comissao-date-input">
              <FaCalendarAlt />
              <input
                type="date"
                value={dataFim}
                onChange={(event) => setDataFim(event.target.value)}
              />
            </div>
          </label>
        </form>

        <section className="comissao-table-card">
          <div className="comissao-table-title">
            <h3>Vendas encontradas</h3>
            <span>{vendasUnicas.length} resultado(s)</span>
          </div>

          <div className="comissao-table-scroll">
            <table className="comissao-table">
              <thead>
                <tr>
                  <th>Funcionario</th>
                  <th>Cliente</th>
                  <th>Pagamento</th>
                  <th>Total</th>
                  <th>Comissao</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {vendasUnicas.length > 0 ? (
                  vendasUnicas.map((venda, index) => (
                    <tr
                      key={`${venda.idVenda ?? venda.IdVenda}-${venda.id_produto ?? venda.nomeDoProduto ?? index}-${index}`}
                      onClick={() => abrirDetalhesVenda(venda)}
                      className="comissao-table-row-clickable"
                    >
                      <td>{venda.funcionario || "Nao informado"}</td>
                      <td>{venda.comprador || "Cliente nao informado"}</td>
                      <td>
                        <span className="comissao-badge">
                          {textoFormaPagamento(venda)}
                        </span>
                      </td>
                      <td className="comissao-table-total">
                        {formatarMoeda(venda.precoTotal)}
                      </td>
                      <td className="comissao-table-comissao">
                        {textoFormaPagamento(venda) === "Crediario"
                          ? formatarMoeda((venda.precoTotal * 0.5) / 100)
                          : formatarMoeda(
                              (venda.precoTotal * porcentagemComissao) / 100,
                            )}
                      </td>
                      <td>
                        {venda.dataDaVenda
                          ? format(new Date(venda.dataDaVenda), "dd/MM/yyyy")
                          : "--"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="comissao-empty">
                      Selecione a funcionaria acima para consultar as vendas e
                      comissões.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal de detalhes da venda */}
        {vendaSelecionada && (
          <div className="comissao-modal-overlay" onClick={fecharDetalhesVenda}>
            <div
              className="comissao-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="comissao-modal-close"
                onClick={fecharDetalhesVenda}
              >
                <FaTimes />
              </button>

              <div className="comissao-modal-header">
                <h2 className="comissao-modal-title">Detalhes da Venda</h2>
              </div>

              <div className="comissao-modal-body">
                {/* Informações básicas */}
                <div className="comissao-modal-section">
                  <h3 className="comissao-modal-section-title">
                    Dados da Venda
                  </h3>
                  <div className="comissao-modal-grid">
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">Funcionário</span>
                      <div className="comissao-modal-value flex items-center gap-2">
                        <FaUserTie className="text-amber-700" />
                        {vendaSelecionada.funcionario || "Não informado"}
                      </div>
                    </div>
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">Cliente</span>
                      <div className="comissao-modal-value flex items-center gap-2">
                        <FaUser className="text-gray-600" />
                        {vendaSelecionada.comprador || "Não informado"}
                      </div>
                    </div>
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">Telefone</span>
                      <div className="comissao-modal-value flex items-center gap-2">
                        <FaPhone className="text-green-600" />
                        {vendaSelecionada.numeroDeTelefone || "Não informado"}
                      </div>
                    </div>
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">Data e Hora</span>
                      <div className="comissao-modal-value flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" />
                        {vendaSelecionada.dataDaVenda
                          ? format(
                              new Date(vendaSelecionada.dataDaVenda),
                              "dd/MM/yyyy HH:mm",
                            )
                          : "--"}
                      </div>
                    </div>
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">
                        Forma de Pagamento
                      </span>
                      <div className="comissao-modal-value">
                        <span className="comissao-badge">
                          {textoFormaPagamento(vendaSelecionada)}
                        </span>
                      </div>
                    </div>
                    <div className="comissao-modal-item">
                      <span className="comissao-modal-label">Total</span>
                      <div className="comissao-modal-value font-bold text-green-600 text-xl">
                        {formatarMoeda(vendaSelecionada.precoTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="comissao-modal-section">
                  <h3 className="comissao-modal-section-title">
                    Produtos Vendidos
                  </h3>
                  <div className="comissao-modal-products">
                    {getProdutosDaVenda(vendaSelecionada.idVenda).map(
                      (produto, idx) => (
                        <div key={idx} className="comissao-modal-product-item">
                          <div className="comissao-modal-product-info">
                            <p className="comissao-modal-product-name">
                              {produto.nomeDoProduto}
                            </p>
                            <p className="comissao-modal-product-qty">
                              Quantidade: {produto.quantidade}
                            </p>
                          </div>
                          <div className="comissao-modal-product-price">
                            <p className="comissao-modal-product-unit">
                              {formatarMoeda(produto.precoUnitario)}
                              <span className="comissao-unitaria">
                                Comissão:{" "}
                                {textoFormaPagamento(produto) === "Crediario"
                                  ? formatarMoeda(
                                      (produto.precoUnitario * 0.5) / 100,
                                    )
                                  : formatarMoeda(
                                      (produto.precoUnitario *
                                        porcentagemComissao) /
                                        100,
                                    )}
                              </span>
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Comissao;
