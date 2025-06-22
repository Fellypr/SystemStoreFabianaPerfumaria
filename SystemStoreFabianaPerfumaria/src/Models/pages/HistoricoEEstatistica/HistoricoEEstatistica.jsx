import "./HistoricoEEstatistica.css";
import { ImCancelCircle } from "react-icons/im";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

function HistoricoEEstatistica() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);
  async function FechandoCaixa() {
    try {
      const response = await axios.get(
        "http://localhost:5080/api/RealizarVenda/VendasRealizadas"
      );
      setHistoricoDeVendasDeHoje(response.data);
    } catch (error) {
      alert("Erro ao Fechar Caixa", error);
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
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Vendas De Hoje</h1>
      </div>
      <div className="TotalVendidoDoDia">
        <div className="containerGrafico">
          <div className="TabelaDeVendasDeHoje">
            <table>
              <thead>
                <tr>
                  <th>Nome do Cliente</th>
                  <th>produtos vendidos</th>
                  <th>Valor Total</th>
                  <th>Forma De Pagamento</th>
                  <th>Ficha</th>
                  <th colSpan={2}>Data Da Venda</th>
                </tr>
              </thead>
              <tbody>
                {HistoricoDeVendasDeHoje.map((venda) => (
                  <tr key={venda.id}>
                    <td>{venda.comprador}</td>
                    <td>{venda.nomeDoProduto}</td>
                    <td>
                      {venda.precoTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td>{venda.formaDePagamento}</td>
                    <td>
                      {venda?.valorDaFicha === 0
                        ? "Paga"
                        : venda?.valorNaFicha !== undefined
                        ? parseFloat(venda.valorNaFicha).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )
                        : "R$ 0,00"}
                    </td>
                    <td>{format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="TotalVendido">
            <p>Total Vendido Hoje:</p>
            <p>
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
