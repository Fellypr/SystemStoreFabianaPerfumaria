import React, { useCallback } from "react";
import "./ProductFilters.css";
import BrandCombo from "./BrandCombo";

export default function ProductFilters({ brands, value, onChange }) {
  const update = useCallback(
    (patch) => onChange({ ...value, ...patch }),
    [value, onChange]
  );

  const clear = useCallback(
    () => onChange({ marcaDoProduto: "", nomeDoProduto: "", codigoDoProduto: "" }),
    [onChange]
  );

  return (
    <div className="kit-filters">
      <div className="field">
        <label>Marca</label>
        <BrandCombo
          brands={brands}
          value={value.marcaDoProduto}
          onChange={(val) => update({ marcaDoProduto: val })}
        />
      </div>

      <div className="field">
        <label>Nome</label>
        <input
          type="text"
          placeholder="Ex.: Shampoo"
          value={value.nomeDoProduto}
          onChange={(e) => update({ nomeDoProduto: e.target.value })} 
          aria-label="Filtro por nome"
        />
      </div>

      <div className="field">
        <label>Código de barras</label>
        <input
          type="text"
          placeholder="Ex.: 789..."
          value={value.codigoDoProduto}
          onChange={(e) => update({ codigoDoProduto: e.target.value })}
          aria-label="Filtro por código de barras"
        />
      </div>

      <div className="actions">
        <button className="clear" onClick={clear} aria-label="Limpar filtros">
          Limpar
        </button>
      </div>
    </div>
  );
}
