import { Link } from "react-router-dom";
import "./BuscarPreço.css";
import { CiBarcode } from "react-icons/ci";
import { MdCancel } from "react-icons/md";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

const API_URL = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

function BuscarPreço() {
  const [searchProduct, setSearchProduct] = useState("");
  const [resultProduct, setResultProduct] = useState([]);
  const [showPrice, setShowPrice] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  async function FindProduct() {
    try {
      const response = await axios.post(
        `${API_URL}/AdicionarProduto/BuscarProdutoEstoque`,
        {
          CodigoDeBarra: searchProduct,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setResultProduct(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (searchProduct.length > 0) {
      FindProduct();
      console.log("seu result:", filterProducts);
    } else {
      setResultProduct([]);
    }
  }, [searchProduct]);

  const filterProducts = (resultProduct || []).filter((item) =>
    item.codigoDeBarra.toLowerCase().includes(searchProduct.toLowerCase()),
  );
  function ClearSearch() {
    setSearchProduct("");
    setResultProduct([]);
  }
  function ShowPrice() {
    setShowPrice(!showPrice);
  }

  const iniciarScanner = (e) => {
    e.preventDefault();
    setShowScanner(true);
  };

  useEffect(() => {
    if (showScanner) {
      const scannerId = "qr-reader";

      const config = {
        fps: 10,

        videoConstraints: {
          facingMode: "environment",
        },

        qrbox: {
          width: window.innerWidth * 0.8,
          height: 150,
        },
        disableFlip: false,
      };

      const scanner = new Html5QrcodeScanner(scannerId, config, false);

      const scannerSuccess = (decodedText, decodedResult) => {
        scanner.clear().catch((err) => console.error(err));
        setShowScanner(false);
        setSearchProduct(decodedText);
      };

      const scannerError = (errorMessage) => {};

      scanner.render(scannerSuccess, scannerError);

      return () => {
        try {
          scanner.clear().catch((err) => {});
        } catch (error) {}
      };
    }
  }, [showScanner]);

  return (
    <main className="price-finder-container">
      <nav>
        <div className="navBar">
          <Link to={"/"}>
            <img
              src="img/SUBLOGO- BRONZE.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </Link>
          <h1>Fabiana Perfumaria</h1>
        </div>
      </nav>

      <section className="price-finder-content">
        <form
          className="search-bar-container"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="search-input-wrapper">
            <label htmlFor="barra">Aponte a câmera ou digite o código</label>
            <div className="search-field">
              <input
                type="text"
                name="barra"
                id="barra"
                placeholder="0000000000000"
                onChange={(e) => setSearchProduct(e.target.value)}
                value={searchProduct}
              />
              <button
                className="scan-trigger-btn"
                onClick={iniciarScanner}
                title="Abrir Scanner"
              >
                <CiBarcode size={32} />
              </button>
            </div>
          </div>
        </form>

        {filterProducts.length > 0 ? (
          filterProducts.map((item, index) => (
            <div className="product-overlay" key={index}>
              <div className="product-card-premium">
                <button onClick={ClearSearch} className="close-card-btn">
                  <MdCancel size={32} />
                </button>

                <div className="product-visual">
                  <img src={item.urlImagem} alt={item.nomeDoProduto} />
                </div>

                <div className="product-info-header">
                  <span className="product-category">Produto Encontrado</span>
                  <h2 className="product-title">{item.nomeDoProduto}</h2>
                </div>

                <div className="price-dashboard">
                  <div className="main-price-highlight">
                    <span className="price-label">
                      Preço Sugerido (À Vista)
                    </span>
                    <strong className="price-value">
                      {item?.precoAvista !== undefined
                        ? parseFloat(item.precoAvista).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </strong>
                  </div>

                  <div className="secondary-prices-grid">
                    <div className="price-item">
                      <span>Ficha</span>
                      <strong>
                        {item?.precoEmFicha !== undefined
                          ? parseFloat(item.precoEmFicha).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )
                          : "R$ 0,00"}
                      </strong>
                    </div>
                    <div className="price-item">
                      <span>Revista</span>
                      <strong>
                        {item?.preco !== undefined
                          ? parseFloat(item.preco).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "R$ 0,00"}
                      </strong>
                    </div>
                  </div>

                  <div className="acquisition-price-row">
                    <div className="acq-info">
                      <span>Custo de Aquisição</span>
                      <div className="acq-value-container">
                        <div
                          className={`blur-overlay ${showPrice ? "is-visible" : ""}`}
                        ></div>
                        <strong>
                          {item?.precoAdquirido !== undefined
                            ? parseFloat(item.precoAdquirido).toLocaleString(
                                "pt-BR",
                                { style: "currency", currency: "BRL" },
                              )
                            : "R$ 0,00"}
                        </strong>
                      </div>
                    </div>
                    <button className="toggle-eye-btn" onClick={ShowPrice}>
                      {showPrice ? <IoEyeOff size={24} /> : <IoEye size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-search-state">
            <div className="pulse-icon">
              <CiBarcode size={80} />
            </div>
            <p>Aguardando leitura de código...</p>
          </div>
        )}

        {showScanner && (
          <div className="scanner-modal">
            <div className="scanner-frame">
              <div id="qr-reader"></div>
              <button
                className="cancel-scanner"
                onClick={() => setShowScanner(false)}
              >
                Fechar Câmera
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default BuscarPreço;
