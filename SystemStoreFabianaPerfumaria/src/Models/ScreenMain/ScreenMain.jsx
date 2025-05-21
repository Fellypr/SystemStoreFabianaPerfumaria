import "./ScreenMain.css";
import { Link } from "react-router-dom";
//react icons
import { GiDelicatePerfume,GiWallet } from "react-icons/gi";
import { MdDeleteForever } from "react-icons/md";
import {FaUserEdit  } from "react-icons/fa";
import { FaCashRegister } from "react-icons/fa6";
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
              <FaCashRegister size={50} />
              Fechamento De Caixa
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(0, 0, 0)" }}>
            <Link className="Link" to={"/EditarProduto"}>
              <LiaEdit size={50} />
              Editar Produtos
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
          <div className="Item" style={{ backgroundColor: "rgb(126, 126, 126)" }}>
            <Link className="Link" to={"/EditarCliente"}>
              <FaUserEdit size={50}  />
              Editar Clientes
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(50, 223, 200)" }}>
            <Link className="Link" to={"/HistoricoDeVenda"}>
              <GiWallet size={50}  />
              Historico De Vendas
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default ScreenMain;
