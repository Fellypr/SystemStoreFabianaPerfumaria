import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import "./ExcluirProdutos.css";
import { Link } from "react-router-dom";
import { MdCancel } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlinePicture } from "react-icons/ai";
function ExcluirProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisaProduto, setPesquisaProduto] = useState("");
  const buscarProduto = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/RealizarVenda/BuscarProduto",
        {
          CodigoDeBarra: pesquisaProduto,
          NomeDoProduto: pesquisaProduto,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setProdutos(response.data);
    } catch (error) {
      console.error(error);
      setProdutos([]);
    }
  };
  useEffect(() => {
    if (pesquisaProduto.trim().length > 0) {
      buscarProduto();
      console.log(produtos);
    } else {
      setProdutos([]);
    }
  }, [pesquisaProduto]);

  const handleExcluirProduto = async () => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmar) return;

    console.log(produtos);  
    try {
      await axios.delete(`http://localhost:5080/api/AdicionarProduto/ExcluirProduto/${produtos.id_Produto}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Produto excluído com sucesso!");
      setProdutos([]);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto.");
    }
  };
  return (
    <>
      <main>
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
        <section className="containerExcluirProduto">
          <form
            className="BarraDePesquisa"
            onSubmit={(e) => {
              e.preventDefault();
              buscarProduto();
            }}
          >
            <input
              type="text"
              placeholder="Digite o Codigo de Barras ou Nome do Produto"
              required
              value={pesquisaProduto}
              onChange={(e) => setPesquisaProduto(e.target.value)}
            />
            <button>
              <MdOutlineScreenSearchDesktop size={25} />
            </button>
          </form>

          {produtos.length === 0 ? (
            <p> </p>
          ) : (
            <div className="Produto" key={produtos.Id_Produto}>
              <img
                src={produtos.urlImagem || "imagem"}
                width={70}
                height={65}
                alt="Sem imagem"
              />
              <div className="DetalhesDoProduto">
                <p>{produtos.nomeDoProduto}</p>
                <p>{produtos.marca}</p>
                <p>
                {produtos?.preco !== undefined
                ? produtos.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "R$ 0,00"}
                </p>
                <p>{produtos.quantidade}</p>
                <p>{produtos.codigoDeBarra}</p>
              </div>
              <button onClick={() => handleExcluirProduto(produtos.id_Produto)}>
                <MdCancel size={40} color="red" />
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default ExcluirProdutos;
