import "./AdicionarProduto.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBarcode } from "react-icons/fa6";
import { AiOutlinePicture } from "react-icons/ai";
import Loading from "../../../components/Loading/Loading";
import { Html5QrcodeScanner } from "html5-qrcode";
import MessageError from "../../../components/FeedBack/MessageError";
import parseApiError from "../../../utils/parseApiError";

function AdicionarProduto() {
  const [nomeDoProduto, setNomeDoProduto] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("R$ 0,00");
  const [precoAdquirido, setPrecoAdquirido] = useState("R$ 0,00");
  const [precoVista, setPrecoVista] = useState("R$ 0,00");
  const [precoEmFicha, setPrecoEmFicha] = useState("R$ 0,00");
  const [quantidade, setQuantidade] = useState("");
  const [codigoDeBarras, setCodigoDeBarras] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [mensagemDeErro, setMensagemDeErro] = useState(null);
  const [marcasDisponiveis, setMarcasDisponiveis] = useState([]);
  const [mostrarListaMarcas, setMostrarListaMarcas] = useState(false);

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  async function BuscarMarcas() {
    try {
      const response = await axios.get(`${url}/AdicionarProduto/HistoricoDeProdutos`);
      if (response.status === 200) {
        const marcasUnicas = [...new Set(response.data.map(p => p.Marca))].filter(m => m);
        setMarcasDisponiveis(marcasUnicas);

      }
    } catch (error) {
      console.error("Erro ao buscar marcas:", error);
    }
  }

  useEffect(() => {
    BuscarMarcas();
  }, [marca]);

  async function AdicionarProduto(e) {
    e.preventDefault();
    setError(null);

    if (urlImagem === "") {
      const deverAdicionar = window.confirm(
        "Deseja adicionar o produto sem imagem?",
      );
      if (!deverAdicionar) return;
    }

    const formatar = (v) => Number(v.replace(/\D/g, "")) / 100;

    const produto = {
      NomeDoProduto: nomeDoProduto,
      Marca: marca,
      Preco: formatar(preco),
      Quantidade: quantidade,
      CodigoDeBarra: codigoDeBarras,
      UrlImagem: urlImagem,
      PrecoAdquirido: formatar(precoAdquirido),
      PrecoAvista: formatar(precoVista),
      PrecoEmFicha: formatar(precoEmFicha),
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/AdicionarProduto/CadastroDeProdutos`,
        produto,
      );
      if (response.status === 200) setSucesso(true);
      setProdutos([...produtos, produto]);
      limparCampos();
    } catch (error) {
      const msg = parseApiError(error);
      setMensagemDeErro(msg);
      console.log(msg);
    } finally {
      setLoading(false);
    }
  }

  const limparCampos = () => {
    setNomeDoProduto("");
    setMarca("");
    setPreco("R$ 0,00");
    setQuantidade("");
    setCodigoDeBarras("");
    setUrlImagem("");
    setPrecoAdquirido("R$ 0,00");
    setPrecoVista("R$ 0,00");
    setPrecoEmFicha("R$ 0,00");
  };

  const handleMascara = (valor, setter) => {
    const valorNumerico = (Number(valor.replace(/\D/g, "")) / 100).toFixed(2);
    setter(
      Number(valorNumerico).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    );
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "scanner-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          videoConstraints: { facingMode: "environment" },
        },
        false,
      );
      scanner.render(
        (text) => {
          setCodigoDeBarras(text);
          setShowScanner(false);
          scanner.clear();
        },
        () => {},
      );
      return () => scanner.clear().catch(() => {});
    }
  }, [showScanner]);

  useEffect(() => {
    if (sucesso || mensagemDeErro) {
      const timer = setTimeout(() => {
        setSucesso(false);
        setMensagemDeErro(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sucesso, mensagemDeErro]);

  return (
    <main>
      <div className="navBar">
        <Link to="/">
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
          <div className="preview-produto">
            <picture className="imagem-do-produto">
              {urlImagem ? (
                <img src={urlImagem} alt="Preview" />
              ) : (
                <div className="ContainerImagem">
                  <AiOutlinePicture size={100} />
                  <p>Selecione uma Imagem</p>
                </div>
              )}
            </picture>
            <p className="dados-produtos">
              Nome: <span className="dados">{nomeDoProduto}</span>
            </p>
            <p className="dados-produtos">
              Marca: <span className="dados">{marca}</span>
            </p>
            <p className="dados-produtos">
              Qtd: <span className="dados">{quantidade || 0}</span>
            </p>
            <p className="dados-produtos">
              Preço: <span className="dados">{precoVista}</span>
            </p>
          </div>

          <div className="ContainerInputs">
            <div className="inputAdd">
              <label>Link da Imagem</label>
              <input
                type="text"
                value={urlImagem}
                onChange={(e) => setUrlImagem(e.target.value)}
              />
            </div>
            <div className="inputAdd">
              <label>Nome do Produto</label>
              <input
                type="text"
                required
                value={nomeDoProduto}
                onChange={(e) => setNomeDoProduto(e.target.value)}
              />
            </div>
            <div className="inputAdd brand-input-container">
              <label>Marca do Produto</label>
              <input
                type="text"
                required
                value={marca}
                onChange={(e) => {
                  setMarca(e.target.value);
                  setMostrarListaMarcas(true);
                }}
                onFocus={() => setMostrarListaMarcas(true)}
                onBlur={() => setTimeout(() => setMostrarListaMarcas(false), 200)}
                autoComplete="off"
              />
              {mostrarListaMarcas && (
                <ul className="brand-dropdown">
                  {marcasDisponiveis
                    .filter((m) =>
                      m.toLowerCase().includes(marca.toLowerCase())
                    )
                    .map((m, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setMarca(m);
                          setMostrarListaMarcas(false);
                        }}
                      >
                        {m}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="inputAdd">
              <label>Quantidade</label>
              <input
                type="number"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <div className="inputAdd">
              <label>Código de Barras</label>
              <div className="input-group-barcode">
                <input
                  type="text"
                  value={codigoDeBarras}
                  onChange={(e) => setCodigoDeBarras(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-mobile-scanner"
                  onClick={() => setShowScanner(true)}
                >
                  <FaBarcode size={20} />
                </button>
              </div>
            </div>

            <div className="inputAdd">
              <label>Preço Revista</label>
              <input
                type="text"
                value={preco}
                onChange={(e) => handleMascara(e.target.value, setPreco)}
              />
            </div>
            <div className="inputAdd">
              <label>Preço Adquirido</label>
              <input
                type="text"
                value={precoAdquirido}
                onChange={(e) =>
                  handleMascara(e.target.value, setPrecoAdquirido)
                }
              />
            </div>
            <div className="inputAdd">
              <label>Preço para Cliente</label>
              <input
                type="text"
                value={precoVista}
                onChange={(e) => handleMascara(e.target.value, setPrecoVista)}
              />
            </div>
            <div className="inputAdd">
              <label>Preço na Ficha</label>
              <input
                type="text"
                value={precoEmFicha}
                onChange={(e) => handleMascara(e.target.value, setPrecoEmFicha)}
              />
            </div>

            <button className="btnAdicionar" type="submit">
              Adicionar
            </button>
          </div>
        </form>

        {showScanner && (
          <div className="modal-scanner">
            <div id="scanner-reader"></div>
            <button type="button" onClick={() => setShowScanner(false)}>
              Fechar Scanner
            </button>
          </div>
        )}

        <div className="ProductsRecents">
          {produtos.map((p, i) => (
            <div className="CardRecent" key={i}>
              <picture>
                <img src={p.UrlImagem} alt="Produto" />
              </picture>
              <h2>{p.NomeDoProduto}</h2>
              <p>Marca: {p.Marca}</p>
              <p>
                Preço:{" "}
                {p.PrecoAvista.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {mensagemDeErro && (
        <div className="Mensagem">
          <MessageError
            title={mensagemDeErro}
            onClose={() => setMensagemDeErro(null)}
          />
        </div>
      )}
      {sucesso && (
        <div className="notification success-msg">
          Produto Adicionado com sucesso
        </div>
      )}
      {loading && <Loading />}
    </main>
  );
}

export default AdicionarProduto;
