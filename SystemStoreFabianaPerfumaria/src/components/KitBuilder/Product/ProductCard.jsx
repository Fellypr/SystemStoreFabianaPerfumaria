import React, { useRef } from "react";
import "./ProductCard.css";
import { MdAddShoppingCart } from "react-icons/md";

export default function ProductCard({ product, onAdd }) {
  const imgRef = useRef(null);
  const nome =
    product?.nomeDoProduto ?? product?.name ?? "Produto";
  const preco =
    product?.precoAvista ?? product?.precoVenda ?? product?.price ?? 0;
  const cor = product?.color ?? "#e5e7eb";
  const urlImagem = product?.urlImagem ?? product?.imagemUrl ?? null;
  return (
    <div className="kit-product-card">
      <div
        className="kit-product-thumb"
        ref={imgRef}
        style={urlImagem ? undefined : { background: cor }}
        aria-label={nome}
      >
        {urlImagem && <img src={urlImagem} alt={nome} />}
      </div>
      <div className="kit-product-info">
        <div className="kit-product-name">{nome}</div>
        <div className="kit-product-price">
          {Number(preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      </div>
      <button
        className="kit-product-add"
        onClick={() => onAdd(product, imgRef)}
        title="Adicionar ao kit"
        aria-label={`Adicionar ${nome} ao kit`}
      >
        <MdAddShoppingCart size={18} />
        Adicionar
      </button>
    </div>
  );
}
