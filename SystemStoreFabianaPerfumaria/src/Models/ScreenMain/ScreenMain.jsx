import "./ScreenMain.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
//react icons
import { GiDelicatePerfume, GiWallet } from "react-icons/gi";
import { MdDeleteForever } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { FaCashRegister } from "react-icons/fa6";
import { LiaEdit } from "react-icons/lia";
import { MdOutlineAddShoppingCart, MdOutlineAdd } from "react-icons/md";
import { IoPersonAdd } from "react-icons/io5";
import { BiAlignLeft } from "react-icons/bi";
import { TiThMenu } from "react-icons/ti";
import { TbChartHistogram } from "react-icons/tb";
import Example from "../../components/Grafico/Grafico";
import Navbar from "../../components/Navbar/Navbar";
import Loading from "../../components/Loading/Loading";
const ScreenMain = () => {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);
  const [Options, setOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  function ToggleOptions(Options) {
    setOptions(Options);
  }
  async function FechandoCaixa() {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5080/api/RealizarVenda/VendasRealizadas"
      );
      setHistoricoDeVendasDeHoje(response.data);
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
    } finally {
      setLoading(false);
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
      <Navbar />
      <div className="Main">
        <button
          className={Options ? "OptionsOpen" : "Options"}
          onMouseEnter={() => ToggleOptions(true)}
          onMouseLeave={() => ToggleOptions(false)}
        >
          <h2 className={Options ? "MenuOpen" : "TextClose"}>Menu</h2>
          <TiThMenu size={40} className={Options ? "Menuclose" : ""} />
          <Link
            to={"/AdicionarProduto"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <MdOutlineAdd size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Adicionar
            </p>
          </Link>
          <Link
            to={"/ExcluirProdutos"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <MdDeleteForever size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Excluir Produtos
            </p>
          </Link>
          <Link
            to={"/EditarProduto"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <LiaEdit size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Editar Produtos
            </p>
          </Link>
          <Link
            to={"/CadastroDeClientes"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <IoPersonAdd size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Cadastrar Clientes
            </p>
          </Link>
          <Link
            to={"/EditarCliente"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <FaUserEdit size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Editar Clientes
            </p>
          </Link>
          <Link
            to={"/HistoricoDeVenda"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <TbChartHistogram size={40} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Historico De Venda
            </p>
          </Link>
        </button>
        <div className="Cards">
          <div className="GraficoComFechamento">
            <div
              className="FechamentoDeCaixa"
              style={{ backgroundColor: "rgba(0, 0, 0, 1)" }}
            >
              <Link className="Linktabela" to={"/HistoricoEEstatistica"}>
                <div className="TotalVendidoHoje">
                  <p style={{ color: "white", fontSize: "40px" }}>
                    Total Vendido Hoje:
                  </p>
                  <p>
                    {totalVendidoHoje.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </Link>
            </div>

            <div className="Grafico">
              <Example />
            </div>
          </div>
          <div className="realizarVendasComProdutosEstoques">
            <div
              className="Item"
              style={{
                backgroundColor: "rgb(89, 0, 255)",
                width: "80%",
                height: "60%",
                fontSize: "30px",
              }}
            >
              <Link className="Link" to={"/RealizarUmaVenda"} target="_blank">
                <MdOutlineAddShoppingCart size={100} />
                Realizar uma Venda
              </Link>
            </div>

            <div
              className="Item"
              style={{
                backgroundColor: "rgba(50, 223, 171, 1)",
                width: "30%",
                height: "60%",
                fontSize: "20px",
              }}
            >
              <Link className="Link" to={"/ProdutosEmEstoques"}>
                <BiAlignLeft size={80} />
                Produtos Em Estoque
              </Link>
            </div>
          </div>
        </div>
        <div className={loading ? "Loading" : ""}>
          
          {loading && <Loading/>}
        
        </div>
      </div>
      
    </>
  );
};

export default ScreenMain;
