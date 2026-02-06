import QRCodeInsta from "../../../components/qrCode/Qrcode";
import { format } from "date-fns";
import "./HistoricoDeVenda.css";
const CupomFiscal = ({ vendaSelecionada }) => {
  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <h1>Fabiana Perfumaria</h1>
        <p>
          Rua DR.Rômulo De Almeida,65 <br /> São Miguel Dos Campos/AL
        </p>
        <p>DOCUMENTO AUXILIAR DA NFCE</p>
        <div className="header-details">
          <span>Cliente:{vendaSelecionada[0].comprador}</span>
          <span>
            Emissão:
            {format(new Date(vendaSelecionada[0].dataDaVenda), "dd/MM/yyyy")}
            
          </span>
        </div>
      </div>

      <div className="divider"></div>
      <h2 className="title-fiscal">CUPOM FISCAL</h2>

      <div className="items-table">
        <div className="table-header">
          <span>ITEM DESC. UNI.</span>
          <span>VALOR</span>
        </div>

        {vendaSelecionada.length > 0 ? (
          vendaSelecionada.map((item, index) => (
            <div key={index} className="item-row">
              <span>
                {index + 1 > 0 && String(index + 1).padStart(3, "0")}{" "}
                {item.nomeDoProduto}
                {` x ${item.quantidade}`}
              </span>
              <span>
                {item.precoUnitario
                  ? Number(item.precoUnitario).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ 0,00"}
              </span>
            </div>
          ))
        ) : (
          <p>Nenhuma venda selecionada</p>
        )}
      </div>

      <div className="totals-section">
        <div className="total-row">
          <span>Forma de Pagamento:</span>
          <span>{vendaSelecionada[0].formaDePagamento}</span>
        </div>
        <div className="total-row">
          <span>Desconto:</span>
          <span>0,00</span>
        </div>
        <div className="total-row main-total">
          <span className="grand-total">
            TOTAL: R${vendaSelecionada[0].precoTotal}
          </span>
        </div>
      </div>

      <div className="divider"></div>

      <div className="footer-info">
        <QRCodeInsta />
        <p className="footer-message">Obrigado e volte sempre!</p>
      </div>
    </div>
  );
};

export default CupomFiscal;
