import "./HistoricoEEstatistica.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

function HistoricoEEstatistica() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);

  async function FechandoCaixa() {
    try {
      const response = await axios.get(
        "http://192.168.1.190:5080/api/RealizarVenda/VendasRealizadas"
      );
      setHistoricoDeVendasDeHoje(response.data);
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
    }
  }

  useEffect(() => {
    FechandoCaixa();
  }, []);

  const totalVendidoHoje = HistoricoDeVendasDeHoje.reduce((total, venda) => {
    return total + (parseFloat(venda.precoTotal) || 0);
  }, 0);

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
          <div className="TabelaDeVendasDeHoje">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Valor Total</th>
                  <th>Pagamento</th>
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
                        ? parseFloat(venda.valorNaFicha).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </td>
                    < td data-label="Data">{format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}</td>
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
