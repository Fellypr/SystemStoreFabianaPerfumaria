import "./HistoricoEEstatistica.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

import { FaPix } from "react-icons/fa6";
import { CiCreditCard2 } from "react-icons/ci";
import { GiMoneyStack } from "react-icons/gi";
import { FaRegIdCard } from "react-icons/fa6";

function HistoricoEEstatistica() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);

  const [inputFormadePagamento, setInputFormadePagamento] = useState("");

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  async function FechandoCaixa() {
    try {
      const response = await axios.get(
        `${url}/RealizarVenda/VendasRealizadas?formaDepagamento=${inputFormadePagamento}`,
      );
      setHistoricoDeVendasDeHoje(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
    }
  }

  useEffect(() => {
    FechandoCaixa();
  }, [inputFormadePagamento]);

  const totalVendidoHoje = HistoricoDeVendasDeHoje.reduce((total, venda) => {
    return total + (parseFloat(venda.precoTotal) || 0);
  }, 0);

  const filtrarValoresTotaisDeHoje = Object.values(
    HistoricoDeVendasDeHoje.reduce((acc , item) => {
      if(!acc[item.formaDePagamento]) acc[item.formaDePagamento] = item;
      return acc
    }, {})
  )

  const totaisPorMetodo = HistoricoDeVendasDeHoje.reduce((acc, item) => {
  const metodo = item.formaDePagamento;
  const valor = parseFloat(item.precoTotal) || 0;

  
  acc[metodo] = (acc[metodo] || 0) + valor;
  
  return acc;
}, {});



  return (
    <>
      <div className="navBar">
        <Link to={"/"}>
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>📊 Vendas De Hoje</h1>
      </div>

      <div className="TotalVendidoDoDia">
        <div className="containerGrafico">
          <div className="resultado-vendas-geral-container">
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <FaPix  size={50} color="#4DB8AA"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#4DB8AA"}}>
                <p>Pix</p>
                <span>
                  {(totaisPorMetodo.Pix || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <GiMoneyStack  size={50} color="#24d600"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#25b109"}}>
                <p>Dinheiro</p>
                <span>
                  {(totaisPorMetodo.Dinheiro || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
            
            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <CiCreditCard2  size={50} color="#14165A"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#14165A"}}>
                <p>Cartão Credito</p>
                <span>
                  {(totaisPorMetodo.Credito || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <CiCreditCard2  size={50} color="#090df5"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#090df5"}}>
                <p>Cartão Debito</p>
                <span>
                  {(totaisPorMetodo.Debito || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <div className="resultado-vendas-geral-card">
              <div className="resultado-vendas-geral-icon">
                <FaRegIdCard  size={50} color="#08cde7"/>
              </div>
              <div className="resultado-vendas-geral-text" style={{color:"#08cde7"}}>
                <p>Crediario</p>
                <span>
                  {(totaisPorMetodo.Crediario || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

          </div>
          <div className="TabelaDeVendasDeHoje">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Valor Total</th>
                  <select
                    onChange={(e) => setInputFormadePagamento(e.target.value)}
                    className="select-forma-de-pagamento"
                  >
                    <option value="">Todas</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Credito">Credito</option>
                    <option value="Debito">Debito</option>
                    <option value="Crediario">Ficha</option>
                  </select>
                  <th>Ficha</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {HistoricoDeVendasDeHoje.map((venda) => (
                  <tr key={venda.id}>
                    <td data-label="Cliente">{venda.comprador}</td>
                    <td data-label="Produto">{venda.nomeDoProduto}</td>
                    <td data-label="Valor Total">
                      {venda.precoTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td data-label="Pagamento">{venda.formaDePagamento}</td>
                    <td data-label="Ficha">
                      {venda?.valorDaFicha === 0
                        ? "Paga"
                        : venda?.valorNaFicha !== undefined
                          ? parseFloat(venda.valorNaFicha).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )
                          : "R$ 0,00"}
                    </td>
                    <td data-label="Data">
                      {format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="TotalVendido">
            <p>Total Vendido Hoje:</p>
            <p className="valorTotal">
              {totalVendidoHoje.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HistoricoEEstatistica;
