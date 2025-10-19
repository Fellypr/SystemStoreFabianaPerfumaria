import "./ScreenMain.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
//react icons
import { MdDeleteForever } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { LiaEdit } from "react-icons/lia";
import { MdOutlineAddShoppingCart, MdOutlineAdd } from "react-icons/md";
import { IoPersonAdd } from "react-icons/io5";
import { BiAlignLeft } from "react-icons/bi";
import { TiThMenu } from "react-icons/ti";
import { TbChartHistogram } from "react-icons/tb";
import { LuHouse } from "react-icons/lu";
import Example from "../../components/Grafico/Grafico";
import Navbar from "../../components/Navbar/Navbar";
import Loading from "../../components/Loading/Loading";
import TabelaDeFechamento from "../../components/TabelaDeFechamentoDeCaixa/TabelaDeFechamento";
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
        "http://192.168.1.190:5080/api/RealizarVenda/VendasRealizadas"
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
          <div className={Options ? "MenuOpen" : "TextClose"}><LuHouse size={30}/>Dashboard</div>
          <TiThMenu size={30} className={Options ? "Menuclose" : ""} />
          <Link
            to={"/AdicionarProduto"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <MdOutlineAdd size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Adicionar
            </p>
          </Link>
          <Link
            to={"/ExcluirProdutos"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <MdDeleteForever size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Excluir Produtos
            </p>
          </Link>
          <Link
            to={"/EditarProduto"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <LiaEdit size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Editar Produtos
            </p>
          </Link>
          <Link
            to={"/CadastroDeClientes"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <IoPersonAdd size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Cadastrar Clientes
            </p>
          </Link>
          <Link
            to={"/EditarCliente"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <FaUserEdit size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Editar Clientes
            </p>
          </Link>
          <Link
            to={"/HistoricoDeVenda"}
            className={Options ? "LinkDeOptions" : ""}
          >
            <TbChartHistogram size={30} />
            <p className={Options ? "LinkName" : "LinkDeOptionsClose"}>
              Historico De Venda
            </p>
          </Link>
        </button>
        <div className="Cards">
          <div className="GraficoComFechamento">
            <div
              className="FechamentoDeCaixa"
              style={{ backgroundColor: "rgba(255, 255, 255, 1)" }}
            >
              <Link className="Linktabela" to={"/HistoricoEEstatistica"}>
                <div className="TotalVendidoHoje">
                  <TabelaDeFechamento/>
                </div>
              </Link>
            </div>

            <div className="Grafico">
              <p>Vendas Da Semana</p>
              <Example />
            </div>
          </div>
          <div className="realizarVendasComProdutosEstoques">
            <div
              className="Item"
              style={{
                backgroundColor: "rgba(15, 187, 72, 1)",
                width: "80%",
                height: "60%",
                
                fontSize: "30px",
              }}
            >
              <Link className="Link" to={"/RealizarUmaVenda"}>
                <img src="/Icons/VendaIcon512x512.png" width={100} />
                Realizar uma Venda
              </Link>
            </div>

            <div
              className="Item"
              style={{
                backgroundColor: "rgba(71, 165, 241, 1)",
                width: "30%",
                height: "60%",
              }}
            >
              <Link className="Link" to={"/ProdutosEmEstoques"}>
                <img src="/Icons/android-chrome-512x512.png" alt="" width={100}/>
                <p className="textStok">Produtos em estoque</p>
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
