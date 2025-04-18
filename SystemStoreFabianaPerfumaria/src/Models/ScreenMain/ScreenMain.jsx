import "./ScreenMain.css";
import { Link } from "react-router-dom";
//react icons
import { GiDelicatePerfume } from "react-icons/gi";
import { MdDeleteForever } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { LiaEdit } from "react-icons/lia";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { IoPersonAdd } from "react-icons/io5";

import { useEffect, useState } from "react";

import axios from "axios";

import Navbar from "../../components/Navbar/Navbar";
const ScreenMain = () => {
  const [produtosAdicionados, setProdutosAdicionados] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState([]);

  const adicionarProduto = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5080/api/AdicionarProduto/HistoricoDeProdutos"
      );

      setProdutosAdicionados(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const adicionarVenda = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5080/api/RealizarVenda/VendasRealizadas"
      );
      setProdutosVendidos(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    adicionarVenda();
    adicionarProduto();

  }, []);

  const FormatacaoData = (data) => {
    const dataFormatada = new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return dataFormatada;
  };

  const FormatacaoDePreco = (precoTotal) => {
    let precoLimpo = String(precoTotal).replace(/\D/g, "");
    const precoFormatado = Number(precoLimpo / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return precoFormatado;

  };

  return (
    <>
      <div className="body">
        <Navbar />

        <div className="Cards">
          <div className="Item" style={{ backgroundColor: "rgb(46, 214, 4)" }}>
            <Link className="Link" to={"/AdicionarProduto"}>
              <GiDelicatePerfume size={50} />
              Adicionar Produto
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(255, 0, 0)" }}>
            <Link className="Link" to={"/ExcluirProdutos"}>
              <MdDeleteForever size={50} />
              Excluir Produto
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(0, 81, 255)" }}>
            <Link className="Link" to={"/HistoricoEEstatistica"}>
              <FaHistory size={50} />
              Historico De Vendas e Estatísticas
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(0, 0, 0)" }}>
            <Link className="Link" to={"/EditarProduto"}>
              <LiaEdit size={50} />
              Editar Produtos e Clientes
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(89, 0, 255)" }}>
            <Link className="Link" to={"/RealizarUmaVenda"}>
              <MdOutlineAddShoppingCart size={50} />
              Realizar uma Venda
            </Link>
          </div>
          <div className="Item" style={{ backgroundColor: "rgb(255, 102, 0)" }}>
            <Link className="Link">
              <IoPersonAdd size={50} />
              Cadastro de Clientes
            </Link>
          </div>
        </div>

        <div className="TabelaProdutos">
          <table border={1} width={650}>
            <tr>
              <th colSpan={6} style={{ backgroundColor: "rgb(0, 81, 255)" }}>
                Produtos Cadastrados
              </th>
            </tr>
            <tr style={{ backgroundColor: "rgb(0, 255, 149)" }}>
              <th>Nome Produto</th>
              <th >Marca</th>
              <th width={1}>Quantidade</th>
              <th>Preço</th>
            </tr>
            {produtosAdicionados.slice(0,7).map((produto) => (
              <tr>
                <td>{produto.NomeDoProduto}</td>
                <td>{produto.Marca}</td>
                <td>{produto.Quantidade}</td>
                <td>{FormatacaoDePreco(produto.Preco)}</td>
              </tr>
            ))}
          </table>
          <table border={1} width={650}>
            <tr>
              <th colSpan={6} style={{ backgroundColor: "rgb(0, 204, 255)" }}>
                Produtos vendidos Hoje
              </th>
            </tr>
            <tr style={{ backgroundColor: "rgb(255, 187, 0)" }}>
              <th colSpan={1} width={300}>Nome Produto</th>
              <th width={50}>Quatidade</th>
              <th width={100}>Preço Total</th>
              <th>Data Da Venda</th>
            </tr>
            {produtosVendidos.slice(0,7).map((produto) => (
              <tr key={produto.id}>
                <td >{produto.nomeDoProduto}</td>
                <td>{produto.quantidade}</td>
                <td>{FormatacaoDePreco(produto.precoTotal)}</td>
                <td>{(FormatacaoData(produto.dataDaVenda))}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    </>
  );
};

export default ScreenMain;
