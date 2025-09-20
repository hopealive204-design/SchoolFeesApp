
import React from 'react';
import { School, Student } from '../../types.ts';

interface TemplateProps {
    student: Student;
    school: School;
    themeColor: string;
    type: 'invoice' | 'receipt';
}

const ModernTemplate: React.FC<TemplateProps> = ({ student, school, themeColor, type }) => {
    const lastPayment = type === 'receipt' && student.payments.length > 0 ? [...student.payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
    const totalDiscounts = student.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;

    if (type === 'receipt' && !lastPayment) {
        return <div className="p-8 text-center text-gray-500">No payment record for {student.name}.</div>;
    }
    const { name: schoolName, logoUrl, contactPhone, paymentSettings } = school;

    const DocumentHeader = () => (
        <header className="flex justify-between items-start p-10" style={{ backgroundColor: themeColor, color: 'white' }}>
            <div>
                {logoUrl ? (
                    <img src={logoUrl} alt={`${school.name} Logo`} className="h-16 w-auto max-w-xs bg-white p-2 rounded-md" />
                ) : (
                    <h1 className="text-3xl font-bold">{schoolName}</h1>
                )}
            </div>
            <div className="text-right">
                <h2 className="text-4xl font-bold uppercase">{type}</h2>
                <p>Date: {new Date(lastPayment?.date || Date.now()).toLocaleDateString()}</p>
                {contactPhone && <p className="text-sm">Tel: {contactPhone}</p>}
            </div>
        </header>
    );

    const StudentInfo = () => (
         <section className="mt-8 px-10 grid grid-cols-2 gap-8">
            <div>
                <h3 className="text-sm text-gray-500 font-semibold uppercase">Billed To</h3>
                <p className="font-bold text-lg">{student.parentName}</p>
                <p>{student.parentEmail}</p>
            </div>
            <div className="text-right">
                <h3 className="text-sm text-gray-500 font-semibold uppercase">Student</h3>
                <p className="font-bold text-lg">{student.name}</p>
                <p>Class: {student.class} / Adm No: {student.admissionNumber}</p>
            </div>
        </section>
    );

    const InvoiceBody = () => (
        <section className="mt-8 px-10">
            <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr>
                        <th className="p-3">Fee Type</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {student.fees.map(fee => (
                         <tr key={fee.id} className="border-b">
                            <td className="p-3 font-semibold">{fee.type}</td>
                            <td className="p-3">{new Date(fee.dueDate).toLocaleDateString()}</td>
                            <td className="p-3 text-right font-mono">₦{fee.amount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-gray-600"><p>Subtotal:</p> <p className="font-mono">₦{student.totalFees.toLocaleString()}</p></div>
                    {totalDiscounts > 0 && <div className="flex justify-between text-green-600"><p>Discounts:</p> <p className="font-mono">- ₦{totalDiscounts.toLocaleString()}</p></div>}
                    <div className="flex justify-between text-gray-600"><p>Paid:</p> <p className="font-mono">₦{student.amountPaid.toLocaleString()}</p></div>
                    <div className="flex justify-between text-black font-bold text-lg p-3 rounded-md" style={{ backgroundColor: `${themeColor}20`}}>
                        <p>Amount Due:</p>
                        <p className="font-mono">₦{student.outstandingFees.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </section>
    );

    const ReceiptBody = () => (
        <section className="mt-12 mb-12 px-10 text-center">
            <p className="text-gray-600">Thank you for your payment!</p>
            <p className="text-5xl font-bold my-4" style={{ color: themeColor }}>₦{lastPayment!.amount.toLocaleString()}</p>
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg text-sm">
                Paid via {lastPayment!.method} on {new Date(lastPayment!.date).toLocaleDateString()}
            </div>
            <div className="mt-8 flex justify-center">
                <div className="w-full max-w-sm border-t pt-4 space-y-1">
                    <div className="flex justify-between text-gray-600"><p>Total Fees:</p> <p className="font-mono">₦{student.totalFees.toLocaleString()}</p></div>
                    <div className="flex justify-between font-semibold"><p>Remaining Balance:</p> <p className="font-mono">₦{student.outstandingFees.toLocaleString()}</p></div>
                </div>
            </div>
        </section>
    );

    const PaymentInfo = () => paymentSettings.bankDetails && (
        <section className="mt-8 px-10 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">Payment Information</h3>
                <p className="mt-1">Please use the student's full name as the payment reference.</p>
                <div className="mt-2">
                    <p><strong>Bank:</strong> {paymentSettings.bankDetails.bankName}</p>
                    <p><strong>Account Name:</strong> {paymentSettings.bankDetails.accountName}</p>
                    <p><strong>Account Number:</strong> {paymentSettings.bankDetails.accountNumber}</p>
                </div>
                 <p className="mt-2 text-xs text-gray-500">You can also make payments online via the parent portal.</p>
            </div>
        </section>
    );

    return (
        <div className="bg-white">
            <DocumentHeader />
            <StudentInfo />
            {type === 'invoice' ? <InvoiceBody /> : <ReceiptBody />}
            {type === 'invoice' && <PaymentInfo />}
            <footer className="mt-12 text-center text-sm text-gray-500 p-10 border-t">
                <p>For any inquiries, please contact the school bursary.</p>
                <p>{schoolName}</p>
            </footer>
        </div>
    );
};

export default ModernTemplate;
