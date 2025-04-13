//react
import React from "react";
//css
import "./EditarProduto.css";
//router
import { Link } from "react-router-dom";
//icons
import { FaRegEdit } from "react-icons/fa";

function EditarProduto() {
  return (
    <div>
      <div className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Editar Produtos e Clientes</h1>
      </div>
      <div className="TabelaDePesquisa">
        <form>
          <div className="TabelaDeProdutos">
            <div className="input-group">
              <input required type="text" name="text" className="inputEditar" />
              <label className="user-label">Escaneie o Codigo de Barras</label>
            </div>
            <table border={1} width={650}>
              <tr>
                <th colSpan={6} style={{ backgroundColor: "rgb(255, 238, 0)" }}>
                  Produtos Cadastrados
                </th>
              </tr>
              <tr style={{ backgroundColor: "rgb(0, 255, 149)" }}>
                <th >Id</th>
                <th width={200}>Nome Produto</th>
                <th width={200}>Marca</th>
                <th width={1}>Quantidade</th>
                <th colSpan={2}>Preço</th>
              </tr>
              <tr>
                <td>1</td>
                <td>tests</td>
                <td>tests</td>
                <td>tests</td>
                <td width={100}>tests</td>
                <td width={30}>
                  <button type="submit" className="BotaoEditar"><FaRegEdit /></button>
                </td>
              </tr>
            </table>
          </div>
        </form>

        <form>
          <div className="TabelaDeClientes">
            <div className="input-group">
              <input required type="text" name="text" className="inputEditar" />
              <label className="user-label">Nome ou Cpf do Cliente</label>
            </div>
            <table border={1} width={650}>
              <tr>
                <th
                  colSpan={6}
                  style={{ backgroundColor: "rgb(168, 168, 168)" }}
                >
                  Clientes Cadastrados
                </th>
              </tr>
              <tr style={{ backgroundColor: "rgb(0, 255, 149)" }}>
                <th width={30}>Id</th>
                <th>Nome</th>
                <th width={150}>Cpf</th>
                <th width={200}>Endereço</th>
                <th width={100} colSpan={2}>Telefone</th>
                
              </tr>
              <tr>
                <td>1</td>
                <td>Fellype</td>
                <td width={150}>11111111111</td>
                <td width={100}>tests</td>
                <td>8282738921</td>
                <td width={30}>
                  <button type="submit" className="BotaoEditar"><FaRegEdit /></button>
                </td>
              </tr>
            </table>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarProduto;
