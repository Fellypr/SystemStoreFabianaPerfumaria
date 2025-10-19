import "./AdicionarProduto.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBarcode } from "react-icons/fa6";
import { AiOutlinePicture } from "react-icons/ai";
import Loading from "../../../components/Loading/Loading";
import { Html5QrcodeScanner } from "html5-qrcode";

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

  async function AdicionarProduto(e) {
    e.preventDefault();
    setError(null);
    if (setUrlImagem === "") {
      const deverAdicionar = window.confirm(
        "Tem certeza que deseja adicionar o produto sem imagem?"
      );
      if (!deverAdicionar) return;
    }

    const precoLimpo = preco.replace(/\D/g, "");
    const precoNumerico = Number(precoLimpo) / 100;
    const precoAdquiridoLimpo = precoAdquirido.replace(/\D/g, "");
    const precoAdquiridoNumerica = Number(precoAdquiridoLimpo) / 100;
    const precoVistaLimpo = precoVista.replace(/\D/g, "");
    const precoVistaNumerica = Number(precoVistaLimpo) / 100;
    const precoEmFichaLimpo = precoEmFicha.replace(/\D/g, "");
    const precoEmFichaNumerica = Number(precoEmFichaLimpo) / 100;

    const produto = {
      NomeDoProduto: nomeDoProduto,
      Marca: marca,
      Preco: precoNumerico,
      Quantidade: quantidade,
      CodigoDeBarra: codigoDeBarras,
      UrlImagem: urlImagem,
      PrecoAdquirido: precoAdquiridoNumerica,
      PrecoAvista: precoVistaNumerica,
      PrecoEmFicha: precoEmFichaNumerica,
    };
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.190:5080/api/AdicionarProduto/CadastroDeProdutos",
        produto,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSucesso(true);
      }
      setProdutos([...produtos, produto]);
      setNomeDoProduto("");
      setMarca("");
      setPreco("R$ 0,00");
      setQuantidade("");
      setCodigoDeBarras("");
      setUrlImagem("");
      setPrecoAdquirido("R$ 0,00");
      setPrecoVista("R$ 0,00");
      setPrecoEmFicha("R$ 0,00");
    } catch (error) {
      let mensagemErro = "Erro ao adicionar produto. Tente novamente.";

      if (error.response && error.response.data) {
        mensagemErro = error.response.data;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      setError(mensagemErro);
      console.log("Erro ao adicionar produto:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (sucesso) {
      setTimeout(() => {
        setSucesso(false);
      }, 5000);
    }
  }, [sucesso]);

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

  const PrecoVista = (e) => {
    let valorDigitado = e.target.value;
    valorDigitado = valorDigitado.replace(/\D/g, "");
    const valorNumerico = (Number(valorDigitado) / 100).toFixed(2);
    const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPrecoVista(valorFormatado);
  };

  const PrecoEmFicha = (e) => {
    let valorDigitado = e.target.value;
    valorDigitado = valorDigitado.replace(/\D/g, "");
    const valorNumerico = (Number(valorDigitado) / 100).toFixed(2);
    const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPrecoEmFicha(valorFormatado);
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
  useEffect(() => {
    if (error !== null) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  const iniciarScanner = (e) => {
    e.preventDefault();
    setShowScanner(true);
  };

  useEffect(() => {
    if (showScanner) {
      const scannerId = "qr-reader";

      const config = {
        fps: 10,

        
        videoConstraints: {
          facingMode: "environment", 
        },

        qrbox: {
          width: window.innerWidth * 0.8,
          height: 150,
        },
        disableFlip: false,
      };

      const scanner = new Html5QrcodeScanner(scannerId, config, false);

      const scannerSuccess = (decodedText, decodedResult) => {
        scanner.clear().catch((err) => console.error(err));
        setShowScanner(false);
        setCodigoDeBarras(decodedText);
      };

      const scannerError = (errorMessage) => {};

      scanner.render(scannerSuccess, scannerError);

      return () => {
        try {
          scanner.clear().catch((err) => {});
        } catch (error) {}
      };
    }
  }, [showScanner]);

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
        <h1>Adicionar Produto</h1>
      </div>
      <div className="containerAdicionarProduto">
        <form className="FormAdicionarProduto" onSubmit={AdicionarProduto}>
          <picture>
            {urlImagem ? (
              <img
                src={urlImagem}
                alt="Imagem do Produto"
                height={100}
                width={100}
              />
            ) : (
              <div className="ContainerImagem">
                <AiOutlinePicture size={100} />
                <p>Selecione uma Imagem</p>
              </div>
            )}
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
                minLength={3}
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
                minLength={3}
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

            {showScanner ? (
              <div id="qr-reader" />
            ) : (
              <button
                className="buttoncam"
                onClick={iniciarScanner}
                type="button"
              >
                <FaBarcode size={30} />
              </button>
            )}

            <div className="inputAdd">
              <label htmlFor="preco">Preço Revista</label>
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
              <label htmlFor="precoAdquirido">Preço Adquirido</label>
              <input
                id="precoAdquirido"
                type="text"
                placeholder="Preço Adquirido"
                value={precoAdquirido}
                onChange={PrecoAdquirido}
              />
            </div>

            <div className="inputAdd">
              <label htmlFor="preco">Preço para Cliente</label>
              <input
                id="preco"
                type="text"
                required
                placeholder="Preço"
                value={precoVista}
                onChange={PrecoVista}
              />
            </div>

            <div className="inputAdd">
              <label htmlFor="preco">Preço na Ficha</label>
              <input
                id="preco"
                type="text"
                required
                placeholder="Preço"
                value={precoEmFicha}
                onChange={PrecoEmFicha}
              />
            </div>
            <button type="submit">Adicionar</button>
          </div>
        </form>
        <br />
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
      {error && (
        <div className="error">
          <div className="error__icon">
            <svg
              fill="none"
              height={24}
              viewBox="0 0 24 24"
              width={24}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z"
                fill="#393a37"
              />
            </svg>
          </div>
          <div className="error__title">{error}</div>
          <div className="error__close">
            <svg
              height={20}
              viewBox="0 0 20 20"
              width={20}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"
                fill="#393a37"
              />
            </svg>
          </div>
        </div>
      )}

      {loading && (
        <div className={loading ? "Loading" : ""}>
          <Loading />
        </div>
      )}

      {sucesso && (
        <div className="success">
          <div className="success__icon">
            <svg
              fill="none"
              height={24}
              viewBox="0 0 24 24"
              width={24}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="m12 1c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm4.768 9.14c.0878-.1004.1546-.21726.1966-.34383.0419-.12657.0581-.26026.0477-.39319-.0105-.13293-.0475-.26242-.1087-.38085-.0613-.11844-.1456-.22342-.2481-.30879-.1024-.08536-.2209-.14938-.3484-.18828s-.2616-.0519-.3942-.03823c-.1327.01366-.2612.05372-.3782.1178-.1169.06409-.2198.15091-.3027.25537l-4.3 5.159-2.225-2.226c-.1886-.1822-.4412-.283-.7034-.2807s-.51301.1075-.69842.2929-.29058.4362-.29285.6984c-.00228.2622.09851.5148.28067.7034l3 3c.0983.0982.2159.1748.3454.2251.1295.0502.2681.0729.4069.0665.1387-.0063.2747-.0414.3991-.1032.1244-.0617.2347-.1487.3236-.2554z"
                fill="#393a37"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <div className="success__title">Produto Adicionado com sucesso</div>
          <div className="success__close">
            <svg
              height={20}
              viewBox="0 0 20 20"
              width={20}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"
                fill="#393a37"
              />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}

export default AdicionarProduto;
