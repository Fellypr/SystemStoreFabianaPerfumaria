import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

import "./HistoricoEEstatistica.css";
import { ImCancelCircle } from "react-icons/im";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const data = [
  { name: "Jan", pv: 2400 },
  { name: "Fev", pv: 1398 },
  { name: "Mar", pv: 9800 },
  { name: "Abr", pv: 3908 },
  { name: "Mai", pv: 4800 },
  { name: "Jun", pv: 3800 },
  { name: "Jul", pv: 4300 },
  { name: "Ago", pv: 5200 },
  { name: "Set", pv: 6100 },
  { name: "Out", pv: 7100 },
  { name: "Nov", pv: 6500 },
  { name: "Dez", pv: 7900 },
];
const produto = [
  {
    value: 100,
    name: "ilia",
    fill: "#8884d8",
  },
  {
    value: 80,
    name: "TodoDia",
    fill: "#83a6ed",
  },
  {
    value: 50,
    name: "humor",
    fill: "#8dd1e1",
  },
  {
    value: 40,
    name: "esqueci",
    fill: "#82ca9d",
  },
  {
    value: 26,
    name: "Test",
    fill: "#a4de6c",
  },
];

function HistoricoEEstatistica() {
  const [data1, setData1] = useState("");
  const [Detalhes, setDetalhes] = useState(false);

  const ShowDetalhes = () => setDetalhes(false);
  const HideDetalhes = () => setDetalhes(true);
  useEffect(() => {
    function getData() {
      const dateFormat = data1.toLocaleDateString("pt-BR");
      setData1(dateFormat);
    }
  }, []);

  return (
    <>
      <div className="navBar">
        <Link to={"/ScreenMain"}>
          <img
            src="/src/img/logo-removebg-preview.png"
            width={100}
            height={100}
            alt="Logo"
          />
        </Link>

        <h1>Historico De Vendas e Estatísticas</h1>
      </div>
      <div className="Historico">
        <div className="PesquisaHistorico">
          <input
            type="date"
            value={data1}
            onChange={(e) => setData1(e.target.value)}
          />
          <input type="text" placeholder="Filtrar Por Nome do Cliente" />
        </div>

        <table border={1} width={850}>
          <tr>
            <th colSpan={6} style={{ backgroundColor: "rgb(0, 204, 255)" }}>
              Historico de Vendas dos Produtos Do Dia : {data1}
            </th>
          </tr>
          <tr style={{ backgroundColor: "rgb(255, 187, 0)" }}>
            <th width={40}>Id</th>
            <th width={200}>Nome Produto</th>
            <th width={200}>Nome Do Cliente</th>
            <th width={1}>Quantidade</th>
            <th width={90}>Preço Total</th>
            <th>Venda</th>
          </tr>
          <tr>
            <td>tests</td>
            <td>tests,sdasdas,dasdad,sdasda...</td>
            <td>Claudia</td>
            <td>23</td>
            <td>R$ 480,00 </td>
            <td width={90}>
              <button className="detalhesBtn" onClick={ShowDetalhes}>
                Detalhes
              </button>
            </td>
          </tr>
          <tr>
            <td>teste</td>
            <td>teste</td>
            <td>teste</td>
            <td>teste</td>
            <td>teste</td>
            <td>
              <button className="detalhesBtn">Detalhes</button>
            </td>
          </tr>
        </table>
      </div>
      <div className="estatistica">
        <div className="grafico">
          <h3>Historico De Vendas no Mês</h3>
          <p>Total De Vendas do més: R$ 20.000,00</p>
          <BarChart data={data} width={1000} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
      <div className="estatisticaProduto">
        <div className="graficoProduto">
          <h2>Sucesso Em Vendas</h2>
          <FunnelChart width={830} height={300}>
            <Tooltip />
            <Funnel dataKey="value" data={produto} isAnimationActive>
              <LabelList
                position="center"
                fill="#000"
                stroke="none"
                dataKey="name"
              />
            </Funnel>
          </FunnelChart>
        </div>
      </div>
      <div className={Detalhes ? "ShowDetalhes" : "DetalhesNone"}>
        <ImCancelCircle onClick={HideDetalhes} size={25} />
        <h2>Detalhes Da Venda</h2>
      </div>
    </>
  );
}

export default HistoricoEEstatistica;
