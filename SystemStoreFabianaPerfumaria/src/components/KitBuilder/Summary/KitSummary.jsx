import React, { useState, useEffect } from "react";
import "./KitSummary.css";
import { MdCleaningServices, MdModeEdit, MdAutorenew } from "react-icons/md";

export default function KitSummary({ total, count, onClear }) {
  const [isManual, setIsManual] = useState(false);
  const [manualValue, setManualValue] = useState(total);

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };


  const parseCurrencyToNumber = (value) => {
    const numericValue = value.replace(/\D/g, "");
    return Number(numericValue) / 100;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setManualValue(parseCurrencyToNumber(value));
  };


  useEffect(() => {
    if (!isManual) {
      setManualValue(total);
    }
  }, [total, isManual]);

  const toggleManual = () => {
    if (isManual) {
      setManualValue(total);
    }
    setIsManual(!isManual);
  };

  return (
    <div className="kit-summary">
      <div className="row">
        <span>Itens</span>
        <strong>{count}</strong>
      </div>
      <div className="row total-row">
        <span>Total</span>
        <div className="total-container">
          {isManual ? (
            <input
              type="text"
              value={formatCurrency(manualValue)}
              onChange={handleInputChange}
              className="manual-total-input"
              autoFocus
            />
          ) : (
            <strong>
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          )}
          <button
            onClick={toggleManual}
            className={`edit-total-btn ${isManual ? "active" : ""}`}
            title={isManual ? "Voltar ao automático" : "Editar manualmente"}
          >
            {isManual ? <MdAutorenew size={18} /> : <MdModeEdit size={18} />}
          </button>
        </div>
      </div>
      <div className="actions">
        <button className="clear" onClick={onClear} title="Limpar kit">
          <MdCleaningServices size={18} />
          Limpar kit
        </button>
        <button className="checkout" title="Finalizar kit">
          Finalizar kit
        </button>
      </div>
    </div>
  );
}
