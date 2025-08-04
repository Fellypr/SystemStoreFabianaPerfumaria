import "./AdicionarProduto.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AiOutlinePicture } from "react-icons/ai";

function AdicionarProduto() {
  const [nomeDoProduto, setNomeDoProduto] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("R$ 0,00");
  const [precoAdquirido, setPrecoAdquirido] = useState("R$ 0,00");
  const [quantidade, setQuantidade] = useState("");
  const [codigoDeBarras, setCodigoDeBarras] = useState("");
  const [urlImagem, setUrlImagem] = useState("");

  const [produtos, setProdutos] = useState([]);

  async function AdicionarProduto(e) {
    e.preventDefault();
    const precoLimpo = preco.replace(/\D/g, "");
    const precoNumerico = Number(precoLimpo) / 100;

    const precoAdquiridoLimpo = precoAdquirido.replace(/\D/g, "");
    const precoAdquiridoNumerica = Number(precoAdquiridoLimpo) / 100;

    const produto = {
      NomeDoProduto: nomeDoProduto,
      Marca: marca,
      Preco: precoNumerico,
      Quantidade: quantidade,
      CodigoDeBarra: codigoDeBarras,
      UrlImagem: urlImagem,
      PrecoAdquirido: precoAdquiridoNumerica,
    };
    try {
      const response = await axios.post(
        "http://localhost:5080/api/AdicionarProduto/CadastroDeProdutos",
        produto,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Produto Adicionado com sucesso");

      setProdutos([...produtos, produto]);

      setNomeDoProduto("");
      setMarca("");
      setPreco("");
      setQuantidade("");
      setCodigoDeBarras("");
      setUrlImagem("");
      setPrecoAdquirido("");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  }

  const Preco = (e) => {
    let valorDigitado = e.target.value;
    valorDigitado = valorDigitado.replace(/\D/g, "");
    const valorNumerico = (Number(valorDigitado) / 100).toFixed(2);
    const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPreco(valorFormatado);
  };

  const PrecoAdquirido = (e) => {
    let valorDigitado = e.target.value;
    valorDigitado = valorDigitado.replace(/\D/g, "");
    const valorNumerico = (Number(valorDigitado) / 100).toFixed(2);
    const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPrecoAdquirido(valorFormatado);
  };

  useEffect(() => {
    const handleScan = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleScan);

    return () => {
      window.removeEventListener("keydown", handleScan);
    };
  }, [codigoDeBarras]);

  return (
    <>
      <div className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>Adicionar Produto</h1>
      </div>
      <div className="containerAdicionarProduto">
        <form className="FormAdicionarProduto" onSubmit={AdicionarProduto}>
          <h1>Adicione um Produto</h1>

          <picture>
            <img
              src={urlImagem}
              alt="Imagem do Produto"
              height={100}
              width={100}
            />
          </picture>
          <div className="ContainerInputs">
            <div className="inputAdd">
              <label htmlFor="urlImagem">Link da Imagem</label>
              <input
                type="text"
                placeholder="URL da Imagem"
                value={urlImagem}
                id="urlImagem"
                onChange={(e) => setUrlImagem(e.target.value)}
              />
            </div>
            <div className="inputAdd">
              <label htmlFor="nomeDoProduto">Nome do Produto</label>
              <input
                id="nomeDoProduto"
                type="text"
                required
                placeholder="Nome do Produto"
                value={nomeDoProduto}
                onChange={(e) => setNomeDoProduto(e.target.value)}
              />
            </div>

            <div className="inputAdd">
              <label htmlFor="marca">Marca do Produto</label>
              <input
                id="marca"
                type="text"
                required
                placeholder="Marca do Produto"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </div>

            <div className="inputAdd">
              <label htmlFor="preco">Preço</label>
              <input
                id="preco"
                type="text"
                required
                placeholder="Preço"
                value={preco}
                onChange={Preco}
              />
            </div>
            <div className="inputAdd">
              <label htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                required
                placeholder="Quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value))}
              />
            </div>
            <div className="inputAdd">
              <label htmlFor="codigoDeBarras">Código de Barras</label>
              <input
                id="codigoDeBarras"
                type="text"
                placeholder="Código de Barras"
                value={codigoDeBarras}
                onChange={(e) => setCodigoDeBarras(e.target.value)}
              />
            </div>

            <div className="inputAdd">
              <label htmlFor="precoAdquirido">Preço Adquirido</label>
              <input
                id="precoAdquirido"
                type="text"
                placeholder="Preço Adquirido"
                value={precoAdquirido}
                onChange={PrecoAdquirido}
              />
            </div>
            <button type="submit">Adicionar</button>
          </div>
        </form>
        <br />
        <h2
          className={produtos.length > 0 ? "ProductsRecents" : "productsFound"}
        >
          Produtos Adicionados Recentemente
        </h2>
        <div className="ProductsRecents">
          {produtos.map((produto, index) => (
            <div className="CardRecent" key={index}>
              <picture>
                <img src={produto.UrlImagem} alt="Imagem do Produto" />
              </picture>
              <h2>{produto.NomeDoProduto}</h2>
              <p>Marca: {produto.Marca}</p>
              <p>
                Preco:{" "}
                {produto?.Preco !== undefined
                  ? parseFloat(produto.Preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ 0,00"}
              </p>
              <p>Quantidade: {produto.Quantidade}</p>
              <p>Codigo de Barras: {produto.CodigoDeBarra}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdicionarProduto;
