import React, { useState, useEffect } from "react";
import "./EditarCliente.css";
import { Link } from "react-router-dom";
import { FaUserCog } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import axios from "axios";
export default function EditarCliente() {
  const [pesquisa, setPesquisa] = useState("");

  const [cliente, setcliente] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const buscarCliente = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5080/api/CadastroDeCliente/BuscarCliente",
        {
          NomeDoCliente: pesquisa,
          Cpf: pesquisa,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log([response.data]);
      setcliente(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      console.error(error);
      setcliente([]);
    }
  };
  useEffect(() => {
    if ((pesquisa || "").trim().length > 0) {
      buscarCliente();
    } else {
      setcliente(null);
    }
  }, [pesquisa]);

  const ClienteSelecionado = (cliente) => {
    setClienteSelecionado(cliente);
  };

  const handleAtualizarCliente = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5080/api/CadastroDeCliente/AtualizarCliente/${clienteSelecionado.id_Cliente}`,
        clienteSelecionado,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Cliente atualizado com sucesso!");
      setClienteSelecionado(null);
      buscarCliente();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar o cliente.");
    }
  };

  return (
    <>
      <div className="BodyEditarClientes">
        <div className="navBar">
          <Link to={"/ScreenMain"}>
            <img
              src="/src/img/logo-removebg-preview.png"
              width={100}
              height={100}
              alt="Logo"
            />
          </Link>

          <h1>Editar Clientes</h1>
        </div>
        <section>
          <form action="submit" className="formBuscar">
            <input
              type="text"
              className="pesquisaNomeDoCliente"
              placeholder="Digite o Nome Do Cliente"
              onChange={(e) => setPesquisa(e.target.value)}
              value={pesquisa}
            />
          </form>

          <table border={1}>
            <thead>
              <tr>
                <th width={300}>Nome</th>
                <th>Telefone</th>
                <th width={120}>Cpf</th>
                <th width={200}>Endereço</th>
                <th width={50}>Numero Da Residencia</th>
                <th>Bairro</th>
                <th colSpan={2}>Ponto De Referencia</th>
              </tr>
            </thead>
            <tbody>
              {cliente &&
                cliente.map((item) => (
                  <tr key={item.Id_Cliente}>
                    <td>{item.nomeDoCliente}</td>
                    <td>{item.telefone}</td>
                    <td>{item.cpf}</td>
                    <td>{item.endereco}</td>
                    <td>{item.numero}</td>
                    <td>{item.bairro}</td>
                    <td>{item.pontoDeReferencia}</td>
                    <td width={30}>
                      <button onClick={() => ClienteSelecionado(item)}>
                        <MdEdit size={30} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>
      {clienteSelecionado && (
        <div className="ScreenEdit">
        <div className="Edit">
          <FaUserCog size={130} className="IconUser" />
          <form onSubmit={handleAtualizarCliente} key={clienteSelecionado.Id_Cliente}>
            <input type="text" placeholder="Nome Do Cliente" value={clienteSelecionado.nomeDoCliente} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, nomeDoCliente: e.target.value })}/>

            <input type="text" placeholder="Telefone" value={clienteSelecionado.telefone} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, telefone: e.target.value })} />
            <input type="text" placeholder="Cpf" value={clienteSelecionado.cpf} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, cpf: e.target.value })}/>
            <input type="text" placeholder="Endereço" value={clienteSelecionado.endereco} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, endereco: e.target.value })} />
            <input type="text" placeholder="Numero Da Residencia" value={clienteSelecionado.numero} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, numero: e.target.value })}/>
            <input type="text" placeholder="Bairro" value={clienteSelecionado.bairro} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, bairro: e.target.value })}/>
            <input type="text" placeholder="Ponto De Referencia" value={clienteSelecionado.pontoDeReferencia} onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, pontoDeReferencia: e.target.value })} />
          </form>
        </div>

        <div className="Botoes">
          <button style={{ backgroundColor: "green" }} onClick={handleAtualizarCliente}>Editar</button>
          <button style={{ backgroundColor: "red" }} onClick={() => setClienteSelecionado(null)}>Cancelar</button>
        </div>
      </div>
      )}
    </>
  );
}
