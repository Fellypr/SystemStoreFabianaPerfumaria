import React from "react";
import "./PaymentSplit.css";

export default function PaymentSplit({
  total,
  methods,
  value,
  onChange,
  onAddRow,
  onRemoveRow,
  onCancel,
  onSave,
}) {
  const totalNumber =
    typeof total === "number"
      ? total
      : Number(String(total || "").replace(/\D/g, "")) / 100;
  const sum = value.reduce((acc, v) => acc + (Number(v.amount) || 0), 0);
  const diff = (totalNumber - sum).toFixed(2);

  const updateRow = (idx, patch) => {
    const next = value.map((row, i) => (i === idx ? { ...row, ...patch } : row));
    onChange(next);
  };

  const formatBRL = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };
  const parseBRLInput = (str) => {
    const digits = String(str || "").replace(/\D/g, "");
    if (!digits) return 0;
    return Number(digits) / 100;
  };

  const handleSave = () => {
    if (Math.abs(totalNumber - sum) > 0.005) {
      alert("A soma dos pagamentos deve bater com o total.");
      return;
    }
    const invalid = value.some((v) => !v.method || !v.amount);
    if (invalid) {
      alert("Preencha todas as formas e valores.");
      return;
    }
    onSave && onSave();
  };

  return (
    <div className="payment-split-overlay" role="dialog" aria-modal="true">
      <div className="payment-split">
        <div className="payment-split-header">
          <h4>Pagamento dividido</h4>
          <span className={Math.abs(totalNumber - sum) < 0.005 ? "ok" : "warn"}>
            Falta:{" "}
            {Number(diff).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <div className="payment-split-rows">
          {value.map((row, idx) => (
            <div className="payment-split-row" key={idx}>
              <select
                value={row.method}
                onChange={(e) => updateRow(idx, { method: e.target.value })}
                aria-label="Forma de pagamento"
              >
                <option value="">Selecione</option>
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={formatBRL(row.amount)}
                onChange={(e) => {
                  const parsed = parseBRLInput(e.target.value);
                  updateRow(idx, { amount: parsed });
                }}
                aria-label="Valor da parcela"
              />
              <button
                type="button"
                className="remove"
                onClick={() => onRemoveRow(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="payment-split-actions">
          <button
            type="button"
            className="add"
            onClick={onAddRow}
            title="Adicionar forma +"
          >
            +
          </button>
        </div>

        <div className="payment-split-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
