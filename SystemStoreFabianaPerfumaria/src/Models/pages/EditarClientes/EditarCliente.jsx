import { useState, useEffect } from "react";
import "./EditarCliente.css";
import { Link } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import axios from "axios";
export default function EditarCliente() {
  const [pesquisa, setPesquisa] = useState("");

  const [cliente, setcliente] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const url = import.meta.env.VITE_IP_PARA_USAR_NO_MOMENTO;

  function formatarCPF(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function handleCpfChange(e) {
    let valorDigitado = e.target.value;
    valorDigitado = formatarCPF(valorDigitado);

    setClienteSelecionado({
      ...clienteSelecionado,
      cpf: valorDigitado,
    });
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
    setClienteSelecionado({
      ...clienteSelecionado,
      telefone: valorDigitado,
    });
  }

  const buscarCliente = async () => {
    try {
      const response = await axios.post(
        `${url}/CadastroDeCliente/BuscarCliente`,
        {
          NomeDoCliente: pesquisa,
          Cpf: pesquisa,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log([response.data]);
      setcliente(
        Array.isArray(response.data) ? response.data : [response.data],
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
        `${url}/CadastroDeCliente/AtualizarCliente/${clienteSelecionado.id_Cliente}`,
        clienteSelecionado,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      alert("Cliente atualizado com sucesso!");
      setClienteSelecionado(null);
      buscarCliente();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar o cliente.");
    }
  };
  const clienteFiltrados = (cliente || []).filter(
    (item) => item.id_Cliente !== clienteSelecionado?.id_Cliente,
  );

  return (
    <div className="edit-client-container">
      <div className="navBar">
        <Link to={"/"}>
          <img
            src="img/SUBLOGO- BRONZE.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Fabiana Perfumaria</h1>
      </div>

      <section className="edit-client-content">
        <div className="search-card">
          <div className="search-header">
            <FaUserEdit className="icon-main" />
            <div className="search-texts">
              <h2>Pesquisar Cliente</h2>
              <span>Busque por nome ou CPF</span>
            </div>
          </div>

          <div className="search-input-group">
            <input
              type="text"
              placeholder="Ex: João Silva ou 000.000.000-00"
              className="search-input"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
        </div>

        <div className="client-list-card">
          <table className="client-table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Cidade/UF</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clienteFiltrados.map((item) => (
                <tr key={item.Id_Cliente}>
                  <td className="font-bold">{item.nomeDoCliente}</td>
                  <td>{item.cpf}</td>
                  <td>{item.telefone}</td>
                  <td>
                    {item.cidade} - {item.estado}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn-edit-action"
                      onClick={() => setClienteSelecionado(item)}
                      title="Editar Cliente"
                    >
                      <MdEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      
      {clienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <header className="modal-header">
              <div className="header-info">
                <FaUserEdit />
                <h3>Editar Informações</h3>
              </div>
              <button
                className="close-x"
                onClick={() => setClienteSelecionado(null)}
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              <form
                className="edit-grid-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="input-box full-width">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    value={clienteSelecionado.nomeDoCliente}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        nomeDoCliente: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-box">
                  <label>CPF</label>
                  <input
                    type="text"
                    value={clienteSelecionado.cpf}
                    onChange={handleCpfChange}
                  />
                </div>

                <div className="input-box">
                  <label>Telefone</label>
                  <input
                    type="text"
                    value={clienteSelecionado.telefone}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        telefone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-box">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={clienteSelecionado.cidade}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        cidade: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-box">
                  <label>Estado</label>
                  <input
                    type="text"
                    value={clienteSelecionado.estado}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        estado: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-box full-width">
                  <label>Endereço</label>
                  <input
                    type="text"
                    value={clienteSelecionado.endereco}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        endereco: e.target.value,
                      })
                    }
                  />
                </div>

                
              </form>
            </div>

            <footer className="modal-footer">
              <button
                className="btn-cancel-modal"
                onClick={() => setClienteSelecionado(null)}
              >
                Descartar
              </button>
              <button
                className="btn-save-modal"
                onClick={handleAtualizarCliente}
              >
                Salvar Alterações
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
