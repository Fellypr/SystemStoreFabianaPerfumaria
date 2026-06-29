import { useState , useEffect, useMemo} from "react";
import axios from "axios";
export function UseComissao() {
  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;
  const [historicoDeVendas, setHistoricoDeVendas] = useState([]);
  const [dataInicio, setDataInicio] = useState(() => {
    const dataAtual = new Date();
    const primeiroDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const dataFormatada = primeiroDiaDoMes.toISOString().split("T")[0];
    return dataFormatada;
  });
  const [dataFim, setDataFim] = useState(() => {
    const dataAtual = new Date();
    const ultimoDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const dataFormatada = ultimoDiaDoMes.toISOString().split("T")[0];
    return dataFormatada;
  });
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [baseSalario, setBaseSalario] = useState(1000);
  const [porcentagemComissao, setPorcentagemComissao] = useState(1.5);
  const [porcentagemComissaoCrediario, setPorcentagemComissaoCrediario] = useState(0.5);
  const [codigoFuncionario, setCodigoFuncionario] = useState("");
  const [liberado, setLiberado] = useState(false);

  async function BuscarHistoricoDeVendasParaComissao() {
    try {
      const response = await axios.get(`${url}/RealizarVenda/FiltrarVendas`, {
        params: {
          funcionaria: nomeFuncionario || null,
          formaDePagamento: formaDePagamento || null,
          dataInicial: dataInicio || null,
          dataFinal: dataFim || null,
        },
      });
      setHistoricoDeVendas(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico de vendas:", error);
    }
  }
  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  function textoFormaPagamento(venda) {
    const pagamentos = venda?.pagamentos || venda?.formaDePagamento;

    if (Array.isArray(pagamentos)) {
      if (pagamentos.length > 1) return "Pagamento dividido";
      return pagamentos[0]?.formaPagamento || "Nao informado";
    }

    if (pagamentos && typeof pagamentos === "object") {
      return pagamentos.formaPagamento || "Nao informado";
    }

    return pagamentos || "Nao informado";
  }
  
  useEffect(() => {
    BuscarHistoricoDeVendasParaComissao();
  }, [nomeFuncionario, formaDePagamento, dataInicio, dataFim]);
    const { vendasUnicas, totalVendido} = useMemo(() => {
      const unicas = Object.values(
        historicoDeVendas.reduce((acc, item) => {
          if (!acc[item.idVenda]) acc[item.idVenda] = item;
          return acc;
        }, {}),
      );
  
      const vendido = unicas.reduce((acc, v) => acc + (v.precoTotal || 0), 0);
  
      return { vendasUnicas: unicas, totalVendido: vendido};
    }, [historicoDeVendas]);

  const [erroCodigo, setErroCodigo] = useState(false);

  function liberaEntrada() {
    if (codigoFuncionario === "1410") {
      setLiberado(true);
      setErroCodigo(false);
      setCodigoFuncionario("");
    } else {
      setErroCodigo(true);
      setCodigoFuncionario("");
    }
  }

  

  return {
    BuscarHistoricoDeVendasParaComissao,
    historicoDeVendas,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    formaDePagamento,
    setFormaDePagamento,
    nomeFuncionario,
    setNomeFuncionario,
    formatarMoeda,
    textoFormaPagamento,
    totalVendido,
    vendasUnicas,
    baseSalario,
    setBaseSalario,
    porcentagemComissao,
    setPorcentagemComissao,
    codigoFuncionario,
    setCodigoFuncionario,
    liberado,
    liberaEntrada,
    erroCodigo,
    setErroCodigo,
    porcentagemComissaoCrediario,
    setPorcentagemComissaoCrediario,
  };
}
