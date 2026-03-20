import React, { useCallback, useMemo, useRef, useState,useEffect } from "react";
import "./KitBuilder.css";
import Basket from "./Basket/Basket";
import ProductCard from "./Product/ProductCard";
import LoadingSucessoVenda from "../../components/Loading/LoadingSucessoVenda";
import KitSummary from "./Summary/KitSummary";
import ProductFilters from "./Filters/ProductFilters";
import { UseBuscaProduto } from "../../hooks/UseBuscarProduto";

export default function KitBuilder() {
  const [items, setItems] = useState([]);
  const basketDropRef = useRef(null);
  const overlayRootRef = useRef(null);
  const { produtos, codigoDoProduto, nomeDoProduto, marcaDoProduto, loading } =
    UseBuscaProduto();
  const [filters, setFilters] = useState({
    marcaDoProduto: marcaDoProduto,
    nomeDoProduto: nomeDoProduto,
    codigoDoProduto: codigoDoProduto,
  });

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.precoAvista, 0),
    [items],
  );

  const ensureOverlayRoot = () => {
    if (!overlayRootRef.current) {
      const root = document.createElement("div");
      root.className = "kit-overlay-root";
      document.body.appendChild(root);
      overlayRootRef.current = root;
    }
    return overlayRootRef.current;
  };

  const animateToBasket = useCallback((sourceEl, color) => {
    const target = basketDropRef.current;
    if (!sourceEl || !target) return;

    const src = sourceEl.getBoundingClientRect();
    const dst = target.getBoundingClientRect();

    const ghost = document.createElement("div");
    ghost.className = "kit-fly-ghost";
    ghost.style.background = color;
    ghost.style.width = `${src.width}px`;
    ghost.style.height = `${src.height}px`;
    ghost.style.borderRadius = "12px";
    ghost.style.position = "fixed";
    ghost.style.left = `${src.left}px`;
    ghost.style.top = `${src.top}px`;
    ghost.style.transform = "translate(0, 0) scale(1)";

    ensureOverlayRoot().appendChild(ghost);

    void ghost.getBoundingClientRect();

    const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
    const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);

    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    ghost.style.opacity = "0.6";

    const handleEnd = () => {
      ghost.removeEventListener("transitionend", handleEnd);
      ghost.remove();
    };
    ghost.addEventListener("transitionend", handleEnd);
  }, []);

  const handleAdd = useCallback(
    (product, imgRef) => {
      animateToBasket(imgRef?.current, product.color ?? "#d1d5db");
      setItems((prev) => [...prev, product]);
    },
    [animateToBasket],
  );

  const handleRemove = useCallback((id) => {
    setItems((prev) => prev.filter((p, idx) => (p.uid ?? idx) !== id));
  }, []);

  const handleClear = useCallback(() => setItems([]), []);

  const brands = useMemo(() => {
    const getBrand = (p) =>
      p.marcaDoProduto ?? p.marca ?? p.Marca ?? p.brand ?? null;
    return Array.from(
      new Set(produtos.map((p) => getBrand(p)).filter(Boolean)),
    ).sort();
  }, [produtos]);

  const filteredProducts = useMemo(() => {
    const b = filters.marcaDoProduto.trim().toLowerCase();
    const n = filters.nomeDoProduto.trim().toLowerCase();
    const c = filters.codigoDoProduto.trim();
    const getBrand = (p) =>
      p.marcaDoProduto ?? p.marca ?? p.Marca ?? p.brand ?? "";
    const getName = (p) => p.nomeDoProduto ?? p.NomeDoProduto ?? p.name ?? "";
    const getCode = (p) =>
      p.codigoDoProduto ??
      p.CodigoDeBarra ??
      p.codigoDeBarra ??
      p.barcode ??
      "";
    return produtos.filter((p) => {
      const okBrand = b ? String(getBrand(p)).toLowerCase().includes(b) : true;
      const okName = n ? String(getName(p)).toLowerCase().includes(n) : true;
      const okCode = c ? String(getCode(p)).includes(c) : true;
      return okBrand && okName && okCode;
    });
  }, [filters, produtos]);

  useEffect(() => {
    console.log("aqui estar os items", items);
  }, [items]);

  return (
    <div className="kit-builder">
      <header className="kit-header">
        <div className="kit-title">
          <h2>Monte Seu Kit</h2>
          <p>Escolha os produtos e arrase na composição da sua cesta.</p>
        </div>
      </header>

      <ProductFilters brands={brands} value={filters} onChange={setFilters} />

      <div className="kit-content">
        <div className="kit-products">
          {loading ? (
            <div className="kit-products-loading">
              <LoadingSucessoVenda />
            </div>
          ) : (
            filteredProducts
              .slice(0, 12)
              .map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))
          )}
        </div>

        <aside className="kit-sidebar">
          <Basket ref={basketDropRef} items={items} onRemove={handleRemove} />
          <KitSummary
            total={total}
            count={items.length}
            onClear={handleClear}
          />
        </aside>
      </div>
    </div>
  );
}
