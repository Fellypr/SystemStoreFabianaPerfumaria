import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

type TooltipPayload = ReadonlyArray<any>;

type Coordinate = {
  x: number;
  y: number;
};

type PieSectorData = {
  percent?: number;
  name?: string | number;
  midAngle?: number;
  middleRadius?: number;
  tooltipPosition?: Coordinate;
  value?: number;
  paddingAngle?: number;
  dataKey?: string;
  payload?: any;
  tooltipPayload?: ReadonlyArray<TooltipPayload>;

};

type GeometrySector = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  payload: PieSectorData;
};

type PieLabelProps = PieSectorData &
  GeometrySector & {
    tooltipPayload?: any;
  };

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
  { name: 'Group E', value: 978 },
  { name: 'Group F', value: 189 },
];

const RADIAN = Math.PI / 180;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#023dffff', '#AF19FF', '#00495cff'];


export default function Example() {
  const [HistoricoDeVendasDeHoje, setHistoricoDeVendasDeHoje] = useState([]);
    async function FechandoCaixa() {
      try {
        const response = await axios.get(
          "http://localhost:5080/api/RealizarVenda/VendasDaSemana"
        );
        console.log(response.data);
        setHistoricoDeVendasDeHoje(response.data);
      } catch (error) {
        console.error("Erro ao fechar caixa:", error);
      }
    }
  
    useEffect(() => {
      FechandoCaixa();
    }, []);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text x={x} y={y} fill="#000" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '17px', fontWeight: 'bold'}}>
      {`${payload?.diaDaSemana ?? 'Dia'}: ${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        <Pie
          data={HistoricoDeVendasDeHoje}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="qunatidadeDoDia"
        >
          {HistoricoDeVendasDeHoje.map((item, index) => (
            <Cell key={`cell-${item.diaDaSemana}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
