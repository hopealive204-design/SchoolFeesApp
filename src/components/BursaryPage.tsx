
import React, { useState } from 'react';
import { School, BursarySubView, Payment, Income, Expenditure, Transaction, View } from '../types.ts';
import { updateStudent, addIncome, addExpenditure } from '../services/schoolService.ts';
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
    setActiveView: (view: View) => void;
}

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
        <div className="alert alert-warning">
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h3 className="font-bold">{pendingPayments.length} Pending Payment{pendingPayments.length === 1 ? '' : 's'}</h3>
              <div className="text-xs">Review and approve manual bank transfer payments.</div>
            </div>
            {pendingPayments.length > 0 && <button className="btn btn-sm">See Details</button>}
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
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="card-title text-secondary capitalize">{type}</h3>
                    <p className="text-sm text-base-content/70">Total Recorded: <span className="font-mono font-semibold">₦{total.toLocaleString()}</span></p>
                </div>
                <button onClick={() => setModalConfig({ type })} className="btn btn-primary btn-sm">Add New {type}</button>
            </div>
            <TransactionTable transactions={transactions} type={type} onEdit={(t) => setModalConfig({ type, data: t })} onDelete={handleDelete} />
          </div>
          {modalConfig && <TransactionModal schoolId={school.id} config={modalConfig} onClose={() => setModalConfig(null)} onSave={handleSave} />}
        </div>
    );
};


const BursaryPage: React.FC<BursaryPageProps> = ({ school, refreshData, activeSubView, setActiveView }) => {
    
    const navItems: BursarySubView[] = ['Student Payments', 'Invoices & Receipts', 'Other Income', 'Expenditures', 'Payroll', 'Reconciliation', 'Fee Structure'];
    
    const pendingPaymentsCount = school.students.flatMap(s => s.payments.filter(p => p.status === 'Pending Verification')).length;

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
            <div role="tablist" className="tabs tabs-boxed bg-base-100 shadow-sm p-2">
                 {navItems.map(item => (
                    <a 
                      key={item} 
                      role="tab" 
                      className={`tab ${currentView === item ? 'tab-active' : ''}`}
                      onClick={() => setActiveView(item)}
                    >
                        {item}
                    </a>
                 ))}
            </div>
            
            {pendingPaymentsCount > 0 && <PaymentVerificationPage school={school} refreshData={refreshData} /> }
            
            <div>
              {renderContent()}
            </div>
        </div>
    );
};

export default BursaryPage;
