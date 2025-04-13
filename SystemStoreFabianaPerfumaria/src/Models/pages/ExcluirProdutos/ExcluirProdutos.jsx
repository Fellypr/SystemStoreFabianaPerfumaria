import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import "./ExcluirProdutos.css";
import { Link } from "react-router-dom";
function ExcluirProdutos() {
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

        <h1>Excluir Produtos</h1>
      </div>
      <form className="BarraDePesquisa">
        <input
          type="text"
          placeholder="Digite o Codigo de Barras ou Nome do Produto"
          required
        />
        <button>
          <MdOutlineScreenSearchDesktop size={25} />
        </button>
      </form>
    </>
  );
}

export default ExcluirProdutos;
