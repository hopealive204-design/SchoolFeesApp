import React, { useState } from 'react';
import { School, BursarySubView, Payment, Income, Expenditure, Transaction, View } from '../types.ts';
import { updateStudent, addIncome, addExpenditure } from '../services/dataService.ts';
import PaymentCollectionPage from './PaymentCollectionPage.tsx';
import InvoicesPage from './InvoicesPage.tsx';
import Reconciliation from './Reconciliation.tsx';
import FeeStructureSettings from './FeeStructureSettings.tsx';
import PayrollPage from './payroll/PayrollPage.tsx';
import TransactionTable from './TransactionTable.tsx';
import TransactionModal from './TransactionModal.tsx';

interface BursaryPageProps {
    school: School;
    refreshData: () => Promise<void>;
    activeSubView: View;
    setActiveSubView: (view: BursarySubView) => void;
}

const SubNavButton: React.FC<{
    label: BursarySubView;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
      active ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const PaymentVerificationPage: React.FC<{ school: School, refreshData: () => Promise<void> }> = ({ school, refreshData }) => {
    const pendingPayments = school.students.flatMap(s => s.payments.filter(p => p.status === 'Pending Verification').map(p => ({ ...p, studentName: s.name, studentOutstanding: s.outstandingFees })));
    
    const handleApprove = async (payment: Payment & { studentName: string, studentOutstanding: number }) => {
        try {
            // This is a simplified logic. A real backend would handle this atomically.
            // 1. Update the payment status (not implemented in dataService placeholder)
            // 2. Update the student's balance
            await updateStudent(payment.studentId, {
                outstandingFees: payment.studentOutstanding - payment.amount,
                amountPaid: (school.students.find(s=>s.id === payment.studentId)?.amountPaid || 0) + payment.amount,
            });
            await refreshData();
            alert(`Payment of ₦${payment.amount.toLocaleString()} for ${payment.studentName} has been approved.`);
        } catch (error) {
            console.error("Failed to approve payment:", error);
            alert("Approval failed. Please try again.");
        }
    };
    
    // handleReject would be similar, updating payment status to 'Rejected'.

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-secondary">Pending Verifications</h3>
            <p className="text-sm text-gray-500 mb-4">Review and approve manual bank transfer payments.</p>
            {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                    {pendingPayments.map(p => (
                        <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{p.studentName}</p>
                                <p className="text-sm">Amount: <span className="font-mono">₦{p.amount.toLocaleString()}</span></p>
                                <p className="text-xs text-gray-500">Date: {new Date(p.date).toLocaleDateString()}</p>
                            </div>
                            <div className="space-x-2">
                                {p.proofOfPaymentUrl && <a href={p.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">View Proof</a>}
                                <button onClick={() => handleApprove(p)} className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-200">Approve</button>
                                <button className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-200">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-center text-gray-500 py-8">No pending payments to verify.</p>}
        </div>
    )
}

const IncomeExpenditurePage: React.FC<{
    school: School,
    refreshData: () => Promise<void>,
    type: 'income' | 'expenditure'
}> = ({ school, refreshData, type }) => {
    const [modalConfig, setModalConfig] = useState<{ type: 'income' | 'expenditure', data?: Transaction } | null>(null);
    const transactions = type === 'income' ? school.otherIncome : school.expenditures;

    const handleSave = async (transaction: Transaction) => {
        try {
            if (type === 'income') {
                await addIncome(school.id, transaction as Income);
            } else {
                await addExpenditure(school.id, transaction as Expenditure);
            }
            await refreshData();
            setModalConfig(null);
        } catch (error) {
            console.error(`Failed to save ${type}:`, error);
            alert(`Could not save ${type}. Please try again.`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(`Are you sure you want to delete this ${type} record?`)) {
            // In a real app, you would call a delete service function.
            console.log(`SIMULATING: Deleting ${type} with id ${id}`);
            alert('Delete functionality is not implemented in this demo.');
        }
    }
    
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-secondary capitalize">{type}</h3>
                    <p className="text-sm text-gray-500">Total Recorded: <span className="font-mono font-semibold">₦{total.toLocaleString()}</span></p>
                </div>
                <button onClick={() => setModalConfig({ type })} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold">Add New {type}</button>
            </div>
            <TransactionTable transactions={transactions} type={type} onEdit={(t) => setModalConfig({ type, data: t })} onDelete={handleDelete} />
            {modalConfig && <TransactionModal schoolId={school.id} config={modalConfig} onClose={() => setModalConfig(null)} onSave={handleSave} />}
        </div>
    );
};


const BursaryPage: React.FC<BursaryPageProps> = ({ school, refreshData, activeSubView, setActiveSubView }) => {
    
    const navItems: BursarySubView[] = ['Student Payments', 'Invoices & Receipts', 'Other Income', 'Expenditures', 'Payroll', 'Reconciliation', 'Fee Structure'];

    const renderContent = () => {
        switch (activeSubView) {
            case 'Student Payments': return <PaymentCollectionPage school={school} refreshData={refreshData} />;
            case 'Invoices & Receipts': return <InvoicesPage school={school} />;
            case 'Other Income': return <IncomeExpenditurePage school={school} refreshData={refreshData} type="income" />;
            case 'Expenditures': return <IncomeExpenditurePage school={school} refreshData={refreshData} type="expenditure" />;
            case 'Payroll': return <PayrollPage school={school} refreshData={refreshData} />;
            case 'Reconciliation': return <Reconciliation school={school} />;
            case 'Fee Structure': return <FeeStructureSettings school={school} refreshData={refreshData} />;
            default:
                // Fallback for when 'Bursary' is the activeView
                if ((navItems as string[]).includes(activeSubView)) {
                    return <PaymentCollectionPage school={school} refreshData={refreshData} />;
                }
                return <div>Select a bursary function.</div>;
        }
    };
    
    const currentView = (navItems as string[]).includes(activeSubView) ? activeSubView as BursarySubView : 'Student Payments';

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-md">
                <nav className="flex space-x-1 overflow-x-auto" aria-label="Bursary Navigation">
                    {navItems.map(item => (
                        <SubNavButton 
                            key={item} 
                            label={item} 
                            active={currentView === item}
                            onClick={() => setActiveSubView(item)}
                        />
                    ))}
                </nav>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <h4 className="font-bold text-yellow-800">Payment Verifications</h4>
                <p className="text-sm text-yellow-700">You have payments pending your approval.</p>
            </div>
            
            <PaymentVerificationPage school={school} refreshData={refreshData} />

            {renderContent()}
        </div>
    );
};

export default BursaryPage;