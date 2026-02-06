import "./TabelaDeFechamento.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

function TabelaDeFechamento() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);

  const API_URL = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  async function FechandoCaixa() {
    try {
      const response = await axios.get(
        `${API_URL}/RealizarVenda/VendasRealizadas`
      );
      console.log("Tabela de vendas:", response.data);
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

  function limitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }
  return (
    <>
      <div className="TotalVendidoDoDiaTabela">
        <div className="containerGrafico1">
          <div className="TabelaDeVendasDeHoje2">
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
                    <td data-label="Produto">{limitarNome(venda.nomeDoProduto,3)}</td>
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
                            }
                          )
                        : "R$ 0,00"}
                    </td>
                    <td data-label="Data">
                      {format(new Date(venda.dataDaVenda), "dd/MM/yyyy")}
                    </td>
                  </tr>
                ))}
                {HistoricoDeVendasDeHoje.length === 0 && (
                  <tr>
                    <td colSpan="6">Nenhuma venda realizada hoje</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="valorAtual">
            <p>Total Vendido Hoje:</p>
            <p className="valorTotalHoje">
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

export default TabelaDeFechamento;
