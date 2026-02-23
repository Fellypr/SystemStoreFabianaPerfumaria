import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { IoPersonAdd, IoSearchOutline } from "react-icons/io5";
import { MdCancel, MdSave, MdPerson } from "react-icons/md";
import "./CadastroDeClientes.css";

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
  const [termoBusca, setTermoBusca] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [telaDeSucesso, setTelaDeSucesso] = useState(false);

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  const buscarClientes = async () => {
    try {
      const response = await axios.post(`${url}/CadastroDeCliente/BuscarCliente`, {
        Cpf: termoBusca,
        NomeDoCliente: termoBusca,
      });
      setClientesFiltrados(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCadastro = async (e) => {
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
        `${url}/CadastroDeCliente/CadastroDeCliente`,
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
      setTelaDeSucesso(true);
    } catch (error) {
      console.error(error);
    }
  };

  const continuarCadastrando = () => {
    setTelaDeSucesso(false);
    setNome("");
    setCpf("");
    setTelefone("");
    setEndereco("");
    setBairro("");
    setPontoDeReferencia("");
    setNumero("");
  };
const handleCPF = (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  setCpf(value);
};


const handleTelefone = (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  setTelefone(value);
};

  return (
    <div className="client-page-container">
      <nav>
          <div className="navBar">
            <Link to={"/"}>
              <img
                src="img/SUBLOGO- BRONZE.png"
                width={100}
                height={100}
                alt="Logo"
              />
            </Link>
            <h1>Cadastro De Clientes</h1>
          </div>
        </nav>

      <main className="client-main-grid">
        <section className="registration-card">
          <div className="card-header">
            <IoPersonAdd size={24} />
            <h2>Novo Registro</h2>
          </div>
          <form onSubmit={handleCadastro} className="registration-form">
            <div className="input-group full">
              <label>Nome Completo</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>CPF</label>
              <input type="text" value={cpf} onChange={(e) => handleCPF(e)} minLength={14} maxLength={14} required />
            </div>
            <div className="input-group">
              <label>Telefone</label>
              <input type="text" value={telefone} onChange={(e) => handleTelefone(e)} maxLength={15} required />
            </div>
            <div className="input-group full">
              <label>Endereço</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Bairro</label>
              <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Número</label>
              <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            <div className="input-group full">
              <label>Ponto de Referência</label>
              <input type="text" value={pontoDeReferencia} onChange={(e) => setPontoDeReferencia(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save" onClick={handleCadastro}><MdSave /> Salvar Cliente</button>
              <button type="reset" className="btn-cancel"><MdCancel /> Limpar</button>
            </div>
          </form>
        </section>

        <section className="search-list-card">
          <div className="card-header">
            <IoSearchOutline size={24} />
            <h2>Consultar Base</h2>
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Nome ou CPF do cliente..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyUp={buscarClientes}
            />
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c, i) => (
                  <tr key={i}>
                    <td>{c.nomeDoCliente}</td>
                    <td>{c.cpf}</td>
                    <td>{c.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {telaDeSucesso && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Cliente Cadastrado!</h2>
            {GetClientes.map((c, i) => (
              <div key={i} className="client-summary">
                <p><strong>Nome:</strong> {c.NomeDoCliente}</p>
                <p><strong>CPF:</strong> {c.Cpf}</p>
              </div>
            ))}
            <div className="modal-buttons">
              <button onClick={continuarCadastrando} className="btn-continue">Novo Cadastro</button>
              <Link to="/ScreenMain" className="btn-home">Voltar ao Início</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroDeClientes;