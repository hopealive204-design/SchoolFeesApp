
import React, { useState, useMemo } from 'react';
import { School, Student, Payment, RiskLevel, PaymentAllocation } from '../types.ts';
import { addPayment, updateStudent } from '../services/schoolService.ts';
import PaymentCollectionTable from './PaymentCollectionTable.tsx';
import RecordPaymentModal from './RecordPaymentModal.tsx';

interface PaymentCollectionPageProps {
    school: School;
    refreshData: () => Promise<void>;
}

const PaymentCollectionPage: React.FC<PaymentCollectionPageProps> = ({ school, refreshData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [studentForPayment, setStudentForPayment] = useState<Student | null>(null);

    const uniqueClasses = useMemo(() => ['all', ...Array.from(new Set(school.students.map(s => s.class)))], [school.students]);

    const filteredStudents = useMemo(() => {
        return school.students.filter(student => {
            const searchLower = searchTerm.toLowerCase();
            const classMatch = filterClass === 'all' || student.class === filterClass;
            const searchMatch = !searchLower || 
                student.name.toLowerCase().includes(searchLower) ||
                student.parentName.toLowerCase().includes(searchLower) ||
                student.admissionNumber.toLowerCase().includes(searchLower);
            return classMatch && searchMatch;
        });
    }, [school.students, searchTerm, filterClass]);
    
    const handleSavePayment = async (paymentData: { totalAmount: number; date: string; method: Payment['method']; allocations: PaymentAllocation[]; }) => {
        const currentStudent = studentForPayment;
        if (!currentStudent) return;

        const newPayment: Omit<Payment, 'id'|'studentId'> = {
            amount: paymentData.totalAmount,
            date: paymentData.date,
            method: paymentData.method,
            status: 'Completed',
            description: `Manual payment recorded by admin for ${currentStudent.name}`,
            allocations: paymentData.allocations,
        };
        
        try {
            // Call service functions to persist changes
            await addPayment(currentStudent.id, newPayment);
            
            const newTotalPaid = currentStudent.amountPaid + paymentData.totalAmount;
            const newOutstanding = currentStudent.outstandingFees - paymentData.totalAmount;
            await updateStudent(currentStudent.id, { 
                amountPaid: newTotalPaid,
                outstandingFees: newOutstanding,
                lastPaymentDate: new Date(paymentData.date).toISOString()
            });
            
            // Refresh data from the source to update the UI
            await refreshData();
            setStudentForPayment(null);

            // SIMULATE SENDING EMAIL
            const { communicationSettings } = school;
            const { paymentConfirmation } = communicationSettings.transactionalNotifications;
            if (paymentConfirmation.enabled) {
                let subject = (paymentConfirmation.emailSubject || 'Payment Confirmation from {school_name}')
                    .replace('{school_name}', school.name)
                    .replace('{parent_name}', currentStudent.parentName)
                    .replace('{student_name}', currentStudent.name)
                    .replace('{outstanding_amount}', `₦${newOutstanding.toLocaleString()}`);
                
                let body = paymentConfirmation.emailTemplate
                    .replace('{school_name}', school.name)
                    .replace('{parent_name}', currentStudent.parentName)
                    .replace('{student_name}', currentStudent.name)
                    .replace('{outstanding_amount}', `₦${newOutstanding.toLocaleString()}`);
                    
                console.log("SIMULATING PAYMENT CONFIRMATION EMAIL:", {
                    to: currentStudent.parentEmail,
                    subject,
                    body
                });
                
                alert(`Payment recorded. A confirmation email has been sent to ${currentStudent.parentEmail}.`);
            } else {
                alert('Payment recorded successfully.');
            }
        } catch (error) {
            console.error("Failed to save payment:", error);
            alert("Could not save payment. Please try again.");
        }
    };


    return (
        <div className="flex flex-col space-y-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="card-title text-secondary">Record Payments</h3>
                     <p