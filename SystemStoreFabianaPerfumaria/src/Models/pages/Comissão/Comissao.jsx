import "./Comissao.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { format } from "date-fns";
import {
  FaCalendarAlt,
  FaChartLine,
  FaUserTie,
  FaWallet,
} from "react-icons/fa";
import { IoIosCash } from "react-icons/io";
import { UseComissao } from "../../../hooks/UseComissao";

function Comissao() {
  const {
    BuscarHistoricoDeVendasParaComissao,
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
    porcentagemComissao,
    codigoFuncionario,
    setCodigoFuncionario,
    liberado,
    liberaEntrada,
    erroCodigo,
    setErroCodigo,
  } = UseComissao();

  const funcionarios = ["Graciele Emiliano", "Angela Maria"];

  const comissaoVendas = (totalVendido * porcentagemComissao) / 100;

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

              <div className={`comissao-lock-input-wrapper ${erroCodigo ? "error" : ""}`}>
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
                <p className="comissao-lock-error">Código incorreto. Tente novamente.</p>
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
              <strong className="comissao-salario-total">{formatarMoeda(baseSalario + comissaoVendas)}</strong>
              <div className="comissao-salario-breakdown">
                <div className="comissao-salario-item">
                  <span className="comissao-salario-label">Base</span>
                  <span className="comissao-salario-value">{formatarMoeda(baseSalario)}</span>
                </div>
                <div className="comissao-salario-divider">+</div>
                <div className="comissao-salario-item">
                  <span className="comissao-salario-label">Comissão</span>
                  <span className="comissao-salario-value comissao-value">{formatarMoeda(comissaoVendas)}</span>
                  
                </div>
              </div>
              <div className="comissao-salario-formula">
                <span className="comissao-formula-text">
                  {formatarMoeda(baseSalario)} + ({formatarMoeda(totalVendido)} × {porcentagemComissao}%)
                  <span>÷100</span>
                </span>
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
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {vendasUnicas.length > 0 ? (
                  vendasUnicas.map((venda, index) => (
                    <tr
                      key={`${venda.idVenda ?? venda.IdVenda}-${venda.id_produto ?? venda.nomeDoProduto ?? index}-${index}`}
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
                      Selecione a funcionaria acima para consultar as vendas e comissões.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default Comissao;
