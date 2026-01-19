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
    })
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
        `${url}/CadastroDeCliente/AtualizarCliente/${clienteSelecionado.id_Cliente}`,
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
        <section>
          <h1 className="TituloEditarClientes">Editar Clientes</h1>
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
                <th width={50}>Nº</th>
                <th>Bairro</th>
                <th colSpan={2}>Ponto De Referencia</th>
              </tr>
            </thead>
            <tbody className="tbody-editar">
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
        <div className="ScreenEditMain">
          <div className="ScreenEdit">
            <div className="Edit">
              <FaUserEdit className="IconUser" />
              <form
                onSubmit={handleAtualizarCliente}
                key={clienteSelecionado.Id_Cliente}
              >
                <div className="inputLabelNomeDoCliente">
                  <label htmlFor="nomeDoCliente">Nome Do Cliente:</label>
                  <input
                    type="text"
                    placeholder="Nome Do Cliente"
                    value={clienteSelecionado.nomeDoCliente}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        nomeDoCliente: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="inputLabelTelefone">
                  <label htmlFor="telefone">Telefone:</label>
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={clienteSelecionado.telefone || ""}
                    onChange={handleChangeTelefone}
                    maxLength={15}
                  />
                </div>
                <div className="inputLabelCpf">
                  <label htmlFor="cpf">Cpf:</label>
                  <input
                    type="text"
                    placeholder="Cpf"
                    value={clienteSelecionado.cpf || ""}
                    onChange={handleCpfChange}
                    maxLength={14}
                  />
                </div>
                <div className="inputLabelEndereco">
                  <label htmlFor="endereco">Endereço:</label>
                  <input
                    type="text"
                    placeholder="Endereço"
                    value={clienteSelecionado.endereco}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        endereco: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="inputLabelNurmeroResidencia">
                  <label htmlFor="numero">Numero Da Residencia:</label>
                  <input
                    type="text"
                    placeholder="Numero Da Residencia"
                    value={clienteSelecionado.numero}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        numero: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="inputLabelBairro">
                  <label htmlFor="bairro">Bairro:</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={clienteSelecionado.bairro}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        bairro: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="inputLabelPontoDeReferencia">
                  <label htmlFor="pontoDeReferencia">
                    Ponto De Referencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ponto De Referencia"
                    value={clienteSelecionado.pontoDeReferencia}
                    onChange={(e) =>
                      setClienteSelecionado({
                        ...clienteSelecionado,
                        pontoDeReferencia: e.target.value,
                      })
                    }
                  />
                </div>
              </form>
            </div>

            <div className="Botoes">
              <button
                style={{ backgroundColor: "#4CAF50" }}
                onClick={handleAtualizarCliente}
              >
                Editar
              </button>
              <button
                style={{ backgroundColor: "#f44336" }}
                onClick={() => setClienteSelecionado(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
