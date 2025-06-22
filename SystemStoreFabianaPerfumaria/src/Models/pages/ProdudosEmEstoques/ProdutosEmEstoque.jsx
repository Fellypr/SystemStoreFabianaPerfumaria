import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProdutosEmEstoque.css";

function ProdutosEmEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [termoNomeProduto, setTermoNomeProduto] = useState("");
  const [termoMarca, setTermoMarca] = useState("");
  const [termoCodigo, setTermoCodigo] = useState("");

  async function Buscar() {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/AdicionarProduto/BuscarProdutoEstoque",
        {
          NomeDoProduto: termoNomeProduto,
          Marca: termoMarca,
          CodigoDeBarra: termoCodigo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Dados Entrou", response.data);
      setProdutos(response.data);
    } catch (error) {
      console.log("error de dados", error);
    }
  }
  useEffect(() => {
    if (termoNomeProduto || termoMarca || termoCodigo.trim().length > 0) {
      Buscar();
    } else {
      setProdutos([]);
    }
  }, [termoNomeProduto, termoMarca, termoCodigo]);

  const produtosFiltrados = (produtos || []).filter(
    (item) =>
      item.nomeDoProduto ||
      item.marca
        .toLowerCase()
        .includes(termoNomeProduto || termoMarca.toLowerCase())
  );
  function limitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }

  return (
    <>
      <nav className="navBar">
        <Link to="/screenMain">
          <img
            src="./src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h2>Produtos Em Estoque</h2>
      </nav>

      <div className="StockBody">
        <div className="StockSection">
          <div className="Search">
            <div className="SearchContainer">
              <label htmlFor="Nome">Nome do Produto</label>
              <input
                id="Nome"
                type="text"
                placeholder="Pesquisar pelo Nome do Produto"
                value={termoNomeProduto}
                onChange={(e) => setTermoNomeProduto(e.target.value)}
              />
            </div>

            <div className="SearchContainer">
              <label htmlFor="Codigo">Codigo Do Produto</label>
              <input
                id="Codigo"
                type="text"
                placeholder="Pesquisar pelo Código de Barras"
                value={termoCodigo}
                onChange={(e) => setTermoCodigo(e.target.value)}
              />
            </div>

            <div className="SearchContainer">
              <label htmlFor="Marca">Marca Do Produto</label>
              <input
                id="Marca"
                type="text"
                placeholder="Pesquisar pela Marca"
                value={termoMarca}
                onChange={(e) => setTermoMarca(e.target.value)}
              />
            </div>
          </div>

          <div className="TableProductContainer">
            <div className="TableProduct">
              {produtosFiltrados.map((produto, index) => (
                <div className="BodyDate" key={index}>
                  <img src={produto.urlImagem} width={85} height={80} />
                  <p>
                    <span>Nome do Produto:</span>
                    <br />
                    {limitarNome(produto.nomeDoProduto, 5)}
                  </p>
                  <p>
                    <span>Marca:</span>
                    <br />
                    {produto.marca}
                  </p>
                  <p>
                    <span>Quantidade:</span>
                    <br />
                    {produto.quantidade}
                  </p>
                  <p>
                    <span>Preço:</span>
                    <br />
                    R$ {parseFloat(produto.preco).toFixed(2)}
                  </p>
                  <p>
                    <span>Código:</span>
                    <br />
                    {produto.codigoDeBarra}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProdutosEmEstoque;
