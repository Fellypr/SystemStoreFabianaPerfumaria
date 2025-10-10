import React from "react";
import "./CardProduct.css";
import ButtonEdição from "../Button/ButtonEdição";

function CardProduct({ produtos, onEditar }) {
  return (
    <>
      {produtos.map((produto) => (
        <div className="Card" key={produto.id_Produto}>
          <picture>
            <img src={produto.urlImagem} alt="" width={100} height={100} />
          </picture>
          <h3 className="TitleProduct">{produto.nomeDoProduto}</h3>
          <p>
            <strong>Marca:</strong> {produto.marca}
          </p>
          <p>
            <strong>Preço:</strong>{" "}
            {produto?.preco !== undefined
              ? parseFloat(produto.preco).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "R$ 0,00"}
          </p>
          <p>
            <strong>Quantidade:</strong> {produto.quantidade}
          </p>
          <p>
            <strong>Codigo:</strong> {produto.codigoDeBarra}
          </p>

          <div className="buttonEditar">
            <ButtonEdição onEditar={onEditar} produto={produto} />
          </div>

        </div>
      ))}
    </>
  );
}

export default CardProduct;
