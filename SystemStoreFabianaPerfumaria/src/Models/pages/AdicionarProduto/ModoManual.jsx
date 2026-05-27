import { FaBarcode } from "react-icons/fa6";
import { AiOutlinePicture } from "react-icons/ai";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./AdicionarProduto.css";

function ModoManual({
  nomeDoProduto,
  setNomeDoProduto,
  marca,
  setMarca,
  preco,
  setPreco,
  precoAdquirido,
  setPrecoAdquirido,
  precoVista,
  setPrecoVista,
  precoEmFicha,
  setPrecoEmFicha,
  quantidade,
  setQuantidade,
  codigoDeBarras,
  setCodigoDeBarras,
  urlImagem,
  setUrlImagem,
  AdicionarProduto,
  limparCampos,
  handleMascara,
  showScanner,
  setShowScanner,
  produtos,
  marcasDisponiveis,
  mostrarListaMarcas,
  setMostrarListaMarcas,
}) {
  return (
    <div className="containerAdicionarProduto">
      <form className="FormAdicionarProduto" onSubmit={AdicionarProduto}>
        <div className="preview-section">
          <picture className="image-container">
            {urlImagem ? (
              <img src={urlImagem} alt="Preview do Produto" />
            ) : (
              <div className="placeholder-image">
                <AiOutlinePicture size={60} />
                <p>SELECIONAR IMAGEM</p>
              </div>
            )}
          </picture>

          <div className="preview-details">
            <h3>PRÉ-VISUALIZAÇÃO</h3>
            <div className="detail-item">
              <span>Nome</span>
              <span>{nomeDoProduto || "—"}</span>
            </div>
            <div className="detail-item">
              <span>Marca</span>
              <span>{marca || "—"}</span>
            </div>
            <div className="detail-item">
              <span>Qtd</span>
              <span>{quantidade || 0}</span>
            </div>
            <div className="detail-item">
              <span>Preço</span>
              <span>{precoVista}</span>
            </div>
          </div>
        </div>

        <div className="inputs-section">
          <div className="section-title">
            <h2>IDENTIFICAÇÃO</h2>
            <div className="divider"></div>
          </div>

          <div className="identification-grid">
            <div className="input-group">
              <label>NOME DO PRODUTO</label>
              <input
                type="text"
                placeholder="Ex: Sauvage Elixir"
                required
                value={nomeDoProduto}
                onChange={(e) => setNomeDoProduto(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>MARCA</label>
              <div className="brand-input-container">
                <input
                  type="text"
                  placeholder="Ex: Dior"
                  required
                  value={marca}
                  onChange={(e) => {
                    setMarca(e.target.value);
                    setMostrarListaMarcas(true);
                  }}
                  onFocus={() => setMostrarListaMarcas(true)}
                  onBlur={() => setTimeout(() => setMostrarListaMarcas(false), 200)}
                  autoComplete="off"
                />
                {mostrarListaMarcas && (
                  <ul className="brand-dropdown">
                    {marcasDisponiveis
                      .filter((m) =>
                        m.toLowerCase().includes(marca.toLowerCase())
                      )
                      .slice(0, 4)
                      .map((m, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setMarca(m);
                            setMostrarListaMarcas(false);
                          }}
                        >
                          {m}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>CÓDIGO DE BARRAS</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="0000000000000"
                  value={codigoDeBarras}
                  onChange={(e) => setCodigoDeBarras(e.target.value)}
                />
                <button
                  type="button"
                  className="scanner-button"
                  onClick={() => setShowScanner(true)}
                >
                  <FaBarcode size={18} />
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>QUANTIDADE</label>
              <input
                type="number"
                placeholder="0"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="prices-grid">
            <div className="input-group price-input">
              <label>PREÇO REVISTA</label>
              <input
                type="text"
                value={preco}
                onChange={(e) => handleMascara(e.target.value, setPreco)}
              />
            </div>

            <div className="input-group price-input">
              <label>PREÇO ADQUIRIDO</label>
              <input
                type="text"
                value={precoAdquirido}
                onChange={(e) => handleMascara(e.target.value, setPrecoAdquirido)}
              />
            </div>

            <div className="input-group price-input">
              <label>PREÇO CLIENTE</label>
              <input
                type="text"
                value={precoVista}
                onChange={(e) => handleMascara(e.target.value, setPrecoVista)}
              />
            </div>

            <div className="input-group price-input">
              <label>PREÇO NA FICHA</label>
              <input
                type="text"
                value={precoEmFicha}
                onChange={(e) => handleMascara(e.target.value, setPrecoEmFicha)}
              />
            </div>
          </div>

          <div className="input-group link-input">
            <label>LINK DA IMAGEM</label>
            <input
              type="text"
              placeholder="https://..."
              value={urlImagem}
              onChange={(e) => setUrlImagem(e.target.value)}
            />
          </div>

          <div className="buttons-container">
            <button type="button" className="btn-limpar" onClick={limparCampos}>
              LIMPAR
            </button>
            <button className="btn-adicionar" type="submit">
              ADICIONAR PRODUTO
            </button>
          </div>
        </div>
      </form>

      {showScanner && (
        <div className="modal-scanner">
          <div id="scanner-reader"></div>
          <button type="button" onClick={() => setShowScanner(false)}>
            Fechar Scanner
          </button>
        </div>
      )}

      <div className="ProductsRecents">
        {produtos.map((p, i) => (
          <div className="CardRecent" key={i}>
            <picture>
              <img src={p.UrlImagem} alt="Produto" />
            </picture>
            <h2>{p.NomeDoProduto}</h2>
            <p>Marca: {p.Marca}</p>
            <p>
              Preço:{" "}
              {p.PrecoAvista.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModoManual;
