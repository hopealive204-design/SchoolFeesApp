import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { School, Term } from '../types';
import { generateFinancialSummary, generateDebtAgingReport, generateClassPerformanceReport } from '../services/schoolService';
import PrintableReport from './print_templates/PrintableReport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export type ReportType = 'weekly' | 'monthly' | 'debt_aging' | 'class_performance';
export type ReportData = any;

interface ReportsPageProps {
  school: School;
}

const ReportViewer: React.FC<{ report: { type: ReportType, data: ReportData, term?: Term, session?: string } }> = ({ report }) => {
    const { type, data, term, session } = report;

    const FinancialSummaryReport = () => (
        <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
                Report for Period: <strong>{new Date(data.startDate).toLocaleDateString()}</strong> to <strong>{new Date(data.endDate).toLocaleDateString()}</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-800">Total Revenue Collected</p>
                    <p className="text-2xl font-bold text-blue-900">₦{data.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-800">Payments Recorded</p>
                    <p className="text-2xl font-bold text-green-900">{data.paymentsCount}</p>
                </div>
                 <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">Unique Paying Students</p>
                    <p className="text-2xl font-bold text-yellow-900">{data.studentsWithNewPayments}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-red-800">Total Outstanding Fees</p>
                    <p className="text-2xl font-bold text-red-900">₦{data.totalOutstanding.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
    
    const DebtAgingReport = () => {
        const COLORS = ['#22C55E', '#FBBF24', '#F97316', '#EF4444', '#B91C1C'];
        return (
            <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">Breakdown of outstanding fees by how long they are overdue.</p>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                            <YAxis type="category" dataKey="range" width={80} />
                            <Tooltip formatter={(value, name) => [`₦${Number(value).toLocaleString()}`, name === 'count' ? 'Students' : 'Amount']} />
                            <Legend />
                            <Bar dataKey="amount" name="Outstanding Amount" barSize={30}>
                                {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Bar>
                         </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Aging Bracket</th>
                                <th className="px-6 py-3">Outstanding Amount</th>
                                <th className="px-6 py-3">No. of Students</th>
                            </tr>
                        </thead>
                        <tbody>
                        {data.map((row: any) => (
                            <tr key={row.range} className="bg-white border-b">
                                <td className="px-6 py-4 font-semibold">{row.range} days</td>
                                <td className="px-6 py-4 font-mono">₦{row.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">{row.count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const ClassPerformanceReport = () => (
        <>
            <p className="text-center text-sm text-gray-600 mb-4">
                Displaying fee performance for <strong>{term}, {session} Session</strong>. Outstanding amounts are overall totals for students in each class.
            </p>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Class</th>
                            <th className="px-6 py-3">Total Fees for Term</th>
                            <th className="px-6 py-3">Total Outstanding (Overall)</th>
                            <th className="px-6 py-3">Student Count</th>
                        </tr>
                    </thead>
                    <tbody>
                    {data.map((row: any) => (
                        <tr key={row.className} className="bg-white border-b">
                            <td className="px-6 py-4 font-semibold">{row.className}</td>
                            <td className="px-6 py-4 font-mono">₦{row.totalFeesForTerm.toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono text-red-600">₦{row.totalOutstanding.toLocaleString()}</td>
                            <td className="px-6 py-4">{row.studentCount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    switch(type) {
        case 'weekly':
        case 'monthly':
            return <FinancialSummaryReport />;
        case 'debt_aging':
            return <DebtAgingReport />;
        case 'class_performance':
            return <ClassPerformanceReport />;
        default:
            return <p>Report view not available.</p>;
    }
};


const ReportsPage: React.FC<ReportsPageProps> = ({ school }) => {
    const [activeReport, setActiveReport] = useState<{ type: ReportType, data: ReportData, session?: string, term?: Term } | null>(null);

    const allSessions = useMemo(() => {
        const sessions = new Set<string>();
        school.students.forEach(s => s.fees.forEach(f => sessions.add(f.session)));
        return [...Array.from(sessions).sort((a,b) => b.localeCompare(a))];
    }, [school.students]);

    const [selectedSession, setSelectedSession] = useState<string>(allSessions[0] || school.currentSession);
    const [selectedTerm, setSelectedTerm] = useState<Term>(school.currentTerm);

    const reportOptions: { id: ReportType, name: string, description: string, icon: React.ReactElement, requiresTermFilter: boolean }[] = [
        { id: 'weekly', name: 'Weekly Financial Summary', description: 'Revenue, payments, and debts from the last 7 days.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>, requiresTermFilter: false },
        { id: 'monthly', name: 'Monthly Financial Summary', description: 'A detailed financial overview for the last 30 days.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>, requiresTermFilter: false },
        { id: 'debt_aging', name: 'Debt Aging Report', description: 'Breakdown of outstanding fees by how long they are overdue.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, requiresTermFilter: false },
        { id: 'class_performance', name: 'Class Performance Report', description: 'Compare fee payment status and totals across all classes for a specific term.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 17V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>, requiresTermFilter: true },
    ];

    const generateReport = (type: ReportType) => {
        let data;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        switch (type) {
            case 'weekly':
                data = generateFinancialSummary(school, weekAgo.toISOString(), now.toISOString());
                break;
            case 'monthly':
                 data = generateFinancialSummary(school, monthAgo.toISOString(), now.toISOString());
                break;
            case 'debt_aging':
                data = generateDebtAgingReport(school);
                break;
            case 'class_performance':
                 data = generateClassPerformanceReport(school, selectedSession, selectedTerm);
                break;
            default:
                return;
        }
        setActiveReport({ type, data, session: selectedSession, term: selectedTerm });
    };

    const handlePrint = () => {
        if (!activeReport) return;
        
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (!printWindow) {
            alert('Please allow popups to print reports.');
            return;
        }

        printWindow.document.write(`<html><head><title>Printing Report...</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root"></div></body></html>`);
        printWindow.document.close();

        const printRootEl = printWindow.document.getElementById('print-root');
        if (printRootEl) {
            const root = ReactDOM.createRoot(printRootEl);
            root.render(<PrintableReport school={school} reportType={activeReport.type} data={activeReport.data} />);
            
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title text-secondary">Reports Center</h3>
                    <p className="text-sm text-base-content/70">Generate, view, and download key financial and operational reports.</p>
                </div>
            </div>

            {!activeReport ? (
                <>
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h4 className="font-semibold text-secondary mb-2">Report Filters</h4>
                            <p className="text-xs text-base-content/70 mb-2">Select a period for term-specific reports like Class Performance.</p>
                            <div className="flex space-x-4">
                                <div>
                                    <label htmlFor="session-filter" className="block text-sm font-medium text-gray-700">Session</label>
                                    <select id="session-filter" value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="select select-bordered select-sm mt-1">
                                        {allSessions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700">Term</label>
                                    <select id="term-filter" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value as Term)} className="select select-bordered select-sm mt-1">
                                        <option value={Term.First}>First Term</option>
                                        <option value={Term.Second}>Second Term</option>
                                        <option value={Term.Third}>Third Term</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportOptions.map(report => (
                            <div key={report.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="bg-primary/10 text-primary p-2 rounded-lg">{report.icon}</div>
                                        <h4 className="card-title text-primary">{report.name}</h4>
                                    </div>
                                    <p className="text-sm text-base-content/80 mt-1">{report.description}</p>
                                    {report.requiresTermFilter && <div className="badge badge-accent badge-outline badge-sm mt-2">Uses Session/Term Filter</div>}
                                    <div className="card-actions mt-4">
                                        <button onClick={() => generateReport(report.id)} className="btn btn-primary btn-outline btn-sm">
                                            Generate Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="card bg-base-100 shadow animate-fade-in">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-4 border-b pb-4 flex-wrap gap-2">
                          <div>
                              <button onClick={() => setActiveReport(null)} className="btn btn-ghost btn-sm mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                  Back to All Reports
                              </button>
                              <h3 className="text-xl font-semibold text-secondary">{reportOptions.find(r => r.id === activeReport.type)?.name}</h3>
                          </div>
                          <div className="flex space-x-2">
                              <button onClick={handlePrint} className="btn btn-primary btn-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                  Download / Print
                              </button>
                          </div>
                      </div>
                      <div id="report-viewer">
                         <ReportViewer report={activeReport} />
                      </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;