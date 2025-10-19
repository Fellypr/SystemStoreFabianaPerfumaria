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
  const buscarProduto = async () => {
    try {
      const response = await axios.post(
        "http://192.168.1.190:5080/api/AdicionarProduto/BuscarProdutoEstoque",
        {
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

  const produtosFiltrados = (produtos || []).filter(
    (items) =>
      items.nomeDoProduto ||
      items.marca.toLowerCase().includes(pesquisaProduto.toLowerCase())
  );

  const handleExcluirProduto = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );
    if (!confirmar) return;

    console.log(produtos);
    try {
      await axios.delete(
        `http://192.168.1.190:5080/api/AdicionarProduto/ExcluirProduto/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Produto excluído com sucesso!");
      setProdutos([]);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Voce tentou excluir um Produto já excluído!");
    }
  };
  return (
    <>
      <main>
        <div className="navBar">
          <Link to={"/"}>
            <img
              src="img/SUBLOGO- BRONZE.png"
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
              placeholder="Digite o Nome do Produto"
              required
              value={pesquisaProduto}
              onChange={(e) => setPesquisaProduto(e.target.value)}
            />
          </form>

          {produtosFiltrados.map((produtos) => (
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
                <p style={{color:"green"}}>
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

              <div>
                  <ButtonTrash  handleExcluirProduto = {() => handleExcluirProduto(produtos.id_Produto)}/>  
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export default ExcluirProdutos;
