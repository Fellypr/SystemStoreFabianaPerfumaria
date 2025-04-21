import React from "react";
import { Link } from "react-router-dom";
import "./CadastroDeClientes.css";
import axios from "axios";
import { useState } from "react";

function CadastroDeClientes() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [pontoDeReferencia, setPontoDeReferencia] = useState("");
  const [numero, setNumero] = useState("");

  function formatarCPF(cpf) {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function handleChange(e) {
    let valorDigitado = e.target.value;
    valorDigitado = formatarCPF(valorDigitado);
    setCpf(valorDigitado);
  }
  function telefoneFormatado(telefone) {
    return telefone
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2");
  }
  function handleChangeTelefone(e) {
    let valorDigitado = e.target.value;
    valorDigitado = telefoneFormatado(valorDigitado);
    setTelefone(valorDigitado);
  }

  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      const novoCliente = {
        NomeDoCliente: nome,
        Cpf: cpf,
        Telefone: telefone,
        Endereco: endereco,
        Bairro: bairro,
        Numero: numero,
        PontoDeReferencia: pontoDeReferencia,
      };
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        "http://localhost:5080/api/CadastroDeCliente/CadastroDeCliente",
        novoCliente,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setClientes([...clientes, novoCliente]);
      setNome("");
      setCpf("");
      setTelefone("");
      setEndereco("");
      setBairro("");
      setNumero("");
    } catch (error) {
      console.error(error);
    }
  };
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
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Nome Do Cliente"
              className="NomeCliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="text"
              placeholder="CPF: 000.000.000-00"
              value={cpf}
              onChange={handleChange}
              maxLength={14}
            />
            <input
              type="text"
              placeholder="Telefone:(00)00000-0000"
              value={telefone}
              onChange={handleChangeTelefone}
              maxLength={15}
            />
            <input
              type="text"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <input
              type="text"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
            <input
              type="number"
              placeholder="Numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
            <input
              type="text"
              placeholder="Ponto De Referencia(opicional)"
              value={pontoDeReferencia}
              onChange={(e) => setPontoDeReferencia(e.target.value)}
            />

            <button className="button type1"></button>
          </form>

          <table border={1}>
            <thead>
              <tr>
                <th
                  colSpan={4}
                  style={{ backgroundColor: "rgb(0, 26, 255)", color: "white" }}
                >
                  Cadastros Recentes
                </th>
              </tr>
              <tr>
                <th>Nome Do Cliente</th>
                <th width={150}>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.Id_Cliente}>
                  <td>{cliente.NomeDoCliente}</td>
                  <td>{cliente.Cpf}</td>
                  <td>{cliente.Telefone}</td>
                  <td>{cliente.Endereco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <div>
        <div className={clientes.length == 0 ? "TelaDeSucesso" : "null"}>
          {clientes.map((cliente) => (
            <div key={cliente.Id_Cliente} className="TelaDeSucessoContainer">
              <h2>Cliente Cadastrado Com Sucesso</h2>
              <p>
                <strong>Comfirme Seu Cadastro</strong>
              </p>
              <p>
                Nome Do Cliente: s<span>{cliente.NomeDoCliente}</span>
              </p>
              <p>
                Cpf:s<span>{cliente.Cpf}</span>
              </p>
              <p>
                Telefone:ss<span>{cliente.Telefone}</span>
              </p>
              <p>
                Endereço: s<span>{cliente.Endereco}</span>
              </p>
              <p>
                Bairro:s<span>{cliente.Bairro}</span>
              </p>
              <p>
                Numero Da Residencia:2<span>{cliente.Numero}</span>
              </p>

              <div>
                <button>Ir Para Pagina Principal</button>
                <button>Continuar Cadastrando</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CadastroDeClientes;
