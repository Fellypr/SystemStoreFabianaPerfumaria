import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPrint, FaTimes, FaQrcode } from 'react-icons/fa';
import { MdReceiptLong } from 'react-icons/md';

const CardConfirmaçãoDeVenda = ({ FinalizarVenda, AbrirNota, setShowRealizarVenda }) => {
  const [incluirQrCode, setIncluirQrCode] = useState(true);
  const [funcionario, setFuncionario] = useState("");
  const [erroFuncionario, setErroFuncionario] = useState("");

  const funcionarios = ["Graciele", "Angela"];

  const handleDismiss = () => {
    setShowRealizarVenda(false);
  };

  const validarFuncionario = () => {
    if (!funcionario) {
      setErroFuncionario("Selecione quem realizou a venda.");
      return false;
    }

    setErroFuncionario("");
    return true;
  };

  const handleImprimir = () => {
    if (!validarFuncionario()) {
      return;
    }

    AbrirNota(incluirQrCode);
  };

  const handleConfirmar = () => {
    if (!validarFuncionario()) {
      return;
    }

    FinalizarVenda(funcionario);
  };

  return (
    <StyledWrapper>
      <div className="card">
        <button type="button" className="dismiss" onClick={handleDismiss} aria-label="Fechar">
          <FaTimes />
        </button>

        <div className="header">
          <div className="icon-badge">
            <MdReceiptLong />
          </div>

          <div className="content">
            <span className="title">Confirmar venda</span>
            <p className="message">Deseja imprimir o comprovante antes de finalizar?</p>
          </div>

          <div className="funcionario-field">
            <label htmlFor="funcionario-venda">Funcionaria da venda</label>
            <select
              id="funcionario-venda"
              value={funcionario}
              onChange={(e) => {
                setFuncionario(e.target.value);
                setErroFuncionario("");
              }}
              aria-invalid={erroFuncionario ? "true" : "false"}
            >
              <option value="">Selecione</option>
              {funcionarios.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
            {erroFuncionario && (
              <span className="field-error">{erroFuncionario}</span>
            )}
          </div>

          <div className="qr-option">
            <div className="qr-option-info">
              <FaQrcode className="qr-icon" />
              <div>
                <span className="qr-label">QR Code na nota</span>
                <span className="qr-hint">Instagram da loja no comprovante</span>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={incluirQrCode}
                onChange={(e) => setIncluirQrCode(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="actions">
            <button type="button" className="btn-print" onClick={handleImprimir}>
              <FaPrint />
              Imprimir comprovante
            </button>
            <button type="button" className="btn-confirm" onClick={handleConfirmar}>
              Confirmar sem imprimir
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: min(360px, 92vw);
    border-radius: 16px;
    background: #fff;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(23, 94, 165, 0.08);
    overflow: hidden;
    animation: slideUp 0.35s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .dismiss {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    z-index: 1;
  }

  .dismiss:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .header {
    padding: 2rem 1.5rem 1.5rem;
  }

  .icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 1rem;
    border-radius: 14px;
    background: linear-gradient(135deg, #e8f4fd 0%, #d4ebfa 100%);
    color: #175ea5;
    font-size: 1.75rem;
  }

  .content {
    text-align: center;
    margin-bottom: 1.25rem;
  }

  .title {
    display: block;
    color: #111827;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 0.35rem;
  }

  .message {
    color: #6b7280;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }

  .funcionario-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .funcionario-field label {
    color: #374151;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .funcionario-field select {
    width: 100%;
    height: 42px;
    border: 1.5px solid #d1d5db;
    border-radius: 10px;
    background: #fff;
    color: #111827;
    font-size: 0.92rem;
    outline: none;
    padding: 0 0.75rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .funcionario-field select:focus {
    border-color: #175ea5;
    box-shadow: 0 0 0 3px rgba(23, 94, 165, 0.12);
  }

  .funcionario-field select[aria-invalid='true'] {
    border-color: #dc2626;
  }

  .field-error {
    color: #dc2626;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .qr-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    margin-bottom: 1.25rem;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .qr-option-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .qr-icon {
    flex-shrink: 0;
    font-size: 1.25rem;
    color: #175ea5;
  }

  .qr-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    line-height: 1.3;
  }

  .qr-hint {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    line-height: 1.3;
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: #d1d5db;
    transition: background 0.25s;
  }

  .slider::before {
    content: '';
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.25s;
  }

  .toggle input:checked + .slider {
    background: #175ea5;
  }

  .toggle input:checked + .slider::before {
    transform: translateX(20px);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .btn-print,
  .btn-confirm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }

  .btn-print {
    border: none;
    background: linear-gradient(135deg, #1aa06d 0%, #158f5e 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(26, 160, 109, 0.35);
  }

  .btn-print:hover {
    background: linear-gradient(135deg, #158f5e 0%, #127a4f 100%);
    transform: translateY(-1px);
  }

  .btn-confirm {
    border: 1.5px solid #d1d5db;
    background: #fff;
    color: #374151;
  }

  .btn-confirm:hover {
    border-color: #175ea5;
    color: #175ea5;
    background: #f0f7ff;
  }
`;

export default CardConfirmaçãoDeVenda;
