
import React, { useState } from 'react';
import { Student, Payment, PaymentAllocation, Discount } from '../types.ts';
import { addPayment, addDiscount, updateStudent } from '../services/schoolService.ts';
import RecordPaymentModal from './RecordPaymentModal.tsx';

interface StudentDetailsPaneProps {
  student: Student;
  schoolId: string;
  onClose: () => void;
  refreshData: () => Promise<void>;
}

const DetailItem: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <p className="text-sm text-base-content/70">{label}</p>
        <p className="text-sm font-semibold text-secondary text-right">{value}</p>
    </div>
);


const StudentDetailsPane: React.FC<StudentDetailsPaneProps> = ({ student, schoolId, onClose, refreshData }) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    const handleSavePayment = async (paymentData: { totalAmount: number; date: string; method: Payment['method']; allocations: PaymentAllocation[]; }) => {
        const newPayment: Omit<Payment, 'id' | 'studentId'> = {
            amount: paymentData.totalAmount,
            date: paymentData.date,
            method: paymentData.method,
            status: 'Completed',
            description: `Manual payment recorded for ${student.name}`,
            allocations: paymentData.allocations,
        };
        try {
            await addPayment(student.id, newPayment);
            // In a real app with a proper backend, adding a payment would trigger an update to the student's balance.
            // For this simulation, we'll manually trigger a student update.
            const newTotalPaid = student.amountPaid + paymentData.totalAmount;
            const newOutstanding = student.outstandingFees - paymentData.totalAmount;
            await updateStudent(student.id, { 
                amountPaid: newTotalPaid,
                outstandingFees: newOutstanding,
                lastPaymentDate: new Date(paymentData.date).toISOString()
            });

            await refreshData();
            setPaymentModalOpen(false);
        } catch (error) {
            console.error("Failed to save payment:", error);
            alert("Could not record payment. Please try again.");
        }
    };
    
    const handleAddDiscount = async () => {
        const description = prompt("Enter discount description (e.g., Scholarship):");
        const amountStr = prompt("Enter discount amount (NGN):");
        const amount = Number(amountStr);

        if (description && !isNaN(amount) && amount > 0) {
            const newDiscount: Omit<Discount, 'id'> = { description, amount };
            try {
                await addDiscount(student.id, newDiscount);
                 await updateStudent(student.id, { 
                    outstandingFees: student.outstandingFees - amount,
                });
                await refreshData();
            } catch (error) {
                 console.error("Failed to add discount:", error);
                 alert("Could not add discount. Please try again.");
            }
        }
    };

    return (
        <div className="card bg-base-100 shadow h-full">
            <div className="card-body p-0">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="card-title text-secondary">{student.name}</h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-600 mb-2">Student Information</h4>
                        <DetailItem label="Class" value={student.class} />
                        <DetailItem label="Admission No" value={student.admissionNumber} />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-gray-600 mb-2">Parent Information</h4>
                        <DetailItem label="Name" value={student.parentName} />
                        <DetailItem label="Email" value={student.parentEmail} />
                        <DetailItem label="Phone" value={student.parentPhone} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-600 mb-2">Financial Summary</h4>
                        <div className="p-3 bg-base-200 rounded-lg space-y-2">
                            <DetailItem label="Total Fees" value={<span className="font-mono">₦{student.totalFees.toLocaleString()}</span>} />
                            <DetailItem label="Amount Paid" value={<span className="font-mono text-success">₦{student.amountPaid.toLocaleString()}</span>} />
                            <div className="divider my-1"></div>
                            <DetailItem label="Outstanding" value={<span className="font-mono font-bold text-lg text-error">₦{student.outstandingFees.toLocaleString()}</span>} />
                        </div>
                    </div>
                    
                     <div>
                        <h4 className="font-semibold text-gray-600 mb-2">Fee Breakdown</h4>
                        <ul className="space-y-1 text-sm">
                            {student.fees.map(fee => (
                                <li key={fee.id} className="flex justify-between p-2 bg-base-200/50 rounded">
                                    <span>{fee.type}</span>
                                    <span className="font-mono">₦{fee.amount.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                 <div className="card-actions p-4 border-t bg-base-200/50 justify-end">
                    <button onClick={handleAddDiscount} className="btn btn-sm btn-ghost text-accent">Add Discount</button>
                    <button onClick={() => setPaymentModalOpen(true)} className="btn btn-sm btn-primary">Record Payment</button>
                </div>
            </div>
             {isPaymentModalOpen && (
                <RecordPaymentModal 
                    student={student} 
                    onClose={() => setPaymentModalOpen(false)}
                    onSave={handleSavePayment}
                />
            )}
        </div>
    );
};

export default StudentDetailsPane;
