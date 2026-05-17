import "./AdicionarProduto.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "../../../components/Loading/Loading";
import { Html5QrcodeScanner } from "html5-qrcode";
import MessageError from "../../../components/FeedBack/MessageError";
import parseApiError from "../../../utils/parseApiError";
import SwitchAdicionarProduto from "../../../components/Switch/MudarParaModoInteligente";
import ModoManual from "./ModoManual";
import ModoInteligente from "./ModoInteligente";
import { Toaster } from "react-hot-toast";

function AdicionarProduto() {
  const [modoInteligente, setModoInteligente] = useState(false);
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

  useEffect(() => {
    const produtoSalvo = localStorage.getItem("produto");
    if (produtoSalvo) {
      setModoInteligente(true);
    }
  }, []);

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
        <h1>Fabiana Perfumaria</h1>
        <SwitchAdicionarProduto
          checked={modoInteligente}
          onChange={() => setModoInteligente(!modoInteligente)}
        />
      </div>

      {modoInteligente ? (
        <ModoInteligente />
      ) : (
        <ModoManual
          nomeDoProduto={nomeDoProduto}
          setNomeDoProduto={setNomeDoProduto}
          marca={marca}
          setMarca={setMarca}
          preco={preco}
          setPreco={setPreco}
          precoAdquirido={precoAdquirido}
          setPrecoAdquirido={setPrecoAdquirido}
          precoVista={precoVista}
          setPrecoVista={setPrecoVista}
          precoEmFicha={precoEmFicha}
          setPrecoEmFicha={setPrecoEmFicha}
          quantidade={quantidade}
          setQuantidade={setQuantidade}
          codigoDeBarras={codigoDeBarras}
          setCodigoDeBarras={setCodigoDeBarras}
          urlImagem={urlImagem}
          setUrlImagem={setUrlImagem}
          AdicionarProduto={AdicionarProduto}
          limparCampos={limparCampos}
          handleMascara={handleMascara}
          showScanner={showScanner}
          setShowScanner={setShowScanner}
          produtos={produtos}
          marcasDisponiveis={marcasDisponiveis}
          mostrarListaMarcas={mostrarListaMarcas}
          setMostrarListaMarcas={setMostrarListaMarcas}
        />
      )}

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
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'inherit', fontSize: '0.9rem' },
          success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
    </main>
  );
}

export default AdicionarProduto;
