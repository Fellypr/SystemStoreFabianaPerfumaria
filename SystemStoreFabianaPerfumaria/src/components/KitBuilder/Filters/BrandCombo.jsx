import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BrandCombo.css";
import { IoChevronDown } from "react-icons/io5";

export default function BrandCombo({ brands, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const rootRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, query]);

  function handleSelect(brand) {
    onChange(brand);
    setQuery(brand);
    setOpen(false);
  }

  return (
    <div className="brand-combo" ref={rootRef}>
      <div className="brand-input-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onChange(val);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Digite para filtrar"
          aria-label="Marca (digite para filtrar)"
        />
        <button
          type="button"
          className="toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Abrir/Fechar opções de marca"
        >
          <IoChevronDown size={16} />
        </button>
      </div>
      {open && (
        <ul className="brand-options" role="listbox">
          {filtered.length === 0 && (
            <li className="empty">Nenhuma marca encontrada</li>
          )}
          {filtered.map((b) => (
            <li
              key={b}
              className="option"
              onClick={() => handleSelect(b)}
              role="option"
              aria-selected={b === value}
            >
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
