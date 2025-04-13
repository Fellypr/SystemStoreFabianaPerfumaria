//react
import React, { useState, useEffect } from "react";
import axios from "axios";
//icons
import { MdCancel } from "react-icons/md";

//css
import "./RealizarUmaVenda.css";
import "./RealizarVendaMobile.css";
//router
import { Link } from "react-router-dom";

// Função para formatar valores monetários
function formatarMoeda(e, setValor) {
  const valorNumerico = e.target.value.replace(/\D/g, "");
  const valorFormatado = (Number(valorNumerico) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  setValor(valorFormatado);
}

function RealizarUmaVenda() {
  const [codigoDeBarra, setCodigoDeBarras] = useState("");
  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [desconto, setDesconto] = useState("R$ 0,00");
  const [produtosVendidos, setProdutosVendidos] = useState([]);
   

  // Buscar produto no backend
  const buscarProduto = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/RealizarVenda/BuscarProduto",
        {
          CodigoDeBarra: codigoDeBarra,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Resposta completa:", response);
      console.log("Resposta completa com data:", response.data);
      setProduto(response.data);
    } catch (error) {
      console.log("Produto não encontrado", error);
      setProduto(null);
    }
  };

  // Dispara busca do produto sempre que o código de barras muda
  useEffect(() => {
    if (codigoDeBarra.trim().length > 7) {
      buscarProduto();
    }
  }, [codigoDeBarra]);

  const adicionarProduto = () => {
    if (!produto) return;

    const produtoComQuantidadeEDesconto = {
      ...produto,
      quantidade,
      desconto,
    };

    setProdutosVendidos([...produtosVendidos, produtoComQuantidadeEDesconto]);

    setProduto(null);
    setCodigoDeBarras("");
    setQuantidade(1);
    setDesconto("R$ 0,00");
  };
  const calcularTotalGeral = () => {
    const total = produtosVendidos.reduce((acc, item) => {
      const Valor = parseFloat(item.preco);
      const qtd = parseInt(item.quantidade);
      const descontoNum = parseFloat(item.desconto.replace(/\D/g, "")) / 100;
      return acc + (Valor * qtd - descontoNum);
    }, 0);

    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const removerProduto = (index) => {
    const novaLista = produtosVendidos.filter((_, i) => i !== index);
    setProdutosVendidos(novaLista);
  };

  return (
    <>
      <header className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Tela De Venda</h1>
      </header>

      <main className="ContainerTelaDeVenda">
        {/* FORMULÁRIO DE PRODUTO */}
        <form className="CadastraProduto" onSubmit={(e) => e.preventDefault()}>
          <div className="imagemDoProduto">
            <img src={produto?.urlImagem ||" "} alt="" width={100} height={100} style={{ borderRadius: "50%" , position: "relative",
              left: "40%"
            }} />
          </div>
          <div className="input-group">
            <label>Código:</label>
            <input
              type="text"
              placeholder="Digite o código de barras"
              value={codigoDeBarra}
              onChange={(e) => setCodigoDeBarras(e.target.value)}
              required
              minLength={7}
            />
          </div>

          <div className="input-group">
            <label>Nome do Produto:</label>
            <div className="NomeProduto">
              <p>{produto?.nomeDoProduto || "Produto não encontrado"}</p>
            </div>
          </div>

          <div className="input-group">
            <label>Quantidade:</label>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Preço do Produto:</label>
            <div className="NomeProduto">
              {produto?.preco !== undefined
                ? produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "R$ 0,00"}
            </div>
          </div>

          <div className="input-group">
            <label>Desconto:</label>
            <input
              type="text"
              value={desconto}
              onChange={(e) => formatarMoeda(e, setDesconto)}
            />
          </div>

          <button
            className="BtnAdicionar"
            type="submit"
            onClick={adicionarProduto}
            disabled={!produto}
            title="Adicionar"
            aria-label="Adicionar"
          >
            Adicionar
          </button>
        </form>

        {/* NOTA FISCAL / TABELA DE VENDAS */}
        <section className="PainelDeNotas">
          <div className="PainelDoCliente">
            <div className="ClienteInfo">
              <label>Cliente:</label>
              <input type="text" placeholder="Opcional" />
            </div>
            <p>
              {new Date().toLocaleDateString()} <br />{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="TabelaDeVenda">
            <table border={1} width={520}>
              <thead>
                <tr>
                  <th
                    colSpan={6}
                    style={{
                      backgroundColor: "rgb(0, 81, 255)",
                      color: "white",
                    }}
                  >
                    Realizando Venda
                  </th>
                </tr>
                <tr>
                  <th>Nome do Produto</th>
                  <th>Quantidade</th>
                  <th>Preço</th>
                  <th>Desconto</th>
                  <th colSpan={2}>Total Produto</th>
                </tr>
              </thead>

              <tbody>
                {produtosVendidos.map((produto, index) => {
                  const valorSomado = parseFloat(produto.preco);
                  const qtd = parseInt(produto.quantidade);
                  const descontoNum =
                    parseFloat(produto.desconto.replace(/\D/g, "")) / 100;
                  const total = valorSomado * qtd - descontoNum;

                  return (
                    <tr key={index}>
                      <td width={200}>{produto?.nomeDoProduto || "---"}</td>
                      <td width={10}>{produto.quantidade}</td>
                      <td width={100}>
                        {produto?.preco ? `R$ ${produto.preco}` : "R$ 0,00"}
                      </td>
                      <td width={100}>- {produto.desconto}</td>
                      <td width={90}>
                        {total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td style={{ border: "none" }}>
                        <button
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "red",
                            cursor: "pointer",
                          }}
                        >
                          <MdCancel
                            size={20}
                            className="BtnDeletar"
                            onClick={() => removerProduto(index)}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      backgroundColor: "rgb(255, 247, 0)",
                      color: "black",
                    }}
                  >
                    Forma De Pagamento:
                  </td>
                </tr>
                <tr>
                  <th colSpan={6}>
                    <div className="FormaDePagamento">
                      <select required>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="CartãoDeCredito">
                          Cartão de Crédito
                        </option>
                        <option value="CartãoDeDebito">Cartão de Débito</option>
                        <option value="Pix">Pix</option>
                        <option value="Ficha">Ficha</option>
                      </select>
                    </div>
                  </th>
                </tr>

                <tr>
                  <td
                    colSpan={6}
                    style={{
                      backgroundColor: "rgb(4, 159, 255)",
                      color: "white",
                    }}
                  >
                    Preço Total:
                  </td>
                </tr>

                <tr style={{ border: "none", fontSize: "1.5rem" }}>
                  <td
                    colSpan={2}
                    style={{ backgroundColor: "rgb(0, 255, 149)" }}
                  >
                    Total:
                  </td>
                  <td
                    colSpan={4}
                    style={{
                      backgroundColor: "rgb(0, 0, 0)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    height={50}
                  >
                    {calcularTotalGeral()}
                  </td>
                </tr>

                <tr className="BotoesTable">
                  <td colSpan={2}>
                    <button
                      style={{
                        backgroundColor: "rgb(0, 4, 255)",
                        color: "white",
                      }}
                      id="btn"
                    >
                      Imprimir nota
                    </button>
                  </td>
                  <td colSpan={2}>
                    <button
                      style={{
                        backgroundColor: "rgb(12, 195, 2)",
                        color: "white",
                      }}
                      id="btn"
                    >
                      Realizar venda
                    </button>
                  </td>
                  <td colSpan={2}>
                    <button
                      style={{
                        backgroundColor: "rgb(255, 0, 0)",
                        color: "white",
                      }}
                      id="btn"
                      onClick={() => setProdutosVendidos([])}
                    >
                      Cancelar venda
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* FORMA DE PAGAMENTO */}
        </section>
      </main>
    </>
  );
}

export default RealizarUmaVenda;
