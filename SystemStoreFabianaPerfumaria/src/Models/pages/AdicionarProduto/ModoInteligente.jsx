import { useState, useEffect } from "react";
import { FaFileExcel, FaInfoCircle, FaCheckCircle, FaRedo, FaEdit, FaTimes, FaBox, FaSpinner, FaImage } from "react-icons/fa";
import "./AdicionarProduto.css";
import { UseAdicionarProdutoCodigo } from "../../../hooks/UseAdicionarProdutoCodigo.jsx";

const CODE_LENGTH = 44;

function ProductRow({ product, isActive, onEdit, formatarMoeda }) {
  const isExisting = product.status === 'Ja existe';
  return (
    <tr className={`product-row${isActive ? ' product-row--active' : ''}`}>
      <td className="cell-image">
        {product.imagemUrl ? (
          <img src={product.imagemUrl} alt={product.nomeProduto} className="product-thumbnail" />
        ) : (
          <div className="product-placeholder"><FaBox /></div>
        )}
      </td>
      <td className="cell-name">{product.nomeProduto}</td>
      <td className="cell-name">{product.marcaDoProduto || '—'}</td>
      <td className="cell-number">
        {isExisting ? (
          <>
            <span className="unit-base">{product.unidade}<sup className="unit-added">+{product?.unidadeAdicionada || 0}</sup></span>
          </>
        ) : (
          <span style={{ color: 'green', fontWeight: 'bold' }}>+{product.unidade}</span>
        )}
      </td>
      <td className="cell-number">{product.codigoBarra}</td>
      <td className="cell-number">{formatarMoeda(product.precoAdquirido)}</td>
      <td className="cell-number">{formatarMoeda(product.precoRevista)}</td>
      <td className="cell-number">{formatarMoeda(product.precoVista)}</td>
      <td className="cell-number">{formatarMoeda(product.precoEmFicha)}</td>
      <td className="cell-actions">
        <button
          type="button"
          onClick={onEdit}
          className={`btn-icon btn-edit${isActive ? ' btn-edit--active' : ''}`}
          title="Editar produto"
        >
          <FaEdit />
        </button>
      </td>
    </tr>
  );
}

function EditDrawer({ product, editedData, setEditedData, initialData, onClose, isOpen }) {
  if (!editedData || !initialData) return null;
  const isExisting = product?.status === 'Ja existe';

  const handleCurrencyChange = (field, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setEditedData({ ...editedData, [field]: "" });
      return;
    }
    const numberValue = parseInt(digits, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
    setEditedData({ ...editedData, [field]: formatted });
  };

  const isChanged = (field) => {
    if (!initialData || !editedData) return false;
    return initialData[field] !== editedData[field];
  };

  const hasAnyChanges = ['imagemUrl', 'nomeProduto', 'marcaDoProduto', 'codigoBarra', 'precoAdquirido', 'precoRevista', 'precoVista', 'precoEmFicha'].some(isChanged);

  const handleReset = () => {
    if (initialData) setEditedData(initialData);
  };

  const getInputClass = (field) => {
    const baseClass = "edit-drawer-input";
    const changedClass = isChanged(field) ? " input-changed" : "";
    return `${baseClass}${changedClass}`;
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`edit-drawer-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />

      {/* Painel */}
      <div className={`edit-drawer${isOpen ? ' open' : ''}`}>

        {/* Header */}
        <div className="edit-drawer-header">
          <div className="edit-drawer-title">
            <FaEdit className="edit-drawer-title-icon" />
            <span>Editar Produto</span>
          </div>
          <div className="edit-drawer-actions">
            <button
              type="button"
              className="edit-drawer-reset"
              onClick={handleReset}
              title="Restaurar valores originais"
              disabled={!hasAnyChanges}
            >
              <FaRedo />
            </button>
            <button
              type="button"
              className={`edit-drawer-close ${hasAnyChanges ? 'has-changes' : ''}`}
              onClick={onClose}
              title={hasAnyChanges ? "Salvar e fechar" : "Fechar sem salvar"}
            >
              {hasAnyChanges ? <FaCheckCircle /> : <FaTimes />}
            </button>
          </div>
        </div>

        <div className="edit-drawer-body">

          <div className="edit-drawer-section">
            <div className="edit-drawer-image-section">
              <div className="edit-drawer-image-preview">
                {editedData.imagemUrl ? (
                  <img
                    src={editedData.imagemUrl}
                    alt={editedData.nomeProduto}
                    className="edit-drawer-preview-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="edit-drawer-preview-placeholder">
                    <FaImage />
                    <span>Sem imagem</span>
                  </div>
                )}
              </div>
              <div className="edit-drawer-image-url-wrap">
                <label className="edit-drawer-label">URL da Imagem</label>
                <input
                  type="text"
                  value={editedData.imagemUrl || ''}
                  onChange={(e) => setEditedData({ ...editedData, imagemUrl: e.target.value })}
                  className={getInputClass('imagemUrl')}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Seção: Informações */}
          <div className="edit-drawer-section">
            <p className="edit-drawer-section-title">Informações</p>
            <div className="edit-drawer-field">
              <label className="edit-drawer-label">Nome do Produto</label>
              <input
                type="text"
                value={editedData.nomeProduto}
                onChange={(e) => setEditedData({ ...editedData, nomeProduto: e.target.value })}
                className={getInputClass('nomeProduto')}
              />
            </div>
            <div className="edit-drawer-field">
              <label className="edit-drawer-label">Marca</label>
              <input
                type="text"
                value={editedData.marcaDoProduto || ''}
                onChange={(e) => setEditedData({ ...editedData, marcaDoProduto: e.target.value })}
                className={getInputClass('marcaDoProduto')}
                placeholder="Ex: Natura, O Boticário..."
              />
            </div>
            <div className="edit-drawer-field">
              <label className="edit-drawer-label">Código de Barras</label>
              <input
                type="text"
                value={editedData.codigoBarra}
                onChange={(e) => setEditedData({ ...editedData, codigoBarra: e.target.value })}
                className={getInputClass('codigoBarra')}
              />
            </div>
            {isExisting && (
              <div className="edit-drawer-badge">
                Unidade adicionada: <strong>+{editedData.unidadeAdicionada || editedData.unidade}</strong>
              </div>
            )}
          </div>

          {/* Seção: Preços */}
          <div className="edit-drawer-section">
            <p className="edit-drawer-section-title">Preços</p>
            <div className="edit-drawer-prices-grid">
              <div className="edit-drawer-field">
                <label className="edit-drawer-label">Adquirido</label>
                <input
                  type="text"
                  value={editedData.precoAdquirido}
                  onChange={(e) => handleCurrencyChange('precoAdquirido', e.target.value)}
                  className={`${getInputClass('precoAdquirido')} edit-drawer-input--number`}
                />
              </div>
              <div className="edit-drawer-field">
                <label className="edit-drawer-label">Revista</label>
                <input
                  type="text"
                  value={editedData.precoRevista}
                  onChange={(e) => handleCurrencyChange('precoRevista', e.target.value)}
                  className={`${getInputClass('precoRevista')} edit-drawer-input--number`}
                />
              </div>
              <div className="edit-drawer-field">
                <label className="edit-drawer-label">À Vista</label>
                <input
                  type="text"
                  value={editedData.precoVista}
                  onChange={(e) => handleCurrencyChange('precoVista', e.target.value)}
                  className={`${getInputClass('precoVista')} edit-drawer-input--number`}
                />
              </div>
              <div className="edit-drawer-field">
                <label className="edit-drawer-label">Em Ficha</label>
                <input
                  type="text"
                  value={editedData.precoEmFicha}
                  onChange={(e) => handleCurrencyChange('precoEmFicha', e.target.value)}
                  className={`${getInputClass('precoEmFicha')} edit-drawer-input--number`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="edit-drawer-footer">
          <p className="edit-drawer-footer-hint">
            {hasAnyChanges ? (
              <>Clique em <strong><FaCheckCircle /></strong> para salvar e fechar</>
            ) : (
              <>Clique em <strong><FaTimes /></strong> para fechar</>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

function ModoInteligente() {
  const [exporting, setExporting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [initialEditedData, setInitialEditedData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { codigo, setCodigo, iniciadoScraping, produto, setProduto, loading, mensagemCarregamento, FinalizarProdutos } =
    UseAdicionarProdutoCodigo();

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCodigo(value);
  };

  const progress = Math.round((codigo.length / CODE_LENGTH) * 100);

  const formatarMoeda = (valor) => {
    const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
  };

  const getProductKey = (p) => `${p.status}::${p.codigoBarra}`;

  const handleOpenEdit = (product) => {
    const key = getProductKey(product);
    if (editingProduct && getProductKey(editingProduct) === key && isDrawerOpen) {
      handleCloseEdit();
      return;
    }

    const initCurrency = (val) => {
      if (val === undefined || val === null) return "";
      const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
      if (isNaN(num)) return "";
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const initialData = {
      ...product,
      precoAdquirido: initCurrency(product.precoAdquirido),
      precoRevista: initCurrency(product.precoRevista),
      precoVista: initCurrency(product.precoVista),
      precoEmFicha: initCurrency(product.precoEmFicha),
    };
    
    setEditingProduct(product);
    setEditedData(initialData);
    setInitialEditedData(initialData);
    setIsDrawerOpen(true);
  };

  const handleCloseEdit = () => {
    if (editingProduct && editedData) {
      const parseCurrency = (val) => {
        if (typeof val === 'string') {
          return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
        }
        return val || 0;
      };
      const parseNumber = (val) =>
        typeof val === 'string' ? parseInt(val, 10) || 0 : val;

      const finalData = {
        ...editedData,
        unidade: parseNumber(editedData.unidade),
        unidadeAdicionada: editedData.unidadeAdicionada
          ? parseNumber(editedData.unidadeAdicionada)
          : undefined,
        precoAdquirido: parseCurrency(editedData.precoAdquirido),
        precoRevista: parseCurrency(editedData.precoRevista),
        precoVista: parseCurrency(editedData.precoVista),
        precoEmFicha: parseCurrency(editedData.precoEmFicha),
      };

      const novosProdutos = [...produto];
      const idx = novosProdutos.findIndex(
        (p) => p.status === editingProduct.status && p.codigoBarra === editingProduct.codigoBarra
      );
      if (idx !== -1) {
        novosProdutos[idx] = finalData;
        setProduto(novosProdutos);
      }
    }

    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingProduct(null);
      setEditedData(null);
    }, 300);
  };

  const limpaProdutos = () => {
    setProduto([]);
    setCodigo("");
    setEditingProduct(null);
    setEditedData(null);
    setIsDrawerOpen(false);
    localStorage.removeItem("produto");
  };

  

  const produtosNovos = produto.filter((p) => p.status === 'Novo');
  const produtosExistentes = produto.filter((p) => p.status === 'Ja existe');

  useEffect(() => {
    if (codigo.length === CODE_LENGTH) {
      iniciadoScraping();
    }
  }, [codigo]);

  return (
    <div className="containerAdicionarProduto modo-inteligente-container">
      <div className="modo-inteligente-content">

        <div className="info-box">
          <FaInfoCircle className="info-icon" />
          <div className="info-text">
            <p className="info-title">Como funciona</p>
            <p className="info-description">
              Digite ou escaneie a chave de acesso da NFe de{' '}
              <span className="highlight">44 dígitos</span>.
              O processamento será iniciado automaticamente ao completar o código.
            </p>
          </div>
        </div>

        <div className="code-input-section">
          <label htmlFor="code-input" className="code-label">
            <FaFileExcel className="code-icon" />
            Chave de Acesso de 44 dígitos
          </label>
          <div className="code-input-wrapper">
            <input
              id="code-input"
              type="text"
              value={codigo}
              onChange={handleInputChange}
              placeholder="Digite ou escaneie o código numérico..."
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              disabled={loading || produto.length > 0}
              className="code-input"
              autoFocus
            />
            <span className="code-counter">{codigo.length}/{CODE_LENGTH}</span>
          </div>
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {codigo.length > 0 && codigo.length < CODE_LENGTH && (
              <p className="progress-text">Faltam {CODE_LENGTH - codigo.length} dígito(s) para processar</p>
            )}
            {loading && mensagemCarregamento && (
              <p className="progress-text">{mensagemCarregamento}</p>
            )}
            {loading && !mensagemCarregamento && (
              <p className="progress-text">Código completo. Processando...</p>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">
              <FaSpinner className="spinner-icon" />
            </div>
            <div>
              <p className="loading-title">Processando código</p>
              <p className="loading-description">Consultando dados do produto...</p>
            </div>
          </div>
        )}

        {produto.length > 0 && (
          <div className="products-section">
            <div className="success-box">
              <FaCheckCircle className="product-success-icon" style={{}} />
              <p>Dados consultados com sucesso!</p>
            </div>

            {produtosNovos.length > 0 && (
              <div className="products-group">
                <p className="group-title group-title-new">Novos Produtos</p>
                <div className="table-container">
                  <div className="table-wrapper">
                    <table className="products-table products-table--cols-8">
                      <thead>
                        <tr className="table-header">
                          <th className="th-image"></th>
                          <th className="th-name">Nome</th>
                          <th className="th-name">Marca</th>
                          <th className="th-number">Unidade</th>
                          <th className="th-number">Código de Barras</th>
                          <th className="th-number">Preço Adquirido</th>
                          <th className="th-number">Preço Revista</th>
                          <th className="th-number">Preço a Vista</th>
                          <th className="th-number">Preço em Ficha</th>
                          <th className="th-actions"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtosNovos.map((product, index) => (
                          <ProductRow
                            key={index}
                            product={product}
                            isActive={
                              editingProduct !== null &&
                              getProductKey(product) === getProductKey(editingProduct)
                            }
                            onEdit={() => handleOpenEdit(product)}
                            formatarMoeda={formatarMoeda}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {produtosExistentes.length > 0 && (
              <div className="products-group">
                <p className="group-title group-title-existing">Atualizando Estoque</p>
                <div className="table-container">
                  <div className="table-wrapper">
                    <table className="products-table products-table--cols-8">
                      <thead>
                        <tr className="table-header">
                          <th className="th-image"></th>
                          <th className="th-name">Nome</th>
                          <th className="th-name">Marca</th>
                          <th className="th-number">Adicionado</th>
                          <th className="th-number">Código de Barras</th>
                          <th className="th-number">Preço Adquirido</th>
                          <th className="th-number">Preço Revista</th>
                          <th className="th-number">Preço a Vista</th>
                          <th className="th-number">Preço em Ficha</th>
                          <th className="th-actions" aria-hidden="true"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtosExistentes.map((product, index) => (
                          <ProductRow
                            key={index}
                            product={product}
                            isActive={
                              editingProduct !== null &&
                              getProductKey(product) === getProductKey(editingProduct)
                            }
                            onEdit={() => handleOpenEdit(product)}
                            formatarMoeda={formatarMoeda}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="buttons-group">
              <button type="button" onClick={limpaProdutos} className="btn-outline">
                <FaRedo className="btn-icon-left" />
                Extrair Novamente
              </button>
              <button onClick={() => FinalizarProdutos(produto)} disabled={loading} className="btn-primary">
                {loading ? (
                  <><FaSpinner className="btn-icon-left spinner-icon" />Salvando...</>
                ) : (
                  <>Salvar Produtos</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer de edição — fora do scroll da página */}
      <EditDrawer
        product={editingProduct}
        editedData={editedData}
        setEditedData={setEditedData}
        initialData={initialEditedData}
        onClose={handleCloseEdit}
        isOpen={isDrawerOpen}
      />
    </div>
  );
}

export default ModoInteligente;
