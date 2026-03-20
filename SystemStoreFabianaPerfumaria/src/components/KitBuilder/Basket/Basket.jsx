import React, { forwardRef, useState } from "react";
import "./Basket.css";
import { RiShoppingBasket2Line } from "react-icons/ri";

const Basket = forwardRef(function Basket({ items, onRemove }, ref) {
  const [showEditor, setShowEditor] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [basketImageUrl, setBasketImageUrl] = useState("");

  function openEditor() {
    setTempUrl(basketImageUrl || "");
    setShowEditor(true);
  }
  function closeEditor() {
    setShowEditor(false);
  }
  function saveUrl(e) {
    e.preventDefault();
    setBasketImageUrl(tempUrl.trim());
    setShowEditor(false);
  }

  return (
    <div className="kit-basket">
      <div className="kit-basket-header">
        <h3>Sua Cesta</h3>
        <div className="kit-basket-count">{items.length}</div>
      </div>

      <div className="kit-basket-visual">
        <button
          type="button"
          className="kit-basket-dropzone"
          ref={ref}
          aria-label="Alvo da cesta"
          title="Definir imagem da cesta"
          onClick={openEditor}
        >
          {basketImageUrl ? (
            <img
              src={basketImageUrl}
              alt="Imagem da cesta"
              className="kit-basket-dropzone-img"
            />
          ) : (
            <RiShoppingBasket2Line size={64} />
          )}
        </button>
      </div>

      <ul className="kit-basket-list">
        {items.length === 0 && <li className="empty">Nada por aqui ainda…</li>}
        {items.map((it, idx) => (
          <li key={`${it.id}-${idx}`} className="kit-basket-item">
            <span className="kit-basket-item-img">
              <img src={it.urlImagem} alt={it.nomeDoProduto}/>
            </span>
            <span className="name">{it.nomeDoProduto}</span>
            <span className="price">
              {it.precoAvista.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <button
              className="remove"
              onClick={() => onRemove(idx)}
              title="Remover"
              aria-label="Remover do kit"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showEditor && (
        <div className="kit-basket-modal-overlay" role="dialog" aria-modal="true">
          <form className="kit-basket-modal" onSubmit={saveUrl}>
            <h4>Imagem da cesta</h4>
            <input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              aria-label="URL da imagem"
              required
            />
            <div className="actions">
              <button type="button" onClick={closeEditor} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
});

export default Basket;
