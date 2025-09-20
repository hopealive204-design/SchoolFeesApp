
import React from 'react';
import { School, Student } from '../../types.ts';

interface TemplateProps {
    student: Student;
    school: School;
    themeColor: string; // Used minimally
    type: 'invoice' | 'receipt';
}

const ClassicTemplate: React.FC<TemplateProps> = ({ student, school, themeColor, type }) => {
    const lastPayment = type === 'receipt' && student.payments.length > 0 ? [...student.payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

    const { name: schoolName, logoUrl, contactPhone, paymentSettings, address } = school;

    if (type === 'receipt' && !lastPayment) {
        return <div className="p-12 text-center text-gray-500 font-serif">No payment record for {student.name}.</div>;
    }

    const DocumentHeader = () => (
        <header className="text-center p-12 border-b-2 border-black">
            {logoUrl && <img src={logoUrl} alt={`${school.name} Logo`} className="h-16 w-auto mx-auto mb-4" />}
            <h1 className="text-4xl font-bold tracking-wider">{schoolName}</h1>
            <p className="text-sm mt-1">{address} | {contactPhone}</p>
        </header>
    );

    const InvoiceBody = () => (
        <>
            <h2 className="text-center text-2xl font-semibold uppercase tracking-widest my-8">Financial Invoice</h2>
            <section className="mt-8 px-12 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-bold">TO:</p>
                    <p>{student.parentName}</p>
                    <p>RE: {student.name} ({student.class})</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">INVOICE NO:</span> INV-{student.id.slice(-5)}</p>
                    <p><span className="font-bold">DATE:</span> {new Date().toLocaleDateString()}</p>
                </div>
            </section>
            <section className="mt-8 px-12">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-y-2 border-black">
                            <th className="p-2 uppercase">Description</th>
                            <th className="p-2 uppercase text-right">Amount (NGN)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {student.fees.map(fee => (
                             <tr key={fee.id} className="border-b">
                                <td className="p-2">{fee.type} Fee (Due: {new Date(fee.dueDate).toLocaleDateString()})</td>
                                <td className="p-2 text-right font-mono">{fee.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold">
                        <tr className="border-b"><td className="p-2 text-right">Total:</td><td className="p-2 text-right font-mono">₦{student.totalFees.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td></tr>
                        <tr className="border-b"><td className="p-2 text-right">Paid:</td><td className="p-2 text-right font-mono">₦{student.amountPaid.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td></tr>
                        <tr className="border-b-2 border-black"><td className="p-2 text-right text-base">Balance Due:</td><td className="p-2 text-right font-mono text-base">₦{student.outstandingFees.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td></tr>
                    </tfoot>
                </table>
            </section>
            <section className="mt-8 px-12 text-xs">
                 {paymentSettings.bankDetails && (
                    <div>
                        <p className="font-bold">PAYMENT DETAILS:</p>
                        <p>Bank: {paymentSettings.bankDetails.bankName}</p>
                        <p>Account: {paymentSettings.bankDetails.accountNumber} ({paymentSettings.bankDetails.accountName})</p>
                         <p className="mt-1">Please use student's full name as reference.</p>
                    </div>
                )}
            </section>
        </>
    );

    const ReceiptBody = () => (
        <>
            <h2 className="text-center text-2xl font-semibold uppercase tracking-widest my-8" style={{ color: themeColor }}>Payment Receipt</h2>
            <section className="mt-8 px-12 text-sm space-y-2">
                <p><span className="font-bold w-32 inline-block">RECEIVED FROM:</span> {student.parentName}</p>
                <p><span className="font-bold w-32 inline-block">AMOUNT:</span> <span className="font-mono">₦{lastPayment!.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></p>
                <p><span className="font-bold w-32 inline-block">FOR:</span> {student.name} ({student.class})</p>
                <p><span className="font-bold w-32 inline-block">PAYMENT DATE:</span> {new Date(lastPayment!.date).toLocaleDateString()}</p>
                <p><span className="font-bold w-32 inline-block">PAYMENT METHOD:</span> {lastPayment!.method}</p>
            </section>
            <section className="mt-12 px-12 text-center">
                 <div className="inline-block border-t border-black pt-1 px-8 text-sm">
                    Authorized Signature
                </div>
            </section>
        </>
    );

    return (
        <div className="bg-white font-serif">
            <DocumentHeader />
            {type === 'invoice' ? <InvoiceBody /> : <ReceiptBody />}
            <footer className="mt-12 text-center text-xs text-gray-600 p-12">
                <p>This is an official document from the office of the Bursar, {schoolName}.</p>
            </footer>
        </div>
    );
};

export default ClassicTemplate;
