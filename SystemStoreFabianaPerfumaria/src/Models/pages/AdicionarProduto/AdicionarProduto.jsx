import "./AdicionarProduto.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AdicionarProduto() {
  const [nomeDoProduto, setNomeDoProduto] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("R$ 0,00");
  const [quantidade, setQuantidade] = useState("");
  const [codigoDeBarras, setCodigoDeBarras] = useState("");
  const [urlImagem, setUrlImagem] = useState("");

  const [produtos, setProdutos] = useState([]);

  async function AdicionarProduto(e) {
    e.preventDefault();
    const precoLimpo = preco.replace(/\D/g, "");
    const precoNumerico = Number(precoLimpo) / 100;

    const produto = {
      NomeDoProduto: nomeDoProduto,
      Marca: marca,
      Preco: precoNumerico,
      Quantidade: quantidade,
      CodigoDeBarra: codigoDeBarras,
      UrlImagem: urlImagem,
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
      console.log(response.data);
      alert("Produto Adicionado com sucesso");

      setProdutos([...produtos, produto]);

      setNomeDoProduto("");
      setMarca("");
      setPreco("");
      setQuantidade("");
      setCodigoDeBarras("");
      setUrlImagem("");
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
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>
        <h1>Adicionar Produto</h1>
      </div>
      <div className="containerAdicionarProduto">
        <form className="FormAdicionarProduto" onSubmit={AdicionarProduto}>
          <input
            type="text"
            placeholder="URL da Imagem"
            value={urlImagem}
            onChange={(e) => setUrlImagem(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Nome do Produto"
            value={nomeDoProduto}
            onChange={(e) => setNomeDoProduto(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Marca do Produto"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Preço"
            value={preco}
            onChange={Preco}
          />
          <input
            type="number"
            required
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value))}
          />
          <input
            type="text"
            placeholder="Código de Barras"
            required
            value={codigoDeBarras}
            onChange={(e) => setCodigoDeBarras(e.target.value)}
          />

          <button type="submit">Adicionar</button>
        </form>
        <div className="TabelaProdutosContainer">
          <h2>Produtos Adicionados Recentemente</h2>
          <table border={1} className="TabelaProdutos">
            <thead>
              <tr>
                <th>Nome Do Produto</th>
                <th>Marca Do Produto</th>
                <th width={100}>Preço</th>
                <th>Quantidade</th>
                <th>Código De Barras</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto, index) => (
                <tr key={index}>
                  <td>{produto.NomeDoProduto}</td>
                  <td>{produto.Marca}</td>
                  <td>{produto.Preco}</td>
                  <td>{produto.Quantidade}</td>
                  <td>{produto.CodigoDeBarra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdicionarProduto;
