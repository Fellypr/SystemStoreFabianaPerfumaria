import "./ScreenMain.css";
import { Link } from "react-router-dom";
//react icons
import { GiDelicatePerfume } from "react-icons/gi";
import { MdDeleteForever } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { LiaEdit } from "react-icons/lia";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { IoPersonAdd } from "react-icons/io5";

import Navbar from "../../components/Navbar/Navbar";
const ScreenMain = () => {


  return (
    <>
      <div className="Main">
        <Navbar />

        <div className="Cards">
          <div className="Item" style={{ backgroundColor: "rgb(46, 214, 4)" }}>
            <Link className="Link" to={"/AdicionarProduto"}>
              <GiDelicatePerfume size={50} />
              Adicionar Produto
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(255, 0, 0)" }}>
            <Link className="Link" to={"/ExcluirProdutos"}>
              <MdDeleteForever size={50} />
              Excluir Produto
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(0, 81, 255)" }}>
            <Link className="Link" to={"/HistoricoEEstatistica"}>
              <FaHistory size={50} />
              Historico De Vendas e Estatísticas
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(0, 0, 0)" }}>
            <Link className="Link" to={"/EditarProduto"}>
              <LiaEdit size={50} />
              Editar Produtos e Clientes
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(89, 0, 255)" }}>
            <Link className="Link" to={"/RealizarUmaVenda"}>
              <MdOutlineAddShoppingCart size={50} />
              Realizar uma Venda
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(255, 102, 0)" }}>
            <Link className="Link" to={"/CadastroDeClientes"}>
              <IoPersonAdd size={50}  />
              Cadastro de Clientes
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default ScreenMain;
