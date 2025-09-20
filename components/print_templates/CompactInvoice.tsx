import React from 'react';
import { School, Student } from '../../types.ts';

interface CompactInvoiceProps {
    student: Student;
    school: School;
    themeColor: string;
}

const CompactInvoice: React.FC<CompactInvoiceProps> = ({ student, school, themeColor }) => {
    const totalDiscounts = student.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;
    
    return (
        <div className="border border-gray-400 p-2 h-full flex flex-col text-[10px] leading-tight">
            <div className="flex justify-between items-center pb-1 mb-1 border-b" style={{ borderColor: themeColor }}>
                <div className="flex items-center space-x-1">
                    {school.logoUrl && <img src={school.logoUrl} alt="logo" className="h-5 w-5 rounded-full" />}
                    <h3 className="font-bold text-xs" style={{ color: themeColor }}>{school.name}</h3>
                </div>
                <h4 className="font-semibold text-[10px] text-gray-600">INVOICE</h4>
            </div>
            <div className="flex-grow space-y-1">
                <p><strong>To:</strong> {student.parentName}</p>
                <p><strong>Student:</strong> {student.name} ({student.class})</p>
                <table className="w-full my-1 text-[9px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-0.5 text-left font-semibold">Item</th>
                            <th className="p-0.5 text-right font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {student.fees.slice(0, 4).map(fee => (
                            <tr key={fee.id}>
                                <td className="py-0.5 pr-1">{fee.type}</td>
                                <td className="py-0.5 text-right font-mono">₦{fee.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        {student.fees.length > 4 && (
                             <tr>
                                <td className="py-0.5 pr-1"><i>...and more</i></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-gray-300 pt-1 mt-auto text-[9px]">
                <div className="flex justify-between"><p>Total Fees:</p> <p className="font-mono">₦{student.totalFees.toLocaleString()}</p></div>
                {totalDiscounts > 0 && <div className="flex justify-between text-green-600"><p>Discounts:</p> <p className="font-mono">- ₦{totalDiscounts.toLocaleString()}</p></div>}
                <div className="flex justify-between"><p>Paid:</p> <p className="font-mono">₦{student.amountPaid.toLocaleString()}</p></div>
                <div className="flex justify-between font-bold text-xs mt-1 p-1 rounded" style={{ backgroundColor: `${themeColor}20` }}>
                    <p>Balance Due:</p>
                    <p className="font-mono">₦{student.outstandingFees.toLocaleString()}</p>
                </div>
                {school.paymentSettings.bankDetails && (
                    <div className="mt-1 pt-1 border-t text-[8px]">
                        <strong>Bank Details:</strong> {school.paymentSettings.bankDetails.bankName} - {school.paymentSettings.bankDetails.accountNumber} ({school.paymentSettings.bankDetails.accountName})
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompactInvoice;