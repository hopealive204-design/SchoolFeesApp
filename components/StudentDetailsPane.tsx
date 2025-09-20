import React, { useState } from 'react';
import { Student, Payment, PaymentAllocation, Discount } from '../types.ts';
import { addPayment, addDiscount, updateStudent } from '../services/dataService.ts';
import RecordPaymentModal from './RecordPaymentModal.tsx';

interface StudentDetailsPaneProps {
  student: Student;
  schoolId: string;
  onClose: () => void;
  refreshData: () => Promise<void>;
}

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
        <div className="bg-white p-4 rounded-xl shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg font-semibold text-secondary">{student.name}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="py-4 flex-grow overflow-y-auto space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Student Information</h4>
                    <p><strong>Class:</strong> {student.class}</p>
                    <p><strong>Admission No:</strong> {student.admissionNumber}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Parent Information</h4>
                    <p><strong>Name:</strong> {student.parentName}</p>
                    <p><strong>Email:</strong> {student.parentEmail}</p>
                    <p><strong>Phone:</strong> {student.parentPhone}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Financial Summary</h4>
                    <div className="p-3 bg-gray-50 rounded-md space-y-2">
                        <div className="flex justify-between"><span>Total Fees:</span> <span className="font-mono font-semibold">₦{student.totalFees.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Amount Paid:</span> <span className="font-mono font-semibold text-green-600">₦{student.amountPaid.toLocaleString()}</span></div>
                         <div className="flex justify-between font-bold text-base text-red-600"><span>Outstanding:</span> <span className="font-mono">₦{student.outstandingFees.toLocaleString()}</span></div>
                    </div>
                </div>
                 <div className="space-x-2">
                    <button onClick={() => setPaymentModalOpen(true)} className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold">Record Payment</button>
                    <button onClick={handleAddDiscount} className="bg-accent/10 text-accent px-3 py-1.5 rounded-md text-xs font-semibold">Add Discount</button>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Fee Breakdown</h4>
                    <ul className="space-y-1 text-xs">
                        {student.fees.map(fee => (
                            <li key={fee.id} className="flex justify-between p-1 bg-gray-50/50 rounded">
                                <span>{fee.type}</span>
                                <span className="font-mono">₦{fee.amount.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
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