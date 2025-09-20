

import React from 'react';
// Fix: Add .ts extension to import path.
import { School, Student } from '../../types.ts';

interface TemplateProps {
    student: Student;
    school: School;
    themeColor: string; // Not used, for prop consistency
    type: 'invoice' | 'receipt';
}

const MinimalistTemplate: React.FC<TemplateProps> = ({ student, school, type }) => {
    const lastPayment = type === 'receipt' && student.payments.length > 0 ? [...student.payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

    const { name: schoolName, contactPhone, paymentSettings } = school;

    if (type === 'receipt' && !lastPayment) {
        return <div className="p-16 text-center text-gray-400 text-sm">No payment record found for {student.name}.</div>;
    }

    return (
        <div className="p-16 bg-white text-gray-800">
            <header className="grid grid-cols-2">
                <div>
                    <h1 className="text-xl font-semibold">{schoolName}</h1>
                    {contactPhone && <p className="text-xs text-gray-500">{contactPhone}</p>}
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-light text-gray-400 uppercase tracking-widest">{type}</h2>
                </div>
            </header>
            
            <div className="h-px bg-gray-200 my-12"></div>

            <section className="grid grid-cols-3 gap-8 text-sm">
                <div>
                    <p className="text-gray-500">Billed To</p>
                    <p className="font-medium">{student.parentName}</p>
                </div>
                <div>
                    <p className="text-gray-500">Student</p>
                    <p className="font-medium">{student.name} / {student.class}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500">Date Issued</p>
                    <p className="font-medium">{new Date(lastPayment?.date || Date.now()).toLocaleDateString()}</p>
                </div>
            </section>

             {type === 'invoice' && (
                <section className="mt-12">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="py-3 font-normal">Description</th>
                                <th className="py-3 font-normal text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.fees.map(fee => (
                                 <tr key={fee.id} className="border-b border-gray-100">
                                    <td className="py-4">{fee.type}</td>
                                    <td className="py-4 text-right font-mono">₦{fee.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="mt-8 ml-auto w-full max-w-xs space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500"><p>Total:</p> <p className="font-mono">₦{student.totalFees.toLocaleString()}</p></div>
                        <div className="flex justify-between text-gray-500"><p>Paid:</p> <p className="font-mono">₦{student.amountPaid.toLocaleString()}</p></div>
                        <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3 mt-3"><p>Balance:</p> <p className="font-mono">₦{student.outstandingFees.toLocaleString()}</p></div>
                    </div>
                    {paymentSettings.bankDetails && (
                        <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-600">
                             <p className="font-semibold">Payment Details</p>
                             <p>Bank: {paymentSettings.bankDetails.bankName}</p>
                             <p>Account: {paymentSettings.bankDetails.accountNumber} ({paymentSettings.bankDetails.accountName})</p>
                             <p className="mt-1 italic">Reference: Student's Full Name</p>
                        </div>
                    )}
                </section>
             )}

             {type === 'receipt' && lastPayment && (
                <section className="mt-12">
                    <p className="text-gray-500">A payment of</p>
                    <p className="text-5xl font-light my-2">₦{lastPayment.amount.toLocaleString()}</p>
                    <p className="text-gray-500">was successfully processed via {lastPayment.method}.</p>
                     <div className="mt-12 ml-auto w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between font-medium"><p>Remaining Balance:</p> <p className="font-mono">₦{student.outstandingFees.toLocaleString()}</p></div>
                    </div>
                </section>
             )}
            
            <footer className="mt-24 text-center text-xs text-gray-400">
                <p>Thank you for your partnership in education.</p>
            </footer>
        </div>
    );
};

export default MinimalistTemplate;