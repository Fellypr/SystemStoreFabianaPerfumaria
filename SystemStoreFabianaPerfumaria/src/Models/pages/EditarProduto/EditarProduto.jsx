import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import axios from "axios";

import "./EditarProduto.css";
import { NumericFormat } from "react-number-format";

import { ImCancelCircle } from "react-icons/im";

function EditarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  const buscarProdutos = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/AdicionarProduto/BuscarProdutoEstoque",
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
    if ((termoBusca||"").trim().length > 0) {
      console.log(produtos);
      buscarProdutos();
    } else {
      console.log(produtos);
      setProdutos([]);
    }
  }, [termoBusca]);

  const handleEditarProduto = (produto) => {
    setProdutoSelecionado(produto);
  };

  const handleAtualizarProduto = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5080/api/AdicionarProduto/AtualizarProduto/${produtoSelecionado.id_Produto}`,
        produtoSelecionado,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Produto atualizado com sucesso!");
      setProdutoSelecionado(null);
      buscarProdutos();
    } catch (error) {
      console.error(`Erro ao atualizar produto:${produtoSelecionado.id_Produto}`, error );
      alert("Erro ao atualizar o produto.");
    }
  };

  const produtosFiltrados = produtos||[].filter((produto) =>
    produto.nomeDoProduto.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <>
    <div className={produtoSelecionado ? "overlay" : ""}>
      <div className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Editar Produtos e Clientes</h1>
      </div>

      <div className="TabelaDePesquisa">
        {/* Produtos */}
        <div className="TabelaDeProdutos">
          <h2>Editar Produtos</h2>

          {/* Campo de busca */}
          <input
            type="text"
            placeholder="Buscar produto pelo nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ marginBottom: "10px", padding: "5px", width: "500px",borderRadius:"10px" ,fontSize:"18px"}}
          />

          <table border={1}>
            <thead>
              <tr
                style={{
                  backgroundColor: "rgb(105, 105, 105)",
                  color: "white",
                }}
              >
                <th>CodigoDoProduto</th>
                <th>Nome Produto</th>
                <th>Marca</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id_Produto}>
                  <td width={50}>{produto.codigoDeBarra}</td>
                  <td width={200}>{produto.nomeDoProduto}</td>
                  <td width={100}>{produto.marca}</td>
                  <td width={50}>{produto.quantidade}</td>
                  <td width={100}>
                    {produto?.preco !== undefined
                      ? parseFloat(produto.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"}
                  </td>
                  <td width={20}>
                    <button
                      type="button"
                      className="BotaoEditar"
                      onClick={() => handleEditarProduto(produto)}
                    >
                      <FaRegEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
      </div>
    </div>
    {/* Formulário de Edição */}
        {produtoSelecionado && (
          <div className="FormularioEditar">
            <h2>Editar Produto</h2>
            <ImCancelCircle
              size={40}
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
                <label for="input" >
                  Preço:
                </label>
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
              <button className="btn-53">
                <div className="original">Editar</div>
                <div classname="letters">
                  <span>C</span>
                  <span>O</span>
                  <span>F</span>
                  <span>I</span>
                  <span>R</span>
                  <span>M</span>
                  <span>A</span>
                  <span>R</span>
                </div>
              </button>
            </form>
          </div>
        )}
    </>
  );
}

export default EditarProduto;
