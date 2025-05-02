import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./CadastroDeClientes.css";
import axios from "axios";
import { useState } from "react";
import { IoPersonAdd } from "react-icons/io5";


function CadastroDeClientes() {
  const [clientes, setClientes] = useState([]);
  const [GetClientes, setGetClientes] = useState([]);
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
      setPontoDeReferencia("");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function ClienteMethodGet() {
      try {
        const response = await axios.get(
          "http://localhost:5080/api/CadastroDeCliente/HistoricoDeClientes"
        );
        console.log(response.data);
        setGetClientes(response.data);
      } catch (error) {
        console.error(error);
      }
      
    }
    ClienteMethodGet();
  },[]);

  function continuarCadastrando() {
    window.location.reload();
  }
  return (
    <>
      <main className={clientes.length > 0 ? "blur" : "CadastroDeClientesMain"}>
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
            <IoPersonAdd size={50} className="Icon" />
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
              className="PontoDeReferencia"
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
                <th width={150}>Telefone</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {GetClientes.slice(0, 7).map((cliente) => (
                <tr key={cliente.Id_Cliente}>
                  <td>{cliente.nomeDoCliente}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.endereco}, {cliente.numero}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <div>
        <div className={clientes.length > 0 ? "TelaDeSucesso" : "null"}>
          {clientes.map((cliente) => (
            <div key={cliente.Id_Cliente} className="TelaDeSucessoContainer">
              <h2>Cliente Cadastrado Com Sucesso</h2>

              <p>
                Nome Do Cliente: <span>{cliente.NomeDoCliente}</span>
              </p>
              <p>
                Cpf: <span>{cliente.Cpf}</span>
              </p>
              <p>
                Telefone: <span>{cliente.Telefone}</span>
              </p>
              <p>
                Endereço: <span>{cliente.Endereco}</span>
              </p>
              <p>
                Bairro: <span>{cliente.Bairro}</span>
              </p>
              <p>
                Numero Da Residencia: <span>{cliente.Numero}</span>
              </p>

              <div className="buttons">
                <Link to={"/ScreenMain"}>
                  <button style={{ backgroundColor: "rgb(0, 255, 255)" }}>
                    Ir Para Pagina Principal
                  </button>
                </Link>
                <Link>
                  <button
                    style={{ backgroundColor: "rgb(0, 255, 42)" }}
                    onClick={continuarCadastrando}
                  >
                    Continuar Cadastrando
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CadastroDeClientes;
