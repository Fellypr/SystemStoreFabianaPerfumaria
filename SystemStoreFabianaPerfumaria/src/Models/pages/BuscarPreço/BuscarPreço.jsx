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
        }
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
    item.codigoDeBarra.toLowerCase().includes(searchProduct.toLowerCase())
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
    <main>
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
          <h1>Buscar Preço</h1>
        </div>
      </nav>
      <section className="SearchProductScanner">
        <form className="SearchCodigoBarra">
          <div className="inputs">
            <label htmlFor="barra">Scannei o Codigo de Barra do Produto:</label>
            <div className="inputButton">
              <input
                type="text"
                name="barra"
                id="barra"
                onChange={(e) => setSearchProduct(e.target.value)}
                value={searchProduct}
              />
              <button onClick={iniciarScanner}>
                <CiBarcode size={30} />
              </button>
            </div>
          </div>
        </form>

        {filterProducts.length > 0 ? (
          filterProducts.map((item) => (
            <div className="ResultProductMain">
              <div className="resultproduct">
                <button onClick={ClearSearch} className="closeCard">
                  <MdCancel size={30} />
                </button>

                <img src={item.urlImagem} width={300} />
                <p className="nameProduct">{item.nomeDoProduto}</p>
                <div className="Preços">
                  <div className="PriceClient">
                    <p>Preço Cliente:</p>
                    <p>
                      {item?.precoAvista !== undefined
                        ? parseFloat(item.precoAvista).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </p>
                  </div>
                  <div className="priceFicha">
                    <p>Preço Ficha:</p>
                    <p>
                      {item?.precoEmFicha !== undefined
                        ? parseFloat(item.precoEmFicha).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" }
                          )
                        : "R$ 0,00"}
                    </p>
                  </div>
                  <div className="priceRevista">
                    <p>Preço Revista:</p>
                    <p>
                      {item?.preco !== undefined
                        ? parseFloat(item.preco).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </p>
                  </div>
                  <div className="priceAdquirido">
                    <p>Preço Adquirido:</p>
                    <div
                      className="blurPrice"
                      style={{ display: showPrice ? "none" : "flex" }}
                    ></div>
                    <p>
                      {item?.precoAdquirido !== undefined
                        ? parseFloat(item.precoAdquirido).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" }
                          )
                        : "R$ 0,00"}
                    </p>
                    <button className="HideenEye" onClick={ShowPrice}>
                      <IoEye
                        size={25}
                        style={{ display: showPrice ? "none" : "block" }}
                      />
                    </button>
                    <button className="ShowenEye" onClick={ShowPrice}>
                      <IoEyeOff
                        size={25}
                        style={{ display: showPrice ? "block" : "none" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="message">Scanner o Codigo de Barra do Produto</div>
        )}
        {showScanner && (
          <div className="qr-reader">
            <div id="qr-reader"></div>
          </div>
        )}
      </section>
    </main>
  );
}

export default BuscarPreço;
