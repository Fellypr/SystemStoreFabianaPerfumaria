import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import axios from "axios";

import "./EditarProduto.css";
import { NumericFormat } from "react-number-format";
import { ImCancelCircle } from "react-icons/im";
import CardProduct from "../../../components/CardProduct/CardProduct";
import ButtonSalvar from "../../../components/Button/ButtonSalvar";
function EditarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  const buscarProdutos = async () => {
    try {
      const response = await axios.post(
        "http://192.168.0.139:5080/api/AdicionarProduto/BuscarProdutoEstoque",
        {
          NomeDoProduto: termoBusca,
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
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    if ((termoBusca || "").trim().length > 0) {
      console.log(produtos);
      buscarProdutos();
    } else {
      console.log(produtos);
      setProdutos([]);
    }
  }, [termoBusca]);

  const handleEditarProduto = (produto) => {
    window.scrollTo(0, 0);
    setProdutoSelecionado(produto);
  };

  const handleAtualizarProduto = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://192.168.0.139:5080/api/AdicionarProduto/AtualizarProduto/${produtoSelecionado.id_Produto}`,
        produtoSelecionado,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(produtoSelecionado);
      alert("Produto atualizado com sucesso!");
      setProdutoSelecionado(null);
      buscarProdutos();
    } catch (error) {
      console.error(
        `Erro ao atualizar produto:`,
        error
      );
    }
  };

  const produtosFiltrados =
    produtos ||
    [].filter((produto) =>
      produto.nomeDoProduto.toLowerCase().includes(termoBusca.toLowerCase())
    );


  return (
    <>
      <div className={produtoSelecionado ? "overlay" : ""}>
        <div className="navBar">
          <Link to={"/"}>
            <img
              src="img/SUBLOGO- BRONZE.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </Link>

          <h1>Editar Produtos</h1>
        </div>

        <div className="TabelaDePesquisa">

          <div className="TabelaDeProdutos">

            <input
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              
            />
            <div className="CardContainer">
              <CardProduct produtos={produtosFiltrados} onEditar={handleEditarProduto}/>
            </div>
          </div>
        </div>
      </div>

      {produtoSelecionado && (
        <div className="FormularioEditar">
          <h2>Editar Produto</h2>
          <ImCancelCircle
            size={30}
            color="red"
            onClick={() => setProdutoSelecionado(null)}
            style={{ cursor: "pointer" }}
            className="ImCancelCircle"
          />
          <img src={produtoSelecionado.urlImagem} width={150} height={150} />
          <form onSubmit={handleAtualizarProduto}>
            <div className="coolinput">
              <label for="input" classname="text">
                Name Do Produto:
              </label>
              <input
                type="text"
                placeholder="Write here..."
                name="input"
                classname="input"
                value={produtoSelecionado.nomeDoProduto}
                onChange={(e) =>
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    nomeDoProduto: e.target.value,
                  })
                }
              />
            </div>

            <div className="coolinput">
              <label for="input" classname="text">
                Marca Do Produto:
              </label>
              <input
                type="text"
                placeholder="Write here..."
                name="input"
                classname="input"
                value={produtoSelecionado.marca}
                onChange={(e) =>
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    marca: e.target.value,
                  })
                }
              />
            </div>

            <div className="coolinput">
              <label for="input" classname="text">
                Quantidade:
              </label>
              <input
                type="text"
                placeholder="Write here..."
                name="input"
                classname="input"
                value={produtoSelecionado.quantidade}
                onChange={(e) =>
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    quantidade: e.target.value,
                  })
                }
              />
            </div>

            <div className="coolinput">
              <label for="input">Preço:</label>
              <NumericFormat
                placeholder="R$ 0,00"
                value={produtoSelecionado.preco}
                onValueChange={(values) => {
                  const { value } = values;
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    preco: value,
                  });
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                allowNegative={false}
              />
            </div>

            <div className="coolinput">
              <label for="input">Preço Adquirido:</label>
              <NumericFormat
                placeholder="R$ 0,00"
                value={produtoSelecionado.precoAdquirido}
                onValueChange={(values) => {
                  const { value } = values;
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    precoAdquirido: value,
                  });
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                allowNegative={false}
              />
            </div>

            <div className="coolinput">
              <label htmlFor="input">Codigo De Barra:</label>
              <input
                type="text"
                placeholder="Write here..."
                name="input"
                classname="input"
                value={produtoSelecionado.codigoDeBarra}
                onChange={(e) =>
                  setProdutoSelecionado({
                    ...produtoSelecionado,
                    codigoDeBarra: e.target.value,
                  })
                }
              />
            </div>
            <div className="buttonSalvar">
                <ButtonSalvar  handleAtualizarProduto = {handleAtualizarProduto}/>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default EditarProduto;
