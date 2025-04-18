import React from "react";
import { Link } from "react-router-dom";
import "./CadastroDeClientes.css";

import { useState } from "react";

function CadastroDeClientes() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  function formatarCPF(cpf) {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  }
 function handleChange (e){
  let valorDigitado = e.target.value;
  valorDigitado = formatarCPF(valorDigitado);
  setCpf(valorDigitado);
 }
 function telefoneFormatado (telefone){
  return telefone
  .replace(/\D/g, "")
  .replace(/(\d{2})(\d)/, "($1) $2")
  .replace(/(\d{4,5})(\d)/, "$1-$2");
 }
 function handleChangeTelefone (e){
  let valorDigitado = e.target.value;
  valorDigitado = telefoneFormatado(valorDigitado);
  setTelefone(valorDigitado);
 }
  return (
    <>
      <main className="CadastroDeClientesMain">
        <nav>
          <div className="navBar">
            <Link to={"/ScreenMain"}>
              <img
                src="/src/img/logo-removebg-preview.png"
                width={100}
                height={100}
                alt="Logo"
              />
            </Link>
            <h1>Cadastro De Clientes</h1>
          </div>
        </nav>
        <section>
          <form>
            <input type="text" placeholder="Nome Do Cliente" className="NomeCliente"/>
            <input type="text" placeholder="CPF: 000.000.000-00" value={cpf} onChange={handleChange} maxLength={14} />
            <input type="text" placeholder="Telefone:(00)00000-0000" value={telefone} onChange={handleChangeTelefone} maxLength={15} />
            <input type="text" placeholder="Endereço" />
            <button className="button type1"></button>
          </form>

          <table border={1}>
            <thead>
              <tr>
                <th colSpan={4} style={{ backgroundColor: "rgb(0, 26, 255)" ,color:"white"}}>Cadastros Recentes</th>
              </tr>
              <tr>
                <th>Nome Do Cliente</th>
                <th width={150}>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
              </tr>
            </thead>
          </table>
        </section>
      </main>
    </>
  );
}

export default CadastroDeClientes;
