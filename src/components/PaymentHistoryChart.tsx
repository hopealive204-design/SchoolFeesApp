
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface PaymentHistoryChartProps {
  data: ChartData[];
  dataKey: string;
  fillColor: string;
}

const PaymentHistoryChart: React.FC<PaymentHistoryChartProps> = ({ data, dataKey, fillColor }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `₦${Number(value) / 1000000}M`} />
        <Tooltip
          formatter={(value: number) => [`₦${value.toLocaleString()}`, dataKey]}
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill={fillColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentHistoryChart;
