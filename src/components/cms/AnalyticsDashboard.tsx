
import React, { useMemo } from 'react';
import { School, PricingPlan } from '../../types.ts';
import StatCard from '../StatCard.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
    schools: School[];
    plans: PricingPlan[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ schools, plans }) => {

    const metrics = useMemo(() => {
        let mrr = 0;
        let churnedSchools = 0;

        schools.forEach(school => {
            const plan = plans.find(p => p.id === school.planId);
            if (plan && school.subscriptionEndDate) {
                const endDate = new Date(school.subscriptionEndDate);
                const now = new Date();
                
                if (endDate > now) {
                    mrr += plan.prices.monthly;
                } else if ((now.getTime() - endDate.getTime()) / (1000 * 3600 * 24) > 30) {
                    // Churned if subscription ended more than 30 days ago
                    churnedSchools++;
                }
            }
        });

        const activeSchools = schools.length - churnedSchools;
        const churnRate = activeSchools > 0 ? (churnedSchools / (activeSchools + churnedSchools)) : 0;
        const arpa = activeSchools > 0 ? mrr / activeSchools : 0; // Average Revenue Per Account (Monthly)
        const clv = churnRate > 0 ? arpa / churnRate : 0;

        return {
            mrr,
            churnRate,
            clv,
            activeSchools
        };
    }, [schools, plans]);

    const planDistribution = useMemo(() => {
        const distribution: { [key: string]: { name: string, value: number } } = {};
        plans.forEach(plan => {
            distribution[plan.id] = { name: plan.name, value: 0 };
        });

        schools.forEach(school => {
            if (distribution[school.planId]) {
                distribution[school.planId].value++;
            }
        });

        return Object.values(distribution);
    }, [schools, plans]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="revenue" title="Monthly Recurring Revenue" value={`₦${metrics.mrr.toLocaleString()}`} change="Current" />
                <StatCard icon="students" title="Active Schools" value={metrics.activeSchools.toString()} change={`${(schools.length > 0 ? (metrics.activeSchools / schools.length) * 100 : 0).toFixed(1)}% retention`} />
                <StatCard icon="outstanding" title="Churn Rate (Monthly)" value={`${(metrics.churnRate * 100).toFixed(2)}%`} change="Last 30 days" color="orange"/>
                <StatCard icon="revenue" title="Customer Lifetime Value" value={`₦${metrics.clv.toLocaleString()}`} change="Projected" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-secondary mb-4">Plan Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={planDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={(props) => `${props.name} (${props.value})`}
                            >
                                {planDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Placeholder for more charts */}
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center text-gray-400">
                    <p>Another chart can go here (e.g., Growth Over Time)</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
