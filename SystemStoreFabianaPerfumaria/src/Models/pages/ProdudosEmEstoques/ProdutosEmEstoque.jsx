import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProdutosEmEstoque.css";
import Loading from "../../../components/Loading/Loading";
import EditarProduto from "../../../components/ContainerEditarProduto/EditarProduto";
import { CiEdit } from "react-icons/ci";

function ProdutosEmEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [termoNomeProduto, setTermoNomeProduto] = useState("");
  const [termoMarca, setTermoMarca] = useState("");
  const [termoCodigo, setTermoCodigo] = useState("");
  
  const [showEditarProduto, setShowEditarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  function AparecerTelaEditar(item) {
    setShowEditarProduto(true);
    setProdutoSelecionado(item);
    console.log(item);
  }
  async function Buscar() {
    try {
      const response = await axios.post(
        `${url}/AdicionarProduto/BuscarProdutoEstoque`,
        {
          NomeDoProduto: termoNomeProduto,
          Marca: termoMarca,
          CodigoDeBarra: termoCodigo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setProdutos(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("error de dados", error);
    }
  }
  useEffect(() => {
      Buscar();
  }, [termoNomeProduto, termoMarca, termoCodigo]);

  const produtosFiltrados = (produtos || []).filter(
    (item) =>
      item.nomeDoProduto ||
      item.marca
        .toLowerCase()
        .includes(termoNomeProduto || termoMarca.toLowerCase()),
  );
  function limitarNome(nome, limite = 4) {
    const palavras = nome.split(" ");
    if (palavras.length <= limite) return nome;
    return palavras.slice(0, limite).join(" ") + " ...";
  }

  return (
    <>
      <nav className="navBarModern">
        <Link to="/">
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={80}
            height={80}
            alt="Logo"
          />
        </Link>
        <h2>Fabiana Perfumaria</h2>
      </nav>

      <div className="PageContainer">
        <div className="ContentCard">
          <h1 className="TitlePage">Produtos Em Estoque</h1>

          <div className="SearchSection">
            <div className="InputGroup">
              <label>Nome do Produto</label>
              <input
                type="text"
                placeholder="Pesquisar pelo Nome do Produto"
                value={termoNomeProduto}
                onChange={(e) => setTermoNomeProduto(e.target.value)}
              />
            </div>

            <div className="InputGroup">
              <label>Código do Produto</label>
              <input
                type="text"
                placeholder="Pesquisar pelo Código de Barras"
                value={termoCodigo}
                onChange={(e) => setTermoCodigo(e.target.value)}
              />
            </div>

            <div className="InputGroup">
              <label>Marca</label>
              <input
                type="text"
                placeholder="Pesquisar pela Marca"
                value={termoMarca}
                onChange={(e) => setTermoMarca(e.target.value)}
              />
            </div>
          </div>

          <div className="TableModern">
            <div className="HeaderGrid">
              <p>Imagem</p>
              <p>Produto</p>
              <p>Marca</p>
              <p>Qtd</p>
              <p>Preço á vista</p>
              <p>Preço Revista</p>
              <p>Código</p>
            </div>

            <div className="BodyList">
              {produtosFiltrados.map((produto, index) => (
                <button className="RowGrid" key={index} onClick={() => AparecerTelaEditar(produto)}>
                  <img src={produto.urlImagem} className="ProductImg" />

                  <p className="ProdName">
                    {limitarNome(produto.nomeDoProduto, 5)}
                  </p>
                  <p className="Brand">{produto.marca}</p>

                  <p
                    className={`Qtd ${produto.quantidade < 0 ? "negativo" : ""}`}
                  >
                    {produto.quantidade}
                  </p>

                  <p className="Price">
                    R$ {parseFloat(produto.precoAvista).toFixed(2)}
                  </p>

                  <p className="Price-revista">
                    R$ {parseFloat(produto.preco).toFixed(2)}
                  </p>

                  <p className="Code">{produto.codigoDeBarra}</p>
                  
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showEditarProduto && (
        <div className="editar-produto-container">
          <EditarProduto  setShowEditarProduto={setShowEditarProduto} produtoSelecionado={produtoSelecionado} setProdutoSelecionado={setProdutoSelecionado} Buscar={Buscar}/>
        </div>
      )}
    </>
  );
}

export default ProdutosEmEstoque;
