import axios from "axios";
import "./EditarProduto.css";
import ButtonSalvar from "../../components/Button/ButtonSalvar";
import ButtonClose from "../../components/Button/ButtonClose";

function EditarProduto({
  setShowEditarProduto,
  produtoSelecionado,
  setProdutoSelecionado,
  Buscar
}) {
  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  const handleAtualizarProduto = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${url}/AdicionarProduto/AtualizarProduto/${produtoSelecionado.id_Produto}`,
        produtoSelecionado,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      alert("Produto atualizado com sucesso!");
      setProdutoSelecionado(null);
      Buscar();
      setShowEditarProduto(false);
    } catch (error) {
      console.error(`Erro ao atualizar produto:`, error);
      alert("Erro ao atualizar o produto.");
    }
  };

  return (
    <div className="editar-produto-section">
      <button
        className="button-close"
        onClick={() => setShowEditarProduto(false)}
      >
        <ButtonClose />
      </button>
      <img
        src={produtoSelecionado.urlImagem}
        alt=""
        className="imagem-product-edit"
      />

      <form className="editar-produto-form" onSubmit={handleAtualizarProduto} >
        <div className="box-edit-1">
          <div className="input-label">
            <label htmlFor="NomeDoProduto">Nome do produto:</label>
            <input
              type="text"
              id="NomeDoProduto"
              value={produtoSelecionado.nomeDoProduto}
              onChange={(e) =>
                setProdutoSelecionado({
                  ...produtoSelecionado,
                  nomeDoProduto: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="box-edit-2">
          <div className="input-label">
            <label htmlFor="marca">Marca:</label>
            <input
              type="text"
              id="marca"
              value={produtoSelecionado.marca}
              onChange={(e) =>
                setProdutoSelecionado({
                  ...produtoSelecionado,
                  marca: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="box-edit-3">
          <div className="input-label">
            <label htmlFor="codigo">Codigo de barra:</label>
            <input
              type="text"
              id="codigo"
              value={produtoSelecionado.codigoDeBarra}
              onChange={(e) =>
                setProdutoSelecionado({
                  ...produtoSelecionado,
                  codigoDeBarra: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="box-edit-4">
          <div className="input-label">
            <label htmlFor="quantidade">Quantidade:</label>
            <input
              type="text"
              id="quantidade"
              value={produtoSelecionado.quantidade}
              onChange={(e) =>
                setProdutoSelecionado({
                  ...produtoSelecionado,
                  quantidade: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="box-edit-5">
          <div className="input-label">
            <label htmlFor="preco-revista">Preço em Revista:</label>
            <input
              type="text"
              id="preco-revista"
              value={(produtoSelecionado?.preco || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                const valorNumerico = Number(apenasNumeros) / 100;

                setProdutoSelecionado({
                  ...produtoSelecionado,
                  preco: valorNumerico,
                });
              }}
            />
          </div>
        </div>
        <div className="box-edit-6">
          <div className="input-label">
            <label htmlFor="preco-vista">Preço á Vista:</label>
            <input
              type="text"
              id="preco-vista"
              value={(produtoSelecionado?.precoAvista || 0).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                },
              )}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                const valorNumerico = Number(apenasNumeros) / 100;

                setProdutoSelecionado({
                  ...produtoSelecionado,
                  precoAvista: valorNumerico,
                });
              }}
            />
          </div>
        </div>
        <div className="box-edit-7">
          <div className="input-label">
            <label htmlFor="preco-adquirido">Preço Adquirido:</label>
            <input
              type="text"
              id="preco-adquirido"
              value={(produtoSelecionado?.precoAdquirido || 0).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                },
              )}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                const valorNumerico = Number(apenasNumeros) / 100;

                setProdutoSelecionado({
                  ...produtoSelecionado,
                  precoAdquirido: valorNumerico,
                });
              }}
            />
          </div>
        </div>
        <div className="box-edit-8">
          <div className="input-label">
            <label htmlFor="preco-ficha">Preço em Ficha:</label>
            <input
              type="text"
              id="preco-ficha"
              value={(produtoSelecionado?.precoEmFicha || 0).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                },
              )}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                const valorNumerico = Number(apenasNumeros) / 100;

                setProdutoSelecionado({
                  ...produtoSelecionado,
                  precoEmFicha: valorNumerico,
                });
              }}
            />
          </div>
        </div>
        <div className="box-edit-9">
          <div className="input-label">
            <label htmlFor="url-imagem">Url da imagem:</label>
            <input
              type="text"
              id="url-imagem"
              value={produtoSelecionado.urlImagem}
              onChange={(e) =>
                setProdutoSelecionado({
                  ...produtoSelecionado,
                  urlImagem: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="box-edit-10">
          <button type="submit" className="button-salvar" onClick={handleAtualizarProduto}>
            <ButtonSalvar />
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarProduto;
