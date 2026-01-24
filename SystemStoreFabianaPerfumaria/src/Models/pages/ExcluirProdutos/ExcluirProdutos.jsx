import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import "./ExcluirProdutos.css";
import { Link } from "react-router-dom";
import { MdCancel } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import ButtonTrash from "../../../components/Button/ButtonTrash";
function ExcluirProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisaProduto, setPesquisaProduto] = useState("");

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  const buscarProduto = async () => {
    try {
      const response = await axios.post(
        `${url}/AdicionarProduto/BuscarProdutoParaRealizarVenda`,
        {
          NomeDoProduto: pesquisaProduto,
          CodigoDeBarra:pesquisaProduto
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

  const produtosFiltrados = (produtos || []).filter(
    (items) =>
      items.nomeDoProduto ||
      items.codigoDeBarra.toLowerCase().includes(pesquisaProduto.toLowerCase())
  );

  const handleExcluirProduto = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );
    if (!confirmar) return;

    console.log(produtos);
    try {
      await axios.delete(`${url}/AdicionarProduto/ExcluirProduto/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Produto excluído com sucesso!");
      buscarProduto();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Voce tentou excluir um Produto já excluído!");
    }
  };
  return (
    <>
      <main className="pageExcluir">
        <header className="headerExcluir">
          <Link to={"/"}>
            <img src="img/SUBLOGO- BRONZE.png" alt="Logo" />
          </Link>
          <h1>Excluir Produtos</h1>
        </header>

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
              placeholder="Buscar produto..."
              value={pesquisaProduto}
              onChange={(e) => setPesquisaProduto(e.target.value)}
            />
          </form>

          <div className="tableWrapper">
            <table className="tabelaProdutos">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Code</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((produtos) => (
                  <tr key={produtos.Id_Produto}>
                    <td className="produtoColuna">
                      <img src={produtos.urlImagem || "imagem"} alt="Produto" />
                      <div>
                        <strong>{produtos.nomeDoProduto}</strong>
                        <span>{produtos.marca}</span>
                      </div>
                    </td>


                    <td className="preco">
                      {produtos?.preco?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td
                      className={
                        produtos.quantidade < 0 ? "estoque negativo" : "estoque"
                      }
                    >
                      {produtos.quantidade}
                    </td>

                    <td>{produtos.codigoDeBarra}</td>

                    <td>
                      <ButtonTrash
                        handleExcluirProduto={() =>
                          handleExcluirProduto(produtos.id_Produto)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default ExcluirProdutos;
