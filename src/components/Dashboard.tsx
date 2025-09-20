import React, { useState, useMemo } from 'react';
import { Student, RiskLevel, School, PlatformConfig, Term } from '../types.ts';
import StatCard from './StatCard.tsx';
import PaymentHistoryChart from './PaymentHistoryChart.tsx';
import DebtRiskPieChart from './DebtRiskPieChart.tsx';
import StudentsTable from './StudentsTable.tsx';
import BulkActionModal from './BulkActionModal.tsx';

interface DashboardProps {
    school: School;
    platformConfig: PlatformConfig;
}

const getTermDateRange = (session: string, term: Term): { start: Date, end: Date } => {
    const startYearStr = session.split('/')[0];
    if (!startYearStr) return { start: new Date(), end: new Date() };

    const startYear = parseInt(startYearStr, 10);
    
    switch (term) {
        case Term.First:
            // September to December
            return { start: new Date(startYear, 8, 1), end: new Date(startYear, 11, 31, 23, 59, 59) };
        case Term.Second:
            // January to April of the next year
            return { start: new Date(startYear + 1, 0, 1), end: new Date(startYear + 1, 3, 30, 23, 59, 59) };
        case Term.Third:
            // May to July of the next year
            return { start: new Date(startYear + 1, 4, 1), end: new Date(startYear + 1, 6, 31, 23, 59, 59) };
        default:
             // fallback to the whole session year
            return { start: new Date(startYear, 8, 1), end: new Date(startYear + 1, 6, 31, 23, 59, 59) };
    }
}


const Dashboard: React.FC<DashboardProps> = ({ school, platformConfig }) => {
    const { students, otherIncome, expenditures } = school;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartView, setChartView] = useState<'revenue' | 'outstanding'>('revenue');

    const allSessions = useMemo(() => {
        const sessions = new Set<string>(school.students.flatMap(s => s.fees.map(f => f.session)));
        return Array.from(sessions).sort((a,b) => b.localeCompare(a));
    }, [school.students]);

    const [isFiltered, setIsFiltered] = useState(true);
    const [selectedSession, setSelectedSession] = useState(school.currentSession);
    const [selectedTerm, setSelectedTerm] = useState<Term>(school.currentTerm);


    const stats = useMemo(() => {
        const outstandingFees = students.reduce((acc, s) => acc + s.outstandingFees, 0);
        const totalStudents = students.length;

        let totalRecordedIncome = 0;
        let totalExpenditures = 0;
        let totalExpectedIncome = 0;

        if (!isFiltered) {
             const studentPayments = students.reduce((acc, s) => acc + s.amountPaid, 0);
            const otherIncomeTotal = otherIncome?.reduce((acc, i) => acc + i.amount, 0) || 0;
            totalRecordedIncome = studentPayments + otherIncomeTotal;
            totalExpenditures = expenditures?.reduce((acc, e) => acc + e.amount, 0) || 0;
            totalExpectedIncome = students.reduce((acc, s) => acc + s.totalFees, 0);
        } else {
            const termDateRange = getTermDateRange(selectedSession, selectedTerm);

            const studentPaymentsForTerm = students
                .flatMap(s => s.payments)
                .filter(p => {
                    const paymentDate = new Date(p.date);
                    return paymentDate >= termDateRange.start && paymentDate <= termDateRange.end;
                })
                .reduce((sum, p) => sum + p.amount, 0);

            const otherIncomeForTerm = (otherIncome || [])
                .filter(i => {
                    const incomeDate = new Date(i.date);
                    return incomeDate >= termDateRange.start && incomeDate <= termDateRange.end;
                })
                .reduce((sum, i) => sum + i.amount, 0);

            totalRecordedIncome = studentPaymentsForTerm + otherIncomeForTerm;
            
            totalExpenditures = (expenditures || [])
                .filter(e => {
                    const expenditureDate = new Date(e.date);
                    return expenditureDate >= termDateRange.start && expenditureDate <= termDateRange.end;
                })
                .reduce((sum, e) => sum + e.amount, 0);

            totalExpectedIncome = students
                .flatMap(s => s.fees)
                .filter(f => f.session === selectedSession && f.term === selectedTerm)
                .reduce((sum, f) => sum + f.amount, 0);
        }
        
        return {
            totalRecordedIncome,
            totalExpectedIncome,
            totalExpenditures,
            outstandingFees,
            totalStudents,
        };
    }, [students, otherIncome, expenditures, isFiltered, selectedSession, selectedTerm]);
    
    const highRiskStudents = useMemo(() => 
        students.filter(s => s.debtRisk === RiskLevel.High).slice(0, 5),
    [students]);

    const recentPayments = useMemo(() =>
        students.filter(s => s.lastPaymentDate !== null)
            .sort((a, b) => new Date(b.lastPaymentDate!).getTime() - new Date(a.lastPaymentDate!).getTime())
            .slice(0, 5),
    [students]);

    const chartData = useMemo(() => {
        let months: string[] = [];
        const numMonths = 6;
        months = Array.from({ length: numMonths }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (numMonths - 1 - i));
            return d.toLocaleString('default', { month: 'short' });
        });

        const dataKey = chartView === 'revenue' ? 'Revenue' : 'Outstanding Fees';

        return months.map(month => ({
            name: month,
            [dataKey]: Math.floor(Math.random() * 4000000) + 1000000,
        }));
    }, [chartView]);

    const chartKey = chartView === 'revenue' ? 'Revenue' : 'Outstanding Fees';
    const chartColor = chartView === 'revenue' ? platformConfig.websiteContent.theme.primary : '#F97316';

    const openBulkModal = () => setIsModalOpen(true);
    const closeBulkModal = () => setIsModalOpen(false);
    
    const filterPeriodText = isFiltered ? `${selectedTerm}, ${selectedSession}` : 'All Time';

    return (
        <div className="space-y-6">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body flex-row justify-between items-center flex-wrap gap-4 p-4">
                  <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-secondary">Dashboard Filters</h3>
                      <div className="flex items-center space-x-2">
                           <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} disabled={!isFiltered} className="select select-bordered select-sm disabled:bg-base-200/50">
                              {allSessions.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value as Term)} disabled={!isFiltered} className="select select-bordered select-sm disabled:bg-base-200/50">
                              <option value={Term.First}>First Term</option>
                              <option value={Term.Second}>Second Term</option>
                              <option value={Term.Third}>Third Term</option>
                          </select>
                      </div>
                  </div>
                  <div>
                       {isFiltered ? (
                          <button onClick={() => setIsFiltered(false)} className="btn btn-ghost btn-sm text-primary">
                              Show All-Time Stats
                          </button>
                      ) : (
                           <button onClick={() => setIsFiltered(true)} className="btn btn-ghost btn-sm text-primary">
                              Filter by Term
                          </button>
                      )}
                  </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard icon="revenue" title="Expected Income" value={`₦${stats.totalExpectedIncome.toLocaleString()}`} change={filterPeriodText} trend="up" />
                <StatCard icon="revenue" title="Recorded Income" value={`₦${stats.totalRecordedIncome.toLocaleString()}`} change={filterPeriodText} trend="up" />
                <StatCard icon="outstanding" title="Expenditures" value={`₦${stats.totalExpenditures.toLocaleString()}`} change={filterPeriodText} color="red" trend="down"/>
                <StatCard icon="outstanding" title="Outstanding" value={`₦${stats.outstandingFees.toLocaleString()}`} change="Cumulative" color="orange" trend="up" />
                <StatCard icon="students" title="Students" value={stats.totalStudents.toString()} change="Current Enrollment" trend="up"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card bg-base-100 shadow">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                          <h3 className="card-title text-secondary">Financial Overview</h3>
                           <div role="tablist" className="tabs tabs-boxed tabs-sm bg-base-200">
                                <a role="tab" className={`tab ${chartView === 'revenue' ? 'tab-active bg-base-100 !text-primary' : ''}`} onClick={() => setChartView('revenue')}>Revenue</a>
                                <a role="tab" className={`tab ${chartView === 'outstanding' ? 'tab-active bg-base-100 !text-orange-600' : ''}`} onClick={() => setChartView('outstanding')}>Outstanding</a>
                            </div>
                      </div>
                      <div className="h-80">
                          <PaymentHistoryChart data={chartData} dataKey={chartKey} fillColor={chartColor} />
                      </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h3 className="card-title text-secondary">Debt Risk Profile</h3>
                       <div className="h-80">
                          <DebtRiskPieChart students={students} theme={platformConfig.websiteContent.theme} />
                      </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="card-title text-secondary">High-Risk Debtors</h3>
                        <button onClick={openBulkModal} className="btn btn-sm btn-error text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Send Reminders
                        </button>
                    </div>
                    <StudentsTable students={highRiskStudents} />
                </div>
            </div>
            
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-secondary mb-4">Recent Payments</h3>
                  <StudentsTable students={recentPayments} />
                </div>
            </div>

            {isModalOpen && <BulkActionModal school={school} students={highRiskStudents} onClose={closeBulkModal} />}
        </div>
    );
};

export default Dashboard;
