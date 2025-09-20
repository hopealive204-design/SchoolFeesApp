import React, { useState, useMemo } from 'react';
import { School, CurrentUser, Student, Payment, Fee, Term, PaymentAllocation } from '../types.ts';
import ParentPaymentModal from './ParentPaymentModal.tsx';
import InstallmentPlanModal from './InstallmentPlanModal.tsx';

interface ParentDashboardProps {
  school: School;
  currentUser: Extract<CurrentUser, { role: 'parent' }>;
  onLogout: () => void;
  refreshData: () => Promise<void>;
}

const StatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const colorClasses = {
        'Completed': "bg-green-100 text-green-800",
        'Pending Verification': "bg-yellow-100 text-yellow-800 animate-pulse",
        'Failed': "bg-red-100 text-red-800",
        'Rejected': "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>;
};

const ParentDashboard: React.FC<ParentDashboardProps> = ({ school, currentUser, onLogout, refreshData }) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isInstallmentModalOpen, setInstallmentModalOpen] = useState(false);

    // No longer need local state for school data, as we will use refreshData to get updates.
    const activeSchool = school; 

    const myChildren = useMemo(() => {
        return activeSchool.students.filter(s => currentUser.childrenIds.includes(s.id));
    }, [activeSchool.students, currentUser.childrenIds]);

    const totalOutstanding = useMemo(() => {
        return myChildren.reduce((sum, child) => sum + child.outstandingFees, 0);
    }, [myChildren]);
    
    const handlePaymentSubmit = async (paymentData: Omit<Payment, 'id' | 'date'> & { date: Date }) => {
        // In a real app, you would make an API call here to submit the payment.
        // For this demo, we'll just show an alert and refresh the data.
        
        if (paymentData.status === 'Completed') {
            alert(`SIMULATION: Online payment of ₦${paymentData.amount.toLocaleString()} via ${paymentData.method} was successful.`);
        } else if (paymentData.status === 'Pending Verification') {
            alert(`Your manual payment of ₦${paymentData.amount.toLocaleString()} has been submitted for verification. You will be notified upon approval.`);
        }

        // After the simulated API call, refresh the data to get the latest state from the "backend".
        await refreshData();
        setPaymentModalOpen(false);
    };

    const handleSetupInstallments = (installments: any) => {
         alert(`SIMULATION: Installment plan has been requested with ${installments.length} payments.`);
         setInstallmentModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-base-100">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        {activeSchool.logoUrl ? <img src={activeSchool.logoUrl} alt={activeSchool.name} className="h-10 w-auto" /> : <div className="h-10 w-10 bg-gray-200 rounded-full"></div>}
                        <div>
                            <h1 className="text-xl font-bold text-secondary">{activeSchool.name}</h1>
                            <p className="text-sm text-gray-500">Parent Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                           <p className="font-semibold text-sm text-secondary">{currentUser.name}</p>
                           <p className="text-xs text-gray-500">{currentUser.email}</p>
                        </div>
                        <button onClick={onLogout} className="text-sm font-medium text-primary hover:underline">Logout</button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6 space-y-8">
                <div className="bg-primary/90 text-white p-8 rounded-2xl shadow-lg flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <p className="text-lg opacity-80">Total Outstanding Balance</p>
                        <p className="text-5xl font-extrabold">₦{totalOutstanding.toLocaleString()}</p>
                        <p className="text-sm opacity-80 mt-1">Across {myChildren.length} child(ren)</p>
                    </div>
                    <div className="space-x-3 flex-shrink-0">
                         <button 
                            onClick={() => setInstallmentModalOpen(true)} 
                            disabled={totalOutstanding <= 0}
                            className="bg-white/20 text-white px-5 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:bg-white/10 disabled:cursor-not-allowed disabled:text-white/50"
                         >
                            Request Installment Plan
                        </button>
                        <button onClick={() => setPaymentModalOpen(true)} disabled={totalOutstanding <= 0} className="bg-white text-primary px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                            Make a Payment
                        </button>
                    </div>
                </div>
                
                {myChildren.map(child => {
                    const totalDiscounts = child.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;
                    return (
                        <div key={child.id} className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-semibold text-secondary mb-4">{child.name} - {child.class}</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-3">
                                    <h3 className="font-semibold mb-2">Fee Breakdown ({activeSchool.currentTerm})</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="p-3">Item</th><th className="p-3 text-right">Amount</th></tr></thead>
                                            <tbody>
                                                {child.fees.map(fee => (
                                                    <tr key={fee.id} className="border-b"><td className="p-3">{fee.type}</td><td className="p-3 text-right font-mono">₦{fee.amount.toLocaleString()}</td></tr>
                                                ))}
                                                <tr className="font-semibold bg-gray-50 border-b"><td className="p-3">Total Fees</td><td className="p-3 text-right font-mono">₦{child.totalFees.toLocaleString()}</td></tr>
                                                {totalDiscounts > 0 && <tr className="border-b"><td className="p-3 text-green-600">Discounts & Scholarships</td><td className="p-3 text-right font-mono text-green-600">- ₦{totalDiscounts.toLocaleString()}</td></tr>}
                                                <tr className="border-b"><td className="p-3">Amount Paid</td><td className="p-3 text-right font-mono">- ₦{child.amountPaid.toLocaleString()}</td></tr>
                                                <tr className="font-bold text-base bg-gray-100"><td className="p-3">Outstanding Balance</td><td className="p-3 text-right font-mono">₦{child.outstandingFees.toLocaleString()}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <h3 className="font-semibold mb-2">Transaction History</h3>
                                    <div className="space-y-2 border rounded-lg p-2 max-h-80 overflow-y-auto">
                                        {[...child.payments].reverse().map(p => (
                                            <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                                <div>
                                                    <p className="font-medium text-gray-800">₦{p.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{p.description}</p>
                                                     <p className="text-xs text-gray-500">Method: {p.method} | {new Date(p.date).toLocaleDateString()}</p>
                                                </div>
                                                <StatusBadge status={p.status} />
                                            </div>
                                        ))}
                                        {child.payments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No transactions yet.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {isPaymentModalOpen && (
                <ParentPaymentModal 
                    school={activeSchool}
                    myChildren={myChildren}
                    onClose={() => setPaymentModalOpen(false)}
                    onSubmitPayment={handlePaymentSubmit}
                />
            )}
            
             {isInstallmentModalOpen && totalOutstanding > 0 && (
                <InstallmentPlanModal
                    totalAmount={totalOutstanding}
                    onClose={() => setInstallmentModalOpen(false)}
                    onSave={handleSetupInstallments}
                />
            )}
        </div>
    );
};

export default ParentDashboard;