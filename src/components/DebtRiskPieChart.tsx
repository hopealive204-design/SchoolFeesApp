
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Student, RiskLevel } from '../types.ts';

interface DebtRiskPieChartProps {
  students: Student[];
  theme: {
      primary: string;
      secondary: string;
      accent: string;
  }
}

const DebtRiskPieChart: React.FC<DebtRiskPieChartProps> = ({ students, theme }) => {
  const data = useMemo(() => {
    const riskCounts = {
      [RiskLevel.Low]: 0,
      [RiskLevel.Medium]: 0,
      [RiskLevel.High]: 0,
    };

    students.forEach(student => {
      riskCounts[student.debtRisk]++;
    });

    return [
      { name: 'Low Risk', value: riskCounts[RiskLevel.Low] },
      { name: 'Medium Risk', value: riskCounts[RiskLevel.Medium] },
      { name: 'High Risk', value: riskCounts[RiskLevel.High] },
    ].filter(item => item.value > 0);
  }, [students]);

  const COLORS = {
      'Low Risk': '#22C55E', // green-500
      'Medium Risk': '#F97316', // orange-500
      'High Risk': '#EF4444', // red-500
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DebtRiskPieChart;
